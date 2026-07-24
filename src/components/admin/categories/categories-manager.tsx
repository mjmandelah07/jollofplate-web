"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
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
import { useAdminCategoriesQuery } from "@/hooks/use-admin-catalog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  deleteCategory,
  reorderCategories,
} from "@/lib/api/admin/categories";
import { adminKeys } from "@/lib/admin-query-keys";
import { ApiError } from "@/lib/api/client";
import { getAdminToken } from "@/lib/auth/storage";
import {
  getCategoryMealCount,
  type Category,
} from "@/types/catalog";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type { PaginatedResult } from "@/types/pagination";

export function CategoriesManager() {
  const queryClient = useQueryClient();
  const { requireToken, handleAuthError } = useAdminAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<"all" | "ACTIVE" | "INACTIVE">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const queryParams = {
    search: debouncedSearch,
    page,
    limit: ADMIN_PAGE_SIZE,
    ...(status === "all" ? {} : { status }),
  };

  const listKeyParams = {
    page: queryParams.page,
    limit: queryParams.limit,
    ...(queryParams.search.trim()
      ? { search: queryParams.search.trim() }
      : {}),
    ...(status === "all" ? {} : { status }),
  };

  const categoriesQuery = useAdminCategoriesQuery(queryParams);
  const categories = categoriesQuery.data?.items ?? [];
  const meta = categoriesQuery.data?.meta;
  const loading = categoriesQuery.isLoading;
  const refreshing = categoriesQuery.isFetching && !categoriesQuery.isLoading;
  const isFiltered = debouncedSearch.trim().length > 0 || status !== "all";
  const reorderDisabled = isFiltered || (meta ? meta.totalPages > 1 : false);

  async function handleReorder(next: Category[]) {
    if (reorderDisabled || !meta) return;

    const previous = categoriesQuery.data;
    const offset = (meta.page - 1) * meta.limit;
    const withOrder = next.map((category, index) => ({
      ...category,
      // API uses 0-based sortOrder
      sortOrder: offset + index,
    }));

    queryClient.setQueryData<PaginatedResult<Category>>(
      adminKeys.categories(listKeyParams),
      (prev) =>
        prev
          ? { ...prev, items: withOrder }
          : { items: withOrder, meta },
    );

    const token = requireToken();
    if (!token) return;

    try {
      await reorderCategories(
        token,
        withOrder.map((category) => ({
          id: category.id,
          sortOrder: category.sortOrder,
        })),
      );
      await queryClient.invalidateQueries({
        queryKey: adminKeys.categories(),
      });
      toast.success("Category order updated");
    } catch (error) {
      queryClient.setQueryData(adminKeys.categories(listKeyParams), previous);
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not reorder categories",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const token = requireToken();
    if (!token) return;

    setDeleteLoading(true);
    try {
      const result = await deleteCategory(token, deleting.id);
      toast.success(result.message || "Category deleted");
      await queryClient.invalidateQueries({
        queryKey: adminKeys.categories(),
      });
      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
      setDeleting(null);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not delete category",
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
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, reorder, and manage menu categories. Drag rows to change
            sort order.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus((value as "all" | "ACTIVE" | "INACTIVE") ?? "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {reorderDisabled ? (
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {isFiltered
              ? "Clear search and status filters to drag and reorder."
              : "Reorder is available when all categories fit on one page."}
          </p>
        ) : null}
      </div>

      <div className={refreshing ? "opacity-70 transition-opacity" : undefined}>
        <CategoriesTable
          categories={categories}
          loading={loading}
          reorderDisabled={reorderDisabled}
          emptyMessage={
            isFiltered
              ? "No categories match your filters."
              : undefined
          }
          onReorder={handleReorder}
          onEdit={(category) => {
            setEditing(category);
            setFormOpen(true);
          }}
          onDelete={setDeleting}
        />
      </div>

      {meta ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}

      {token ? (
        <CategoryFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          category={editing}
          token={token}
          onAuthError={handleAuthError}
          onSaved={async () => {
            await queryClient.invalidateQueries({
              queryKey: adminKeys.categories(),
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
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `This will permanently remove “${deleting.name}”. ${
                    getCategoryMealCount(deleting) > 0
                      ? "If meals still belong to it, the API will block the delete."
                      : "This cannot be undone."
                  }`
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
