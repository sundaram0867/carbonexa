import { useState } from 'react';
import { 
  Folder, FileText, Plus, Upload, Trash2, Search, 
  Star, Calendar, Filter, X, CheckCircle2, ChevronRight, ArrowLeft 
} from 'lucide-react';

function Documents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [activeFolderFilter, setActiveFolderFilter] = useState(null); // null means viewing all root files
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');

  // Folders State
  const [folders, setFolders] = useState([
    { id: 1, name: 'Geological Surveys', fileCount: 3, size: '42 MB', updated: '29 Sep 2026', year: '2026' },
    { id: 2, name: 'Environmental Compliance', fileCount: 2, size: '36 MB', updated: '24 Sep 2026', year: '2026' },
    { id: 3, name: 'Mining Operations Q3', fileCount: 0, size: '0 MB', updated: '15 Sep 2026', year: '2026' },
    { id: 4, name: 'Safety & Risk Audits', fileCount: 1, size: '54 MB', updated: '12 Aug 2025', year: '2025' },
    { id: 5, name: 'Historical Archive 2024', fileCount: 1, size: '45 MB', updated: '15 Dec 2024', year: '2024' },
  ]);

  // Files State
  const [files, setFiles] = useState([
    { id: 1, name: 'Jharia_Block_Survey_Final.pdf', folder: 'Geological Surveys', category: 'Geological', size: '14.2 MB', added: '28 Sep 2026', starred: true },
    { id: 2, name: 'Mineral_Composition_Report.pdf', folder: 'Geological Surveys', category: 'Geological', size: '18.5 MB', added: '29 Sep 2026', starred: false },
    { id: 3, name: 'Core_Sample_Analysis_v2.xlsx', folder: 'Geological Surveys', category: 'Geological', size: '9.3 MB', added: '22 Sep 2026', starred: true },
    { id: 4, name: 'Water_Table_Analysis_Q3.xlsx', folder: 'Environmental Compliance', category: 'Environmental', size: '8.5 MB', added: '25 Sep 2026', starred: false },
    { id: 5, name: 'Air_Quality_Monitoring_Log.pdf', folder: 'Environmental Compliance', category: 'Environmental', size: '27.5 MB', added: '24 Sep 2026', starred: true },
    { id: 6, name: 'Bokaro_Excavation_Log.docx', folder: 'Mining Operations Q3', category: 'Mining', size: '4.1 MB', added: '22 Sep 2026', starred: false },
    { id: 7, name: 'Talcher_Safety_Inspection.pdf', folder: 'Safety & Risk Audits', category: 'Safety', size: '6.3 MB', added: '18 Aug 2025', starred: true },
    { id: 8, name: 'Carbonexa_Compliance_2024.zip', folder: 'Historical Archive 2024', category: 'Environmental', size: '45.0 MB', added: '10 Dec 2024', starred: false },
  ]);

  // Handle Delete File
  const handleDeleteFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
    setToastMessage('File deleted successfully.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Delete Folder
  const handleDeleteFolder = (e, folderName) => {
    e.stopPropagation();
    setFolders(folders.filter(f => f.name !== folderName));
    setFiles(files.filter(f => f.folder !== folderName));
    if (activeFolderFilter === folderName) setActiveFolderFilter(null);
    setToastMessage(`Folder "${folderName}" and its contents deleted.`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Create New Folder
  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolderObj = {
      id: Date.now(),
      name: newFolderName.trim(),
      fileCount: 0,
      size: '0 MB',
      updated: 'Today',
      year: '2026'
    };

    setFolders([...folders, newFolderObj]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
    setToastMessage(`Folder "${newFolderObj.name}" created successfully!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Upload File Submit
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!fileNameInput.trim() || !uploadTargetFolder) return;

    const newFileObj = {
      id: Date.now(),
      name: fileNameInput.trim().endsWith('.pdf') || fileNameInput.trim().endsWith('.xlsx') || fileNameInput.trim().endsWith('.docx') ? fileNameInput.trim() : fileNameInput.trim() + '.pdf',
      folder: uploadTargetFolder,
      category: uploadTargetFolder.includes('Geological') ? 'Geological' : uploadTargetFolder.includes('Environmental') ? 'Environmental' : 'Operations',
      size: '5.4 MB',
      added: 'Today',
      starred: false
    };

    setFiles([newFileObj, ...files]);

    // Update folder file count & size
    setFolders(folders.map(f => {
      if (f.name === uploadTargetFolder) {
        return { ...f, fileCount: f.fileCount + 1, updated: 'Today' };
      }
      return f;
    }));

    setFileNameInput('');
    setIsUploadOpen(false);
    setToastMessage(`File uploaded to "${uploadTargetFolder}" successfully!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Filter files based on active folder, search query, and category filter
  const displayedFiles = files.filter(file => {
    const matchesFolder = activeFolderFilter ? file.folder === activeFolderFilter : true;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All Categories' || file.category === selectedCategoryFilter;
    return matchesFolder && matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '30px', background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
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
              onClick={() => {
                setUploadTargetFolder(activeFolderFilter || folders[0]?.name || 'Geological Surveys');
                setIsUploadOpen(true);
              }}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Upload size={16} /> Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Directories & Folders Section (Hidden when viewing inside a specific folder for cleaner focus) */}
      {!activeFolderFilter && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Directories & Folders</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {folders.map((folder) => {
              const folderFileCount = files.filter(f => f.folder === folder.name).length;
              return (
                <div 
                  key={folder.id} 
                  onClick={() => setActiveFolderFilter(folder.name)}
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
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

                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>{folder.name}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                    {folderFileCount} files • {folder.size}
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
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
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
                type="text" 
                placeholder="Search file name..." 
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
              </select>
            </div>

            {(searchQuery || selectedCategoryFilter !== 'All Categories' || activeFolderFilter) && (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('All Categories'); setActiveFolderFilter(null); }}
                style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 70px 50px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
          <div>File Name</div>
          <div>Category / Folder</div>
          <div>Size</div>
          <div>Date Added</div>
          <div>Starred</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        {/* Table Body */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
          {displayedFiles.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No files found in this folder or matching your search.
            </div>
          ) : (
            displayedFiles.map((file) => (
              <div key={file.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 70px 50px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '12px' }}>
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
                  <Star size={15} color={file.starred ? '#eab308' : '#cbd5e1'} fill={file.starred ? '#eab308' : 'none'} style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDeleteFile(file.id)} title="Delete file" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* --- MODAL: New Folder --- */}
      {isNewFolderOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Create New Folder</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsNewFolderOpen(false)} />
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
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Create Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Upload File --- */}
      {isUploadOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Upload Document</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsUploadOpen(false)} />
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Select Folder Destination</label>
                <select 
                  value={uploadTargetFolder}
                  onChange={(e) => setUploadTargetFolder(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
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

              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', padding: '16px', textAlign: 'center', background: '#f8fafc' }}>
                <Upload size={24} color="#0284c7" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '12px', color: '#334155', display: 'block' }}>Drag & drop file here or click to browse</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsUploadOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Documents;