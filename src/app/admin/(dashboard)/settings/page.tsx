import type { Metadata } from "next";
import { SettingsManager } from "@/components/admin/settings/settings-manager";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
