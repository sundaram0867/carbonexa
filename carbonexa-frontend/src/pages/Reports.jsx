import { useState } from 'react';
import { 
  FileText, CheckCircle2, Clock, FileEdit, Plus, Download, 
  Search, BarChart2, PieChart, ArrowUpRight, X, Trash2, Calendar 
} from 'lucide-react';

function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState('All');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // New Report Form State
  const [reportName, setReportName] = useState('');
  const [reportCategory, setReportCategory] = useState('Geological');
  const [reportProject, setReportProject] = useState('Jharia Block');

  const [reportsList, setReportsList] = useState([
    { 
      id: 1, 
      name: 'Geological Survey Report', 
      desc: 'Detailed geological assessment and survey data', 
      project: 'Jharia Block', 
      category: 'Geological', 
      updated: '28 Sep 2026', 
      year: '2026',
      month: 'Sep',
      owner: 'Prathamesh Tripathi', 
      initials: 'PT', 
      status: 'Approved' 
    },
    { 
      id: 2, 
      name: 'Monthly Production Report', 
      desc: 'Production data and operational summary', 
      project: 'Bokaro Project', 
      category: 'Mining', 
      updated: '26 Sep 2026', 
      year: '2026',
      month: 'Sep',
      owner: 'Anuradha Kulkarni', 
      initials: 'AK', 
      status: 'In Review' 
    },
    { 
      id: 3, 
      name: 'Environmental Impact Assessment', 
      desc: 'EIA report and compliance details', 
      project: 'North Karanpura', 
      category: 'Environmental', 
      updated: '24 Sep 2026', 
      year: '2026',
      month: 'Sep',
      owner: 'Prathamesh Tripathi', 
      initials: 'PT', 
      status: 'Approved' 
    },
    { 
      id: 4, 
      name: 'Safety Compliance Audit', 
      desc: 'Safety audit and risk analysis', 
      project: 'Talcher Coalfield', 
      category: 'Safety', 
      updated: '22 Aug 2025', 
      year: '2025',
      month: 'Aug',
      owner: 'Rohit Tiwari', 
      initials: 'RT', 
      status: 'Draft' 
    },
    { 
      id: 5, 
      name: 'Hydrogeological Analysis', 
      desc: 'Groundwater and hydrological study', 
      project: 'Ib Valley', 
      category: 'Geological', 
      updated: '20 Dec 2024', 
      year: '2024',
      month: 'Dec',
      owner: 'Vaishnavi Deshmukh', 
      initials: 'VD', 
      status: 'In Review' 
    },
  ]);

  const [recentExports, setRecentExports] = useState([
    { name: 'Production_Report_Sep2026.pdf', time: '2 hours ago', size: '12.4 MB' },
    { name: 'EIA_Summary_Q3.xlsx', time: '5 hours ago', size: '4.8 MB' },
    { name: 'Safety_Audit_Aug2025.pdf', time: '1 day ago', size: '6.1 MB' },
    { name: 'Geological_Data_Export.zip', time: '2 days ago', size: '25.3 MB' },
  ]);

  const reportTemplates = [
    { name: 'Geological Survey Report', desc: 'Standard geological analysis template', category: 'Geological' },
    { name: 'Production Report', desc: 'Monthly production summary', category: 'Mining' },
    { name: 'Environmental Report', desc: 'EIA and compliance template', category: 'Environmental' },
    { name: 'Safety Audit Report', desc: 'Safety and risk assessment', category: 'Safety' },
    { name: 'Hydrogeological Report', desc: 'Groundwater and hydrology analysis', category: 'Geological' },
  ];

  const monthsData = [
    { name: 'Jan', val: 45, count: 12 },
    { name: 'Feb', val: 60, count: 15 },
    { name: 'Mar', val: 75, count: 22 },
    { name: 'Apr', val: 55, count: 14 },
    { name: 'May', val: 65, count: 18 },
    { name: 'Jun', val: 80, count: 25 },
    { name: 'Jul', val: 90, count: 30 },
    { name: 'Aug', val: 70, count: 20 },
    { name: 'Sep', val: 95, count: 42 },
    { name: 'Oct', val: 60, count: 16 },
    { name: 'Nov', val: 75, count: 21 },
    { name: 'Dec', val: 85, count: 28 },
  ];

  // Handle Delete Report
  const handleDeleteReport = (id) => {
    setReportsList(reportsList.filter(rep => rep.id !== id));
  };

  // Handle Generate Report Form Submit
  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!reportName) return;

    const newReport = {
      id: Date.now(),
      name: reportName,
      desc: 'Newly generated operational report',
      project: reportProject,
      category: reportCategory,
      updated: '02 Oct 2026',
      year: '2026',
      month: 'Oct',
      owner: 'Prathamesh Tripathi',
      initials: 'PT',
      status: 'In Review'
    };

    setReportsList([newReport, ...reportsList]);

    const newExport = {
      name: `${reportName.replace(/\s+/g, '_')}_2026.pdf`,
      time: 'Just now',
      size: '5.2 MB'
    };
    setRecentExports([newExport, ...recentExports]);

    setIsGenerateOpen(false);
    setReportName('');
  };

  // Filter Reports logic (Search + Category + Status + Month + Year)
  const filteredReports = reportsList.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchQuery.toLowerCase()) || rep.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || rep.category === selectedCategory;
    const matchesStatus = selectedStatusFilter === 'All' || rep.status === selectedStatusFilter;
    const matchesMonth = !selectedMonthFilter || rep.month === selectedMonthFilter;
    const matchesYear = selectedYearFilter === 'All' || rep.year === selectedYearFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMonth && matchesYear;
  });

  const approvedCount = reportsList.filter(r => r.status === 'Approved').length;
  const inReviewCount = reportsList.filter(r => r.status === 'In Review').length;
  const draftCount = reportsList.filter(r => r.status === 'Draft').length;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Approved</span>;
      case 'In Review': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>In Review</span>;
      case 'Draft': return <span style={{ background: '#fae8ff', color: '#9333ea', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Draft</span>;
      default: return null;
    }
  };

  const getCategoryBadge = (cat) => {
    switch(cat) {
      case 'Geological': return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Geological</span>;
      case 'Mining': return <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Mining</span>;
      case 'Environmental': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Environmental</span>;
      case 'Safety': return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Safety</span>;
      default: return null;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>Reports</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Reports</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Create, review and export mining, geological and environmental reports.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setIsGenerateOpen(true)}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={16} /> Generate Report
            </button>
            <button style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Total Reports</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{reportsList.length}</h2>
          </div>
          <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '8px', color: '#0284c7' }}><FileText size={20} /></div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Approved</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{approvedCount}</h2>
          </div>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', color: '#16a34a' }}><CheckCircle2 size={20} /></div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>In Review</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{inReviewCount}</h2>
          </div>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', color: '#d97706' }}><Clock size={20} /></div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Drafts</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{draftCount}</h2>
          </div>
          <div style={{ background: '#fae8ff', padding: '10px', borderRadius: '8px', color: '#9333ea' }}><FileEdit size={20} /></div>
        </div>
      </div>

      {/* Middle Section: Charts & Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '24px', marginBottom: '24px' }}>
        
        {/* Interactive Report Activity Chart Box */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={16} color="#0284c7" /> Report Activity 
                {selectedMonthFilter && <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px' }}>({selectedMonthFilter})</span>}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Click any month bar to filter by month</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingBottom: '5px', borderBottom: '1px solid #f1f5f9', marginTop: '10px' }}>
            {monthsData.map((m, i) => {
              const isSelected = selectedMonthFilter === m.name;
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedMonthFilter(isSelected ? null : m.name)}
                  title={`${m.name}: ${m.count} reports`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '12px', 
                    height: `${m.val}%`, 
                    background: isSelected ? '#0369a1' : '#bae6fd', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'background 0.2s' 
                  }}></div>
                  <span style={{ fontSize: '9px', color: isSelected ? '#0284c7' : '#64748b', fontWeight: isSelected ? '700' : '400' }}>{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Pie Chart Status Box */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={16} color="#0284c7" /> Report Status <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: '400' }}>(Click legend)</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Distribution of reports by status</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '145px', marginTop: '5px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#16a34a 0% 66.7%, #d97706 66.7% 87.1%, #9333ea 87.1% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '65px', height: '65px', background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{reportsList.length}</span>
                <span style={{ fontSize: '8px', color: '#64748b' }}>Total</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div 
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Approved' ? 'All' : 'Approved')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', background: selectedStatusFilter === 'Approved' ? '#dcfce7' : 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}><span style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%' }}></span> Approved</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{approvedCount}</span>
              </div>

              <div 
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'In Review' ? 'All' : 'In Review')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', background: selectedStatusFilter === 'In Review' ? '#fef3c7' : 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}><span style={{ width: '8px', height: '8px', background: '#d97706', borderRadius: '50%' }}></span> In Review</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{inReviewCount}</span>
              </div>

              <div 
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Draft' ? 'All' : 'Draft')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', background: selectedStatusFilter === 'Draft' ? '#fae8ff' : 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}><span style={{ width: '8px', height: '8px', background: '#9333ea', borderRadius: '50%' }}></span> Drafts</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{draftCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Templates Box */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Report Templates</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reportTemplates.map((tpl, i) => (
              <div 
                key={i} 
                onClick={() => {
                  setReportName(tpl.name);
                  setReportCategory(tpl.category);
                  setIsGenerateOpen(true);
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>{tpl.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{tpl.desc}</div>
                  </div>
                </div>
                <ArrowUpRight size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lower Section: All Reports & Recent Exports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* All Reports Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              All Reports 
              {selectedStatusFilter !== 'All' && <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px' }}>Status: {selectedStatusFilter}</span>}
              {selectedYearFilter !== 'All' && <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px' }}>Year: {selectedYearFilter}</span>}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', height: '34px', gap: '8px' }}>
                <Search size={14} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '140px', color: '#0f172a' }} 
                />
              </div>

              {/* Category Filter */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All">All Categories</option>
                <option value="Geological">Geological</option>
                <option value="Mining">Mining</option>
                <option value="Environmental">Environmental</option>
                <option value="Safety">Safety</option>
              </select>

              {/* Year / Date Filter */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', height: '34px', gap: '6px' }}>
                <Calendar size={14} color="#0284c7" />
                <select 
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* Reset */}
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatusFilter('All'); setSelectedMonthFilter(null); setSelectedYearFilter('All'); }}
                style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#0284c7', cursor: 'pointer', fontWeight: '500' }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 1.2fr 90px 50px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#64748b', alignItems: 'center' }}>
            <div>Report Name</div>
            <div>Project / Mine</div>
            <div>Category</div>
            <div>Updated</div>
            <div>Owner</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            {filteredReports.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No reports found matching your criteria.
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div 
                  key={rep.id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 90px 1.2fr 90px 50px', 
                    padding: '14px 20px', 
                    borderBottom: '1px solid #f1f5f9', 
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <FileText size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{rep.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rep.desc}</div>
                    </div>
                  </div>

                  <div style={{ color: '#334155', fontSize: '12px' }}>{rep.project}</div>
                  <div>{getCategoryBadge(rep.category)}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{rep.updated}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {rep.initials}
                    </div>
                    <span style={{ fontSize: '12px', color: '#334155' }}>{rep.owner}</span>
                  </div>

                  <div>{getStatusBadge(rep.status)}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      onClick={() => handleDeleteReport(rep.id)}
                      title="Delete report"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#ef4444', display: 'flex' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Recent Exports Sidebar */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Recent Exports</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentExports.map((exp, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Download size={15} color="#0284c7" style={{ flexShrink: '0' }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{exp.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{exp.time} • {exp.size}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- MODAL: Generate Report --- */}
      {isGenerateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Generate New Report</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsGenerateOpen(false)} />
            </div>

            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Report Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q3 Carbon Footprint Analysis" 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Category</label>
                <select 
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="Geological">Geological</option>
                  <option value="Mining">Mining</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Project / Mine</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jharia Block" 
                  value={reportProject}
                  onChange={(e) => setReportProject(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsGenerateOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Generate & Export</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;