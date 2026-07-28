import type { Metadata } from "next";
import { AdminSourcingRequestsManager } from "@/components/admin/sourcing/sourcing-requests-manager";

export const metadata: Metadata = {
  title: "Shopping requests",
  robots: { index: false, follow: false },
};

export default function AdminSourcingRequestsPage() {
  return <AdminSourcingRequestsManager />;
}
