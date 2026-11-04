import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BARBER_SERVICES_MOCK } from '../../../shared/services/mockData';
import { BarberService } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';

export const BarberServices: React.FC<{ onPick: (service: BarberService) => void }> = ({ onPick }) => (
  <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
    <PhoneHeader eyebrow="Barber Kings" title="Servicios" />
    {BARBER_SERVICES_MOCK.map((service) => (
      <button key={service.id} onClick={() => onPick(service)} className="w-full ph-card p-3 flex items-center gap-2 text-left">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold">{service.name}</div>
          <div className="text-[11px] ph-muted">{service.durationMinutes} min · {formatCurrency(service.price)}</div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#CF6811] shrink-0" />
      </button>
    ))}
  </div>
);
