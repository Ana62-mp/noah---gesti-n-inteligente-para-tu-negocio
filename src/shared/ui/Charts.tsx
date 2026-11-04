import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const CURRENT_COLOR = '#CF6811';
const PREVIOUS_COLOR = '#8C8479';

export interface ComparisonPoint {
  day: string;
  current: number;
  previous: number;
}

interface ComparisonChartProps {
  data: ComparisonPoint[];
  currentLabel: string;
  previousLabel: string;
}

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B6B6B]">
    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
    {label}
  </span>
);

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, currentLabel, previousLabel }) => (
  <div className="flex-1 min-h-[120px] flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <LegendItem color={CURRENT_COLOR} label={currentLabel} />
      <LegendItem color={PREVIOUS_COLOR} label={previousLabel} />
    </div>
    <div className="relative flex-1 min-h-[100px]">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map((point) => ({ ...point, current: point.current || null }))} barGap={2} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#EFEDE8" />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#E7E5E0' }} tick={{ fontSize: 11, fill: '#6B6B6B' }} />
            <YAxis width={44} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6B6B6B' }} tickFormatter={(value) => `$${Number(value).toLocaleString('es-EC')}`} />
            <Tooltip
              cursor={{ fill: '#FBF6E6' }}
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 12, border: '1px solid #EBD48F', fontSize: 12 }}
              itemStyle={{ color: '#111111' }}
            />
            <Bar dataKey="previous" name={previousLabel} fill={PREVIOUS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            <Bar dataKey="current" name={currentLabel} fill={CURRENT_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <table className="sr-only">
      <caption>{currentLabel} frente a {previousLabel}</caption>
      <tbody>
        {data.map(({ day, current, previous }) => (
          <tr key={day}>
            <th>{day}</th>
            <td>{formatCurrency(current)}</td>
            <td>{formatCurrency(previous)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CategoryBars: React.FC<{ items: { label: string; value: number }[] }> = ({ items }) => {
  const max = Math.max(...items.map(({ value }) => value), 1);
  const total = items.reduce((sum, { value }) => sum + value, 0);
  return (
    <ul className="flex-1 flex flex-col justify-around gap-1">
      {items.map(({ label, value }) => (
        <li key={label} title={`${label}: ${formatCurrency(value)}`}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-[#111111] truncate">{label}</span>
            <span className="font-bold tabular-nums text-[#111111] shrink-0">
              {formatCurrency(value)} <span className="font-medium text-[#6B6B6B]">{Math.round((value / total) * 100)} %</span>
            </span>
          </div>
          <div className="h-2 mt-0.5 rounded-full bg-[#F5F4F1] overflow-hidden">
            <div className="h-full rounded-full bg-[#CF6811]" style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};
