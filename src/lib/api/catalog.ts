import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { Category, Meal } from "@/types/catalog";

export type PublicCategoriesQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type PublicMealsQuery = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Active categories. Defaults to first page of up to 100 for homepage/nav use. */
export function getCategories(params: PublicCategoriesQuery = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  return apiFetch<unknown>(
    `/categories${toQuery({
      search: params.search,
      page,
      limit,
    })}`,
  ).then((result) => normalizePaginated<Category>(result, { page, limit }).items);
}

export function getMeals(params: PublicMealsQuery = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return apiFetch<unknown>(
    `/meals${toQuery({
      category: params.category,
      search: params.search,
      page,
      limit,
    })}`,
  ).then((result) => normalizePaginated<Meal>(result, { page, limit }));
}

/** Single available meal by slug. Throws ApiError 404 when missing. */
export function getMealBySlug(slug: string) {
  return apiFetch<Meal>(`/meals/${encodeURIComponent(slug)}`);
}

/** Up to 4 "You may also like" meals — same category first, then featured/best-sellers. */
export function getRelatedMeals(slug: string) {
  return apiFetch<Meal[]>(`/meals/${encodeURIComponent(slug)}/related`);
}

export function getFeaturedMeals() {
  return apiFetch<Meal[]>("/meals/featured");
}

export function getBestSellerMeals() {
  return apiFetch<Meal[]>("/meals/best-sellers");
}
