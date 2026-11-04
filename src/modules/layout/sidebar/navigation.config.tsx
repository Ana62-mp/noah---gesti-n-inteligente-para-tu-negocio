import React from 'react';
import {
  BarChart3,
  Bike,
  BellRing,
  Boxes,
  Calculator,
  CalendarCheck,
  ChefHat,
  Contact,
  Grid3X3,
  LayoutDashboard,
  Mic,
  Package,
  Receipt,
  Scissors,
  Settings,
  Smartphone,
  Tag,
  TrendingDown,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { getBusinessProfile } from '../../../shared/business/businessProfiles';
import { BusinessType } from '../../../shared/types';

interface NavItemDefinition {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: { title: string; items: NavItemDefinition[] }[] = [
  {
    title: 'Inicio',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { id: 'voice_scenarios', label: 'Noah Escucha', Icon: Mic },
      { id: 'alerts', label: 'Alertas', Icon: BellRing },
    ],
  },
  {
    title: 'Operación',
    items: [
      { id: 'tables', label: 'Mesas y salón', Icon: Grid3X3 },
      { id: 'kitchen', label: 'Cocina y comandas', Icon: ChefHat },
      { id: 'delivery', label: 'Delivery y para llevar', Icon: Bike },
      { id: 'appointments', label: 'Agenda de citas', Icon: CalendarCheck },
      { id: 'services_catalog', label: 'Servicios', Icon: Scissors },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { id: 'sales', label: 'Ventas y caja', Icon: Receipt },
      { id: 'menu', label: 'Carta y menú', Icon: UtensilsCrossed },
      { id: 'costing', label: 'Recetas y costeo', Icon: Calculator },
      { id: 'products', label: 'Productos', Icon: Package },
      { id: 'promotions', label: 'Promociones', Icon: Tag },
      { id: 'customers', label: 'Clientes y fiados', Icon: Contact },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { id: 'expenses', label: 'Gastos y compras', Icon: TrendingDown },
      { id: 'reports', label: 'Reportes', Icon: BarChart3 },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { id: 'inventory', label: 'Inventario', Icon: Boxes },
      { id: 'suppliers', label: 'Proveedores', Icon: Truck },
    ],
  },
  {
    title: 'Administración',
    items: [
      { id: 'team', label: 'Equipo y permisos', Icon: Users },
      { id: 'mobile_preview', label: 'Ver como app móvil', Icon: Smartphone },
      { id: 'settings', label: 'Configuración', Icon: Settings },
    ],
  },
];

const EXTRA_TITLES: Record<string, string> = { cashflow: 'Flujo de caja' };

export const getSectionTitle = (section: string, type: BusinessType): string => {
  const override = getBusinessProfile(type).sectionLabels[section];
  if (override) return override;
  const item = NAV_GROUPS.flatMap(({ items }) => items).find(({ id }) => id === section);
  return item?.label ?? EXTRA_TITLES[section] ?? 'Sin acceso';
};

export const buildNavSections = (accessibleSections: readonly string[], type: BusinessType): NavSection[] =>
  NAV_GROUPS.map(({ title, items }) => ({
    title,
    items: items
      .filter(({ id }) => accessibleSections.includes(id))
      .map(({ id, Icon }) => ({ id, label: getSectionTitle(id, type), icon: <Icon className="w-4 h-4 shrink-0" /> })),
  })).filter(({ items }) => items.length > 0);
