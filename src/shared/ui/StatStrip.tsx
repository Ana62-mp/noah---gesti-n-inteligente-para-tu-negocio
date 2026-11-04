import React from 'react';

export type StatTone = 'cinnamon' | 'banana' | 'olive' | 'terracotta' | 'harvest';

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
}

const TONE_BAR: Record<StatTone, string> = {
  cinnamon: 'bg-[#CF6811]',
  banana: 'bg-[#D59F3F]',
  olive: 'bg-[#5C5011]',
  terracotta: 'bg-[#A43108]',
  harvest: 'bg-[#8A7424]',
};

const COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};

export const StatStrip: React.FC<{ stats: Stat[] }> = ({ stats }) => (
  <div className={`grid gap-3 ${COLUMNS[stats.length] ?? 'grid-cols-2 md:grid-cols-4'}`}>
    {stats.map(({ label, value, hint, tone = 'cinnamon' }) => (
      <div key={label} className="relative overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <span className={`absolute inset-y-0 left-0 w-1 ${TONE_BAR[tone]}`} />
        <div className="text-[11px] font-bold uppercase tracking-wide text-[#6B6B6B]">{label}</div>
        <div className="text-xl font-black tabular-nums text-[#111111]">{value}</div>
        {hint && <div className="text-[11px] text-[#6B6B6B] truncate">{hint}</div>}
      </div>
    ))}
  </div>
);
