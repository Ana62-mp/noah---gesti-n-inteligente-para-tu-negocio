import React from 'react';
import { formatCurrency } from '../utils/formatters';

const FIELD_LABELS: Record<string, string> = {
  metodoPago: 'Método de pago',
  categoria: 'Categoría',
  mesa: 'Mesa',
  precioPromo: 'Precio promo',
  precioOriginal: 'Precio original',
};

const MONEY_FIELDS = new Set(['monto', 'total', 'valor', 'subtotal']);
const CATEGORY_LABELS: Record<string, string> = {
  insumos: 'Insumos',
  servicios: 'Servicios básicos',
  otros: 'Otros',
};

interface DraftOrderItem {
  nombre?: string;
  cantidad?: number;
  subtotal?: number;
  nota?: string;
}

export const humanizeKey = (key: string): string => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const formatValue = (key: string, value: unknown): string => {
  if (MONEY_FIELDS.has(key) && typeof value === 'number') return formatCurrency(value);
  if (key === 'categoria' && typeof value === 'string') return CATEGORY_LABELS[value] ?? value;
  return String(value);
};

const OrderItems: React.FC<{ items: DraftOrderItem[] }> = ({ items }) => (
  <ul className="space-y-1 py-1">
    {items.map((item, index) => (
      <li key={index} className="flex justify-between gap-3">
        <span className="text-[#111111]">
          <strong>{item.cantidad}×</strong> {item.nombre}
          {item.nota && <span className="block text-[11px] text-[#A43108]">{item.nota}</span>}
        </span>
        {typeof item.subtotal === 'number' && (
          <span className="font-semibold text-[#111111] tabular-nums shrink-0">{formatCurrency(item.subtotal)}</span>
        )}
      </li>
    ))}
  </ul>
);

export const DraftDetails: React.FC<{ details: Record<string, unknown> }> = ({ details }) => (
  <div className="space-y-1 text-xs text-[#6B6B6B]">
    {Object.entries(details).map(([key, value]) =>
      Array.isArray(value) ? (
        <OrderItems key={key} items={value as DraftOrderItem[]} />
      ) : (
        <div key={key} className="flex justify-between gap-3">
          <span className="shrink-0">{humanizeKey(key)}:</span>
          <span className="font-semibold text-[#111111] text-right">{formatValue(key, value)}</span>
        </div>
      )
    )}
  </div>
);
