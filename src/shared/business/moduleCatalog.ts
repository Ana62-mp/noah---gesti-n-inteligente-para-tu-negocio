import { BusinessType, ModuleCategory, ModuleId } from '../types';

export interface CatalogModule {
  id: ModuleId;
  name: string;
  description: string;
  category: ModuleCategory;
  kind: 'required' | 'optional' | 'future';
  businesses: readonly BusinessType[];
  recommendedFor: readonly BusinessType[];
}

const ALL: readonly BusinessType[] = ['restaurant', 'store', 'barbershop', 'services'];
const SERVICES: readonly BusinessType[] = ['barbershop', 'services'];
const RESTAURANT: readonly BusinessType[] = ['restaurant'];

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: 'Obligatorios',
  finances: 'Finanzas',
  operations: 'Operación',
  inventory: 'Inventario',
  sales: 'Ventas',
  customers: 'Clientes',
  ai: 'Inteligencia',
  future: 'Próximamente',
};

export const MODULE_CATALOG: readonly CatalogModule[] = [
  { id: 'dashboard', name: 'Inicio', description: 'Resumen del negocio con indicadores y gráficos.', category: 'core', kind: 'required', businesses: ALL, recommendedFor: ALL },
  { id: 'assistant', name: 'Asistente Noah', description: 'Pregúntale por voz o texto cómo va tu negocio.', category: 'core', kind: 'required', businesses: ALL, recommendedFor: ALL },
  { id: 'voice_scenarios', name: 'Noah Escucha', description: 'Registra pedidos, citas o gastos hablando.', category: 'core', kind: 'required', businesses: ALL, recommendedFor: ALL },
  { id: 'team', name: 'Equipo y permisos', description: 'Decide qué pantallas ve cada persona.', category: 'core', kind: 'required', businesses: ALL, recommendedFor: ALL },

  { id: 'sales', name: 'Ventas y caja', description: 'Cobros, métodos de pago y cierre del día.', category: 'finances', kind: 'optional', businesses: ALL, recommendedFor: ALL },
  { id: 'expenses', name: 'Gastos y compras', description: 'Egresos, facturas y comprobantes.', category: 'finances', kind: 'optional', businesses: ALL, recommendedFor: ALL },
  { id: 'cashflow', name: 'Flujo de caja', description: 'Compara entradas y salidas por día.', category: 'finances', kind: 'optional', businesses: ALL, recommendedFor: ['restaurant', 'barbershop'] },
  { id: 'reports', name: 'Reportes y rentabilidad', description: 'Márgenes, ranking y estructura de egresos.', category: 'finances', kind: 'optional', businesses: ALL, recommendedFor: ALL },

  { id: 'tables', name: 'Mesas y salón', description: 'Plano de mesas, pedidos y cuentas.', category: 'operations', kind: 'optional', businesses: RESTAURANT, recommendedFor: RESTAURANT },
  { id: 'kitchen', name: 'Cocina y comandas', description: 'Tablero de preparación y tickets.', category: 'operations', kind: 'optional', businesses: RESTAURANT, recommendedFor: RESTAURANT },
  { id: 'delivery', name: 'Delivery y para llevar', description: 'Pedidos por canal. Integraciones pendientes.', category: 'operations', kind: 'optional', businesses: RESTAURANT, recommendedFor: RESTAURANT },
  { id: 'menu', name: 'Carta y menú', description: 'Platos, precios y disponibilidad.', category: 'operations', kind: 'optional', businesses: RESTAURANT, recommendedFor: RESTAURANT },
  { id: 'costing', name: 'Recetas y costeo', description: 'Costo real y margen de cada plato.', category: 'operations', kind: 'optional', businesses: RESTAURANT, recommendedFor: RESTAURANT },
  { id: 'appointments', name: 'Agenda de citas', description: 'Reservas por voz sin choques de horario.', category: 'operations', kind: 'optional', businesses: SERVICES, recommendedFor: SERVICES },
  { id: 'services_catalog', name: 'Catálogo de servicios', description: 'Servicios, duración y precios.', category: 'operations', kind: 'optional', businesses: SERVICES, recommendedFor: SERVICES },

  { id: 'inventory', name: 'Inventario', description: 'Existencias, vencimientos y movimientos.', category: 'inventory', kind: 'optional', businesses: ALL, recommendedFor: RESTAURANT },
  { id: 'suppliers', name: 'Proveedores', description: 'Directorio, compras y variación de precios.', category: 'inventory', kind: 'optional', businesses: ALL, recommendedFor: ['restaurant', 'store'] },

  { id: 'products', name: 'Catálogo de productos', description: 'Productos, precios y disponibilidad.', category: 'sales', kind: 'optional', businesses: ['store'], recommendedFor: ['store'] },
  { id: 'promotions', name: 'Promociones', description: 'Borradores que solo se aplican si los apruebas.', category: 'sales', kind: 'optional', businesses: ALL, recommendedFor: ['restaurant', 'store'] },

  { id: 'customers', name: 'Clientes y fiados', description: 'Historial, visitas y saldos pendientes.', category: 'customers', kind: 'optional', businesses: ALL, recommendedFor: ['restaurant', 'store', 'barbershop', 'services'] },

  { id: 'alerts', name: 'Alertas de Noah', description: 'Avisos de stock, márgenes y ventas.', category: 'ai', kind: 'optional', businesses: ALL, recommendedFor: ALL },

  { id: 'invoice_reader', name: 'Lectura automática de facturas', description: 'Foto de la factura a gasto registrado.', category: 'future', kind: 'future', businesses: ALL, recommendedFor: [] },
  { id: 'whatsapp_reports', name: 'Reportes por WhatsApp', description: 'Resumen diario en tu teléfono.', category: 'future', kind: 'future', businesses: ALL, recommendedFor: [] },
  { id: 'social_posts', name: 'Publicación en redes', description: 'Noah propone y tú apruebas.', category: 'future', kind: 'future', businesses: ALL, recommendedFor: [] },
];

export const REQUIRED_MODULES: readonly ModuleId[] = MODULE_CATALOG.filter(({ kind }) => kind === 'required').map(({ id }) => id);

export const getCatalogFor = (type: BusinessType): CatalogModule[] =>
  MODULE_CATALOG.filter(({ businesses }) => businesses.includes(type));

export const getRecommendedModules = (type: BusinessType): ModuleId[] =>
  getCatalogFor(type)
    .filter(({ kind, recommendedFor }) => kind === 'required' || (kind === 'optional' && recommendedFor.includes(type)))
    .map(({ id }) => id);

export const filterCatalog = (type: BusinessType, category: ModuleCategory | 'all', search: string): CatalogModule[] => {
  const term = search.trim().toLowerCase();
  return getCatalogFor(type).filter(
    ({ category: moduleCategory, name, description }) =>
      (category === 'all' || moduleCategory === category) &&
      (!term || name.toLowerCase().includes(term) || description.toLowerCase().includes(term))
  );
};
