export const projectImportColumns = [
  ['projectId', 'Project ID'],
  ['name', 'Project Name'],
  ['projectType', 'Project Type'],
  ['mineType', 'Mine Type'],
  ['commodity', 'Commodity'],
  ['coalfield', 'Coalfield / Mineral Belt'],
  ['miningBlock', 'Mining Block'],
  ['site', 'Mine Location'],
  ['latitude', 'Latitude'],
  ['longitude', 'Longitude'],
  ['leaseAreaHa', 'Lease Area (ha)'],
  ['geologicalReservesMt', 'Geological Reserves (MT)'],
  ['miningMethod', 'Mining Method'],
  ['operator', 'Operating Company'],
  ['projectManager', 'Project Manager'],
  ['status', 'Project Status'],
  ['productionTarget', 'Annual Target (MT)'],
  ['estimatedCost', 'Estimated Cost'],
  ['startDate', 'Start Date'],
  ['expectedCompletionDate', 'Expected Completion Date'],
  ['description', 'Project Description'],
];

const maxExpandedWorksheetBytes = 50 * 1024 * 1024;

export function toProjectCsv(projects) {
  const escapeValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    projectImportColumns.map(([, title]) => title),
    ...projects.map((project) => projectImportColumns.map(([key]) => project[key] ?? '')),
  ];
  return rows.map((row) => row.map(escapeValue).join(',')).join('\r\n');
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (insideQuotes && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (insideQuotes) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('The file must contain a header row and at least one project.');

  const headerKeys = new Map(projectImportColumns.map(([key, title]) => [
    title.trim().toLowerCase(),
    key,
  ]));
  projectImportColumns.forEach(([key]) => headerKeys.set(key.toLowerCase(), key));
  const headers = rows[0].map((header) => headerKeys.get(header.trim().toLowerCase()));
  if (!headers.includes('name')) throw new Error('The file must include a Project Name column.');

  return rows.slice(1).map((values) => {
    const project = {};
    headers.forEach((key, index) => {
      if (key) project[key] = (values[index] || '').trim();
    });
    return project;
  });
}

async function readZipEntry(bytes, entry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const localHeader = entry.localHeaderOffset;
  if (localHeader < 0 || localHeader + 30 > bytes.byteLength || view.getUint32(localHeader, true) !== 0x04034b50) {
    throw new Error('The Excel workbook contains an invalid worksheet entry.');
  }
  const nameLength = view.getUint16(localHeader + 26, true);
  const extraLength = view.getUint16(localHeader + 28, true);
  const start = localHeader + 30 + nameLength + extraLength;
  if (start + entry.compressedSize > bytes.byteLength) {
    throw new Error('The Excel workbook contains a truncated worksheet entry.');
  }
  const compressed = bytes.slice(start, start + entry.compressedSize);
  if (entry.compression === 0) return compressed;
  if (entry.compression !== 8 || typeof DecompressionStream === 'undefined') {
    throw new Error('This browser cannot decompress this Excel workbook. Save it as CSV and import again.');
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = stream.getReader();
  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxExpandedWorksheetBytes) {
      await reader.cancel();
      throw new Error('The Excel worksheet expands beyond the 50 MB import limit. Save it as CSV and import again.');
    }
    chunks.push(value);
  }
  const result = new Uint8Array(totalBytes);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return result;
}

function extractZipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endOffset = -1;
  const minimumOffset = Math.max(0, bytes.byteLength - 65557);
  for (let offset = bytes.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('The selected file is not a valid .xlsx workbook.');

  const entryCount = view.getUint16(endOffset + 10, true);
  let offset = view.getUint32(endOffset + 16, true);
  const entries = new Map();
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    entries.set(name, { compression, compressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function parseWorksheet(xmlText, sharedStrings, previewOnly = false) {
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The Excel worksheet XML is invalid.');
  const rows = Array.from(document.getElementsByTagName('row')).slice(0, 10001);
  if (rows.length > 10000) throw new Error('Import up to 10,000 project rows at a time.');

  const cellColumn = (reference) => {
    const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || '';
    return Array.from(letters).reduce((number, letter) => number * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  };
  const matrix = rows.map((rowElement) => {
    const values = [];
    Array.from(rowElement.getElementsByTagName('c')).forEach((cellElement) => {
      const value = cellElement.getElementsByTagName('v')[0]?.textContent || '';
      const column = cellColumn(cellElement.getAttribute('r') || '');
      const type = cellElement.getAttribute('t');
      values[column] = type === 's' ? (sharedStrings[Number(value)] || '') : value;
      if (type === 'inlineStr') {
        values[column] = Array.from(cellElement.getElementsByTagName('t'))
          .map((textNode) => textNode.textContent || '')
          .join('');
      }
    });
    return values;
  }).filter((values) => values.some((value) => String(value || '').trim()));

  if (previewOnly) return matrix.slice(0, 201).map((row) => row.slice(0, 20));
  if (matrix.length < 2) throw new Error('The first worksheet must contain a header row and at least one project.');
  const dateColumns = new Set(matrix[0].map((header, index) => (
    ['start date', 'expected completion date'].includes(String(header || '').trim().toLowerCase()) ? index : -1
  )).filter((index) => index >= 0));
  matrix.slice(1).forEach((row) => {
    dateColumns.forEach((column) => {
      const serial = Number(row[column]);
      if (row[column] && Number.isFinite(serial) && serial >= 1 && serial <= 2958465) {
        row[column] = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000).toISOString().slice(0, 10);
      }
    });
  });
  return parseCsv(matrix.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'));
}

async function readXlsxWorksheet(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Import Excel files up to 10 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = extractZipEntries(bytes);
  const worksheetEntry = entries.get('xl/worksheets/sheet1.xml');
  if (!worksheetEntry) throw new Error('The workbook has no first worksheet to import.');

  const decoder = new TextDecoder();
  let sharedStrings = [];
  const sharedEntry = entries.get('xl/sharedStrings.xml');
  if (sharedEntry) {
    const sharedXml = new DOMParser().parseFromString(
      decoder.decode(await readZipEntry(bytes, sharedEntry)),
      'application/xml'
    );
    if (sharedXml.querySelector('parsererror')) throw new Error('The Excel shared-string data is invalid.');
    sharedStrings = Array.from(sharedXml.getElementsByTagName('si')).map((item) => (
      Array.from(item.getElementsByTagName('t')).map((node) => node.textContent || '').join('')
    ));
  }

  return {
    worksheetXml: decoder.decode(await readZipEntry(bytes, worksheetEntry)),
    sharedStrings,
  };
}

export async function parseXlsx(file) {
  const { worksheetXml, sharedStrings } = await readXlsxWorksheet(file);
  return parseWorksheet(worksheetXml, sharedStrings);
}

export async function parseXlsxPreviewRows(file) {
  const { worksheetXml, sharedStrings } = await readXlsxWorksheet(file);
  return parseWorksheet(worksheetXml, sharedStrings, true);
}
