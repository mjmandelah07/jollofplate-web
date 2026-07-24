"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Chip = {
  label: string;
  tone: "cream" | "gold" | "green" | "coral" | "ink";
  rotate: number;
  delay: number;
};

const chips: Chip[] = [
  { label: "Jollof Rice", tone: "coral", rotate: -8, delay: 0.05 },
  { label: "Fried Rice", tone: "gold", rotate: 7, delay: 0.08 },
  { label: "Party Jollof", tone: "cream", rotate: -4, delay: 0.12 },
  { label: "Swallow", tone: "green", rotate: 11, delay: 0.16 },
  { label: "Soups", tone: "coral", rotate: -9, delay: 0.2 },
  { label: "Fried Plantain", tone: "cream", rotate: 5, delay: 0.24 },
  { label: "Catering", tone: "ink", rotate: 10, delay: 0.28 },
  { label: "Groceries", tone: "green", rotate: -12, delay: 0.32 },
  { label: "Frozen Foods", tone: "cream", rotate: 5, delay: 0.36 },
  { label: "Corporate Lunch", tone: "gold", rotate: -6, delay: 0.4 },
  { label: "Spicy", tone: "coral", rotate: 14, delay: 0.44 },
  { label: "Fresh & Hot", tone: "green", rotate: -3, delay: 0.48 },
  { label: "WhatsApp Order", tone: "ink", rotate: 7, delay: 0.52 },
  { label: "Best Sellers", tone: "gold", rotate: -10, delay: 0.56 },
  { label: "Delivery", tone: "cream", rotate: 9, delay: 0.6 },
  { label: "Pickup", tone: "gold", rotate: -7, delay: 0.62 },
  { label: "Ikorodu Lagos", tone: "ink", rotate: 3, delay: 0.63 },
  { label: "Chicken", tone: "coral", rotate: -5, delay: 0.64 },
  { label: "Sides", tone: "green", rotate: 4, delay: 0.68 },
];

const toneClass: Record<Chip["tone"], string> = {
  cream: "bg-[color-mix(in_srgb,var(--brand-background)_92%,white)] text-foreground",
  gold: "bg-[color-mix(in_srgb,var(--brand-secondary)_55%,white)] text-foreground",
  green: "bg-[color-mix(in_srgb,var(--brand-accent)_35%,white)] text-foreground",
  coral: "bg-[color-mix(in_srgb,var(--brand-primary)_40%,white)] text-foreground",
  ink: "bg-foreground text-background ring-1 ring-background/30",
};

export function DroppingChips({ restaurantName }: { restaurantName: string }) {
  return (
    <section
      aria-label="Brand tags"
      className="relative overflow-hidden bg-foreground text-background"
    >
      <div className="px-4 pt-10 text-center sm:pt-12">
        <p className="text-xs text-background/70 sm:text-sm">
          © {new Date().getFullYear()} {restaurantName}. All rights reserved.
        </p>
      </div>

      <div className="relative mx-auto flex min-h-[280px] max-w-5xl flex-wrap items-center justify-center gap-3 px-4 py-12 sm:min-h-[340px] sm:gap-4 sm:py-16">
        {chips.map((chip) => (
          <motion.span
            key={chip.label}
            initial={{ opacity: 0, y: -48, rotate: chip.rotate - 20 }}
            whileInView={{ opacity: 1, y: 0, rotate: chip.rotate }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
              delay: chip.delay,
            }}
            whileHover={{ y: -4, scale: 1.04 }}
            className={cn(
              "inline-flex select-none rounded-full px-4 py-2 text-sm font-medium shadow-sm sm:px-5 sm:py-2.5 sm:text-base",
              toneClass[chip.tone],
            )}
            style={{ rotate: `${chip.rotate}deg` }}
          >
            {chip.label}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
