import { useEffect, useState } from 'react';
import { dataMode } from '../config/api';
import { reportService } from '../services/reportService';

export function useReportLibrary(initialReports) {
  const [reports, setReports] = useState(initialReports);
  const [isLoading, setIsLoading] = useState(dataMode === 'php');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dataMode !== 'php') return undefined;
    let active = true;
    reportService.getReports()
      .then((records) => {
        if (active) setReports(records);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Reports could not be loaded from the API.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { reports, setReports, isLoading, error };
}
