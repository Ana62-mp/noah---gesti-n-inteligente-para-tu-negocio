import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../shared/context/AppContext';
import { apiService } from '../../../shared/services/apiService';
import { BARBER_SERVICES_MOCK } from '../../../shared/services/mockData';
import { speechService } from '../../../shared/services/speechService';
import { Appointment, BarberService } from '../../../shared/types';
import { Button } from '../../../shared/ui/Button';
import { NoahOrb } from '../../../shared/ui/NoahOrb';
import { findFreeSlots, hasAppointmentOverlap } from '../../../shared/utils/appointmentRules';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';
import { AGENDA_DATE, BARBER_NAME } from './BarberAgenda';

type Step = 'idle' | 'listening' | 'review' | 'done';

const SCRIPT = 'Noah, agéndame un corte con barba para Luis el martes a las 2 de la tarde';
const SPOKEN_TIME = '14:00';
const SPOKEN_SERVICE_ID = 'bs-4';
const WORD_DELAY_MS = 110;

interface BarberBookingProps {
  presetService: BarberService | null;
  onSeeAgenda: () => void;
}

export const BarberBooking: React.FC<BarberBookingProps> = ({ presetService, onSeeAgenda }) => {
  const { showToast } = useApp();
  const [step, setStep] = useState<Step>('idle');
  const [transcript, setTranscript] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customer, setCustomer] = useState('Luis');
  const [time, setTime] = useState(SPOKEN_TIME);
  const [serviceId, setServiceId] = useState(presetService?.id ?? SPOKEN_SERVICE_ID);
  const service = BARBER_SERVICES_MOCK.find(({ id }) => id === serviceId) ?? BARBER_SERVICES_MOCK[0];
  const slot = { barberName: BARBER_NAME, date: AGENDA_DATE, time, durationMinutes: service.durationMinutes };
  const hasConflict = hasAppointmentOverlap(appointments, slot);

  useEffect(() => {
    apiService.getAppointments().then(setAppointments);
    return () => speechService.stopListening();
  }, []);

  const listen = () => {
    setStep('listening');
    speechService.simulateAudioTranscription(
      SCRIPT,
      (partial, isFinished) => {
        setTranscript(partial);
        if (isFinished) setStep('review');
      },
      WORD_DELAY_MS
    );
  };

  const confirm = async () => {
    await apiService.addAppointment({
      customerName: customer.trim(),
      customerPhone: '',
      serviceId: service.id,
      serviceName: service.name,
      barberName: BARBER_NAME,
      date: AGENDA_DATE,
      time,
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: 'confirmed',
    });
    confetti({ particleCount: 40, spread: 60 });
    showToast(`Cita de ${customer.trim()} a las ${time} confirmada`, 'success');
    setStep('done');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow="Reserva por voz" title="Agendar cita" />

      {step === 'idle' && (
        <div className="ph-card p-5 flex flex-col items-center text-center gap-3">
          <NoahOrb state="idle" size="xl" onClick={listen} />
          <p className="text-xs ph-muted">"{SCRIPT}"</p>
          <Button variant="primary" className="w-full" leftIcon={<Mic className="w-4 h-4" />} onClick={listen}>
            Hablar
          </Button>
          <button onClick={() => setStep('review')} className="text-[11px] font-bold text-[#CF6811] min-h-8">Agendar sin voz</button>
          <p className="text-[10px] ph-muted">Audio simulado para la demostración.</p>
        </div>
      )}

      {step === 'listening' && (
        <div className="ph-card p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#CF6811]">
            <NoahOrb state="listening" size="sm" showRipples={false} />
            Escuchando…
          </div>
          <p className="text-xs">{transcript}</p>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold">
            Cliente
            <input value={customer} onChange={(event) => setCustomer(event.target.value)} className="ph-input mt-1 w-full h-10 rounded-xl px-3 text-xs font-normal" />
          </label>
          <label className="block text-[11px] font-bold">
            Servicio
            <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="ph-input mt-1 w-full h-10 rounded-xl px-2 text-xs font-normal">
              {BARBER_SERVICES_MOCK.map(({ id, name, price }) => (
                <option key={id} value={id}>{name} ({formatCurrency(price)})</option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-bold">
            Hora (martes, con {BARBER_NAME})
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="ph-input mt-1 w-full h-10 rounded-xl px-3 text-xs font-normal" />
          </label>

          {hasConflict && (
            <div className="p-2.5 rounded-xl border border-[#A43108]/60 bg-[#F8E4DD] text-[#7A2105] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Ese horario ya está ocupado
              </div>
              <div className="text-[11px]">Horarios libres más cercanos:</div>
              <div className="flex flex-wrap gap-1.5">
                {findFreeSlots(appointments, slot).map((freeTime) => (
                  <button key={freeTime} onClick={() => setTime(freeTime)} className="min-h-8 px-3 rounded-lg bg-white border border-[#A43108]/50 text-xs font-bold tabular-nums">
                    {freeTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button variant="primary" className="w-full" disabled={hasConflict || !customer.trim()} onClick={confirm}>
            {hasConflict ? 'Elige un horario libre' : !customer.trim() ? 'Escribe el nombre del cliente' : `Confirmar a las ${time}`}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div className="ph-card p-5 flex flex-col items-center text-center gap-2 page-enter">
          <CheckCircle2 className="w-10 h-10 text-[#CF6811]" />
          <div className="font-extrabold text-sm">Cita confirmada a las {time}</div>
          <p className="text-[11px] ph-muted">{customer} · {service.name} · {formatCurrency(service.price)}</p>
          <Button variant="primary" className="w-full" onClick={onSeeAgenda}>Ver la agenda</Button>
        </div>
      )}
    </div>
  );
};
