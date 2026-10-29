import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Folder, FileText, Plus, Upload, Trash2, Search,
  Star, Filter, X, CheckCircle2, ArrowLeft, Pencil
} from 'lucide-react';
import { defaultFiles, defaultFolders, loadDocumentLibrary, saveDocumentLibrary } from '../data/documentLibrary';
import './Documents.css';

const getSizeInMegabytes = (size) => Number.parseFloat(size) || 0;

const formatSize = (size) => `${size.toFixed(1)} MB`;

function Documents() {
  const [searchParams] = useSearchParams();
  const [initialLibrary] = useState(loadDocumentLibrary);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState('newest');
  const [starredOnly, setStarredOnly] = useState(false);
  const [activeFolderFilter, setActiveFolderFilter] = useState(null); // null means viewing all root files
  const [toastMessage, setToastMessage] = useState(initialLibrary.error);

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileName, setEditedFileName] = useState('');
  const [editedFileFolder, setEditedFileFolder] = useState('');

  const [folders, setFolders] = useState(() => initialLibrary.folders || defaultFolders);
  const [files, setFiles] = useState(() => initialLibrary.files || defaultFiles);

  useEffect(() => {
    const handleStorageError = () => {
      setToastMessage('Document changes could not be saved in this browser.');
    };
    window.addEventListener('carbonexa-document-library-save-error', handleStorageError);
    return () => window.removeEventListener('carbonexa-document-library-save-error', handleStorageError);
  }, []);

  useEffect(() => {
    try {
      saveDocumentLibrary(folders, files);
    } catch {
      window.dispatchEvent(new Event('carbonexa-document-library-save-error'));
    }
  }, [files, folders]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const getFolderFiles = (folderName) => files.filter((file) => file.folder === folderName);

  // Handle Delete File
  const handleDeleteFile = (id) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
    showToast('File deleted successfully.');
  };

  const handleOpenEditFile = (file) => {
    setEditingFile(file);
    setEditedFileName(file.name);
    setEditedFileFolder(file.folder);
  };

  const handleEditFileSubmit = (event) => {
    event.preventDefault();
    const fileName = editedFileName.trim();
    if (!editingFile || !fileName || !folders.some((folder) => folder.name === editedFileFolder)) {
      showToast('Enter a file name and choose a valid folder.');
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

    setFiles((currentFiles) => currentFiles.map((file) => (
      file.id === editingFile.id ? { ...file, name: fileName, folder: editedFileFolder } : file
    )));
    setFolders((currentFolders) => currentFolders.map((folder) => (
      folder.name === editedFileFolder || folder.name === editingFile.folder
        ? { ...folder, updated: 'Today' }
        : folder
    )));
    setEditingFile(null);
    showToast('File details updated.');
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

  const handleUploadFileSelection = (file) => {
    if (!file) return;
    setSelectedUploadFile(file);
    setFileNameInput(file.name);
  };

  // Handle Upload File Submit
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!fileNameInput.trim() || !uploadTargetFolder || !folders.some((folder) => folder.name === uploadTargetFolder)) {
      showToast('Choose a valid folder and enter a file name.');
      return;
    }

    const newFileObj = {
      id: Date.now(),
      name: fileNameInput.trim().includes('.') ? fileNameInput.trim() : `${fileNameInput.trim()}.pdf`,
      folder: uploadTargetFolder,
      category: uploadTargetFolder.includes('Geological') ? 'Geological'
        : uploadTargetFolder.includes('Environmental') ? 'Environmental'
          : uploadTargetFolder.includes('Safety') ? 'Safety'
            : uploadTargetFolder.includes('Mining') ? 'Mining' : 'Operations',
      size: selectedUploadFile
        ? formatSize(selectedUploadFile.size / (1024 * 1024))
        : '5.4 MB',
      added: 'Today',
      starred: false
    };

    setFiles((currentFiles) => [newFileObj, ...currentFiles]);

    setFolders((currentFolders) => currentFolders.map((folder) => (
      folder.name === uploadTargetFolder ? { ...folder, updated: 'Today' } : folder
    )));

    setFileNameInput('');
    setSelectedUploadFile(null);
    setIsUploadOpen(false);
    showToast(`File added to "${uploadTargetFolder}" successfully.`);
  };

  const displayedFiles = files.filter((file) => {
    const matchesFolder = activeFolderFilter ? file.folder === activeFolderFilter : true;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = [file.name, file.folder, file.category]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesCategory = selectedCategoryFilter === 'All Categories' || file.category === selectedCategoryFilter;
    const matchesStarred = !starredOnly || file.starred;
    return matchesFolder && matchesSearch && matchesCategory && matchesStarred;
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

  const toggleStarred = (fileId) => {
    setFiles((currentFiles) => currentFiles.map((file) => (
      file.id === fileId ? { ...file, starred: !file.starred } : file
    )));
  };

  return (
    <div className="workspace-page documents-page" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '30px', background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

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
              onClick={() => {
                setUploadTargetFolder(activeFolderFilter || folders[0]?.name || 'Geological Surveys');
                setSelectedUploadFile(null);
                setFileNameInput('');
                setIsUploadOpen(true);
              }}
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
                          setUploadTargetFolder(folder.name);
                          setSelectedUploadFile(null);
                          setFileNameInput('');
                          setIsUploadOpen(true);
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

        {/* Table Headers */}
        <div className="documents-table-scroll">
        <div className="documents-table-row documents-table-heading" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 70px 80px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
          <div>File Name</div>
          <div>Category / Folder</div>
          <div>Size</div>
          <div>Date Added</div>
          <div>Starred</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Table Body */}
        <div className="documents-table-body" style={{ display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
          {displayedFiles.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No documents match these filters. Try changing your search or clearing the filters.
            </div>
          ) : (
            displayedFiles.map((file) => (
              <div key={file.id} className="documents-table-row" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 70px 80px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: '500', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                </div>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                    {file.folder}
                  </span>
                </div>
                <div style={{ color: '#334155' }}>{file.size}</div>
                <div style={{ color: '#64748b' }}>{file.added}</div>
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
                <p>Rename this file or move it to another folder.</p>
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
              <div className="documents-modal-actions">
                <button type="button" className="documents-secondary-action" onClick={() => setEditingFile(null)}>Cancel</button>
                <button type="submit" className="workspace-primary-action">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Upload File --- */}
      {isUploadOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="documents-modal" style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Upload Document</h3>
              <button
                type="button"
                className="documents-modal-close"
                aria-label="Close upload dialog"
                onClick={() => setIsUploadOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Select Folder Destination</label>
                <select 
                  value={uploadTargetFolder}
                  onChange={(e) => setUploadTargetFolder(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.name}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>File Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Survey_Report_2026.pdf" 
                  value={fileNameInput}
                  onChange={(e) => setFileNameInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <label
                className="documents-upload-picker"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleUploadFileSelection(event.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.zip"
                  aria-label="Select a document to upload"
                  onChange={(event) => handleUploadFileSelection(event.target.files[0])}
                />
                <Upload size={24} color="#0284c7" />
                <span>{selectedUploadFile ? selectedUploadFile.name : 'Drop a document here or click to browse'}</span>
                <small>
                  {selectedUploadFile
                    ? `${formatSize(selectedUploadFile.size / (1024 * 1024))} · You can edit the file name above`
                    : 'PDF, Excel, Word, CSV, or ZIP'}
                </small>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsUploadOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button className="workspace-primary-action" type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Documents;