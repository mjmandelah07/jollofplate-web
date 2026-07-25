import type { Metadata } from "next";
import { CheckoutManager } from "@/components/checkout/checkout-manager";
import { Container } from "@/components/layout/container";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { getSettings } from "@/lib/api/settings";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout",
  description: "Complete your JollofPlate order on WhatsApp.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const settings = await getSettings().catch(() => null);

  return (
    <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_8%,var(--background))_0%,var(--background)_55%)]">
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Final step
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Review your order, place it, then continue to WhatsApp to arrange
            payment.
          </p>
        </div>

        <CustomerAuthGate>
          <CheckoutManager
            deliveryFee={settings?.deliveryFee ?? 0}
            fallbackWhatsappNumber={
              settings?.whatsappNumber ||
              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
              ""
            }
          />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
