import { BusinessConfig, UserRole } from '../types';
import { getBusinessProfile } from '../business/businessProfiles';
import { getDefaultSections } from '../permissions/rolePermissions';
import {
  DISHES_MOCK,
  INGREDIENTS_MOCK,
} from './mockData';

const REFERENCE_DATE = '2026-11-03';
const LOW_MARGIN_THRESHOLD = 0.3;
const MENU_SAMPLE_LIMIT = 10;

const getRiskyStock = () =>
  INGREDIENTS_MOCK.filter((item) => item.status !== 'normal').map((item) => ({
    insumo: item.name,
    estado: item.status,
    stock: `${item.currentStock} ${item.unit}`,
    diasParaVencer: item.daysToExpiry,
  }));

const getMenu = (withCosts: boolean) =>
  DISHES_MOCK.slice(0, MENU_SAMPLE_LIMIT).map((dish) => ({
    nombre: dish.name,
    precio: dish.sellingPrice,
    disponible: dish.isAvailable,
    ...(withCosts ? { costo: dish.theoreticalCost, margen: dish.grossMargin } : {}),
  }));

const getRestaurantData = (sections: readonly string[]) => ({
  ...(sections.includes('tables') || sections.includes('menu') || sections.includes('costing') ? { platos: getMenu(sections.includes('costing')) } : {}),
  ...(sections.includes('costing')
    ? { platosMargenBajo: DISHES_MOCK.filter((dish) => dish.grossMargin < LOW_MARGIN_THRESHOLD).map((dish) => dish.name) }
    : {}),
  ...(sections.includes('inventory') || sections.includes('kitchen') ? { inventarioEnRiesgo: getRiskyStock() } : {}),
});

const hasFinancialAccess = (sections: readonly string[]) => sections.includes('dashboard') || sections.includes('reports');

export const buildBusinessContext = (business: BusinessConfig, role: UserRole, sections: readonly string[] = getDefaultSections(role)) => {
  const { aiFinancials, reports } = getBusinessProfile(business.type);
  return {
    negocio: business.name,
    giro: business.type,
    ciudad: business.city,
    moneda: business.currency,
    rolDelUsuario: role,
    pantallasPermitidas: sections,
    fechaReferencia: REFERENCE_DATE,
    ...(business.type === 'restaurant' ? getRestaurantData(sections) : {}),
    ...(hasFinancialAccess(sections) ? { finanzasDeEjemplo: aiFinancials, rankingDeRentabilidad: reports.ranking } : {}),
    ...(!hasFinancialAccess(sections) && sections.includes('sales') ? { ventasHoy: (aiFinancials as { ventasHoy?: unknown }).ventasHoy } : {}),
  };
};
