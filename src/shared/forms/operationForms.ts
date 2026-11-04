import { Dish, Expense, Ingredient } from '../types';
import { FormField, FormValues, parseMoney } from './validators';

const money = (value: number) => String(value).replace('.', ',');
const REFERENCE_DATE = '2026-11-03';
const MS_PER_DAY = 86400000;

export const EXPENSE_FIELDS: FormField[] = [
  { key: 'concept', label: 'Concepto', type: 'text', required: true, span: 2, placeholder: 'Ej. Compra de 5 kg de limón y cebolla' },
  { key: 'amount', label: 'Importe ($)', type: 'money', required: true, min: 0.01, max: 100000 },
  { key: 'date', label: 'Fecha', type: 'date', required: true },
  { key: 'category', label: 'Categoría', type: 'select', required: true, options: [{ value: 'insumos', label: 'Insumos y mercadería' }, { value: 'servicios', label: 'Servicios básicos' }, { value: 'sueldos', label: 'Nómina y sueldos' }, { value: 'arriendo', label: 'Arriendo' }, { value: 'otros', label: 'Otros gastos' }] },
  { key: 'paymentMethod', label: 'Forma de pago', type: 'select', required: true, options: [{ value: 'cash', label: 'Efectivo' }, { value: 'transfer', label: 'Transferencia' }, { value: 'card', label: 'Tarjeta' }] },
  { key: 'supplier', label: 'Proveedor', type: 'text', placeholder: 'A quién le pagaste' },
  { key: 'receiptNumber', label: 'N.º de factura o nota', type: 'text', placeholder: '001-002-000123', help: 'Déjalo vacío si no tienes comprobante.' },
];

export const emptyExpense = (supplier: string): FormValues => ({ concept: '', amount: '', date: REFERENCE_DATE, category: 'insumos', paymentMethod: 'cash', supplier, receiptNumber: '' });
export const expenseToValues = (e: Expense): FormValues => ({ concept: e.concept, amount: money(e.amount), date: e.date, category: e.category, paymentMethod: e.paymentMethod, supplier: e.supplier ?? '', receiptNumber: e.receiptNumber ?? '' });
export const expenseFromValues = (v: FormValues): Partial<Expense> => ({
  concept: String(v.concept).trim(), amount: parseMoney(String(v.amount)), date: String(v.date), category: String(v.category) as Expense['category'],
  paymentMethod: String(v.paymentMethod) as Expense['paymentMethod'], supplier: String(v.supplier).trim() || undefined,
  receiptNumber: String(v.receiptNumber).trim() || undefined, receiptAttached: Boolean(String(v.receiptNumber).trim()),
});

export const INGREDIENT_FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true, span: 2, placeholder: 'Ej. Pollo entero faenado' },
  { key: 'category', label: 'Categoría', type: 'text', required: true, placeholder: 'Carnes y aves' },
  { key: 'unit', label: 'Unidad de medida', type: 'select', required: true, options: ['kg', 'g', 'litro', 'unidad', 'atado', 'libra'].map((value) => ({ value, label: value })) },
  { key: 'currentStock', label: 'Stock actual', type: 'money', required: true, min: 0 },
  { key: 'minThreshold', label: 'Stock mínimo', type: 'money', required: true, min: 0, help: 'Debajo de esto aparece "Stock bajo".' },
  { key: 'optimalStock', label: 'Stock ideal', type: 'money', required: true, min: 0 },
  { key: 'unitCost', label: 'Costo por unidad ($)', type: 'money', required: true, min: 0 },
  { key: 'supplierName', label: 'Proveedor', type: 'text', required: true },
  { key: 'location', label: 'Ubicación', type: 'text', required: true, placeholder: 'Cámara frigorífica 1' },
  { key: 'expiryDate', label: 'Fecha de vencimiento', type: 'date', required: true },
];

export const emptyIngredient = (): FormValues => ({ name: '', category: '', unit: 'unidad', currentStock: '', minThreshold: '', optimalStock: '', unitCost: '', supplierName: '', location: '', expiryDate: '' });
export const ingredientToValues = (i: Ingredient): FormValues => ({
  name: i.name, category: i.category, unit: i.unit, currentStock: money(i.currentStock), minThreshold: money(i.minThreshold), optimalStock: money(i.optimalStock),
  unitCost: money(i.unitCost), supplierName: i.supplierName, location: i.location, expiryDate: i.expiryDate,
});

export const getStockStatus = (current: number, min: number, optimal: number, daysToExpiry: number): Ingredient['status'] => {
  if (daysToExpiry <= 2) return 'expiring';
  if (current <= min) return 'low';
  return current > optimal * 1.35 ? 'overstock' : 'normal';
};

export const ingredientFromValues = (v: FormValues): Partial<Ingredient> => {
  const currentStock = parseMoney(String(v.currentStock));
  const minThreshold = parseMoney(String(v.minThreshold));
  const optimalStock = parseMoney(String(v.optimalStock));
  const expiryDate = String(v.expiryDate);
  const daysToExpiry = Math.round((Date.parse(expiryDate) - Date.parse(REFERENCE_DATE)) / MS_PER_DAY);
  return {
    name: String(v.name).trim(), category: String(v.category).trim(), unit: String(v.unit) as Ingredient['unit'], currentStock, minThreshold, optimalStock,
    unitCost: parseMoney(String(v.unitCost)), supplierName: String(v.supplierName).trim(), location: String(v.location).trim(), expiryDate, daysToExpiry,
    status: getStockStatus(currentStock, minThreshold, optimalStock, daysToExpiry),
  };
};
export const INGREDIENT_DEFAULTS: Partial<Ingredient> = { supplierId: 'sup', entryDate: REFERENCE_DATE };

export const DISH_FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre del plato', type: 'text', required: true, span: 2, placeholder: 'Ej. Encebollado mixto de albacora' },
  { key: 'category', label: 'Categoría', type: 'select', required: true, options: [{ value: 'platos_fuertes', label: 'Platos fuertes' }, { value: 'sopas', label: 'Sopas y caldos' }, { value: 'mariscos', label: 'Mariscos' }, { value: 'desayunos', label: 'Desayunos' }, { value: 'bebidas', label: 'Bebidas' }, { value: 'postres', label: 'Postres' }] },
  { key: 'sellingPrice', label: 'Precio de venta ($)', type: 'money', required: true, min: 0.5, max: 500 },
  { key: 'theoreticalCost', label: 'Costo estimado ($)', type: 'money', required: true, min: 0, max: 500, help: 'Luego lo afinas en Recetas y costeo.' },
  { key: 'preparationTimeMinutes', label: 'Tiempo de preparación (min)', type: 'number', required: true, min: 1, max: 180 },
  { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Qué lleva y cómo se sirve' },
  { key: 'isAvailable', label: 'Estado', type: 'checkbox', placeholder: 'Disponible hoy' },
];

export const emptyDish = (): FormValues => ({ name: '', category: 'platos_fuertes', sellingPrice: '', theoreticalCost: '', preparationTimeMinutes: '15', description: '', isAvailable: true });
export const dishToValues = (d: Dish): FormValues => ({
  name: d.name, category: d.category, sellingPrice: money(d.sellingPrice), theoreticalCost: money(d.theoreticalCost),
  preparationTimeMinutes: String(d.preparationTimeMinutes), description: d.description, isAvailable: d.isAvailable,
});
export const dishFromValues = (v: FormValues): Partial<Dish> => {
  const sellingPrice = parseMoney(String(v.sellingPrice));
  const theoreticalCost = parseMoney(String(v.theoreticalCost));
  return {
    name: String(v.name).trim(), category: String(v.category) as Dish['category'], sellingPrice, theoreticalCost, grossMargin: sellingPrice ? (sellingPrice - theoreticalCost) / sellingPrice : 0,
    preparationTimeMinutes: Number(v.preparationTimeMinutes), description: String(v.description).trim(), isAvailable: Boolean(v.isAvailable),
  };
};
export const DISH_DEFAULTS: Partial<Dish> = { ingredients: [], salesCountThisMonth: 0 };
