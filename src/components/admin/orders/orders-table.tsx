"use client";

import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/types/admin";

function customerLabel(order: Order) {
  const customer = order.customer;
  if (!customer) return "Guest";
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return name || customer.email || customer.phone || "Customer";
}

export function OrdersTable({
  orders,
  loading,
}: {
  orders: Order[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No orders in this tab yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-3 py-3 font-medium">Order</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Total</th>
            <th className="px-3 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-border/80 last:border-b-0 hover:bg-muted/30"
            >
              <td className="px-3 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-3 py-3">
                <p className="font-medium text-foreground">
                  {customerLabel(order)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[order.customer?.email, order.customer?.phone]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-3 py-3 font-medium text-foreground">
                {formatNaira(order.total)}
              </td>
              <td className="px-3 py-3 text-muted-foreground">
                {new Date(order.createdAt).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
