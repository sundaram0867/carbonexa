import { dataMode, endpointPaths, requestJson } from './api';
import { mockStore } from '../mocks/mockStore';
import { createResourceService } from './resourceService';
import { loadDocumentLibrary, saveDocumentLibrary } from '../data/documentLibrary';

const resources = createResourceService('documents');
const documentFiles = new Map();
const documentRevisionFiles = new Map();
const supportedDocumentTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]);

const documentPath = (documentId = '') => `/documents${documentId ? `/${encodeURIComponent(documentId)}` : ''}`;
const nowIso = () => new Date().toISOString();
const dateLabel = (date = new Date()) => date.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function assertDocumentResponse(payload, message = 'The documents API response must contain a document.') {
  if (!payload?.data || typeof payload.data !== 'object') throw new Error(message);
  return payload.data;
}

function saveMockFiles(files) {
  const { folders } = loadDocumentLibrary();
  saveDocumentLibrary(folders, files);
}

function getMockDocument(documentId) {
  const { files, error } = loadDocumentLibrary();
  if (error) throw new Error(error);
  const document = files.find((file) => String(file.id) === String(documentId));
  if (!document) throw new Error('Document was not found.');
  return { files, document };
}

function createDocumentMetadata(file, metadata) {
  const timestamp = nowIso();
  const id = Date.now();
  const version = '1.0';
  return {
    id,
    name: metadata.title.trim(),
    title: metadata.title.trim(),
    folder: metadata.folder,
    originalFolder: metadata.folder,
    category: metadata.category,
    project: metadata.project || '',
    fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
    type: metadata.type || file.name.split('.').pop()?.toUpperCase() || 'FILE',
    description: metadata.description || '',
    tags: metadata.tags || '',
    uploadedBy: metadata.uploadedBy || 'Prathamesh Tripathi',
    uploadedAt: timestamp,
    added: dateLabel(),
    modifiedAt: timestamp,
    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    fileSize: file.size,
    starred: false,
    version,
    approvalStatus: 'Draft',
    approvalHistory: [{ status: 'Draft', by: metadata.uploadedBy || 'Prathamesh Tripathi', at: timestamp, comment: 'Document uploaded.' }],
    comments: [],
    archived: false,
    versions: [{
      version,
      uploadedBy: metadata.uploadedBy || 'Prathamesh Tripathi',
      uploadedAt: timestamp,
      description: metadata.description || 'Initial upload',
      name: file.name,
      size: file.size,
      fileId: String(id),
    }],
  };
}

export const documentService = {
  ...resources,
  async create(projectId, record) {
    if (!record.file) return resources.create(projectId, record);
    if (dataMode === 'mock') {
      const { file, ...metadata } = record;
      return mockStore.create(`${projectId}:documents`, {
        ...metadata,
        fileName: file.name,
        fileSize: file.size,
        storage: 'metadata-only',
      });
    }
    const formData = new FormData();
    formData.append('file', record.file);
    Object.entries(record).forEach(([key, value]) => {
      if (key !== 'file' && value !== undefined && value !== null) formData.append(key, String(value));
    });
    const payload = await requestJson(endpointPaths.documents(projectId), {
      method: 'POST',
      body: formData,
    });
    if (!payload?.data || typeof payload.data !== 'object') {
      throw new Error('The documents API response must contain the uploaded document.');
    }
    return payload.data;
  },
  async update(projectId, recordId, record) {
    if (!record.file) return resources.update(projectId, recordId, record);
    if (dataMode === 'mock') {
      const { file, ...metadata } = record;
      return resources.update(projectId, recordId, {
        ...metadata,
        fileName: file.name,
        fileSize: file.size,
        storage: 'metadata-only',
      });
    }
    const formData = new FormData();
    formData.append('file', record.file);
    Object.entries(record).forEach(([key, value]) => {
      if (key !== 'file' && value !== undefined && value !== null) formData.append(key, String(value));
    });
    const payload = await requestJson(`${endpointPaths.documents(projectId)}/${encodeURIComponent(recordId)}`, {
      method: 'PUT',
      body: formData,
    });
    if (!payload?.data || typeof payload.data !== 'object') {
      throw new Error('The documents API response must contain the updated document.');
    }
    return payload.data;
  },
  async getDocuments({ signal } = {}) {
    if (dataMode === 'mock') {
      const { files, error } = loadDocumentLibrary();
      if (error) throw new Error(error);
      return files;
    }
    const payload = await requestJson(documentPath(), { signal });
    if (!Array.isArray(payload?.data)) throw new Error('The documents API response must contain a data array.');
    return payload.data;
  },
  async uploadDocument(file, metadata, { signal } = {}) {
    if (typeof File === 'undefined' || !(file instanceof File)) throw new Error('Choose a document file to upload.');
    if (!supportedDocumentTypes.has(file.type) && !/\.(pdf|jpe?g|png|webp|csv|xls|xlsx|doc|docx|zip)$/i.test(file.name)) {
      throw new Error('This document type is not supported.');
    }
    if (file.size > 25 * 1024 * 1024) throw new Error('Each document must be 25 MB or smaller.');
    if (!metadata?.title?.trim() || !metadata?.folder || !metadata?.category) {
      throw new Error('A title, folder, and category are required.');
    }

    if (dataMode === 'mock') {
      const { files, error } = loadDocumentLibrary();
      if (error) throw new Error(error);
      const duplicate = files.some((item) => item.folder === metadata.folder
        && item.name.toLowerCase() === metadata.title.trim().toLowerCase());
      if (duplicate) throw new Error('A document with this name already exists in the selected folder.');
      const document = createDocumentMetadata(file, metadata);
      documentFiles.set(String(document.id), file);
      documentRevisionFiles.set(`${document.id}:${document.version}`, file);
      saveMockFiles([document, ...files]);
      return document;
    }

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    return assertDocumentResponse(await requestJson(documentPath(), { method: 'POST', body: formData, signal }));
  },
  async updateDocument(documentId, changes) {
    if (dataMode !== 'mock') {
      const { file, ...metadata } = changes;
      if (!file) {
        return assertDocumentResponse(await requestJson(documentPath(documentId), {
          method: 'PUT',
          body: JSON.stringify(metadata),
        }), 'The documents API response must contain the updated document.');
      }
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(metadata).forEach(([key, value]) => formData.append(key, String(value ?? '')));
      return assertDocumentResponse(await requestJson(documentPath(documentId), {
        method: 'PUT',
        body: formData,
      }), 'The documents API response must contain the updated document.');
    }

    const { files, document } = getMockDocument(documentId);
    const nextDocument = {
      ...document,
      ...changes,
      name: changes.title?.trim() || changes.name || document.name,
      title: changes.title?.trim() || changes.name || document.title || document.name,
      modifiedAt: nowIso(),
    };
    if (typeof File !== 'undefined' && changes.file instanceof File) {
      const timestamp = nowIso();
      const nextVersion = `${Number.parseFloat(document.version || '1') + 1}.0`;
      const currentFile = documentFiles.get(String(document.id));
      if (currentFile) documentRevisionFiles.set(`${document.id}:${document.version || '1.0'}`, currentFile);
      documentFiles.set(String(document.id), changes.file);
      nextDocument.name = changes.title?.trim() || changes.file.name;
      nextDocument.title = nextDocument.name;
      nextDocument.fileType = changes.file.name.split('.').pop()?.toUpperCase() || document.fileType;
      nextDocument.version = nextVersion;
      nextDocument.size = `${(changes.file.size / (1024 * 1024)).toFixed(1)} MB`;
      nextDocument.fileSize = changes.file.size;
      nextDocument.approvalStatus = 'Draft';
      nextDocument.approvalHistory = [...(document.approvalHistory || []), {
        status: 'Draft',
        by: changes.uploadedBy || 'Prathamesh Tripathi',
        at: timestamp,
        comment: `Version ${nextVersion} uploaded; review is required.`,
      }];
      nextDocument.versions = [{
        version: nextVersion,
        uploadedBy: changes.uploadedBy || 'Prathamesh Tripathi',
        uploadedAt: timestamp,
        description: changes.versionDescription || 'Updated document',
        name: changes.file.name,
        size: changes.file.size,
        fileId: String(document.id),
      }, ...(document.versions || []).map((version) => (
        version.version === document.version && currentFile
          ? { ...version, fileId: String(document.id), size: currentFile.size }
          : version
      ))];
      documentRevisionFiles.set(`${document.id}:${nextVersion}`, changes.file);
    }
    saveMockFiles(files.map((item) => String(item.id) === String(documentId) ? nextDocument : item));
    return nextDocument;
  },
  async deleteDocument(documentId) {
    if (dataMode !== 'mock') {
      await requestJson(documentPath(documentId), { method: 'DELETE' });
      return;
    }
    const { files, document } = getMockDocument(documentId);
    documentFiles.delete(String(documentId));
    saveMockFiles(files.filter((item) => String(item.id) !== String(documentId)));
    if (document.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(document.previewUrl);
  },
  async getDocumentDetails(documentId, { signal } = {}) {
    if (dataMode === 'mock') return getMockDocument(documentId).document;
    return assertDocumentResponse(await requestJson(documentPath(documentId), { signal }));
  },
  async getDocumentVersions(documentId, { signal } = {}) {
    if (dataMode === 'mock') return getMockDocument(documentId).document.versions || [];
    const payload = await requestJson(`${documentPath(documentId)}/versions`, { signal });
    if (!Array.isArray(payload?.data)) throw new Error('The document versions API must return a data array.');
    return payload.data;
  },
  async restoreDocumentVersion(documentId, version) {
    if (dataMode !== 'mock') {
      return assertDocumentResponse(await requestJson(`${documentPath(documentId)}/versions/${encodeURIComponent(version)}/restore`, {
        method: 'POST',
      }));
    }
    const { files, document } = getMockDocument(documentId);
    const selectedVersion = (document.versions || []).find((item) => item.version === version);
    if (!selectedVersion) throw new Error('That document version could not be found.');
    const timestamp = nowIso();
    const restoredFile = documentRevisionFiles.get(`${documentId}:${version}`);
    if (restoredFile) documentFiles.set(String(documentId), restoredFile);
    const restoredVersion = `${Number.parseFloat(document.version || '1') + 1}.0`;
    const restored = {
      ...document,
      name: selectedVersion.name || document.name,
      title: selectedVersion.name || document.title || document.name,
      size: `${((selectedVersion.size || 0) / (1024 * 1024)).toFixed(1)} MB`,
      fileSize: selectedVersion.size || document.fileSize,
      version: restoredVersion,
      modifiedAt: timestamp,
      approvalStatus: 'Draft',
      approvalHistory: [...(document.approvalHistory || []), {
        status: 'Draft', by: 'Prathamesh Tripathi', at: timestamp, comment: `Restored from version ${version}.`,
      }],
      versions: [{
        version: restoredVersion,
        uploadedBy: 'Prathamesh Tripathi',
        uploadedAt: timestamp,
        description: `Restored from version ${version}`,
        name: selectedVersion.name || document.name,
        size: selectedVersion.size || document.fileSize || 0,
        fileId: String(documentId),
      }, ...(document.versions || [])],
    };
    saveMockFiles(files.map((item) => String(item.id) === String(documentId) ? restored : item));
    return restored;
  },
  async submitDocumentForReview(documentId, comment = '') {
    if (dataMode !== 'mock') {
      return assertDocumentResponse(await requestJson(`${documentPath(documentId)}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Pending Review', comment }),
      }));
    }
    return this.updateDocument(documentId, {
      approvalStatus: 'Pending Review',
      approvalHistory: [...(getMockDocument(documentId).document.approvalHistory || []), {
        status: 'Pending Review', by: 'Prathamesh Tripathi', at: nowIso(), comment,
      }],
    });
  },
  async approveDocument(documentId, comment = '') {
    if (dataMode !== 'mock') {
      return assertDocumentResponse(await requestJson(`${documentPath(documentId)}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Approved', comment }),
      }));
    }
    const document = getMockDocument(documentId).document;
    if (document.approvalStatus !== 'Pending Review') throw new Error('Only documents pending review can be approved.');
    return this.updateDocument(documentId, {
      approvalStatus: 'Approved',
      approvalHistory: [...(document.approvalHistory || []), {
        status: 'Approved', by: 'Prathamesh Tripathi', at: nowIso(), comment,
      }],
    });
  },
  async rejectDocument(documentId, comment) {
    if (!comment?.trim()) throw new Error('Add a reviewer comment before rejecting this document.');
    if (dataMode !== 'mock') {
      return assertDocumentResponse(await requestJson(`${documentPath(documentId)}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Rejected', comment: comment.trim() }),
      }));
    }
    const document = getMockDocument(documentId).document;
    if (document.approvalStatus !== 'Pending Review') throw new Error('Only documents pending review can be rejected.');
    return this.updateDocument(documentId, {
      approvalStatus: 'Rejected',
      approvalHistory: [...(document.approvalHistory || []), {
        status: 'Rejected', by: 'Prathamesh Tripathi', at: nowIso(), comment: comment.trim(),
      }],
    });
  },
  async addDocumentComment(documentId, comment) {
    if (!comment?.trim()) throw new Error('Enter a comment before posting.');
    if (dataMode !== 'mock') {
      const payload = await requestJson(`${documentPath(documentId)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: comment.trim() }),
      });
      return assertDocumentResponse(payload, 'The comments API response must contain the created comment.');
    }
    const { files, document } = getMockDocument(documentId);
    const entry = {
      id: globalThis.crypto?.randomUUID?.() || `comment-${Date.now()}`,
      author: 'Prathamesh Tripathi',
      at: nowIso(),
      text: comment.trim(),
    };
    const updated = { ...document, comments: [...(document.comments || []), entry] };
    saveMockFiles(files.map((item) => String(item.id) === String(documentId) ? updated : item));
    return entry;
  },
  async archiveDocument(documentId, archived = true) {
    if (dataMode !== 'mock') {
      return assertDocumentResponse(await requestJson(`${documentPath(documentId)}/archive`, {
        method: 'PATCH',
        body: JSON.stringify({ archived }),
      }));
    }
    return this.updateDocument(documentId, { archived });
  },
  async getPreviewUrl(documentId, version = '') {
    if (dataMode !== 'mock') {
      const document = await this.getDocumentDetails(documentId);
      return version
        ? `${documentPath(documentId)}/versions/${encodeURIComponent(version)}/preview`
        : (document.previewUrl || '');
    }
    const file = version
      ? documentRevisionFiles.get(`${documentId}:${version}`)
      : documentFiles.get(String(documentId));
    return file ? URL.createObjectURL(file) : '';
  },
  async getPreviewFile(documentId, version = '') {
    if (dataMode !== 'mock') return null;
    return version
      ? documentRevisionFiles.get(`${documentId}:${version}`) || null
      : documentFiles.get(String(documentId)) || null;
  },
  async downloadDocument(documentId, version = '') {
    if (dataMode === 'mock') {
      const file = version
        ? documentRevisionFiles.get(`${documentId}:${version}`)
        : documentFiles.get(String(documentId));
      if (!file) return { downloaded: false, reason: 'File contents are not available in this browser session.' };
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { downloaded: true };
    }
    const suffix = version ? `/versions/${encodeURIComponent(version)}/download` : '/download';
    const record = await this.getDocumentDetails(documentId);
    const href = (!version && record.downloadUrl) || `${documentPath(documentId)}${suffix}`;
    const link = document.createElement('a');
    link.href = href;
    link.download = record.name || record.title || 'document';
    link.rel = 'noopener';
    link.click();
    return { downloaded: true };
  },
};
