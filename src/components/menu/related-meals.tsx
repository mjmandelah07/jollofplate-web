import { MenuMealGrid } from "@/components/menu/menu-meal-grid";
import type { Meal } from "@/types/catalog";

export function RelatedMeals({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) return null;

  return (
    <section className="mt-14 border-t border-border/70 pt-10 sm:mt-16">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          You may also like
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          More plates from the same kitchen.
        </p>
      </div>
      <MenuMealGrid meals={meals} />
    </section>
  );
}
