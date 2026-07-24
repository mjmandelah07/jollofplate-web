import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MealCard } from "@/components/home/meal-card";
import { SectionHeader } from "@/components/home/section-header";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types/catalog";

export function MealGridSection({
  title,
  description,
  meals,
  emptyMessage,
}: {
  title: string;
  description: string;
  meals: Meal[];
  emptyMessage: string;
}) {
  return (
    <section className="border-b border-border/70 bg-background py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title={title}
            description={description}
            className="mb-0"
          />
          <Button variant="outline" asChild>
            <Link href="/menu">View full menu</Link>
          </Button>
        </div>

        {meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            <Button className="mt-4" asChild>
              <Link href="/menu">Browse menu</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
