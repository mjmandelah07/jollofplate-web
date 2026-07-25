import type { Metadata } from "next";
import { CartManager } from "@/components/cart/cart-manager";
import { Container } from "@/components/layout/container";
import { getSettings } from "@/lib/api/settings";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cart",
  description:
    "Review your JollofPlate order before checkout on WhatsApp.",
  path: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  const settings = await getSettings().catch(() => null);
  const deliveryFee = settings?.deliveryFee ?? 0;

  return (
    <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_8%,var(--background))_0%,var(--background)_55%)]">
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Cart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Review your plates, adjust quantities, then checkout on WhatsApp.
          </p>
        </div>
        <CartManager deliveryFee={deliveryFee} />
      </Container>
    </div>
  );
}
