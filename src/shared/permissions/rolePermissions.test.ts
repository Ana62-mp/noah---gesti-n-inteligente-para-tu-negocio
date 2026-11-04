import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMember,
  canAccessSection,
  canCreateDraft,
  getDefaultSections,
  getRoleHomeSection,
  getRolesForBusiness,
  getVisibleAlerts,
  memberCanAccess,
} from './rolePermissions';
import { ModuleId, UserRole } from '../types';
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
    for (const role of getRolesForBusiness(type)) assert.equal(canAccessSection(role, getRoleHomeSection(role)), true);
  }
});

test('store and barbershop do not offer waiter or kitchen roles', () => {
  for (const type of ['store', 'barbershop'] as const) {
    const roles = getRolesForBusiness(type);
    assert.ok(!roles.includes('waiter') && !roles.includes('kitchen'));
  }
});

test('removing a screen from a person hides it, adding one shows it', () => {
  const waiter = buildMember('m', 'Ana', 'waiter');
  const modules: ModuleId[] = ['tables', 'menu', 'reports'];
  assert.equal(memberCanAccess(waiter, modules, 'tables'), true);
  assert.equal(memberCanAccess(waiter, modules, 'reports'), false);
  const withReports = { ...waiter, sections: [...waiter.sections, 'reports'] };
  assert.equal(memberCanAccess(withReports, modules, 'reports'), true);
  const withoutTables = { ...waiter, sections: waiter.sections.filter((section) => section !== 'tables') };
  assert.equal(memberCanAccess(withoutTables, modules, 'tables'), false);
});

test('an inactive module is hidden even for the administrator', () => {
  const owner = buildMember('o', 'Carlos', 'owner');
  assert.equal(memberCanAccess(owner, ['sales'], 'kitchen'), false);
  assert.equal(memberCanAccess(owner, ['sales'], 'sales'), true);
});

test('team and settings cannot be granted to staff', () => {
  const cashier = { ...buildMember('c', 'Lucía', 'cashier'), sections: ['sales', 'team', 'settings'] };
  assert.equal(memberCanAccess(cashier, ['sales', 'team'], 'team'), false);
  assert.equal(memberCanAccess(cashier, ['sales', 'team'], 'settings'), false);
});

test('alerts are filtered by audience', () => {
  assert.equal(getVisibleAlerts(getDefaultSections('owner'), NOTIFICATIONS_MOCK).length, NOTIFICATIONS_MOCK.length);
  assert.ok(getVisibleAlerts(getDefaultSections('inventory'), NOTIFICATIONS_MOCK).every((alert) => alert.topic === 'stock'));
  assert.equal(getVisibleAlerts(getDefaultSections('waiter'), NOTIFICATIONS_MOCK).length, 0);
});

test('drafts respect the role', () => {
  assert.equal(canCreateDraft('waiter', 'order'), true);
  assert.equal(canCreateDraft('waiter', 'expense'), false);
  assert.equal(canCreateDraft('inventory', 'promo'), false);
  assert.equal(canCreateDraft('kitchen', 'order'), false);
});
