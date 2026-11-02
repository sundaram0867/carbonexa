const storagePrefix = 'carbonexa-mock';

const readRecords = (resourceKey) => {
  try {
    const savedRecords = localStorage.getItem(`${storagePrefix}:${resourceKey}`);
    if (!savedRecords) return [];
    const records = JSON.parse(savedRecords);
    if (!Array.isArray(records)) throw new Error('Mock resource data must be an array.');
    return records;
  } catch {
    throw new Error(`Could not read mock ${resourceKey} data from this browser.`);
  }
};

const writeRecords = (resourceKey, records) => {
  try {
    localStorage.setItem(`${storagePrefix}:${resourceKey}`, JSON.stringify(records));
  } catch {
    throw new Error(`Could not save mock ${resourceKey} data. Check available browser storage.`);
  }
};

export const mockStore = {
  list(resourceKey) {
    return readRecords(resourceKey);
  },
  create(resourceKey, record) {
    const records = readRecords(resourceKey);
    const createdRecord = {
      ...record,
      id: record.id || globalThis.crypto?.randomUUID?.() || `mock-${Date.now()}`,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeRecords(resourceKey, [createdRecord, ...records]);
    return createdRecord;
  },
  update(resourceKey, recordId, changes) {
    const records = readRecords(resourceKey);
    const record = records.find((item) => item.id === recordId);
    if (!record) throw new Error(`Mock ${resourceKey} record was not found.`);
    const updatedRecord = { ...record, ...changes, updatedAt: new Date().toISOString() };
    writeRecords(resourceKey, records.map((item) => item.id === recordId ? updatedRecord : item));
    return updatedRecord;
  },
  remove(resourceKey, recordId) {
    const records = readRecords(resourceKey);
    if (!records.some((item) => item.id === recordId)) {
      throw new Error(`Mock ${resourceKey} record was not found.`);
    }
    writeRecords(resourceKey, records.filter((item) => item.id !== recordId));
  },
  clear(resourceKey) {
    try {
      localStorage.removeItem(`${storagePrefix}:${resourceKey}`);
    } catch {
      throw new Error(`Could not remove mock ${resourceKey} data from this browser.`);
    }
  },
};
