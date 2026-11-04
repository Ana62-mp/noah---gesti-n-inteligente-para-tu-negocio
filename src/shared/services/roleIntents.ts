import { apiService } from './apiService';
import { DISHES_MOCK, INGREDIENTS_MOCK } from './mockData';

const SAMPLE_DISHES_LIMIT = 5;

export interface RoleIntentAnswer {
  text: string;
  modules: string[];
}

const answerAvailableDishes = (): RoleIntentAnswer => {
  const available = DISHES_MOCK.filter((dish) => dish.isAvailable);
  const sample = available
    .slice(0, SAMPLE_DISHES_LIMIT)
    .map((dish) => `• ${dish.name}: $${dish.sellingPrice.toFixed(2).replace('.', ',')}`)
    .join('\n');
  return {
    text: `Hoy hay **${available.length} platos disponibles**. Algunos:\n${sample}`,
    modules: ['Carta y Menú'],
  };
};

const answerLongestWaitingTable = async (): Promise<RoleIntentAnswer> => {
  const tables = (await apiService.getTables()).filter((table) => table.seatedAt);
  const [oldest] = [...tables].sort((a, b) => (a.seatedAt ?? '').localeCompare(b.seatedAt ?? ''));
  if (!oldest) return { text: 'Ahora no hay mesas ocupadas.', modules: ['Mesas y Salón'] };
  return {
    text: `La que más tiempo lleva es **${oldest.name}**: se sentaron a las ${oldest.seatedAt} y la atiende ${oldest.waiterName}.`,
    modules: ['Mesas y Salón'],
  };
};

const answerTablesToCharge = async (): Promise<RoleIntentAnswer> => {
  const pending = (await apiService.getTables()).filter((table) => table.status === 'billing');
  if (pending.length === 0) return { text: 'No hay mesas por cobrar en este momento.', modules: ['Mesas y Salón'] };
  const list = pending.map((table) => `• ${table.name}: $${(table.total ?? 0).toFixed(2).replace('.', ',')}`).join('\n');
  return { text: `Tienes **${pending.length} mesa(s) por cobrar**:\n${list}`, modules: ['Mesas y Salón', 'Ventas y Caja'] };
};

const answerPendingTickets = async (): Promise<RoleIntentAnswer> => {
  const pending = (await apiService.getKitchenTickets()).filter((ticket) => ticket.status !== 'ready');
  if (pending.length === 0) return { text: 'No hay comandas pendientes.', modules: ['Cocina y Comandas'] };
  const list = pending
    .map((ticket) => `• ${ticket.orderNumber} (${ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : 'Delivery'}): ${ticket.items.length} plato(s)`)
    .join('\n');
  return { text: `Tienes **${pending.length} comandas en curso**:\n${list}`, modules: ['Cocina y Comandas'] };
};

const answerLowStock = (): RoleIntentAnswer => {
  const low = INGREDIENTS_MOCK.filter((item) => item.status === 'low');
  if (low.length === 0) return { text: 'Ningún insumo está bajo su mínimo.', modules: ['Insumos y Bodega'] };
  const list = low.map((item) => `• ${item.name}: ${item.currentStock} ${item.unit} (mínimo ${item.minThreshold})`).join('\n');
  return { text: `Hay **${low.length} insumo(s) con stock bajo**:\n${list}`, modules: ['Insumos y Bodega'] };
};

export const matchRoleIntent = async (query: string): Promise<RoleIntentAnswer | null> => {
  if (query.includes('platos disponibles') || query.includes('que hay en la carta')) return answerAvailableDishes();
  if (query.includes('mesa') && (query.includes('tiempo') || query.includes('esperando'))) return answerLongestWaitingTable();
  if (query.includes('por cobrar')) return answerTablesToCharge();
  if (query.includes('comandas')) return answerPendingTickets();
  if (query.includes('stock bajo')) return answerLowStock();
  return null;
};
