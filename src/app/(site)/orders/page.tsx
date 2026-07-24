import type { Metadata } from "next";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { CustomerOrdersManager } from "@/components/orders/customer-orders-manager";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My orders",
  description: "Track your JollofPlate orders and payment status.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersPage() {
  return (
    <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_8%,var(--background))_0%,var(--background)_55%)]">
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            My orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Track pending WhatsApp checkouts and past payments.
          </p>
        </div>
        <CustomerAuthGate>
          <CustomerOrdersManager />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
