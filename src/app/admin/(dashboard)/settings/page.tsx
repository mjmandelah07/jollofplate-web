import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsManager } from "@/components/admin/settings/settings-manager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

function SettingsFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsManager />
    </Suspense>
  );
}
