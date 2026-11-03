import { useCallback, useEffect, useState } from 'react';
import { analysisService } from '../services/analysisService';

const emptyWorkspace = { overview: null, production: [], mines: [], geology: [], environment: { records: [], thresholds: {}, source: 'demonstration' } };

export function useAnalysisWorkspace(filters = {}) {
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [operationError, setOperationError] = useState('');

  const mineKey = (filters.mineIds || []).join(',');
  const dateFrom = filters.dateFrom || '';
  const dateTo = filters.dateTo || '';

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const selectedFilters = { mineIds: mineKey ? mineKey.split(',') : [], dateFrom, dateTo, signal };
      if (selectedFilters.mineIds.length === 0) {
        setWorkspace((current) => ({ ...current, production: [], geology: [], environment: { ...current.environment, records: [] } }));
        setLoading(false);
        return;
      }
      const [overview, production, mines, geology, environment] = await Promise.all([
        analysisService.getAnalysisOverview(),
        analysisService.getMiningOutput(selectedFilters),
        analysisService.getMineWiseOutput(),
        analysisService.getGeologicalAnalytics(selectedFilters),
        analysisService.getEnvironmentalIndicators(selectedFilters),
      ]);
      if (!signal?.aborted) setWorkspace({ overview, production, mines, geology, environment });
    } catch (loadError) {
      if (loadError?.name !== 'AbortError' && !signal?.aborted) setError(loadError.message || 'Analysis data could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [dateFrom, dateTo, mineKey]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (!controller.signal.aborted) refresh(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [refresh]);

  const compare = useCallback(async (request) => {
    setOperationError('');
    try {
      return await analysisService.compareMines(request);
    } catch (operationFailure) {
      setOperationError(operationFailure.message || 'Mine comparison could not be loaded.');
      return [];
    }
  }, []);

  const generate = useCallback(async (configuration) => {
    setOperationError('');
    try {
      return await analysisService.generateCustomAnalysis(configuration);
    } catch (operationFailure) {
      setOperationError(operationFailure.message || 'Custom analysis could not be generated.');
      return null;
    }
  }, []);

  const getInsights = useCallback(async () => {
    setOperationError('');
    try {
      return await analysisService.getAnalyticalInsights();
    } catch (operationFailure) {
      setOperationError(operationFailure.message || 'Analytical insights could not be loaded.');
      return { status: 'error', insights: [] };
    }
  }, []);

  return { ...workspace, loading, error, operationError, refresh, compare, generate, getInsights };
}
