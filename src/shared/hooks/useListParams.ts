import { useCallback, useState } from 'react';

interface ListParams {
  page: number;
  pageSize: number;
  filter: string;
  search: string;
  extras: Record<string, string>;
}

const EXTRA_PREFIX = 'x_';

const readQuery = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '');

const writeQuery = (params: ListParams, defaults: ListParams) => {
  const query = new URLSearchParams();
  if (params.page !== defaults.page) query.set('page', String(params.page));
  if (params.pageSize !== defaults.pageSize) query.set('size', String(params.pageSize));
  if (params.filter !== defaults.filter) query.set('filter', params.filter);
  if (params.search) query.set('q', params.search);
  Object.entries(params.extras).forEach(([key, value]) => value && query.set(`${EXTRA_PREFIX}${key}`, value));
  const [section] = window.location.hash.split('?');
  const suffix = query.toString() ? `?${query}` : '';
  window.history.replaceState(null, '', `${window.location.pathname}${section}${suffix}`);
};

const readExtras = (query: URLSearchParams): Record<string, string> =>
  Object.fromEntries(
    [...query.entries()].filter(([key]) => key.startsWith(EXTRA_PREFIX)).map(([key, value]) => [key.slice(EXTRA_PREFIX.length), value])
  );

// Keeps page, size, filters and search in the URL so a list survives a reload and can be shared.
export const useListParams = (defaultFilter = 'all', defaultPageSize = 10) => {
  const defaults: ListParams = { page: 1, pageSize: defaultPageSize, filter: defaultFilter, search: '', extras: {} };
  const [params, setParams] = useState<ListParams>(() => {
    const query = readQuery();
    return {
      page: Number(query.get('page')) || 1,
      pageSize: Number(query.get('size')) || defaultPageSize,
      filter: query.get('filter') ?? defaultFilter,
      search: query.get('q') ?? '',
      extras: readExtras(query),
    };
  });

  const update = useCallback((changes: Partial<ListParams>) => {
    setParams((current) => {
      const next = { ...current, ...changes };
      writeQuery(next, defaults);
      return next;
    });
  }, []);

  const setField = (key: string, value: string) =>
    key === 'filter' ? update({ filter: value, page: 1 }) : update({ extras: { ...params.extras, [key]: value }, page: 1 });

  const activeFilters =
    (params.filter !== defaultFilter ? 1 : 0) + Object.values(params.extras).filter(Boolean).length + (params.search ? 1 : 0);

  return {
    ...params,
    fieldValues: { filter: params.filter, ...params.extras },
    activeFilters,
    setField,
    reset: () => update({ filter: defaultFilter, search: '', extras: {}, page: 1 }),
    setPage: (page: number) => update({ page }),
    setPageSize: (pageSize: number) => update({ pageSize, page: 1 }),
    setFilter: (filter: string) => update({ filter, page: 1 }),
    setSearch: (search: string) => update({ search, page: 1 }),
  };
};
