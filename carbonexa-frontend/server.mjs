import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const distDirectory = resolve(projectDirectory, "dist");
const defaultModel = "gemini-3.8-flash";
const maxBodyBytes = 64_000;
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 20;
const rateBuckets = new Map();

function loadLocalEnvironment() {
  const envPath = join(projectDirectory, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const equalsAt = trimmedLine.indexOf("=");
    if (equalsAt < 1) continue;

    const name = trimmedLine.slice(0, equalsAt).trim();
    const value = trimmedLine.slice(equalsAt + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

loadLocalEnvironment();

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJsonRequest(request) {
  const chunks = [];
  let bytesRead = 0;

  for await (const chunk of request) {
    bytesRead += chunk.length;
    if (bytesRead > maxBodyBytes) {
      const error = new Error("The chat request is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("The chat request must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function isRateLimited(request) {
  const address = request.socket.remoteAddress || "unknown";
  const now = Date.now();
  let bucket = rateBuckets.get(address);

  if (!bucket || now - bucket.startedAt >= rateLimitWindowMs) {
    bucket = { startedAt: now, count: 0 };
    rateBuckets.set(address, bucket);
  }

  bucket.count += 1;
  if (rateBuckets.size > 1_000) {
    for (const [key, value] of rateBuckets) {
      if (now - value.startedAt >= rateLimitWindowMs) rateBuckets.delete(key);
    }
  }

  return bucket.count > rateLimitMaxRequests;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const turns = history
    .filter((turn) => (
      turn
      && (turn.role === "user" || turn.role === "model")
      && typeof turn.text === "string"
      && turn.text.trim()
    ))
    .slice(-12)
    .map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text.trim().slice(0, 4_000) }],
    }));

  return turns.reduce((normalized, turn) => {
    const previous = normalized[normalized.length - 1];
    if (previous?.role === turn.role) {
      previous.parts[0].text += `\n${turn.parts[0].text}`;
    } else {
      normalized.push(turn);
    }
    return normalized;
  }, []);
}

function mimeTypeFor(pathname) {
  return ({
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  })[extname(pathname).toLowerCase()] || "application/octet-stream";
}

function serveStatic(pathname, response) {
  const indexPath = join(distDirectory, "index.html");
  if (!existsSync(indexPath)) {
    sendJson(response, 404, { error: "The frontend build was not found. Run npm run build first." });
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: "Invalid URL path." });
    return;
  }

  const requestedPath = resolve(distDirectory, `.${decodedPath === "/" ? "/index.html" : decodedPath}`);
  if (!requestedPath.startsWith(`${distDirectory}${sep}`)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  const filePath = existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : extname(decodedPath)
      ? null
      : indexPath;

  if (!filePath) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  response.writeHead(200, {
    "content-type": mimeTypeFor(filePath),
    "cache-control": filePath === indexPath ? "no-cache" : "public, max-age=3600",
  });
  createReadStream(filePath).pipe(response);
}

async function handleGeminiChat(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Use POST to send a chat message." });
    return;
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { error: "Too many chat requests. Please wait a minute and try again." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    sendJson(response, 503, {
      error: "Gemini is not configured yet. Add GEMINI_API_KEY to carbonexa-frontend/.env.local and restart the server.",
    });
    return;
  }

  let requestBody;
  try {
    requestBody = await readJsonRequest(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message });
    return;
  }

  const message = typeof requestBody.message === "string" ? requestBody.message.trim() : "";
  if (!message) {
    sendJson(response, 400, { error: "Write a message before sending." });
    return;
  }
  if (message.length > 4_000) {
    sendJson(response, 413, { error: "Keep each message under 4,000 characters." });
    return;
  }

  const model = process.env.GEMINI_MODEL?.trim() || defaultModel;
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    sendJson(response, 500, { error: "The configured Gemini model name is invalid." });
    return;
  }

  const contents = normalizeHistory(requestBody.history);
  contents.push({ role: "user", parts: [{ text: message }] });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    let upstream;
    let payload;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are Carbonexa AI, an assistant for mining field work, geology, production, reports, and environmental monitoring. Give clear, practical answers. Do not claim access to Carbonexa's live mine data, sensors, reports, or saved documents unless the user provided that information in the chat. Never invent site readings, production numbers, or document contents. For safety-critical field operations, encourage verification against the site's approved procedures and responsible supervisor.",
              }],
            },
            contents,
            generationConfig: {
              maxOutputTokens: 1_200,
              thinkingConfig: {
                thinkingLevel: "low",
              },
            },
          }),
          signal: controller.signal,
        }
      );
      payload = await upstream.json().catch(() => ({}));
      if (upstream.status !== 503 || attempt === 1) break;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 750));
    }

    if (!upstream.ok) {
      const providerMessage = typeof payload.error?.message === "string"
        ? payload.error.message.replaceAll(apiKey, "[redacted]").slice(0, 500)
        : "No error details were returned.";
      console.error(
        `Gemini API returned HTTP ${upstream.status} (${payload.error?.status || "unknown status"}): ${providerMessage}`
      );
      const errorMessage = upstream.status === 429
        ? "Gemini is busy or the project has reached its request limit. Try again shortly."
        : upstream.status === 503
          ? "Gemini is temporarily unavailable due to high demand. Please try again in a moment."
        : upstream.status === 401 || upstream.status === 403
          ? "Gemini rejected the key or project access. Use a Gemini API key from Google AI Studio and enable the Generative Language API."
          : upstream.status === 400
            ? `Gemini rejected the request: ${providerMessage}`
            : upstream.status === 404
              ? `Gemini model “${model}” was not found. Check GEMINI_MODEL in .env.local.`
              : "Gemini could not complete the response. Check the Carbonexa terminal for Google's error details.";
      const responseStatus = upstream.status === 429
        ? 429
        : upstream.status === 503
          ? 503
        : upstream.status >= 400 && upstream.status < 500
          ? upstream.status
          : 502;
      sendJson(response, responseStatus, { error: errorMessage });
      return;
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      sendJson(response, 502, { error: "Gemini returned an empty response. Please try rephrasing." });
      return;
    }

    sendJson(response, 200, { text });
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Gemini request timed out after 45 seconds.");
      sendJson(response, 504, { error: "Gemini took too long to respond. Please try again." });
      return;
    }
    const causeCode = error.cause?.code || error.code || error.name;
    console.error(
      "Gemini request failed before a response was received:",
      causeCode,
      error.cause?.message || error.message
    );
    sendJson(response, 503, {
      error: `The Carbonexa server could not reach Gemini (${causeCode}). Check your internet connection and the Gemini API status, then retry.`,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleApiRequest(request, response) {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;

  if (pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()) });
    return;
  }

  if (pathname === "/api/chat") {
    await handleGeminiChat(request, response);
    return;
  }

  sendJson(response, 404, { error: "API route not found." });
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;

  if (pathname.startsWith("/api/")) {
    await handleApiRequest(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  serveStatic(pathname, response);
});

const port = Number(process.env.PORT || 3001);
const isDirectExecution = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  server.listen(port, process.env.HOST || "127.0.0.1", () => {
    console.log(`Carbonexa API server listening on port ${port}.`);
  });
}
