import { Container } from "@/components/layout/container";
import { CategoriesCarousel } from "@/components/home/categories-carousel";
import type { Category } from "@/types/catalog";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <Container>
        {categories.length === 0 ? (
          <>
            <div className="mb-8 max-w-2xl space-y-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Shop by category
              </h2>
              <p className="text-muted-foreground">
                Find your plate faster — from classics to sides.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Categories will appear here once the menu is live.
            </p>
          </>
        ) : (
          <CategoriesCarousel categories={categories} />
        )}
      </Container>
    </section>
  );
}
