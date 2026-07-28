import type { Metadata } from "next";
import { AdminSourcingItemsManager } from "@/components/admin/sourcing/sourcing-items-manager";

export const metadata: Metadata = {
  title: "Sourcing items",
  robots: { index: false, follow: false },
};

export default function AdminSourcingItemsPage() {
  return <AdminSourcingItemsManager />;
}
