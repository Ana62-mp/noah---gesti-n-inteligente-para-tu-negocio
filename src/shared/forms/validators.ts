export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'money' | 'select' | 'textarea' | 'date' | 'checkbox' | 'document' | 'time';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  span?: 1 | 2;
}

export type FormValues = Record<string, string | boolean>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_PATTERN = /^09\d{8}$/;
const LANDLINE_PATTERN = /^0[2-7]\d{7}$/;
const CEDULA_LENGTH = 10;
const RUC_LENGTH = 13;
const PROVINCE_CODES = 24;

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const isValidPhone = (value: string): boolean => {
  const digits = onlyDigits(value);
  return MOBILE_PATTERN.test(digits) || LANDLINE_PATTERN.test(digits);
};

export const isValidEcuadorianDocument = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== CEDULA_LENGTH && digits.length !== RUC_LENGTH) return false;
  const province = Number(digits.slice(0, 2));
  return province >= 1 && province <= PROVINCE_CODES;
};

export const parseMoney = (value: string): number => Number(value.replace(',', '.'));

export const validateField = (field: FormField, raw: string | boolean | undefined): string | null => {
  if (field.type === 'checkbox') return null;
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return field.required ? `Completa ${field.label.toLowerCase()}` : null;

  if (field.type === 'email' && !isValidEmail(value)) return 'Escribe un correo válido, por ejemplo nombre@correo.com';
  if (field.type === 'tel' && !isValidPhone(value)) return 'Usa 10 dígitos de celular (09…) o un fijo con código de provincia';
  if (field.type === 'time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return 'Usa el formato 24 horas, por ejemplo 14:30';
  if (field.type === 'document' && !isValidEcuadorianDocument(value)) return 'La cédula tiene 10 dígitos y el RUC 13';

  if (field.type === 'number' || field.type === 'money') {
    const number = parseMoney(value);
    if (Number.isNaN(number)) return 'Escribe solo números';
    if (field.min !== undefined && number < field.min) return `El mínimo es ${field.min}`;
    if (field.max !== undefined && number > field.max) return `El máximo es ${field.max}`;
  }
  return null;
};

export const validateForm = (fields: FormField[], values: FormValues): Record<string, string> =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const error = validateField(field, values[field.key]);
      return error ? [[field.key, error]] : [];
    })
  );

export const missingRequired = (fields: FormField[], values: FormValues): string[] =>
  fields.filter((field) => field.required && field.type !== 'checkbox' && !String(values[field.key] ?? '').trim()).map((field) => field.label);
