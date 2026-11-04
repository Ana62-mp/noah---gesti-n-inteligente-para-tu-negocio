import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DEFAULT_SIZES = [10, 20, 50];

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sizes?: number[];
}

const NAV_BUTTON =
  'w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7E5E0] bg-white text-[#111111] hover:bg-[#FBF6E6] disabled:opacity-30 disabled:pointer-events-none transition-colors';

export const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange, sizes = DEFAULT_SIZES }) => {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#FAFAF8] border-t border-[#E7E5E0] text-xs text-[#6B6B6B]">
      <div className="tabular-nums">
        Mostrando <strong className="text-[#111111]">{start}</strong> a <strong className="text-[#111111]">{end}</strong> de{' '}
        <strong className="text-[#111111]">{total}</strong>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5">
          Por página
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="bg-white border border-[#E7E5E0] rounded-lg px-2 py-1 text-xs text-[#111111]"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(1)} disabled={page <= 1} className={NAV_BUTTON} aria-label="Primera página">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={NAV_BUTTON} aria-label="Página anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold tabular-nums text-[#111111]">{page} / {totalPages || 1}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={NAV_BUTTON} aria-label="Página siguiente">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className={NAV_BUTTON} aria-label="Última página">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
