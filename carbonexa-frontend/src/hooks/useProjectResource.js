import { useCallback, useEffect, useState } from 'react';

export function useProjectResource(service, projectId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!projectId) return undefined;
    const controller = new AbortController();
    service.list(projectId, { signal: controller.signal }).then((nextRecords) => {
      if (!controller.signal.aborted) {
        setRecords(nextRecords);
        setError('');
      }
    }).catch((loadError) => {
      if (!controller.signal.aborted && loadError?.name !== 'AbortError') {
        setError(loadError.message || 'Could not load this project information.');
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [projectId, service]);

  const refresh = useCallback(async (signal) => {
    if (!projectId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const nextRecords = await service.list(projectId, { signal });
      if (!signal?.aborted) {
        setRecords(nextRecords);
        setError('');
      }
    } catch (loadError) {
      if (loadError?.name !== 'AbortError') setError(loadError.message || 'Could not load this project information.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [projectId, service]);

  const create = useCallback(async (record) => {
    setError('');
    setSuccess('');
    const createdRecord = await service.create(projectId, record);
    setRecords((current) => [createdRecord, ...current]);
    setSuccess('Record added.');
    return createdRecord;
  }, [projectId, service]);

  const update = useCallback(async (recordId, changes) => {
    setError('');
    setSuccess('');
    const updatedRecord = await service.update(projectId, recordId, changes);
    setRecords((current) => current.map((record) => record.id === recordId ? updatedRecord : record));
    setSuccess('Changes saved.');
    return updatedRecord;
  }, [projectId, service]);

  const remove = useCallback(async (recordId) => {
    setError('');
    setSuccess('');
    await service.remove(projectId, recordId);
    setRecords((current) => current.filter((record) => record.id !== recordId));
    setSuccess('Record deleted.');
  }, [projectId, service]);

  return { records, loading, error, success, refresh, create, update, remove, clearMessages: () => { setError(''); setSuccess(''); } };
}
