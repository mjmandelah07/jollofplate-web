import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountManager } from "@/components/account/account-manager";
import { Container } from "@/components/layout/container";
import { CustomerAuthGate } from "@/components/orders/customer-auth-gate";
import { Skeleton } from "@/components/ui/skeleton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Account",
  description:
    "Manage your JollofPlate profile, addresses, settings, and orders.",
  path: "/account",
  noIndex: true,
});

function AccountFallback() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-[70vh] border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_9%,var(--background))_0%,var(--background)_22rem)]">
      <Container className="py-6 sm:py-12">
        <div className="mb-5 sm:mb-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase sm:text-xs">
            Your account
          </p>
          <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-foreground sm:mt-2 sm:text-4xl">
            Account
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-base">
            Profile, addresses, settings, and orders in one place.
          </p>
        </div>

        <CustomerAuthGate>
          <Suspense fallback={<AccountFallback />}>
            <AccountManager />
          </Suspense>
        </CustomerAuthGate>
      </Container>
    </div>
  );
}
