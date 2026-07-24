import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Meal } from "@/types/catalog";

export function MealCard({ meal, className }: { meal: Meal; className?: string }) {
  const image = meal.images?.[0];
  const hasSale =
    typeof meal.discountPrice === "number" && meal.discountPrice < meal.price;
  const displayPrice = hasSale ? meal.discountPrice! : meal.price;

  return (
    <Link
      href={`/menu/${meal.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={meal.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] font-heading text-sm font-semibold text-primary">
            JollofPlate
          </div>
        )}
        {hasSale ? (
          <Badge className="absolute top-3 left-3" variant="secondary">
            Sale
          </Badge>
        ) : null}
        {meal.bestSeller ? (
          <Badge
            className="absolute top-3 right-3 bg-accent text-accent-foreground"
            variant="default"
          >
            Top seller
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary">
          {meal.name}
        </h3>
        {meal.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {meal.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-primary">
            {formatNaira(displayPrice)}
          </span>
          {hasSale ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(meal.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
