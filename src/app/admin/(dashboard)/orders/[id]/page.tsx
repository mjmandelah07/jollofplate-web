import type { Metadata } from "next";
import { OrderDetailManager } from "@/components/admin/orders/order-detail-manager";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export default function AdminOrderDetailPage() {
  return <OrderDetailManager />;
}
