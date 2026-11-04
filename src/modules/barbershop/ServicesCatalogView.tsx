import React from 'react';
import { CalendarPlus, Clock } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { BARBER_SERVICES_MOCK } from '../../shared/services/mockData';
import { Button } from '../../shared/ui/Button';
import { formatCurrency } from '../../shared/utils/formatters';

export const ServicesCatalogView: React.FC = () => {
  const { setActiveSection, canAccess } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {BARBER_SERVICES_MOCK.map(({ id, name, description, durationMinutes, price }) => (
        <article key={id} className="card-lift bg-white rounded-2xl border border-[#E7E5E0] border-t-4 border-t-[#CF6811] p-4 flex flex-col gap-2">
          <h2 className="font-display font-extrabold text-sm text-[#111111]">{name}</h2>
          <p className="flex-1 text-xs text-[#6B6B6B]">{description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#6B6B6B]"><Clock className="w-3.5 h-3.5" /> {durationMinutes} min</span>
            <span className="text-base font-black tabular-nums text-[#111111]">{formatCurrency(price)}</span>
          </div>
          {canAccess('appointments') && (
            <Button variant="secondary" size="sm" leftIcon={<CalendarPlus className="w-3.5 h-3.5" />} onClick={() => setActiveSection('appointments')}>
              Agendar
            </Button>
          )}
        </article>
      ))}
    </div>
  );
};
