import { useEffect, useState } from 'react';
import { PaginatedResult, PaginationParams } from '../services/apiService';
import { getErrorMessage } from '../utils/errors';
import { useListParams } from './useListParams';

export const usePagedList = <T,>(
  fetchPage: (params: PaginationParams) => Promise<PaginatedResult<T>>,
  defaultFilter = 'all',
  defaultPageSize = 10
) => {
  const list = useListParams(defaultFilter, defaultPageSize);
  const [result, setResult] = useState<PaginatedResult<T>>({ items: [], total: 0, page: 1, pageSize: defaultPageSize, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setResult(await fetchPage({ page: list.page, pageSize: list.pageSize, filter: list.filter, search: list.search, extras: list.extras }));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [list.page, list.pageSize, list.filter, list.search, JSON.stringify(list.extras)]);

  return { ...list, result, isLoading, error, reload };
};
