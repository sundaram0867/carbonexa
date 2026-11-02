const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, '');
export const dataMode = import.meta.env.VITE_DATA_MODE?.trim().toLowerCase() === 'php'
  ? 'php'
  : 'mock';

export const endpointPaths = {
  projects: '/projects',
  geology: (projectId) => `/projects/${encodeURIComponent(projectId)}/geology`,
  gis: (projectId) => `/projects/${encodeURIComponent(projectId)}/gis`,
  documents: (projectId) => `/projects/${encodeURIComponent(projectId)}/documents`,
  production: (projectId) => `/projects/${encodeURIComponent(projectId)}/production`,
  finance: (projectId) => `/projects/${encodeURIComponent(projectId)}/finance`,
  environmental: (projectId) => `/projects/${encodeURIComponent(projectId)}/environmental`,
  safety: (projectId) => `/projects/${encodeURIComponent(projectId)}/safety`,
  tasks: (projectId) => `/projects/${encodeURIComponent(projectId)}/tasks`,
  milestones: (projectId) => `/projects/${encodeURIComponent(projectId)}/milestones`,
  team: (projectId) => `/projects/${encodeURIComponent(projectId)}/team`,
};

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function requestJson(path, options = {}) {
  const { signal, ...requestOptions } = options;
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...requestOptions,
      signal,
      headers: {
        Accept: 'application/json',
        ...(requestOptions.body && !(typeof FormData !== 'undefined' && requestOptions.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...requestOptions.headers,
      },
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Could not connect to the Carbonexa API. Check the connection and try again.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      typeof payload?.error === 'string' ? payload.error : `The API request failed (${response.status}).`,
      response.status,
      payload
    );
  }

  return payload;
}
