import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Appointment, BarberService } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { RowActions } from '../../shared/ui/RowActions';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { Modal } from '../../shared/ui/Modal';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { formatCurrency } from '../../shared/utils/formatters';
import { findFreeSlots, hasAppointmentOverlap } from '../../shared/utils/appointmentRules';
import {
  Scissors,
  CalendarCheck,
  Clock,
  User,
  Plus,
  Mic,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AGENDA_DATE = '2026-11-03';
const BARBERS = ['David', 'Carlos', 'Andrés'];

export const BarbershopView: React.FC = () => {
  const { showToast, setActiveSection, canAccess } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<BarberService[]>(() => apiService.listServices().filter((service) => service.isActive));
  const [selectedBarber, setSelectedBarber] = useState('David');
  const [customerQuery, setCustomerQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New appointment form
  const [customerName, setCustomerName] = useState('Luis Paredes');
  const [customerPhone, setCustomerPhone] = useState('098 765 4321');
  const [serviceId, setServiceId] = useState('bs-2');
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const crud = useEntityCrud<Appointment>({
    collection: 'appointments', noun: 'cita', nameOf: (item) => `La cita de ${item.customerName ?? 'el cliente'}`, onChanged: () => loadAppointments(),
    deleteWarning: 'la cita se quitará de la agenda.',
    fields: [
      { key: 'customerName', label: 'Cliente', type: 'text', required: true },
      { key: 'customerPhone', label: 'Celular', type: 'tel', placeholder: '0991234567' },
      { key: 'serviceId', label: 'Servicio', type: 'select', required: true, options: apiService.listServices().map(({ id, name }) => ({ value: id, label: name })) },
      { key: 'barberName', label: 'Barbero', type: 'select', required: true, options: BARBERS.map((value) => ({ value, label: value })) },
      { key: 'time', label: 'Hora (24 h)', type: 'time', required: true, placeholder: '14:30' },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: [{ value: 'confirmed', label: 'Confirmada' }, { value: 'in_progress', label: 'En el sillón' }, { value: 'completed', label: 'Atendida' }, { value: 'cancelled', label: 'Cancelada' }] },
    ],
    emptyValues: () => ({ customerName: '', customerPhone: '', serviceId: services[0]?.id ?? '', barberName: selectedBarber, time: '', status: 'confirmed' }),
    toValues: (a) => ({ customerName: a.customerName, customerPhone: a.customerPhone, serviceId: a.serviceId, barberName: a.barberName, time: a.time, status: a.status }),
    fromValues: (values, current) => {
      const service = apiService.listServices().find((item) => item.id === values.serviceId) ?? services[0];
      const data = {
        customerName: String(values.customerName).trim(), customerPhone: String(values.customerPhone), serviceId: service.id, serviceName: service.name,
        barberName: String(values.barberName), time: String(values.time), durationMinutes: service.durationMinutes, price: service.price, status: String(values.status) as Appointment['status'],
      };
      const others = appointments.filter((item) => item.id !== current?.id);
      const slot = { barberName: data.barberName, date: current?.date ?? AGENDA_DATE, time: data.time, durationMinutes: data.durationMinutes };
      if (data.status !== 'cancelled' && hasAppointmentOverlap(others, slot)) {
        throw new Error(`Ese horario ya está ocupado para ${data.barberName}. Libres más cercanos: ${findFreeSlots(others, slot).join(', ')}.`);
      }
      return data;
    },
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await apiService.getAppointments();
    setAppointments(data);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);

    const srv = services.find((s) => s.id === serviceId) || services[0];
    const slot = { barberName: selectedBarber, date: AGENDA_DATE, time: appointmentTime, durationMinutes: srv.durationMinutes };
    if (hasAppointmentOverlap(appointments, slot)) {
      setOverlapError(`Ese horario ya está ocupado para ${selectedBarber}. Libres más cercanos: ${findFreeSlots(appointments, slot).join(', ')}.`);
      return;
    }

    await apiService.addAppointment({
      customerName,
      customerPhone,
      serviceId: srv.id,
      serviceName: srv.name,
      barberName: selectedBarber,
      date: AGENDA_DATE,
      time: appointmentTime,
      durationMinutes: srv.durationMinutes,
      price: srv.price,
      status: 'confirmed',
    });

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}

    setIsModalOpen(false);
    showToast(`Cita confirmada para ${customerName} a las ${appointmentTime}`, 'success');
    loadAppointments();
  };

  return (
    <div className="space-y-3">
      {/* Top Header & Cotizable Tag */}
      <div className="flex flex-wrap items-center justify-end gap-2">
<div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Mic className="w-4 h-4 text-[#CF6811]" />}
            onClick={() => setActiveSection('voice_scenarios')}
          >
            Reservar por voz
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setOverlapError(null);
              setIsModalOpen(true);
            }}
          >
            Nueva cita
          </Button>
        </div>
      </div>

      <FilterBar
        search={{ value: customerQuery, onChange: setCustomerQuery, placeholder: 'Buscar cliente…' }}
        fields={[
          { key: 'barber', label: 'Barbero', type: 'select', options: BARBERS.map((name) => ({ value: name, label: name })) },
          { key: 'service', label: 'Servicio', type: 'select', options: [{ value: '', label: 'Todos' }, ...services.map(({ id, name }) => ({ value: id, label: name }))] },
          { key: 'status', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'confirmed', label: 'Confirmadas' }, { value: 'completed', label: 'Atendidas' }, { value: 'cancelled', label: 'Canceladas' }] },
        ]}
        values={{ barber: selectedBarber, service: serviceFilter, status: statusFilter }}
        onChange={(key, value) => (key === 'barber' ? setSelectedBarber(value) : key === 'service' ? setServiceFilter(value) : setStatusFilter(value))}
        onReset={() => { setCustomerQuery(''); setServiceFilter(''); setStatusFilter(''); }}
        activeCount={[customerQuery, serviceFilter, statusFilter].filter(Boolean).length}
      />

      {/* Schedule Agenda Timeline Grid */}
      <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#111111]">
              Turno del Martes 03 de Noviembre · {selectedBarber}
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Bloques de tiempo de 30 a 60 minutos según el servicio
            </p>
          </div>
          <Badge variant="olive">Horario normal 10:00 - 20:00</Badge>
        </div>

        {/* Time Slots List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((timeSlot) => {
            const appt = appointments.find(
              (a) =>
                a.barberName === selectedBarber &&
                a.time.slice(0, 2) === timeSlot.slice(0, 2) &&
                (!serviceFilter || a.serviceId === serviceFilter) &&
                (!statusFilter || a.status === statusFilter) &&
                (!customerQuery || a.customerName.toLowerCase().includes(customerQuery.toLowerCase()))
            );

            return (
              <div
                key={timeSlot}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  appt
                    ? 'bg-[#FBF6E6] border-[#EBD48F] shadow-[var(--shadow-soft)]'
                    : 'bg-[#FAFAF8] border-[#E7E5E0] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 font-mono font-bold text-xs text-[#6B6B6B]">
                    {timeSlot}
                  </div>

                  {appt ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#111111]">
                          {appt.customerName}
                        </span>
                        <Badge variant="cinnamon" size="sm">
                          {appt.serviceName}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-[#6B6B6B] mt-0.5">
                        {appt.customerPhone} · Duración: {appt.durationMinutes} min
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-[#6B6B6B] italic">Horario disponible</span>
                  )}
                </div>

                <div>
                  {appt ? (
                    <span className="flex items-center gap-1">
                      <span className="font-mono font-extrabold text-sm text-[#111111]">{formatCurrency(appt.price)}</span>
                      <RowActions name={appt.customerName} onEdit={() => crud.openEdit(appt)} onDelete={() => crud.askDelete(appt)} />
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setAppointmentTime(timeSlot);
                        setOverlapError(null);
                        setIsModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#CF6811] hover:underline"
                    >
                      + Agendar en este horario
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Appointment Modal with Conflict Validation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Cita en Barber Kings"
        subtitle={`Reserva para el barbero ${selectedBarber}`}
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          {overlapError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Solapamiento de horario</span>
              </div>
              <p className="text-[11px] leading-relaxed">{overlapError}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentTime('14:50');
                    setOverlapError(null);
                  }}
                  className="px-2.5 py-1 bg-white border border-red-200 rounded font-semibold text-[11px] hover:bg-red-100"
                >
                  Cambiar a 14:50
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentTime('15:30');
                    setOverlapError(null);
                  }}
                  className="px-2.5 py-1 bg-white border border-red-200 rounded font-semibold text-[11px] hover:bg-red-100"
                >
                  Cambiar a 15:30
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Nombre del cliente:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Teléfono:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Hora de inicio:</label>
              <input
                type="text"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                placeholder="14:00"
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Servicio:</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min · ${s.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar cita
            </Button>
          </div>
        </form>
      </Modal>

      {crud.modals}
    </div>
  );
};
