import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { DeliveryAddressInput } from "@/types/admin";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type {
  CreateSourcingRequestInput,
  SourcingItem,
  SourcingRequest,
  SourcingRequestsQuery,
} from "@/types/sourcing";

export type SourcingItemsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
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

export function getSourcingItems(
  params?: SourcingItemsQuery,
): Promise<PaginatedResult<SourcingItem>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const { signal, search } = params ?? {};

  return apiFetch<unknown>(
    `/sourcing-items${toQuery({ search, page, limit })}`,
    { signal },
  ).then((result) =>
    normalizePaginated<SourcingItem>(result, { page, limit }),
  );
}

export function createSourcingRequest(
  token: string,
  body: CreateSourcingRequestInput,
) {
  return apiFetch<SourcingRequest>("/sourcing-requests", {
    method: "POST",
    token,
    body,
  });
}

export function getMySourcingRequests(
  token: string,
  params?: SourcingRequestsQuery,
): Promise<PaginatedResult<SourcingRequest>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;
  const { signal, search, status } = params ?? {};

  return apiFetch<unknown>(
    `/sourcing-requests${toQuery({ search, status, page, limit })}`,
    { token, signal },
  ).then((result) =>
    normalizePaginated<SourcingRequest>(result, { page, limit }),
  );
}

export function getMySourcingRequest(token: string, id: string) {
  return apiFetch<SourcingRequest>(`/sourcing-requests/${id}`, { token });
}

export function cancelMySourcingRequest(token: string, id: string) {
  return apiFetch<SourcingRequest>(`/sourcing-requests/${id}/cancel`, {
    method: "PATCH",
    token,
  });
}

export type { DeliveryAddressInput };
