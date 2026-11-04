import { Expense, Ingredient, NotificationAlert, Product, Promotion, Sale, Supplier, TeamMember } from '../types';
import { buildMember } from '../permissions/rolePermissions';

const TODAY = '2026-11-03';

const day = (offset: number): string => `2026-${offset < 3 ? '11' : '10'}-${String(offset < 3 ? 3 - offset : 34 - offset).padStart(2, '0')}`;

interface SaleSeed {
  name: string;
  price: number;
}

const PAYMENTS: Sale['paymentMethod'][] = ['cash', 'deuna', 'cash', 'card', 'transfer'];

const buildSales = (seeds: SaleSeed[], channel: Sale['channel'], count: number, prefix: string): Sale[] =>
  Array.from({ length: count }, (_, index) => {
    const { name, price } = seeds[index % seeds.length];
    const quantity = 1 + (index % 3);
    const subtotal = price * quantity;
    return {
      id: `${prefix}-${index + 1}`,
      date: day(Math.floor(index / 8)),
      time: `${String(9 + (index % 10)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
      channel,
      items: [{ dishId: `${prefix}-item`, dishName: name, quantity, unitPrice: price, subtotal }],
      subtotal,
      tax: subtotal * 0.15,
      total: subtotal,
      paymentMethod: PAYMENTS[index % PAYMENTS.length],
      status: 'completed',
    };
  });

export const STORE_SALES = (): Sale[] =>
  buildSales(
    [
      { name: 'Coca-Cola 1,35 L', price: 1.5 },
      { name: 'Leche Toni 1 L', price: 1.1 },
      { name: 'Pan de agua (unidad)', price: 0.15 },
      { name: 'Arroz Conejo 1 kg', price: 1.25 },
      { name: 'Aceite La Favorita 1 L', price: 2.9 },
      { name: 'Huevos (cubeta)', price: 4.5 },
      { name: 'Atún Real', price: 1.6 },
    ],
    'counter',
    64,
    'tienda'
  );

export const BARBER_SALES = (): Sale[] =>
  buildSales(
    [
      { name: 'Corte clásico', price: 6 },
      { name: 'Fade moderno / Degradado', price: 8 },
      { name: 'Perfilado de barba', price: 4 },
      { name: 'Combo Corte + Barba spa', price: 10 },
    ],
    'chair',
    48,
    'turno'
  );

const expense = (id: string, date: string, concept: string, category: Expense['category'], supplier: string, amount: number, receipt: boolean): Expense => ({
  id,
  date,
  concept,
  category,
  supplier,
  amount,
  paymentMethod: receipt ? 'transfer' : 'cash',
  receiptAttached: receipt,
  receiptNumber: receipt ? `FAC-${id.toUpperCase()}` : undefined,
});

export const STORE_EXPENSES = (): Expense[] => [
  expense('st-1', '2026-11-02', 'Bebidas para reventa', 'insumos', 'Arca Continental', 285, true),
  expense('st-2', '2026-11-01', 'Lácteos de la semana', 'insumos', 'Lácteos Toni', 142.5, true),
  expense('st-3', '2026-10-31', 'Pan del día', 'insumos', 'Panadería La Espiga', 78, false),
  expense('st-4', '2026-10-30', 'Arriendo del local', 'arriendo', 'Sr. Carrión', 350, true),
  expense('st-5', '2026-10-29', 'Arroz, azúcar y aceite', 'insumos', 'Abarrotes Don Pepe', 310, true),
  expense('st-6', '2026-10-28', 'Snacks y confitería', 'insumos', 'Confitería Universal', 95, false),
  expense('st-7', '2026-10-27', 'Luz del local', 'servicios', 'CNEL Guayaquil', 62, true),
  expense('st-8', '2026-10-25', 'Sueldo de ayudante', 'sueldos', 'Pedro Aguirre', 460, true),
  expense('st-9', '2026-10-24', 'Fundas y empaques', 'otros', 'Plásticos del Guayas', 38, false),
  expense('st-10', '2026-10-22', 'Reposición de bebidas', 'insumos', 'Arca Continental', 240, true),
  expense('st-11', '2026-10-20', 'Huevos y embutidos', 'insumos', 'Distribuidora del Sur', 188, true),
  expense('st-12', '2026-10-18', 'Internet y teléfono', 'servicios', 'CNT', 35, true),
];

export const BARBER_EXPENSES = (): Expense[] => [
  expense('bk-1', '2026-11-02', 'Toallas y capas', 'insumos', 'Textiles Cuenca', 64, true),
  expense('bk-2', '2026-11-01', 'Pomadas y cera', 'insumos', 'Barber Supply EC', 118, true),
  expense('bk-3', '2026-10-30', 'Arriendo del local', 'arriendo', 'Sra. Vintimilla', 520, true),
  expense('bk-4', '2026-10-28', 'Afilado de navajas', 'otros', 'Afilados Don Luis', 24, false),
  expense('bk-5', '2026-10-27', 'Luz y agua', 'servicios', 'Centrosur / ETAPA', 74, true),
  expense('bk-6', '2026-10-25', 'Comisiones de barberos', 'sueldos', 'Equipo Barber Kings', 980, true),
  expense('bk-7', '2026-10-22', 'Máquina de corte nueva', 'otros', 'Barber Supply EC', 145, true),
  expense('bk-8', '2026-10-20', 'Desinfectante y alcohol', 'insumos', 'Farmacia Cuenca', 31, false),
  expense('bk-9', '2026-10-18', 'Publicidad en redes', 'otros', 'Meta', 40, true),
];

const stock = (
  id: string,
  name: string,
  category: string,
  unit: Ingredient['unit'],
  current: number,
  min: number,
  optimal: number,
  unitCost: number,
  supplierName: string,
  location: string,
  expiryDate: string,
  daysToExpiry: number,
  status: Ingredient['status']
): Ingredient => ({
  id, name, category, unit, currentStock: current, minThreshold: min, optimalStock: optimal, unitCost,
  supplierId: 'sup', supplierName, location, entryDate: '2026-10-25', expiryDate, daysToExpiry, status,
});

export const STORE_STOCK: Ingredient[] = [
  stock('p-1', 'Leche Toni 1 L', 'Lácteos', 'unidad', 18, 12, 24, 0.85, 'Lácteos Toni', 'Refrigerador', '2026-11-05', 2, 'expiring'),
  stock('p-2', 'Yogurt Toni 200 g', 'Lácteos', 'unidad', 9, 12, 20, 0.4, 'Lácteos Toni', 'Refrigerador', '2026-11-12', 9, 'low'),
  stock('p-3', 'Coca-Cola 1,35 L', 'Bebidas', 'unidad', 86, 24, 48, 1.1, 'Arca Continental', 'Bodega', '2027-03-01', 118, 'overstock'),
  stock('p-4', 'Arroz Conejo 1 kg', 'Abarrotes', 'unidad', 40, 15, 40, 0.95, 'Abarrotes Don Pepe', 'Estante 1', '2027-06-01', 210, 'normal'),
  stock('p-5', 'Aceite La Favorita 1 L', 'Abarrotes', 'unidad', 22, 10, 25, 2.3, 'Abarrotes Don Pepe', 'Estante 1', '2027-05-10', 188, 'normal'),
  stock('p-6', 'Pan de agua', 'Panadería', 'unidad', 60, 40, 80, 0.09, 'Panadería La Espiga', 'Vitrina', '2026-11-04', 1, 'expiring'),
  stock('p-7', 'Huevos (cubeta)', 'Frescos', 'unidad', 6, 5, 12, 3.6, 'Distribuidora del Sur', 'Estante 2', '2026-11-20', 17, 'normal'),
  stock('p-8', 'Atún Real', 'Enlatados', 'unidad', 30, 12, 30, 1.2, 'Abarrotes Don Pepe', 'Estante 2', '2028-01-01', 424, 'normal'),
];

export const BARBER_STOCK: Ingredient[] = [
  stock('b-1', 'Pomada mate', 'Acabado', 'unidad', 4, 5, 12, 6.5, 'Barber Supply EC', 'Vitrina', '2027-08-01', 271, 'low'),
  stock('b-2', 'Cera fijación fuerte', 'Acabado', 'unidad', 11, 5, 12, 5.8, 'Barber Supply EC', 'Vitrina', '2027-07-01', 240, 'normal'),
  stock('b-3', 'Aceite para barba', 'Barba', 'unidad', 7, 4, 10, 7.2, 'Barber Supply EC', 'Vitrina', '2027-02-15', 104, 'normal'),
  stock('b-4', 'Hojas de navaja', 'Herramientas', 'unidad', 140, 50, 80, 0.12, 'Barber Supply EC', 'Cajón 1', '2029-01-01', 790, 'overstock'),
  stock('b-5', 'Toallas faciales', 'Lavandería', 'unidad', 24, 20, 40, 2.4, 'Textiles Cuenca', 'Armario', '2030-01-01', 1100, 'normal'),
  stock('b-6', 'Desinfectante', 'Higiene', 'litro', 2, 2, 6, 4.1, 'Farmacia Cuenca', 'Armario', '2026-11-05', 2, 'expiring'),
];

const supplier = (id: string, name: string, contactPerson: string, phone: string, city: string, suppliedItems: string[], lastPurchaseDate: string, priceTrend: Supplier['priceTrend'], priceChangePercent: number, totalPurchasedThisYear: number): Supplier => ({
  id, name, contactPerson, phone, email: `ventas@${name.toLowerCase().replace(/[^a-z]/g, '')}.ec`, city, suppliedItems, lastPurchaseDate, priceTrend, priceChangePercent, totalPurchasedThisYear,
});

export const STORE_SUPPLIERS: Supplier[] = [
  supplier('ss-1', 'Arca Continental', 'Marcos Vera', '099 201 3344', 'Guayaquil', ['Coca-Cola', 'Agua', 'Jugos'], '2026-11-02', 'increased', 3.5, 6120),
  supplier('ss-2', 'Lácteos Toni', 'Ana Suárez', '098 311 7788', 'Guayaquil', ['Leche', 'Yogurt'], '2026-11-01', 'stable', 0, 3240),
  supplier('ss-3', 'Abarrotes Don Pepe', 'José Pérez', '097 455 1022', 'Durán', ['Arroz', 'Azúcar', 'Aceite', 'Atún'], '2026-10-29', 'decreased', 1.5, 7410),
  supplier('ss-4', 'Panadería La Espiga', 'Carmen Ruiz', '096 118 4400', 'Guayaquil', ['Pan', 'Bizcochos'], '2026-10-31', 'stable', 0, 1880),
];

export const BARBER_SUPPLIERS: Supplier[] = [
  supplier('bs-1', 'Barber Supply EC', 'Diego Mora', '099 800 1200', 'Quito', ['Pomadas', 'Máquinas', 'Navajas'], '2026-11-01', 'increased', 5, 2640),
  supplier('bs-2', 'Textiles Cuenca', 'Elena Ortiz', '098 765 1100', 'Cuenca', ['Toallas', 'Capas'], '2026-11-02', 'stable', 0, 780),
  supplier('bs-3', 'Farmacia Cuenca', 'Paúl Cordero', '097 222 3311', 'Cuenca', ['Alcohol', 'Desinfectante'], '2026-10-20', 'decreased', 2, 310),
];

const alert = (id: string, topic: NotificationAlert['topic'], severity: NotificationAlert['severity'], title: string, message: string, rule: string, date: string, promo?: { title: string; dishName: string; discountType: string }): NotificationAlert => ({
  id, topic, severity, title, message, ruleTriggered: rule, date, dismissed: false,
  suggestedAction: promo ? { type: 'create_promo', label: 'Crear promoción', payload: promo } : undefined,
});

export const STORE_ALERTS: NotificationAlert[] = [
  alert('st-a1', 'stock', 'critical', 'Pan de agua vence mañana', 'Quedan 60 panes que vencen mañana. Un combo con leche ayudaría a moverlos hoy.', 'RN-06 · Vida útil menor a 24 horas', 'Hoy, 07:40', { title: 'Combo desayuno', dishName: 'Pan + Leche Toni', discountType: '6 panes + leche a $1,80' }),
  alert('st-a2', 'stock', 'warning', 'Sobrestock de Coca-Cola', 'Tienes 86 unidades, casi el doble de tu nivel óptimo. Evita la próxima compra.', 'RN-06 · Stock sobre 135 % del óptimo', 'Ayer, 19:00'),
  alert('st-a3', 'sales', 'warning', 'Egresos altos esta semana', 'Compraste $727,50 en 3 días y vendiste $590. Revisa antes de pagar el arriendo.', 'RN-05 · Comparativo semanal', 'Ayer, 21:00'),
  alert('st-a4', 'margin', 'info', 'Leche con poco margen', 'La leche te deja solo $0,25 por unidad. Considera subirla a $1,20.', 'RN-03 · Margen bajo', 'Lunes, 18:00'),
];

export const BARBER_ALERTS: NotificationAlert[] = [
  alert('bk-a1', 'sales', 'warning', 'Los miércoles tienen pocas citas', 'Solo 6 de 24 turnos ocupados el próximo miércoles. Una promo de barba podría llenarlos.', 'RN-05 · Ocupación por día', 'Hoy, 08:00', { title: 'Miércoles de barba', dishName: 'Perfilado de barba', discountType: '$3 en lugar de $4' }),
  alert('bk-a2', 'stock', 'warning', 'Pomada mate bajo el mínimo', 'Te quedan 4 unidades y tu mínimo es 5. Barber Supply subió 5 %.', 'RN-06 · Stock bajo umbral', 'Hoy, 09:10'),
  alert('bk-a3', 'stock', 'critical', 'Desinfectante vence en 2 días', 'Quedan 2 litros por vencer. Reponlo antes del fin de semana.', 'RN-06 · Vencimiento próximo', 'Hoy, 09:15'),
  alert('bk-a4', 'margin', 'info', 'El combo es tu servicio más rentable', 'El Combo Corte + Barba deja $6,80 por turno. Ofrécelo al agendar.', 'RN-03 · Ranking de margen', 'Ayer, 20:00'),
];




export const STORE_PRODUCTS: Product[] = [
  ['Coca-Cola 1,35 L', 'Bebidas', 1.5, 86], ['Agua Tesalia 1 L', 'Bebidas', 0.75, 40], ['Jugo Pulp 500 ml', 'Bebidas', 0.8, 32],
  ['Leche Toni 1 L', 'Lácteos', 1.1, 18], ['Yogurt Toni 200 g', 'Lácteos', 0.65, 9], ['Queso fresco', 'Lácteos', 2.5, 7],
  ['Pan de agua', 'Panadería', 0.15, 60], ['Bizcochos (funda)', 'Panadería', 1, 14], ['Arroz Conejo 1 kg', 'Abarrotes', 1.25, 40],
  ['Azúcar Valdez 1 kg', 'Abarrotes', 1.15, 28], ['Aceite La Favorita 1 L', 'Abarrotes', 2.9, 22], ['Atún Real', 'Abarrotes', 1.6, 30],
  ['Huevos (cubeta)', 'Frescos', 4.5, 6], ['Papas fritas Ruffles', 'Snacks', 0.6, 44], ['Chocolate Nestlé', 'Snacks', 0.5, 0],
].map(([name, category, price, stockCount], index) => ({
  id: `prod-${index + 1}`,
  name: String(name),
  sku: `${String(category).slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
  category: String(category),
  price: Number(price),
  costPrice: Number((Number(price) * 0.74).toFixed(2)),
  stock: Number(stockCount),
  isAvailable: Number(stockCount) > 0,
}));

export const PROMOTIONS_SEED: Record<'restaurant' | 'store' | 'barbershop', Promotion[]> = {
  restaurant: [{ id: 'pr-1', title: 'Miércoles de encebollado', item: 'Encebollado mixto', discount: '$3,99 en lugar de $4,50', duration: 'Miércoles 08:00 a 11:30', status: 'draft' }],
  store: [{ id: 'pr-2', title: 'Combo escolar', item: 'Pan + Jugo Pulp', discount: '$1,00 en lugar de $1,25', duration: 'Lunes a viernes', status: 'active' }],
  barbershop: [{ id: 'pr-3', title: 'Trae a un amigo', item: 'Corte clásico', discount: '2 cortes por $10', duration: 'Noviembre', status: 'active' }],
};

export const DEFAULT_TEAMS: Record<string, TeamMember[]> = {
  restaurant: [
    buildMember('m-carlos', 'Carlos Mendoza', 'owner'),
    buildMember('m-lucia', 'Lucía Paredes', 'cashier'),
    buildMember('m-ana', 'Ana Martínez', 'waiter'),
    buildMember('m-wilson', 'Wilson Quishpe', 'kitchen'),
    buildMember('m-jorge', 'Jorge Cevallos', 'inventory'),
  ],
  store: [buildMember('m-rosa', 'Rosa Pillajo', 'owner'), buildMember('m-pedro', 'Pedro Aguirre', 'cashier')],
  barbershop: [
    buildMember('m-mateo', 'Mateo Andrade', 'owner'),
    buildMember('m-david', 'David Ortega', 'barber'),
    buildMember('m-marcela', 'Marcela León', 'cashier'),
  ],
  services: [buildMember('m-owner', 'Administrador', 'owner')],
};

export { TODAY as REFERENCE_DAY };
