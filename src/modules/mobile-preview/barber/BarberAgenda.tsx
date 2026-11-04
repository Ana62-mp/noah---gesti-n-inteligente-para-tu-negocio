import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { apiService } from '../../../shared/services/apiService';
import { Appointment } from '../../../shared/types';
import { Badge, BadgeVariant } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';

export const BARBER_NAME = 'David';
export const AGENDA_DATE = '2026-11-03';

const STATUS: Record<Appointment['status'], { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Confirmada', variant: 'olive' },
  in_progress: { label: 'En sillón', variant: 'banana' },
  completed: { label: 'Atendida', variant: 'neutral' },
  cancelled: { label: 'Cancelada', variant: 'terracotta' },
};

export const BarberAgenda: React.FC<{ onBook: () => void }> = ({ onBook }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    apiService.getAppointments().then((all) => {
      setAppointments(
        all
          .filter(({ barberName, date }) => barberName === BARBER_NAME && date === AGENDA_DATE)
          .sort((a, b) => a.time.localeCompare(b.time))
      );
    });
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow="Barber Kings · Martes 03/11" title={`Agenda de ${BARBER_NAME}`} />
      <Button variant="primary" className="w-full" leftIcon={<Mic className="w-4 h-4" />} onClick={onBook}>
        Agendar por voz
      </Button>
      {appointments.map((appointment) => (
        <div key={appointment.id} className="ph-card p-3 flex items-start gap-3">
          <div className="shrink-0 text-center">
            <div className="text-sm font-black tabular-nums">{appointment.time}</div>
            <div className="text-[10px] ph-muted">{appointment.durationMinutes} min</div>
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs font-bold truncate">{appointment.customerName}</span>
              <Badge variant={STATUS[appointment.status].variant} size="sm">{STATUS[appointment.status].label}</Badge>
            </div>
            <div className="text-[11px] ph-muted truncate">{appointment.serviceName}</div>
            <div className="text-[11px] font-bold tabular-nums">{formatCurrency(appointment.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
