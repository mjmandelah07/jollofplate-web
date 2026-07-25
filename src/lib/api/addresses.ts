import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { SavedAddress, SavedAddressInput } from "@/types/account";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

export type AddressesQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

function toQuery(params?: AddressesQuery) {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (typeof params.page === "number") search.set("page", String(params.page));
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getAddresses(
  token: string,
  params?: AddressesQuery,
): Promise<PaginatedResult<SavedAddress>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(`/addresses${toQuery({ ...params, page, limit })}`, {
    token,
  }).then((result) =>
    normalizePaginated<SavedAddress>(result, { page, limit }),
  );
}

export function getAddress(token: string, id: string) {
  return apiFetch<SavedAddress>(`/addresses/${id}`, { token });
}

export function createAddress(token: string, body: SavedAddressInput) {
  return apiFetch<SavedAddress>("/addresses", {
    method: "POST",
    token,
    body,
  });
}

export function updateAddress(
  token: string,
  id: string,
  body: Partial<SavedAddressInput>,
) {
  return apiFetch<SavedAddress>(`/addresses/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function setDefaultAddress(token: string, id: string) {
  return apiFetch<SavedAddress>(`/addresses/${id}/default`, {
    method: "PATCH",
    token,
  });
}

export function deleteAddress(token: string, id: string) {
  return apiFetch<{ message: string }>(`/addresses/${id}`, {
    method: "DELETE",
    token,
  });
}
