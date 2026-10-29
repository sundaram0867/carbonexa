import { useState } from 'react';
import { 
  FileText, CheckCircle2, Clock, FileEdit, Plus, Download, 
  Search, BarChart2, PieChart, ArrowUpRight, X, Trash2, Calendar 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const reportStatusData = [
    { name: 'Approved', value: approvedCount, color: '#168a78' },
    { name: 'In Review', value: inReviewCount, color: '#d99b37' },
    { name: 'Draft', value: draftCount, color: '#8b79c9' },
  ];
  const peakMonth = monthsData.reduce((peak, month) => (month.count > peak.count ? month : peak), monthsData[0]);
  const selectedActivityMonth = monthsData.find((month) => month.name === selectedMonthFilter);

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
    <div className="workspace-page reports-page" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>Reports</span>
        </div>
        <div className="workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Reports</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Create, review and export mining, geological and environmental reports.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="workspace-primary-action"
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
      <div className="workspace-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
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
      <div className="reports-feature-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '24px', marginBottom: '24px' }}>
        
        <section className="reports-chart-panel">
          <div className="reports-chart-heading">
            <div>
              <h2><BarChart2 size={17} /> Report Activity</h2>
              <p>Reports created by month</p>
            </div>
            <select
              aria-label="Filter reports by month"
              className="reports-chart-select"
              value={selectedMonthFilter || 'All'}
              onChange={(event) => setSelectedMonthFilter(event.target.value === 'All' ? null : event.target.value)}
            >
              <option value="All">All months</option>
              {monthsData.map((month) => <option key={month.name} value={month.name}>{month.name}</option>)}
            </select>
          </div>
          <div className="reports-activity-chart" role="img" aria-label="Monthly report activity bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={monthsData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                onClick={(event) => {
                  if (typeof event?.activeTooltipIndex === 'number') {
                    const month = monthsData[event.activeTooltipIndex]?.name;
                    if (month) setSelectedMonthFilter(selectedMonthFilter === month ? null : month);
                  }
                }}
              >
                <defs>
                  <linearGradient id="reportsActivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35b69a" />
                    <stop offset="100%" stopColor="#146c6c" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8eff2" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#718497', fontSize: 10 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#8a9aaa', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(22, 138, 120, 0.08)' }}
                  contentStyle={{ border: '1px solid #dce6ee', borderRadius: '10px', boxShadow: '0 8px 24px rgba(23, 50, 75, 0.12)' }}
                  formatter={(value) => [`${value} reports`, 'Activity']}
                />
                <Bar dataKey="count" name="Reports" radius={[7, 7, 2, 2]} maxBarSize={24}>
                  {monthsData.map((month) => (
                    <Cell key={month.name} fill={selectedMonthFilter === month.name ? '#e5a84b' : 'url(#reportsActivityGradient)'} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          <div className="reports-chart-footnote">
            <span><i /> {selectedActivityMonth ? `${selectedActivityMonth.count} reports in ${selectedActivityMonth.name}` : `Peak month · ${peakMonth.name}`}</span>
            <strong>{selectedActivityMonth ? selectedActivityMonth.count : peakMonth.count}<small> reports</small></strong>
          </div>
        </section>

        <section className="reports-chart-panel reports-status-panel">
          <div className="reports-chart-heading">
            <div>
              <h2><PieChart size={17} /> Report Status</h2>
              <p>Distribution across your report library</p>
            </div>
          </div>
          <div className="reports-status-visual">
            <div className="reports-status-chart" role="img" aria-label="Report status distribution donut chart">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={reportStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={77} paddingAngle={4} stroke="none">
                    {reportStatusData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                        opacity={selectedStatusFilter === 'All' || selectedStatusFilter === item.name ? 1 : 0.38}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: '1px solid #dce6ee', borderRadius: '10px', boxShadow: '0 8px 24px rgba(23, 50, 75, 0.12)' }}
                    formatter={(value, name) => [`${value} reports`, name]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="reports-status-center" aria-hidden="true">
                <strong>{reportsList.length}</strong><span>Total</span>
              </div>
            </div>
            <div className="reports-status-legend" aria-label="Filter reports by status">
              {reportStatusData.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  aria-pressed={selectedStatusFilter === item.name}
                  className={selectedStatusFilter === item.name ? 'active' : ''}
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === item.name ? 'All' : item.name)}
                >
                  <span><i style={{ backgroundColor: item.color }} />{item.name}</span>
                  <strong>{item.value}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

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
      <div className="reports-lower-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
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
          <div className="reports-table-grid-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 1.2fr 90px 50px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#64748b', alignItems: 'center' }}>
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
                  className="reports-table-grid-row"
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
                <button className="workspace-primary-action" type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Generate & Export</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;