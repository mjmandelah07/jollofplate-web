"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  NotebookPen,
  Phone,
  Trash2,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

function formatOrderDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) return null;

  const canEdit = order.status === "PENDING";
  const deliveryAddress = [
    order.deliveryLine1,
    order.deliveryLine2,
    order.deliveryCity,
    order.deliveryState,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("space-y-4 sm:space-y-6", canEdit && "pb-24 sm:pb-0")}>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-3 h-9 px-2 text-muted-foreground"
          asChild
        >
          <Link href="/orders">
            <ArrowLeft className="size-4" />
            All orders
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
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
              className="hidden h-11 rounded-xl sm:inline-flex"
              onClick={payOnWhatsApp}
            >
              <MessageCircle className="size-4" />
              Pay on WhatsApp
            </Button>
          ) : null}
        </div>

        {canEdit ? (
          <div className="mt-4 rounded-xl border border-secondary/40 bg-secondary/15 px-3.5 py-3 text-sm text-foreground sm:hidden">
            This order is waiting for payment. Continue on WhatsApp to confirm.
          </div>
        ) : null}
      </div>

      <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-border/70 px-4 py-3.5 sm:px-5">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Items
            </h2>
          </div>

          <ul className="divide-y divide-border/70">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        <span className="text-muted-foreground">
                          {item.quantity}×
                        </span>{" "}
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatNaira(item.unitPrice)} each
                      </p>
                    </div>
                    <p className="shrink-0 font-heading text-sm font-bold text-primary sm:text-base">
                      {formatNaira(item.lineTotal)}
                    </p>
                  </div>

                  {item.extras?.length ? (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Extras
                      </p>
                      <ul className="space-y-1">
                        {item.extras.map((extra) => (
                          <li
                            key={`${item.id}-${extra.name}`}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="min-w-0 text-foreground">
                              Extra: {extra.name}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                              {formatNaira(extra.price)} each
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-0.5 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={removingId === item.id}
                    aria-label={`Remove ${item.name}`}
                    onClick={() => void removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border/70 px-4 py-3.5 sm:px-5">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Delivery
              </h2>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {deliveryAddress ? (
                <div className="flex gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Address
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {deliveryAddress}
                    </p>
                    {order.deliveryLandmark ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Landmark: {order.deliveryLandmark}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No delivery address on this order.
                </p>
              )}

              {order.deliveryPhone ? (
                <div className="flex gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Contact
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {order.deliveryPhone}
                    </p>
                  </div>
                </div>
              ) : null}

              {order.notes ? (
                <div className="flex gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                  <NotebookPen className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Notes
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {order.notes}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border/70 px-4 py-3.5 sm:px-5">
              <h2 className="font-heading text-base font-semibold text-foreground">
                Summary
              </h2>
            </div>

            <div className="space-y-3 p-4 text-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatNaira(order.subtotal ?? order.total)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-foreground">
                  {formatNaira(order.deliveryFee ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/80 pt-3">
                <span className="font-heading text-base font-semibold text-foreground">
                  Total
                </span>
                <span className="font-heading text-xl font-bold text-primary">
                  {formatNaira(order.total)}
                </span>
              </div>

              {canEdit ? (
                <Button
                  type="button"
                  size="lg"
                  className="mt-2 hidden h-12 w-full rounded-xl sm:inline-flex"
                  onClick={payOnWhatsApp}
                >
                  <MessageCircle className="size-4" />
                  Pay on WhatsApp
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {canEdit ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur sm:hidden">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-xl text-base font-semibold"
            onClick={payOnWhatsApp}
          >
            <MessageCircle className="size-4" />
            Pay on WhatsApp · {formatNaira(order.total)}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
