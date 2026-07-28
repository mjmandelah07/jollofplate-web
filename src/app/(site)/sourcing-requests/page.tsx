import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { CustomerSourcingRequestsManager } from "@/components/sourcing/customer-sourcing-requests-manager";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My shopping requests",
  description: "Track custom shopping / sourcing requests with JollofPlate.",
  path: "/sourcing-requests",
  noIndex: true,
});

export default function SourcingRequestsPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase sm:text-xs">
              Your account
            </p>
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight sm:text-4xl">
              Shopping requests
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground sm:text-base">
              Quotes and delivery updates for custom shopping lists.
            </p>
          </div>
          <Button className="rounded-xl" asChild>
            <Link href="/custom-shopping">New list</Link>
          </Button>
        </div>
        <CustomerAuthGate>
          <CustomerSourcingRequestsManager />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
