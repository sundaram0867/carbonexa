import { dataMode, requestJson } from './api';
import { reportMockSeed } from '../data/reportMockData';

const reportsKey = 'carbonexa-reports';
const schedulesKey = 'carbonexa-report-schedules';
const exportsKey = 'carbonexa-report-exports';
const customTemplatesKey = 'carbonexa-custom-report-templates';
const apiPath = (reportId = '') => `/reports${reportId ? `/${encodeURIComponent(reportId)}` : ''}`;

function readLocalArray(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const value = JSON.parse(stored);
    if (!Array.isArray(value)) throw new Error('Stored report data is invalid.');
    return value;
  } catch {
    throw new Error('Report data could not be read from this browser. Check browser storage, then try again.');
  }
}

function writeLocalArray(key, records) {
  try {
    localStorage.setItem(key, JSON.stringify(records));
  } catch {
    throw new Error('Report changes could not be saved in this browser. Check available storage.');
  }
}

function assertRecord(payload, action) {
  if (!payload?.data || typeof payload.data !== 'object') {
    throw new Error(`The reports API response must contain ${action} in a data object.`);
  }
  return payload.data;
}

const reportById = (reports, reportId) => reports.find((report) => String(report.id) === String(reportId));

function saveReport(report) {
  const reports = reportService.getMockReports();
  const index = reports.findIndex((item) => String(item.id) === String(report.id));
  if (index < 0) throw new Error('Report was not found.');
  const next = [...reports];
  next[index] = report;
  writeLocalArray(reportsKey, next);
  return report;
}

function withHistory(report, status, by, comment = '') {
  const timestamp = new Date().toISOString();
  return {
    ...report,
    status,
    lastActionBy: by,
    updated: new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    year: new Date(timestamp).getFullYear().toString(),
    month: new Date(timestamp).toLocaleString('en', { month: 'short' }),
    reviewHistory: [...(report.reviewHistory || []), { status, by, at: timestamp, comment }],
  };
}

function escapeXml(value) {
  return String(value ?? '').replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[character]);
}

function reportRows(report) {
  return [
    ['Report', report.name],
    ['Project / Mine', report.project],
    ['Category', report.category],
    ['Reporting period', `${report.periodStart || 'Not specified'} to ${report.periodEnd || 'Not specified'}`],
    ['Status', report.status],
    ['Prepared by', report.owner],
    ['Department', report.department || 'Not specified'],
    ['Description', report.desc],
    ['Sections', (report.sections || []).join('; ')],
    ['Observations', report.observations || ''],
    ['Recommendations', report.recommendations || ''],
  ];
}

function createPdf(report) {
  const lines = reportRows(report).flatMap(([label, value]) => {
    const clean = `${label}: ${value || 'Not provided'}`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '?');
    const chunks = clean.match(/.{1,88}(\s|$)/g) || [clean];
    return chunks.map((chunk) => chunk.trim());
  });
  const content = [
    'BT',
    '/F1 17 Tf',
    '50 790 Td',
    '(CARBONEXA - Mining Report) Tj',
    '/F1 10 Tf',
    ...lines.flatMap((line) => ['0 -20 Td', `(${line.replace(/[\\()]/g, '\\$&')}) Tj`]),
    'ET',
  ].join('\n');
  const encoder = new TextEncoder();
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildExport(reports, format) {
  const rows = reports.flatMap((report, index) => [
    ...(index ? [['', '']] : []),
    ...reportRows(report),
  ]);
  if (format === 'csv') {
    const csv = rows.map((row) => row.map((cell) => {
      const value = String(cell ?? '');
      const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    }).join(',')).join('\r\n');
    return { blob: new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), extension: 'csv' };
  }
  if (format === 'excel') {
    const table = rows.map(([label, value]) => `<Row><Cell><Data ss:Type="String">${escapeXml(label)}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell></Row>`).join('');
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Reports"><Table>${table}</Table></Worksheet></Workbook>`;
    return { blob: new Blob([workbook], { type: 'application/vnd.ms-excel' }), extension: 'xls' };
  }
  if (format === 'pdf' && reports.length === 1) return { blob: createPdf(reports[0]), extension: 'pdf' };
  throw new Error('PDF export supports one report at a time. Choose Excel or CSV for multiple reports.');
}

function getStoredSchedules() {
  return readLocalArray(schedulesKey, []);
}

export const reportService = {
  getMockReports() {
    return readLocalArray(reportsKey, reportMockSeed);
  },
  saveMockReports(reports) {
    writeLocalArray(reportsKey, reports);
  },
  async getReports({ signal } = {}) {
    if (dataMode === 'mock') return this.getMockReports();
    const payload = await requestJson(apiPath(), { signal });
    if (!Array.isArray(payload?.data)) throw new Error('The reports API response must contain a data array.');
    return payload.data;
  },
  async createReport(record) {
    if (dataMode === 'php') return assertRecord(await requestJson(apiPath(), { method: 'POST', body: JSON.stringify(record) }), 'the created report');
    const timestamp = new Date().toISOString();
    const report = {
      ...record,
      id: globalThis.crypto?.randomUUID?.() || `report-${Date.now()}`,
      status: 'Draft',
      updated: new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      year: new Date(timestamp).getFullYear().toString(),
      month: new Date(timestamp).toLocaleString('en', { month: 'short' }),
      owner: record.preparedBy,
      initials: record.preparedBy.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      reviewHistory: [],
      comments: [],
      versions: [],
    };
    writeLocalArray(reportsKey, [report, ...this.getMockReports()]);
    return report;
  },
  async updateReport(reportId, changes, description = 'Updated report content') {
    if (dataMode === 'php') return assertRecord(await requestJson(apiPath(reportId), { method: 'PUT', body: JSON.stringify({ ...changes, versionDescription: description }) }), 'the updated report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    const versionSnapshot = { ...report, versions: undefined, updatedAt: new Date().toISOString(), updatedBy: report.owner, description };
    return saveReport({ ...report, ...changes, versions: [...(report.versions || []), versionSnapshot] });
  },
  async deleteReport(reportId) {
    if (dataMode === 'php') {
      await requestJson(apiPath(reportId), { method: 'DELETE' });
      return;
    }
    const reports = this.getMockReports();
    if (!reportById(reports, reportId)) throw new Error('Report was not found.');
    writeLocalArray(reportsKey, reports.filter((report) => String(report.id) !== String(reportId)));
  },
  async getReportDetails(reportId) {
    if (dataMode === 'php') return assertRecord(await requestJson(apiPath(reportId)), 'the report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    return report;
  },
  async generateReport(record) {
    return this.createReport(record);
  },
  async submitReportForReview(reportId, reviewer) {
    if (dataMode === 'php') return assertRecord(await requestJson(`${apiPath(reportId)}/submit`, { method: 'POST', body: JSON.stringify({ reviewer }) }), 'the updated report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    return saveReport(withHistory({ ...report, reviewer }, 'Pending Review', report.owner, `Submitted to ${reviewer} for review.`));
  },
  async startReportReview(reportId, reviewer) {
    if (dataMode === 'php') return assertRecord(await requestJson(`${apiPath(reportId)}/review`, { method: 'POST', body: JSON.stringify({ reviewer }) }), 'the report in review');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    return saveReport(withHistory(report, 'In Review', reviewer, 'Review started.'));
  },
  async approveReport(reportId, reviewer, comment = '') {
    if (dataMode === 'php') return assertRecord(await requestJson(`${apiPath(reportId)}/approve`, { method: 'POST', body: JSON.stringify({ reviewer, comment }) }), 'the approved report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    const next = withHistory(report, 'Approved', reviewer, comment);
    next.approvedAt = new Date().toISOString();
    return saveReport(next);
  },
  async rejectReport(reportId, reviewer, comment) {
    if (dataMode === 'php') return assertRecord(await requestJson(`${apiPath(reportId)}/reject`, { method: 'POST', body: JSON.stringify({ reviewer, comment }) }), 'the rejected report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    return saveReport(withHistory(report, 'Rejected', reviewer, comment));
  },
  async addReviewerComment(reportId, reviewer, comment) {
    if (dataMode === 'php') return assertRecord(await requestJson(`${apiPath(reportId)}/comments`, { method: 'POST', body: JSON.stringify({ reviewer, comment }) }), 'the updated report');
    const report = reportById(this.getMockReports(), reportId);
    if (!report) throw new Error('Report was not found.');
    return saveReport({
      ...report,
      comments: [...(report.comments || []), { id: Date.now(), reviewer, comment, at: new Date().toISOString() }],
    });
  },
  async getReportVersions(reportId) {
    if (dataMode === 'php') {
      const payload = await requestJson(`${apiPath(reportId)}/versions`);
      if (!Array.isArray(payload?.data)) throw new Error('The report versions API response must contain a data array.');
      return payload.data;
    }
    const report = await this.getReportDetails(reportId);
    return report.versions || [];
  },
  async restoreReportVersion(reportId, versionIndex) {
    const versions = await this.getReportVersions(reportId);
    const version = versions[versionIndex];
    if (!version) throw new Error('Report version was not found.');
    if (dataMode === 'php') {
      const versionId = version.id || version.version || String(versionIndex + 1);
      return assertRecord(await requestJson(`${apiPath(reportId)}/versions/${encodeURIComponent(versionId)}/restore`, { method: 'POST' }), 'the restored report');
    }
    const snapshot = Object.fromEntries(
      Object.entries(version).filter(([key]) => !['id', 'versions', 'updatedAt', 'updatedBy', 'description'].includes(key))
    );
    return this.updateReport(reportId, snapshot, `Restored version ${versionIndex + 1}`);
  },
  async compareReports(reportIds) {
    if (dataMode === 'php') {
      const payload = await requestJson('/reports/compare', { method: 'POST', body: JSON.stringify({ reportIds }) });
      if (!Array.isArray(payload?.data)) throw new Error('The report comparison API response must contain a data array.');
      return payload.data;
    }
    if (reportIds.length !== 2) throw new Error('Select exactly two reports to compare.');
    const reports = this.getMockReports();
    return reportIds.map((id) => {
      const report = reportById(reports, id);
      if (!report) throw new Error('A selected report was not found.');
      return report;
    });
  },
  async getReportSchedules() {
    if (dataMode === 'php') {
      const payload = await requestJson('/reports/schedules');
      if (!Array.isArray(payload?.data)) throw new Error('The report schedules API response must contain a data array.');
      return payload.data;
    }
    return getStoredSchedules();
  },
  async scheduleReport(schedule) {
    if (dataMode === 'php') return assertRecord(await requestJson('/reports/schedules', { method: 'POST', body: JSON.stringify(schedule) }), 'the created schedule');
    const saved = { ...schedule, id: globalThis.crypto?.randomUUID?.() || `schedule-${Date.now()}`, createdAt: new Date().toISOString(), active: true };
    writeLocalArray(schedulesKey, [saved, ...getStoredSchedules()]);
    return saved;
  },
  async updateReportSchedule(scheduleId, changes) {
    if (dataMode === 'php') return assertRecord(await requestJson(`/reports/schedules/${encodeURIComponent(scheduleId)}`, { method: 'PATCH', body: JSON.stringify(changes) }), 'the updated schedule');
    const schedules = getStoredSchedules();
    const updated = schedules.map((schedule) => schedule.id === scheduleId ? { ...schedule, ...changes } : schedule);
    if (!schedules.some((schedule) => schedule.id === scheduleId)) throw new Error('Report schedule was not found.');
    writeLocalArray(schedulesKey, updated);
    return updated.find((schedule) => schedule.id === scheduleId);
  },
  async deleteReportSchedule(scheduleId) {
    if (dataMode === 'php') {
      await requestJson(`/reports/schedules/${encodeURIComponent(scheduleId)}`, { method: 'DELETE' });
      return;
    }
    const schedules = getStoredSchedules();
    if (!schedules.some((schedule) => schedule.id === scheduleId)) throw new Error('Report schedule was not found.');
    writeLocalArray(schedulesKey, schedules.filter((schedule) => schedule.id !== scheduleId));
  },
  async exportReport(reports, format) {
    const records = Array.isArray(reports) ? reports : [reports];
    if (!records.length) throw new Error('Select at least one report to export.');
    if (dataMode === 'php') {
      const result = assertRecord(await requestJson('/reports/export', {
        method: 'POST',
        body: JSON.stringify({ reportIds: records.map((report) => report.id), format }),
      }), 'an export download URL');
      if (typeof result.downloadUrl !== 'string') throw new Error('The export response must contain a downloadUrl.');
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || '';
      document.body.append(link);
      link.click();
      link.remove();
      return result;
    }
    const { blob, extension } = buildExport(records, format);
    const filename = `${records.length === 1 ? records[0].name : 'Carbonexa_Reports'}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    downloadBlob(blob, filename);
    const exports = readLocalArray(exportsKey, []);
    const item = { id: Date.now(), name: filename, format, reportIds: records.map((report) => report.id), createdAt: new Date().toISOString() };
    writeLocalArray(exportsKey, [item, ...exports].slice(0, 20));
    return item;
  },
  async getRecentExports() {
    if (dataMode === 'php') {
      const payload = await requestJson('/reports/exports');
      if (!Array.isArray(payload?.data)) throw new Error('The exports API response must contain a data array.');
      return payload.data;
    }
    return readLocalArray(exportsKey, []);
  },
  async getCustomReportTemplates() {
    if (dataMode === 'php') {
      const payload = await requestJson('/reports/templates');
      if (!Array.isArray(payload?.data)) throw new Error('The report templates API response must contain a data array.');
      return payload.data;
    }
    return readLocalArray(customTemplatesKey, []);
  },
  async saveCustomReportTemplate(template) {
    if (dataMode === 'php') return assertRecord(await requestJson('/reports/templates', { method: 'POST', body: JSON.stringify(template) }), 'the created report template');
    const saved = { ...template, id: globalThis.crypto?.randomUUID?.() || `template-${Date.now()}` };
    writeLocalArray(customTemplatesKey, [saved, ...readLocalArray(customTemplatesKey, [])]);
    return saved;
  },
};
