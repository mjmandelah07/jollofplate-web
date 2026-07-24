"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  src: string;
  alt: string;
  headline: string;
  support: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  intervalMs?: number;
};

export function HeroCarousel({ slides, intervalMs = 6000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  const slide = slides[index];

  return (
    <section className="relative min-h-[88svh] overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_72%,transparent)_0%,color-mix(in_srgb,var(--foreground)_35%,transparent)_45%,transparent_75%)]"
          />
        </motion.div>
      </AnimatePresence>

      <Container className="relative z-10 flex min-h-[88svh] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24">
        <motion.div
          key={`${slide.src}-copy`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="max-w-xl space-y-5 text-primary-foreground"
        >
          <p className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            JollofPlate
          </p>
          <h1 className="font-heading text-xl font-semibold leading-snug sm:text-2xl md:text-3xl">
            {slide.headline}
          </h1>
          <p className="max-w-md text-sm text-primary-foreground/85 sm:text-base">
            {slide.support}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button size="lg" asChild>
              <Link href="/menu">Order now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/menu">Browse menu</Link>
            </Button>
          </div>
        </motion.div>

        <div className="mt-10 flex items-center gap-2 sm:mt-14">
          {slides.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-8 bg-secondary"
                  : "w-3 bg-primary-foreground/40 hover:bg-primary-foreground/70",
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
