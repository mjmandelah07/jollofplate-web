export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type OrderExtra = {
  name: string;
  price: number;
};

export type OrderItem = {
  id: string;
  mealId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  extras?: OrderExtra[] | null;
  image?: string | null;
};

export type OrderCustomer = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
};

export type DeliveryAddressInput = {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
  landmark?: string;
  phone?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  notes?: string | null;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  deliveryLine1?: string | null;
  deliveryLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryLandmark?: string | null;
  deliveryPhone?: string | null;
  shippingRateId?: string | null;
  shippingCarrierName?: string | null;
  shippingAmount?: number | null;
  shipmentId?: string | null;
  shipmentBookedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  customer?: OrderCustomer | null;
  customerId?: string;
  items: OrderItem[];
};

export type AdminStats = {
  totalMeals: number;
  totalCategories: number;
  availableMeals: number;
  unavailableMeals: number;
  featuredMeals: number;
  pendingOrders: number;
  paidOrders: number;
};

export type BusinessHourDay = {
  day: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

export type StructuredBusinessHours = {
  timezone?: string;
  week: BusinessHourDay[];
};

/** Legacy map shape from some API responses: `{ mon: "10:00-21:00" }`. */
export type LegacyBusinessHours = Partial<
  Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>
>;
