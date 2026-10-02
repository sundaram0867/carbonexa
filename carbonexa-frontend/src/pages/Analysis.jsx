import { useState } from 'react';
import { 
  Leaf, Truck, BarChart2, Plus, 
  Calendar, ChevronDown, Trash2, X, FileText, CheckCircle2 
} from 'lucide-react';

function Analysis() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('September 2026');
  const [selectedMineFilter, setSelectedMineFilter] = useState('All Mines');
  const [activeBarIndex, setActiveBarIndex] = useState(7); // Default to August
  const [activeGeoIndex, setActiveGeoIndex] = useState(0); // Default to first item (Coal)
  const [isGeoHovered, setIsGeoHovered] = useState(false);
  const [hoveredEnvCard, setHoveredEnvCard] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // New Analysis Form State
  const [analysisName, setAnalysisName] = useState('');
  const [analysisType, setAnalysisType] = useState('Production');
  const [analysisProject, setAnalysisProject] = useState('Jharia Block');

  const [analysisReports, setAnalysisReports] = useState([
    { 
      id: 1, 
      name: 'Monthly Production Analysis', 
      desc: 'Output trend and performance', 
      type: 'Production', 
      project: 'Bokaro Project', 
      generated: '28 Sep 2026', 
      status: 'Completed' 
    },
    { 
      id: 2, 
      name: 'Environmental Impact Analysis', 
      desc: 'Air, water and soil assessment', 
      type: 'Environmental', 
      project: 'North Karanpura', 
      generated: '25 Sep 2026', 
      status: 'Completed' 
    },
    { 
      id: 3, 
      name: 'Geological Survey Insights', 
      desc: 'Resource estimation and mapping', 
      type: 'Geological', 
      project: 'Jharia Block', 
      generated: '22 Sep 2026', 
      status: 'In Review' 
    },
  ]);

  const mineWiseData = [
    { name: 'Jharia Block', output: '28,560', change: '+12%', status: 'Active', trendUp: true },
    { name: 'Bokaro Project', output: '24,320', change: '+8%', status: 'Active', trendUp: true },
    { name: 'North Karanpura', output: '18,450', change: '-5%', status: 'Maintenance', trendUp: false },
    { name: 'Talcher Coalfield', output: '16,780', change: '+15%', status: 'Active', trendUp: true },
    { name: 'Ib Valley', output: '12,960', change: '-10%', status: 'Active', trendUp: false },
  ];

  const monthlyBars = [
    { month: 'Jan', val: 35, total: '24,100', coal: '16,000', overburden: '6,100', others: '2,000' },
    { month: 'Feb', val: 45, total: '31,200', coal: '21,000', overburden: '7,500', others: '2,700' },
    { month: 'Mar', val: 55, total: '36,800', coal: '24,500', overburden: '9,000', others: '3,300' },
    { month: 'Apr', val: 50, total: '33,500', coal: '22,200', overburden: '8,400', others: '2,900' },
    { month: 'May', val: 48, total: '32,100', coal: '21,400', overburden: '8,000', others: '2,700' },
    { month: 'Jun', val: 44, total: '29,800', coal: '19,900', overburden: '7,400', others: '2,500' },
    { month: 'Jul', val: 52, total: '35,000', coal: '23,400', overburden: '8,800', others: '2,800' },
    { month: 'Aug', val: 78, total: '42,560', coal: '28,340', overburden: '10,120', others: '4,100' },
    { month: 'Sep', val: 65, total: '38,900', coal: '25,800', overburden: '9,500', others: '3,600' },
  ];

  const geologicalData = [
    { name: 'Coal', percentage: '52%', volume: '6,47,712 t', color: '#1e3a8a' },
    { name: 'Overburden', percentage: '28%', volume: '3,47,968 t', color: '#0284c7' },
    { name: 'Sandstone', percentage: '12%', volume: '1,49,472 t', color: '#38bdf8' },
    { name: 'Shale', percentage: '6%', volume: '74,736 t', color: '#f97316' },
    { name: 'Others', percentage: '2%', volume: '24,672 t', color: '#a855f7' },
  ];

  // Handle Delete Report
  const handleDeleteReport = (id) => {
    setAnalysisReports(analysisReports.filter(rep => rep.id !== id));
    setToastMessage('Analysis report deleted successfully.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Handle Generate Analysis Submit
  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!analysisName) return;

    const newReport = {
      id: Date.now(),
      name: analysisName,
      desc: 'Comprehensive operational data review',
      type: analysisType,
      project: analysisProject,
      generated: 'Today',
      status: 'In Review'
    };

    setAnalysisReports([newReport, ...analysisReports]);
    setIsGenerateOpen(false);
    setAnalysisName('');
    setToastMessage('New analysis report generated successfully!');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Completed</span>;
      case 'In Review': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>In Review</span>;
      case 'Active': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Active</span>;
      case 'Maintenance': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Maintenance</span>;
      default: return null;
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'Production': return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Production</span>;
      case 'Environmental': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Environmental</span>;
      case 'Geological': return <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Geological</span>;
      default: return null;
    }
  };

  const activeBarData = monthlyBars[activeBarIndex];

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
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: '#0f172a', fontWeight: '500' }}>Analysis</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Analysis</h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Explore data insights, trends and visual analytics for mining and environmental operations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
              <Calendar size={14} color="#0284c7" /> 
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '12px', color: '#334155' }}
              >
                <option value="September 2026">01 Sep 2026 - 30 Sep 2026</option>
                <option value="August 2026">01 Aug 2026 - 31 Aug 2026</option>
                <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
              </select>
            </div>

            <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
              <Truck size={14} color="#0284c7" /> 
              <select 
                value={selectedMineFilter} 
                onChange={(e) => setSelectedMineFilter(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '12px', color: '#334155' }}
              >
                <option value="All Mines">All Mines</option>
                <option value="Jharia Block">Jharia Block</option>
                <option value="Bokaro Project">Bokaro Project</option>
                <option value="North Karanpura">North Karanpura</option>
              </select>
            </div>

            <button 
              onClick={() => setIsGenerateOpen(true)}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={16} /> Generate Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Total Mining Output</span>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0284c7' }}><Truck size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {selectedMineFilter === 'Jharia Block' ? '28,560' : selectedMineFilter === 'Bokaro Project' ? '24,320' : '1,24,560'}
            </h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 12% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>tonnes ({selectedTimeframe})</span>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>CO₂ Emissions</span>
            <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '6px', color: '#16a34a' }}><Leaf size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>8,456</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↓ 8% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>tonnes CO₂e</span>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Active Mines</span>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0284c7' }}><Truck size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>12</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 9% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>mines operational</span>
        </div>

        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Analysis Reports</span>
            <div style={{ background: '#fae8ff', padding: '8px', borderRadius: '6px', color: '#9333ea' }}><FileText size={18} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{analysisReports.length + 21}</h2>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>↑ 20% <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>vs last month</span></span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>total generated</span>
        </div>

      </div>

      {/* Middle Section: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Mining Output Trend Chart */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={16} color="#0284c7" /> Mining Output Trend (Click bars to inspect)
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Monthly output for {selectedMineFilter}</span>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Monthly <ChevronDown size={12} />
            </div>
          </div>

          {/* Interactive Floating Tooltip Box */}
          <div style={{ position: 'absolute', top: '75px', left: '38%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, fontSize: '11px' }}>
            <div style={{ color: '#64748b', marginBottom: '2px' }}>{activeBarData.month} 2026 Selected</div>
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Total: {activeBarData.total} tonnes</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', marginBottom: '2px' }}><span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '2px' }}></span> Coal <span style={{ marginLeft: 'auto', fontWeight: '600' }}>{activeBarData.coal}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', marginBottom: '2px' }}><span style={{ width: '8px', height: '8px', background: '#60a5fa', borderRadius: '2px' }}></span> Overburden <span style={{ marginLeft: 'auto', fontWeight: '600' }}>{activeBarData.overburden}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}><span style={{ width: '8px', height: '8px', background: '#cbd5e1', borderRadius: '2px' }}></span> Others <span style={{ marginLeft: 'auto', fontWeight: '600', color: '#0f172a' }}>{activeBarData.others}</span></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginTop: '20px' }}>
            {monthlyBars.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setActiveBarIndex(i)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '18px', 
                  height: `${item.val}%`, 
                  background: activeBarIndex === i ? '#0284c7' : '#bae6fd', 
                  borderRadius: '4px 4px 0 0', 
                  transform: activeBarIndex === i ? 'scaleY(1.08)' : 'scaleY(1)',
                  boxShadow: activeBarIndex === i ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}></div>
                <span style={{ fontSize: '10px', color: activeBarIndex === i ? '#0284c7' : '#64748b', fontWeight: activeBarIndex === i ? '700' : 'normal' }}>{item.month}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '11px', color: '#334155' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '50%' }}></span> Coal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#60a5fa', borderRadius: '50%' }}></span> Overburden</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#cbd5e1', borderRadius: '50%' }}></span> Others</span>
          </div>
        </div>

        {/* Geological Distribution Donut Chart */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
            Click or hover a chart segment or category to highlight it.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            
            {/* Donut Chart with Smooth Hover Scale Effect */}
            <div 
              onMouseEnter={() => setIsGeoHovered(true)}
              onMouseLeave={() => setIsGeoHovered(false)}
              style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                background: 'conic-gradient(#1e3a8a 0% 52%, #0284c7 52% 80%, #38bdf8 80% 92%, #f97316 92% 98%, #a855f7 98% 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                transform: isGeoHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isGeoHovered ? '0 10px 25px rgba(0,0,0,0.12)' : 'none',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              
              {/* Invisible Hover / Click Slices over the Ring */}
              <div onMouseEnter={() => setActiveGeoIndex(0)} onClick={() => setActiveGeoIndex(0)} style={{ position: 'absolute', top: 0, left: '50%', width: '75px', height: '75px', transformOrigin: 'bottom left', cursor: 'pointer' }}></div>
              <div onMouseEnter={() => setActiveGeoIndex(1)} onClick={() => setActiveGeoIndex(1)} style={{ position: 'absolute', top: 0, right: 0, width: '75px', height: '75px', transformOrigin: 'bottom left', cursor: 'pointer' }}></div>
              <div onMouseEnter={() => setActiveGeoIndex(2)} onClick={() => setActiveGeoIndex(2)} style={{ position: 'absolute', bottom: 0, right: 0, width: '75px', height: '75px', transformOrigin: 'top left', cursor: 'pointer' }}></div>
              <div onMouseEnter={() => setActiveGeoIndex(3)} onClick={() => setActiveGeoIndex(3)} style={{ position: 'absolute', bottom: 0, left: '50%', width: '75px', height: '75px', transformOrigin: 'top right', cursor: 'pointer' }}></div>
              <div onMouseEnter={() => setActiveGeoIndex(4)} onClick={() => setActiveGeoIndex(4)} style={{ position: 'absolute', bottom: 0, left: 0, width: '75px', height: '75px', transformOrigin: 'top right', cursor: 'pointer' }}></div>

              {/* Center Donut Hole displaying active breakdown cleanly */}
              <div style={{ width: '96px', height: '96px', background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', textAlign: 'center', padding: '6px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', lineHeight: '1.2' }}>{geologicalData[activeGeoIndex].name}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: geologicalData[activeGeoIndex].color, marginTop: '2px' }}>{geologicalData[activeGeoIndex].percentage}</span>
              </div>
            </div>

            {/* List Selection on Right with Click & Hover Support */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, marginLeft: '20px' }}>
              {geologicalData.map((item, idx) => (
                <div 
                  key={idx}
                  onMouseEnter={() => setActiveGeoIndex(idx)}
                  onClick={() => setActiveGeoIndex(idx)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    background: activeGeoIndex === idx ? '#f1f5f9' : '#f8fafc',
                    border: activeGeoIndex === idx ? '1px solid #0284c7' : '1px solid transparent',
                    cursor: 'pointer',
                    transform: activeGeoIndex === idx ? 'translateX(6px)' : 'translateX(0)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', fontWeight: '500' }}>
                    <span style={{ width: '9px', height: '9px', background: item.color, borderRadius: '50%', transform: activeGeoIndex === idx ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.2s' }}></span> 
                    {item.name}
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                    {item.percentage}
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '28px' }}>
            Select a category to highlight it
          </div>
        </div>

      </div>

      {/* Environmental Indicators Row */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0' }}>Environmental Indicators</h3>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Key environmental parameters across mines</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          
          {[
            { title: 'Air Quality (PM2.5)', val: '42', unit: 'μg/m³', trend: '↑ 15%' },
            { title: 'Water Quality Index', val: '78', unit: 'Good', trend: '↑ 6%' },
            { title: 'Vegetation Cover', val: '71%', unit: '', trend: '↑ 4%' },
            { title: 'Carbon Footprint', val: '8,456', unit: 'tCO₂e', trend: '↓ 8%' }
          ].map((env, idx) => (
            <div 
              key={idx}
              onMouseEnter={() => setHoveredEnvCard(idx)}
              onMouseLeave={() => setHoveredEnvCard(null)}
              style={{ 
                background: '#fff', 
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: hoveredEnvCard === idx ? '1px solid #0284c7' : '1px solid #e2e8f0', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                transform: hoveredEnvCard === idx ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredEnvCard === idx ? '0 8px 20px rgba(0, 132, 199, 0.12)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '11px', color: '#64748b' }}>{env.title}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{env.val}</span>
                  {env.unit && <span style={{ fontSize: '10px', color: '#64748b' }}>{env.unit}</span>}
                </div>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>{env.trend}</span>
              </div>
              <div style={{ height: '20px', background: '#f0fdf4', borderRadius: '4px', marginTop: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ 
                  width: hoveredEnvCard === idx ? '100%' : '75%', 
                  height: '100%', 
                  background: 'rgba(22, 163, 74, 0.2)', 
                  transition: 'width 0.4s ease' 
                }}></div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Lower Section: Recent Analysis Reports & Mine-wise Output */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Recent Analysis Reports Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Analysis Reports</h3>
            </div>
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '500', cursor: 'pointer' }}>View All</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1.2fr 90px 90px 40px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
            <div>Report Name</div>
            <div>Type</div>
            <div>Mine/Project</div>
            <div>Generated On</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
            {analysisReports.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No reports found.</div>
            ) : (
              analysisReports.map((rep) => (
                <div key={rep.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1.2fr 90px 90px 40px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FileText size={16} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{rep.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{rep.desc}</div>
                    </div>
                  </div>
                  <div>{getTypeBadge(rep.type)}</div>
                  <div style={{ color: '#334155' }}>{rep.project}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{rep.generated}</div>
                  <div>{getStatusBadge(rep.status)}</div>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDeleteReport(rep.id)} title="Delete" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mine-wise Output Table */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Mine-wise Output</h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Output comparison across active mines</span>
            </div>
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '500', cursor: 'pointer' }}>View All</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.1fr 90px', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
            <div>Mine Name</div>
            <div>Output (tonnes)</div>
            <div>Change</div>
            <div style={{ textAlign: 'right' }}>Status</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
            {mineWiseData.map((mine, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.1fr 90px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={15} color="#0284c7" />
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{mine.name}</span>
                </div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{mine.output}</div>
                <div style={{ color: mine.trendUp ? '#16a34a' : '#dc2626', fontWeight: '600', fontSize: '11px' }}>
                  {mine.change}
                </div>
                <div style={{ textAlign: 'right' }}>{getStatusBadge(mine.status)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- MODAL: Generate Analysis --- */}
      {isGenerateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Generate New Analysis</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsGenerateOpen(false)} />
            </div>

            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Analysis Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q3 Carbon Emission Audit" 
                  value={analysisName}
                  onChange={(e) => setAnalysisName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Category Type</label>
                <select 
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  <option value="Production">Production</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Geological">Geological</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Mine / Project</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jharia Block" 
                  value={analysisProject}
                  onChange={(e) => setAnalysisProject(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsGenerateOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Run Analysis</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Analysis;