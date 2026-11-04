import { FormField, FormValues, onlyDigits } from '../../shared/forms/validators';
import { Customer } from '../../shared/types';

export const ECUADOR_CITIES = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta', 'Loja', 'Machala', 'Riobamba', 'Ibarra', 'Otra'];

export const CUSTOMER_FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre completo o razón social', type: 'text', required: true, span: 2, placeholder: 'Ej. María Elena Vinueza' },
  { key: 'documentId', label: 'Cédula o RUC', type: 'document', help: 'Para emitir facturas a su nombre. 10 dígitos de cédula o 13 de RUC.' },
  { key: 'phone', label: 'Celular o teléfono', type: 'tel', required: true, placeholder: '0991234567' },
  { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'nombre@correo.com' },
  { key: 'birthday', label: 'Fecha de nacimiento', type: 'date', help: 'Sirve para saludos y promociones de cumpleaños.' },
  { key: 'address', label: 'Dirección', type: 'text', span: 2, placeholder: 'Calle principal y secundaria, barrio' },
  { key: 'city', label: 'Ciudad', type: 'select', options: ECUADOR_CITIES.map((value) => ({ value, label: value })), required: true },
  { key: 'marketingOptIn', label: 'Promociones', type: 'checkbox', placeholder: 'Acepta recibir promociones por WhatsApp o correo' },
  { key: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Preferencias, alergias, forma de pago acordada…' },
];

export const emptyCustomerValues = (city: string): FormValues => ({
  name: '', documentId: '', phone: '', email: '', birthday: '', address: '', city, marketingOptIn: true, notes: '',
});

export const toCustomerValues = (customer: Customer): FormValues => ({
  name: customer.name,
  documentId: customer.documentId,
  phone: customer.phone,
  email: customer.email,
  birthday: customer.birthday,
  address: customer.address,
  city: customer.city,
  marketingOptIn: customer.marketingOptIn,
  notes: customer.notes,
});

export const fromCustomerValues = (values: FormValues): Omit<Customer, 'id' | 'createdAt' | 'lastVisit' | 'visits' | 'totalSpent' | 'balanceDue'> => ({
  name: String(values.name).trim(),
  documentId: onlyDigits(String(values.documentId)),
  phone: onlyDigits(String(values.phone)),
  email: String(values.email).trim().toLowerCase(),
  birthday: String(values.birthday),
  address: String(values.address).trim(),
  city: String(values.city),
  marketingOptIn: Boolean(values.marketingOptIn),
  notes: String(values.notes).trim(),
});

export const getCustomerKind = (documentId: string): string => (documentId.length === 13 ? 'Empresa o RUC' : 'Persona');
