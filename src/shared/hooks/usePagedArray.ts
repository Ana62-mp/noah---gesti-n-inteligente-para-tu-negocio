import { useEffect, useState } from 'react';

// Client-side pagination for short boards and card grids that are not served by the paged API.
export const usePagedArray = <T,>(items: T[], defaultPageSize = 6) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [items.length, pageSize]);

  return {
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
    total: items.length,
    visible: items.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize),
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
};
