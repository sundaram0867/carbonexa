import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Clock, FileEdit, Plus, Download, Pencil,
  Search, BarChart2, PieChart, ArrowUpRight, X, Trash2, Calendar,
  Eye, GitCompare, History, MessageSquare, Send, ChevronDown, ChevronUp,
  CalendarClock, Sparkles, Check, XCircle, Save,
} from 'lucide-react';
import { dataMode } from '../config/api';
import { reportTemplates } from '../data/reportMockData';
import { reportService } from '../services/reportService';
import ReportStatusBadge from '../components/reports/ReportStatusBadge';
import { useReportLibrary } from '../hooks/useReportLibrary';
import './Reports.css';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [reportDraft, setReportDraft] = useState({ name: '', desc: '', project: '', category: '' });
  const [storedReports] = useState(() => {
    try {
      const parsedReports = dataMode === 'mock' ? reportService.getMockReports() : [];
      const isValid = Array.isArray(parsedReports) && parsedReports.every((report) => (
        (typeof report.id === 'number' || typeof report.id === 'string')
        && ['name', 'desc', 'project', 'category', 'status'].every((key) => typeof report[key] === 'string')
      ));
      if (!isValid) throw new Error('Saved reports are invalid.');
      return { records: parsedReports, error: '' };
    } catch {
      return { records: null, error: 'Saved report changes could not be loaded. Check browser storage, then refresh the page.' };
    }
  });
  const [reportsStorageError, setReportsStorageError] = useState(storedReports.error);
  const [reportActionError, setReportActionError] = useState('');
  const searchParam = searchParams.get('search') || '';
  const actionParam = searchParams.get('action');

  const { reports: reportsList, setReports: setReportsList, isLoading: reportsLoading, error: reportsLoadError } = useReportLibrary(storedReports.records || []);
  const today = new Date().toISOString().slice(0, 10);
  const [reportForm, setReportForm] = useState({
    name: '',
    desc: '',
    project: '',
    category: 'Geological',
    periodStart: `${today.slice(0, 8)}01`,
    periodEnd: today,
    preparedBy: 'Prathamesh Tripathi',
    department: 'Geology',
    reviewer: '',
    sections: ['Executive summary', 'Findings', 'Recommendations'],
    observations: '',
    recommendations: '',
  });
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportPanel, setReportPanel] = useState('details');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('Anuradha Kulkarni');
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [compareReports, setCompareReports] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ name: '', category: 'Mining', project: '', frequency: 'Monthly', generateOn: today, recipient: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'updated', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [aiDemoResult, setAiDemoResult] = useState('');

  useEffect(() => {
    const handleStorageStatus = (event) => setReportsStorageError(event.detail);
    window.addEventListener('carbonexa-reports-storage-status', handleStorageStatus);
    return () => window.removeEventListener('carbonexa-reports-storage-status', handleStorageStatus);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchParam), 0);
    return () => window.clearTimeout(timer);
  }, [searchParam]);

  useEffect(() => {
    if (actionParam !== 'generate') return;
    const timer = window.setTimeout(() => {
      setIsGenerateOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [actionParam, searchParams, setSearchParams]);

  const [recentExports, setRecentExports] = useState([]);

  useEffect(() => {
    reportService.getRecentExports().then(setRecentExports).catch((error) => setReportActionError(error.message));
    reportService.getReportSchedules().then(setSchedules).catch((error) => setReportActionError(error.message));
    reportService.getCustomReportTemplates().then(setCustomTemplates).catch((error) => setReportActionError(error.message));
  }, []);

  useEffect(() => {
    if (!isGenerateOpen && !selectedReport && !isExportOpen && !isScheduleOpen && !schedulesOpen && !isCompareOpen && !editingReport) return undefined;
    const closeDialogs = (event) => {
      if (event.key !== 'Escape') return;
      setIsGenerateOpen(false);
      setSelectedReport(null);
      setIsExportOpen(false);
      setIsScheduleOpen(false);
      setSchedulesOpen(false);
      setIsCompareOpen(false);
      setEditingReport(null);
    };
    window.addEventListener('keydown', closeDialogs);
    return () => window.removeEventListener('keydown', closeDialogs);
  }, [editingReport, isCompareOpen, isExportOpen, isGenerateOpen, isScheduleOpen, schedulesOpen, selectedReport]);

  const activeStatuses = ['Draft', 'Pending Review', 'In Review', 'Approved', 'Rejected'];
  const reportTypes = [
    'Geological Survey Report',
    'Monthly Production Report',
    'Environmental Impact Assessment',
    'Safety Audit Report',
    'Hydrogeological Report',
    'Mining Operations Report',
    'Project Progress Report',
    'Custom Report',
  ];
  const reportSections = [
    'Executive summary',
    'Geological observations',
    'Borehole references',
    'Production overview',
    'Environmental indicators',
    'Safety observations',
    'Operations overview',
    'KPI summary',
    'Production table',
    'Compliance table',
    'Inspection table',
    'Findings',
    'Recommendations',
  ];
  const projects = [...new Set(reportsList.map((report) => report.project).filter(Boolean))].sort();
  const setReportListRecord = (record) => {
    setReportsList((currentReports) => {
      const exists = currentReports.some((report) => String(report.id) === String(record.id));
      return exists
        ? currentReports.map((report) => String(report.id) === String(record.id) ? record : report)
        : [record, ...currentReports];
    });
  };

  const handleDeleteReport = async (id) => {
    try {
      await reportService.deleteReport(id);
      setReportsList((currentReports) => currentReports.filter((report) => String(report.id) !== String(id)));
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const openReportEditor = (report) => {
    setEditingReport(report);
    setReportDraft({
      name: report.name,
      desc: report.desc,
      project: report.project,
      category: report.category,
    });
  };

  const handleEditReportSubmit = async (event) => {
    event.preventDefault();
    const updatedFields = Object.fromEntries(
      Object.entries(reportDraft).map(([field, value]) => [field, value.trim()])
    );
    if (!editingReport || Object.values(updatedFields).some((value) => !value)) return;

    try {
      const savedReport = await reportService.updateReport(editingReport.id, updatedFields, 'Edited report metadata');
      setReportListRecord({ ...editingReport, ...savedReport, ...updatedFields });
      setEditingReport(null);
      setReportActionError('');
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const openGenerateWorkflow = (template = null) => {
    setSelectedTemplate(template?.name || '');
    setWizardStep(1);
    setAiDemoResult('');
    setReportActionError('');
    setReportForm((current) => ({
      ...current,
      name: template ? template.name.replace(' Template', '') : '',
      desc: template?.desc || '',
      category: template?.category || 'Geological',
      reportType: template ? template.name.replace(' Template', '') : 'Geological Survey Report',
      sections: template?.sections || ['Executive summary', 'Findings', 'Recommendations'],
      project: '',
      reviewer: '',
    }));
    setIsGenerateOpen(true);
  };

  const setWizardField = (field, value) => {
    setReportForm((current) => ({ ...current, [field]: value }));
  };

  const toggleReportSection = (section) => {
    setReportForm((current) => ({
      ...current,
      sections: current.sections.includes(section)
        ? current.sections.filter((item) => item !== section)
        : [...current.sections, section],
    }));
  };

  const shiftReportSection = (index, direction) => {
    setReportForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });
  };

  const saveGeneratedReport = async (submitForReview = false) => {
    const reportRecord = {
      ...reportForm,
      name: reportForm.name.trim(),
      desc: reportForm.desc.trim(),
      project: reportForm.project.trim(),
      preparedBy: reportForm.preparedBy.trim(),
      department: reportForm.department.trim(),
      observations: reportForm.observations.trim(),
      recommendations: reportForm.recommendations.trim(),
      reportType: reportForm.reportType || reportForm.name,
    };
    if (!reportRecord.name || !reportRecord.project || !reportRecord.preparedBy || !reportRecord.sections.length) {
      setReportActionError('Complete the required fields and select at least one section.');
      setWizardStep(1);
      return;
    }
    if (reportRecord.periodStart > reportRecord.periodEnd) {
      setReportActionError('The reporting start date must be on or before the end date.');
      setWizardStep(1);
      return;
    }
    if (submitForReview && !reportRecord.reviewer.trim()) {
      setReportActionError('Assign a reviewer before submitting this report.');
      setWizardStep(1);
      return;
    }
    try {
      let savedReport = await reportService.generateReport(reportRecord);
      if (submitForReview) {
        savedReport = await reportService.submitReportForReview(savedReport.id, reportRecord.reviewer.trim());
      }
      setReportListRecord(savedReport);
      setSelectedReport(savedReport);
      setReportPanel('preview');
      setIsGenerateOpen(false);
      setReportActionError('');
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const handleReportAction = async (report, action, comment = '') => {
    try {
      let updated;
      if (action === 'submit') {
        if (!report.reviewer?.trim()) throw new Error('Assign a reviewer before submitting.');
        updated = await reportService.submitReportForReview(report.id, report.reviewer.trim());
      } else if (action === 'start-review') {
        updated = await reportService.startReportReview(report.id, reviewerName.trim());
      } else if (action === 'approve') {
        if (!reviewerName.trim()) throw new Error('Enter the reviewer name before approving.');
        updated = await reportService.approveReport(report.id, reviewerName.trim(), comment.trim());
      } else if (action === 'reject') {
        if (!comment.trim()) throw new Error('A reason is required when rejecting a report.');
        if (!reviewerName.trim()) throw new Error('Enter the reviewer name before rejecting.');
        updated = await reportService.rejectReport(report.id, reviewerName.trim(), comment.trim());
      } else {
        if (!reviewerName.trim()) throw new Error('Enter your name before adding a comment.');
        if (!comment.trim()) throw new Error('Enter a comment before submitting.');
        updated = await reportService.addReviewerComment(report.id, reviewerName.trim(), comment.trim());
      }
      setReportListRecord(updated);
      setSelectedReport(updated);
      setReviewComment('');
      setReportActionError('');
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const handleExport = async (reports, format = exportFormat) => {
    setIsExporting(true);
    setExportError('');
    try {
      const result = await reportService.exportReport(reports, format);
      const recent = await reportService.getRecentExports();
      setRecentExports(recent);
      setIsExportOpen(false);
      setReportActionError(`${result.name || result.filename || 'Report export'} downloaded.`);
      setSelectedReportIds([]);
    } catch (error) {
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const createSchedule = async (event) => {
    event.preventDefault();
    try {
      const schedule = await reportService.scheduleReport({
        ...scheduleForm,
        name: scheduleForm.name.trim(),
        project: scheduleForm.project.trim(),
        recipient: scheduleForm.recipient.trim(),
      });
      setSchedules((current) => [schedule, ...current]);
      setIsScheduleOpen(false);
      setScheduleForm({ name: '', category: 'Mining', project: '', frequency: 'Monthly', generateOn: today, recipient: '' });
      setReportActionError('Schedule saved. Automatic generation requires a connected backend scheduler.');
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const toggleSchedule = async (schedule) => {
    try {
      const updated = await reportService.updateReportSchedule(schedule.id, { active: !schedule.active });
      setSchedules((current) => current.map((item) => item.id === schedule.id ? updated : item));
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const saveCustomTemplate = async () => {
    const name = window.prompt('Name this reusable report template:')?.trim();
    if (!name) return;
    try {
      const saved = await reportService.saveCustomReportTemplate({
        name,
        desc: reportForm.desc || 'Custom report template',
        category: reportForm.category,
        reportType: reportForm.reportType,
        sections: reportForm.sections,
      });
      setCustomTemplates((current) => [saved, ...current]);
      setReportActionError(`Template "${saved.name}" saved.`);
    } catch (error) {
      setReportActionError(error.message);
    }
  };

  const openReportDetails = (report, panel = 'details') => {
    setSelectedReport(report);
    setReportPanel(panel);
    setSelectedVersion(null);
    setReviewComment('');
    setReportActionError('');
    setAiDemoResult('');
  };

  // Filter Reports logic (Search + Category + Status + Month + Year)
  const filteredReports = reportsList.filter(rep => {
    const searchable = `${rep.name} ${rep.project} ${rep.category} ${rep.desc} ${rep.owner}`.toLowerCase();
    const matchesSearch = searchable.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || rep.category === selectedCategory;
    const matchesStatus = selectedStatusFilter === 'All'
      || (selectedStatusFilter === 'In Review' && ['Pending Review', 'In Review'].includes(rep.status))
      || rep.status === selectedStatusFilter;
    const matchesMonth = !selectedMonthFilter || rep.month === selectedMonthFilter;
    const matchesYear = selectedYearFilter === 'All' || rep.year === selectedYearFilter;
    const matchesProject = selectedProjectFilter === 'All' || rep.project === selectedProjectFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMonth && matchesYear && matchesProject;
  });

  const approvedCount = filteredReports.filter(r => r.status === 'Approved').length;
  const inReviewCount = filteredReports.filter(r => ['Pending Review', 'In Review'].includes(r.status)).length;
  const draftCount = filteredReports.filter(r => r.status === 'Draft').length;
  const reportStatusData = [
    { name: 'Approved', value: approvedCount, color: '#168a78' },
    { name: 'Pending Review', value: filteredReports.filter((r) => r.status === 'Pending Review').length, color: '#e5a84b' },
    { name: 'In Review', value: filteredReports.filter((r) => r.status === 'In Review').length, color: '#d99b37' },
    { name: 'Draft', value: draftCount, color: '#8b79c9' },
    { name: 'Rejected', value: filteredReports.filter((r) => r.status === 'Rejected').length, color: '#dc6262' },
  ];
  const monthsData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name) => {
      const count = reportsList.filter((report) => {
        const date = report.periodEnd || report.updated;
        const parsed = new Date(date);
        const reportMonth = report.month || (Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString('en', { month: 'short' }));
        const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
        const matchesStatus = selectedStatusFilter === 'All'
          || (selectedStatusFilter === 'In Review' && ['Pending Review', 'In Review'].includes(report.status))
          || report.status === selectedStatusFilter;
        const matchesProject = selectedProjectFilter === 'All' || report.project === selectedProjectFilter;
        return reportMonth === name && matchesCategory && matchesStatus && matchesProject
          && (selectedYearFilter === 'All' || report.year === selectedYearFilter);
      }).length;
      return { name, count, val: count };
    });
  }, [reportsList, selectedCategory, selectedProjectFilter, selectedStatusFilter, selectedYearFilter]);
  const peakMonth = monthsData.reduce((peak, month) => (month.count > peak.count ? month : peak), monthsData[0]);
  const selectedActivityMonth = monthsData.find((month) => month.name === selectedMonthFilter);
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortConfig.key === 'updated') {
      const leftDate = new Date(a.updated).getTime();
      const rightDate = new Date(b.updated).getTime();
      if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
        return (sortConfig.direction === 'asc' ? 1 : -1) * (leftDate - rightDate);
      }
    }
    const left = String(a[sortConfig.key] ?? '').toLocaleLowerCase();
    const right = String(b[sortConfig.key] ?? '').toLocaleLowerCase();
    const comparison = left.localeCompare(right, undefined, { numeric: true });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sortedReports.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount);
  const paginatedReports = sortedReports.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  const getCategoryBadge = (cat) => {
    switch(cat) {
      case 'Geological': return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Geological</span>;
      case 'Mining': return <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Mining</span>;
      case 'Environmental': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Environmental</span>;
      case 'Safety': return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Safety</span>;
      case 'Custom': return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Custom</span>;
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
              onClick={() => openGenerateWorkflow()}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={16} /> Generate Report
            </button>
            <button type="button" onClick={() => setSchedulesOpen(true)} style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <CalendarClock size={16} /> Schedule
            </button>
            <button type="button" onClick={() => setIsExportOpen(true)} style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {reportsStorageError && <p className="reports-storage-error" role="status">{reportsStorageError}</p>}
      {reportsLoadError && <p className="reports-storage-error" role="alert">{reportsLoadError}</p>}
      {reportActionError && <p className="reports-action-status" role="status">{reportActionError}</p>}
      {reportsLoading && <p className="reports-action-status" role="status">Loading reports…</p>}

      {/* Top Metric Cards */}
      <div className="workspace-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedCategory('All'); setSelectedStatusFilter('All'); } }} onClick={() => { setSelectedCategory('All'); setSelectedStatusFilter('All'); }} style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Total Reports</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{filteredReports.length}</h2>
          </div>
          <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '8px', color: '#0284c7' }}><FileText size={20} /></div>
        </div>

        <div role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedStatusFilter('Approved'); } }} onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Approved' ? 'All' : 'Approved')} style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Approved</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{approvedCount}</h2>
          </div>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', color: '#16a34a' }}><CheckCircle2 size={20} /></div>
        </div>

        <div role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedStatusFilter('In Review'); } }} onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'In Review' ? 'All' : 'In Review')} style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>In Review</span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '4px 0 0' }}>{inReviewCount}</h2>
          </div>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', color: '#d97706' }}><Clock size={20} /></div>
        </div>

        <div role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedStatusFilter('Draft'); } }} onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Draft' ? 'All' : 'Draft')} style={{ background: '#fff', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
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
                <strong>{filteredReports.length}</strong><span>Total</span>
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
            {[...reportTemplates, ...customTemplates, { name: 'Custom Report', desc: 'Build a report with selected sections', category: 'Custom', sections: ['Executive summary', 'Findings', 'Recommendations'] }].map((tpl, i) => (
              <div 
                key={i} 
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === 'Enter' && openGenerateWorkflow(tpl)}
                onClick={() => openGenerateWorkflow(tpl)}
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
                aria-label="Filter reports by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All">All Categories</option>
                <option value="Geological">Geological</option>
                <option value="Mining">Mining</option>
                <option value="Environmental">Environmental</option>
                <option value="Safety">Safety</option>
                <option value="Custom">Custom</option>
              </select>

              <select aria-label="Filter reports by approval status" value={selectedStatusFilter} onChange={(event) => setSelectedStatusFilter(event.target.value)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                <option value="All">All statuses</option>
                {activeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>

              <select aria-label="Filter reports by project" value={selectedProjectFilter} onChange={(event) => setSelectedProjectFilter(event.target.value)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                <option value="All">All projects</option>
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>

              {/* Year / Date Filter */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', height: '34px', gap: '6px' }}>
                <Calendar size={14} color="#0284c7" />
                <select 
                  aria-label="Filter reports by year"
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Years</option>
                  {[...new Set(reportsList.map((report) => report.year).filter(Boolean))].sort().reverse().map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              {/* Reset */}
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatusFilter('All'); setSelectedMonthFilter(null); setSelectedYearFilter('All'); setSelectedProjectFilter('All'); setCurrentPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#0284c7', cursor: 'pointer', fontWeight: '500' }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table Header */}
          {selectedReportIds.length > 0 && (
            <div className="reports-selection-toolbar">
              <span>{selectedReportIds.length} selected</span>
              <button type="button" onClick={() => setIsExportOpen(true)}><Download size={14} /> Export selected</button>
              {selectedReportIds.length === 2 && <button type="button" onClick={async () => {
                try {
                  setCompareReports(await reportService.compareReports(selectedReportIds));
                  setIsCompareOpen(true);
                } catch (error) {
                  setReportActionError(error.message);
                }
              }}><GitCompare size={14} /> Compare</button>}
              <button type="button" onClick={() => setSelectedReportIds([])}>Clear</button>
            </div>
          )}

          <div className="reports-table-grid-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 1.2fr 110px 110px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#64748b', alignItems: 'center' }}>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'name', direction: current.key === 'name' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Report Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'project', direction: current.key === 'project' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Project / Mine {sortConfig.key === 'project' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'category', direction: current.key === 'category' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'updated', direction: current.key === 'updated' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Updated {sortConfig.key === 'updated' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'owner', direction: current.key === 'owner' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Owner {sortConfig.key === 'owner' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <button type="button" className="reports-sort-button" onClick={() => setSortConfig((current) => ({ key: 'status', direction: current.key === 'status' && current.direction === 'asc' ? 'desc' : 'asc' }))}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}</button>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Table Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            {filteredReports.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No reports found matching your criteria.
              </div>
            ) : (
              paginatedReports.map((rep) => (
                <div 
                  key={rep.id}
                  className="reports-table-grid-row"
                  onClick={() => openReportDetails(rep)}
                  onKeyDown={(event) => event.key === 'Enter' && openReportDetails(rep)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 90px 1.2fr 110px 110px',
                    padding: '14px 20px', 
                    borderBottom: '1px solid #f1f5f9', 
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="checkbox" aria-label={`Select ${rep.name} for report actions`} checked={selectedReportIds.some((id) => String(id) === String(rep.id))} onClick={(event) => event.stopPropagation()} onChange={(event) => setSelectedReportIds((current) => event.target.checked ? [...current, rep.id] : current.filter((id) => String(id) !== String(rep.id)))} />
                    <FileText size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <button type="button" className="reports-name-button" onClick={(event) => { event.stopPropagation(); openReportDetails(rep); }}>{rep.name}</button>
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

                  <div><ReportStatusBadge status={rep.status} /></div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openReportDetails(rep); }} title={`View ${rep.name}`} aria-label={`View ${rep.name}`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#0284c7', display: 'flex' }}><Eye size={15} /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openReportDetails(rep, 'versions'); }} title={`Versions of ${rep.name}`} aria-label={`Versions of ${rep.name}`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#146c6c', display: 'flex' }}><History size={15} /></button>
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); openReportEditor(rep); }}
                      title={`Edit ${rep.name}`}
                      aria-label={`Edit ${rep.name}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#146c6c', display: 'flex' }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button 
                      onClick={(event) => { event.stopPropagation(); handleDeleteReport(rep.id); }}
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
          <div className="reports-pagination" aria-label="Report table pagination">
            <span>Showing {sortedReports.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, sortedReports.length)} of {sortedReports.length}</span>
            <div>
              <button type="button" disabled={visiblePage <= 1} onClick={() => setCurrentPage(visiblePage - 1)}>Previous</button>
              <span>Page {visiblePage} of {pageCount}</span>
              <button type="button" disabled={visiblePage >= pageCount} onClick={() => setCurrentPage(visiblePage + 1)}>Next</button>
            </div>
          </div>

        </div>

        {/* Recent Exports Sidebar */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Recent Exports</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentExports.length === 0 && <p className="reports-empty-note">Exports created in this browser will appear here.</p>}
            {recentExports.map((exp) => (
              <div key={exp.id || exp.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Download size={15} color="#0284c7" style={{ flexShrink: '0' }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{exp.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{exp.format?.toUpperCase() || 'Export'} • {exp.createdAt ? new Date(exp.createdAt).toLocaleString() : exp.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {editingReport && (
        <div className="documents-modal-backdrop">
          <div className="documents-modal" role="dialog" aria-modal="true" aria-labelledby="edit-report-title">
            <div className="documents-modal-heading">
              <div>
                <h3 id="edit-report-title">Edit report details</h3>
                <p>Changes are saved in this browser.</p>
              </div>
              <button type="button" className="documents-modal-close" aria-label="Close edit report dialog" onClick={() => setEditingReport(null)}>
                <X size={18} />
              </button>
            </div>
            <form className="documents-edit-form" onSubmit={handleEditReportSubmit}>
              <label htmlFor="edit-report-name">Report name</label>
              <input id="edit-report-name" required value={reportDraft.name} onChange={(event) => setReportDraft({ ...reportDraft, name: event.target.value })} />
              <label htmlFor="edit-report-description">Description</label>
              <input id="edit-report-description" required value={reportDraft.desc} onChange={(event) => setReportDraft({ ...reportDraft, desc: event.target.value })} />
              <label htmlFor="edit-report-project">Project / mine</label>
              <input id="edit-report-project" required value={reportDraft.project} onChange={(event) => setReportDraft({ ...reportDraft, project: event.target.value })} />
              <label htmlFor="edit-report-category">Category</label>
              <select id="edit-report-category" value={reportDraft.category} onChange={(event) => setReportDraft({ ...reportDraft, category: event.target.value })}>
                {['Geological', 'Mining', 'Environmental', 'Safety'].map((category) => <option key={category}>{category}</option>)}
              </select>
              <div className="documents-modal-actions">
                <button type="button" className="documents-secondary-action" onClick={() => setEditingReport(null)}>Cancel</button>
                <button type="submit" className="workspace-primary-action">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report builder */}
      {isGenerateOpen && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsGenerateOpen(false)}>
          <section className="documents-modal reports-dialog reports-builder-dialog" role="dialog" aria-modal="true" aria-labelledby="report-builder-title">
            <header className="documents-modal-heading">
              <div>
                <h3 id="report-builder-title">{selectedTemplate ? `Build · ${selectedTemplate}` : 'Generate a report'}</h3>
                <p>Step {wizardStep} of 3 · Drafts are saved to this browser in mock mode.</p>
              </div>
              <button type="button" className="documents-modal-close" aria-label="Close report builder" onClick={() => setIsGenerateOpen(false)}><X size={18} /></button>
            </header>
            <nav className="reports-stepper" aria-label="Report creation steps">
              {['Configure', 'Build sections', 'Preview'].map((step, index) => (
                <button type="button" key={step} aria-current={wizardStep === index + 1 ? 'step' : undefined} onClick={() => setWizardStep(index + 1)}>{index + 1}. {step}</button>
              ))}
            </nav>
            {reportActionError && <p className="reports-action-status" role="alert">{reportActionError}</p>}

            {wizardStep === 1 && (
              <div className="reports-builder-content">
                <div className="reports-form-grid">
                  <label>Report title<input required maxLength={140} value={reportForm.name} onChange={(event) => setWizardField('name', event.target.value)} placeholder="e.g. Jharia monthly production summary" /></label>
                  <label>Report type<select value={reportForm.reportType || 'Geological Survey Report'} onChange={(event) => {
                    const reportType = event.target.value;
                    const category = reportType.includes('Environmental') ? 'Environmental' : reportType.includes('Safety') ? 'Safety' : reportType.includes('Custom') ? 'Custom' : reportType.includes('Geological') || reportType.includes('Hydrogeological') ? 'Geological' : 'Mining';
                    setReportForm((current) => ({ ...current, reportType, category, name: current.name || reportType }));
                  }}>{reportTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                  <label>Project / mine<input list="report-project-options" required value={reportForm.project} onChange={(event) => setWizardField('project', event.target.value)} placeholder="Enter project or mine" /><datalist id="report-project-options">{projects.map((project) => <option key={project} value={project} />)}</datalist></label>
                  <label>Prepared by<input required value={reportForm.preparedBy} onChange={(event) => setWizardField('preparedBy', event.target.value)} /></label>
                  <label>Department<input required value={reportForm.department} onChange={(event) => setWizardField('department', event.target.value)} /></label>
                  <label>Assign reviewer<input value={reportForm.reviewer} onChange={(event) => setWizardField('reviewer', event.target.value)} placeholder="Required to submit for review" /></label>
                  <label>Reporting period · start<input type="date" required value={reportForm.periodStart} max={reportForm.periodEnd} onChange={(event) => setWizardField('periodStart', event.target.value)} /></label>
                  <label>Reporting period · end<input type="date" required value={reportForm.periodEnd} min={reportForm.periodStart} onChange={(event) => setWizardField('periodEnd', event.target.value)} /></label>
                  <label className="reports-form-wide">Description<textarea rows="3" maxLength={1000} value={reportForm.desc} onChange={(event) => setWizardField('desc', event.target.value)} placeholder="Purpose, scope and reporting context" /></label>
                </div>
                <div className="documents-modal-actions">
                  <button type="button" className="documents-secondary-action" onClick={() => setIsGenerateOpen(false)}>Cancel</button>
                  <button type="button" className="workspace-primary-action" onClick={() => {
                    if (!reportForm.name.trim() || !reportForm.project.trim() || !reportForm.preparedBy.trim() || !reportForm.periodStart || !reportForm.periodEnd) {
                      setReportActionError('Complete the report title, project, preparer, and reporting dates.');
                      return;
                    }
                    if (reportForm.periodStart > reportForm.periodEnd) {
                      setReportActionError('The reporting start date must be on or before the end date.');
                      return;
                    }
                    setReportActionError('');
                    setWizardStep(2);
                  }}>Configure sections</button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="reports-builder-content">
                <div className="reports-builder-columns">
                  <section>
                    <h4>Include report sections</h4>
                    <div className="reports-section-options">{reportSections.map((section) => (
                      <label key={section}><input type="checkbox" checked={reportForm.sections.includes(section)} onChange={() => toggleReportSection(section)} />{section}</label>
                    ))}</div>
                    <div className="reports-custom-section">
                      <input aria-label="New section title" value={customSection} onChange={(event) => setCustomSection(event.target.value)} placeholder="Add a custom section" />
                      <button type="button" onClick={() => {
                        const name = customSection.trim();
                        if (name && !reportForm.sections.includes(name)) setReportForm((current) => ({ ...current, sections: [...current.sections, name] }));
                        setCustomSection('');
                      }}><Plus size={14} /> Add</button>
                    </div>
                  </section>
                  <section>
                    <h4>Section order</h4>
                    <ol className="reports-section-order">{reportForm.sections.map((section, index) => (
                      <li key={`${section}-${index}`}><span>{section}</span><div><button type="button" aria-label={`Move ${section} up`} disabled={index === 0} onClick={() => shiftReportSection(index, -1)}><ChevronUp size={15} /></button><button type="button" aria-label={`Move ${section} down`} disabled={index === reportForm.sections.length - 1} onClick={() => shiftReportSection(index, 1)}><ChevronDown size={15} /></button><button type="button" aria-label={`Remove ${section}`} onClick={() => toggleReportSection(section)}><X size={14} /></button></div></li>
                    ))}</ol>
                  </section>
                </div>
                <fieldset className="reports-chart-choices">
                  <legend>Optional chart references</legend>
                  {['Production trend', 'Environmental indicators', 'Project progress'].map((chart) => (
                    <label key={chart}><input type="checkbox" checked={(reportForm.charts || []).includes(chart)} onChange={(event) => setReportForm((current) => ({ ...current, charts: event.target.checked ? [...(current.charts || []), chart] : (current.charts || []).filter((item) => item !== chart) }))} />{chart}</label>
                  ))}
                  <p>Chart references are placeholders until verified project data is connected.</p>
                </fieldset>
                <div className="reports-form-grid">
                  <label>Observations<textarea rows="3" value={reportForm.observations} onChange={(event) => setWizardField('observations', event.target.value)} placeholder="Enter technical findings or field observations" /></label>
                  <label>Recommendations<textarea rows="3" value={reportForm.recommendations} onChange={(event) => setWizardField('recommendations', event.target.value)} placeholder="Enter recommendations for review" /></label>
                </div>
                <div className="reports-ai-tools">
                  <span><Sparkles size={15} /> AI assistant (demonstration only; not connected)</span>
                  {['Executive summary', 'Technical findings', 'Observations', 'Recommendations', 'Missing sections'].map((target) => <button type="button" key={target} onClick={() => setAiDemoResult(`${target} demonstration only: ${target === 'Missing sections' ? 'Confirm all required sections against the approved reporting standard.' : `Use verified ${target.toLowerCase()} from the project source records before approving this report.`}`)}>Suggest {target}</button>)}
                </div>
                {aiDemoResult && <p className="reports-ai-demo"><strong>Demonstration suggestion — not AI-generated:</strong> {aiDemoResult}</p>}
                <div className="documents-modal-actions">
                  <button type="button" className="documents-secondary-action" onClick={() => setWizardStep(1)}>Back</button>
                  <button type="button" className="documents-secondary-action" onClick={saveCustomTemplate}><Save size={14} /> Save as template</button>
                  <button type="button" className="workspace-primary-action" disabled={!reportForm.sections.length} onClick={() => { setReportActionError(''); setWizardStep(3); }}>Preview report</button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="reports-builder-content reports-preview-scroll">
                <article className="reports-document-preview">
                  <header><span>CARBONEXA</span><strong>MINING · GEOLOGY · ENVIRONMENT</strong></header>
                  <h2>{reportForm.name || 'Untitled report'}</h2>
                  <p className="reports-preview-subtitle">{reportForm.category} · {reportForm.reportType}</p>
                  <div className="reports-preview-metadata"><span><strong>Project / Mine</strong>{reportForm.project || 'Not provided'}</span><span><strong>Reporting period</strong>{reportForm.periodStart} to {reportForm.periodEnd}</span><span><strong>Prepared by</strong>{reportForm.preparedBy} · {reportForm.department}</span></div>
                  <p>{reportForm.desc || 'No executive summary has been entered.'}</p>
                  {reportForm.sections.map((section) => <section key={section}><h3>{section}</h3><p>{section.toLowerCase().includes('recommendation') ? reportForm.recommendations || 'No recommendations have been entered.' : section.toLowerCase().includes('observation') || section.toLowerCase().includes('finding') ? reportForm.observations || 'No verified observations have been entered.' : section.toLowerCase().includes('summary') ? reportForm.desc || 'No executive summary has been entered.' : 'No linked source records are available in this frontend demonstration.'}</p></section>)}
                  {(reportForm.charts || []).length > 0 && <section><h3>Selected chart references</h3><p>{reportForm.charts.join(' · ')} — chart values require connected, verified project data.</p></section>}
                  <footer>Prepared by {reportForm.preparedBy} · Approval pending</footer>
                </article>
                <div className="documents-modal-actions">
                  <button type="button" className="documents-secondary-action" onClick={() => setWizardStep(2)}>Back to builder</button>
                  <button type="button" className="documents-secondary-action" onClick={() => saveGeneratedReport(false)}><Save size={14} /> Save draft</button>
                  <button type="button" className="workspace-primary-action" onClick={() => saveGeneratedReport(true)}><Send size={14} /> Save & submit for review</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {selectedReport && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedReport(null)}>
          <section className="documents-modal reports-dialog reports-details-dialog" role="dialog" aria-modal="true" aria-labelledby="report-detail-title">
            <header className="documents-modal-heading">
              <div><h3 id="report-detail-title">{selectedReport.name}</h3><p>{selectedReport.project} · {selectedReport.category} · <ReportStatusBadge status={selectedReport.status} /></p></div>
              <button type="button" className="documents-modal-close" aria-label="Close report details" onClick={() => setSelectedReport(null)}><X size={18} /></button>
            </header>
            <nav className="reports-detail-tabs" aria-label="Report details sections">
              {['details', 'preview', 'review', 'versions'].map((panel) => <button type="button" key={panel} aria-pressed={reportPanel === panel} onClick={() => { setReportPanel(panel); setSelectedVersion(null); }}>{panel === 'review' ? 'Review & comments' : panel[0].toUpperCase() + panel.slice(1)}</button>)}
            </nav>
            {reportActionError && <p className="reports-action-status" role="alert">{reportActionError}</p>}
            {reportPanel === 'details' && (
              <div className="reports-detail-content">
                <dl className="reports-detail-grid">
                  <div><dt>Report type</dt><dd>{selectedReport.reportType || selectedReport.category}</dd></div>
                  <div><dt>Project / mine</dt><dd>{selectedReport.project}</dd></div>
                  <div><dt>Reporting period</dt><dd>{selectedReport.periodStart || 'Not provided'} — {selectedReport.periodEnd || 'Not provided'}</dd></div>
                  <div><dt>Prepared by</dt><dd>{selectedReport.owner || selectedReport.preparedBy}</dd></div>
                  <div><dt>Department</dt><dd>{selectedReport.department || 'Not specified'}</dd></div>
                  <div><dt>Assigned reviewer</dt><dd>{selectedReport.reviewer || 'Not assigned'}</dd></div>
                  <div><dt>Updated</dt><dd>{selectedReport.updated || 'Not recorded'}</dd></div>
                  <div><dt>Approval</dt><dd>{selectedReport.approvedAt ? new Date(selectedReport.approvedAt).toLocaleString() : 'No approval recorded'}</dd></div>
                </dl>
                <p>{selectedReport.desc || 'No description supplied.'}</p>
                <div className="reports-detail-actions">
                  <button type="button" onClick={() => setReportPanel('preview')}><Eye size={14} /> Preview</button>
                  <button type="button" onClick={() => handleExport(selectedReport, 'pdf')}><Download size={14} /> Export PDF</button>
                  {(selectedReport.status === 'Draft' || selectedReport.status === 'Rejected') && <button type="button" onClick={() => handleReportAction(selectedReport, 'submit')}><Send size={14} /> Submit for review</button>}
                </div>
              </div>
            )}
            {reportPanel === 'preview' && (
              <div className="reports-builder-content reports-preview-scroll">
                <article className="reports-document-preview">
                  <header><span>CARBONEXA</span><strong>MINING · GEOLOGY · ENVIRONMENT</strong></header>
                  <h2>{selectedVersion?.name || selectedReport.name}</h2>
                  <p className="reports-preview-subtitle">{selectedVersion?.category || selectedReport.category} · {selectedVersion?.project || selectedReport.project}</p>
                  <div className="reports-preview-metadata"><span><strong>Reporting period</strong>{selectedVersion?.periodStart || selectedReport.periodStart || 'Not specified'} — {selectedVersion?.periodEnd || selectedReport.periodEnd || 'Not specified'}</span><span><strong>Status</strong>{selectedVersion?.status || selectedReport.status}</span><span><strong>Prepared by</strong>{selectedVersion?.owner || selectedReport.owner}</span></div>
                  <p>{selectedVersion?.desc || selectedReport.desc || 'No executive summary has been entered.'}</p>
                  {(selectedVersion?.sections || selectedReport.sections || []).map((section) => <section key={section}><h3>{section}</h3><p>{section.toLowerCase().includes('recommendation') ? selectedVersion?.recommendations || selectedReport.recommendations || 'No recommendations supplied.' : section.toLowerCase().includes('observation') || section.toLowerCase().includes('finding') ? selectedVersion?.observations || selectedReport.observations || 'No verified observations supplied.' : 'No linked source records are available in this frontend demonstration.'}</p></section>)}
                  <section><h3>Approval record</h3><p>{selectedReport.status} · {selectedReport.approvedAt ? new Date(selectedReport.approvedAt).toLocaleString() : 'Approval pending'}</p></section>
                  <footer>Prepared by {selectedReport.owner || selectedReport.preparedBy} · Carbonexa report preview</footer>
                </article>
              </div>
            )}
            {reportPanel === 'review' && (
              <div className="reports-detail-content">
                <div className="reports-form-grid">
                  <label>Reviewer / action by<input value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} /></label>
                  <label>Assign reviewer<input value={selectedReport.reviewer || ''} onChange={(event) => setSelectedReport((current) => ({ ...current, reviewer: event.target.value }))} /></label>
                  <label className="reports-form-wide">Reviewer comment<textarea rows="3" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Add review feedback or a rejection reason" /></label>
                </div>
                <div className="reports-detail-actions">
                  <button type="button" onClick={() => handleReportAction(selectedReport, 'comment', reviewComment)} disabled={!reviewComment.trim()}><MessageSquare size={14} /> Add comment</button>
                  {(selectedReport.status === 'Draft' || selectedReport.status === 'Rejected') && <button type="button" onClick={() => handleReportAction({ ...selectedReport, reviewer: selectedReport.reviewer }, 'submit')}><Send size={14} /> Submit for review</button>}
                  {selectedReport.status === 'Pending Review' && <button type="button" onClick={() => handleReportAction(selectedReport, 'start-review')}><Eye size={14} /> Start review</button>}
                  {['Pending Review', 'In Review'].includes(selectedReport.status) && <button type="button" onClick={() => handleReportAction(selectedReport, 'approve', reviewComment)}><Check size={14} /> Approve</button>}
                  {['Pending Review', 'In Review'].includes(selectedReport.status) && <button type="button" className="reports-reject-action" onClick={() => handleReportAction(selectedReport, 'reject', reviewComment)}><XCircle size={14} /> Reject</button>}
                </div>
                <h4>Review history</h4>
                <ol className="reports-history-list">{(selectedReport.reviewHistory || []).length === 0 && <li>No review actions recorded.</li>}{(selectedReport.reviewHistory || []).map((item, index) => <li key={`${item.at}-${index}`}><strong>{item.status}</strong><span>{item.by} · {new Date(item.at).toLocaleString()}</span>{item.comment && <p>{item.comment}</p>}</li>)}</ol>
                <h4>Reviewer comments</h4>
                <ol className="reports-history-list">{(selectedReport.comments || []).length === 0 && <li>No reviewer comments yet.</li>}{(selectedReport.comments || []).map((item) => <li key={item.id}><strong>{item.reviewer}</strong><span>{new Date(item.at).toLocaleString()}</span><p>{item.comment}</p></li>)}</ol>
              </div>
            )}
            {reportPanel === 'versions' && (
              <div className="reports-detail-content">
                {(selectedReport.versions || []).length === 0 && <p className="reports-empty-note">No previous versions yet. Editing a report creates a version snapshot.</p>}
                <ol className="reports-history-list">{(selectedReport.versions || []).map((version, index) => <li key={`${version.updatedAt || index}-${index}`}><strong>Version {index + 1}</strong><span>{version.updatedBy || 'Report owner'} · {version.updatedAt ? new Date(version.updatedAt).toLocaleString() : 'Date not recorded'}</span><p>{version.description || 'Saved report version'}</p><div className="reports-detail-actions"><button type="button" onClick={() => { setSelectedVersion(version); setReportPanel('preview'); }}><Eye size={14} /> View</button><button type="button" onClick={() => {
                  const previous = version;
                  const changes = ['name', 'project', 'category', 'desc', 'status'].filter((key) => String(previous[key] || '') !== String(selectedReport[key] || ''));
                  setReportActionError(changes.length ? `Changed since this version: ${changes.join(', ')}.` : 'No metadata differences from this version.');
                }}><GitCompare size={14} /> Compare metadata</button><button type="button" onClick={async () => {
                  try {
                    const restored = await reportService.restoreReportVersion(selectedReport.id, index);
                    setReportListRecord(restored);
                    setSelectedReport(restored);
                    setReportActionError('Previous version restored as the current report version.');
                  } catch (error) {
                    setReportActionError(error.message);
                  }
                }}>Restore</button></div></li>)}</ol>
              </div>
            )}
          </section>
        </div>
      )}

      {isExportOpen && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsExportOpen(false)}>
          <section className="documents-modal reports-dialog reports-export-dialog" role="dialog" aria-modal="true" aria-labelledby="report-export-title">
            <header className="documents-modal-heading"><div><h3 id="report-export-title">Report export center</h3><p>Exports generate downloadable files from selected report metadata.</p></div><button type="button" className="documents-modal-close" aria-label="Close export center" onClick={() => setIsExportOpen(false)}><X size={18} /></button></header>
            <label className="reports-export-format">Export format<select value={exportFormat} onChange={(event) => setExportFormat(event.target.value)}><option value="pdf">PDF</option><option value="excel">Excel workbook (.xls)</option><option value="csv">CSV</option></select></label>
            <div className="reports-export-list"><div><strong>Select reports</strong><button type="button" onClick={() => setSelectedReportIds(selectedReportIds.length === reportsList.length ? [] : reportsList.map((report) => report.id))}>{selectedReportIds.length === reportsList.length ? 'Clear all' : 'Select all'}</button></div>{reportsList.map((report) => <label key={report.id}><input type="checkbox" checked={selectedReportIds.some((id) => String(id) === String(report.id))} onChange={(event) => setSelectedReportIds((current) => event.target.checked ? [...current, report.id] : current.filter((id) => String(id) !== String(report.id)))} /><span>{report.name}<small>{report.project} · {report.status}</small></span></label>)}</div>
            {exportError && <p className="reports-action-status" role="alert">{exportError}</p>}
            <div className="documents-modal-actions"><button type="button" className="documents-secondary-action" onClick={() => setIsExportOpen(false)}>Cancel</button><button type="button" className="workspace-primary-action" disabled={isExporting || selectedReportIds.length === 0} onClick={() => handleExport(reportsList.filter((report) => selectedReportIds.some((id) => String(id) === String(report.id))))}>{isExporting ? 'Preparing export…' : `Download ${selectedReportIds.length} report${selectedReportIds.length === 1 ? '' : 's'}`}</button></div>
          </section>
        </div>
      )}

      {isScheduleOpen && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsScheduleOpen(false)}>
          <section className="documents-modal reports-dialog" role="dialog" aria-modal="true" aria-labelledby="report-schedule-title">
            <header className="documents-modal-heading"><div><h3 id="report-schedule-title">Schedule a report</h3><p>Schedules are stored as mock configuration; no background job runs in this frontend.</p></div><button type="button" className="documents-modal-close" aria-label="Close report schedule form" onClick={() => setIsScheduleOpen(false)}><X size={18} /></button></header>
            <form className="reports-form-grid" onSubmit={createSchedule}>
              <label>Schedule name<input required value={scheduleForm.name} onChange={(event) => setScheduleForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label>Frequency<select value={scheduleForm.frequency} onChange={(event) => setScheduleForm((current) => ({ ...current, frequency: event.target.value }))}>{['Daily', 'Weekly', 'Monthly', 'Custom'].map((frequency) => <option key={frequency}>{frequency}</option>)}</select></label>
              {scheduleForm.frequency === 'Custom' && <label>Custom schedule pattern<input required placeholder="e.g. Every 2 weeks" value={scheduleForm.customFrequency || ''} onChange={(event) => setScheduleForm((current) => ({ ...current, customFrequency: event.target.value }))} /></label>}
              <label>Report category<select value={scheduleForm.category} onChange={(event) => setScheduleForm((current) => ({ ...current, category: event.target.value }))}>{['Geological', 'Mining', 'Environmental', 'Safety', 'Custom'].map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Project / mine<input required value={scheduleForm.project} onChange={(event) => setScheduleForm((current) => ({ ...current, project: event.target.value }))} /></label>
              <label>Generate on<input type="date" required value={scheduleForm.generateOn} onChange={(event) => setScheduleForm((current) => ({ ...current, generateOn: event.target.value }))} /></label>
              <label className="reports-form-wide">Assigned recipient<input type="email" required value={scheduleForm.recipient} onChange={(event) => setScheduleForm((current) => ({ ...current, recipient: event.target.value }))} /></label>
              <div className="documents-modal-actions reports-form-wide"><button type="button" className="documents-secondary-action" onClick={() => setIsScheduleOpen(false)}>Cancel</button><button className="workspace-primary-action" type="submit">Save schedule</button></div>
            </form>
          </section>
        </div>
      )}

      {schedulesOpen && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSchedulesOpen(false)}>
          <section className="documents-modal reports-dialog" role="dialog" aria-modal="true" aria-labelledby="report-schedules-title">
            <header className="documents-modal-heading"><div><h3 id="report-schedules-title">Report schedules</h3><p>Mock schedule configuration only; a backend scheduler is required for automatic report generation.</p></div><button type="button" className="documents-modal-close" aria-label="Close report schedules" onClick={() => setSchedulesOpen(false)}><X size={18} /></button></header>
            {schedules.length === 0 ? <p className="reports-empty-note">No schedules configured.</p> : <ol className="reports-history-list">{schedules.map((schedule) => <li key={schedule.id}><strong>{schedule.name}</strong><span>{schedule.frequency} · {schedule.category} · {schedule.project} · {schedule.generateOn}</span><p>Recipient: {schedule.recipient} · {schedule.active ? 'Active' : 'Paused'}</p><div><button type="button" onClick={() => toggleSchedule(schedule)}>{schedule.active ? 'Deactivate schedule' : 'Activate schedule'}</button><button type="button" onClick={async () => {
              try {
                await reportService.deleteReportSchedule(schedule.id);
                setSchedules((current) => current.filter((item) => item.id !== schedule.id));
              } catch (error) {
                setReportActionError(error.message);
              }
            }}>Delete schedule</button></div></li>)}</ol>}
            <div className="documents-modal-actions"><button type="button" className="documents-secondary-action" onClick={() => setSchedulesOpen(false)}>Close</button><button type="button" className="workspace-primary-action" onClick={() => { setSchedulesOpen(false); setIsScheduleOpen(true); }}>Add schedule</button></div>
          </section>
        </div>
      )}

      {isCompareOpen && compareReports.length === 2 && (
        <div className="documents-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsCompareOpen(false)}>
          <section className="documents-modal reports-dialog" role="dialog" aria-modal="true" aria-labelledby="report-compare-title">
            <header className="documents-modal-heading"><div><h3 id="report-compare-title">Compare reports</h3><p>Only values present in report records can be compared; no operational figures are fabricated.</p></div><button type="button" className="documents-modal-close" aria-label="Close report comparison" onClick={() => setIsCompareOpen(false)}><X size={18} /></button></header>
            <div className="reports-detail-actions"><button type="button" onClick={() => setAiDemoResult(`Demonstration only: compare ${compareReports[0].name} and ${compareReports[1].name} using their saved metadata. Attach verified production, environmental and geological source data before drawing technical conclusions.`)}><Sparkles size={14} /> Explain differences · demo</button></div>
            {aiDemoResult && <p className="reports-ai-demo"><strong>Demonstration only:</strong> {aiDemoResult}</p>}
            <div className="reports-comparison-grid"><strong>Field</strong><strong>{compareReports[0].name}</strong><strong>{compareReports[1].name}</strong>{[
              ['Project / mine', 'project'], ['Category', 'category'], ['Reporting period', 'periodStart'], ['Status', 'status'], ['Geological observations', 'observations'], ['Production figures', 'productionFigures'], ['Environmental indicators', 'environmentalIndicators'], ['Project progress', 'projectProgress'], ['Key findings', 'findings'], ['Recommendations', 'recommendations'],
            ].map(([label, key]) => <div className="reports-comparison-row" key={key}><strong>{label}</strong><span>{key === 'periodStart' ? `${compareReports[0].periodStart || 'Not provided'} — ${compareReports[0].periodEnd || 'Not provided'}` : compareReports[0][key] || 'No structured data attached'}</span><span>{key === 'periodStart' ? `${compareReports[1].periodStart || 'Not provided'} — ${compareReports[1].periodEnd || 'Not provided'}` : compareReports[1][key] || 'No structured data attached'}</span></div>)}</div>
          </section>
        </div>
      )}

    </div>
  );
}

export default Reports;