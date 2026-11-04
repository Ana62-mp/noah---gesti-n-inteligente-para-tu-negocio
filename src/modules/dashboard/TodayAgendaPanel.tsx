import React, { useEffect, useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Appointment } from '../../shared/types';
import { Button } from '../../shared/ui/Button';

const VISIBLE_APPOINTMENTS = 4;

export const TodayAgendaPanel: React.FC = () => {
  const { setActiveSection } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    apiService.getAppointments().then((all) => {
      setAppointments(all.filter(a => a.status === 'confirmed' || a.status === 'in_progress').sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, VISIBLE_APPOINTMENTS));
    });
  }, []);

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#111111]">Próximas citas</h3>
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('appointments')}>Ver agenda</Button>
      </div>
      <ul className="divide-y divide-[#E7E5E0]">
        {appointments.map(({ id, date, time, customerName, serviceName, barberName }) => (
          <li key={id} className="py-1.5 flex items-center gap-2.5 text-xs">
            <span className="font-black tabular-nums text-[#CF6811]"><span className="block text-[10px] text-[#6B6B6B]">{date.slice(5).split('-').reverse().join('/')}</span>{time}</span>
            <span className="flex-1 min-w-0 truncate font-semibold text-[#111111]">{customerName}</span>
            <span className="text-[11px] text-[#6B6B6B] truncate">{serviceName} · {barberName}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
