import { useCallback, useState } from 'react';

interface ListParams {
  page: number;
  pageSize: number;
  filter: string;
  search: string;
}

const readQuery = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '');

const writeQuery = (params: ListParams, defaults: ListParams) => {
  const query = new URLSearchParams();
  if (params.page !== defaults.page) query.set('page', String(params.page));
  if (params.pageSize !== defaults.pageSize) query.set('size', String(params.pageSize));
  if (params.filter !== defaults.filter) query.set('filter', params.filter);
  if (params.search) query.set('q', params.search);
  const [section] = window.location.hash.split('?');
  const suffix = query.toString() ? `?${query}` : '';
  window.history.replaceState(null, '', `${window.location.pathname}${section}${suffix}`);
};

// Keeps page, size and filters in the URL so a list survives a reload and can be shared.
export const useListParams = (defaultFilter = 'all', defaultPageSize = 10) => {
  const defaults: ListParams = { page: 1, pageSize: defaultPageSize, filter: defaultFilter, search: '' };
  const [params, setParams] = useState<ListParams>(() => {
    const query = readQuery();
    return {
      page: Number(query.get('page')) || 1,
      pageSize: Number(query.get('size')) || defaultPageSize,
      filter: query.get('filter') ?? defaultFilter,
      search: query.get('q') ?? '',
    };
  });

  const update = useCallback((changes: Partial<ListParams>) => {
    setParams((current) => {
      const next = { ...current, ...changes };
      writeQuery(next, defaults);
      return next;
    });
  }, []);

  return {
    ...params,
    setPage: (page: number) => update({ page }),
    setPageSize: (pageSize: number) => update({ pageSize, page: 1 }),
    setFilter: (filter: string) => update({ filter, page: 1 }),
    setSearch: (search: string) => update({ search, page: 1 }),
  };
};
