import React from 'react';
import { DeliveryOrder } from '../../shared/types';

interface DeliveryStatusSummaryProps {
  orders: DeliveryOrder[];
}

const STATUS_TILES: { status: DeliveryOrder['status']; label: string; style: string }[] = [
  { status: 'received', label: 'Recibidos', style: 'bg-[#F6D98F] border-[#D59F3F] text-[#2B1A00]' },
  { status: 'in_kitchen', label: 'En cocina', style: 'bg-[#E6DA9C] border-[#8A7424] text-[#3F3409]' },
  { status: 'on_the_way', label: 'En camino', style: 'bg-[#F9CFA6] border-[#CF6811] text-[#5C2A04]' },
  { status: 'delivered', label: 'Entregados', style: 'bg-[#DCD8A8] border-[#5C5011] text-[#2F2906]' },
];

export const DeliveryStatusSummary: React.FC<DeliveryStatusSummaryProps> = ({ orders }) => (
  <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-3">
    {STATUS_TILES.map(({ status, label, style }) => (
      <div key={status} className={`card-lift rounded-2xl border-2 px-5 py-4 ${style}`}>
        <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
        <div className="text-3xl font-black tabular-nums">
          {orders.filter((order) => order.status === status).length}
        </div>
      </div>
    ))}
  </div>
);
