import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/home/section-header";
import type { Category } from "@/types/catalog";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <Container>
        <SectionHeader
          title="Shop by category"
          description="Find your plate faster — from classics to sides."
        />
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Categories will appear here once the menu is live.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.slug}`}
                className="group w-44 shrink-0 sm:w-52"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_18%,var(--background))] ring-1 ring-border">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="208px"
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
        )}
      </Container>
    </section>
  );
}
