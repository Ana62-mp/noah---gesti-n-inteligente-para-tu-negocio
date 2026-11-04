import { ChatMessage, Expense } from '../types';
import { apiService } from './apiService';

type ActionDraft = NonNullable<ChatMessage['actionDraft']>;

interface DraftOrderItem {
  nombre: string;
  cantidad: number;
  nota?: string;
}

const REFERENCE_DATE = '2026-11-03';
const EXPENSE_CATEGORIES: readonly Expense['category'][] = ['insumos', 'servicios', 'sueldos', 'arriendo', 'otros'];
const DEFAULT_APPOINTMENT_MINUTES = 30;

const nowLabel = () => new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

const applyExpense = async ({ details }: ActionDraft): Promise<string> => {
  const amount = Number(details.monto ?? details.importe ?? details.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Falta el monto para registrar el gasto.');

  const category = EXPENSE_CATEGORIES.find((item) => item === details.categoria) ?? 'otros';
  await apiService.addExpense({
    date: REFERENCE_DATE,
    concept: String(details.concepto ?? 'Gasto registrado por voz'),
    category,
    supplier: details.proveedor ? String(details.proveedor) : undefined,
    amount,
    paymentMethod: 'cash',
  });
  return 'Gasto guardado: ya aparece en Gastos y Compras.';
};

const applyOrder = async ({ details }: ActionDraft): Promise<string> => {
  const items: DraftOrderItem[] = Array.isArray(details.items) ? details.items : [];
  if (items.length === 0) throw new Error('El pedido no tiene platos. Corrígelo antes de enviarlo.');

  const tableNumber = Number(details.mesa);
  await apiService.addKitchenTicket({
    orderNumber: apiService.getNextOrderNumber(),
    tableNumber: Number.isFinite(tableNumber) && tableNumber > 0 ? tableNumber : undefined,
    channel: 'salon',
    waiterName: String(details.mesero ?? 'Noah'),
    createdAt: nowLabel(),
    elapsedMinutes: 0,
    status: 'pending',
    urgency: 'normal',
    items: items.map(({ nombre, cantidad, nota }) => ({ dishName: nombre, quantity: cantidad, notes: nota })),
  });
  if (tableNumber > 0) await apiService.updateTableStatus(tableNumber, 'occupied', Number(details.total) || undefined);
  return 'Pedido enviado: ya aparece en Cocina y en Mesas.';
};

const applyAppointment = async ({ details }: ActionDraft): Promise<string> => {
  const time = String(details.horario ?? '').match(/\d{2}:\d{2}/)?.[0];
  if (!time) throw new Error('Falta el horario para agendar la cita.');

  await apiService.addAppointment({
    customerName: String(details.cliente ?? 'Cliente'),
    customerPhone: '',
    serviceId: 'bs-1',
    serviceName: String(details.servicio ?? 'Corte clásico'),
    barberName: String(details.barbero ?? 'David'),
    date: REFERENCE_DATE,
    time,
    durationMinutes: DEFAULT_APPOINTMENT_MINUTES,
    price: Number(details.valor) || 0,
    status: 'confirmed',
  });
  return 'Cita confirmada: ya aparece en la agenda.';
};

export const applyActionDraft = async (draft: ActionDraft): Promise<string> => {
  if (draft.type === 'expense') return applyExpense(draft);
  if (draft.type === 'order') return applyOrder(draft);
  if (draft.type === 'appointment') return applyAppointment(draft);
  return 'Promoción guardada como borrador. No se publica ni cambia precios hasta que la apliques.';
};

export const SECTION_AFTER_DRAFT: Record<ActionDraft['type'], string> = {
  expense: 'expenses',
  order: 'kitchen',
  promo: 'alerts',
  appointment: 'appointments',
};
