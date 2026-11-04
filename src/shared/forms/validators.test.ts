import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEcuadorianDocument, isValidEmail, isValidPhone, missingRequired, validateField, validateForm } from './validators';
import { CUSTOMER_FIELDS, fromCustomerValues } from '../../modules/customers/customerForm';
import { ingredientFromValues, getStockStatus } from './operationForms';
import { crud } from '../services/crudService';
import { apiService } from '../services/apiService';

test('emails need an at sign and a domain', () => {
  assert.equal(isValidEmail('ana@correo.com'), true);
  for (const bad of ['ana', 'ana@', 'ana@correo', 'a b@correo.com']) assert.equal(isValidEmail(bad), false, bad);
});

test('Ecuadorian phones accept mobile and landline', () => {
  assert.equal(isValidPhone('0991234567'), true);
  assert.equal(isValidPhone('099 123 4567'), true);
  assert.equal(isValidPhone('022345678'), true);
  for (const bad of ['123', '1991234567', '09912345']) assert.equal(isValidPhone(bad), false, bad);
});

test('document must be a 10 digit cedula or 13 digit RUC with a real province', () => {
  assert.equal(isValidEcuadorianDocument('1712345678'), true);
  assert.equal(isValidEcuadorianDocument('1791234567001'), true);
  for (const bad of ['171234567', '9912345678', '17123456789']) assert.equal(isValidEcuadorianDocument(bad), false, bad);
});

test('customer form reports missing and invalid fields', () => {
  const empty = { name: '', phone: '', city: 'Quito', documentId: '', email: '' };
  assert.deepEqual(missingRequired(CUSTOMER_FIELDS, empty), ['Nombre completo o razón social', 'Celular o teléfono']);
  const errors = validateForm(CUSTOMER_FIELDS, { ...empty, name: 'Ana', phone: '12', email: 'x', documentId: '12' });
  assert.deepEqual(Object.keys(errors).sort(), ['documentId', 'email', 'phone']);
  assert.equal(validateField(CUSTOMER_FIELDS[0], 'Ana'), null);
});

test('numbers respect their range', () => {
  const field = { key: 'price', label: 'Precio', type: 'money' as const, required: true, min: 0.5 };
  assert.ok(validateField(field, '0,1'));
  assert.ok(validateField(field, 'abc'));
  assert.equal(validateField(field, '8,50'), null);
});

test('customer values are normalized before saving', () => {
  const data = fromCustomerValues({ name: ' Ana ', phone: '099 123 4567', email: ' ANA@Correo.com ', documentId: '171-2345678', city: 'Quito', birthday: '', address: '', notes: '', marketingOptIn: true });
  assert.equal(data.name, 'Ana');
  assert.equal(data.phone, '0991234567');
  assert.equal(data.email, 'ana@correo.com');
  assert.equal(data.documentId, '1712345678');
});

test('stock status follows expiry first, then levels', () => {
  assert.equal(getStockStatus(50, 10, 20, 1), 'expiring');
  assert.equal(getStockStatus(5, 10, 20, 30), 'low');
  assert.equal(getStockStatus(40, 10, 20, 30), 'overstock');
  assert.equal(getStockStatus(15, 10, 20, 30), 'normal');
  const item = ingredientFromValues({ name: 'Leche', category: 'Lácteos', unit: 'litro', currentStock: '4', minThreshold: '5', optimalStock: '12', unitCost: '0,9', supplierName: 'Toni', location: 'Nevera', expiryDate: '2026-11-20' });
  assert.equal(item.status, 'low');
  assert.equal(item.daysToExpiry, 17);
});

test('create, update and delete work on any collection', async () => {
  apiService.resetData();
  apiService.setActiveBusiness('restaurant');
  const before = apiService.getCollection('customers').length;
  const created = await crud.create<{ id: string; name?: string }>('customers', { name: 'Prueba' });
  assert.equal(apiService.getCollection('customers').length, before + 1);
  await crud.update<{ id: string; name?: string }>('customers', created.id, { name: 'Editado' });
  assert.equal((apiService.getCollection('customers').find((c) => c.id === created.id) as unknown as { name: string }).name, 'Editado');
  await crud.remove('customers', created.id);
  assert.equal(apiService.getCollection('customers').length, before);
  await assert.rejects(() => crud.remove('customers', created.id), /No encontramos/);
});
