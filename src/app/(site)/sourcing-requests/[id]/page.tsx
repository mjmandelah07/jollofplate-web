import type { Metadata } from "next";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { CustomerSourcingRequestDetail } from "@/components/sourcing/customer-sourcing-request-detail";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopping request",
  description: "View a custom shopping request.",
  path: "/sourcing-requests",
  noIndex: true,
});

export default function SourcingRequestDetailPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <CustomerAuthGate>
          <CustomerSourcingRequestDetail />
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
