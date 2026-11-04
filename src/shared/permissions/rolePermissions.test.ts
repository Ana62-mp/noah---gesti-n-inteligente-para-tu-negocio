import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAccessSection, canCreateDraft, getRoleHomeSection, getRolesForBusiness, getVisibleAlerts } from './rolePermissions';
import { UserRole } from '../types';
import { NOTIFICATIONS_MOCK } from '../services/mockData';

const FINANCE_SECTIONS = ['dashboard', 'reports', 'costing', 'cashflow', 'settings', 'mobile_preview'];
const NON_OWNER_ROLES: UserRole[] = ['cashier', 'waiter', 'kitchen', 'inventory'];

test('only the owner reaches finance and configuration sections', () => {
  for (const section of FINANCE_SECTIONS) {
    assert.equal(canAccessSection('owner', section), true);
    for (const role of NON_OWNER_ROLES) assert.equal(canAccessSection(role, section), false, `${role} -> ${section}`);
  }
});

test('kitchen only sees tickets', () => {
  assert.equal(canAccessSection('kitchen', 'kitchen'), true);
  for (const section of ['sales', 'menu', 'tables', 'inventory']) assert.equal(canAccessSection('kitchen', section), false);
});

test('an unknown section is denied to non owners', () => {
  for (const role of NON_OWNER_ROLES) assert.equal(canAccessSection(role, 'made_up'), false);
});

test('every role lands on a section it can open', () => {
  for (const type of ['restaurant', 'store', 'barbershop'] as const) {
    for (const role of getRolesForBusiness(type)) assert.equal(canAccessSection(role, getRoleHomeSection(role, type)), true);
  }
});

test('store and barbershop do not offer waiter or kitchen roles', () => {
  assert.deepEqual(getRolesForBusiness('store'), ['owner', 'cashier']);
  assert.deepEqual(getRolesForBusiness('barbershop'), ['owner', 'cashier']);
});

test('alerts are filtered by audience', () => {
  assert.equal(getVisibleAlerts('owner', NOTIFICATIONS_MOCK).length, NOTIFICATIONS_MOCK.length);
  assert.ok(getVisibleAlerts('inventory', NOTIFICATIONS_MOCK).every((alert) => alert.topic === 'stock'));
  assert.equal(getVisibleAlerts('waiter', NOTIFICATIONS_MOCK).length, 0);
});

test('drafts respect the role', () => {
  assert.equal(canCreateDraft('waiter', 'order'), true);
  assert.equal(canCreateDraft('waiter', 'expense'), false);
  assert.equal(canCreateDraft('inventory', 'promo'), false);
  assert.equal(canCreateDraft('kitchen', 'order'), false);
});
