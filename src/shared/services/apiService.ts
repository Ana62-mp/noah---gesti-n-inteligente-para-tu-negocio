import {
  Sale,
  Expense,
  Dish,
  Ingredient,
  Supplier,
  TableItem,
  KitchenTicket,
  DeliveryOrder,
  Appointment,
  NotificationAlert,
} from '../types';
import {
  generateSalesHistory,
  generateExpensesHistory,
  DISHES_MOCK,
  INGREDIENTS_MOCK,
  SUPPLIERS_MOCK,
  TABLES_MOCK,
  KITCHEN_TICKETS_MOCK,
  DELIVERY_ORDERS_MOCK,
  APPOINTMENTS_MOCK,
  NOTIFICATIONS_MOCK,
} from './mockData';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ApiService {
  private sales: Sale[] = [];
  private expenses: Expense[] = [];
  private dishes: Dish[] = [];
  private ingredients: Ingredient[] = [];
  private suppliers: Supplier[] = [];
  private tables: TableItem[] = [];
  private kitchenTickets: KitchenTicket[] = [];
  private deliveryOrders: DeliveryOrder[] = [];
  private appointments: Appointment[] = [];
  private notifications: NotificationAlert[] = [];
  private simulateError: boolean = false;
  private simulateEmpty: boolean = false;

  constructor() {
    this.resetData();
  }

  public resetData() {
    this.sales = generateSalesHistory();
    this.expenses = generateExpensesHistory();
    this.dishes = JSON.parse(JSON.stringify(DISHES_MOCK));
    this.ingredients = JSON.parse(JSON.stringify(INGREDIENTS_MOCK));
    this.suppliers = JSON.parse(JSON.stringify(SUPPLIERS_MOCK));
    this.tables = JSON.parse(JSON.stringify(TABLES_MOCK));
    this.kitchenTickets = JSON.parse(JSON.stringify(KITCHEN_TICKETS_MOCK));
    this.deliveryOrders = JSON.parse(JSON.stringify(DELIVERY_ORDERS_MOCK));
    this.appointments = JSON.parse(JSON.stringify(APPOINTMENTS_MOCK));
    this.notifications = JSON.parse(JSON.stringify(NOTIFICATIONS_MOCK));
  }

  public setSimulateError(val: boolean) {
    this.simulateError = val;
  }

  public setSimulateEmpty(val: boolean) {
    this.simulateEmpty = val;
  }

  private async delay(ms: number = 350) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- SALES ---
  public async getSales(params: PaginationParams = {}): Promise<PaginatedResult<Sale>> {
    await this.delay();
    if (this.simulateError) throw new Error('Error al conectar con el servidor de ventas.');
    if (this.simulateEmpty) return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    let list = [...this.sales];

    if (params.filter && params.filter !== 'all') {
      list = list.filter((s) => s.channel === params.filter || s.paymentMethod === params.filter);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((s) => s.id.toLowerCase().includes(q) || s.items.some((i) => i.dishName.toLowerCase().includes(q)));
    }

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  public async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    await this.delay(200);
    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
    };
    this.sales.unshift(newSale);
    return newSale;
  }

  // --- EXPENSES ---
  public async getExpenses(params: PaginationParams = {}): Promise<PaginatedResult<Expense>> {
    await this.delay();
    if (this.simulateError) throw new Error('No se pudieron cargar los registros de gastos.');
    if (this.simulateEmpty) return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    let list = [...this.expenses];

    if (params.filter && params.filter !== 'all') {
      list = list.filter((e) => e.category === params.filter);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((e) => e.concept.toLowerCase().includes(q) || (e.supplier && e.supplier.toLowerCase().includes(q)));
    }

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  public async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    await this.delay(200);
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    this.expenses.unshift(newExp);
    return newExp;
  }

  // --- DISHES ---
  public async getDishes(): Promise<Dish[]> {
    await this.delay(250);
    if (this.simulateError) throw new Error('Error al sincronizar la carta del restaurante.');
    if (this.simulateEmpty) return [];
    return [...this.dishes];
  }

  public async updateDishPrice(dishId: string, newPrice: number): Promise<Dish> {
    await this.delay(200);
    const dish = this.dishes.find((d) => d.id === dishId);
    if (!dish) throw new Error('Plato no encontrado');
    dish.sellingPrice = newPrice;
    dish.grossMargin = (dish.sellingPrice - dish.theoreticalCost) / dish.sellingPrice;
    return { ...dish };
  }

  public async toggleDishAvailability(dishId: string): Promise<Dish> {
    await this.delay(100);
    const dish = this.dishes.find((d) => d.id === dishId);
    if (!dish) throw new Error('Plato no encontrado');
    dish.isAvailable = !dish.isAvailable;
    return { ...dish };
  }

  public async updateDishRecipe(dishId: string, ingredients: Dish['ingredients']): Promise<Dish> {
    await this.delay(250);
    const dish = this.dishes.find((d) => d.id === dishId);
    if (!dish) throw new Error('Plato no encontrado');
    dish.ingredients = ingredients;
    const newCost = ingredients.reduce((sum, ing) => sum + ing.subtotal, 0);
    dish.theoreticalCost = Number(newCost.toFixed(2));
    dish.grossMargin = (dish.sellingPrice - dish.theoreticalCost) / dish.sellingPrice;
    return { ...dish };
  }

  // --- INGREDIENTS ---
  public async getIngredients(params: PaginationParams = {}): Promise<PaginatedResult<Ingredient>> {
    await this.delay();
    if (this.simulateError) throw new Error('Error al consultar el inventario de insumos.');
    if (this.simulateEmpty) return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    let list = [...this.ingredients];

    if (params.filter && params.filter !== 'all') {
      list = list.filter((i) => i.status === params.filter);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.supplierName.toLowerCase().includes(q));
    }

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  public async recordStockMovement(
    ingredientId: string,
    type: 'entry' | 'consumption' | 'adjustment' | 'waste',
    amount: number,
    notes?: string
  ): Promise<Ingredient> {
    await this.delay(200);
    const ing = this.ingredients.find((i) => i.id === ingredientId);
    if (!ing) throw new Error('Insumo no encontrado');

    if (type === 'entry') {
      ing.currentStock += amount;
    } else {
      ing.currentStock = Math.max(0, ing.currentStock - amount);
    }

    // Recalculate status
    if (ing.daysToExpiry <= 2) {
      ing.status = 'expiring';
    } else if (ing.currentStock <= ing.minThreshold) {
      ing.status = 'low';
    } else if (ing.currentStock > ing.optimalStock * 1.35) {
      ing.status = 'overstock';
    } else {
      ing.status = 'normal';
    }

    return { ...ing };
  }

  // --- SUPPLIERS ---
  public async getSuppliers(params: PaginationParams = {}): Promise<PaginatedResult<Supplier>> {
    await this.delay();
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    let list = [...this.suppliers];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.suppliedItems.some((it) => it.toLowerCase().includes(q)));
    }

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  // --- TABLES ---
  public async getTables(): Promise<TableItem[]> {
    await this.delay(150);
    return [...this.tables];
  }

  public async updateTableStatus(
    tableId: number,
    status: TableItem['status'],
    total?: number,
    waiterName?: string
  ): Promise<TableItem> {
    await this.delay(100);
    const table = this.tables.find((t) => t.id === tableId);
    if (!table) throw new Error('Mesa no encontrada');
    table.status = status;
    if (status === 'free') {
      table.currentOrderId = undefined;
      table.seatedAt = undefined;
      table.total = undefined;
      table.waiterName = undefined;
      return { ...table };
    }
    if (total !== undefined) table.total = total;
    if (waiterName) table.waiterName = waiterName;
    if (!table.seatedAt) {
      table.seatedAt = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    }
    return { ...table };
  }

  // --- KITCHEN TICKETS ---
  public async getKitchenTickets(): Promise<KitchenTicket[]> {
    await this.delay(200);
    return [...this.kitchenTickets];
  }

  public async updateTicketStatus(ticketId: string, status: KitchenTicket['status']): Promise<KitchenTicket> {
    await this.delay(100);
    const t = this.kitchenTickets.find((ticket) => ticket.id === ticketId);
    if (!t) throw new Error('Ticket no encontrado');
    t.status = status;
    return { ...t };
  }

  public getNextOrderNumber(): string {
    const numbers = this.kitchenTickets.map((ticket) => Number(ticket.orderNumber.replace('#', '')) || 0);
    return `#${Math.max(0, ...numbers) + 1}`;
  }

  public async addKitchenTicket(ticket: Omit<KitchenTicket, 'id'>): Promise<KitchenTicket> {
    await this.delay(150);
    const newTicket: KitchenTicket = {
      ...ticket,
      id: `kt-${Date.now()}`,
    };
    this.kitchenTickets.unshift(newTicket);
    return newTicket;
  }

  // --- DELIVERY ---
  public async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    await this.delay(200);
    return [...this.deliveryOrders];
  }

  public async updateDeliveryStatus(orderId: string, status: DeliveryOrder['status']): Promise<DeliveryOrder> {
    await this.delay(150);
    const order = this.deliveryOrders.find((o) => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado');
    order.status = status;
    return { ...order };
  }

  // --- APPOINTMENTS (Barbershop) ---
  public async getAppointments(): Promise<Appointment[]> {
    await this.delay(200);
    return [...this.appointments];
  }

  public async addAppointment(appt: Omit<Appointment, 'id'>): Promise<Appointment> {
    await this.delay(200);
    const newAppt: Appointment = {
      ...appt,
      id: `apt-${Date.now()}`,
    };
    this.appointments.push(newAppt);
    return newAppt;
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(): Promise<NotificationAlert[]> {
    await this.delay(150);
    return [...this.notifications];
  }

  public async dismissNotification(id: string): Promise<void> {
    await this.delay(50);
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) n.dismissed = true;
  }
}

export const apiService = new ApiService();
