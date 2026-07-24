"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { MealFormDialog } from "@/components/admin/meals/meal-form-dialog";
import { MealsTable } from "@/components/admin/meals/meals-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  useAdminCategoriesQuery,
  useAdminMealsQuery,
} from "@/hooks/use-admin-catalog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { deleteMeal } from "@/lib/api/admin/meals";
import { adminKeys } from "@/lib/admin-query-keys";
import { ApiError } from "@/lib/api/client";
import { getAdminToken } from "@/lib/auth/storage";
import type { Meal } from "@/types/catalog";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";

type FlagFilter = "all" | "yes" | "no";

function flagToBoolean(value: FlagFilter) {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined;
}

export function MealsManager() {
  const queryClient = useQueryClient();
  const { requireToken, handleAuthError } = useAdminAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState<Meal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState("all");
  const [available, setAvailable] = useState<FlagFilter>("all");
  const [featured, setFeatured] = useState<FlagFilter>("all");
  const [bestSeller, setBestSeller] = useState<FlagFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, available, featured, bestSeller]);

  const mealsQuery = useAdminMealsQuery({
    search: debouncedSearch,
    category: categoryId === "all" ? undefined : categoryId,
    available: flagToBoolean(available),
    featured: flagToBoolean(featured),
    bestSeller: flagToBoolean(bestSeller),
    page,
    limit: ADMIN_PAGE_SIZE,
  });

  const categoriesQuery = useAdminCategoriesQuery({
    page: 1,
    limit: 100,
  });

  const meals = mealsQuery.data?.items ?? [];
  const meta = mealsQuery.data?.meta;
  const categories = categoriesQuery.data?.items ?? [];
  const loading = mealsQuery.isLoading || categoriesQuery.isLoading;
  const refreshing = mealsQuery.isFetching && !mealsQuery.isLoading;

  async function confirmDelete() {
    if (!deleting) return;
    const token = requireToken();
    if (!token) return;

    setDeleteLoading(true);
    try {
      const result = await deleteMeal(token, deleting.id);
      toast.success(result.message || "Meal deleted");
      await queryClient.invalidateQueries({ queryKey: adminKeys.meals() });
      if (meals.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
      setDeleting(null);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete meal",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  const token = getAdminToken();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Meals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and update meals, pricing, images, extras, and availability.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          disabled={categories.length === 0}
        >
          <Plus className="size-4" />
          Add meal
        </Button>
      </div>

      {categories.length === 0 && !categoriesQuery.isLoading ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Create a category first before adding meals.
        </p>
      ) : null}

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input
          placeholder="Search meals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 xl:col-span-1"
        />
        <Select
          value={categoryId}
          onValueChange={(value) => setCategoryId(value ?? "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={available}
          onValueChange={(value) =>
            setAvailable((value as FlagFilter) ?? "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All availability</SelectItem>
            <SelectItem value="yes">Available</SelectItem>
            <SelectItem value="no">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={featured}
          onValueChange={(value) =>
            setFeatured((value as FlagFilter) ?? "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Featured: all</SelectItem>
            <SelectItem value="yes">Featured</SelectItem>
            <SelectItem value="no">Not featured</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={bestSeller}
          onValueChange={(value) =>
            setBestSeller((value as FlagFilter) ?? "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Best seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Best seller: all</SelectItem>
            <SelectItem value="yes">Best sellers</SelectItem>
            <SelectItem value="no">Not best sellers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={refreshing ? "opacity-70 transition-opacity" : undefined}>
        <MealsTable
          meals={meals}
          loading={loading}
          onEdit={(meal) => {
            setEditing(meal);
            setFormOpen(true);
          }}
          onDelete={setDeleting}
        />
      </div>

      {meta ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}

      {token ? (
        <MealFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          meal={editing}
          categories={categories}
          token={token}
          onAuthError={handleAuthError}
          onSaved={async () => {
            await queryClient.invalidateQueries({
              queryKey: adminKeys.meals(),
            });
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete meal?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `This will permanently remove “${deleting.name}”. This cannot be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => void confirmDelete()}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
