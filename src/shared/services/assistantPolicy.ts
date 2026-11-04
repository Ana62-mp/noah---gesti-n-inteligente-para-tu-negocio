import { BusinessType, UserRole } from '../types';
import { ROLE_LABELS, getDefaultSections } from '../permissions/rolePermissions';

interface TopicRule {
  keywords: readonly string[];
  sections: readonly string[];
  label: string;
}

// Order matters: the first matching rule decides, so specific phrases go before broad words.
const TOPIC_RULES: readonly TopicRule[] = [
  { keywords: ['registra una compra'], sections: ['expenses'], label: 'las compras de mercadería' },
  {
    keywords: ['registra un gasto', 'pague', 'gaste', 'gasto', 'egreso', 'nomina', 'sueldo', 'arriendo', 'flujo de caja'],
    sections: ['dashboard', 'reports', 'cashflow'],
    label: 'los gastos del negocio',
  },
  {
    keywords: ['ganamos', 'ganancia', 'rentab', 'utilidad', 'resultado', 'margen', 'cuesta hacer', 'costo', 'receta', 'consejo', 'vender mas', 'semana', 'comparativo', 'vamos mejor'],
    sections: ['dashboard', 'reports', 'costing'],
    label: 'la rentabilidad, los costos y los comparativos',
  },
  {
    keywords: ['vendimos', 'ventas', 'en caja', 'cierre de caja', 'saldo de caja', 'arqueo'],
    sections: ['sales', 'dashboard'],
    label: 'las ventas y la caja',
  },
  {
    keywords: ['vencer', 'vencen', 'vencimiento', 'merma', 'sobrestock', 'stock', 'inventario', 'insumo', 'bodega'],
    sections: ['inventory', 'kitchen'],
    label: 'el inventario',
  },
  {
    keywords: ['secos de pollo', 'ceviches', 'mesa cuatro', 'mesa 4', 'tomar pedido'],
    sections: ['tables'],
    label: 'la toma de pedidos',
  },
  { keywords: ['agendame', 'cita', 'corte'], sections: ['appointments'], label: 'la agenda de citas' },
];

const ROLE_HELP: Record<UserRole, string> = {
  owner: 'ventas, rentabilidad, costos, inventario, pedidos y gastos',
  cashier: 'las ventas de hoy, la caja y las mesas por cobrar',
  waiter: 'tomar pedidos, ver tus mesas y consultar la carta',
  kitchen: 'las comandas pendientes y los insumos por vencer',
  inventory: 'los insumos por vencer, el stock bajo y registrar compras',
  barber: 'agendar citas y revisar tu agenda',
};

export const normalizeQuery = (query: string): string =>
  query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export const getRestrictedAnswer = (
  role: UserRole,
  normalizedQuery: string,
  sections: readonly string[] = getDefaultSections(role)
): string | null => {
  const rule = TOPIC_RULES.find(({ keywords }) => keywords.some((word) => normalizedQuery.includes(word)));
  if (!rule || rule.sections.some((section) => sections.includes(section))) return null;
  return `Esa información sobre **${rule.label}** no está habilitada en tu perfil de ${ROLE_LABELS[role]}. El administrador puede darte acceso desde Equipo. Mientras tanto te ayudo con ${ROLE_HELP[role]}.`;
};

export const getRoleGreeting = (role: UserRole, ownerFirstName: string): string =>
  role === 'owner'
    ? `¡Hola, ${ownerFirstName}! Soy **Noah**, tu asistente de gestión. Pregúntame cómo va tu negocio o pídeme que registre un pedido, un gasto o revise tus márgenes.`
    : `¡Hola! Soy **Noah**. Con tu perfil de ${ROLE_LABELS[role]} puedo ayudarte con ${ROLE_HELP[role]}.`;

export const getSuggestedChips = (role: UserRole, businessType: BusinessType): string[] => {
  const isServices = businessType === 'barbershop' || businessType === 'services';
  if (role === 'barber') return ['Agéndame un corte el martes a las 2 de la tarde', 'Agéndame un corte para Luis el martes a las 15:00'];
  if (role === 'waiter') {
    return ['Dos secos de pollo y tres ceviches para la mesa cuatro', '¿Cuál es la mesa que más tiempo lleva esperando?', 'Platos disponibles hoy'];
  }
  if (role === 'kitchen') return ['¿Qué comandas tengo pendientes?', '¿Qué insumos vencen mañana?'];
  if (role === 'inventory') {
    return businessType === 'restaurant'
      ? ['¿Qué tengo por vencer?', '¿Qué insumos tienen stock bajo?', 'Registra una compra de limón por 30 dólares']
      : ['¿Qué productos tienen stock bajo?', 'Registra una compra de 45 dólares en abarrotes'];
  }
  if (role === 'cashier') {
    if (isServices) return ['Agéndame un corte el martes a las 2 de la tarde', '¿Cuánto tengo en caja?'];
    if (businessType === 'store') return ['¿Cuánto vendimos hoy?', '¿Cuánto tengo en caja?'];
    return ['¿Cuánto vendimos hoy?', '¿Cuánto tengo en caja?', '¿Qué mesas están por cobrar?'];
  }
  if (businessType === 'store') {
    return ['¿Cuánto gasté este mes?', 'Registra una compra de 45 dólares en abarrotes', '¿Cuánto tengo en caja?'];
  }
  if (isServices) {
    return ['¿Cuánto vendimos hoy?', 'Agéndame un corte el martes a las 2 de la tarde', '¿Cuánto ganamos este mes?', 'Registra un gasto de 15 dólares en toallas'];
  }
  return [
    'Noah, ¿cuánto vendimos hoy?',
    '¿Cuánto ganamos este mes?',
    '¿Esta semana vamos mejor que la anterior?',
    '¿Cuál es mi plato menos rentable?',
    '¿Cuánto me cuesta hacer un encebollado?',
    '¿Qué tengo por vencer?',
    'Registra una compra de ingredientes por 45 dólares',
    '¿Cuánto tengo en caja?',
    'Dame un consejo para vender más el miércoles',
  ];
};

export interface ExpenseCapture {
  amount: number;
  concept: string;
  category: 'insumos' | 'servicios' | 'otros';
  supplier: string;
}

const DEFAULT_PURCHASE_AMOUNT = 45;
const DEFAULT_POWER_BILL_AMOUNT = 85;

export const isExpenseCapture = (query: string): boolean => {
  if (query.includes('registra una compra') || query.includes('registra un gasto')) return true;
  return /\d/.test(query) && (query.includes('pague') || query.includes('gaste'));
};

export const parseExpenseCapture = (spokenQuery: string): ExpenseCapture => {
  const spoken = spokenQuery.toLowerCase();
  const query = normalizeQuery(spokenQuery);
  const isPowerBill = query.includes('luz');
  const amountMatch = query.match(/\d+(?:[.,]\d+)?/);
  const fallback = isPowerBill ? DEFAULT_POWER_BILL_AMOUNT : DEFAULT_PURCHASE_AMOUNT;
  const amount = amountMatch ? Number(amountMatch[0].replace(',', '.')) : fallback;

  if (isPowerBill) {
    return { amount, concept: 'Pago de energía eléctrica', category: 'servicios', supplier: 'Empresa Eléctrica Quito' };
  }

  const detail = spoken.match(/(?:compra|gasto) de (?!\d|\$)(.+?)(?: por | de \d|$)/)?.[1] ?? spoken.match(/ en ([\p{L} ]+)$/u)?.[1];
  const isPurchase = query.includes('compra');
  return {
    amount,
    concept: detail ? `${isPurchase ? 'Compra' : 'Gasto'}: ${detail}` : 'Compra de ingredientes varios',
    category: isPurchase ? 'insumos' : 'otros',
    supplier: query.includes('mercado') ? 'Mercado Mayorista Quito' : 'Por confirmar',
  };
};
