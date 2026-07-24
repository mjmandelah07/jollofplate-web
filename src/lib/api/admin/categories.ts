import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { Category, CategoryInput } from "@/types/catalog";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

export type AdminCategoriesQuery = {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
};

function toQuery(params?: AdminCategoriesQuery) {
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

function matchesCategory(category: Category, params?: AdminCategoriesQuery) {
  if (params?.status && category.status !== params.status) return false;
  const q = params?.search?.trim().toLowerCase();
  if (!q) return true;
  return (
    category.name.toLowerCase().includes(q) ||
    category.slug.toLowerCase().includes(q) ||
    category.description?.toLowerCase().includes(q) === true
  );
}

export function getAdminCategories(
  token: string,
  params?: AdminCategoriesQuery,
): Promise<PaginatedResult<Category>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(
    `/admin/categories${toQuery({ ...params, page, limit })}`,
    { token },
  ).then((result) =>
    normalizePaginated<Category>(result, {
      page,
      limit,
      filter: (category) => matchesCategory(category, params),
    }),
  );
}

export function createCategory(token: string, body: CategoryInput) {
  return apiFetch<Category>("/admin/categories", {
    method: "POST",
    token,
    body,
  });
}

export function updateCategory(
  token: string,
  id: string,
  body: Partial<CategoryInput>,
) {
  return apiFetch<Category>(`/admin/categories/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function deleteCategory(token: string, id: string) {
  return apiFetch<{ message: string }>(`/admin/categories/${id}`, {
    method: "DELETE",
    token,
  });
}

export function reorderCategories(
  token: string,
  items: { id: string; sortOrder: number }[],
) {
  return apiFetch<Category[]>("/admin/categories/reorder", {
    method: "PATCH",
    token,
    body: { items },
  });
}
