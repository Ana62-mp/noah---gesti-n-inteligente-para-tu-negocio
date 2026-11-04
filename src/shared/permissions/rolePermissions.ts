import { BusinessConfig, BusinessType, ChatMessage, NotificationAlert, UserRole } from '../types';

type DraftType = NonNullable<ChatMessage['actionDraft']>['type'];

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Dueño',
  cashier: 'Caja',
  waiter: 'Mesero',
  kitchen: 'Cocina',
  inventory: 'Inventario',
};

export const ROLE_SCOPE: Record<UserRole, string> = {
  owner: 'Acceso completo al negocio, sus finanzas y su configuración.',
  cashier: 'Ventas, cobros y arqueo del día. No ve costos, gastos ni rentabilidad.',
  waiter: 'Mesas, pedidos y carta con precios. No ve finanzas ni costos.',
  kitchen: 'Solo comandas y tiempos de preparación.',
  inventory: 'Insumos, compras de mercadería, proveedores y alertas de stock.',
};

const ROLE_DEMO_NAMES: Record<Exclude<UserRole, 'owner'>, string> = {
  cashier: 'Lucía Paredes',
  waiter: 'Ana Martínez',
  kitchen: 'Wilson Quishpe',
  inventory: 'Jorge Cevallos',
};

const SECTIONS_BY_ROLE: Record<Exclude<UserRole, 'owner'>, readonly string[]> = {
  cashier: ['sales', 'tables', 'delivery', 'menu', 'appointments'],
  waiter: ['tables', 'menu', 'voice_scenarios'],
  kitchen: ['kitchen'],
  inventory: ['inventory', 'suppliers', 'expenses', 'alerts'],
};

const SIMPLE_BUSINESS_ROLES: readonly UserRole[] = ['owner', 'cashier'];
const ALL_ROLES: readonly UserRole[] = ['owner', 'cashier', 'waiter', 'kitchen', 'inventory'];

const DRAFTS_BY_ROLE: Record<UserRole, readonly DraftType[]> = {
  owner: ['expense', 'order', 'promo', 'appointment'],
  cashier: ['order', 'appointment'],
  waiter: ['order'],
  kitchen: [],
  inventory: ['expense'],
};

export const canAccessSection = (role: UserRole, section: string): boolean =>
  role === 'owner' || SECTIONS_BY_ROLE[role].includes(section);

export const canViewFinancials = (role: UserRole): boolean => role === 'owner';

export const canViewDishCosts = (role: UserRole): boolean => role === 'owner';

export const canEditMenu = (role: UserRole): boolean => role === 'owner';

export const canChargeTables = (role: UserRole): boolean => role === 'owner' || role === 'cashier';

export const canCreateDraft = (role: UserRole, type: DraftType): boolean =>
  DRAFTS_BY_ROLE[role].includes(type);

export const getRolesForBusiness = (type: BusinessType): readonly UserRole[] =>
  type === 'restaurant' ? ALL_ROLES : SIMPLE_BUSINESS_ROLES;

export const getRoleHomeSection = (role: UserRole, type: BusinessType): string => {
  if (role === 'kitchen') return 'kitchen';
  if (role === 'waiter') return 'tables';
  if (role === 'inventory') return 'inventory';
  if (role === 'cashier') return 'sales';
  if (type === 'store') return 'store';
  if (type === 'barbershop') return 'appointments';
  return 'dashboard';
};

export const getVoiceScenariosForRole = (role: UserRole): readonly ('A' | 'B' | 'C')[] =>
  role === 'owner' ? ['A', 'B', 'C'] : ['A'];

export const getVisibleAlerts = (role: UserRole, alerts: NotificationAlert[]): NotificationAlert[] => {
  if (role === 'owner') return alerts;
  if (role === 'inventory') return alerts.filter((alert) => alert.topic === 'stock');
  return [];
};

export const getDisplayName = (
  role: UserRole,
  business: BusinessConfig,
  sessionUser: { name: string; role: UserRole } | null
): string => {
  if (sessionUser?.role === role) return sessionUser.name;
  return role === 'owner' ? business.ownerName : ROLE_DEMO_NAMES[role];
};
