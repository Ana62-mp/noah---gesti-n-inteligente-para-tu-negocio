import { BusinessConfig, UserRole } from '../types';
import {
  DISHES_MOCK,
  INGREDIENTS_MOCK,
  NOTIFICATIONS_MOCK,
} from './mockData';

const REFERENCE_DATE = '2026-11-03';
const LOW_MARGIN_THRESHOLD = 0.3;
const MENU_SAMPLE_LIMIT = 10;

// Same figures the demo engine and the dashboard narrate, so live and demo answers agree.
const SALES_TODAY = { total: 780.5, pedidos: 86, franjaFuerte: '12:30-14:30 ($352,00)', vsMartesAnterior: '+12 %' };
const SAMPLE_FINANCIALS = {
  ventasHoy: SALES_TODAY,
  octubre: { ventas: 15400, costoInsumos: 6300, gastosOperativos: 6150, resultadoEstimado: 2950 },
};

const getRiskyStock = () =>
  INGREDIENTS_MOCK.filter((item) => item.status !== 'normal').map((item) => ({
    insumo: item.name,
    estado: item.status,
    stock: `${item.currentStock} ${item.unit}`,
    diasParaVencer: item.daysToExpiry,
  }));

const getMenuForStaff = () =>
  DISHES_MOCK.slice(0, MENU_SAMPLE_LIMIT).map((dish) => ({
    nombre: dish.name,
    precio: dish.sellingPrice,
    disponible: dish.isAvailable,
  }));

const getMenuForOwner = () =>
  DISHES_MOCK.slice(0, MENU_SAMPLE_LIMIT).map((dish) => ({
    nombre: dish.name,
    precio: dish.sellingPrice,
    costo: dish.theoreticalCost,
    margen: dish.grossMargin,
  }));

const getRoleData = (role: UserRole) => {
  if (role === 'owner') {
    return {
      platos: getMenuForOwner(),
      platosMargenBajo: DISHES_MOCK.filter((dish) => dish.grossMargin < LOW_MARGIN_THRESHOLD).map((dish) => dish.name),
      inventarioEnRiesgo: getRiskyStock(),
      alertasActivas: NOTIFICATIONS_MOCK.filter((alert) => !alert.dismissed).map((alert) => alert.title),
      finanzasDeEjemplo: SAMPLE_FINANCIALS,
    };
  }
  if (role === 'cashier') return { platos: getMenuForStaff(), ventasHoy: SALES_TODAY };
  if (role === 'waiter') return { platos: getMenuForStaff() };
  return { inventarioEnRiesgo: getRiskyStock() };
};

export const buildBusinessContext = (business: BusinessConfig, role: UserRole) => ({
  negocio: business.name,
  giro: business.type,
  ciudad: business.city,
  moneda: business.currency,
  rolDelUsuario: role,
  fechaReferencia: REFERENCE_DATE,
  ...getRoleData(role),
});
