"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";

export function MenuHero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="relative isolate min-h-[44svh] overflow-hidden bg-foreground sm:min-h-[52svh]">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <Image
            src="/hero/signature-jollof-hero.png"
            alt="Plate of smoky Nigerian party jollof rice"
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="100vw"
          />
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_55%,transparent)_0%,color-mix(in_srgb,var(--foreground)_72%,transparent)_55%,color-mix(in_srgb,var(--foreground)_88%,transparent)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,var(--background))]"
        />

        <Container className="relative z-10 flex min-h-[44svh] flex-col justify-end pb-16 pt-24 sm:min-h-[52svh] sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-2xl text-primary-foreground"
          >
            <p className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              JollofPlate
            </p>
            <h1 className="mt-3 font-heading text-xl font-semibold sm:text-2xl md:text-3xl">
              Menu
            </h1>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/85 sm:text-base">
              Fresh plates from Ikorodu — browse, search, and pick your extras.
            </p>
          </motion.div>
        </Container>
      </div>

      {children ? (
        <Container className="relative z-20 -mt-10 sm:-mt-12">
          {children}
        </Container>
      ) : null}
    </section>
  );
}
