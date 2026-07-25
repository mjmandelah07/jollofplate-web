import type { Metadata } from "next";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { CustomerOrderDetail } from "@/components/orders/customer-order-detail";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: "Order detail",
    description: "View your JollofPlate order status and items.",
    path: `/orders/${id}`,
    noIndex: true,
  });
}

export default async function CustomerOrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <CustomerAuthGate>
          <CustomerOrderDetail orderId={id} />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
