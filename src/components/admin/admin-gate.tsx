"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminStats } from "@/lib/api/admin/stats";
import { getAdminToken, getAdminUser } from "@/lib/auth/storage";
import type { AuthUser } from "@/types";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState<string | undefined>();
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const user = getAdminUser<AuthUser>();
    const name =
      user?.firstName || user?.email?.split("@")[0] || "Admin";
    setAdminName(name);
    setReady(true);

    void getAdminStats(token)
      .then((stats) => setPendingOrders(stats.pendingOrders ?? 0))
      .catch(() => {
        // Sidebar badge is optional; ignore failures here.
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-sm text-muted-foreground">
        Checking admin session…
      </div>
    );
  }

  return (
    <AdminShell adminName={adminName} pendingOrders={pendingOrders}>
      {children}
    </AdminShell>
  );
}
