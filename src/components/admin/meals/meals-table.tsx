"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import type { Meal } from "@/types/catalog";

export function MealsTable({
  meals,
  loading,
  onEdit,
  onDelete,
}: {
  meals: Meal[];
  loading?: boolean;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No meals match these filters. Add a meal or clear filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-3 py-3 font-medium">Image</th>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Price</th>
            <th className="px-3 py-3 font-medium">Flags</th>
            <th className="px-3 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((meal) => {
            const onSale =
              typeof meal.discountPrice === "number" &&
              meal.discountPrice < meal.price;

            return (
              <tr
                key={meal.id}
                className="border-b border-border/80 last:border-b-0"
              >
                <td className="px-3 py-3">
                  <div className="relative size-12 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                    {meal.images?.[0] ? (
                      <Image
                        src={meal.images[0]}
                        alt={meal.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-medium text-primary">
                        JP
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-foreground">{meal.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {meal.description}
                  </p>
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {meal.category?.name ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-primary">
                      {formatNaira(onSale ? meal.discountPrice! : meal.price)}
                    </span>
                    {onSale ? (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatNaira(meal.price)}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant={meal.available ? "default" : "outline"}
                      className={
                        meal.available
                          ? "bg-accent text-accent-foreground"
                          : undefined
                      }
                    >
                      {meal.available ? "Available" : "Unavailable"}
                    </Badge>
                    {meal.featured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : null}
                    {meal.bestSeller ? (
                      <Badge variant="secondary">Best seller</Badge>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(meal)}
                      aria-label={`Edit ${meal.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(meal)}
                      aria-label={`Delete ${meal.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
