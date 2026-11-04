import React from 'react';
import {
  BarChart3,
  Bike,
  Boxes,
  Calculator,
  CalendarCheck,
  ChefHat,
  Grid3X3,
  LayoutDashboard,
  Mic,
  Receipt,
  Settings,
  ShoppingBag,
  TrendingDown,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { canAccessSection } from '../../shared/permissions/rolePermissions';
import { BusinessType, UserRole } from '../../shared/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  onlyRoles?: readonly UserRole[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const ICON_CLASS = 'w-4 h-4';
const ICON_ACCENT = `${ICON_CLASS} text-[#EBD48F]`;

const RESTAURANT_SECTIONS: NavSection[] = [
  {
    title: 'RESTAURANTE',
    items: [
      { id: 'costing', label: 'Costeo y Recetas', icon: <Calculator className={ICON_ACCENT} /> },
      { id: 'menu', label: 'Carta / Menú', icon: <UtensilsCrossed className={ICON_CLASS} /> },
      { id: 'tables', label: 'Mesas y Salón', icon: <Grid3X3 className={ICON_CLASS} /> },
      { id: 'kitchen', label: 'Cocina / Comandas', icon: <ChefHat className={ICON_CLASS} /> },
      { id: 'delivery', label: 'Delivery / Para llevar', icon: <Bike className={ICON_CLASS} /> },
    ],
  },
  {
    title: 'INVENTARIO',
    items: [
      { id: 'inventory', label: 'Insumos y Bodega', icon: <Boxes className={ICON_CLASS} /> },
      { id: 'expenses', label: 'Compras de insumos', icon: <Receipt className={ICON_CLASS} />, onlyRoles: ['inventory'] },
      { id: 'suppliers', label: 'Proveedores', icon: <Truck className={ICON_CLASS} /> },
    ],
  },
];

const STORE_SECTIONS: NavSection[] = [
  {
    title: 'MODO TIENDA',
    items: [
      { id: 'store', label: 'Panel Tienda (Simple)', icon: <ShoppingBag className={ICON_ACCENT} /> },
    ],
  },
];

const BARBERSHOP_SECTIONS: NavSection[] = [
  {
    title: 'BARBERÍA',
    items: [{ id: 'appointments', label: 'Agenda de Citas', icon: <CalendarCheck className={ICON_ACCENT} /> }],
  },
];

const getBusinessSections = (type: BusinessType): NavSection[] => {
  if (type === 'restaurant') return RESTAURANT_SECTIONS;
  if (type === 'store') return STORE_SECTIONS;
  if (type === 'barbershop') return BARBERSHOP_SECTIONS;
  return [];
};

const getAllSections = (type: BusinessType): NavSection[] => [
  {
    title: 'INICIO',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className={ICON_CLASS} />, onlyRoles: type === 'restaurant' ? undefined : [] },
      { id: 'voice_scenarios', label: 'Noah Escucha (Voz)', icon: <Mic className={`${ICON_CLASS} text-[#CF6811]`} />, highlight: true },
    ],
  },
  {
    title: 'FINANZAS',
    items: [
      { id: 'sales', label: 'Ventas y Caja', icon: <Receipt className={ICON_CLASS} /> },
      { id: 'expenses', label: 'Gastos y Compras', icon: <TrendingDown className={ICON_CLASS} />, onlyRoles: ['owner'] },
      { id: 'reports', label: 'Reportes y Rentabilidad', icon: <BarChart3 className={ICON_CLASS} /> },
    ],
  },
  ...getBusinessSections(type),
  {
    title: 'CONFIGURACIÓN',
    items: [
      { id: 'settings', label: 'Configuración / Demo', icon: <Settings className={ICON_CLASS} /> },
    ],
  },
];

export const buildNavSections = (role: UserRole, type: BusinessType): NavSection[] =>
  getAllSections(type)
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => canAccessSection(role, item.id) && (!item.onlyRoles || item.onlyRoles.includes(role))
      ),
    }))
    .filter((section) => section.items.length > 0);

const EXTRA_SECTION_LABELS: Record<string, string> = {
  alerts: 'Alertas',
  mobile_preview: 'Ver como App Móvil',
  cashflow: 'Flujo de caja',
  services_catalog: 'Servicios',
};

export const getSectionLabel = (section: string, navSections: NavSection[]): string => {
  const item = navSections.flatMap(({ items }) => items).find(({ id }) => id === section);
  return item?.label ?? EXTRA_SECTION_LABELS[section] ?? 'Sin acceso';
};
