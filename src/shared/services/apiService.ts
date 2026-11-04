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
  BarberService,
  BusinessType,
  Customer,
  Product,
  Promotion,
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
import {
  BARBER_ALERTS,
  BARBER_EXPENSES,
  BARBER_SALES,
  BARBER_STOCK,
  BARBER_SUPPLIERS,
  PROMOTIONS_SEED,
  STORE_ALERTS,
  STORE_EXPENSES,
  STORE_PRODUCTS,
  STORE_SALES,
  STORE_STOCK,
  STORE_SUPPLIERS,
} from './businessMocks';
import { BARBER_CUSTOMERS, RESTAURANT_CUSTOMERS, STORE_CUSTOMERS } from './customerMocks';
import {
  EXTRA_BARBER_ALERTS,
  EXTRA_BARBER_STOCK,
  EXTRA_BARBER_SUPPLIERS,
  EXTRA_PROMOTIONS,
  EXTRA_STORE_ALERTS,
  EXTRA_STORE_PRODUCTS,
  EXTRA_STORE_STOCK,
  EXTRA_STORE_SUPPLIERS,
  SERVICES_SEED,
} from './catalogMocks';

export type CollectionName =
  | 'customers'
  | 'products'
  | 'promotions'
  | 'suppliers'
  | 'services'
  | 'dishes'
  | 'ingredients'
  | 'expenses'
  | 'sales'
  | 'appointments';

type DatasetKey = 'restaurant' | 'store' | 'barbershop';

interface BusinessDataset {
  sales: Sale[];
  expenses: Expense[];
  ingredients: Ingredient[];
  suppliers: Supplier[];
  notifications: NotificationAlert[];
  customers: Customer[];
  promotions: Promotion[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

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
  extras?: Record<string, string>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ApiService {
  private datasets!: Record<DatasetKey, BusinessDataset>;
  private activeDataset: DatasetKey = 'restaurant';
  private products: Product[] = [];
  private services: BarberService[] = [];
  private dishes: Dish[] = [];
  private tables: TableItem[] = [];
  private kitchenTickets: KitchenTicket[] = [];
  private deliveryOrders: DeliveryOrder[] = [];
  private appointments: Appointment[] = [];
  private simulateError: boolean = false;
  private simulateEmpty: boolean = false;

  constructor() {
    this.resetData();
  }

  private get data(): BusinessDataset {
    return this.datasets[this.activeDataset];
  }
  private get sales() { return this.data.sales; }
  private get expenses() { return this.data.expenses; }
  private get ingredients() { return this.data.ingredients; }
  private get suppliers() { return this.data.suppliers; }
  private get notifications() { return this.data.notifications; }
  private get customers() { return this.data.customers; }
  private get promotions() { return this.data.promotions; }

  public getCollection(name: CollectionName): { id: string }[] {
    const collections: Record<CollectionName, { id: string }[]> = {
      customers: this.customers,
      products: this.products,
      promotions: this.promotions,
      suppliers: this.suppliers,
      services: this.services,
      dishes: this.dishes,
      ingredients: this.ingredients,
      expenses: this.expenses,
      sales: this.sales,
      appointments: this.appointments,
    };
    return collections[name];
  }

  public listServices(): BarberService[] {
    return this.services;
  }

  public async getServicesPage(params: PaginationParams = {}): Promise<PaginatedResult<BarberService>> {
    await this.delay(200);
    if (this.simulateError) throw new Error('No se pudo cargar el catálogo de servicios.');
    const term = params.search?.toLowerCase() ?? '';
    const list = this.simulateEmpty
      ? []
      : this.services.filter(
          (item) =>
            (!params.filter || params.filter === 'all' || item.category === params.filter) &&
            (!params.extras?.status || (params.extras.status === 'active' ? item.isActive : !item.isActive)) &&
            (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term))
        );
    return this.paginate(list, params);
  }

  public setActiveBusiness(type: BusinessType) {
    this.activeDataset = type === 'restaurant' || type === 'store' ? type : 'barbershop';
  }

  public resetData() {
    this.datasets = {
      restaurant: {
        sales: generateSalesHistory(),
        expenses: generateExpensesHistory(),
        ingredients: clone(INGREDIENTS_MOCK),
        suppliers: clone(SUPPLIERS_MOCK),
        notifications: clone(NOTIFICATIONS_MOCK),
        customers: clone(RESTAURANT_CUSTOMERS),
        promotions: clone([...PROMOTIONS_SEED.restaurant, ...EXTRA_PROMOTIONS.restaurant]),
      },
      store: {
        sales: STORE_SALES(),
        expenses: STORE_EXPENSES(),
        ingredients: clone([...STORE_STOCK, ...EXTRA_STORE_STOCK]),
        suppliers: clone([...STORE_SUPPLIERS, ...EXTRA_STORE_SUPPLIERS]),
        notifications: clone([...STORE_ALERTS, ...EXTRA_STORE_ALERTS]),
        customers: clone(STORE_CUSTOMERS),
        promotions: clone([...PROMOTIONS_SEED.store, ...EXTRA_PROMOTIONS.store]),
      },
      barbershop: {
        sales: BARBER_SALES(),
        expenses: BARBER_EXPENSES(),
        ingredients: clone([...BARBER_STOCK, ...EXTRA_BARBER_STOCK]),
        suppliers: clone([...BARBER_SUPPLIERS, ...EXTRA_BARBER_SUPPLIERS]),
        notifications: clone([...BARBER_ALERTS, ...EXTRA_BARBER_ALERTS]),
        customers: clone(BARBER_CUSTOMERS),
        promotions: clone([...PROMOTIONS_SEED.barbershop, ...EXTRA_PROMOTIONS.barbershop]),
      },
    };
    this.products = clone([...STORE_PRODUCTS, ...EXTRA_STORE_PRODUCTS]);
    this.services = clone(SERVICES_SEED);
    this.dishes = clone(DISHES_MOCK);
    this.tables = clone(TABLES_MOCK);
    this.kitchenTickets = clone(KITCHEN_TICKETS_MOCK);
    this.deliveryOrders = clone(DELIVERY_ORDERS_MOCK);
    this.appointments = clone(APPOINTMENTS_MOCK);
  }

  private paginate<T>(list: T[], params: PaginationParams): PaginatedResult<T> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = list.length;
    const start = (page - 1) * pageSize;
    return { items: list.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  public async getDishesPage(params: PaginationParams = {}): Promise<PaginatedResult<Dish>> {
    await this.delay(200);
    if (this.simulateError) throw new Error('Error al sincronizar la carta del restaurante.');
    const term = params.search?.toLowerCase() ?? '';
    const list = this.simulateEmpty
      ? []
      : this.dishes.filter(
          (dish) =>
            (!params.filter || params.filter === 'all' || dish.category === params.filter) &&
            (!params.extras?.availability || (params.extras.availability === 'yes' ? dish.isAvailable : !dish.isAvailable)) &&
            (!params.extras?.margin || (params.extras.margin === 'low' ? dish.grossMargin < 0.3 : params.extras.margin === 'mid' ? dish.grossMargin >= 0.3 && dish.grossMargin < 0.5 : dish.grossMargin >= 0.5)) &&
            (!term || dish.name.toLowerCase().includes(term))
        );
    return this.paginate(list, params);
  }

  public async getCustomers(params: PaginationParams = {}): Promise<PaginatedResult<Customer>> {
    await this.delay(200);
    if (this.simulateError) throw new Error('No se pudo cargar la lista de clientes.');
    const term = params.search?.toLowerCase() ?? '';
    let list = this.simulateEmpty
      ? []
      : this.customers.filter(
          (customer) =>
            !term || [customer.name, customer.documentId, customer.phone, customer.email].some((field) => field.toLowerCase().includes(term))
        );
    if (params.filter === 'owing') list = list.filter((customer) => customer.balanceDue > 0);
    if (params.extras?.frequency === 'frequent') list = list.filter((customer) => customer.visits >= 15);
    if (params.extras?.frequency === 'occasional') list = list.filter((customer) => customer.visits < 15);
    return this.paginate(list, params);
  }

  public async settleCustomerBalance(id: string): Promise<void> {
    await this.delay(100);
    const customer = this.customers.find((item) => item.id === id);
    if (customer) customer.balanceDue = 0;
  }

  public async getProducts(params: PaginationParams = {}): Promise<PaginatedResult<Product>> {
    await this.delay(200);
    if (this.simulateError) throw new Error('No se pudo cargar el catálogo de productos.');
    const term = params.search?.toLowerCase() ?? '';
    const list = this.simulateEmpty
      ? []
      : this.products.filter(
          (product) =>
            (!params.filter || params.filter === 'all' || product.category === params.filter) &&
            (!params.extras?.stock || (params.extras.stock === 'out' ? product.stock === 0 : params.extras.stock === 'low' ? product.stock > 0 && product.stock < 10 : product.stock >= 10)) &&
            (!term || product.name.toLowerCase().includes(term))
        );
    return this.paginate(list, params);
  }

  public getFacets() {
    const unique = (values: string[]) => [...new Set(values)].sort();
    return {
      ingredientCategories: unique(this.ingredients.map(({ category }) => category)),
      ingredientLocations: unique(this.ingredients.map(({ location }) => location)),
      ingredientSuppliers: unique(this.ingredients.map(({ supplierName }) => supplierName)),
      supplierCities: unique(this.suppliers.map(({ city }) => city)),
    };
  }

  public getProductCategories(): string[] {
    return [...new Set(this.products.map(({ category }) => category))];
  }

  public async toggleProduct(id: string): Promise<void> {
    await this.delay(100);
    const product = this.products.find((item) => item.id === id);
    if (product) product.isAvailable = !product.isAvailable;
  }

  public async getPromotions(params: PaginationParams = {}): Promise<PaginatedResult<Promotion>> {
    await this.delay(150);
    if (this.simulateError) throw new Error('No se pudieron cargar las promociones.');
    const term = params.search?.toLowerCase() ?? '';
    const list = this.simulateEmpty
      ? []
      : this.promotions.filter(
          (promotion) =>
            (!params.filter || params.filter === 'all' || promotion.status === params.filter) &&
            (!term || promotion.title.toLowerCase().includes(term) || promotion.item.toLowerCase().includes(term))
        );
    return this.paginate(list, params);
  }

  public async addPromotion(promotion: Omit<Promotion, 'id' | 'status'>): Promise<Promotion> {
    await this.delay(100);
    const created: Promotion = { ...promotion, id: `promo-${Date.now()}`, status: 'draft' };
    this.promotions.unshift(created);
    return created;
  }

  public async setPromotionStatus(id: string, status: Promotion['status']): Promise<void> {
    await this.delay(100);
    const promotion = this.promotions.find((item) => item.id === id);
    if (promotion) promotion.status = status;
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
      list = list.filter((s) => s.channel === params.filter);
    }
    const sx = params.extras ?? {};
    if (sx.payment) list = list.filter((s) => s.paymentMethod === sx.payment);
    if (sx.from) list = list.filter((s) => s.date >= sx.from);
    if (sx.to) list = list.filter((s) => s.date <= sx.to);
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
    const ex = params.extras ?? {};
    if (ex.payment) list = list.filter((e) => e.paymentMethod === ex.payment);
    if (ex.receipt) list = list.filter((e) => (ex.receipt === 'yes' ? e.receiptAttached : !e.receiptAttached));
    if (ex.from) list = list.filter((e) => e.date >= ex.from);
    if (ex.to) list = list.filter((e) => e.date <= ex.to);
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
    const ix = params.extras ?? {};
    if (ix.category) list = list.filter((i) => i.category === ix.category);
    if (ix.location) list = list.filter((i) => i.location === ix.location);
    if (ix.supplier) list = list.filter((i) => i.supplierName === ix.supplier);
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
    const ux = params.extras ?? {};
    if (ux.trend) list = list.filter((item) => item.priceTrend === ux.trend);
    if (ux.city) list = list.filter((item) => item.city === ux.city);

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
