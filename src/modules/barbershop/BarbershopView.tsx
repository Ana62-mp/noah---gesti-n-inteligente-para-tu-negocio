import React, { useEffect, useState } from 'react';
import { Plus, Mic } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Appointment } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { RowActions } from '../../shared/ui/RowActions';
import { Modal } from '../../shared/ui/Modal';
import { StatStrip } from '../../shared/ui/StatStrip';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { formatCurrency } from '../../shared/utils/formatters';
import { findFreeSlots, hasAppointmentOverlap, isWithinBusinessHours } from '../../shared/utils/appointmentRules';
import { AppointmentCalendar } from './AppointmentCalendar';

const BARBERS = ['David', 'Carlos', 'Andrés'];
const STATUS = { confirmed: 'Confirmada', in_progress: 'En el sillón', completed: 'Atendida', cancelled: 'Cancelada' };
const CONTROL = 'mt-1 w-full rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] p-2.5 text-sm';

export const BarbershopView: React.FC = () => {
  const { showToast, setActiveSection, canAccess } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const services = apiService.listServices().filter(s => s.isActive);
  const [date, setDate] = useState('2026-11-03');
  const [barber, setBarber] = useState('David');
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({ customerName: '', customerPhone: '', date, barberName: barber, serviceId: services[0]?.id ?? '', time: '10:00' });
  const load = async () => setAppointments(await apiService.getAppointments());
  useEffect(() => { void load(); }, []);
  const validate = (data: Pick<Appointment, 'barberName' | 'date' | 'time' | 'durationMinutes' | 'status'>, others: Appointment[]) => {
    if (!isWithinBusinessHours(data.time, data.durationMinutes)) throw new Error('El servicio debe comenzar desde las 10:00 y finalizar hasta las 20:00.');
    if (data.status !== 'cancelled' && hasAppointmentOverlap(others, data)) throw new Error('Este horario ya está ocupado. Elige otro horario o consulta las alternativas.');
  };
  const crud = useEntityCrud<Appointment>({
    collection: 'appointments', noun: 'cita', nameOf: a => `La cita de ${a.customerName}`, onChanged: () => { void load(); },
    deleteWarning: 'la cita se quitará de la agenda.',
    fields: [
      { key: 'customerName', label: 'Cliente', type: 'text', required: true },
      { key: 'customerPhone', label: 'Celular', type: 'tel' },
      { key: 'serviceId', label: 'Servicio', type: 'select', required: true, options: apiService.listServices().map(s => ({ value: s.id, label: s.name })) },
      { key: 'barberName', label: 'Barbero', type: 'select', required: true, options: BARBERS.map(value => ({ value, label: value })) },
      { key: 'date', label: 'Fecha', type: 'date', required: true },
      { key: 'time', label: 'Hora', type: 'time', required: true },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: Object.entries(STATUS).map(([value, label]) => ({ value, label })) },
    ],
    emptyValues: () => ({ ...booking, status: 'confirmed' }),
    toValues: a => ({ customerName: a.customerName, customerPhone: a.customerPhone, serviceId: a.serviceId, barberName: a.barberName, date: a.date, time: a.time, status: a.status }),
    fromValues: (v, current) => {
      const service = apiService.listServices().find(s => s.id === v.serviceId);
      if (!service) throw new Error('Selecciona un servicio válido.');
      const data = { customerName: String(v.customerName).trim(), customerPhone: String(v.customerPhone), serviceId: service.id, serviceName: service.name, barberName: String(v.barberName), date: String(v.date), time: String(v.time), status: v.status as Appointment['status'], durationMinutes: service.durationMinutes, price: service.price };
      validate(data, appointments.filter(a => a.id !== current?.id));
      return data;
    },
  });
  const matching = appointments.filter(a => a.barberName === barber && (!serviceFilter || a.serviceId === serviceFilter) && (!statusFilter || a.status === statusFilter) && `${a.customerName} ${a.customerPhone}`.toLowerCase().includes(query.trim().toLowerCase()));
  const day = appointments.filter(a => a.date === date && a.barberName === barber);
  const visible = matching.filter(a => a.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const previewService = services.find(s => s.id === serviceFilter) ?? services[0];
  const selectedService = services.find(s => s.id === booking.serviceId);
  const available = previewService ? findFreeSlots(appointments, { date, barberName: barber, time: '09:45', durationMinutes: previewService.durationMinutes }, 40) : [];
  const alternatives = selectedService ? findFreeSlots(appointments, { ...booking, durationMinutes: selectedService.durationMinutes }) : [];
  const book = (selectedDate: string, time = available[0] ?? '10:00') => {
    setBooking({ customerName: '', customerPhone: '', date: selectedDate, barberName: barber, serviceId: previewService?.id ?? '', time });
    setError(''); setOpen(true);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    try {
      if (!selectedService || !booking.customerName.trim() || !booking.date) throw new Error('Completa los datos de la reserva.');
      const data = { ...booking, customerName: booking.customerName.trim(), serviceName: selectedService.name, durationMinutes: selectedService.durationMinutes, price: selectedService.price, status: 'confirmed' as const };
      validate(data, appointments);
      setSaving(true);
      await apiService.addAppointment(data);
      await load();
      setDate(booking.date); setBarber(booking.barberName); setOpen(false);
      showToast(`Cita confirmada para ${data.customerName} a las ${data.time}`, 'success');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta nuevamente.'); }
    finally { setSaving(false); }
  };
  const update = (key: keyof typeof booking, value: string) => { setBooking(b => ({ ...b, [key]: value })); setError(''); };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-bold text-lg">Cada cita, a su tiempo</h2><p className="text-xs text-[#6B6B6B]">Organiza tu equipo, consulta la disponibilidad y reserva desde el calendario.</p></div>
      <div className="flex gap-2">{canAccess('voice_scenarios') && <Button variant="secondary" size="sm" leftIcon={<Mic size={16} />} onClick={() => setActiveSection('voice_scenarios')}>Reservar por voz</Button>}<Button size="sm" leftIcon={<Plus size={16} />} onClick={() => book(date)}>Nueva cita</Button></div>
    </div>
    <StatStrip stats={[
      { label: 'Citas del día', value: String(day.length), hint: `${barber} · ${date}`, tone: 'cinnamon' },
      { label: 'Confirmadas', value: String(day.filter(a => a.status === 'confirmed').length), hint: 'Clientes por recibir', tone: 'banana' },
      { label: 'Atendidas', value: String(day.filter(a => a.status === 'completed').length), hint: 'Servicios finalizados', tone: 'olive' },
      { label: 'Valor agendado', value: formatCurrency(day.filter(a => a.status !== 'cancelled').reduce((sum, a) => sum + a.price, 0)), hint: 'Excluye cancelaciones', tone: 'harvest' },
    ]} />
    <FilterBar search={{ value: query, onChange: setQuery, placeholder: 'Buscar cliente o teléfono…' }} fields={[
      { key: 'barber', label: 'Barbero', type: 'select', options: BARBERS.map(value => ({ value, label: value })) },
      { key: 'service', label: 'Servicio', type: 'select', options: [{ value: '', label: 'Todos' }, ...services.map(s => ({ value: s.id, label: s.name }))] },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, ...Object.entries(STATUS).map(([value, label]) => ({ value, label }))] },
    ]} values={{ barber, service: serviceFilter, status: statusFilter }} onChange={(k, v) => k === 'barber' ? setBarber(v) : k === 'service' ? setServiceFilter(v) : setStatusFilter(v)} onReset={() => { setQuery(''); setServiceFilter(''); setStatusFilter(''); }} activeCount={[query, serviceFilter, statusFilter].filter(Boolean).length} total={visible.length} totalLabel="citas del día" />
    <AppointmentCalendar date={date} appointments={matching} onSelect={setDate} onBook={book} />
    <section className="rounded-2xl border border-[#E7E5E0] bg-white p-4 space-y-4">
      <div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-bold capitalize">{new Date(`${date}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })} · {barber}</h3><p className="text-xs text-[#6B6B6B]">Atención de 10:00 a 20:00</p></div><Badge variant="olive">Agenda diaria</Badge></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map(a => <article key={a.id} className="rounded-xl border border-[#EBD48F] bg-[#FBF6E6] p-4 space-y-2">
        <div className="flex justify-between gap-2"><strong className="text-lg">{a.time}</strong><Badge variant={a.status === 'cancelled' ? 'neutral' : 'cinnamon'}>{STATUS[a.status]}</Badge></div>
        <h4 className="font-bold text-sm">{a.customerName}</h4><p className="text-xs text-[#6B6B6B]">{a.serviceName} · {a.durationMinutes} min</p><p className="text-xs text-[#6B6B6B]">{a.customerPhone}</p>
        <div className="flex justify-between items-center border-t border-[#EBD48F] pt-2"><strong>{formatCurrency(a.price)}</strong><RowActions name={a.customerName} onEdit={() => crud.openEdit(a)} onDelete={() => crud.askDelete(a)} /></div>
      </article>)}</div>
      {visible.length === 0 && <p className="rounded-xl bg-[#FAFAF8] p-5 text-sm text-[#6B6B6B]">No hay citas que coincidan para este día. Cambia los filtros o reserva un horario disponible.</p>}
      <div className="border-t border-[#E7E5E0] pt-4"><h4 className="font-bold text-sm">Horarios disponibles · {previewService?.name ?? 'Sin servicios activos'}</h4><p className="text-xs text-[#6B6B6B] mt-1 mb-3">Se consideran todas las citas y la duración del servicio, incluso con filtros activos.</p><div className="flex flex-wrap gap-2">{available.map(time => <button key={time} onClick={() => book(date, time)} className="rounded-lg border border-[#CF6811]/30 bg-[#FCEFE3] px-3 py-2 text-xs font-bold text-[#8F4608] hover:bg-[#F9CFA6]">{time} +</button>)}</div>{available.length === 0 && <p className="text-xs text-[#6B6B6B]">No hay horarios disponibles para este servicio. Prueba otro día.</p>}</div>
    </section>
    <Modal isOpen={open} onClose={() => { if (!saving) setOpen(false); }} title="Reservar una cita" subtitle="Elige el servicio y nosotros comprobamos la disponibilidad.">
      <form onSubmit={save} className="space-y-4 text-xs">
        <div className="rounded-xl bg-[#FBF6E6] border border-[#EBD48F] p-3 flex justify-between gap-3"><span>{selectedService?.name ?? 'Selecciona un servicio'}<br />{selectedService?.durationMinutes ?? 0} minutos con {booking.barberName}</span><strong>{formatCurrency(selectedService?.price ?? 0)}</strong></div>
        {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-900"><p>{error}</p><div className="mt-2 flex flex-wrap gap-2">{alternatives.map(time => <button type="button" key={time} onClick={() => update('time', time)} className="bg-white border border-red-200 rounded-lg px-3 py-2">Probar {time}</button>)}</div></div>}
        <label className="block font-semibold">Nombre del cliente<input required value={booking.customerName} onChange={e => update('customerName', e.target.value)} className={CONTROL} /></label>
        <label className="block font-semibold">Teléfono<input type="tel" required value={booking.customerPhone} onChange={e => update('customerPhone', e.target.value)} className={CONTROL} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="font-semibold">Fecha<input type="date" required value={booking.date} onChange={e => update('date', e.target.value)} className={CONTROL} /></label><label className="font-semibold">Hora<input type="time" min="10:00" max="19:59" required value={booking.time} onChange={e => update('time', e.target.value)} className={CONTROL} /></label></div>
        <label className="block font-semibold">Barbero<select value={booking.barberName} onChange={e => update('barberName', e.target.value)} className={CONTROL}>{BARBERS.map(name => <option key={name}>{name}</option>)}</select></label>
        <label className="block font-semibold">Servicio<select required value={booking.serviceId} onChange={e => update('serviceId', e.target.value)} className={CONTROL}>{services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.durationMinutes} min · {formatCurrency(s.price)}</option>)}</select></label>
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" disabled={saving} onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" isLoading={saving} disabled={!selectedService}>Confirmar cita</Button></div>
      </form>
    </Modal>
    {crud.modals}
  </div>;
};
