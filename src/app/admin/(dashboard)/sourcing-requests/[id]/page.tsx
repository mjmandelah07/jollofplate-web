import type { Metadata } from "next";
import { AdminSourcingRequestDetail } from "@/components/admin/sourcing/sourcing-request-detail";

export const metadata: Metadata = {
  title: "Shopping request",
  robots: { index: false, follow: false },
};

export default function AdminSourcingRequestDetailPage() {
  return <AdminSourcingRequestDetail />;
}
