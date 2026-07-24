import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { MenuFilters } from "@/components/menu/menu-filters";
import { MenuHero } from "@/components/menu/menu-hero";
import { MenuMealGrid } from "@/components/menu/menu-meal-grid";
import { MenuPagination } from "@/components/menu/menu-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories, getMeals } from "@/lib/api/catalog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Browse jollof rice, fried rice, swallow and soups, sides, groceries, and frozen foods. Order for delivery or pickup in Ikorodu, Lagos.",
  path: "/menu",
});

const MENU_PAGE_SIZE = 20;

type MenuSearchParams = Promise<{
  category?: string | string[];
  search?: string | string[];
  page?: string | string[];
}>;

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function MenuToolbarSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-10 w-16 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
}

function MenuGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function MenuContent({
  category,
  search,
  page,
}: {
  category?: string;
  search?: string;
  page: number;
}) {
  const [categories, mealsResult] = await Promise.all([
    getCategories({ limit: 100 }).catch(() => []),
    getMeals({
      category: category || undefined,
      search: search || undefined,
      page,
      limit: MENU_PAGE_SIZE,
    }).catch(() => ({
      items: [],
      meta: { total: 0, page: 1, limit: MENU_PAGE_SIZE, totalPages: 1 },
    })),
  ]);

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const activeCategory = sortedCategories.find(
    (item) => item.slug === category,
  );
  const meals = mealsResult.items;
  const meta = mealsResult.meta;
  const hasFilters = Boolean(category || search);

  return (
    <>
      <MenuHero>
        <MenuFilters
          categories={sortedCategories}
          activeCategory={category}
          initialSearch={search}
        />
      </MenuHero>

      <Container className="py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
              {activeCategory?.name ?? (category ? "Category" : "All meals")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {meta.total === 0
                ? hasFilters
                  ? "No matches for these filters."
                  : "Nothing on the menu yet."
                : `${meta.total} dish${meta.total === 1 ? "" : "es"} available`}
              {search ? ` for “${search}”` : null}
            </p>
          </div>
        </div>

        {meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">
              {search
                ? "No search results"
                : category
                  ? "No meals in this category"
                  : "Menu coming soon"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? "Try a different name, or clear search to browse everything."
                : category
                  ? "Pick another category, or view the full menu."
                  : "Check back shortly — we’re plating the catalog."}
            </p>
          </div>
        ) : (
          <MenuMealGrid meals={meals} />
        )}

        <div className="mt-8">
          <MenuPagination meta={meta} category={category} search={search} />
        </div>
      </Container>
    </>
  );
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: MenuSearchParams;
}) {
  const params = await searchParams;
  const category = first(params.category)?.trim() || undefined;
  const search = first(params.search)?.trim() || undefined;
  const pageRaw = Number(first(params.page) || "1");
  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return (
    <div className="border-b border-border/70 bg-background">
      <Suspense
        fallback={
          <>
            <MenuHero>
              <MenuToolbarSkeleton />
            </MenuHero>
            <Container className="py-8 sm:py-10">
              <MenuGridSkeleton />
            </Container>
          </>
        }
      >
        <MenuContent category={category} search={search} page={page} />
      </Suspense>
    </div>
  );
}
