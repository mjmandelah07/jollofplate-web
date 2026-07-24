import type { Metadata } from "next";
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
    <Container className="py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        My orders
      </h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to view your order history.
      </p>
    </Container>
  );
}
