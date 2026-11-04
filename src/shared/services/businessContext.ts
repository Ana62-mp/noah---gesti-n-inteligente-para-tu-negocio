import { BusinessConfig, UserRole } from '../types';
import {
  DISHES_MOCK,
  INGREDIENTS_MOCK,
  NOTIFICATIONS_MOCK,
} from './mockData';

const REFERENCE_DATE = '2026-11-03';
const LOW_MARGIN_THRESHOLD = 0.3;
const TOP_DISHES_LIMIT = 5;
const FINANCIAL_ROLES: UserRole[] = ['owner', 'cashier'];

// Same figures the demo engine and the dashboard narrate, so live and demo answers agree.
const SAMPLE_FINANCIALS = {
  ventasHoy: { total: 780.5, pedidos: 86, franjaFuerte: '12:30-14:30 ($352,00)', vsMartesAnterior: '+12 %' },
  octubre: { ventas: 15400, costoInsumos: 6300, gastosOperativos: 6150, resultadoEstimado: 2950 },
  semanaActualVsAnterior: 'Datos de ejemplo: comparar con el período equivalente indicado por el usuario',
};

export const buildBusinessContext = (business: BusinessConfig, role: UserRole) => {
  const base = {
    negocio: business.name,
    giro: business.type,
    ciudad: business.city,
    moneda: business.currency,
    rolDelUsuario: role,
    fechaReferencia: REFERENCE_DATE,
    platos: DISHES_MOCK.slice(0, TOP_DISHES_LIMIT * 2).map((dish) => ({
      nombre: dish.name,
      precio: dish.sellingPrice,
      costo: dish.theoreticalCost,
      margen: dish.grossMargin,
    })),
    platosMargenBajo: DISHES_MOCK.filter((dish) => dish.grossMargin < LOW_MARGIN_THRESHOLD).map(
      (dish) => dish.name
    ),
    inventarioEnRiesgo: INGREDIENTS_MOCK.filter((item) => item.status !== 'normal').map((item) => ({
      insumo: item.name,
      estado: item.status,
      stock: `${item.currentStock} ${item.unit}`,
      diasParaVencer: item.daysToExpiry,
    })),
    alertasActivas: NOTIFICATIONS_MOCK.filter((alert) => !alert.dismissed).map((alert) => alert.title),
  };

  if (!FINANCIAL_ROLES.includes(role)) return base;

  return { ...base, finanzasDeEjemplo: SAMPLE_FINANCIALS };
};
