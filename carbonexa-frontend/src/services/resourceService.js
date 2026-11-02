import { dataMode, endpointPaths, requestJson } from './api';
import { mockStore } from '../mocks/mockStore';

const collectionPath = (resource, projectId) => {
  const getPath = endpointPaths[resource];
  if (!getPath || typeof getPath !== 'function') {
    throw new Error(`No API endpoint is configured for ${resource}.`);
  }
  return getPath(projectId);
};

export function createResourceService(resource) {
  return {
    async list(projectId, { signal } = {}) {
      if (!projectId) return [];
      if (dataMode === 'mock') return mockStore.list(`${projectId}:${resource}`);
      const payload = await requestJson(collectionPath(resource, projectId), { signal });
      if (!Array.isArray(payload?.data)) throw new Error(`The ${resource} API response must contain a data array.`);
      return payload.data;
    },
    async create(projectId, record) {
      if (!projectId) throw new Error('Select a project before adding records.');
      if (dataMode === 'mock') return mockStore.create(`${projectId}:${resource}`, record);
      const payload = await requestJson(collectionPath(resource, projectId), {
        method: 'POST',
        body: JSON.stringify(record),
      });
      if (!payload?.data || typeof payload.data !== 'object') {
        throw new Error(`The ${resource} API response must contain the created record.`);
      }
      return payload.data;
    },
    async update(projectId, recordId, changes) {
      if (dataMode === 'mock') return mockStore.update(`${projectId}:${resource}`, recordId, changes);
      const payload = await requestJson(`${collectionPath(resource, projectId)}/${encodeURIComponent(recordId)}`, {
        method: 'PUT',
        body: JSON.stringify(changes),
      });
      if (!payload?.data || typeof payload.data !== 'object') {
        throw new Error(`The ${resource} API response must contain the updated record.`);
      }
      return payload.data;
    },
    async remove(projectId, recordId) {
      if (dataMode === 'mock') return mockStore.remove(`${projectId}:${resource}`, recordId);
      await requestJson(`${collectionPath(resource, projectId)}/${encodeURIComponent(recordId)}`, {
        method: 'DELETE',
      });
    },
  };
}
