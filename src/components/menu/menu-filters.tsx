"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { buildMenuHref } from "@/lib/menu-url";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

export function MenuFilters({
  categories,
  activeCategory,
  initialSearch,
}: {
  categories: Category[];
  activeCategory?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch ?? "");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setSearch(initialSearch ?? "");
  }, [initialSearch]);

  useEffect(() => {
    const next = (debouncedSearch ?? "").trim();
    const current = (initialSearch ?? "").trim();
    if (next === current) return;

    router.replace(
      buildMenuHref({
        category: activeCategory,
        search: next || null,
        page: 1,
      }),
      { scroll: false },
    );
  }, [activeCategory, debouncedSearch, initialSearch, router]);

  function selectCategory(slug?: string) {
    router.push(
      buildMenuHref({
        category: slug,
        search: search.trim() || null,
        page: 1,
      }),
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-[0_18px_50px_-28px_rgba(34,34,34,0.45)] backdrop-blur-md">
      <div className="border-b border-border/70 p-3 sm:p-4">
        <label className="relative block">
          <span className="sr-only">Search meals</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jollof, sides, plantain…"
            className="h-12 w-full rounded-xl border border-transparent bg-muted/50 pr-11 pl-11 text-sm text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </div>

      <div
        role="tablist"
        aria-label="Menu categories"
        className="flex gap-1 overflow-x-auto px-2 py-2 sm:px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <CategoryTab
          label="All"
          active={!activeCategory}
          onClick={() => selectCategory(undefined)}
        />
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            label={category.name}
            active={activeCategory === category.slug}
            onClick={() => selectCategory(category.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full transition-opacity",
          active ? "bg-primary opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
