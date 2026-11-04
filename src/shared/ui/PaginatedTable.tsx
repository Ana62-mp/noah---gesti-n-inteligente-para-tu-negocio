import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

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
  emptyTitle = 'No hay registros',
  emptyDescription = 'No se encontraron resultados con los criterios seleccionados.',
  emptyAction,
  rowKey,
  onRowClick,
}: PaginatedTableProps<T>) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F4F1] border-b border-[#E7E5E0] text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 ${
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
                      className={`py-3 px-4 text-[#111111] ${
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

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#FAFAF8] border-t border-[#E7E5E0] text-xs text-[#6B6B6B]">
        {/* Visible Range Counter */}
        <div className="tabular-nums">
          Mostrando <span className="font-semibold text-[#111111]">{startItem}</span> a{' '}
          <span className="font-semibold text-[#111111]">{endItem}</span> de{' '}
          <span className="font-semibold text-[#111111]">{total}</span> registros
        </div>

        {/* Page Size & Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-[#E7E5E0] rounded-lg px-2 py-1 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1 rounded-lg border border-[#E7E5E0] bg-white text-[#111111] hover:bg-[#F5F4F1] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-lg border border-[#E7E5E0] bg-white text-[#111111] hover:bg-[#F5F4F1] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium tabular-nums text-[#111111]">
              {page} / {totalPages || 1}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-lg border border-[#E7E5E0] bg-white text-[#111111] hover:bg-[#F5F4F1] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1 rounded-lg border border-[#E7E5E0] bg-white text-[#111111] hover:bg-[#F5F4F1] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
