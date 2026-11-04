import React, { useEffect, useState } from 'react';
import { FormField, FormValues, missingRequired, validateField, validateForm } from '../forms/validators';
import { Button } from './Button';
import { Modal } from './Modal';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  fields: FormField[];
  initialValues: FormValues;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
}

const CONTROL = 'w-full border rounded-xl px-3 text-sm text-[#111111] bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CF6811]/60';

export const FormModal: React.FC<FormModalProps> = ({ isOpen, title, subtitle, fields, initialValues, submitLabel, onClose, onSubmit }) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setTouched({});
    }
  }, [isOpen]);

  const errors = validateForm(fields, values);
  const missing = missingRequired(fields, values);
  const hasErrors = Object.keys(errors).length > 0;
  const buttonLabel = missing.length > 0 ? `Falta: ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '…' : ''}` : hasErrors ? 'Corrige los campos marcados' : submitLabel;

  const setValue = (key: string, value: string | boolean) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(Object.fromEntries(fields.map((field) => [field.key, true])));
    if (hasErrors || missing.length > 0) return;
    setIsSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSaving(false);
    }
  };

  const renderControl = (field: FormField) => {
    const hasError = touched[field.key] && validateField(field, values[field.key]);
    const common = {
      id: `field-${field.key}`,
      'aria-invalid': Boolean(hasError),
      'aria-describedby': hasError ? `error-${field.key}` : undefined,
      onBlur: () => setTouched((current) => ({ ...current, [field.key]: true })),
      className: `${CONTROL} ${hasError ? 'border-[#A43108]' : 'border-[#E7E5E0]'}`,
    };
    const value = String(values[field.key] ?? '');

    if (field.type === 'select') {
      return (
        <select {...common} value={value} onChange={(event) => setValue(field.key, event.target.value)} className={`${common.className} h-10`}>
          {!field.required && <option value="">Sin definir</option>}
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return <textarea {...common} rows={3} value={value} placeholder={field.placeholder} onChange={(event) => setValue(field.key, event.target.value)} className={`${common.className} py-2`} />;
    }
    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-2 h-10 text-sm">
          <input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => setValue(field.key, event.target.checked)} className="w-4 h-4 accent-[#CF6811]" />
          {field.placeholder ?? field.label}
        </label>
      );
    }
    const inputType = field.type === 'money' || field.type === 'number' ? 'text' : field.type === 'document' ? 'text' : field.type;
    const inputMode = field.type === 'tel' || field.type === 'document' || field.type === 'number' ? 'numeric' : field.type === 'money' ? 'decimal' : undefined;
    return (
      <input
        {...common}
        type={inputType}
        inputMode={inputMode}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => setValue(field.key, event.target.value)}
        className={`${common.className} h-10`}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="xl">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {fields.map((field, index) => (
            <div key={field.key} className={field.span === 2 || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              {field.type !== 'checkbox' && (
                <label htmlFor={`field-${field.key}`} className="block text-xs font-bold text-[#111111] mb-1">
                  {field.label}
                  {field.required && <span className="text-[#A43108]"> *</span>}
                </label>
              )}
              {React.cloneElement(renderControl(field), index === 0 ? { autoFocus: true } : {})}
              {touched[field.key] && validateField(field, values[field.key]) ? (
                <p id={`error-${field.key}`} className="mt-1 text-[11px] font-semibold text-[#A43108]">{validateField(field, values[field.key])}</p>
              ) : (
                field.help && <p className="mt-1 text-[11px] text-[#6B6B6B]">{field.help}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E0]">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" isLoading={isSaving} disabled={missing.length > 0 || hasErrors}>{buttonLabel}</Button>
        </div>
      </form>
    </Modal>
  );
};
