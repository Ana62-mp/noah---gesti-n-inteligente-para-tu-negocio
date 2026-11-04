import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findFreeSlots, hasAppointmentOverlap } from './appointmentRules';
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
