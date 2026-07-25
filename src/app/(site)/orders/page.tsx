import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { CustomerOrdersManager } from "@/components/orders/customer-orders-manager";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";
import { ArrowRight, ShoppingBag } from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "My orders",
  description: "Track your JollofPlate orders and payment status.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase sm:text-xs">
              Your account
            </p>
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-4xl">
              My orders
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-base">
              Track WhatsApp payments and delivery in one place.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-11 w-full rounded-xl bg-background/80 sm:h-9 sm:w-auto"
            asChild
          >
            <Link href="/menu">
              <ShoppingBag className="size-4" />
              Order again
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <CustomerAuthGate>
          <CustomerOrdersManager />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
