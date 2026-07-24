"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createMeal, updateMeal } from "@/lib/api/admin/meals";
import { uploadAdminFile } from "@/lib/api/admin/uploads";
import { ApiError } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { Category, Meal, MealExtra, MealInput } from "@/types/catalog";

type MealFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal?: Meal | null;
  categories: Category[];
  token: string;
  onAuthError: (error: unknown) => boolean;
  onSaved: (meal: Meal) => void;
};

type FormState = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  discountPrice: string;
  preparationTime: string;
  ingredients: string;
  images: string[];
  extras: MealExtra[];
  available: boolean;
  featured: boolean;
  bestSeller: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  categoryId: "",
  price: "",
  discountPrice: "",
  preparationTime: "30",
  ingredients: "",
  images: [],
  extras: [],
  available: true,
  featured: false,
  bestSeller: false,
};

function toForm(meal?: Meal | null): FormState {
  if (!meal) return emptyForm;
  return {
    name: meal.name,
    description: meal.description ?? "",
    categoryId: meal.categoryId,
    price: String(meal.price),
    discountPrice:
      meal.discountPrice === null || meal.discountPrice === undefined
        ? ""
        : String(meal.discountPrice),
    preparationTime: String(meal.preparationTime ?? 30),
    ingredients: meal.ingredients ?? "",
    images: meal.images ?? [],
    extras: meal.extras ?? [],
    available: meal.available,
    featured: meal.featured,
    bestSeller: meal.bestSeller,
  };
}

export function MealFormDialog({
  open,
  onOpenChange,
  meal,
  categories,
  token,
  onAuthError,
  onSaved,
}: MealFormDialogProps) {
  const isEdit = Boolean(meal);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toForm(meal));
  }, [open, meal]);

  const priceNum = Number(form.price) || 0;
  const discountNum =
    form.discountPrice.trim() === "" ? null : Number(form.discountPrice);
  const onSale =
    typeof discountNum === "number" &&
    !Number.isNaN(discountNum) &&
    discountNum > 0 &&
    discountNum < priceNum;

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadAdminFile(token, file);
        uploadedUrls.push(uploaded.url);
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast.success(
        uploadedUrls.length === 1
          ? "Image uploaded"
          : `${uploadedUrls.length} images uploaded`,
      );
    } catch (error) {
      if (onAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  function updateExtra(index: number, patch: Partial<MealExtra>) {
    setForm((prev) => ({
      ...prev,
      extras: prev.extras.map((extra, i) =>
        i === index ? { ...extra, ...patch } : extra,
      ),
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!priceNum || priceNum < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (
      form.discountPrice.trim() !== "" &&
      (discountNum === null ||
        Number.isNaN(discountNum) ||
        discountNum < 0 ||
        discountNum >= priceNum)
    ) {
      toast.error("Sale price must be less than the regular price");
      return;
    }

    const body: MealInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      price: Math.round(priceNum),
      discountPrice:
        form.discountPrice.trim() === ""
          ? null
          : Math.round(Number(form.discountPrice)),
      images: form.images,
      preparationTime: Math.max(1, Math.round(Number(form.preparationTime) || 1)),
      ingredients: form.ingredients.trim() || null,
      extras: form.extras
        .filter((extra) => extra.name.trim())
        .map((extra) => ({
          name: extra.name.trim(),
          price: Math.max(0, Math.round(Number(extra.price) || 0)),
        })),
      available: form.available,
      featured: form.featured,
      bestSeller: form.bestSeller,
    };

    setSaving(true);
    try {
      const saved = meal
        ? await updateMeal(token, meal.id, body)
        : await createMeal(token, body);
      toast.success(meal ? "Meal updated" : "Meal created");
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      if (onAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not save meal",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-4 py-4 pr-12 text-left">
          <DialogTitle>{isEdit ? "Edit meal" : "Create meal"}</DialogTitle>
          <DialogDescription>
            Slug is generated from the name. Upload images before saving.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meal-name">Name</Label>
              <Input
                id="meal-name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Party Jollof"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meal-description">Description</Label>
              <Textarea
                id="meal-description"
                required
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId || undefined}
                onValueChange={(categoryId) =>
                  setForm((prev) => ({ ...prev, categoryId: categoryId ?? "" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-prep">Prep time (minutes)</Label>
              <Input
                id="meal-prep"
                type="number"
                min={1}
                required
                value={form.preparationTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preparationTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-price">Price (₦)</Label>
              <Input
                id="meal-price"
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-sale">Sale price (optional)</Label>
              <Input
                id="meal-sale"
                type="number"
                min={0}
                value={form.discountPrice}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    discountPrice: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {priceNum > 0 ? (
            <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground">
              Price preview:{" "}
              {onSale ? (
                <>
                  <span className="text-muted-foreground line-through">
                    {formatNaira(priceNum)}
                  </span>{" "}
                  <span className="font-semibold text-primary">
                    {formatNaira(discountNum!)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-primary">
                  {formatNaira(priceNum)}
                </span>
              )}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="meal-ingredients">Ingredients</Label>
            <Textarea
              id="meal-ingredients"
              value={form.ingredients}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ingredients: e.target.value }))
              }
              rows={2}
              placeholder="Rice, tomato, pepper, spices…"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Images</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading}
                className="max-w-xs"
                onChange={(e) => {
                  void onUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {uploading ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Uploading…
              </p>
            ) : null}
            {form.images.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.images.map((image) => (
                  <div
                    key={image}
                    className="relative size-20 overflow-hidden rounded-xl ring-1 ring-border"
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 rounded-full bg-foreground/80 p-0.5 text-background"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((url) => url !== image),
                        }))
                      }
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No images yet. JPG, PNG, or WEBP.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Extras</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    extras: [...prev.extras, { name: "", price: 0 }],
                  }))
                }
              >
                <Plus className="size-3.5" />
                Add extra
              </Button>
            </div>
            {form.extras.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Optional add-ons with a name and price.
              </p>
            ) : (
              <div className="space-y-2">
                {form.extras.map((extra, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Extra name"
                      value={extra.name}
                      onChange={(e) =>
                        updateExtra(index, { name: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      className="w-28"
                      placeholder="₦"
                      value={extra.price}
                      onChange={(e) =>
                        updateExtra(index, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          extras: prev.extras.filter((_, i) => i !== index),
                        }))
                      }
                      aria-label="Remove extra"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["available", "Available"],
                ["featured", "Featured"],
                ["bestSeller", "Best seller"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
                <Switch
                  checked={form[key]}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
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
                "Create meal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
