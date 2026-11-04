import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

// Validated categorical set (CVD and normal-vision checks pass); first hue is the brand cinnamon.
export const CATEGORICAL_COLORS = ['#CF6811', '#3B73B9', '#A8A21F', '#9B4F9E', '#2F9E7A', '#B83232'];

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SLICE_GAP = 2;
const STROKE = 14;
const STROKE_ACTIVE = 18;

export interface DonutDatum {
  label: string;
  value: number;
}

interface DonutChartProps {
  data: DonutDatum[];
  centerCaption: string;
  formatValue?: (value: number) => string;
  size?: number;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, centerCaption, formatValue = formatCurrency, size = 168, className = '' }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, { value }) => sum + value, 0) || 1;
  let consumed = 0;
  const hoveredItem = hovered === null ? null : data[hovered];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-3 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${centerCaption}: ${formatValue(total)}`} className="-rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#F5F4F1" strokeWidth={STROKE} />
          {data.map(({ label, value }, index) => {
            const length = (value / total) * CIRCUMFERENCE;
            const dash = Math.max(length - SLICE_GAP, 0.5);
            const offset = -consumed;
            consumed += length;
            return (
              <circle
                key={label}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]}
                strokeWidth={hovered === index ? STROKE_ACTIVE : STROKE}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={offset}
                className="donut-slice cursor-pointer"
                style={{ ['--dash' as string]: `${dash}px`, ['--rest' as string]: `${CIRCUMFERENCE - dash}px`, animationDelay: `${index * 90}ms`, opacity: hovered === null || hovered === index ? 1 : 0.45 }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${label}: ${formatValue(value)} (${Math.round((value / total) * 100)} %)`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-[18%]">
          <span className="text-[10px] font-semibold text-[#6B6B6B] leading-tight line-clamp-2">{hoveredItem ? hoveredItem.label : centerCaption}</span>
          <span className="text-[15px] font-black tabular-nums text-[#111111] leading-tight">{formatValue(hoveredItem ? hoveredItem.value : total)}</span>
          {hoveredItem && <span className="text-[11px] font-bold text-[#CF6811]">{Math.round((hoveredItem.value / total) * 100)} %</span>}
        </div>
      </div>

      <ul className="flex-1 min-w-[190px] space-y-1">
        {data.map(({ label, value }, index) => (
          <li
            key={label}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors ${hovered === index ? 'bg-[#FBF6E6]' : ''}`}
          >
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length] }} />
            <span className="flex-1 min-w-0 truncate font-medium text-[#111111]">{label}</span>
            <span className="tabular-nums font-bold text-[#111111]">{formatValue(value)}</span>
            <span className="w-9 text-right tabular-nums text-[#6B6B6B]">{Math.round((value / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export interface WeekPoint {
  day: string;
  current: number;
  previous: number;
}

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const WeekProgress: React.FC<{ data: WeekPoint[] }> = ({ data }) => {
  const currentTotal = data.reduce((sum, { current }) => sum + current, 0);
  const previousTotal = data.reduce((sum, { previous }) => sum + previous, 0) || 1;
  const ratio = Math.min(currentTotal / previousTotal, 1);
  const rowMax = Math.max(...data.flatMap(({ current, previous }) => [current, previous]), 1);

  return (
    <div className="flex flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <div className="relative shrink-0 w-[150px] h-[150px]">
        <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label={`Llevas ${Math.round(ratio * 100)} % de lo vendido la semana anterior`} className="-rotate-90">
          <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="#F1E3CF" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke="#CF6811"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${ratio * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            className="donut-slice"
            style={{ ['--dash' as string]: `${ratio * RING_CIRCUMFERENCE}px`, ['--rest' as string]: `${RING_CIRCUMFERENCE}px` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black tabular-nums text-[#111111]">{Math.round(ratio * 100)} %</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B6B6B] leading-tight px-4">de la semana anterior</span>
        </div>
      </div>

      <ul className="flex-1 min-w-[220px] space-y-1">
        {data.map(({ day, current, previous }) => {
          const delta = previous ? (current - previous) / previous : 0;
          return (
            <li key={day} className="grid grid-cols-[2rem_1fr_4.5rem] items-center gap-2 text-xs" title={`${day}: ${formatCurrency(current)} frente a ${formatCurrency(previous)}`}>
              <span className="font-bold text-[#6B6B6B]">{day}</span>
              <span className="space-y-0.5">
                <span className="block h-1.5 rounded-full bg-[#8C8479]/70" style={{ width: `${(previous / rowMax) * 100}%` }} />
                <span className="block h-1.5 rounded-full bg-[#CF6811]" style={{ width: `${(current / rowMax) * 100}%` }} />
              </span>
              <span className={`text-right tabular-nums font-bold ${current === 0 ? 'text-[#6B6B6B]' : delta >= 0 ? 'text-[#2F7D5B]' : 'text-[#B83232]'}`}>
                {current === 0 ? '—' : `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(0)} %`}
              </span>
            </li>
          );
        })}
        <li className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-[#6B6B6B]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#CF6811]" />Esta semana</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#8C8479]/70" />Semana anterior</span>
        </li>
      </ul>
    </div>
  );
};
