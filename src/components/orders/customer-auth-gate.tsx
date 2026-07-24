"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCustomerToken } from "@/lib/auth/storage";

/** Redirects unauthenticated customers to login, preserving the intended path. */
export function CustomerAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      const next = encodeURIComponent(pathname || "/orders");
      router.replace(`/login?next=${next}`);
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
