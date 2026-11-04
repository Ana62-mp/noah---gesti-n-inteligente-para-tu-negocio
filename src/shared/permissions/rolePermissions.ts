import { BusinessConfig, BusinessType, ChatMessage, ModuleId, NotificationAlert, TeamMember, UserRole } from '../types';

type DraftType = NonNullable<ChatMessage['actionDraft']>['type'];

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Dueño',
  cashier: 'Caja',
  waiter: 'Mesero',
  kitchen: 'Cocina',
  inventory: 'Inventario',
  barber: 'Barbero',
};

export const ROLE_SCOPE: Record<UserRole, string> = {
  owner: 'Acceso completo al negocio, sus finanzas y su configuración.',
  cashier: 'Ventas, cobros y arqueo del día. No ve costos, gastos ni rentabilidad.',
  waiter: 'Mesas, pedidos y carta con precios. No ve finanzas ni costos.',
  kitchen: 'Solo comandas y tiempos de preparación.',
  inventory: 'Insumos, compras de mercadería, proveedores y alertas de stock.',
  barber: 'Su agenda, los servicios y sus clientes. No ve finanzas.',
};

export const ADMIN_ONLY_SECTIONS: readonly string[] = ['team', 'settings', 'mobile_preview'];

const ALL_SECTIONS: readonly string[] = [
  'dashboard', 'voice_scenarios', 'sales', 'expenses', 'cashflow', 'reports', 'tables', 'kitchen', 'delivery', 'menu', 'costing',
  'appointments', 'services_catalog', 'products', 'promotions', 'customers', 'inventory', 'suppliers', 'alerts', ...ADMIN_ONLY_SECTIONS,
];

const SECTIONS_BY_ROLE: Record<Exclude<UserRole, 'owner'>, readonly string[]> = {
  cashier: ['sales', 'tables', 'delivery', 'menu', 'appointments', 'products', 'customers'],
  waiter: ['tables', 'menu', 'voice_scenarios'],
  kitchen: ['kitchen'],
  inventory: ['inventory', 'suppliers', 'expenses', 'alerts'],
  barber: ['appointments', 'services_catalog', 'customers', 'voice_scenarios'],
};

const HOME_PRIORITY: readonly string[] = ['dashboard', 'sales', 'tables', 'kitchen', 'appointments', 'inventory'];

const ROLES_BY_BUSINESS: Record<BusinessType, readonly UserRole[]> = {
  restaurant: ['owner', 'cashier', 'waiter', 'kitchen', 'inventory'],
  store: ['owner', 'cashier', 'inventory'],
  barbershop: ['owner', 'cashier', 'barber'],
  services: ['owner', 'cashier', 'barber'],
};

const DRAFT_SECTION: Record<DraftType, string> = {
  expense: 'expenses',
  order: 'tables',
  promo: 'dashboard',
  appointment: 'appointments',
};

const ALERT_TOPIC_SECTIONS: Record<NotificationAlert['topic'], readonly string[]> = {
  stock: ['inventory', 'dashboard'],
  margin: ['costing', 'reports', 'dashboard'],
  sales: ['reports', 'dashboard'],
};

export const getDefaultSections = (role: UserRole): readonly string[] =>
  role === 'owner' ? ALL_SECTIONS : SECTIONS_BY_ROLE[role];

export const canAccessSection = (role: UserRole, section: string): boolean => getDefaultSections(role).includes(section);

export const isGrantableSection = (section: string): boolean => !ADMIN_ONLY_SECTIONS.includes(section);

export const getMemberSections = (member: TeamMember): readonly string[] =>
  member.role === 'owner' ? ALL_SECTIONS : member.sections.filter(isGrantableSection);

export const memberCanAccess = (member: TeamMember, activeModules: readonly ModuleId[], section: string): boolean => {
  if (!getMemberSections(member).includes(section)) return false;
  return section === 'mobile_preview' || section === 'settings' || activeModules.includes(section as ModuleId);
};

export const getMemberHome = (member: TeamMember, activeModules: readonly ModuleId[]): string | null => {
  const allowed = HOME_PRIORITY.find((section) => memberCanAccess(member, activeModules, section));
  if (allowed) return allowed;
  return getMemberSections(member).find((section) => memberCanAccess(member, activeModules, section)) ?? null;
};

export const canCreateDraftWith = (sections: readonly string[], type: DraftType): boolean =>
  sections.includes(DRAFT_SECTION[type]);

export const canCreateDraft = (role: UserRole, type: DraftType): boolean =>
  canCreateDraftWith(getDefaultSections(role), type);

export const getRolesForBusiness = (type: BusinessType): readonly UserRole[] => ROLES_BY_BUSINESS[type];

export const getRoleHomeSection = (role: UserRole): string => {
  const sections = getDefaultSections(role);
  return HOME_PRIORITY.find((section) => sections.includes(section)) ?? sections[0];
};

export const getVisibleAlerts = (sections: readonly string[], alerts: NotificationAlert[]): NotificationAlert[] =>
  alerts.filter(({ topic }) => ALERT_TOPIC_SECTIONS[topic].some((section) => sections.includes(section)));

export const buildMember = (id: string, name: string, role: UserRole): TeamMember => ({
  id,
  name,
  role,
  sections: [...getDefaultSections(role)],
});

export const getDisplayName = (member: TeamMember | null, business: BusinessConfig): string =>
  member?.name ?? business.ownerName;
