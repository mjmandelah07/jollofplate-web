import type { DeliveryAddressInput, OrderCustomer } from "@/types/admin";

export type SourcingItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  unitHint?: string | null;
  available: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SourcingItemInput = {
  name: string;
  description?: string;
  image?: string;
  unitHint?: string;
  available?: boolean;
};

export type SourcingRequestStatus = "PENDING" | "CANCELLED" | "COMPLETED";

export type SourcingRequestItem = {
  id?: string;
  sourcingItemId?: string | null;
  name: string;
  quantity?: number | null;
  notes?: string | null;
};

export type CreateSourcingRequestItemInput = {
  sourcingItemId?: string;
  name?: string;
  quantity?: number;
  notes?: string;
};

export type CreateSourcingRequestInput = {
  items: CreateSourcingRequestItemInput[];
  deliveryAddress: DeliveryAddressInput;
  notes?: string;
};

export type SourcingRequestCheckout = {
  whatsappNumber: string;
  suggestedMessage?: string;
};

export type SourcingRequest = {
  id: string;
  requestNumber: string;
  status: SourcingRequestStatus;
  notes?: string | null;
  items: SourcingRequestItem[];
  deliveryLine1?: string | null;
  deliveryLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryLandmark?: string | null;
  deliveryPhone?: string | null;
  customer?: OrderCustomer | null;
  customerId?: string;
  checkout?: SourcingRequestCheckout;
  createdAt: string;
  updatedAt?: string;
};

export type SourcingRequestsQuery = {
  search?: string;
  status?: SourcingRequestStatus;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
};
