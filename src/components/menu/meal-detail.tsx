"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addToCart, computeLineTotal } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Meal, MealExtra } from "@/types/catalog";

export function MealDetail({ meal }: { meal: Meal }) {
  const router = useRouter();
  const images = meal.images?.length ? meal.images : [];
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<MealExtra[]>([]);

  const hasSale =
    typeof meal.discountPrice === "number" && meal.discountPrice < meal.price;
  const unitPrice = hasSale ? meal.discountPrice! : meal.price;
  const extras = meal.extras ?? [];
  const extrasSum = selectedExtras.reduce(
    (sum, extra) => sum + (extra.price || 0),
    0,
  );

  const ingredients = useMemo(
    () =>
      (meal.ingredients ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [meal.ingredients],
  );

  const lineTotal = computeLineTotal({
    mealId: meal.id,
    slug: meal.slug,
    name: meal.name,
    unitPrice,
    originalPrice: meal.price,
    quantity,
    extras: selectedExtras,
    image: images[0],
  });

  function setExtraChecked(extra: MealExtra, checked: boolean) {
    setSelectedExtras((prev) => {
      const exists = prev.some((item) => item.name === extra.name);
      if (checked && !exists) return [...prev, extra];
      if (!checked && exists) {
        return prev.filter((item) => item.name !== extra.name);
      }
      return prev;
    });
  }

  function handleAddToCart() {
    addToCart({
      mealId: meal.id,
      slug: meal.slug,
      name: meal.name,
      unitPrice,
      originalPrice: meal.price,
      quantity,
      extras: selectedExtras,
      image: images[0],
    });
    toast.success(`${meal.name} added to cart`, {
      description:
        selectedExtras.length > 0
          ? `${quantity} plate${quantity > 1 ? "s" : ""} · ${selectedExtras.length} extra${selectedExtras.length > 1 ? "s" : ""}`
          : `${quantity} plate${quantity > 1 ? "s" : ""} · ${formatNaira(lineTotal)}`,
      action: {
        label: "View cart",
        onClick: () => {
          router.push("/cart");
        },
      },
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:items-start xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4 lg:sticky lg:top-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-muted shadow-[0_30px_80px_-48px_rgba(34,34,34,0.55)] ring-1 ring-border/70 sm:aspect-[5/4] lg:aspect-[5/6] xl:aspect-[4/5]"
        >
          {images[activeImage] ? (
            <Image
              key={images[activeImage]}
              src={images[activeImage]}
              alt={meal.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-heading text-lg font-semibold text-primary">
              JollofPlate
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--foreground)_55%,transparent))]" />

          <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
            {hasSale ? (
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
                Save {formatNaira(meal.price - meal.discountPrice!)}
              </span>
            ) : null}
            {meal.bestSeller ? (
              <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm">
                <Flame className="size-3.5" />
                Top seller
              </span>
            ) : null}
            {meal.featured ? (
              <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm">
                <Sparkles className="size-3.5" />
                Featured
              </span>
            ) : null}
          </div>
        </motion.div>

        {images.length > 1 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeImage}
                className={cn(
                  "relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 transition-all sm:size-20",
                  index === activeImage
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "ring-border/80 hover:ring-primary/40",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="space-y-7"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {meal.category?.name ? (
              <Link
                href={`/menu?category=${meal.category.slug}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase"
              >
                {meal.category.name}
              </Link>
            ) : null}
            {meal.preparationTime ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" />
                Ready in {meal.preparationTime} min
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {meal.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <span className="font-heading text-3xl font-bold text-primary">
              {formatNaira(unitPrice)}
            </span>
            {hasSale ? (
              <span className="pb-1 text-base text-muted-foreground line-through">
                {formatNaira(meal.price)}
              </span>
            ) : null}
            <span className="pb-1 text-sm text-muted-foreground">per plate</span>
          </div>

          {meal.description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {meal.description}
            </p>
          ) : null}
        </div>

        {ingredients.length > 0 ? (
          <section>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Ingredients
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {ingredients.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {extras.length > 0 ? (
          <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Add extras
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tick as many as you want — priced per plate.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2" role="group" aria-label="Extras">
              {extras.map((extra) => {
                const checked = selectedExtras.some(
                  (item) => item.name === extra.name,
                );
                const id = `extra-${extra.name.replace(/\s+/g, "-").toLowerCase()}`;

                return (
                  <label
                    key={extra.name}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3.5 transition-colors",
                      checked
                        ? "border-primary/35 bg-primary/[0.06]"
                        : "border-border/80 bg-background hover:border-border hover:bg-muted/40",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(value) =>
                          setExtraChecked(extra, value === true)
                        }
                      />
                      <span className="truncate text-sm font-medium text-foreground">
                        {extra.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      +{formatNaira(extra.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-border/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_8%,var(--card))_0%,var(--card)_100%)] p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Quantity
              </p>
              <div className="mt-2 inline-flex items-center rounded-2xl border border-border bg-background p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  className="rounded-xl"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-12 text-center font-heading text-lg font-semibold text-foreground">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  className="rounded-xl"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-primary">
                {formatNaira(lineTotal)}
              </p>
              {extrasSum > 0 || quantity > 1 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNaira(unitPrice)}
                  {extrasSum > 0 ? ` + ${formatNaira(extrasSum)} extras` : ""}
                  {quantity > 1 ? ` × ${quantity}` : ""}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="h-12 py-3 flex-1 rounded-2xl text-base font-semibold"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              Add to cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-2xl"
              asChild
            >
              <Link href="/menu">
                <ArrowLeft className="size-4" />
                Back to menu
              </Link>
            </Button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
