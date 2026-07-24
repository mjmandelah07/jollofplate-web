import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cart",
  description:
    "Review your JollofPlate order before checkout on WhatsApp.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <Container className="py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground">Cart</h1>
      <p className="mt-2 text-muted-foreground">Your cart is empty for now.</p>
    </Container>
  );
}
