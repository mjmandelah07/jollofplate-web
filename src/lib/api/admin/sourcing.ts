import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type {
  SourcingItem,
  SourcingItemInput,
  SourcingRequest,
  SourcingRequestStatus,
  SourcingRequestsQuery,
} from "@/types/sourcing";

export type AdminSourcingItemsQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

function toQuery(
  params?: Record<string, string | number | undefined>,
) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getAdminSourcingItems(
  token: string,
  params?: AdminSourcingItemsQuery,
): Promise<PaginatedResult<SourcingItem>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(
    `/admin/sourcing-items${toQuery({
      search: params?.search,
      page,
      limit,
    })}`,
    { token },
  ).then((result) =>
    normalizePaginated<SourcingItem>(result, { page, limit }),
  );
}

export function getAdminSourcingItemsAll(token: string) {
  return apiFetch<SourcingItem[]>("/admin/sourcing-items/all", { token });
}

export function getAdminSourcingItem(token: string, id: string) {
  return apiFetch<SourcingItem>(`/admin/sourcing-items/${id}`, { token });
}

export function createAdminSourcingItem(
  token: string,
  body: SourcingItemInput,
) {
  return apiFetch<SourcingItem>("/admin/sourcing-items", {
    method: "POST",
    token,
    body,
  });
}

export function updateAdminSourcingItem(
  token: string,
  id: string,
  body: Partial<SourcingItemInput>,
) {
  return apiFetch<SourcingItem>(`/admin/sourcing-items/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function reorderAdminSourcingItems(token: string, ids: string[]) {
  return apiFetch<SourcingItem[]>("/admin/sourcing-items/reorder", {
    method: "PATCH",
    token,
    body: { ids },
  });
}

export function deleteAdminSourcingItem(token: string, id: string) {
  return apiFetch<{ message?: string }>(`/admin/sourcing-items/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getAdminSourcingRequests(
  token: string,
  params?: SourcingRequestsQuery,
): Promise<PaginatedResult<SourcingRequest>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;
  const { signal, search, status } = params ?? {};

  return apiFetch<unknown>(
    `/admin/sourcing-requests${toQuery({ search, status, page, limit })}`,
    { token, signal },
  ).then((result) =>
    normalizePaginated<SourcingRequest>(result, { page, limit }),
  );
}

export function getAdminSourcingRequest(token: string, id: string) {
  return apiFetch<SourcingRequest>(`/admin/sourcing-requests/${id}`, {
    token,
  });
}

export function updateAdminSourcingRequestStatus(
  token: string,
  id: string,
  status: SourcingRequestStatus,
) {
  return apiFetch<SourcingRequest>(`/admin/sourcing-requests/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
