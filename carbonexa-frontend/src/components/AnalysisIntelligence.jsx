import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { AlertTriangle, Download, FileDown, FlaskConical, Save, Sparkles } from 'lucide-react';
import { useAnalysisWorkspace } from '../hooks/useAnalysisWorkspace';
import { ANALYSIS_MINES } from '../data/analysisMockData';
import { exportPdf, exportRows } from '../utils/analysisExport';

const COLORS = ['#146c6c', '#168a78', '#4f9d98', '#8bbdb3', '#edaa56'];
const number = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
const metrics = [
  { id: 'actualTonnes', label: 'Actual production (t)', unit: 'tonnes', kind: 'sum' },
  { id: 'targetTonnes', label: 'Production target (t)', unit: 'tonnes', kind: 'sum' },
  { id: 'coalTonnes', label: 'Coal production (t)', unit: 'tonnes', kind: 'sum' },
  { id: 'overburdenTonnes', label: 'Overburden (t)', unit: 'tonnes', kind: 'sum' },
  { id: 'strippingRatio', label: 'Stripping ratio', unit: 'ratio', kind: 'average' },
  { id: 'achievement', label: 'Target achievement (%)', unit: '%', kind: 'average' },
  { id: 'productivity', label: 'Productivity (t/worker)', unit: 't/worker', kind: 'average' },
];
const periods = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
];
const chartTypes = ['bar', 'line', 'area', 'pie'];
const geologyMetrics = [
  ['resourceMt', 'Estimated resources (Mt)'], ['reserveMt', 'Proven reserves (Mt)'],
  ['averageDepthM', 'Average borehole depth (m)'], ['seamThicknessM', 'Seam thickness (m)'],
  ['gradePercent', 'Mineral grade (%)'], ['boreholeCount', 'Boreholes logged'],
];
const environmentMetrics = [
  ['pm25', 'PM2.5', 'μg/m³'], ['pm10', 'PM10', 'μg/m³'], ['ph', 'Water pH', 'pH'],
  ['turbidity', 'Turbidity', 'NTU'], ['dissolvedOxygen', 'Dissolved oxygen', 'mg/L'],
  ['co2Tonnes', 'CO₂ emissions', 'tCO₂e'], ['vegetationPercent', 'Vegetation cover', '%'],
];

const isoFor = (timeframe) => {
  if (timeframe === 'August 2026') return ['2026-08-01', '2026-08-31'];
  if (timeframe === 'Q3 2026') return ['2026-07-01', '2026-09-30'];
  if (timeframe === 'September 2026') return ['2026-01-01', '2026-09-30'];
  return ['2026-01-01', '2026-09-30'];
};

const labelFor = (row, period) => period === 'quarterly' ? row.quarter : period === 'yearly' ? row.year : row.month;
const aggregateProduction = (rows, period) => {
  const groups = new Map();
  rows.forEach((row) => {
    const label = labelFor(row, period);
    const current = groups.get(label) || { period: label, actualTonnes: 0, targetTonnes: 0, coalTonnes: 0, overburdenTonnes: 0, strippingRatio: 0, achievement: 0, productivity: 0, count: 0 };
    ['actualTonnes', 'targetTonnes', 'coalTonnes', 'overburdenTonnes'].forEach((key) => { current[key] += row[key]; });
    ['strippingRatio', 'achievement', 'productivity'].forEach((key) => { current[key] += row[key]; });
    current.count += 1;
    groups.set(label, current);
  });
  return [...groups.values()].map((row) => ({
    ...row,
    strippingRatio: Number((row.strippingRatio / row.count).toFixed(2)),
    achievement: Number((row.achievement / row.count).toFixed(1)),
    productivity: Math.round(row.productivity / row.count),
  }));
};

const Select = ({ label, value, onChange, options }) => (
  <label className="analysis-control"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => {
    const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
    return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
  })}</select></label>
);

const SectionTitle = ({ title, description, action }) => (
  <div className="analysis-intel-heading"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{action}</div>
);

const MultiMineSelect = ({ selectedIds, onToggle, label = 'Mines' }) => (
  <fieldset className="analysis-mine-picker"><legend>{label}</legend>
    {ANALYSIS_MINES.map((mine) => <label key={mine.id}><input type="checkbox" checked={selectedIds.includes(mine.id)} onChange={() => onToggle(mine.id)} />{mine.name}</label>)}
  </fieldset>
);

function AnalysisIntelligence({ initialMine, timeframe }) {
  const initialRange = isoFor(timeframe);
  const [dateFrom, setDateFrom] = useState(initialRange[0]);
  const [dateTo, setDateTo] = useState(initialRange[1]);
  const [selectedMineIds, setSelectedMineIds] = useState(initialMine === 'All Mines' ? ANALYSIS_MINES.map((mine) => mine.id) : [ANALYSIS_MINES.find((mine) => mine.name === initialMine)?.id || ANALYSIS_MINES[0].id]);
  const { overview, production, geology, environment, loading, error, operationError, compare, generate, getInsights } = useAnalysisWorkspace({ mineIds: selectedMineIds, dateFrom, dateTo });
  const [activeTab, setActiveTab] = useState('Production');
  const [productionMetric, setProductionMetric] = useState('actualTonnes');
  const [period, setPeriod] = useState('monthly');
  const [productionChart, setProductionChart] = useState('bar');
  const [productionView, setProductionView] = useState('targetActual');
  const [selectedProductionRow, setSelectedProductionRow] = useState(null);
  const [geologyMetric, setGeologyMetric] = useState('reserveMt');
  const [selectedGeologyMine, setSelectedGeologyMine] = useState(null);
  const [environmentMetric, setEnvironmentMetric] = useState('pm25');
  const [environmentChart, setEnvironmentChart] = useState('line');
  const [thresholds, setThresholds] = useState({});
  const [comparisonRows, setComparisonRows] = useState([]);
  const [customCategory, setCustomCategory] = useState('Production');
  const [customMetrics, setCustomMetrics] = useState(['actualTonnes', 'targetTonnes']);
  const [customChart, setCustomChart] = useState('bar');
  const [customResult, setCustomResult] = useState(null);
  const [savedConfigurations, setSavedConfigurations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('carbonexa-analysis-configurations') || '[]'); } catch { return []; }
  });
  const [insights, setInsights] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('carbonexa-analysis-configurations', JSON.stringify(savedConfigurations)); } catch { /* configuration save remains in memory for this session */ }
  }, [savedConfigurations]);

  const filteredProduction = useMemo(() => production.filter((row) => row.date >= dateFrom && row.date <= dateTo), [production, dateFrom, dateTo]);
  const productionSummary = useMemo(() => aggregateProduction(filteredProduction, period), [filteredProduction, period]);
  const productionRows = useMemo(() => {
    if (productionView !== 'mineComparison') return productionSummary;
    return selectedMineIds.map((mineId) => {
      const mineRows = filteredProduction.filter((row) => row.mineId === mineId);
      const mine = ANALYSIS_MINES.find((item) => item.id === mineId);
      const total = (field) => mineRows.reduce((sum, row) => sum + row[field], 0);
      return { period: mine?.name || mineId, actualTonnes: total('actualTonnes'), targetTonnes: total('targetTonnes'), coalTonnes: total('coalTonnes'), overburdenTonnes: total('overburdenTonnes'), achievement: mineRows.length ? Number((mineRows.reduce((sum, row) => sum + row.achievement, 0) / mineRows.length).toFixed(1)) : 0, strippingRatio: mineRows.length ? Number((mineRows.reduce((sum, row) => sum + row.strippingRatio, 0) / mineRows.length).toFixed(2)) : 0, productivity: mineRows.length ? Math.round(mineRows.reduce((sum, row) => sum + row.productivity, 0) / mineRows.length) : 0 };
    });
  }, [filteredProduction, productionSummary, productionView, selectedMineIds]);
  const comparisonRowsForExport = useMemo(() => comparisonRows.map((row) => ({
    Mine: row.mine, 'Actual (t)': row.actualTonnes, 'Target (t)': row.targetTonnes,
    'Achievement (%)': row.achievement, 'Variance (t)': row.actualTonnes - row.targetTonnes,
    'CO₂ emissions (tCO₂e)': row.co2Tonnes, 'Reserves (Mt)': row.reserveMt,
  })), [comparisonRows]);

  const envRecords = useMemo(() => environment.records.filter((row) => row.date >= dateFrom && row.date <= dateTo), [environment.records, dateFrom, dateTo]);
  const envChartData = useMemo(() => {
    const rows = new Map();
    envRecords.forEach((record) => {
      const current = rows.get(record.month) || { period: record.month };
      if (selectedMineIds.length > 1) current[record.mine] = record[environmentMetric];
      else current[environmentMetric] = record[environmentMetric];
      rows.set(record.month, current);
    });
    return [...rows.values()];
  }, [envRecords, environmentMetric, selectedMineIds.length]);
  const threshold = thresholds[environmentMetric] ?? environment.thresholds?.[environmentMetric];
  const recentEnvRecords = envRecords.filter((row) => row[environmentMetric] !== undefined);
  const latestEnvValue = recentEnvRecords.at(-1)?.[environmentMetric];
  const thresholdMarkers = !threshold ? null : threshold.direction === 'range' ? <>
    {threshold.warningLow !== undefined && <ReferenceLine y={threshold.warningLow} stroke="#d97706" strokeDasharray="4 3" label="Warning low" />}
    {threshold.warningHigh !== undefined && <ReferenceLine y={threshold.warningHigh} stroke="#d97706" strokeDasharray="4 3" label="Warning high" />}
    {threshold.criticalLow !== undefined && <ReferenceLine y={threshold.criticalLow} stroke="#dc2626" strokeDasharray="4 3" label="Critical low" />}
    {threshold.criticalHigh !== undefined && <ReferenceLine y={threshold.criticalHigh} stroke="#dc2626" strokeDasharray="4 3" label="Critical high" />}
  </> : <>
    {threshold.warning !== undefined && <ReferenceLine y={threshold.warning} stroke="#d97706" strokeDasharray="4 3" label="Warning" />}
    {threshold.critical !== undefined && <ReferenceLine y={threshold.critical} stroke="#dc2626" strokeDasharray="4 3" label="Critical" />}
  </>;
  const thresholdStatus = (metric, value) => {
    const setting = thresholds[metric] ?? environment.thresholds?.[metric];
    if (!setting || value === undefined) return 'Normal';
    if (setting.direction === 'range') {
      if (value <= (setting.criticalLow ?? -Infinity) || value >= (setting.criticalHigh ?? Infinity)) return 'Critical';
      if (value <= (setting.warningLow ?? -Infinity) || value >= (setting.warningHigh ?? Infinity)) return 'Warning';
      return 'Normal';
    }
    if (setting.direction === 'below') return value <= setting.critical ? 'Critical' : value <= setting.warning ? 'Warning' : 'Normal';
    return value >= setting.critical ? 'Critical' : value >= setting.warning ? 'Warning' : 'Normal';
  };

  const anomalyList = useMemo(() => {
    const findings = [];
    const grouped = new Map();
    filteredProduction.forEach((row) => {
      if (!grouped.has(row.mineId)) grouped.set(row.mineId, []);
      grouped.get(row.mineId).push(row);
    });
    grouped.forEach((rows) => {
      const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date));
      for (let index = 1; index < ordered.length; index += 1) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        const change = ((current.actualTonnes - previous.actualTonnes) / previous.actualTonnes) * 100;
        if (change <= -15 || change >= 20) findings.push({ type: change < 0 ? 'Production decrease' : 'Production increase', mine: current.mine, period: current.month, reason: `Actual output changed ${change > 0 ? '+' : ''}${change.toFixed(1)}% from ${previous.month}; demonstration rule threshold is a 15% decrease or 20% increase.` });
      }
    });
    envRecords.forEach((row) => {
      ['pm25', 'pm10', 'ph', 'turbidity', 'dissolvedOxygen', 'co2Tonnes'].forEach((metric) => {
        const status = thresholdStatus(metric, row[metric]);
        if (status !== 'Normal') findings.push({ type: `Environmental ${status.toLowerCase()}`, mine: row.mine, period: row.month, reason: `${(environment.thresholds?.[metric]?.label || metric)} measured ${row[metric]} ${environment.thresholds?.[metric]?.unit || ''}; exceeds the configured ${status.toLowerCase()} rule.` });
      });
    });
    const emissionGroups = new Map();
    envRecords.forEach((row) => {
      if (!emissionGroups.has(row.mineId)) emissionGroups.set(row.mineId, []);
      emissionGroups.get(row.mineId).push(row);
    });
    emissionGroups.forEach((rows) => {
      const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date));
      for (let index = 1; index < ordered.length; index += 1) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        const change = ((current.co2Tonnes - previous.co2Tonnes) / previous.co2Tonnes) * 100;
        if (Math.abs(change) >= 20) findings.push({ type: 'Unusual emissions change', mine: current.mine, period: current.month, reason: `CO₂ emissions changed ${change > 0 ? '+' : ''}${change.toFixed(1)}% from ${previous.month}; demonstration rule threshold is a 20% month over month change.` });
      }
    });
    geology.forEach((row) => {
      if (row.reserveMt > row.resourceMt) findings.push({ type: 'Geological consistency check', mine: row.mine, period: 'Current', reason: `Reported reserve (${row.reserveMt} Mt) is greater than estimated resource (${row.resourceMt} Mt).` });
    });
    return findings.slice(0, 24);
  // thresholdStatus intentionally reads user-configured local threshold values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProduction, envRecords, geology, thresholds, environment.thresholds]);

  const toggleMine = (mineId) => {
    setComparisonRows([]);
    setSelectedMineIds((current) => current.includes(mineId)
      ? current.filter((id) => id !== mineId)
      : [...current, mineId]);
  };
  const exportCurrent = (format) => {
    let rows = productionRows.map((row) => ({ Period: row.period, Actual: row.actualTonnes, Target: row.targetTonnes, 'Achievement (%)': row.achievement, 'Coal (t)': row.coalTonnes, 'Overburden (t)': row.overburdenTonnes, 'Stripping ratio': row.strippingRatio, 'Productivity (t/worker)': row.productivity }));
    let title = 'Production analytics';
    if (activeTab === 'Geological') { rows = geology.map((row) => ({ Mine: row.mine, 'Resources (Mt)': row.resourceMt, 'Reserves (Mt)': row.reserveMt, 'Boreholes': row.boreholeCount, 'Mean depth (m)': row.averageDepthM, 'Seam thickness (m)': row.seamThicknessM, 'Grade (%)': row.gradePercent })); title = 'Geological analytics'; }
    if (activeTab === 'Environmental') { rows = envRecords.map((row) => ({ Mine: row.mine, Month: row.month, PM2_5: row.pm25, PM10: row.pm10, pH: row.ph, Turbidity: row.turbidity, DissolvedOxygen: row.dissolvedOxygen, CO2: row.co2Tonnes, Vegetation: row.vegetationPercent })); title = 'Environmental monitoring'; }
    if (activeTab === 'Compare') { rows = comparisonRowsForExport; title = 'Mine comparison'; }
    return format === 'pdf' ? exportPdf(rows, title) : exportRows(rows, `carbonexa-${activeTab.toLowerCase()}-${Date.now()}`, format === 'excel' ? 'xls' : 'csv', title);
  };

  const generateComparison = async () => setComparisonRows(await compare({ mineIds: selectedMineIds, dateFrom, dateTo, metrics: ['actualTonnes', 'targetTonnes', 'co2Tonnes', 'reserveMt'] }));
  const generateCustom = async (event) => {
    event.preventDefault();
    setCustomResult(await generate({ mineIds: selectedMineIds, category: customCategory, metrics: customMetrics, dateFrom, dateTo, chartType: customChart }));
  };
  const saveConfiguration = () => {
    const configuration = { id: `saved-${Date.now()}`, name: `${customCategory} · ${customMetrics.length} metric${customMetrics.length === 1 ? '' : 's'}`, mineIds: selectedMineIds, category: customCategory, metrics: customMetrics, dateFrom, dateTo, chartType: customChart, savedAt: new Date().toISOString() };
    setSavedConfigurations((current) => [configuration, ...current].slice(0, 10));
  };
  const loadInsights = async () => setInsights(await getInsights());
  const selectedMineNames = selectedMineIds.map((id) => ANALYSIS_MINES.find((mine) => mine.id === id)?.name).filter(Boolean);
  const geoSelected = geology.find((row) => row.mineId === selectedGeologyMine) || geology[0];
  const selectedMetricInfo = metrics.find((item) => item.id === productionMetric) || metrics[0];
  const customOptions = customCategory === 'Geological' ? geologyMetrics.map(([id, label]) => [id, label]) : customCategory === 'Environmental' ? environmentMetrics.map(([id, label]) => [id, label]) : metrics.map(({ id, label }) => [id, label]);

  const renderCustomResultChart = () => {
    const resultRows = customResult?.rows || [];
    const metric = customResult?.configuration?.metrics?.[0];
    if (!resultRows.length || !metric) return null;
    if (customResult.configuration.chartType === 'pie') {
      return <PieChart><Pie data={resultRows} dataKey={metric} nameKey="mine" innerRadius="45%" outerRadius="76%">{resultRows.map((row, index) => <Cell key={`${row.mine}-${row.period}-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>;
    }
    const series = customResult.configuration.chartType === 'line'
      ? <Line dataKey={metric} name={metric} stroke="#146c6c" strokeWidth={3} type="monotone" />
      : customResult.configuration.chartType === 'area'
        ? <Area dataKey={metric} name={metric} stroke="#146c6c" fill="#cde6df" type="monotone" />
        : <Bar dataKey={metric} name={metric} fill="#168a78" radius={[4, 4, 0, 0]} />;
    const chartProps = { data: resultRows };
    const axes = <><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" /><YAxis /><Tooltip /><Legend /></>;
    if (customResult.configuration.chartType === 'line') return <LineChart {...chartProps}>{axes}{series}</LineChart>;
    if (customResult.configuration.chartType === 'area') return <AreaChart {...chartProps}>{axes}{series}</AreaChart>;
    return <BarChart {...chartProps}>{axes}{series}</BarChart>;
  };

  const renderProductionChart = () => {
    const commonProps = { data: productionRows, margin: { top: 8, right: 14, left: 4, bottom: 0 }, onClick: (event) => { const index = event?.activeTooltipIndex; if (typeof index === 'number') setSelectedProductionRow(productionRows[index]); } };
    const chartContent = productionView === 'targetActual' ? <>
      <Bar dataKey="targetTonnes" name="Target" fill="#b7d6d0" radius={[4, 4, 0, 0]} />
      <Bar dataKey="actualTonnes" name="Actual" fill="#146c6c" radius={[4, 4, 0, 0]} />
    </> : <>
      {productionChart === 'area' ? <Area dataKey={productionMetric} name={selectedMetricInfo.label} stroke="#146c6c" fill="#cde6df" type="monotone" /> : productionChart === 'line' ? <Line dataKey={productionMetric} name={selectedMetricInfo.label} stroke="#146c6c" strokeWidth={3} dot={{ r: 4 }} type="monotone" /> : <Bar dataKey={productionMetric} name={selectedMetricInfo.label} fill="#168a78" radius={[4, 4, 0, 0]} />}
    </>;
    const axis = <><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [number(value), productionView === 'targetActual' ? 'tonnes' : selectedMetricInfo.unit]} /><Legend /></>;
    if (productionChart === 'pie') {
      const pieRows = productionView === 'targetActual'
        ? [
          { period: 'Actual', value: filteredProduction.reduce((sum, row) => sum + row.actualTonnes, 0) },
          { period: 'Target', value: filteredProduction.reduce((sum, row) => sum + row.targetTonnes, 0) },
        ]
        : productionRows.map((row) => ({ period: row.period, value: row[productionMetric] }));
      return <PieChart><Pie data={pieRows} dataKey="value" nameKey="period" innerRadius="48%" outerRadius="78%" onClick={(_, index) => setSelectedProductionRow(productionRows[index] || productionRows[0])}>{pieRows.map((row, index) => <Cell key={row.period} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => number(value)} /><Legend /></PieChart>;
    }
    if (productionChart === 'line') return <LineChart {...commonProps}>{axis}{productionView === 'targetActual' ? <><Line dataKey="targetTonnes" name="Target" stroke="#8bbdb3" strokeDasharray="5 4" /><Line dataKey="actualTonnes" name="Actual" stroke="#146c6c" strokeWidth={3} type="monotone" /></> : <Line dataKey={productionMetric} name={selectedMetricInfo.label} stroke="#146c6c" strokeWidth={3} type="monotone" />}</LineChart>;
    if (productionChart === 'area') return <AreaChart {...commonProps}>{axis}{productionView === 'targetActual' ? <><Area dataKey="targetTonnes" name="Target" stroke="#8bbdb3" fill="#e5f2ef" type="monotone" /><Area dataKey="actualTonnes" name="Actual" stroke="#146c6c" fill="#b9ddd3" type="monotone" /></> : chartContent}</AreaChart>;
    return <BarChart {...commonProps}>{axis}{chartContent}</BarChart>;
  };

  const renderEnvironmentChart = () => {
    const selectedMines = selectedMineNames;
    const keys = selectedMines.length > 1 ? selectedMines : [environmentMetric];
    const metricsForChart = keys.map((key, index) => <Line key={key} type="monotone" dataKey={key} name={key === environmentMetric ? environmentMetrics.find(([metric]) => metric === key)?.[1] || key : key} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />);
    if (environmentChart === 'bar') return <BarChart data={envChartData}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" /><YAxis /><Tooltip /><Legend />{keys.map((key, index) => <Bar key={key} dataKey={key} name={key === environmentMetric ? environmentMetrics.find(([metric]) => metric === key)?.[1] || key : key} fill={COLORS[index % COLORS.length]} />)}{thresholdMarkers}</BarChart>;
    if (environmentChart === 'area') return <AreaChart data={envChartData}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" /><YAxis /><Tooltip /><Legend />{keys.map((key, index) => <Area key={key} type="monotone" dataKey={key} name={key === environmentMetric ? environmentMetrics.find(([metric]) => metric === key)?.[1] || key : key} stroke={COLORS[index % COLORS.length]} fill={`${COLORS[index % COLORS.length]}22`} />)}{thresholdMarkers}</AreaChart>;
    return <LineChart data={envChartData}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" /><YAxis /><Tooltip /><Legend />{metricsForChart}{thresholdMarkers}</LineChart>;
  };

  return <section className="analysis-intelligence" aria-label="Advanced analysis workspace">
    <SectionTitle title="Advanced Mining & Environmental Intelligence" description="Filter operational, geological and environmental records, compare performance, and create reusable analysis views." action={<span className="analysis-demo-tag"><FlaskConical size={13} /> Demonstration data</span>} />

    <div className="analysis-filter-bar">
      <label className="analysis-control"><span>From</span><input type="date" value={dateFrom} max={dateTo} onChange={(event) => { setDateFrom(event.target.value); setComparisonRows([]); }} /></label>
      <label className="analysis-control"><span>To</span><input type="date" value={dateTo} min={dateFrom} onChange={(event) => { setDateTo(event.target.value); setComparisonRows([]); }} /></label>
      <button type="button" className="documents-secondary-action" onClick={() => { setDateFrom('2026-01-01'); setDateTo('2026-12-31'); setComparisonRows([]); }}>Full year</button>
      <span className="analysis-filter-summary">{selectedMineIds.length} mine{selectedMineIds.length === 1 ? '' : 's'} selected · {loading ? 'Updating data…' : `${filteredProduction.length} production records`}</span>
    </div>
    <MultiMineSelect selectedIds={selectedMineIds} onToggle={toggleMine} />
    {error && <div className="analysis-inline-error" role="alert">{error}</div>}
    {operationError && <div className="analysis-inline-error" role="alert">{operationError}</div>}

    <div className="analysis-intel-tabs" role="tablist" aria-label="Analysis categories">
      {['Production', 'Geological', 'Environmental', 'Compare', 'Custom builder', 'Anomalies & AI'].map((tab) => <button key={tab} role="tab" type="button" aria-selected={activeTab === tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
    </div>

    {activeTab === 'Production' && <div className="analysis-intel-panel">
      <SectionTitle title="Production, targets & productivity" description="Monthly, quarterly or annual results are recalculated from the selected mines and date range." action={<div className="analysis-export-actions"><button type="button" onClick={() => exportCurrent('csv')}><Download size={14} /> CSV</button><button type="button" onClick={() => exportCurrent('excel')}><FileDown size={14} /> Excel</button><button type="button" onClick={() => exportCurrent('pdf')}>PDF</button></div>} />
      <div className="analysis-controls-grid">
        <Select label="Period grouping" value={period} onChange={setPeriod} options={periods.map(({ id, label }) => [id, label])} />
        <Select label="View" value={productionView} onChange={setProductionView} options={[["targetActual", 'Target vs actual'], ['metricTrend', 'Selected metric trend'], ['mineComparison', 'Mine-wise comparison']]} />
        <Select label="Metric" value={productionMetric} onChange={setProductionMetric} options={metrics.map(({ id, label }) => [id, label])} />
        <Select label="Chart type" value={productionChart} onChange={setProductionChart} options={chartTypes.map((type) => [type, type[0].toUpperCase() + type.slice(1)])} />
      </div>
      <div className="analysis-intel-chart"><ResponsiveContainer width="100%" height="100%">{renderProductionChart()}</ResponsiveContainer></div>
      <div className="analysis-summary-strip">
        <span><small>Actual output</small><strong>{number(filteredProduction.reduce((sum, row) => sum + row.actualTonnes, 0))} t</strong></span>
        <span><small>Target</small><strong>{number(filteredProduction.reduce((sum, row) => sum + row.targetTonnes, 0))} t</strong></span>
        <span><small>Achievement</small><strong>{number(filteredProduction.length ? filteredProduction.reduce((sum, row) => sum + row.achievement, 0) / filteredProduction.length : 0)}%</strong></span>
        <span><small>Avg. stripping ratio</small><strong>{number(filteredProduction.length ? filteredProduction.reduce((sum, row) => sum + row.strippingRatio, 0) / filteredProduction.length : 0)}</strong></span>
      </div>
      {selectedProductionRow && <div className="analysis-detail-strip"><div><strong>{selectedProductionRow.period}</strong><span>Click a chart point or bar to inspect its detail.</span></div><span>Actual {number(selectedProductionRow.actualTonnes)} t</span><span>Target {number(selectedProductionRow.targetTonnes)} t</span><span>Variance {number(selectedProductionRow.actualTonnes - selectedProductionRow.targetTonnes)} t</span><button type="button" onClick={() => setSelectedProductionRow(null)} aria-label="Close production details">×</button></div>}
      <div className="analysis-data-table-wrap"><table className="analysis-data-table"><thead><tr><th>Period / Mine</th><th>Actual (t)</th><th>Target (t)</th><th>Variance (t)</th><th>Achievement</th><th>Coal (t)</th><th>Overburden (t)</th><th>Stripping ratio</th><th>Productivity</th></tr></thead><tbody>{productionRows.map((row) => <tr key={row.period} onClick={() => setSelectedProductionRow(row)}><td>{row.period}</td><td>{number(row.actualTonnes)}</td><td>{number(row.targetTonnes)}</td><td className={row.actualTonnes - row.targetTonnes >= 0 ? 'is-positive' : 'is-negative'}>{number(row.actualTonnes - row.targetTonnes)}</td><td>{number(row.achievement)}%</td><td>{number(row.coalTonnes)}</td><td>{number(row.overburdenTonnes)}</td><td>{number(row.strippingRatio)}</td><td>{number(row.productivity)} t/worker</td></tr>)}</tbody></table></div>
    </div>}

    {activeTab === 'Geological' && <div className="analysis-intel-panel">
      <SectionTitle title="Geological intelligence" description="Resource and reserve estimates, borehole depth, seam thickness, grade and exploration records." action={<button type="button" className="analysis-quiet-action" onClick={() => exportCurrent('csv')}><Download size={14} /> Export geology</button>} />
      <div className="analysis-controls-grid"><Select label="Measure" value={geologyMetric} onChange={setGeologyMetric} options={geologyMetrics} /><Select label="Mine detail" value={selectedGeologyMine || geology[0]?.mineId || ''} onChange={setSelectedGeologyMine} options={geology.map((row) => [row.mineId, row.mine])} /></div>
      <div className="analysis-intel-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={geology} onClick={(event) => { const row = geology.find((item) => item.mine === event?.activeLabel); if (row) { setSelectedGeologyMine(row.mineId); setDetail({ title: `${row.mine} geological details`, description: 'Selected geological demonstration record', data: row }); } }}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mine" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey={geologyMetric} name={geologyMetrics.find(([id]) => id === geologyMetric)?.[1]} fill="#168a78" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      {geoSelected && <div className="analysis-geology-detail"><div><small>Selected mine</small><strong>{geoSelected.mine}</strong></div><div><small>Estimated resource</small><strong>{geoSelected.resourceMt} Mt</strong></div><div><small>Mineral reserve</small><strong>{geoSelected.reserveMt} Mt</strong></div><div><small>Boreholes · mean depth</small><strong>{geoSelected.boreholeCount} · {geoSelected.averageDepthM} m</strong></div><div><small>Seam · grade</small><strong>{geoSelected.seamThicknessM} m · {geoSelected.gradePercent}%</strong></div><div><small>Coal quality</small><strong>Ash {geoSelected.ashPercent}% · moisture {geoSelected.moisturePercent}%</strong></div><div><small>Strata</small><strong>{geoSelected.strata.join(' → ')}</strong></div></div>}
      {geoSelected?.explorationTrend?.length > 0 && <div><strong className="analysis-subsection-label">Exploration trend · logged boreholes by survey period</strong><div className="analysis-mini-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={geoSelected.explorationTrend}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" /><YAxis /><Tooltip /><Line dataKey="boreholes" name="Boreholes" type="monotone" stroke="#146c6c" strokeWidth={2.5} /></LineChart></ResponsiveContainer></div></div>}
      <div className="analysis-data-table-wrap"><table className="analysis-data-table"><thead><tr><th>Mine</th><th>Resource (Mt)</th><th>Reserves (Mt)</th><th>Boreholes</th><th>Mean depth (m)</th><th>Seam (m)</th><th>Grade (%)</th><th>Coal quality (ash/moisture)</th></tr></thead><tbody>{geology.map((row) => <tr key={row.mineId} onClick={() => { setSelectedGeologyMine(row.mineId); setDetail({ title: `${row.mine} geological details`, description: 'Selected geological demonstration record', data: row }); }}><td>{row.mine}</td><td>{row.resourceMt}</td><td>{row.reserveMt}</td><td>{row.boreholeCount}</td><td>{row.averageDepthM}</td><td>{row.seamThicknessM}</td><td>{row.gradePercent}</td><td>{row.ashPercent}% / {row.moisturePercent}%</td></tr>)}</tbody></table></div>
      <div className="analysis-strata-panel"><strong>Geological strata profile · {geoSelected?.mine}</strong><div>{(geoSelected?.strata || []).map((layer, index) => <span key={layer} style={{ background: COLORS[index % COLORS.length], minHeight: `${24 + index * 8}px` }}>{layer}</span>)}</div><p>Exploration trend: borehole counts by survey quarter are available with geological records. These estimates are demonstration records.</p></div>
    </div>}

    {activeTab === 'Environmental' && <div className="analysis-intel-panel">
      <SectionTitle title="Environmental monitoring" description="Measured readings, thresholds and status history. Current values are demonstration data." action={<span className="analysis-demo-tag"><FlaskConical size={13} /> Sample measurements</span>} />
      <div className="analysis-controls-grid"><Select label="Indicator" value={environmentMetric} onChange={setEnvironmentMetric} options={environmentMetrics.map(([id, label, unit]) => [id, `${label}${unit && unit !== label ? ` (${unit})` : ''}`])} /><Select label="Chart type" value={environmentChart} onChange={setEnvironmentChart} options={['line', 'area', 'bar'].map((type) => [type, type[0].toUpperCase() + type.slice(1)])} /></div>
      <div className="analysis-env-status-row">{environmentMetrics.map(([metric, label, unit]) => {
        const rows = envRecords.filter((row) => row[metric] !== undefined);
        const latest = rows.at(-1);
        const status = thresholdStatus(metric, latest?.[metric]);
        return <button key={metric} type="button" className={`analysis-env-status ${status.toLowerCase()} ${environmentMetric === metric ? 'is-selected' : ''}`} onClick={() => setEnvironmentMetric(metric)}><span>{label}</span><strong>{latest ? `${number(latest[metric])} ${unit === '%' || unit === 'pH' ? unit : unit}` : '—'}</strong><small>{status} · {latest?.mine || 'No records'}</small></button>;
      })}</div>
      <div className="analysis-intel-chart"><ResponsiveContainer width="100%" height="100%">{renderEnvironmentChart()}</ResponsiveContainer></div>
      {threshold && <div className="analysis-threshold-editor"><div><strong>Threshold configuration · {environmentMetrics.find(([metric]) => metric === environmentMetric)?.[1]}</strong><small>Status rules update the trend and rule-based anomaly list.</small></div>
        {threshold.direction === 'range' ? <><label>Warning low<input type="number" value={thresholds[environmentMetric]?.warningLow ?? threshold.warningLow} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], warningLow: Number(event.target.value) } }))} /></label><label>Warning high<input type="number" value={thresholds[environmentMetric]?.warningHigh ?? threshold.warningHigh} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], warningHigh: Number(event.target.value) } }))} /></label><label>Critical low<input type="number" value={thresholds[environmentMetric]?.criticalLow ?? threshold.criticalLow} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], criticalLow: Number(event.target.value) } }))} /></label><label>Critical high<input type="number" value={thresholds[environmentMetric]?.criticalHigh ?? threshold.criticalHigh} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], criticalHigh: Number(event.target.value) } }))} /></label></> : <><label>Warning<input type="number" value={thresholds[environmentMetric]?.warning ?? threshold.warning} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], warning: Number(event.target.value) } }))} /></label><label>Critical<input type="number" value={thresholds[environmentMetric]?.critical ?? threshold.critical} onChange={(event) => setThresholds((current) => ({ ...current, [environmentMetric]: { ...threshold, ...current[environmentMetric], critical: Number(event.target.value) } }))} /></label></>}
        <span className={`analysis-status-pill ${thresholdStatus(environmentMetric, latestEnvValue).toLowerCase()}`}>{thresholdStatus(environmentMetric, latestEnvValue)}</span>
      </div>}
      <div className="analysis-data-table-wrap"><table className="analysis-data-table"><thead><tr><th>Month</th><th>Mine</th><th>PM2.5</th><th>PM10</th><th>pH</th><th>Turbidity</th><th>O₂ (mg/L)</th><th>CO₂ (tCO₂e)</th><th>Vegetation</th><th>Status</th></tr></thead><tbody>{envRecords.map((row) => <tr key={row.id} onClick={() => setDetail({ title: `${row.mine} environmental record · ${row.month} 2026`, description: 'Selected environmental demonstration measurement', data: row })}><td>{row.month} 2026</td><td>{row.mine}</td><td>{row.pm25}</td><td>{row.pm10}</td><td>{row.ph}</td><td>{row.turbidity}</td><td>{row.dissolvedOxygen}</td><td>{number(row.co2Tonnes)}</td><td>{row.vegetationPercent}%</td><td><span className={`analysis-status-pill ${thresholdStatus(environmentMetric, row[environmentMetric]).toLowerCase()}`}>{thresholdStatus(environmentMetric, row[environmentMetric])}</span></td></tr>)}</tbody></table></div>
    </div>}

    {activeTab === 'Compare' && <div className="analysis-intel-panel">
      <SectionTitle title="Mine and project comparison" description="Compare production targets, actual output, carbon emissions and geological reserves over the selected reporting period." action={<button type="button" className="workspace-primary-action" disabled={selectedMineIds.length < 2} onClick={generateComparison}>Run comparison</button>} />
      <div className="analysis-comparison-kpis"><span>Selected mines <strong>{selectedMineIds.length}</strong></span><span>Reporting window <strong>{dateFrom} – {dateTo}</strong></span><span>Metrics <strong>4 operational measures</strong></span></div>
      {comparisonRows.length > 0 ? <>
        <div className="analysis-intel-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={comparisonRows}><CartesianGrid stroke="#e6efef" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mine" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Legend /><Bar dataKey="targetTonnes" name="Target" fill="#b7d6d0" /><Bar dataKey="actualTonnes" name="Actual" fill="#146c6c" /></BarChart></ResponsiveContainer></div>
        <div className="analysis-export-actions comparison-export"><button type="button" onClick={() => exportCurrent('csv')}><Download size={14} /> Export comparison CSV</button><button type="button" onClick={() => exportCurrent('excel')}>Excel</button><button type="button" onClick={() => exportCurrent('pdf')}>PDF</button></div>
        <div className="analysis-data-table-wrap"><table className="analysis-data-table"><thead><tr><th>Mine / Project</th><th>Actual production</th><th>Target</th><th>Achievement</th><th>Variance</th><th>Emissions</th><th>Reserves</th></tr></thead><tbody>{comparisonRows.map((row) => { const variance = row.actualTonnes - row.targetTonnes; return <tr key={row.mineId}><td>{row.mine}</td><td>{number(row.actualTonnes)} t</td><td>{number(row.targetTonnes)} t</td><td>{row.achievement}%</td><td className={variance >= 0 ? 'is-positive' : 'is-negative'}>{variance >= 0 ? '+' : ''}{number(variance)} t</td><td>{number(row.co2Tonnes)} tCO₂e</td><td>{row.reserveMt} Mt</td></tr>; })}</tbody></table></div>
      </> : <div className="analysis-empty-state">Select two or more mines above, then run the comparison.</div>}
    </div>}

    {activeTab === 'Custom builder' && <div className="analysis-intel-panel">
      <SectionTitle title="Custom analytics builder" description="Build and save a filtered configuration, then export the generated rows." action={<button type="button" className="analysis-quiet-action" onClick={saveConfiguration}><Save size={14} /> Save configuration</button>} />
      <form className="analysis-builder-form" onSubmit={generateCustom}>
        <Select label="Analysis category" value={customCategory} onChange={(value) => { setCustomCategory(value); setCustomMetrics([]); }} options={['Production', 'Geological', 'Environmental']} />
        <Select label="Chart type" value={customChart} onChange={setCustomChart} options={chartTypes.map((type) => [type, type[0].toUpperCase() + type.slice(1)])} />
        <fieldset className="analysis-builder-metrics"><legend>Metrics</legend>{customOptions.map(([metric, label]) => <label key={metric}><input type="checkbox" checked={customMetrics.includes(metric)} onChange={() => setCustomMetrics((current) => current.includes(metric) ? current.filter((item) => item !== metric) : [...current, metric])} />{label}</label>)}</fieldset>
        <button className="workspace-primary-action" type="submit" disabled={!selectedMineIds.length || !customMetrics.length}>Generate analysis</button>
      </form>
      {savedConfigurations.length > 0 && <div className="analysis-saved-configs"><strong>Saved configurations</strong>{savedConfigurations.map((config) => <button type="button" key={config.id} onClick={() => { setCustomCategory(config.category); setCustomMetrics(config.metrics); setCustomChart(config.chartType); setSelectedMineIds(config.mineIds); setDateFrom(config.dateFrom); setDateTo(config.dateTo); }}>{config.name} · {new Date(config.savedAt).toLocaleDateString()}</button>)}</div>}
      {customResult && <div className="analysis-custom-result"><div><strong>Analysis generated</strong><span>{customResult.rows.length} rows · {customResult.source === 'demonstration' ? 'Demonstration data' : 'API result'}</span></div><div className="analysis-export-actions"><button type="button" onClick={() => exportRows(customResult.rows, 'carbonexa-custom-analysis', 'csv', 'Custom analysis')}>CSV</button><button type="button" onClick={() => exportRows(customResult.rows, 'carbonexa-custom-analysis', 'xls', 'Custom analysis')}>Excel</button><button type="button" onClick={() => exportPdf(customResult.rows, 'Custom analysis')}>PDF</button></div><div className="analysis-mini-chart"><ResponsiveContainer width="100%" height="100%">{renderCustomResultChart()}</ResponsiveContainer></div><div className="analysis-data-table-wrap"><table className="analysis-data-table"><thead><tr>{Object.keys(customResult.rows[0] || {}).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{customResult.rows.slice(0, 20).map((row, index) => <tr key={`${row.mine}-${row.period}-${index}`}>{Object.keys(row).map((key) => <td key={key}>{row[key]}</td>)}</tr>)}</tbody></table></div></div>}
    </div>}

    {activeTab === 'Anomalies & AI' && <div className="analysis-intel-panel">
      <SectionTitle title="Anomaly checks & analytical insights" description="Rule based checks are transparent demonstration logic. They are not validated AI predictions." action={<button type="button" className="analysis-quiet-action" onClick={loadInsights}><Sparkles size={14} /> Check insights service</button>} />
      <div className="analysis-rule-note"><AlertTriangle size={16} /><span>Rules: output change ≥20% up or ≥15% down month over month; environmental warning or critical thresholds; reserves greater than resources. Each item shows the triggering measurement and rule.</span></div>
      <div className="analysis-anomaly-list">{anomalyList.length ? anomalyList.map((item, index) => <article key={`${item.mine}-${item.period}-${index}`}><span className="analysis-anomaly-icon"><AlertTriangle size={16} /></span><div><strong>{item.type} · {item.mine} · {item.period}</strong><p>{item.reason}</p></div><span className="analysis-demo-tag">Rule check</span></article>) : <div className="analysis-empty-state">No rule checks were triggered for the current filters and thresholds.</div>}</div>
      <div className="analysis-ai-card"><div><span className="analysis-ai-icon"><Sparkles size={17} /></span><div><strong>AI Insights</strong><p>Production summaries, mine observations, geology and environment recommendations will appear here when an insights provider is connected.</p></div></div>{insights ? <div className="analysis-ai-result"><span className="analysis-demo-tag">{insights.source === 'demonstration' ? 'Demonstration status' : 'Service response'}</span><p>{insights.message || (insights.insights.length ? `${insights.insights.length} insight${insights.insights.length === 1 ? '' : 's'} returned by the connected service.` : 'The connected service returned no insight records.')}</p>{insights.insights.map((item, index) => <article key={item.id || index}><strong>{item.title || item.category || 'Insight'}</strong><span>{item.summary || item.text}</span>{item.recommendation && <small>Recommendation: {item.recommendation}</small>}</article>)}</div> : <div className="analysis-ai-placeholder">No AI generated answer is shown. Select “Check insights service” to inspect connection status.</div>}</div>
    </div>}

    {detail && <div className="documents-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}><div className="documents-modal" role="dialog" aria-modal="true" aria-labelledby="analysis-detail-title"><div className="documents-modal-heading"><div><h3 id="analysis-detail-title">{detail.title}</h3><p>{detail.description}</p></div><button type="button" className="documents-modal-close" aria-label="Close detail" onClick={() => setDetail(null)}>×</button></div><pre className="analysis-detail-json">{JSON.stringify(detail.data, null, 2)}</pre><div className="documents-modal-actions"><button className="documents-secondary-action" type="button" onClick={() => setDetail(null)}>Close</button></div></div></div>}
    <div className="analysis-data-footnote">Source: demonstration records for frontend interaction. Configure the analysis API service before treating these measurements as operational records. {overview?.source === 'demonstration' && <span>Overview is marked as demonstration.</span>}</div>
  </section>;
}

export default AnalysisIntelligence;
