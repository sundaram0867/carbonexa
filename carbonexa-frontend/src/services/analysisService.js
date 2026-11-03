import { dataMode, requestJson } from './api';
import {
  ANALYSIS_ENVIRONMENT,
  ANALYSIS_ENVIRONMENT_THRESHOLDS,
  ANALYSIS_GEOLOGY,
  ANALYSIS_MINES,
  ANALYSIS_PRODUCTION,
  ANALYSIS_REPORTS,
} from '../data/analysisMockData';

/**
 * Analysis API contract (JSON):
 * GET /analysis/overview -> { data: { miningOutputTonnes, co2Tonnes, activeMines, reportCount } }
 * GET /analysis/production?mineIds=&dateFrom=&dateTo= -> { data: ProductionRecord[] }
 * GET /analysis/mines -> { data: MineOutput[] }
 * GET /analysis/geology?mineIds= -> { data: GeologicalRecord[] }
 * GET /analysis/environment?mineIds=&dateFrom=&dateTo= -> { data: EnvironmentalRecord[], thresholds: ThresholdMap }
 * POST /analysis/compare -> { data: ComparisonResult[] }; body { mineIds, projectIds, metrics, dateFrom, dateTo }
 * POST /analysis/custom -> { data: { id, configuration, rows, generatedAt } }; body { projectIds, category, metrics, period, chartType }
 * GET /analysis/insights -> { data: { status: 'ready'|'unavailable', insights: Insight[] } }
 * GET /analysis/details/:kind/:id -> { data: AnalysisDetail }
 * POST /analysis/export -> file response or { data: { downloadUrl } }; body { format, title, columns, rows }
 * Collection records use stable IDs and ISO dates; measurements include units in their field names or metadata.
 */

const clone = (value) => structuredClone(value);
const withinDates = (record, { dateFrom, dateTo } = {}) => (
  (!dateFrom || record.date >= dateFrom) && (!dateTo || record.date <= dateTo)
);
const matchingMines = (record, mineIds) => mineIds == null || mineIds.includes(record.mineId);
const filtered = (rows, filters = {}) => rows.filter((row) => matchingMines(row, filters.mineIds) && withinDates(row, filters));

const demoOverview = () => ({
  miningOutputTonnes: ANALYSIS_PRODUCTION.filter((row) => row.date === '2026-09-01').reduce((sum, row) => sum + row.actualTonnes, 0),
  co2Tonnes: ANALYSIS_ENVIRONMENT.filter((row) => row.date === '2026-09-01').reduce((sum, row) => sum + row.co2Tonnes, 0),
  activeMines: ANALYSIS_MINES.filter((mine) => mine.status === 'Active').length,
  reportCount: ANALYSIS_REPORTS.length + 21,
  source: 'demonstration',
});

const postOrMock = async (path, body, mock) => {
  if (dataMode === 'mock') return mock();
  const response = await requestJson(path, { method: 'POST', body: JSON.stringify(body) });
  if (!('data' in (response || {}))) throw new Error('The analysis API response must contain a data property.');
  return response.data;
};

export const analysisService = {
  async getAnalysisOverview() {
    if (dataMode === 'mock') return clone(demoOverview());
    const payload = await requestJson('/analysis/overview');
    if (!payload?.data || typeof payload.data !== 'object') throw new Error('The analysis overview response must contain an object in data.');
    return payload.data;
  },
  async getMiningOutput(filters = {}) {
    if (dataMode === 'mock') return clone(filtered(ANALYSIS_PRODUCTION, filters));
    const params = new URLSearchParams();
    filters.mineIds?.forEach((id) => params.append('mineIds[]', id));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    const payload = await requestJson(`/analysis/production${params.size ? `?${params}` : ''}`, { signal: filters.signal });
    if (!Array.isArray(payload?.data)) throw new Error('The production response must contain a data array.');
    return payload.data;
  },
  async getMineWiseOutput() {
    if (dataMode === 'mock') return clone(ANALYSIS_MINES);
    const payload = await requestJson('/analysis/mines');
    if (!Array.isArray(payload?.data)) throw new Error('The mine output response must contain a data array.');
    return payload.data;
  },
  async getGeologicalAnalytics(filters = {}) {
    if (dataMode === 'mock') return clone(ANALYSIS_GEOLOGY.filter((row) => matchingMines(row, filters.mineIds)));
    const params = new URLSearchParams();
    filters.mineIds?.forEach((id) => params.append('mineIds[]', id));
    const payload = await requestJson(`/analysis/geology${params.size ? `?${params}` : ''}`, { signal: filters.signal });
    if (!Array.isArray(payload?.data)) throw new Error('The geology response must contain a data array.');
    return payload.data;
  },
  async getEnvironmentalIndicators(filters = {}) {
    if (dataMode === 'mock') return {
      records: clone(filtered(ANALYSIS_ENVIRONMENT, filters)),
      thresholds: clone(ANALYSIS_ENVIRONMENT_THRESHOLDS),
      source: 'demonstration',
    };
    const params = new URLSearchParams();
    filters.mineIds?.forEach((id) => params.append('mineIds[]', id));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    const payload = await requestJson(`/analysis/environment${params.size ? `?${params}` : ''}`, { signal: filters.signal });
    if (!Array.isArray(payload?.data) || !payload.thresholds) throw new Error('The environmental response must include data and thresholds.');
    return { records: payload.data, thresholds: payload.thresholds, source: 'api' };
  },
  async getProductionTrends(filters = {}) {
    return this.getMiningOutput(filters);
  },
  async compareMines(request) {
    return postOrMock('/analysis/compare', request, () => {
      const mineIds = request.mineIds || [];
      const periods = filtered(ANALYSIS_PRODUCTION, { mineIds, dateFrom: request.dateFrom, dateTo: request.dateTo });
      return mineIds.map((mineId) => {
        const mine = ANALYSIS_MINES.find((item) => item.id === mineId);
        const rows = periods.filter((row) => row.mineId === mineId);
        const actual = rows.reduce((sum, row) => sum + row.actualTonnes, 0);
        const target = rows.reduce((sum, row) => sum + row.targetTonnes, 0);
        const environment = filtered(ANALYSIS_ENVIRONMENT, { mineIds: [mineId], dateFrom: request.dateFrom, dateTo: request.dateTo });
        const geology = ANALYSIS_GEOLOGY.find((item) => item.mineId === mineId);
        return {
          mineId, mine: mine?.name || mineId, actualTonnes: actual, targetTonnes: target,
          achievement: target ? Number(((actual / target) * 100).toFixed(1)) : 0,
          co2Tonnes: environment.reduce((sum, row) => sum + row.co2Tonnes, 0),
          reserveMt: geology?.reserveMt ?? null,
          productivity: mine?.productivity ?? null,
        };
      });
    });
  },
  async compareProjects(request) {
    return this.compareMines(request);
  },
  async getAnalysisDetails(kind, id) {
    if (dataMode === 'mock') {
      const collections = { mine: ANALYSIS_MINES, production: ANALYSIS_PRODUCTION, geology: ANALYSIS_GEOLOGY, environment: ANALYSIS_ENVIRONMENT, report: ANALYSIS_REPORTS };
      const record = collections[kind]?.find((item) => String(item.id ?? item.mineId) === String(id));
      if (!record) throw new Error(`No ${kind} detail was found for ${id}.`);
      return clone(record);
    }
    const payload = await requestJson(`/analysis/details/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`);
    if (!payload?.data || typeof payload.data !== 'object') throw new Error('The analysis detail response must contain an object in data.');
    return payload.data;
  },
  async generateCustomAnalysis(configuration) {
    return postOrMock('/analysis/custom', configuration, () => {
      const mineIds = configuration.mineIds || [];
      const filters = { mineIds, dateFrom: configuration.dateFrom, dateTo: configuration.dateTo };
      const sourceRecords = configuration.category === 'Geological'
        ? ANALYSIS_GEOLOGY.filter((row) => matchingMines(row, mineIds))
        : configuration.category === 'Environmental'
          ? filtered(ANALYSIS_ENVIRONMENT, filters)
          : filtered(ANALYSIS_PRODUCTION, filters);
      const selectedMetrics = configuration.metrics || ['actualTonnes'];
      const rows = sourceRecords.map((row) => Object.fromEntries([
        ['period', row.month || row.date || 'Current'], ['mine', row.mine],
        ...selectedMetrics.map((metric) => [metric, row[metric] ?? '—']),
      ]));
      return { id: `demo-${Date.now()}`, configuration: clone(configuration), rows, generatedAt: new Date().toISOString(), source: 'demonstration' };
    });
  },
  async getAnalyticalInsights() {
    if (dataMode === 'mock') return { status: 'unavailable', insights: [], source: 'demonstration', message: 'No AI insights service is connected. Connect a backend insights provider to generate findings.' };
    const payload = await requestJson('/analysis/insights');
    if (!payload?.data || !Array.isArray(payload.data.insights)) throw new Error('The insights response must contain an insights array.');
    return payload.data;
  },
  async exportAnalysis(request) {
    if (dataMode === 'mock') return { status: 'client-export', request };
    return requestJson('/analysis/export', { method: 'POST', body: JSON.stringify(request) });
  },
};
