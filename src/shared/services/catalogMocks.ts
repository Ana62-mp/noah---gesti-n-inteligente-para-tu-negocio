import { BarberService, Ingredient, NotificationAlert, Product, Promotion, Supplier } from '../types';

const service = (id: string, name: string, category: string, durationMinutes: number, price: number, description: string, bookingsThisMonth: number, isActive = true): BarberService => ({
  id, name, category, durationMinutes, price, description, bookingsThisMonth, isActive,
});

export const SERVICES_SEED: BarberService[] = [
  service('bs-1', 'Corte clásico', 'Corte', 30, 6, 'Corte a tijera o máquina con lavado y peinado.', 120),
  service('bs-2', 'Fade moderno / Degradado', 'Corte', 45, 8, 'Degradado skin fade al ras con acabado navaja.', 155),
  service('bs-3', 'Perfilado y toalla caliente de barba', 'Barba', 20, 4, 'Diseño de barba con vapor ozono y toalla caliente.', 70),
  service('bs-4', 'Combo Corte + Barba spa', 'Combo', 60, 10, 'Servicio completo de corte fade y perfilado de barba con mascarilla.', 96),
  service('bs-5', 'Corte infantil', 'Corte', 25, 5, 'Corte para niños hasta 12 años, con paciencia y juego.', 64),
  service('bs-6', 'Afeitado clásico con navaja', 'Barba', 30, 7, 'Afeitado completo con espuma caliente y navaja libre.', 38),
  service('bs-7', 'Tinte de barba', 'Tratamiento', 40, 9, 'Cobertura de canas con tinte profesional y fijación.', 22),
  service('bs-8', 'Limpieza facial express', 'Tratamiento', 25, 8, 'Limpieza, exfoliación y mascarilla refrescante.', 29),
  service('bs-9', 'Diseño de cejas', 'Tratamiento', 15, 3, 'Perfilado de cejas con hilo o navaja.', 41),
  service('bs-10', 'Combo padre e hijo', 'Combo', 55, 10, 'Dos cortes clásicos, uno infantil, con descuento.', 18),
  service('bs-11', 'Corte + lavado + peinado', 'Corte', 40, 9, 'Corte, lavado con masaje y peinado con producto.', 52),
  service('bs-12', 'Mascarilla negra', 'Tratamiento', 20, 5, 'Mascarilla de carbón para puntos negros.', 12, false),
];

const supplierSeed = (id: string, name: string, contactPerson: string, phone: string, city: string, suppliedItems: string[], lastPurchaseDate: string, priceTrend: Supplier['priceTrend'], priceChangePercent: number, totalPurchasedThisYear: number): Supplier => ({
  id, name, contactPerson, phone, city, suppliedItems, lastPurchaseDate, priceTrend, priceChangePercent, totalPurchasedThisYear,
  email: `ventas@${name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.ec`,
});

export const EXTRA_STORE_SUPPLIERS: Supplier[] = [
  supplierSeed('ss-5', 'Snacks y Confitería Universal', 'Verónica Soto', '0976543210', 'Guayaquil', ['Papas fritas', 'Chocolates', 'Caramelos'], '2026-10-28', 'increased', 2, 1140),
  supplierSeed('ss-6', 'Distribuidora del Sur', 'Raúl Mendoza', '0965432109', 'Guayaquil', ['Huevos', 'Embutidos', 'Quesos'], '2026-10-20', 'stable', 0, 2210),
  supplierSeed('ss-7', 'Plásticos del Guayas', 'Nancy Burgos', '0954321098', 'Durán', ['Fundas', 'Empaques', 'Vasos'], '2026-10-24', 'stable', 0, 460),
  supplierSeed('ss-8', 'Bebidas Pulp Costa', 'Iván Rodríguez', '0943210987', 'Guayaquil', ['Jugos', 'Néctares'], '2026-10-30', 'decreased', 3, 980),
  supplierSeed('ss-9', 'Cárnicos La Fortuna', 'Mónica Reyes', '0932109876', 'Guayaquil', ['Pollo', 'Salchichas', 'Mortadela'], '2026-10-26', 'increased', 6, 1760),
];

export const EXTRA_BARBER_SUPPLIERS: Supplier[] = [
  supplierSeed('bs-s4', 'Cosmética Profesional Andina', 'Lucía Ortega', '0987654321', 'Quito', ['Tintes', 'Shampoo', 'Acondicionador'], '2026-10-25', 'stable', 0, 880),
  supplierSeed('bs-s5', 'Mobiliario Barber Studio', 'Franklin Zhunio', '0976543219', 'Cuenca', ['Sillones', 'Espejos', 'Lavacabezas'], '2026-08-14', 'stable', 0, 2400),
  supplierSeed('bs-s6', 'Imprenta Digital Cuenca', 'Sofía Torres', '0965432198', 'Cuenca', ['Tarjetas', 'Afiches', 'Vouchers'], '2026-09-30', 'increased', 4, 190),
  supplierSeed('bs-s7', 'Lavandería Express', 'Marta Pacheco', '0954321987', 'Cuenca', ['Servicio de lavado de toallas'], '2026-11-01', 'stable', 0, 420),
  supplierSeed('bs-s8', 'Herramientas Pro Ecuador', 'Daniel Cevallos', '0943219876', 'Quito', ['Máquinas', 'Tijeras', 'Peines'], '2026-10-02', 'decreased', 3, 1350),
];

const stockSeed = (id: string, name: string, category: string, unit: Ingredient['unit'], current: number, min: number, optimal: number, unitCost: number, supplierName: string, location: string, expiryDate: string, daysToExpiry: number, status: Ingredient['status']): Ingredient => ({
  id, name, category, unit, currentStock: current, minThreshold: min, optimalStock: optimal, unitCost,
  supplierId: 'sup', supplierName, location, entryDate: '2026-10-25', expiryDate, daysToExpiry, status,
});

export const EXTRA_STORE_STOCK: Ingredient[] = [
  stockSeed('p-9', 'Papas fritas Ruffles', 'Snacks', 'unidad', 44, 20, 50, 0.38, 'Snacks y Confitería Universal', 'Estante 3', '2027-01-15', 72, 'normal'),
  stockSeed('p-10', 'Chocolate Nestlé', 'Snacks', 'unidad', 0, 12, 30, 0.31, 'Snacks y Confitería Universal', 'Estante 3', '2027-02-10', 98, 'low'),
  stockSeed('p-11', 'Jugo Pulp 500 ml', 'Bebidas', 'unidad', 32, 24, 48, 0.52, 'Bebidas Pulp Costa', 'Bodega', '2027-01-20', 77, 'normal'),
  stockSeed('p-12', 'Agua Tesalia 1 L', 'Bebidas', 'unidad', 40, 24, 60, 0.48, 'Arca Continental', 'Bodega', '2027-05-20', 198, 'normal'),
  stockSeed('p-13', 'Azúcar Valdez 1 kg', 'Abarrotes', 'unidad', 28, 15, 35, 0.84, 'Abarrotes Don Pepe', 'Estante 1', '2027-09-01', 301, 'normal'),
  stockSeed('p-14', 'Queso fresco', 'Lácteos', 'unidad', 7, 6, 14, 1.7, 'Lácteos Toni', 'Refrigerador', '2026-11-08', 5, 'low'),
  stockSeed('p-15', 'Salchicha Plumrose', 'Embutidos', 'unidad', 16, 8, 20, 1.9, 'Cárnicos La Fortuna', 'Refrigerador', '2026-11-18', 15, 'normal'),
  stockSeed('p-16', 'Bizcochos (funda)', 'Panadería', 'unidad', 14, 8, 20, 0.7, 'Panadería La Espiga', 'Vitrina', '2026-11-06', 3, 'expiring'),
];

export const EXTRA_BARBER_STOCK: Ingredient[] = [
  stockSeed('b-7', 'Shampoo profesional 1 L', 'Higiene', 'litro', 6, 3, 8, 9.5, 'Cosmética Profesional Andina', 'Lavacabezas', '2027-06-01', 210, 'normal'),
  stockSeed('b-8', 'Tinte de barba negro', 'Tratamientos', 'unidad', 5, 4, 10, 6.8, 'Cosmética Profesional Andina', 'Vitrina', '2027-03-10', 128, 'normal'),
  stockSeed('b-9', 'Capas de corte', 'Lavandería', 'unidad', 8, 6, 10, 7, 'Mobiliario Barber Studio', 'Armario', '2030-01-01', 1100, 'normal'),
  stockSeed('b-10', 'Navajas desechables', 'Herramientas', 'unidad', 90, 40, 80, 0.15, 'Herramientas Pro Ecuador', 'Cajón 1', '2029-01-01', 790, 'overstock'),
  stockSeed('b-11', 'Alcohol antiséptico', 'Higiene', 'litro', 3, 2, 6, 3.8, 'Farmacia Cuenca', 'Armario', '2026-11-20', 17, 'normal'),
  stockSeed('b-12', 'Talco para cuello', 'Acabado', 'unidad', 2, 4, 8, 2.9, 'Barber Supply EC', 'Cajón 2', '2027-04-01', 150, 'low'),
];

export const EXTRA_STORE_PRODUCTS: Product[] = [
  ['Atún Isabel 170 g', 'Abarrotes', 1.45, 26, 'ABA-014'], ['Fideos Sumesa 400 g', 'Abarrotes', 0.95, 34, 'ABA-021'], ['Sal Cris-Sal 1 kg', 'Abarrotes', 0.55, 18, 'ABA-030'],
  ['Cola Inca Kola 1 L', 'Bebidas', 1.2, 20, 'BEB-007'], ['Té frío 500 ml', 'Bebidas', 0.85, 12, 'BEB-015'], ['Mantequilla Reyes', 'Lácteos', 1.6, 9, 'LAC-009'],
  ['Salchicha Plumrose', 'Embutidos', 2.4, 16, 'EMB-002'], ['Jamón de pavo (libra)', 'Embutidos', 3.1, 6, 'EMB-005'], ['Galletas Ritz', 'Snacks', 0.45, 48, 'SNK-011'],
  ['Caramelos surtidos (bolsa)', 'Snacks', 0.6, 0, 'SNK-020'],
].map(([name, category, price, stock, sku], index) => ({
  id: `prod-x${index + 1}`, name: String(name), category: String(category), price: Number(price), stock: Number(stock), isAvailable: Number(stock) > 0, sku: String(sku), costPrice: Number((Number(price) * 0.74).toFixed(2)),
}));

const promo = (id: string, title: string, item: string, discount: string, duration: string, status: Promotion['status']): Promotion => ({ id, title, item, discount, duration, status });

export const EXTRA_PROMOTIONS: Record<'restaurant' | 'store' | 'barbershop', Promotion[]> = {
  restaurant: [
    promo('pr-r2', '2x1 en seco de pollo', 'Seco de pollo', '2 platos por $7,50', 'Hoy hasta las 16:00', 'draft'),
    promo('pr-r3', 'Almuerzo ejecutivo', 'Sopa + segundo + jugo', '$4,50 en lugar de $5,50', 'Lunes a viernes', 'active'),
    promo('pr-r4', 'Jarra de naranjilla gratis', 'Jarra de naranjilla', 'Gratis en consumos de $30', 'Fines de semana', 'active'),
    promo('pr-r5', 'Colada morada con guagua', 'Colada morada', '$3,00 el combo', 'Del 25 de octubre al 3 de noviembre', 'ended'),
    promo('pr-r6', 'Cumpleaños con postre', 'Postre del día', 'Postre de cortesía', 'Todo el mes', 'active'),
    promo('pr-r7', 'Ceviche con chifles extra', 'Ceviche de camarón', 'Chifles gratis', 'Esta semana', 'draft'),
  ],
  store: [
    promo('pr-s3', 'Desayuno completo', 'Pan + leche + huevo', '$1,80 el combo', 'Todas las mañanas', 'draft'),
    promo('pr-s4', 'Lleva 3 gaseosas', 'Coca-Cola 1,35 L', '3 por $4,00', 'Fin de semana', 'active'),
    promo('pr-s5', 'Día de la leche', 'Leche Toni 1 L', '$0,95 la unidad', 'Miércoles', 'ended'),
    promo('pr-s6', 'Snacks para la escuela', 'Galletas + jugo', '$0,90 el combo', 'Lunes a viernes', 'active'),
    promo('pr-s7', 'Cliente frecuente', 'Compra mayor a $20', '5 % de descuento', 'Noviembre', 'active'),
  ],
  barbershop: [
    promo('pr-b2', 'Miércoles de barba', 'Perfilado de barba', '$3,00 en lugar de $4,00', 'Miércoles', 'draft'),
    promo('pr-b3', 'Combo padre e hijo', 'Combo padre e hijo', '$10,00 los dos', 'Sábados', 'active'),
    promo('pr-b4', 'Primera vez', 'Corte clásico', '20 % de descuento', 'Clientes nuevos', 'active'),
    promo('pr-b5', 'Día del padre', 'Combo corte + barba', '$8,00', 'Junio', 'ended'),
    promo('pr-b6', 'Tarjeta de 10 cortes', 'Corte clásico', 'El décimo gratis', 'Todo el año', 'active'),
  ],
};

const alert = (id: string, topic: NotificationAlert['topic'], severity: NotificationAlert['severity'], title: string, message: string, rule: string, date: string): NotificationAlert => ({
  id, topic, severity, title, message, ruleTriggered: rule, date, dismissed: false,
});

export const EXTRA_STORE_ALERTS: NotificationAlert[] = [
  alert('st-a5', 'stock', 'warning', 'Chocolate Nestlé sin stock', 'No tienes chocolates y los pides cada semana. Repón antes del fin de semana.', 'RN-06 · Stock en cero', 'Hoy, 08:10'),
  alert('st-a6', 'sales', 'info', 'Los sábados vendes 40 % más', 'El sábado es tu mejor día. Asegura bebidas y snacks desde el viernes.', 'RN-05 · Comparativo por día', 'Ayer, 17:30'),
];

export const EXTRA_BARBER_ALERTS: NotificationAlert[] = [
  alert('bk-a5', 'sales', 'info', 'Clientes sin volver hace 30 días', '4 clientes frecuentes no han vuelto. Un recordatorio por WhatsApp podría ayudar.', 'RN-05 · Frecuencia de visitas', 'Hoy, 07:50'),
  alert('bk-a6', 'stock', 'warning', 'Talco para cuello bajo el mínimo', 'Quedan 2 unidades y tu mínimo es 4.', 'RN-06 · Stock bajo umbral', 'Ayer, 18:30'),
];
