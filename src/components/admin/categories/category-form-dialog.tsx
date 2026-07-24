"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadAdminFile } from "@/lib/api/admin/uploads";
import { ApiError } from "@/lib/api/client";
import type { Category, CategoryInput } from "@/types/catalog";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  token: string;
  onAuthError: (error: unknown) => boolean;
  onSaved: (category: Category) => void;
};

const emptyForm = {
  name: "",
  description: "",
  image: "",
  active: true,
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  token,
  onAuthError,
  onSaved,
}: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (category) {
      setForm({
        name: category.name,
        description: category.description ?? "",
        image: category.image ?? "",
        active: category.status === "ACTIVE",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, category]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadAdminFile(token, file);
      setForm((prev) => ({ ...prev, image: uploaded.url }));
      toast.success("Image uploaded");
    } catch (error) {
      if (onAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const body: CategoryInput = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      status: form.active ? "ACTIVE" : "INACTIVE",
    };

    setSaving(true);
    try {
      const { createCategory, updateCategory } = await import(
        "@/lib/api/admin/categories"
      );
      const saved = category
        ? await updateCategory(token, category.id, body)
        : await createCategory(token, body);
      toast.success(category ? "Category updated" : "Category created");
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      if (onAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not save category",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-4 py-4 pr-12 text-left">
          <DialogTitle>
            {isEdit ? "Edit category" : "Create category"}
          </DialogTitle>
          <DialogDescription>
            Slug and sort order are set automatically by the API.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              required
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Signature Jollof"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Classic party jollof, smoky jollof…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative size-20 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                {form.image ? (
                  <Image
                    src={form.image}
                    alt={form.name || "Category"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP. Uploads to Cloudinary via the admin API.
                </p>
              </div>
            </div>
            {uploading ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Uploading…
              </p>
            ) : null}
            {form.image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
              >
                Remove image
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive categories stay hidden on the public menu.
              </p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={(active) =>
                setForm((prev) => ({ ...prev, active }))
              }
            />
          </div>
          </div>

          <DialogFooter className="m-0 rounded-none">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
