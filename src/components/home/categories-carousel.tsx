"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [categories.length, updateScrollState]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.72, 220);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shop by category
          </h2>
          <p className="text-muted-foreground">
            Find your plate faster — from classics to sides.
          </p>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-full"
            aria-label="Previous categories"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-full"
            aria-label="Next categories"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-muted/80 to-transparent transition-opacity sm:w-12",
            canPrev ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-muted/80 to-transparent transition-opacity sm:w-12",
            canNext ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu?category=${category.slug}`}
              className="group w-[min(11.5rem,42vw)] shrink-0 snap-start sm:w-52 md:w-56 lg:w-60"
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_18%,var(--background))] ring-1 ring-border">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 42vw, 240px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center font-heading text-sm font-semibold text-primary">
                    {category.name}
                  </div>
                )}
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary">
                {category.name}
              </h3>
              {category.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {category.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2 sm:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label="Previous categories"
          disabled={!canPrev}
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label="Next categories"
          disabled={!canNext}
          onClick={() => scrollByPage(1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
