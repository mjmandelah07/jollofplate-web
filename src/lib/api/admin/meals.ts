import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { Meal, MealInput } from "@/types/catalog";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

export type AdminMealsQuery = {
  category?: string;
  search?: string;
  available?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  page?: number;
  limit?: number;
};

function toQuery(params?: AdminMealsQuery) {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.search) search.set("search", params.search);
  if (typeof params.available === "boolean") {
    search.set("available", String(params.available));
  }
  if (typeof params.featured === "boolean") {
    search.set("featured", String(params.featured));
  }
  if (typeof params.bestSeller === "boolean") {
    search.set("bestSeller", String(params.bestSeller));
  }
  if (typeof params.page === "number") search.set("page", String(params.page));
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function matchesMeal(meal: Meal, params?: AdminMealsQuery) {
  if (!params) return true;
  if (params.category && meal.categoryId !== params.category) return false;
  if (typeof params.available === "boolean" && meal.available !== params.available) {
    return false;
  }
  if (typeof params.featured === "boolean" && meal.featured !== params.featured) {
    return false;
  }
  if (
    typeof params.bestSeller === "boolean" &&
    meal.bestSeller !== params.bestSeller
  ) {
    return false;
  }
  const q = params.search?.trim().toLowerCase();
  if (!q) return true;
  return (
    meal.name.toLowerCase().includes(q) ||
    meal.description?.toLowerCase().includes(q) ||
    meal.category?.name?.toLowerCase().includes(q) === true
  );
}

export function getAdminMeals(
  token: string,
  params?: AdminMealsQuery,
): Promise<PaginatedResult<Meal>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(`/admin/meals${toQuery({ ...params, page, limit })}`, {
    token,
  }).then((result) =>
    normalizePaginated<Meal>(result, {
      page,
      limit,
      filter: (meal) => matchesMeal(meal, params),
    }),
  );
}

export function getAdminMeal(token: string, id: string) {
  return apiFetch<Meal>(`/admin/meals/${id}`, { token });
}

export function createMeal(token: string, body: MealInput) {
  return apiFetch<Meal>("/admin/meals", {
    method: "POST",
    token,
    body,
  });
}

export function updateMeal(
  token: string,
  id: string,
  body: Partial<MealInput>,
) {
  return apiFetch<Meal>(`/admin/meals/${id}`, {
    method: "PATCH",
    token,
    body,
  });
}

export function deleteMeal(token: string, id: string) {
  return apiFetch<{ message: string }>(`/admin/meals/${id}`, {
    method: "DELETE",
    token,
  });
}
