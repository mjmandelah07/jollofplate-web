import type { Metadata } from "next";
import Link from "next/link";
import { CustomShoppingManager } from "@/components/sourcing/custom-shopping-manager";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Custom shopping",
  description:
    "Build a grocery and house-stock list. JollofPlate quotes prices on WhatsApp — aim ~24 hours.",
  path: "/custom-shopping",
});

export default function CustomShoppingPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-5 sm:py-10 lg:py-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
          <div className="min-w-0 flex-1 basis-[16rem]">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase sm:text-xs">
              House stock
            </p>
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Custom shopping
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Add pantry items to a list — no prices online. We’ll confirm and
              quote on WhatsApp.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 rounded-sm px-5 py-4"
            asChild
          >
            <Link href="/sourcing-requests">My requests</Link>
          </Button>
        </div>
        <CustomShoppingManager />
      </Container>
    </div>
  );
}
