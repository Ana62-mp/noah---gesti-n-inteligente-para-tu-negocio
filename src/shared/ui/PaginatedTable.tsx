import React from 'react';
import { Pagination } from './Pagination';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

interface PaginatedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  rowKey: (item: T) => string | number;
  onRowClick?: (item: T) => void;
}

export function PaginatedTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'No hay registros',
  emptyDescription = 'No se encontraron resultados con los criterios seleccionados.',
  emptyAction,
  rowKey,
  onRowClick,
}: PaginatedTableProps<T>) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <SkeletonLoader rows={pageSize > 5 ? 5 : pageSize} cols={columns.length} />;
  }

  if (total === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E0] overflow-hidden shadow-xs">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F4F1] border-b border-[#E7E5E0] text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-2.5 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E0]">
            {data.map((item) => (
              <tr
                key={rowKey(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors hover:bg-[#FBF6E6]/40 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, cIdx) => {
                  let cellContent: React.ReactNode;
                  if (typeof col.accessor === 'function') {
                    cellContent = col.accessor(item);
                  } else if (col.accessor) {
                    cellContent = (item[col.accessor] as unknown) as React.ReactNode;
                  } else {
                    cellContent = null;
                  }

                  return (
                    <td
                      key={cIdx}
                      className={`py-2.5 px-4 text-[#111111] ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden divide-y divide-[#E7E5E0]">
        {data.map((item) => (
          <li key={rowKey(item)} onClick={onRowClick ? () => onRowClick(item) : undefined} className={`p-3 space-y-1.5 ${onRowClick ? 'cursor-pointer' : ''}`}>
            {columns.map((column, index) => (
              <div key={index} className="flex items-start justify-between gap-3 text-xs">
                <span className="shrink-0 text-[11px] font-semibold text-[#6B6B6B]">{column.header}</span>
                <span className="min-w-0 text-right">
                  {typeof column.accessor === 'function' ? column.accessor(item) : column.accessor ? String(item[column.accessor]) : null}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
