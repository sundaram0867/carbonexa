import { useState } from 'react';
import { 
  Folder, FileText, Search, Star, 
  Trash2, X, Plus, HardDrive, 
  FileSpreadsheet, Image as ImageIcon, FileCode, SlidersHorizontal, CheckCircle2 
} from 'lucide-react';

function Archives() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All Archives');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // New Archive Form State
  const [newArchiveName, setNewArchiveName] = useState('');
  const [newArchiveType, setNewArchiveType] = useState('PDF');
  const [newArchiveProject, setNewArchiveProject] = useState('Jharia Coalfield');

  const [foldersList] = useState([
    { name: 'All Archives', count: 1248 },
    { name: 'Geological Reports', count: 240 },
    { name: 'Mining Operations', count: 186 },
    { name: 'Environmental Data', count: 142 },
    { name: 'Survey & Mapping', count: 98 },
    { name: 'Regulatory Documents', count: 76 },
    { name: 'Project Files', count: 64 },
    { name: 'Technical Drawings', count: 52 },
    { name: 'Research Papers', count: 45 },
    { name: 'Others', count: 145 },
  ]);

  const [archivesList, setArchivesList] = useState([
    { 
      id: 1, 
      name: 'Geological Survey Report 2024.pdf', 
      desc: 'Detailed geological survey and analysis', 
      type: 'PDF', 
      project: 'Jharia Coalfield', 
      owner: 'Prathamesh Tripathi', 
      initials: 'PT', 
      date: '30 Sep 2026', 
      size: '12.4 MB', 
      starred: true,
      folder: 'Geological Reports'
    },
    { 
      id: 2, 
      name: 'Monthly Production Data.xlsx', 
      desc: 'Monthly production and dispatch data', 
      type: 'Excel', 
      project: 'Bokaro', 
      owner: 'Anuradha Kulkarni', 
      initials: 'AK', 
      date: '28 Sep 2026', 
      size: '2.1 MB', 
      starred: false,
      folder: 'Mining Operations'
    },
    { 
      id: 3, 
      name: 'Mine Site Map.png', 
      desc: 'Site map with coordinates', 
      type: 'Image', 
      project: 'North Karanpura', 
      owner: 'Rohit Tiwari', 
      initials: 'RT', 
      date: '25 Sep 2026', 
      size: '5.6 MB', 
      starred: true,
      folder: 'Survey & Mapping'
    },
    { 
      id: 4, 
      name: 'Environmental Impact Report.docx', 
      desc: 'EIA and compliance details', 
      type: 'Word', 
      project: 'Talcher', 
      owner: 'Vaishnavi Deshmukh', 
      initials: 'VS', 
      date: '22 Sep 2026', 
      size: '3.8 MB', 
      starred: false,
      folder: 'Environmental Data'
    },
    { 
      id: 5, 
      name: 'Safety Audit Presentation.pptx', 
      desc: 'Q2 safety audit summary', 
      type: 'PPT', 
      project: 'Ib Valley', 
      owner: 'Siddhant Patil', 
      initials: 'SP', 
      date: '18 Sep 2026', 
      size: '6.4 MB', 
      starred: false,
      folder: 'Regulatory Documents'
    },
    { 
      id: 6, 
      name: 'Drilling Core Data.zip', 
      desc: 'Borehole and core sample data', 
      type: 'ZIP', 
      project: 'Mand-Raigarh', 
      owner: 'Anuradha Kulkarni', 
      initials: 'AK', 
      date: '15 Sep 2026', 
      size: '25.3 MB', 
      starred: false,
      folder: 'Project Files'
    },
    { 
      id: 7, 
      name: 'Topographic Map.jpg', 
      desc: 'High resolution topographic map', 
      type: 'Image', 
      project: 'All Projects', 
      owner: 'Prathamesh Tripathi', 
      initials: 'PT', 
      date: '10 Sep 2026', 
      size: '8.7 MB', 
      starred: true,
      folder: 'Survey & Mapping'
    },
    { 
      id: 8, 
      name: 'Regulatory Compliance Report.pdf', 
      desc: 'Statutory compliance documents', 
      type: 'PDF', 
      project: 'Jharia Coalfield', 
      owner: 'Vaishnavi Deshmukh', 
      initials: 'VS', 
      date: '05 Sep 2026', 
      size: '4.2 MB', 
      starred: false,
      folder: 'Regulatory Documents'
    },
  ]);

  // Handle Toggle Star
  const handleToggleStar = (id) => {
    setArchivesList(archivesList.map(item => item.id === id ? { ...item, starred: !item.starred } : item));
  };

  // Handle Delete Archive
  const handleDeleteArchive = (id) => {
    setArchivesList(archivesList.filter(item => item.id !== id));
    setToastMessage('Archive deleted successfully.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Add Archive Submit
  const handleAddArchiveSubmit = (e) => {
    e.preventDefault();
    if (!newArchiveName) return;

    const newItem = {
      id: Date.now(),
      name: newArchiveName.endsWith(`.${newArchiveType.toLowerCase()}`) ? newArchiveName : `${newArchiveName}.${newArchiveType.toLowerCase()}`,
      desc: 'Newly uploaded historical archive entry',
      type: newArchiveType,
      project: newArchiveProject,
      owner: 'Prathamesh Tripathi',
      initials: 'PT',
      date: 'Today',
      size: '5.1 MB',
      starred: false,
      folder: selectedFolder === 'All Archives' ? 'Geological Reports' : selectedFolder
    };

    setArchivesList([newItem, ...archivesList]);
    setIsUploadOpen(false);
    setNewArchiveName('');
    setToastMessage('Archive uploaded successfully!');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Filter Logic
  const filteredArchives = archivesList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'All Archives' || item.folder === selectedFolder;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesProject = selectedProject === 'All' || item.project === selectedProject;
    return matchesSearch && matchesFolder && matchesType && matchesProject;
  });

  // Dynamic Pagination calculation
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredArchives.length / itemsPerPage));
  const displayedArchives = filteredArchives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTypeBadge = (type) => {
    switch(type) {
      case 'PDF': return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>PDF</span>;
      case 'Excel': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Excel</span>;
      case 'Image': return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Image</span>;
      case 'Word': return <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Word</span>;
      case 'PPT': return <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>PPT</span>;
      case 'ZIP': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>ZIP</span>;
      default: return null;
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF': return <FileText size={16} color="#dc2626" />;
      case 'Excel': return <FileSpreadsheet size={16} color="#16a34a" />;
      case 'Image': return <ImageIcon size={16} color="#0284c7" />;
      default: return <FileCode size={16} color="#7c3aed" />;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '30px', background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>Archives</span>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '12px', padding: '24px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0' }}>Archives</h1>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.85, maxWidth: '600px' }}>
              Access and manage all historical documents, reports, datasets, maps and project files.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsUploadOpen(true)}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={16} /> Upload Archive
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Total Files</span>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0284c7' }}><FileText size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{archivesList.length + 1240}</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 12% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Folders</span>
            <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '6px', color: '#d97706' }}><Folder size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>86</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 8% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Datasets</span>
            <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '6px', color: '#16a34a' }}><FileSpreadsheet size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>24</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 5% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Maps & Drawings</span>
            <div style={{ background: '#fae8ff', padding: '8px', borderRadius: '6px', color: '#9333ea' }}><ImageIcon size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>312</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 18% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
        </div>

      </div>

      {/* Main Layout: Left Sidebar & Right Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Folders</span>
              <Plus size={15} color="#0284c7" style={{ cursor: 'pointer' }} onClick={() => setIsUploadOpen(true)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {foldersList.map((folder, idx) => {
                const isSelected = selectedFolder === folder.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => { setSelectedFolder(folder.name); setCurrentPage(1); }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '8px 10px', 
                      borderRadius: '6px', 
                      background: isSelected ? '#e0f2fe' : 'transparent', 
                      color: isSelected ? '#0369a1' : '#334155', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isSelected ? '600' : '500'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Folder size={15} color={isSelected ? '#0284c7' : '#94a3b8'} />
                      <span>{folder.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', background: isSelected ? '#bae6fd' : '#f1f5f9', padding: '2px 6px', borderRadius: '10px', color: isSelected ? '#0369a1' : '#64748b' }}>
                      {folder.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive size={16} color="#0284c7" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Storage Usage</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>42.8 GB of 100 GB Used</div>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '43%', height: '100%', background: '#0284c7', borderRadius: '4px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', fontWeight: '600', color: '#0284c7' }}>43%</div>
          </div>

        </div>

        {/* Right Content Area */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          
          {/* Search & Filter Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', height: '36px', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search archives..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All">Type: All</option>
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="Image">Image</option>
                <option value="Word">Word</option>
                <option value="PPT">PPT</option>
                <option value="ZIP">ZIP</option>
              </select>

              <select 
                value={selectedProject}
                onChange={(e) => { setSelectedProject(e.target.value); setCurrentPage(1); }}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '7px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All">Mine/Project: All</option>
                <option value="Jharia Coalfield">Jharia Coalfield</option>
                <option value="Bokaro">Bokaro</option>
                <option value="North Karanpura">North Karanpura</option>
                <option value="Talcher">Talcher</option>
                <option value="Ib Valley">Ib Valley</option>
              </select>

              <button 
                onClick={() => { setSearchQuery(''); setSelectedFolder('All Archives'); setSelectedType('All'); setSelectedProject('All'); setCurrentPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#0284c7', cursor: 'pointer', fontWeight: '500' }}
              >
                Clear
              </button>

              <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginLeft: '6px' }}>
                <button style={{ background: '#f1f5f9', border: 'none', padding: '7px', cursor: 'pointer' }}><SlidersHorizontal size={14} color="#334155" /></button>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '30px 2.5fr 1fr 1.2fr 1.2fr 90px 80px 40px 40px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#64748b', alignItems: 'center' }}>
            <div><input type="checkbox" /></div>
            <div>Name ↕</div>
            <div>Type</div>
            <div>Project/Mine</div>
            <div>Uploaded By</div>
            <div>Date ↕</div>
            <div>Size</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
            <div></div>
          </div>

          {/* Table Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
            {displayedArchives.length === 0 ? (
              <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No archived files found matching your criteria.
              </div>
            ) : (
              displayedArchives.map((item) => (
                <div 
                  key={item.id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '30px 2.5fr 1fr 1.2fr 1.2fr 90px 80px 40px 40px', 
                    padding: '13px 20px', 
                    borderBottom: '1px solid #f1f5f9', 
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <div><input type="checkbox" /></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    {getFileIcon(item.type)}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '500', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.desc}</div>
                    </div>
                  </div>

                  <div>{getTypeBadge(item.type)}</div>
                  <div style={{ fontSize: '12px', color: '#334155' }}>{item.project}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.initials}
                    </div>
                    <span style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.owner}</span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.date}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.size}</div>

                  <div style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleToggleStar(item.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: item.starred ? '#eab308' : '#cbd5e1' }}
                    >
                      <Star size={15} fill={item.starred ? '#eab308' : 'none'} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteArchive(item.id)}
                      title="Delete archive"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Fully Dynamic Pagination Footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>Showing {filteredArchives.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredArchives.length)} of {filteredArchives.length} files</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                &laquo;
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                &lsaquo;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button 
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{ 
                    background: currentPage === pageNum ? '#0284c7' : '#fff', 
                    color: currentPage === pageNum ? '#fff' : '#334155', 
                    border: '1px solid #cbd5e1', 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontWeight: currentPage === pageNum ? '600' : 'normal',
                    cursor: 'pointer' 
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                &rsaquo;
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                &raquo;
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* --- MODAL: Upload Archive --- */}
      {isUploadOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Upload to Archives</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsUploadOpen(false)} />
            </div>

            <form onSubmit={handleAddArchiveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>File Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Historical_Survey_2023.pdf" 
                  value={newArchiveName}
                  onChange={(e) => setNewArchiveName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>File Type</label>
                <select 
                  value={newArchiveType}
                  onChange={(e) => setNewArchiveType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="Image">Image</option>
                  <option value="Word">Word</option>
                  <option value="PPT">PPT</option>
                  <option value="ZIP">ZIP</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Project / Mine</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jharia Coalfield" 
                  value={newArchiveProject}
                  onChange={(e) => setNewArchiveProject(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsUploadOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Upload & Archive</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Archives;