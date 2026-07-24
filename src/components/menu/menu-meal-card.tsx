"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Flame } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Meal } from "@/types/catalog";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function MenuMealCard({
  meal,
  index = 0,
  className,
}: {
  meal: Meal;
  index?: number;
  className?: string;
}) {
  const image = meal.images?.[0];
  const hasSale =
    typeof meal.discountPrice === "number" && meal.discountPrice < meal.price;
  const displayPrice = hasSale ? meal.discountPrice! : meal.price;
  const discountPercent = hasSale
    ? Math.round(((meal.price - meal.discountPrice!) / meal.price) * 100)
    : 0;

  return (
    <motion.article
      variants={cardVariants}
      transition={{ duration: 0.45, ease: "easeOut", delay: (index % 8) * 0.05 }}
      whileHover={{ y: -6 }}
      className={cn("group h-full", className)}
    >
      <Link
        href={`/menu/${meal.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card transition-shadow duration-300 hover:shadow-[0_24px_60px_-32px_rgba(34,34,34,0.55)] focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={meal.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] font-heading text-sm font-semibold text-primary">
              JollofPlate
            </div>
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,color-mix(in_srgb,var(--foreground)_65%,transparent)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {hasSale ? (
                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                  -{discountPercent}%
                </span>
              ) : null}
              {meal.bestSeller ? (
                <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm">
                  <Flame className="size-3" />
                  Top seller
                </span>
              ) : null}
            </div>
            {meal.preparationTime ? (
              <span className="flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
                <Clock className="size-3" />
                {meal.preparationTime}m
              </span>
            ) : null}
          </div>

          <span className="absolute right-3 bottom-3 flex size-9 translate-y-3 items-center justify-center rounded-full bg-background text-primary opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {meal.category?.name ? (
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {meal.category.name}
            </p>
          ) : null}

          <h3 className="font-heading text-base font-semibold text-foreground transition-colors group-hover:text-primary">
            {meal.name}
          </h3>

          {meal.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {meal.description}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-lg font-bold text-primary">
                {formatNaira(displayPrice)}
              </span>
              {hasSale ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatNaira(meal.price)}
                </span>
              ) : null}
            </div>
            <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
              View
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
