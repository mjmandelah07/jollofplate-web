import type { AdminCategoriesQuery } from "@/lib/api/admin/categories";
import type { AdminMealsQuery } from "@/lib/api/admin/meals";

export const adminKeys = {
  all: ["admin"] as const,
  meals: (params?: AdminMealsQuery) =>
    params
      ? ([...adminKeys.all, "meals", params] as const)
      : ([...adminKeys.all, "meals"] as const),
  categories: (params?: AdminCategoriesQuery) =>
    params
      ? ([...adminKeys.all, "categories", params] as const)
      : ([...adminKeys.all, "categories"] as const),
  orders: () => [...adminKeys.all, "orders"] as const,
  order: (id: string) => [...adminKeys.all, "orders", id] as const,
  settings: () => [...adminKeys.all, "settings"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
};
