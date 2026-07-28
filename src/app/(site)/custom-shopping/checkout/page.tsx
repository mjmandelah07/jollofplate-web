import type { Metadata } from "next";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { SourcingCheckoutManager } from "@/components/sourcing/sourcing-checkout-manager";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Custom shopping checkout",
  description: "Submit your sourcing list and continue on WhatsApp.",
  path: "/custom-shopping/checkout",
  noIndex: true,
});

export default function CustomShoppingCheckoutPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <div className="mb-5 sm:mb-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase sm:text-xs">
            Checkout
          </p>
          <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight sm:text-4xl">
            Review shopping list
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground sm:text-base">
            Confirm delivery details, then we’ll open WhatsApp for a quote.
          </p>
        </div>
        <CustomerAuthGate>
          <SourcingCheckoutManager />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
