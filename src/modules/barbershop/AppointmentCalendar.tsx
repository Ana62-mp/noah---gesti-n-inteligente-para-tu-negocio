import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Appointment } from '../../shared/types';

export const AppointmentCalendar: React.FC<{
  date: string;
  appointments: Appointment[];
  onSelect: (date: string) => void;
  onBook: (date: string) => void;
}> = ({ date, appointments, onSelect, onBook }) => {
  const [month, setMonth] = useState(() => date.slice(0, 7));
  useEffect(() => { setMonth(date.slice(0, 7)); }, [date]);
  const [year, number] = month.split('-').map(Number);
  const first = new Date(year, number - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, number, 0).getDate();
  const move = (delta: number) => {
    const next = new Date(year, number - 1 + delta, 1);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };
  return (
    <section className="rounded-2xl border border-[#E7E5E0] bg-white p-3 sm:p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div><h3 className="font-bold capitalize">{first.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}</h3><p className="text-xs text-[#6B6B6B]">Selecciona un día para consultar su agenda.</p></div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Mes anterior" onClick={() => move(-1)} className="p-2 rounded-lg border border-[#E7E5E0]"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => setMonth(date.slice(0, 7))} className="text-xs font-semibold px-2 py-2">Día seleccionado</button>
          <button type="button" aria-label="Mes siguiente" onClick={() => move(1)} className="p-2 rounded-lg border border-[#E7E5E0]"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => <div key={day} className="text-center text-xs font-bold text-[#6B6B6B] pb-2">{day}</div>)}
        {Array.from({ length: offset }, (_, i) => <div key={`blank-${i}`} />)}
        {Array.from({ length: count }, (_, i) => {
          const key = `${month}-${String(i + 1).padStart(2, '0')}`;
          const booked = appointments.filter(a => a.date === key && a.status !== 'cancelled').length;
          return <button type="button" key={key} onClick={() => onSelect(key)} aria-pressed={date === key} aria-label={`${key}: ${booked} citas`}
            className={`min-h-16 sm:min-h-24 rounded-xl border p-1 sm:p-3 text-left transition-colors ${date === key ? 'border-[#CF6811] bg-[#FDEBD6] ring-1 ring-[#CF6811]' : 'border-[#E7E5E0] hover:bg-[#FBF6E6]'}`}>
            <span className="block text-sm font-bold">{i + 1}</span>
            {booked > 0 && <span className="block mt-2 text-[10px] sm:text-xs text-[#8F4608] font-semibold">{booked}<span className="hidden sm:inline"> {booked === 1 ? 'cita' : 'citas'}</span></span>}
          </button>;
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6B6B]">
        <span>Las citas del calendario respetan los filtros seleccionados.</span>
        <button type="button" onClick={() => onBook(date)} className="flex items-center gap-1 rounded-lg bg-[#CF6811] text-white px-3 py-2 font-bold"><Plus size={15} /> Reservar el {date.split('-').reverse().join('/')}</button>
      </div>
    </section>
  );
};
