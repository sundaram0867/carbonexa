import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Folder, FileText, Plus, Upload, Trash2, Search,
  Star, Filter, X, CheckCircle2, ArrowLeft, Pencil, Eye, Download,
  History, Archive, Check, XCircle, MessageSquare, RotateCcw, LoaderCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { defaultFiles, defaultFolders, loadDocumentLibrary, saveDocumentLibrary } from '../data/documentLibrary';
import { projectService } from '../services/projectService';
import { dataMode } from '../config/api';
import { documentService } from '../services/documentService';
import { parseXlsxPreviewRows } from '../utils/projectCsv';
import './Documents.css';

const getSizeInMegabytes = (size) => Number.parseFloat(size) || 0;
const formatSize = (size) => `${size.toFixed(1)} MB`;
const maxUploadBytes = 25 * 1024 * 1024;
const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xls', 'xlsx', 'doc', 'docx', 'csv', 'zip']);
const categories = ['Geological', 'Environmental', 'Mining', 'Safety', 'Operations', 'Regulatory'];
const approvalStatuses = ['Draft', 'Pending Review', 'Approved', 'Rejected'];
const getExtension = (name = '') => name.split('.').pop()?.toLowerCase() || '';
const isPreviewSupported = (file) => ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'csv', 'xlsx'].includes(getExtension(file.name));
const displayDate = (date) => {
  if (!date) return 'Not recorded';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString();
};
const parseCsvPreviewRows = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (inQuotes && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (inQuotes) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (!rows.length) throw new Error('This CSV document has no rows to preview.');
  return rows.slice(0, 201).map((currentRow) => currentRow.slice(0, 20));
};

const normalizeDocument = (file) => ({
  ...file,
  title: file.title || file.name,
  fileType: file.fileType || getExtension(file.name).toUpperCase() || 'FILE',
  type: file.type || file.fileType || getExtension(file.name).toUpperCase() || 'FILE',
  project: file.project || '',
  description: file.description || '',
  uploadedBy: file.uploadedBy || 'Carbonexa user',
  uploadedAt: file.uploadedAt || file.added || '',
  modifiedAt: file.modifiedAt || file.uploadedAt || file.added || '',
  version: file.version || '1.0',
  approvalStatus: approvalStatuses.includes(file.approvalStatus) ? file.approvalStatus : 'Draft',
  tags: file.tags || '',
  versions: file.versions || [
    {
      version: file.version || '1.0',
      uploadedBy: file.uploadedBy || 'Carbonexa user',
      uploadedAt: file.uploadedAt || file.added || '',
      description: 'Current library version',
      name: file.name,
      size: Math.round(getSizeInMegabytes(file.size) * 1024 * 1024),
    },
    {
      version: '0.9',
      uploadedBy: 'Geological Survey Team',
      uploadedAt: '2026-08-15T09:00:00.000Z',
      description: 'Previous technical review copy (sample metadata)',
      name: file.name,
      size: Math.round(getSizeInMegabytes(file.size) * 1024 * 1024),
    },
  ],
  approvalHistory: file.approvalHistory || [],
  comments: file.comments || [],
  archived: Boolean(file.archived),
});
const loadDocumentProjectContext = () => {
  try {
    const workspace = projectService.loadWorkspace();
    return {
      names: workspace.projects.filter((project) => !project.archived).map((project) => project.name),
      error: '',
    };
  } catch (error) {
    return { names: [], error: error.message || 'Project list could not be loaded for document linking.' };
  }
};

function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialLibrary] = useState(loadDocumentLibrary);
  const [projectContext] = useState(loadDocumentProjectContext);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState('newest');
  const [starredOnly, setStarredOnly] = useState(false);
  const [activeFolderFilter, setActiveFolderFilter] = useState(null); // null means viewing all root files
  const [toastMessage, setToastMessage] = useState(initialLibrary.error || projectContext.error);
  const [documentsLoading, setDocumentsLoading] = useState(dataMode === 'php');

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [uploadMetadata, setUploadMetadata] = useState({ category: 'Geological', project: '', type: '', description: '', tags: '' });
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const uploadInputRef = useRef(null);
  const uploadControllerRef = useRef(null);
  const uploadCreatedCountRef = useRef(0);
  const versionInputRef = useRef(null);
  const uploadRunRef = useRef(0);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileName, setEditedFileName] = useState('');
  const [editedFileFolder, setEditedFileFolder] = useState('');
  const [editedFileCategory, setEditedFileCategory] = useState('');
  const [editedFileProject, setEditedFileProject] = useState('');
  const [editedFileDescription, setEditedFileDescription] = useState('');
  const [editedFileTags, setEditedFileTags] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showArchivedFiles, setShowArchivedFiles] = useState(false);
  const [documentPanel, setDocumentPanel] = useState(null);
  const [panelSection, setPanelSection] = useState('details');
  const [panelVersion, setPanelVersion] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [previewError, setPreviewError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [newDocumentComment, setNewDocumentComment] = useState('');
  const projectNames = projectContext.names;

  const [folders, setFolders] = useState(() => dataMode === 'mock' ? (initialLibrary.folders || defaultFolders) : defaultFolders);
  const [files, setFiles] = useState(() => dataMode === 'mock' ? (initialLibrary.files || defaultFiles).map(normalizeDocument) : []);

  const searchParam = searchParams.get('search') || '';
  const actionParam = searchParams.get('action');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchParam), 0);
    return () => window.clearTimeout(timer);
  }, [searchParam]);

  useEffect(() => {
    if (dataMode !== 'php') return undefined;
    const controller = new AbortController();
    documentService.getDocuments({ signal: controller.signal })
      .then((records) => setFiles(records.map(normalizeDocument)))
      .catch((error) => {
        if (error?.name !== 'AbortError') setToastMessage(error.message || 'Documents could not be loaded from the API.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setDocumentsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (actionParam !== 'upload') return;
    const timer = window.setTimeout(() => {
      setIsUploadOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [actionParam, searchParams, setSearchParams]);

  useEffect(() => {
    const handleStorageError = () => {
      setToastMessage('Document changes could not be saved in this browser.');
    };
    window.addEventListener('carbonexa-document-library-save-error', handleStorageError);
    return () => window.removeEventListener('carbonexa-document-library-save-error', handleStorageError);
  }, []);

  useEffect(() => {
    if (dataMode !== 'mock') return;
    try {
      saveDocumentLibrary(folders, files);
    } catch {
      window.dispatchEvent(new Event('carbonexa-document-library-save-error'));
    }
  }, [files, folders]);

  useEffect(() => {
    if (panelSection !== 'preview' || !documentPanel) return undefined;
    let active = true;
    let objectUrl = '';
    const loadPreview = async () => {
      try {
        const file = await documentService.getPreviewFile(documentPanel.id, panelVersion);
        const extension = getExtension(documentPanel.name);
        if (extension === 'csv' && file) {
          setPreviewRows(parseCsvPreviewRows(await file.text()));
          return;
        }
        if (extension === 'xlsx' && file) {
          setPreviewRows(await parseXlsxPreviewRows(file));
          return;
        }
        if (!isPreviewSupported(documentPanel)) {
          setPreviewError('Preview is not available for this format in the current browser. Download the file to open it in a compatible application.');
          return;
        }
        objectUrl = await documentService.getPreviewUrl(documentPanel.id, panelVersion);
        if (!objectUrl) {
          setPreviewError('The file contents are not available in this browser session. Upload the document again to preview it.');
          return;
        }
        if (active) setPreviewUrl(objectUrl);
      } catch (error) {
        if (active) setPreviewError(error.message || 'The document preview could not be loaded.');
      }
    };
    loadPreview();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentPanel, panelSection, panelVersion]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const getFolderFiles = (folderName) => files.filter((file) => file.folder === folderName);

  const updateDocumentState = (updatedDocument) => {
    setFiles((currentFiles) => currentFiles.map((file) => (
      String(file.id) === String(updatedDocument.id) ? updatedDocument : file
    )));
    setDocumentPanel(updatedDocument);
  };

  // Handle Delete File
  const handleDeleteFile = async (id) => {
    const file = files.find((item) => String(item.id) === String(id));
    if (!file || !window.confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) return;
    try {
      await documentService.deleteDocument(id);
      setFiles((currentFiles) => currentFiles.filter((item) => String(item.id) !== String(id)));
      setSelectedIds((currentIds) => currentIds.filter((currentId) => String(currentId) !== String(id)));
      if (String(documentPanel?.id) === String(id)) setDocumentPanel(null);
      showToast('File deleted successfully.');
    } catch (error) {
      showToast(error.message || 'The document could not be deleted.');
    }
  };

  const handleOpenEditFile = (file) => {
    setEditingFile(file);
    setEditedFileName(file.name);
    setEditedFileFolder(file.folder);
    setEditedFileCategory(file.category);
    setEditedFileProject(file.project || '');
    setEditedFileDescription(file.description || '');
    setEditedFileTags(file.tags || '');
  };

  const handleEditFileSubmit = async (event) => {
    event.preventDefault();
    const fileName = editedFileName.trim();
    if (!editingFile || !fileName || !editedFileCategory || !folders.some((folder) => folder.name === editedFileFolder)) {
      showToast('Enter a file name, category, and choose a valid folder.');
      return;
    }

    const duplicateExists = files.some((file) => (
      file.id !== editingFile.id
      && file.folder === editedFileFolder
      && file.name.toLowerCase() === fileName.toLowerCase()
    ));
    if (duplicateExists) {
      showToast('A file with that name already exists in this folder.');
      return;
    }

    try {
      const updated = await documentService.updateDocument(editingFile.id, {
        title: fileName,
        folder: editedFileFolder,
        category: editedFileCategory,
        project: editedFileProject,
        description: editedFileDescription.trim(),
        tags: editedFileTags.trim(),
      });
      setFiles((currentFiles) => currentFiles.map((file) => (
        String(file.id) === String(editingFile.id) ? updated : file
      )));
      if (String(documentPanel?.id) === String(editingFile.id)) setDocumentPanel(updated);
      setFolders((currentFolders) => currentFolders.map((folder) => (
        folder.name === editedFileFolder || folder.name === editingFile.folder
          ? { ...folder, updated: 'Today' }
          : folder
      )));
      setEditingFile(null);
      showToast('File details updated.');
    } catch (error) {
      showToast(error.message || 'Document details could not be updated.');
    }
  };

  // Handle Delete Folder
  const handleDeleteFolder = (e, folderName) => {
    e.stopPropagation();
    setFolders((currentFolders) => currentFolders.filter((folder) => folder.name !== folderName));
    setFiles((currentFiles) => currentFiles.filter((file) => file.folder !== folderName));
    if (activeFolderFilter === folderName) setActiveFolderFilter(null);
    showToast(`Folder "${folderName}" and its contents deleted.`);
  };

  // Handle Create New Folder
  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (folders.some((folder) => folder.name.toLowerCase() === newFolderName.trim().toLowerCase())) {
      showToast('A folder with that name already exists.');
      return;
    }

    const newFolderObj = {
      id: Date.now(),
      name: newFolderName.trim(),
      updated: 'Today',
      year: String(new Date().getFullYear())
    };

    setFolders((currentFolders) => [...currentFolders, newFolderObj]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
    showToast(`Folder "${newFolderObj.name}" created successfully!`);
  };

  const handleUploadFileSelection = (fileList) => {
    const incomingFiles = Array.from(fileList || []);
    if (!incomingFiles.length) return;
    const invalidFile = incomingFiles.find((file) => (
      !allowedExtensions.has(getExtension(file.name)) || file.size > maxUploadBytes
    ));
    if (invalidFile) {
      setUploadError(!allowedExtensions.has(getExtension(invalidFile.name))
        ? `${invalidFile.name} has an unsupported file type.`
        : `${invalidFile.name} exceeds the 25 MB per-file limit.`);
      return;
    }
    const existingNames = new Set(files
      .filter((file) => file.folder === uploadTargetFolder)
      .map((file) => file.name.toLowerCase()));
    const selectedNames = new Set(selectedUploadFiles.map((file) => file.name.toLowerCase()));
    const duplicate = incomingFiles.find((file) => existingNames.has(file.name.toLowerCase()) || selectedNames.has(file.name.toLowerCase()));
    if (duplicate) {
      setUploadError(`${duplicate.name} is already in this folder or upload selection.`);
      return;
    }
    setUploadError('');
    setSelectedUploadFiles((currentFiles) => [...currentFiles, ...incomingFiles]);
    if (!selectedUploadFiles.length && incomingFiles.length === 1) {
      setFileNameInput(incomingFiles[0].name);
      setUploadMetadata((current) => ({ ...current, type: getExtension(incomingFiles[0].name).toUpperCase() }));
    }
  };

  const cancelUpload = () => {
    uploadRunRef.current += 1;
    uploadControllerRef.current?.abort();
    uploadControllerRef.current = null;
    if (uploadCreatedCountRef.current > 0) {
      showToast(`Upload cancelled. ${uploadCreatedCountRef.current} file(s) had already completed.`);
    }
    uploadCreatedCountRef.current = 0;
    setUploadProgress(null);
    setUploadError('');
    setSelectedUploadFiles([]);
    setFileNameInput('');
    setIsUploadOpen(false);
  };

  const openUploadDialog = (folder = activeFolderFilter || folders[0]?.name || '') => {
    setUploadTargetFolder(folder);
    setSelectedUploadFiles([]);
    setFileNameInput('');
    setUploadMetadata({ category: folder.includes('Geological') ? 'Geological'
      : folder.includes('Environmental') ? 'Environmental'
        : folder.includes('Safety') ? 'Safety'
          : folder.includes('Mining') ? 'Mining' : 'Operations', project: '', type: '', description: '', tags: '' });
    setUploadError('');
    setUploadProgress(null);
    setIsUploadOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUploadFiles.length || !uploadTargetFolder || !folders.some((folder) => folder.name === uploadTargetFolder)
      || (selectedUploadFiles.length === 1 && !fileNameInput.trim()) || !uploadMetadata.category) {
      setUploadError('Choose valid file(s), a folder, a category, and a title for a single file.');
      return;
    }
    const runId = uploadRunRef.current + 1;
    uploadRunRef.current = runId;
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    uploadCreatedCountRef.current = 0;
    setUploadError('');
    setUploadProgress(0);
    const createdDocuments = [];
    try {
      for (let index = 0; index < selectedUploadFiles.length; index += 1) {
        const file = selectedUploadFiles[index];
        for (let step = 1; step <= 4; step += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 70));
          if (uploadRunRef.current !== runId) return;
          setUploadProgress(Math.round(((index + step / 4) / selectedUploadFiles.length) * 90));
        }
        const title = selectedUploadFiles.length === 1
          ? fileNameInput.trim()
          : file.name;
        const metadata = {
          ...uploadMetadata,
          title: title.includes('.') ? title : `${title}.${getExtension(file.name)}`,
          folder: uploadTargetFolder,
          uploadedBy: 'Prathamesh Tripathi',
        };
        const savedDocument = await documentService.uploadDocument(file, metadata, { signal: controller.signal });
        if (uploadRunRef.current !== runId) return;
        createdDocuments.push(savedDocument);
        uploadCreatedCountRef.current += 1;
        setFiles((currentFiles) => [savedDocument, ...currentFiles]);
        setUploadProgress(Math.round(((index + 1) / selectedUploadFiles.length) * 100));
      }
      if (uploadRunRef.current !== runId) return;
      setFolders((currentFolders) => currentFolders.map((folder) => (
        folder.name === uploadTargetFolder ? { ...folder, updated: 'Today' } : folder
      )));
      setSelectedIds([]);
      setSelectedUploadFiles([]);
      setFileNameInput('');
      setUploadProgress(null);
      setIsUploadOpen(false);
      uploadControllerRef.current = null;
      uploadCreatedCountRef.current = 0;
      showToast(`${createdDocuments.length} document${createdDocuments.length === 1 ? '' : 's'} added to "${uploadTargetFolder}". File bytes are available in this browser session only.`);
    } catch (error) {
      if (controller.signal.aborted) return;
      setUploadError(createdDocuments.length
        ? `${error.message || 'The upload could not be completed.'} ${createdDocuments.length} file(s) were uploaded before this error.`
        : (error.message || 'The upload could not be completed.'));
      setUploadProgress(null);
      uploadControllerRef.current = null;
      uploadCreatedCountRef.current = createdDocuments.length;
    }
  };

  const displayedFiles = files.filter((file) => {
    const matchesArchive = showArchivedFiles ? Boolean(file.archived) : !file.archived;
    const matchesFolder = activeFolderFilter ? file.folder === activeFolderFilter : true;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = [file.name, file.title, file.folder, file.category, file.project, file.type, file.description, file.uploadedBy, file.tags]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesCategory = selectedCategoryFilter === 'All Categories' || file.category === selectedCategoryFilter;
    const matchesStarred = !starredOnly || file.starred;
    return matchesArchive && matchesFolder && matchesSearch && matchesCategory && matchesStarred;
  }).sort((first, second) => {
    if (sortOrder === 'name-asc') return first.name.localeCompare(second.name);
    if (sortOrder === 'name-desc') return second.name.localeCompare(first.name);
    const firstDate = first.added === 'Today' ? Number.POSITIVE_INFINITY : Date.parse(first.added) || 0;
    const secondDate = second.added === 'Today' ? Number.POSITIVE_INFINITY : Date.parse(second.added) || 0;
    return sortOrder === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
  });

  const visibleFolders = folders.filter((folder) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return !normalizedQuery
      || folder.name.toLowerCase().includes(normalizedQuery)
      || getFolderFiles(folder.name).some((file) => (
        [file.name, file.category].some((value) => value.toLowerCase().includes(normalizedQuery))
      ));
  });

  const allVisibleSelected = displayedFiles.length > 0
    && displayedFiles.every((file) => selectedIds.some((id) => String(id) === String(file.id)));

  const toggleDocumentSelection = (id) => {
    setSelectedIds((currentIds) => currentIds.some((item) => String(item) === String(id))
      ? currentIds.filter((item) => String(item) !== String(id))
      : [...currentIds, id]);
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((currentIds) => currentIds.filter((id) => !displayedFiles.some((file) => String(file.id) === String(id))));
      return;
    }
    setSelectedIds((currentIds) => [...new Set([...currentIds, ...displayedFiles.map((file) => file.id)])]);
  };

  const handleBulkDownload = async () => {
    const results = await Promise.all(selectedIds.map((id) => documentService.downloadDocument(id)));
    const downloadedCount = results.filter((result) => result.downloaded).length;
    const unavailableCount = results.length - downloadedCount;
    showToast(unavailableCount
      ? `${downloadedCount} downloaded; ${unavailableCount} sample file(s) have no file bytes in this browser session.`
      : `${downloadedCount} selected document${downloadedCount === 1 ? '' : 's'} downloaded.`);
  };

  const handleBulkArchive = async () => {
    const selectedFiles = files.filter((file) => selectedIds.some((id) => String(id) === String(file.id)));
    if (!selectedFiles.length) return;
    try {
      const archivedDocuments = await Promise.all(selectedFiles.map((file) => documentService.archiveDocument(file.id, !showArchivedFiles)));
      setFiles((currentFiles) => currentFiles.map((file) => {
        const updated = archivedDocuments.find((item) => String(item.id) === String(file.id));
        return updated || file;
      }));
      setSelectedIds([]);
      showToast(showArchivedFiles ? `${archivedDocuments.length} document(s) restored.` : `${archivedDocuments.length} document(s) archived.`);
    } catch (error) {
      showToast(error.message || 'The selected documents could not be archived.');
    }
  };

  const handleBulkDelete = async () => {
    const selectedFiles = files.filter((file) => selectedIds.some((id) => String(id) === String(file.id)));
    if (!selectedFiles.length || !window.confirm(`Permanently delete ${selectedFiles.length} selected document(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedFiles.map((file) => documentService.deleteDocument(file.id)));
      setFiles((currentFiles) => currentFiles.filter((file) => !selectedIds.some((id) => String(id) === String(file.id))));
      setSelectedIds([]);
      showToast(`${selectedFiles.length} document(s) deleted.`);
    } catch (error) {
      showToast(error.message || 'The selected documents could not be deleted.');
    }
  };

  const openDocumentPanel = (file, section = 'details', version = '') => {
    setDocumentPanel(normalizeDocument(file));
    setPanelSection(section);
    setPanelVersion(version);
    setPreviewUrl('');
    setPreviewRows([]);
    setPreviewError('');
    setReviewComment('');
    setNewDocumentComment('');
  };

  const downloadCurrentDocument = async (version = '') => {
    if (!documentPanel) return;
    try {
      const result = await documentService.downloadDocument(documentPanel.id, version);
      showToast(result.downloaded ? 'Document download started.' : result.reason);
    } catch (error) {
      showToast(error.message || 'The document could not be downloaded.');
    }
  };

  const submitForReview = async () => {
    if (!documentPanel) return;
    try {
      updateDocumentState(await documentService.submitDocumentForReview(documentPanel.id, reviewComment.trim()));
      setPanelSection('review');
      setReviewComment('');
      showToast('Document submitted for review.');
    } catch (error) {
      showToast(error.message || 'Document could not be submitted for review.');
    }
  };

  const updateApproval = async (action) => {
    if (!documentPanel) return;
    try {
      const updated = action === 'approve'
        ? await documentService.approveDocument(documentPanel.id, reviewComment.trim())
        : await documentService.rejectDocument(documentPanel.id, reviewComment);
      updateDocumentState(updated);
      setReviewComment('');
      showToast(action === 'approve' ? 'Document approved.' : 'Document rejected.');
    } catch (error) {
      showToast(error.message || 'Review status could not be updated.');
    }
  };

  const addReviewComment = async (event) => {
    event.preventDefault();
    if (!documentPanel) return;
    try {
      await documentService.addDocumentComment(documentPanel.id, newDocumentComment);
      const updated = await documentService.getDocumentDetails(documentPanel.id);
      updateDocumentState(updated);
      setNewDocumentComment('');
      showToast('Comment added.');
    } catch (error) {
      showToast(error.message || 'Comment could not be added.');
    }
  };

  const restoreVersion = async (version) => {
    if (!documentPanel || !window.confirm(`Restore version ${version} as the current document version?`)) return;
    try {
      updateDocumentState(await documentService.restoreDocumentVersion(documentPanel.id, version));
      setPanelVersion('');
      setPanelSection('details');
      showToast(`Version ${version} restored as a new version.`);
    } catch (error) {
      showToast(error.message || 'That document version could not be restored.');
    }
  };

  const handleNewVersionSelection = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !documentPanel) return;
    if (!allowedExtensions.has(getExtension(file.name)) || file.size > maxUploadBytes) {
      showToast(file.size > maxUploadBytes ? 'Each version must be 25 MB or smaller.' : 'This document type is not supported.');
      return;
    }
    try {
      const updated = await documentService.updateDocument(documentPanel.id, {
        file,
        title: file.name,
        type: documentPanel.type,
        category: documentPanel.category,
        folder: documentPanel.folder,
        project: documentPanel.project,
        description: documentPanel.description,
        tags: documentPanel.tags,
        versionDescription: `Uploaded ${file.name}`,
        uploadedBy: 'Prathamesh Tripathi',
      });
      updateDocumentState(updated);
      setPanelSection('versions');
      setPanelVersion('');
      showToast(`Version ${updated.version} uploaded. File bytes are available in this browser session only.`);
    } catch (error) {
      showToast(error.message || 'The new document version could not be uploaded.');
    }
  };

  const toggleStarred = (fileId) => {
    setFiles((currentFiles) => currentFiles.map((file) => (
      file.id === fileId ? { ...file, starred: !file.starred } : file
    )));
  };

  const documentProjectOptions = [...new Set([
    ...projectNames,
    ...files.map((file) => file.project).filter(Boolean),
  ])];
  const previewDocumentIndex = documentPanel
    ? displayedFiles.findIndex((file) => String(file.id) === String(documentPanel.id))
    : -1;

  const movePreviewDocument = (direction) => {
    const nextDocument = displayedFiles[previewDocumentIndex + direction];
    if (nextDocument) openDocumentPanel(nextDocument, 'preview');
  };

  return (
    <div className="workspace-page documents-page" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '30px', background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}
      <datalist id="document-project-options">
        {documentProjectOptions.map((project) => <option key={project} value={project} />)}
      </datalist>

      {/* Breadcrumb & Header */}
      <div className="documents-page-heading" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Home</span> &gt; 
          {activeFolderFilter ? (
            <>
              <span style={{ cursor: 'pointer', color: '#0284c7' }} onClick={() => setActiveFolderFilter(null)}>Documents</span> &gt; 
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{activeFolderFilter}</span>
            </>
          ) : (
            <span style={{ color: '#0f172a', fontWeight: '500' }}>Documents</span>
          )}
        </div>

        <div className="documents-heading-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
              {activeFolderFilter ? activeFolderFilter : 'Documents & Files'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {activeFolderFilter 
                ? `Viewing files inside folder: ${activeFolderFilter}`
                : 'Manage, organize, upload, and search your mining and environmental documents by date and category.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeFolderFilter && (
              <button 
                onClick={() => setActiveFolderFilter(null)}
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} /> Back to All Folders
              </button>
            )}

            <button 
              onClick={() => setIsNewFolderOpen(true)}
              style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Folder size={16} color="#0284c7" /> New Folder
            </button>

            <button 
              className="workspace-primary-action"
              onClick={() => openUploadDialog()}
              disabled={folders.length === 0}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Upload size={16} /> Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Directories & Folders Section (Hidden when viewing inside a specific folder for cleaner focus) */}
      {!activeFolderFilter && (
        <div className="documents-folders-section" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Directories & Folders</h3>
          
          <div className="documents-folder-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {[...visibleFolders].sort((first, second) => first.name.localeCompare(second.name)).map((folder) => {
              const folderFiles = getFolderFiles(folder.name);
              const folderSize = folderFiles.reduce((total, file) => total + getSizeInMegabytes(file.size), 0);
              return (
                <div 
                  key={folder.id} 
                  className="documents-folder-card"
                  style={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '8px', color: '#0284c7' }}>
                      <Folder size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* Plus Button to add file directly to this folder */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openUploadDialog(folder.name);
                        }} 
                        title="Add file to folder"
                        style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0284c7' }}
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteFolder(e, folder.name)} 
                        title="Delete folder"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>
                    <button
                      type="button"
                      className="documents-folder-open"
                      onClick={() => setActiveFolderFilter(folder.name)}
                      aria-label={`Open ${folder.name}, ${folderFiles.length} ${folderFiles.length === 1 ? 'file' : 'files'}`}
                    >
                      {folder.name}
                    </button>
                  </h4>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                    {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'} • {formatSize(folderSize)}
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#94a3b8' }}>
                    <span>Updated: {folder.updated}</span>
                    <span style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>{folder.year}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Table Section */}
      <div className="documents-file-panel" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {activeFolderFilter ? `Files in "${activeFolderFilter}"` : 'All Files'}
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Showing {displayedFiles.length} documents</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="search"
                aria-label="Search files by name, folder, or category"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', width: '200px' }}
              />
            </div>

            <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
              <Filter size={13} color="#0284c7" />
              <select 
                value={selectedCategoryFilter} 
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '12px', color: '#334155' }}
              >
                <option value="All Categories">All Categories</option>
                <option value="Geological">Geological</option>
                <option value="Environmental">Environmental</option>
                <option value="Mining">Mining</option>
                <option value="Safety">Safety</option>
                <option value="Operations">Operations</option>
                <option value="Regulatory">Regulatory</option>
              </select>
            </div>

            <label className="documents-starred-filter">
              <input
                type="checkbox"
                checked={starredOnly}
                onChange={(event) => setStarredOnly(event.target.checked)}
              />
              <Star size={14} fill={starredOnly ? '#eab308' : 'none'} color={starredOnly ? '#ca8a04' : '#64748b'} />
              Starred
            </label>

            <label className="documents-sort-control">
              <span>Sort</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </label>

            <button type="button" className={`documents-archive-filter${showArchivedFiles ? ' is-active' : ''}`} aria-pressed={showArchivedFiles} onClick={() => {
              setShowArchivedFiles((current) => !current);
              setSelectedIds([]);
            }}>
              <Archive size={13} /> {showArchivedFiles ? 'Archived' : 'Show archived'} ({files.filter((file) => file.archived).length})
            </button>

            {(searchQuery || selectedCategoryFilter !== 'All Categories' || activeFolderFilter || starredOnly) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilter('All Categories');
                  setActiveFolderFilter(null);
                  setStarredOnly(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="documents-bulk-toolbar" role="region" aria-label="Selected document actions">
            <span>{selectedIds.length} selected</span>
            <button type="button" onClick={handleBulkDownload}><Download size={14} /> Download</button>
            <button type="button" onClick={handleBulkArchive}><Archive size={14} /> {showArchivedFiles ? 'Restore' : 'Archive'}</button>
            <button type="button" className="is-destructive" onClick={handleBulkDelete}><Trash2 size={14} /> Delete</button>
            <button type="button" className="documents-bulk-clear" onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
        )}

        {/* Table Headers */}
        <div className="documents-table-scroll">
        <div className="documents-table-row documents-table-heading" style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1.2fr 0.8fr 1fr 1fr 70px 120px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
          <div><input type="checkbox" aria-label="Select all visible documents" checked={allVisibleSelected} onChange={toggleSelectAll} /></div>
          <div>File Name</div>
          <div>Category / Folder</div>
          <div>Size</div>
          <div>Date Added</div>
          <div>Approval</div>
          <div>Starred</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Table Body */}
        <div className="documents-table-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
          {documentsLoading ? (
            <div className="documents-loading" role="status"><LoaderCircle size={16} className="documents-progress-spinner" /> Loading documents…</div>
          ) : displayedFiles.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              {showArchivedFiles ? 'No archived documents match these filters.' : 'No documents match these filters. Try changing your search or clearing the filters.'}
            </div>
          ) : (
            displayedFiles.map((file) => (
              <div key={file.id} className={`documents-table-row${selectedIds.some((id) => String(id) === String(file.id)) ? ' is-selected' : ''}`} style={{ display: 'grid', gridTemplateColumns: '40px 2.5fr 1.2fr 0.8fr 1fr 1fr 70px 120px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '12px' }}>
                <div>
                  <input
                    type="checkbox"
                    aria-label={`Select ${file.name}`}
                    checked={selectedIds.some((id) => String(id) === String(file.id))}
                    onChange={() => toggleDocumentSelection(file.id)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <button type="button" className="documents-file-name" onClick={() => openDocumentPanel(file)}>{file.title || file.name}</button>
                </div>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                    {file.folder}
                  </span>
                </div>
                <div style={{ color: '#334155' }}>{file.size}</div>
                <div style={{ color: '#64748b' }}>{file.added}</div>
                <div>
                  <span className={`documents-approval-status status-${(file.approvalStatus || 'Draft').toLowerCase().replaceAll(' ', '-')}`}>{file.approvalStatus || 'Draft'}</span>
                </div>
                <div>
                  <button
                    type="button"
                    className="documents-star-button"
                    onClick={() => toggleStarred(file.id)}
                    aria-label={file.starred ? `Remove ${file.name} from starred` : `Add ${file.name} to starred`}
                    aria-pressed={file.starred}
                    title={file.starred ? 'Remove from starred' : 'Add to starred'}
                  >
                    <Star size={15} color={file.starred ? '#eab308' : '#cbd5e1'} fill={file.starred ? '#eab308' : 'none'} />
                  </button>
                </div>
                <div className="documents-file-actions">
                  <button type="button" onClick={() => openDocumentPanel(file, 'preview')} aria-label={`Preview ${file.name}`} title="Preview document" className="documents-action-button">
                    <Eye size={14} />
                  </button>
                  <button type="button" onClick={() => openDocumentPanel(file, 'versions')} aria-label={`Version history for ${file.name}`} title="Version history" className="documents-action-button">
                    <History size={14} />
                  </button>
                  <button type="button" onClick={() => handleOpenEditFile(file)} aria-label={`Edit ${file.name}`} title="Edit file details" className="documents-action-button">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => handleDeleteFile(file.id)} aria-label={`Delete ${file.name}`} title="Delete file" className="documents-action-button is-destructive">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

      </div>

      {/* --- MODAL: New Folder --- */}
      {isNewFolderOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="documents-modal" style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Create New Folder</h3>
              <button
                type="button"
                className="documents-modal-close"
                aria-label="Close new folder dialog"
                onClick={() => setIsNewFolderOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Folder Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q4 Safety Audits" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsNewFolderOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button className="workspace-primary-action" type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Create Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingFile && (
        <div className="documents-modal-backdrop">
          <div className="documents-modal" role="dialog" aria-modal="true" aria-labelledby="edit-file-title">
            <div className="documents-modal-heading">
              <div>
                <h3 id="edit-file-title">Edit file details</h3>
                <p>Update this file’s saved details. The stored document contents are not changed.</p>
              </div>
              <button
                type="button"
                className="documents-modal-close"
                aria-label="Close edit file dialog"
                onClick={() => setEditingFile(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditFileSubmit} className="documents-edit-form">
              <label htmlFor="edit-document-name">File name</label>
              <input
                id="edit-document-name"
                type="text"
                required
                value={editedFileName}
                onChange={(event) => setEditedFileName(event.target.value)}
              />
              <label htmlFor="edit-document-folder">Folder</label>
              <select
                id="edit-document-folder"
                value={editedFileFolder}
                onChange={(event) => setEditedFileFolder(event.target.value)}
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.name}>{folder.name}</option>
                ))}
              </select>
              <label htmlFor="edit-document-category">Category</label>
              <select
                id="edit-document-category"
                value={editedFileCategory}
                onChange={(event) => setEditedFileCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <label htmlFor="edit-document-project">Project / mine</label>
              <input
                id="edit-document-project"
                list="document-project-options"
                value={editedFileProject}
                onChange={(event) => setEditedFileProject(event.target.value)}
                placeholder="Link to a project or mine"
              />
              <label htmlFor="edit-document-description">Description</label>
              <textarea
                id="edit-document-description"
                rows="3"
                value={editedFileDescription}
                onChange={(event) => setEditedFileDescription(event.target.value)}
              />
              <label htmlFor="edit-document-tags">Tags (comma-separated)</label>
              <input
                id="edit-document-tags"
                value={editedFileTags}
                onChange={(event) => setEditedFileTags(event.target.value)}
                placeholder="e.g. borehole, strata, approved"
              />
              <div className="documents-modal-actions">
                <button type="button" className="documents-secondary-action" onClick={() => setEditingFile(null)}>Cancel</button>
                <button type="submit" className="workspace-primary-action">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && uploadProgress === null) cancelUpload();
        }}>
          <div className="documents-modal documents-upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-document-title">
            <div className="documents-modal-heading">
              <div>
                <h3 id="upload-document-title">Upload Document</h3>
                <p>Files are temporary in this browser prototype and are not sent to permanent storage.</p>
              </div>
              <button type="button" className="documents-modal-close" aria-label="Close upload dialog" onClick={cancelUpload} disabled={uploadProgress !== null}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="documents-upload-form">
              <label className={`documents-upload-picker${isDraggingFiles ? ' is-dragging' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setIsDraggingFiles(true); }}
                onDragLeave={() => setIsDraggingFiles(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(false);
                  handleUploadFileSelection(event.dataTransfer.files);
                }}
              >
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.zip,.jpg,.jpeg,.png,.webp"
                  aria-label="Select one or more documents to upload"
                  onChange={(event) => {
                    handleUploadFileSelection(event.target.files);
                    event.target.value = '';
                  }}
                />
                <Upload size={24} color="#0284c7" />
                <span>{selectedUploadFiles.length ? `${selectedUploadFiles.length} file(s) selected` : 'Drop documents here or click to browse'}</span>
                <small>PDF, Excel, Word, CSV, ZIP, or image · Maximum 25 MB per file</small>
              </label>

              {selectedUploadFiles.length > 0 && (
                <ul className="documents-upload-file-list" aria-label="Selected upload files">
                  {selectedUploadFiles.map((file) => (
                    <li key={`${file.name}-${file.lastModified}`}>
                      <FileText size={14} />
                      <span>{file.name} · {formatSize(file.size / (1024 * 1024))}</span>
                      <button type="button" aria-label={`Remove ${file.name}`} onClick={() => {
                        setSelectedUploadFiles((currentFiles) => currentFiles.filter((selected) => selected !== file));
                        setUploadError('');
                      }}><X size={13} /></button>
                    </li>
                  ))}
                </ul>
              )}

              {selectedUploadFiles.length === 1 && (
                <>
                  <label htmlFor="upload-document-title-input">Document title</label>
                  <input id="upload-document-title-input" type="text" required value={fileNameInput} onChange={(event) => setFileNameInput(event.target.value)} />
                </>
              )}

              <div className="documents-upload-fields">
                <label>Folder
                  <select required value={uploadTargetFolder} onChange={(event) => setUploadTargetFolder(event.target.value)}>
                    <option value="">Select folder</option>
                    {folders.map((folder) => <option key={folder.id} value={folder.name}>{folder.name}</option>)}
                  </select>
                </label>
                <label>Category
                  <select required value={uploadMetadata.category} onChange={(event) => setUploadMetadata((current) => ({ ...current, category: event.target.value }))}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label>Project / mine
                  <input list="document-project-options" value={uploadMetadata.project} onChange={(event) => setUploadMetadata((current) => ({ ...current, project: event.target.value }))} placeholder="Optional project" />
                </label>
                <label>Document type
                  <input value={uploadMetadata.type} onChange={(event) => setUploadMetadata((current) => ({ ...current, type: event.target.value }))} placeholder="e.g. Borehole log" />
                </label>
                <label className="documents-upload-wide">Description
                  <textarea rows="2" value={uploadMetadata.description} onChange={(event) => setUploadMetadata((current) => ({ ...current, description: event.target.value }))} placeholder="Purpose, mine area, or report summary" />
                </label>
                <label className="documents-upload-wide">Tags
                  <input value={uploadMetadata.tags} onChange={(event) => setUploadMetadata((current) => ({ ...current, tags: event.target.value }))} placeholder="Comma-separated tags" />
                </label>
              </div>

              {uploadError && <p className="documents-form-error" role="alert">{uploadError}</p>}
              {uploadProgress !== null && (
                <div className="documents-upload-progress" role="status">
                  <div><LoaderCircle size={14} className="documents-progress-spinner" /> Registering files locally <span>{uploadProgress}%</span></div>
                  <progress value={uploadProgress} max="100" />
                </div>
              )}
              <div className="documents-modal-actions">
                <button type="button" className="documents-secondary-action" onClick={cancelUpload}>Cancel</button>
                <button className="workspace-primary-action" type="submit" disabled={uploadProgress !== null || !selectedUploadFiles.length}>
                  {uploadProgress !== null ? 'Processing…' : `Upload ${selectedUploadFiles.length || ''} File${selectedUploadFiles.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {documentPanel && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDocumentPanel(null);
        }}>
          <section className="documents-modal documents-details-modal" role="dialog" aria-modal="true" aria-labelledby="document-details-title">
            <div className="documents-modal-heading">
              <div>
                <h3 id="document-details-title">{documentPanel.title || documentPanel.name}</h3>
                <p>{documentPanel.category} · {documentPanel.fileType || getExtension(documentPanel.name).toUpperCase()} · Version {documentPanel.version}</p>
              </div>
              <button type="button" className="documents-modal-close" aria-label="Close document details" onClick={() => setDocumentPanel(null)}><X size={18} /></button>
            </div>

            <nav className="documents-panel-tabs" aria-label="Document details sections">
              {[
                ['details', 'Details'],
                ['preview', 'Preview'],
                ['versions', 'Versions'],
                ['review', 'Review & comments'],
              ].map(([section, label]) => (
                <button type="button" key={section} className={panelSection === section ? 'is-active' : ''} aria-current={panelSection === section ? 'page' : undefined}
                  onClick={() => { setPanelSection(section); setPanelVersion(''); setPreviewUrl(''); setPreviewError(''); setPreviewRows([]); }}>
                  {label}
                </button>
              ))}
            </nav>
            <input ref={versionInputRef} className="documents-visually-hidden" type="file" accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.zip,.jpg,.jpeg,.png,.webp" aria-label="Select replacement document version" onChange={handleNewVersionSelection} />

            {panelSection === 'details' && (
              <>
                <dl className="documents-detail-grid">
                  {[
                    ['File name', documentPanel.name],
                    ['File type', documentPanel.fileType || getExtension(documentPanel.name).toUpperCase()],
                    ['Document type', documentPanel.type],
                    ['File size', documentPanel.size],
                    ['Category', documentPanel.category],
                    ['Project / mine', documentPanel.project || 'Not linked'],
                    ['Uploaded by', documentPanel.uploadedBy],
                    ['Upload date', displayDate(documentPanel.uploadedAt)],
                    ['Last modified', displayDate(documentPanel.modifiedAt)],
                    ['Current version', documentPanel.version],
                    ['Approval status', documentPanel.approvalStatus],
                    ['Tags', documentPanel.tags || 'None'],
                    ['Folder', documentPanel.folder],
                  ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not recorded'}</dd></div>)}
                  <div className="documents-detail-description"><dt>Description</dt><dd>{documentPanel.description || 'No description provided.'}</dd></div>
                </dl>
                <div className="documents-panel-actions">
                  <button type="button" className="workspace-primary-action" onClick={() => {
                    setPanelSection('preview'); setPanelVersion(''); setPreviewUrl(''); setPreviewError(''); setPreviewRows([]);
                  }}><Eye size={14} /> Preview</button>
                  <button type="button" className="documents-secondary-action" onClick={() => downloadCurrentDocument()}><Download size={14} /> Download</button>
                  <button type="button" className="documents-secondary-action" onClick={() => setPanelSection('versions')}><History size={14} /> Versions</button>
                  <button type="button" className="documents-secondary-action" onClick={() => {
                    setDocumentPanel(null);
                    handleOpenEditFile(documentPanel);
                  }}><Pencil size={14} /> Edit metadata</button>
                  {['Draft', 'Rejected'].includes(documentPanel.approvalStatus) && <button type="button" className="documents-secondary-action" onClick={submitForReview}>{documentPanel.approvalStatus === 'Rejected' ? 'Resubmit for review' : 'Submit for review'}</button>}
                  {!documentPanel.archived && <button type="button" className="documents-secondary-action" onClick={async () => {
                    try {
                      const updated = await documentService.archiveDocument(documentPanel.id, true);
                      updateDocumentState(updated);
                      showToast('Document archived.');
                    } catch (error) { showToast(error.message || 'Document could not be archived.'); }
                  }}><Archive size={14} /> Archive</button>}
                  {documentPanel.archived && <button type="button" className="documents-secondary-action" onClick={async () => {
                    try {
                      updateDocumentState(await documentService.archiveDocument(documentPanel.id, false));
                      showToast('Document restored.');
                    } catch (error) { showToast(error.message || 'Document could not be restored.'); }
                  }}><RotateCcw size={14} /> Restore</button>}
                </div>
                <section className="documents-history-summary">
                  <h4>Approval history</h4>
                  {(documentPanel.approvalHistory || []).length ? documentPanel.approvalHistory.map((entry, index) => (
                    <p key={`${entry.status}-${entry.at}-${index}`}><strong>{entry.status}</strong> · {entry.by} · {displayDate(entry.at)}{entry.comment ? ` — ${entry.comment}` : ''}</p>
                  )) : <p>No review actions have been recorded.</p>}
                </section>
              </>
            )}

            {panelSection === 'preview' && (
              <div className="documents-preview-content">
                <div className="documents-preview-toolbar">
                  <span>{panelVersion ? `Version ${panelVersion}` : `Version ${documentPanel.version}`} · {documentPanel.name}</span>
                  <div>
                    <button type="button" className="documents-secondary-action" aria-label="Previous document" disabled={previewDocumentIndex <= 0} onClick={() => movePreviewDocument(-1)}><ChevronLeft size={14} /></button>
                    <button type="button" className="documents-secondary-action" aria-label="Next document" disabled={previewDocumentIndex < 0 || previewDocumentIndex >= displayedFiles.length - 1} onClick={() => movePreviewDocument(1)}><ChevronRight size={14} /></button>
                    <button type="button" className="documents-secondary-action" onClick={() => downloadCurrentDocument(panelVersion)}><Download size={14} /> Download</button>
                  </div>
                </div>
                {previewError && <div className="documents-preview-unavailable" role="status"><FileText size={24} /><p>{previewError}</p></div>}
                {previewUrl && ['jpg', 'jpeg', 'png', 'webp'].includes(getExtension(documentPanel.name)) && <img className="documents-image-preview" src={previewUrl} alt={`Preview of ${documentPanel.name}`} />}
                {previewUrl && getExtension(documentPanel.name) === 'pdf' && <iframe className="documents-pdf-preview" title={`Preview of ${documentPanel.name}`} src={previewUrl} />}
                {previewRows.length > 0 && (
                  <div className="documents-spreadsheet-preview" role="region" aria-label="Spreadsheet preview">
                    <table><tbody>{previewRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => rowIndex === 0
                        ? <th key={`cell-${cellIndex}`}>{cell || ''}</th>
                        : <td key={`cell-${cellIndex}`}>{cell || ''}</td>)}</tr>
                    ))}</tbody></table>
                    <small>Showing up to 200 rows and 20 columns.</small>
                  </div>
                )}
              </div>
            )}

            {panelSection === 'versions' && (
              <div className="documents-versions-panel">
                <div className="documents-version-actions-top">
                  <span>Current version: <strong>{documentPanel.version}</strong></span>
                  <button type="button" className="workspace-primary-action" onClick={() => versionInputRef.current?.click()}><Upload size={13} /> Upload new version</button>
                </div>
                <div className="documents-version-compare">
                  <label htmlFor="compare-document-version">Compare version with current</label>
                  <select id="compare-document-version" value={panelVersion} onChange={(event) => setPanelVersion(event.target.value)}>
                    <option value="">Choose a previous version</option>
                    {(documentPanel.versions || []).filter((version) => version.version !== documentPanel.version).map((version) => (
                      <option key={version.version} value={version.version}>Version {version.version}</option>
                    ))}
                  </select>
                </div>
                {panelVersion && (() => {
                  const previous = documentPanel.versions.find((version) => version.version === panelVersion);
                  if (!previous) return null;
                  return <div className="documents-version-comparison"><strong>Metadata comparison</strong><span>Current: v{documentPanel.version} · {documentPanel.name} · {documentPanel.size}</span><span>Selected: v{previous.version} · {previous.name || documentPanel.name} · {previous.size ? formatSize(previous.size / (1024 * 1024)) : documentPanel.size}</span></div>;
                })()}
                <ul className="documents-version-list">
                  {(documentPanel.versions || []).map((version) => (
                    <li key={`${documentPanel.id}-${version.version}`} className={version.version === documentPanel.version ? 'is-current' : ''}>
                      <div><strong>Version {version.version}{version.version === documentPanel.version ? ' · Current' : ''}</strong><span>{version.uploadedBy} · {displayDate(version.uploadedAt)}</span><small>{version.description || 'No version note'}</small></div>
                      <div className="documents-version-actions">
                        <button type="button" className="documents-secondary-action" onClick={() => {
                          setPanelSection('preview');
                          setPanelVersion(version.version);
                          setPreviewUrl('');
                          setPreviewError('');
                          setPreviewRows([]);
                        }}>View</button>
                        <button type="button" className="documents-secondary-action" onClick={() => downloadCurrentDocument(version.version)} aria-label={`Download version ${version.version}`}><Download size={13} /></button>
                        {version.version !== documentPanel.version && <button type="button" className="documents-secondary-action" onClick={() => restoreVersion(version.version)}><RotateCcw size={13} /> Restore</button>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {panelSection === 'review' && (
              <div className="documents-review-panel">
                <div className="documents-review-status">
                  <span>Current status</span><strong className={`documents-approval-status status-${documentPanel.approvalStatus.toLowerCase().replaceAll(' ', '-')}`}>{documentPanel.approvalStatus}</strong>
                </div>
                <label htmlFor="document-review-comment">Reviewer comment</label>
                <textarea id="document-review-comment" rows="3" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Add review feedback or a reason for rejection" />
                <div className="documents-panel-actions">
                  {['Draft', 'Rejected'].includes(documentPanel.approvalStatus) && <button type="button" className="workspace-primary-action" onClick={submitForReview}>{documentPanel.approvalStatus === 'Rejected' ? 'Resubmit for review' : 'Submit for review'}</button>}
                  {documentPanel.approvalStatus === 'Pending Review' && <>
                    <button type="button" className="workspace-primary-action" onClick={() => updateApproval('approve')}><Check size={14} /> Approve</button>
                    <button type="button" className="documents-reject-action" onClick={() => updateApproval('reject')}><XCircle size={14} /> Reject</button>
                  </>}
                </div>
                <section className="documents-history-summary">
                  <h4>Review history</h4>
                  {(documentPanel.approvalHistory || []).length ? documentPanel.approvalHistory.map((entry, index) => (
                    <p key={`${entry.status}-${entry.at}-${index}`}><strong>{entry.status}</strong> · {entry.by} · {displayDate(entry.at)}{entry.comment ? ` — ${entry.comment}` : ''}</p>
                  )) : <p>No review history yet.</p>}
                </section>
                <section className="documents-comments-section">
                  <h4><MessageSquare size={15} /> Comments ({documentPanel.comments?.length || 0})</h4>
                  {(documentPanel.comments || []).map((comment) => (
                    <article key={comment.id} className="documents-comment"><strong>{comment.author}</strong><time>{displayDate(comment.at)}</time><p>{comment.text}</p></article>
                  ))}
                  <form onSubmit={addReviewComment}>
                    <label className="sr-only" htmlFor="new-document-comment">Add a comment</label>
                    <textarea id="new-document-comment" rows="2" required value={newDocumentComment} onChange={(event) => setNewDocumentComment(event.target.value)} placeholder="Add a reviewer comment" />
                    <button type="submit" className="workspace-primary-action">Add comment</button>
                  </form>
                </section>
              </div>
            )}
          </section>
        </div>
      )}

    </div>
  );
}

export default Documents;