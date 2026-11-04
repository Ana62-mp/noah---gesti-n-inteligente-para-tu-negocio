import React from 'react';
import { RotateCcw, Search } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterField =
  | { key: string; label: string; type: 'select'; options: FilterOption[] }
  | { key: string; label: string; type: 'date' };

interface FilterBarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
  fields?: FilterField[];
  values?: Record<string, string>;
  onChange?: (key: string, value: string) => void;
  onReset?: () => void;
  activeCount?: number;
  total?: number;
  totalLabel?: string;
}

const CONTROL = 'h-9 rounded-lg border border-[#E7E5E0] bg-[#FAFAF8] px-2.5 text-xs text-[#111111] focus:bg-white';

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  fields = [],
  values = {},
  onChange,
  onReset,
  activeCount = 0,
  total,
  totalLabel = 'resultados',
}) => (
  <div className="flex flex-wrap items-end gap-x-3 gap-y-2 rounded-2xl border border-[#E7E5E0] bg-white p-3 shadow-[var(--shadow-soft)]">
    {search && (
      <label className="flex-1 basis-[200px] min-w-0 text-[11px] font-semibold text-[#6B6B6B]">
        Buscar
        <span className="relative block mt-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[#6B6B6B]" />
          <input
            type="search"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            className={`${CONTROL} w-full pl-8 font-normal`}
          />
        </span>
      </label>
    )}

    {fields.map((field) => (
      <label key={field.key} className="text-[11px] font-semibold text-[#6B6B6B]">
        {field.label}
        {field.type === 'select' ? (
          <select
            value={values[field.key] ?? field.options[0]?.value ?? ''}
            onChange={(event) => onChange?.(field.key, event.target.value)}
            className={`${CONTROL} block mt-1 min-w-[140px] font-normal`}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="date"
            value={values[field.key] ?? ''}
            onChange={(event) => onChange?.(field.key, event.target.value)}
            className={`${CONTROL} block mt-1 font-normal`}
          />
        )}
      </label>
    ))}

    <div className="flex items-center gap-2 h-9 ml-auto">
      {total !== undefined && (
        <span className="text-xs text-[#6B6B6B] tabular-nums">
          <strong className="text-[#111111]">{total}</strong> {totalLabel}
        </span>
      )}
      {activeCount > 0 && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 h-9 px-2.5 rounded-lg border border-[#CF6811]/40 bg-[#FCEFE3] text-xs font-bold text-[#8F4608] hover:bg-[#F9CFA6]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpiar ({activeCount})
        </button>
      )}
    </div>
  </div>
);
