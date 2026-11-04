import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiService } from './aiService';
import { applyActionDraft } from './actionDraftService';
import { apiService } from './apiService';
import { getRestrictedAnswer, normalizeQuery, parseExpenseCapture } from './assistantPolicy';
import { buildBusinessContext } from './businessContext';
import { BUSINESS_OPTIONS } from './mockData';

const [RESTAURANT, STORE] = BUSINESS_OPTIONS;
const GENERIC_ANSWER = 'puedo ayudarte a consultar';

test('accented questions reach their scripted answer', async () => {
  const cases: [string, string][] = [
    ['¿Cuánto vendimos hoy?', '$780,50'],
    ['¿Cuánto ganamos este mes?', '$2.950,00'],
    ['¿Qué insumos vencen mañana?', 'pollos'],
    ['Noah, pagué 85 dólares de luz', 'borrador'],
    ['Dame un consejo para vender más el miércoles', 'Encebollado'],
  ];
  for (const [question, expected] of cases) {
    const { message } = await aiService.askNoah(question, RESTAURANT, 'owner');
    assert.ok(message.text.includes(expected), `${question} -> ${message.text}`);
    assert.ok(!message.text.includes(GENERIC_ANSWER), question);
  }
});

test('the store owner gets store figures, not the restaurant ones', async () => {
  const { message } = await aiService.askNoah('¿Cuánto gasté este mes?', STORE, 'owner');
  assert.ok(message.text.includes('$3.650,00'), message.text);
  assert.equal(message.actionDraft, undefined);
});

test('finance questions are refused for staff roles', async () => {
  for (const role of ['cashier', 'waiter', 'kitchen', 'inventory'] as const) {
    const { message } = await aiService.askNoah('¿Cuánto ganamos este mes?', RESTAURANT, role);
    assert.ok(!message.text.includes('$2.950'), role);
    assert.ok(message.text.includes('solo la ve'), role);
  }
});

test('cashier sees sales but not expenses', () => {
  assert.equal(getRestrictedAnswer('cashier', normalizeQuery('¿Cuánto vendimos hoy?')), null);
  assert.notEqual(getRestrictedAnswer('cashier', normalizeQuery('¿Cuánto gasté este mes?')), null);
});

test('inventory gets stock answers without a promo draft', async () => {
  const { message } = await aiService.askNoah('¿Qué tengo por vencer?', RESTAURANT, 'inventory');
  assert.ok(message.text.includes('pollos'));
  assert.equal(message.actionDraft, undefined);
});

test('the spoken amount is used in the expense draft', () => {
  assert.equal(parseExpenseCapture('Registra una compra de ingredientes por 180 dólares').amount, 180);
  assert.equal(parseExpenseCapture('Pagué 92,50 de luz').amount, 92.5);
  assert.equal(parseExpenseCapture('Registra una compra de limón por 30 dólares').concept, 'Compra: limón');
});

test('the model context hides finances and costs from staff', () => {
  const waiter = JSON.stringify(buildBusinessContext(RESTAURANT, 'waiter'));
  assert.ok(!waiter.includes('finanzas') && !waiter.includes('costo') && !waiter.includes('margen'));
  const cashier = buildBusinessContext(RESTAURANT, 'cashier');
  assert.ok(!JSON.stringify(cashier).includes('resultadoEstimado'));
  assert.ok(JSON.stringify(buildBusinessContext(RESTAURANT, 'owner')).includes('resultadoEstimado'));
});

test('confirming a draft really stores it', async () => {
  apiService.resetData();
  const before = (await apiService.getKitchenTickets()).length;
  const { message } = await aiService.askNoah('Dos secos de pollo y tres ceviches para la mesa cuatro', RESTAURANT, 'waiter');
  await applyActionDraft(message.actionDraft!);
  assert.equal((await apiService.getKitchenTickets()).length, before + 1);

  const expensesBefore = (await apiService.getExpenses()).total;
  const expense = await aiService.askNoah('Registra una compra de limón por 30 dólares', RESTAURANT, 'inventory');
  await applyActionDraft(expense.message.actionDraft!);
  const expenses = await apiService.getExpenses();
  assert.equal(expenses.total, expensesBefore + 1);
  assert.equal(expenses.items[0].amount, 30);
});
