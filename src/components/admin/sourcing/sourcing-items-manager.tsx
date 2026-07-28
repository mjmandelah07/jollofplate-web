"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createAdminSourcingItem,
  deleteAdminSourcingItem,
  getAdminSourcingItems,
  updateAdminSourcingItem,
} from "@/lib/api/admin/sourcing";
import { uploadAdminFile } from "@/lib/api/admin/uploads";
import { ApiError } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type { SourcingItem } from "@/types/sourcing";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  description: string;
  image: string;
  unitHint: string;
  available: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  image: "",
  unitHint: "",
  available: true,
};

export function AdminSourcingItemsManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [items, setItems] = useState<SourcingItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SourcingItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SourcingItem | null>(null);

  const isFiltered = debouncedSearch.trim().length > 0;

  const load = useCallback(async () => {
    const token = requireToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminSourcingItems(token, {
        search: debouncedSearch || undefined,
        page,
        limit: ADMIN_PAGE_SIZE,
      });
      setItems(data.items);
      setMeta(data.meta);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not load items",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, handleAuthError, page, requireToken]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: SourcingItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      image: item.image || "",
      unitHint: item.unitHint || "",
      available: item.available !== false,
    });
    setOpen(true);
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    const token = requireToken();
    if (!token) return;
    setUploading(true);
    try {
      const result = await uploadAdminFile(token, file);
      setForm((prev) => ({ ...prev, image: result.url }));
      toast.success("Image uploaded");
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = requireToken();
    if (!token) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      unitHint: form.unitHint.trim() || undefined,
      available: form.available,
    };

    try {
      if (editing) {
        await updateAdminSourcingItem(token, editing.id, body);
        toast.success("Item updated");
      } else {
        await createAdminSourcingItem(token, body);
        toast.success("Item created");
      }
      setOpen(false);
      await load();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not save item",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const token = requireToken();
    if (!token) return;
    setBusyId(deleting.id);
    try {
      await deleteAdminSourcingItem(token, deleting.id);
      toast.success("Item deleted");
      setDeleting(null);
      await load();
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete item",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Sourcing items
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Catalog for custom shopping — no prices. Customers pick these or add
            free-text items.
          </p>
        </div>
        <Button className="h-10 shrink-0 rounded-xl" onClick={openCreate}>
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 py-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl pl-9"
              aria-label="Search sourcing items"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-18 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="size-6" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
              {isFiltered ? "No matching items" : "No sourcing items yet"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {isFiltered
                ? "Try a different search, or clear the filter to see the full catalog."
                : "Add pantry staples customers can pick when building a custom shopping list. Prices stay on WhatsApp."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {isFiltered ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </Button>
              ) : null}
              <Button className="rounded-xl" onClick={openCreate}>
                <Plus className="size-4" />
                {isFiltered ? "Add item" : "Add your first item"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="hidden border-b border-border/70 bg-muted/40 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[1fr_7rem_7rem_6.5rem] sm:gap-3">
            <span>Item</span>
            <span>Unit</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-border/70">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 px-4 py-3.5 sm:grid-cols-[1fr_7rem_7rem_6.5rem] sm:items-center sm:gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        No description
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground sm:truncate">
                  <span className="sm:hidden">Unit · </span>
                  {item.unitHint || "—"}
                </p>

                <div>
                  <Badge
                    variant={item.available ? "default" : "outline"}
                    className={cn(
                      "rounded-lg font-medium",
                      item.available
                        ? "border-transparent bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.available ? "Available" : "Hidden"}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-lg"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-lg text-destructive hover:text-destructive"
                    aria-label={`Delete ${item.name}`}
                    disabled={busyId === item.id}
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit sourcing item" : "Add sourcing item"}
            </DialogTitle>
            <DialogDescription>
              Shown on the customer custom shopping page. Leave price out —
              quoting stays on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="si-name">Name</Label>
              <Input
                id="si-name"
                required
                value={form.name}
                className="h-10 rounded-xl"
                placeholder="e.g. Indomie carton"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-desc">Description</Label>
              <Textarea
                id="si-desc"
                value={form.description}
                className="min-h-20 rounded-xl"
                placeholder="Optional note for customers"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-unit">Unit hint</Label>
              <Input
                id="si-unit"
                placeholder="carton, bag, pack…"
                value={form.unitHint}
                className="h-10 rounded-xl"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unitHint: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-image">Image</Label>
              <Input
                id="si-image"
                type="file"
                accept="image/*"
                disabled={uploading}
                className="h-10 rounded-xl"
                onChange={(e) => void onUpload(e.target.files?.[0] || null)}
              />
              {uploading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Uploading…
                </p>
              ) : null}
              {form.image ? (
                <div className="relative mt-2 h-28 w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                  <Image
                    src={form.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5">
              <div>
                <Label htmlFor="si-available">Available</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden items stay out of the customer catalog.
                </p>
              </div>
              <Switch
                id="si-available"
                checked={form.available}
                onCheckedChange={(available) =>
                  setForm((prev) => ({ ...prev, available }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Create item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              “{deleting?.name}” will be removed from the catalog. Existing
              shopping requests keep their line text.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={busyId === deleting?.id}
              onClick={() => void confirmDelete()}
            >
              {busyId === deleting?.id ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
