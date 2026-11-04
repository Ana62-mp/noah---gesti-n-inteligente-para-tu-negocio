import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findFreeSlots, hasAppointmentOverlap, isWithinBusinessHours } from './appointmentRules';
import { APPOINTMENTS_MOCK } from '../services/mockData';

const slot = { barberName: 'David', date: '2026-11-03', time: '14:00', durationMinutes: 60 };

test('detects the booked Tuesday 14:00 slot', () => {
  assert.equal(hasAppointmentOverlap(APPOINTMENTS_MOCK, slot), true);
});

test('another barber at the same hour does not collide', () => {
  assert.equal(hasAppointmentOverlap(APPOINTMENTS_MOCK, { ...slot, barberName: 'Marco' }), false);
});

test('a slot that starts when the previous one ends is free', () => {
  assert.equal(hasAppointmentOverlap(APPOINTMENTS_MOCK, { ...slot, time: '14:45' }), false);
});

test('offers the three closest free slots', () => {
  assert.deepEqual(findFreeSlots(APPOINTMENTS_MOCK, slot), ['14:45', '15:00', '15:15']);
});

test('calendar dates keep reservations separate', () => {
  assert.equal(hasAppointmentOverlap(APPOINTMENTS_MOCK, { ...slot, date: '2026-12-03' }), false);
});

test('cancelled appointments release their time but hidden confirmed ones still block it', () => {
  const appointment = APPOINTMENTS_MOCK.find(a => a.id === 'apt-1')!;
  assert.equal(hasAppointmentOverlap([{ ...appointment, status: 'cancelled' }], slot), false);
  assert.equal(hasAppointmentOverlap([appointment], { ...slot, time: '14:15', durationMinutes: 15 }), true);
});

test('booking must fit entirely within opening hours', () => {
  assert.equal(isWithinBusinessHours('09:45', 30), false);
  assert.equal(isWithinBusinessHours('19:30', 30), true);
  assert.equal(isWithinBusinessHours('19:45', 30), false);
  assert.equal(isWithinBusinessHours('25:00', 30), false);
  assert.equal(isWithinBusinessHours('10:00', 0), false);
  assert.deepEqual(findFreeSlots([], { ...slot, time: '19:30', durationMinutes: 30 }), []);
});

test('full-day availability starts at opening and excludes booked intervals', () => {
  const times = findFreeSlots(APPOINTMENTS_MOCK, { ...slot, time: '09:45', durationMinutes: 30 }, 40);
  assert.equal(times[0], '10:00');
  assert.equal(times.includes('14:15'), false);
  assert.equal(times.includes('14:45'), true);
  assert.equal(times.at(-1), '19:30');
});
