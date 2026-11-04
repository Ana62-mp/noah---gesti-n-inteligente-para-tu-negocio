import { Appointment } from '../types';

export interface AppointmentSlot {
  barberName: string;
  date: string;
  time: string;
  durationMinutes: number;
}

const SLOT_STEP_MINUTES = 15;
const CLOSING_TIME_MINUTES = 20 * 60;
const DEFAULT_ALTERNATIVES = 3;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const hasAppointmentOverlap = (appointments: Appointment[], slot: AppointmentSlot): boolean => {
  const start = toMinutes(slot.time);
  const end = start + slot.durationMinutes;
  return appointments.some((appointment) => {
    if (appointment.barberName !== slot.barberName || appointment.date !== slot.date) return false;
    if (appointment.status === 'cancelled') return false;
    const otherStart = toMinutes(appointment.time);
    return start < otherStart + appointment.durationMinutes && otherStart < end;
  });
};

export const findFreeSlots = (
  appointments: Appointment[],
  slot: AppointmentSlot,
  limit: number = DEFAULT_ALTERNATIVES
): string[] => {
  const free: string[] = [];
  let candidate = toMinutes(slot.time) + SLOT_STEP_MINUTES;
  while (free.length < limit && candidate + slot.durationMinutes <= CLOSING_TIME_MINUTES) {
    const time = toTime(candidate);
    if (!hasAppointmentOverlap(appointments, { ...slot, time })) free.push(time);
    candidate += SLOT_STEP_MINUTES;
  }
  return free;
};
