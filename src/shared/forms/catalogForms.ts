import { Product, Promotion, Supplier } from '../types';
import { FormField, FormValues, onlyDigits, parseMoney } from './validators';

const money = (value: number) => String(value).replace('.', ',');

export const PRODUCT_FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre del producto', type: 'text', required: true, span: 2, placeholder: 'Ej. Leche Toni 1 L' },
  { key: 'sku', label: 'Código interno', type: 'text', placeholder: 'LAC-001', help: 'Opcional: el de tu etiqueta o código de barras.' },
  { key: 'category', label: 'Categoría', type: 'text', required: true, placeholder: 'Lácteos' },
  { key: 'price', label: 'Precio de venta ($)', type: 'money', required: true, min: 0.05, max: 5000 },
  { key: 'costPrice', label: 'Costo de compra ($)', type: 'money', required: true, min: 0, max: 5000 },
  { key: 'stock', label: 'Unidades en stock', type: 'number', required: true, min: 0, max: 100000 },
  { key: 'isAvailable', label: 'Estado', type: 'checkbox', placeholder: 'Disponible para la venta' },
];

export const emptyProduct = (): FormValues => ({ name: '', sku: '', category: '', price: '', costPrice: '', stock: '0', isAvailable: true });

export const productToValues = (p: Product): FormValues => ({
  name: p.name, sku: p.sku, category: p.category, price: money(p.price), costPrice: money(p.costPrice), stock: String(p.stock), isAvailable: p.isAvailable,
});

export const productFromValues = (v: FormValues): Partial<Product> => {
  const stock = Number(v.stock);
  return {
    name: String(v.name).trim(), sku: String(v.sku).trim().toUpperCase(), category: String(v.category).trim(),
    price: parseMoney(String(v.price)), costPrice: parseMoney(String(v.costPrice)), stock, isAvailable: Boolean(v.isAvailable) && stock > 0,
  };
};

export const PROMOTION_FIELDS: FormField[] = [
  { key: 'title', label: 'Nombre de la promoción', type: 'text', required: true, span: 2, placeholder: 'Ej. Miércoles de encebollado' },
  { key: 'item', label: 'Aplica a', type: 'text', required: true, placeholder: 'Producto, plato o servicio' },
  { key: 'discount', label: 'Oferta', type: 'text', required: true, placeholder: '2x1, 15 % de descuento, $3,99…' },
  { key: 'duration', label: 'Vigencia', type: 'text', required: true, placeholder: 'Hoy hasta las 16:00' },
  { key: 'status', label: 'Estado', type: 'select', required: true, options: [{ value: 'draft', label: 'Borrador' }, { value: 'active', label: 'Activa' }, { value: 'ended', label: 'Finalizada' }] },
];

export const emptyPromotion = (): FormValues => ({ title: '', item: '', discount: '', duration: '', status: 'draft' });
export const promotionToValues = (p: Promotion): FormValues => ({ title: p.title, item: p.item, discount: p.discount, duration: p.duration, status: p.status });
export const promotionFromValues = (v: FormValues): Partial<Promotion> => ({
  title: String(v.title).trim(), item: String(v.item).trim(), discount: String(v.discount).trim(), duration: String(v.duration).trim(), status: String(v.status) as Promotion['status'],
});

export const SUPPLIER_FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre del proveedor', type: 'text', required: true, span: 2, placeholder: 'Ej. Distribuidora Los Andes' },
  { key: 'contactPerson', label: 'Persona de contacto', type: 'text', required: true },
  { key: 'phone', label: 'Celular o teléfono', type: 'tel', required: true, placeholder: '0991234567' },
  { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'ventas@proveedor.ec' },
  { key: 'city', label: 'Ciudad', type: 'text', required: true },
  { key: 'suppliedItems', label: 'Qué te vende', type: 'text', span: 2, required: true, help: 'Sepáralo con comas: pollo, huevos, embutidos.' },
];

export const emptySupplier = (city: string): FormValues => ({ name: '', contactPerson: '', phone: '', email: '', city, suppliedItems: '' });
export const supplierToValues = (s: Supplier): FormValues => ({
  name: s.name, contactPerson: s.contactPerson, phone: s.phone, email: s.email, city: s.city, suppliedItems: s.suppliedItems.join(', '),
});
export const supplierFromValues = (v: FormValues): Partial<Supplier> => ({
  name: String(v.name).trim(), contactPerson: String(v.contactPerson).trim(), phone: onlyDigits(String(v.phone)), email: String(v.email).trim().toLowerCase(),
  city: String(v.city).trim(), suppliedItems: String(v.suppliedItems).split(',').map((item) => item.trim()).filter(Boolean),
});
export const SUPPLIER_DEFAULTS: Partial<Supplier> = { lastPurchaseDate: '2026-11-03', priceTrend: 'stable', priceChangePercent: 0, totalPurchasedThisYear: 0 };
