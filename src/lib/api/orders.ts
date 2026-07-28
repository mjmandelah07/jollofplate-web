import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type {
  DeliveryAddressInput,
  Order,
  OrderStatus,
} from "@/types/admin";
import type { MealExtra } from "@/types/catalog";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

export type CreateOrderItemInput = {
  mealId: string;
  quantity: number;
  extras?: MealExtra[];
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
  deliveryAddress: DeliveryAddressInput;
  notes?: string;
};

export type { DeliveryAddressInput };

export type OrderCheckout = {
  whatsappNumber: string;
  suggestedMessage?: string;
};

export type CreatedOrder = Order & {
  checkout?: OrderCheckout;
};

export type CustomerOrdersQuery = {
  search?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
};

function toQuery(params?: CustomerOrdersQuery) {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.status) search.set("status", params.status);
  if (typeof params.page === "number") search.set("page", String(params.page));
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function createOrder(token: string, body: CreateOrderInput) {
  return apiFetch<CreatedOrder>("/orders", {
    method: "POST",
    token,
    body,
  });
}

export function getMyOrders(
  token: string,
  params?: CustomerOrdersQuery,
): Promise<PaginatedResult<Order>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;
  const { signal, ...query } = params ?? {};

  return apiFetch<unknown>(`/orders${toQuery({ ...query, page, limit })}`, {
    token,
    signal,
  }).then((result) =>
    normalizePaginated<Order>(result, {
      page,
      limit,
    }),
  );
}

export function getMyOrder(token: string, id: string) {
  return apiFetch<Order>(`/orders/${id}`, { token });
}

export function removeMyOrderItem(token: string, orderId: string, itemId: string) {
  return apiFetch<Order | { deleted: true; message?: string }>(
    `/orders/${orderId}/items/${itemId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
