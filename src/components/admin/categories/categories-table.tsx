"use client";

import Image from "next/image";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCategoryMealCount,
  type Category,
} from "@/types/catalog";
import { cn } from "@/lib/utils";

function SortableRow({
  category,
  onEdit,
  onDelete,
  reorderDisabled,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  reorderDisabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: reorderDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const mealCount = getCategoryMealCount(category);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-border/80 bg-card",
        isDragging && "relative z-10 opacity-90 shadow-md",
      )}
    >
      <td className="w-10 px-2 py-3">
        <button
          type="button"
          className={cn(
            "touch-none rounded-md p-1 text-muted-foreground",
            reorderDisabled
              ? "cursor-not-allowed opacity-40"
              : "cursor-grab hover:bg-muted hover:text-foreground active:cursor-grabbing",
          )}
          aria-label={`Drag ${category.name}`}
          disabled={reorderDisabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="relative size-12 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
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
        <div>
          <p className="font-medium text-foreground">{category.name}</p>
          {category.description ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {category.description}
            </p>
          ) : null}
          <p className="mt-1 text-[11px] text-muted-foreground">
            /{category.slug}
          </p>
        </div>
      </td>
      <td className="px-3 py-3">
        <Badge
          variant={category.status === "ACTIVE" ? "default" : "outline"}
          className={
            category.status === "ACTIVE"
              ? "bg-accent text-accent-foreground"
              : undefined
          }
        >
          {category.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground">{mealCount}</td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function CategoriesTable({
  categories,
  loading,
  onReorder,
  onEdit,
  onDelete,
  reorderDisabled = false,
  emptyMessage,
}: {
  categories: Category[];
  loading?: boolean;
  onReorder: (next: Category[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  reorderDisabled?: boolean;
  emptyMessage?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    if (reorderDisabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((item) => item.id === active.id);
    const newIndex = categories.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(categories, oldIndex, newIndex));
  }

  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {emptyMessage ??
            "No categories yet. Create your first one to organize the menu."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="w-10 px-2 py-3 font-medium" />
              <th className="px-3 py-3 font-medium">Image</th>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Meals</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <SortableContext
            items={categories.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {categories.map((category) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  reorderDisabled={reorderDisabled}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}
