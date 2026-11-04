import React from 'react';

type SectionModule = { default: React.ComponentType };
type SectionLoader = () => Promise<SectionModule>;

const named = <T extends Record<string, unknown>>(load: () => Promise<T>, name: keyof T): SectionLoader =>
  () => load().then((module) => ({ default: module[name] as React.ComponentType }));

const LOADERS: Record<string, SectionLoader> = {
  dashboard: named(() => import('../dashboard/DashboardView'), 'DashboardView'),
  voice_scenarios: named(() => import('../voice-scenarios/NoahVoiceScenarios'), 'NoahVoiceScenarios'),
  sales: named(() => import('../sales/SalesView'), 'SalesView'),
  expenses: named(() => import('../expenses/ExpensesView'), 'ExpensesView'),
  cashflow: named(() => import('../expenses/ExpensesView'), 'ExpensesView'),
  costing: named(() => import('../costing/DishCostingView'), 'DishCostingView'),
  menu: named(() => import('../menu/MenuView'), 'MenuView'),
  tables: named(() => import('../tables/TablesView'), 'TablesView'),
  kitchen: named(() => import('../kitchen/KitchenView'), 'KitchenView'),
  delivery: named(() => import('../delivery/DeliveryView'), 'DeliveryView'),
  inventory: named(() => import('../inventory/InventoryView'), 'InventoryView'),
  suppliers: named(() => import('../suppliers/SuppliersView'), 'SuppliersView'),
  reports: named(() => import('../reports/ReportsView'), 'ReportsView'),
  alerts: named(() => import('../alerts/AlertsView'), 'AlertsView'),
  appointments: named(() => import('../barbershop/BarbershopView'), 'BarbershopView'),
  services_catalog: named(() => import('../barbershop/ServicesCatalogView'), 'ServicesCatalogView'),
  products: named(() => import('../products/ProductsView'), 'ProductsView'),
  customers: named(() => import('../customers/CustomersView'), 'CustomersView'),
  promotions: named(() => import('../promotions/PromotionsView'), 'PromotionsView'),
  team: named(() => import('../team/TeamView'), 'TeamView'),
  mobile_preview: named(() => import('../mobile-preview/MobilePreviewView'), 'MobilePreviewView'),
  settings: named(() => import('../settings/SettingsView'), 'SettingsView'),
};

const lazySections = new Map<string, React.LazyExoticComponent<React.ComponentType>>();

export const getSectionComponent = (section: string): React.LazyExoticComponent<React.ComponentType> | null => {
  const loader = LOADERS[section];
  if (!loader) return null;
  if (!lazySections.has(section)) lazySections.set(section, React.lazy(loader));
  return lazySections.get(section) ?? null;
};

export const preloadSection = (section: string) => {
  LOADERS[section]?.();
};
