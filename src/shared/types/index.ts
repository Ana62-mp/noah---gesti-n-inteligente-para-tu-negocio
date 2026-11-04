export type BusinessType = 'restaurant' | 'store' | 'barbershop' | 'services';

export type UserRole = 'owner' | 'cashier' | 'waiter' | 'kitchen' | 'inventory';

export type ModuleCategory = 'finances' | 'restaurant' | 'inventory' | 'services' | 'ai' | 'future';

export type ModuleId =
  | 'dashboard'
  | 'sales'
  | 'expenses'
  | 'cashflow'
  | 'menu'
  | 'costing'
  | 'inventory'
  | 'suppliers'
  | 'tables'
  | 'kitchen'
  | 'delivery'
  | 'reports'
  | 'services_catalog'
  | 'appointments'
  | 'assistant'
  | 'alerts'
  | 'settings'
  | 'mobile_preview'
  | 'voice_scenarios';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: string;
  type: 'base' | 'recommended' | 'addon' | 'future';
  enabled: boolean;
  requiredRole?: UserRole[];
}

export interface BusinessConfig {
  id: string;
  name: string;
  type: BusinessType;
  ownerName: string;
  ruc: string;
  country: string;
  city: string;
  currency: string; // 'USD'
  currencySymbol: string; // '$'
  vatRate: number; // 0.15 (15% IVA Ecuador)
  employeeCount: number;
}

export interface MetricData {
  title: string;
  value: number;
  formattedValue: string;
  changePercent?: number;
  changePeriod?: string;
  trend?: 'up' | 'down' | 'neutral';
  provenance: {
    period: string;
    source: string;
    updatedAt: string;
    details?: string;
  };
}

export interface SaleItem {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Sale {
  id: string;
  date: string;
  time: string;
  channel: 'salon' | 'takeout' | 'delivery';
  tableNumber?: number;
  waiterName?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'deuna';
  status: 'completed' | 'cancelled' | 'pending';
}

export interface Expense {
  id: string;
  date: string;
  concept: string;
  category: 'insumos' | 'servicios' | 'sueldos' | 'arriendo' | 'otros';
  supplier?: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'card';
  receiptAttached?: boolean;
  receiptNumber?: string;
  notes?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'g' | 'litro' | 'unidad' | 'atado' | 'libra';
  currentStock: number;
  minThreshold: number;
  optimalStock: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  location: string;
  entryDate: string;
  expiryDate: string;
  daysToExpiry: number;
  status: 'normal' | 'low' | 'overstock' | 'expiring';
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface Dish {
  id: string;
  name: string;
  category: 'sopas' | 'platos_fuertes' | 'mariscos' | 'desayunos' | 'bebidas' | 'postres';
  sellingPrice: number;
  theoreticalCost: number;
  grossMargin: number; // percentage, e.g. 0.45 = 45%
  isAvailable: boolean;
  preparationTimeMinutes: number;
  ingredients: RecipeItem[];
  description: string;
  salesCountThisMonth: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  suppliedItems: string[];
  lastPurchaseDate: string;
  priceTrend: 'stable' | 'increased' | 'decreased';
  priceChangePercent?: number;
  totalPurchasedThisYear: number;
}

export interface TableItem {
  id: number;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'ordering' | 'billing';
  currentOrderId?: string;
  seatedAt?: string;
  waiterName?: string;
  total?: number;
}

export interface KitchenTicket {
  id: string;
  orderNumber: string;
  tableNumber?: number;
  channel: 'salon' | 'takeout' | 'delivery';
  waiterName: string;
  createdAt: string;
  elapsedMinutes: number;
  status: 'pending' | 'preparing' | 'ready';
  items: {
    dishName: string;
    quantity: number;
    notes?: string;
    done?: boolean;
  }[];
  urgency: 'normal' | 'delayed';
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  channel: 'propio' | 'delivery_a' | 'delivery_b' | 'delivery_c';
  channelLabel: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'received' | 'in_kitchen' | 'on_the_way' | 'delivered';
  items: { dishName: string; quantity: number; price: number }[];
  total: number;
  driverName?: string;
  estimatedMinutes: number;
  createdAt: string;
  isSimulatedIntegration: boolean;
}

export interface BarberService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  price: number;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface NotificationAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  ruleTriggered: string;
  date: string;
  suggestedAction?: {
    type: 'create_promo' | 'adjust_price' | 'order_stock' | 'review_cost';
    label: string;
    payload?: any;
  };
  dismissed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'noah';
  text: string;
  timestamp: string;
  audioDuration?: number;
  isLiveTranscript?: boolean;
  cards?: {
    type: 'kpi' | 'chart' | 'dish_cost' | 'draft_order' | 'draft_expense' | 'draft_promo' | 'appointment' | 'advice';
    title: string;
    data: any;
  }[];
  provenance?: {
    period: string;
    modules: string[];
    updatedAt: string;
    certainty: string;
    notes?: string;
  };
  actionDraft?: {
    id: string;
    type: 'expense' | 'order' | 'promo' | 'appointment';
    title: string;
    details: any;
    status: 'pending' | 'confirmed' | 'cancelled';
  };
}
