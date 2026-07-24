"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAdminCategories,
  type AdminCategoriesQuery,
} from "@/lib/api/admin/categories";
import {
  getAdminMeals,
  type AdminMealsQuery,
} from "@/lib/api/admin/meals";
import { adminKeys } from "@/lib/admin-query-keys";
import { ApiError } from "@/lib/api/client";
import { getAdminToken } from "@/lib/auth/storage";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

function sortCategories<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function useAdminCategoriesQuery(params: AdminCategoriesQuery = {}) {
  const { handleAuthError } = useAdminAuth();
  const token = getAdminToken();
  const queryParams: AdminCategoriesQuery = {
    page: params.page ?? 1,
    limit: params.limit ?? ADMIN_PAGE_SIZE,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  return useQuery({
    queryKey: adminKeys.categories(queryParams),
    enabled: Boolean(token),
    staleTime: 30_000,
    retry: false,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const authToken = getAdminToken();
      if (!authToken) throw new Error("Unauthorized");
      try {
        const result = await getAdminCategories(authToken, queryParams);
        return {
          ...result,
          items: sortCategories(result.items),
        };
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Could not load categories",
          );
        }
        throw error;
      }
    },
  });
}

export function useAdminMealsQuery(params: AdminMealsQuery = {}) {
  const { handleAuthError } = useAdminAuth();
  const token = getAdminToken();
  const queryParams: AdminMealsQuery = {
    page: params.page ?? 1,
    limit: params.limit ?? ADMIN_PAGE_SIZE,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(typeof params.available === "boolean"
      ? { available: params.available }
      : {}),
    ...(typeof params.featured === "boolean"
      ? { featured: params.featured }
      : {}),
    ...(typeof params.bestSeller === "boolean"
      ? { bestSeller: params.bestSeller }
      : {}),
  };

  return useQuery({
    queryKey: adminKeys.meals(queryParams),
    enabled: Boolean(token),
    staleTime: 30_000,
    retry: false,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const authToken = getAdminToken();
      if (!authToken) throw new Error("Unauthorized");
      try {
        return await getAdminMeals(authToken, queryParams);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Could not load meals",
          );
        }
        throw error;
      }
    },
  });
}
