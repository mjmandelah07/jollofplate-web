"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettings } from "@/lib/api/settings";
import { getMyOrder, removeMyOrderItem } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { clearCustomerSession, getCustomerToken } from "@/lib/auth/storage";
import { formatNaira } from "@/lib/format";
import {
  buildWhatsAppMessage,
  isOrderDeletedResponse,
  openWhatsAppCheckout,
} from "@/lib/whatsapp-order";
import type { Order } from "@/types/admin";

function formatOrderDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CustomerOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      router.replace(`/login?next=/orders/${orderId}`);
      return;
    }

    setLoading(true);
    try {
      const [nextOrder, settings] = await Promise.all([
        getMyOrder(token, orderId),
        getSettings().catch(() => null),
      ]);
      setOrder(nextOrder);
      setWhatsappNumber(
        settings?.whatsappNumber ||
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
          null,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
        router.replace(`/login?next=/orders/${orderId}`);
        return;
      }
      if (error instanceof ApiError && error.status === 404) {
        toast.error("Order not found");
        router.replace("/orders");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not load order",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeItem(itemId: string) {
    if (!order) return;
    const token = getCustomerToken();
    if (!token) return;

    setRemovingId(itemId);
    try {
      const result = await removeMyOrderItem(token, order.id, itemId);
      if (isOrderDeletedResponse(result)) {
        toast.success(result.message || "Order removed");
        router.replace("/orders");
        return;
      }
      setOrder(result);
      toast.success("Item removed");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
        router.replace(`/login?next=/orders/${orderId}`);
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not remove item",
      );
    } finally {
      setRemovingId(null);
    }
  }

  function payOnWhatsApp() {
    if (!order || !whatsappNumber) {
      toast.error("WhatsApp number is not available yet");
      return;
    }
    openWhatsAppCheckout(whatsappNumber, buildWhatsAppMessage(order));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) return null;

  const canEdit = order.status === "PENDING";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
            <Link href="/orders">
              <ArrowLeft className="size-4" />
              All orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatOrderDate(order.createdAt)}
            {order.paidAt
              ? ` · Paid ${formatOrderDate(order.paidAt)}`
              : null}
          </p>
        </div>

        {canEdit ? (
          <Button
            type="button"
            size="lg"
            className="rounded-2xl"
            onClick={payOnWhatsApp}
          >
            <MessageCircle className="size-4" />
            Pay on WhatsApp
          </Button>
        ) : null}
      </div>

      <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_16px_40px_-36px_rgba(34,34,34,0.4)]">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Items
        </h2>
        <ul className="mt-4 divide-y divide-border/80">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {item.quantity}× {item.name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatNaira(item.unitPrice)} each
                </p>
                {item.extras?.length ? (
                  <ul className="mt-2 space-y-0.5">
                    {item.extras.map((extra) => (
                      <li
                        key={`${item.id}-${extra.name}`}
                        className="text-xs text-muted-foreground"
                      >
                        + {extra.name} ({formatNaira(extra.price)})
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-semibold text-primary">
                  {formatNaira(item.lineTotal)}
                </p>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={removingId === item.id}
                    aria-label={`Remove ${item.name}`}
                    onClick={() => void removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_16px_40px_-36px_rgba(34,34,34,0.4)]">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Summary
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatNaira(order.subtotal ?? order.total)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">
              {formatNaira(order.deliveryFee ?? 0)}
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatNaira(order.total)}
            </span>
          </div>
        </div>

        {order.notes ? (
          <div className="mt-5 rounded-2xl bg-muted/50 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Notes
            </p>
            <p className="mt-1 text-sm text-foreground">{order.notes}</p>
          </div>
        ) : null}

        {order.deliveryLine1 ? (
          <div className="mt-5 rounded-2xl bg-muted/50 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Deliver to
            </p>
            <p className="mt-1 text-sm text-foreground">
              {[
                order.deliveryLine1,
                order.deliveryLine2,
                order.deliveryCity,
                order.deliveryState,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.deliveryLandmark ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Landmark: {order.deliveryLandmark}
              </p>
            ) : null}
            {order.deliveryPhone ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Phone: {order.deliveryPhone}
              </p>
            ) : null}
          </div>
        ) : null}

        {canEdit ? (
          <Button
            type="button"
            size="lg"
            className="mt-5 h-12 w-full rounded-2xl sm:hidden"
            onClick={payOnWhatsApp}
          >
            <MessageCircle className="size-4" />
            Pay on WhatsApp
          </Button>
        ) : null}
      </section>
    </div>
  );
}
