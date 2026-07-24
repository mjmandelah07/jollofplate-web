import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { Order, OrderStatus } from "@/types/admin";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

export type AdminOrdersQuery = {
  search?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
};

function toQuery(params?: AdminOrdersQuery) {
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

function matchesOrder(order: Order, params?: AdminOrdersQuery) {
  if (params?.status && order.status !== params.status) return false;
  const q = params?.search?.trim().toLowerCase();
  if (!q) return true;

  const customer = order.customer;
  const haystack = [
    order.orderNumber,
    order.notes,
    customer?.email,
    customer?.firstName,
    customer?.lastName,
    customer?.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function getAdminOrders(
  token: string,
  params?: AdminOrdersQuery,
): Promise<PaginatedResult<Order>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(
    `/admin/orders${toQuery({ ...params, page, limit })}`,
    { token },
  ).then((result) =>
    normalizePaginated<Order>(result, {
      page,
      limit,
      filter: (order) => matchesOrder(order, params),
    }),
  );
}

export function getAdminOrder(token: string, id: string) {
  return apiFetch<Order>(`/admin/orders/${id}`, { token });
}

export function updateOrderStatus(
  token: string,
  id: string,
  status: "PAID" | "CANCELLED",
) {
  return apiFetch<Order>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export function removeOrderItem(token: string, orderId: string, itemId: string) {
  return apiFetch<Order | { message: string; order?: Order }>(
    `/admin/orders/${orderId}/items/${itemId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
