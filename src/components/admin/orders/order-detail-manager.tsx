"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  bookOrderShipment,
  getAdminOrder,
  removeOrderItem,
  updateOrderStatus,
} from "@/lib/api/admin/orders";
import { ApiError } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/types/admin";

export function OrderDetailManager() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { requireToken, handleAuthError } = useAdminAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingShipment, setBookingShipment] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    const token = requireToken();
    if (!token || !params.id) return;

    setLoading(true);
    try {
      const data = await getAdminOrder(token, params.id);
      setOrder({
        ...data,
        items: Array.isArray(data.items) ? data.items : [],
      });
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not load order",
      );
      router.replace("/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, params.id, requireToken, router]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function markStatus(status: "PAID" | "CANCELLED") {
    if (!order) return;
    const token = requireToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const updated = await updateOrderStatus(token, order.id, status);
      setOrder({
        ...updated,
        items: Array.isArray(updated.items) ? updated.items : order.items,
      });
      toast.success(status === "PAID" ? "Order marked paid" : "Order cancelled");
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not update status",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function bookShipment() {
    if (!order) return;
    const token = requireToken();
    if (!token) return;

    setBookingShipment(true);
    try {
      const updated = await bookOrderShipment(token, order.id);
      setOrder({
        ...updated,
        items: Array.isArray(updated.items) ? updated.items : order.items,
      });
      toast.success("Shipment booked with Terminal");
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not book shipment",
      );
    } finally {
      setBookingShipment(false);
    }
  }

  async function confirmRemoveItem() {
    if (!order || !removingItemId) return;
    const token = requireToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const result = await removeOrderItem(token, order.id, removingItemId);
      if (
        result &&
        typeof result === "object" &&
        "order" in result &&
        result.order
      ) {
        setOrder({
          ...result.order,
          items: Array.isArray(result.order.items) ? result.order.items : [],
        });
      } else if (result && typeof result === "object" && "items" in result) {
        setOrder({
          ...(result as Order),
          items: Array.isArray((result as Order).items)
            ? (result as Order).items
            : [],
        });
      } else {
        // Last item removed — order deleted
        toast.success("Item removed. Order deleted.");
        router.replace("/admin/orders");
        return;
      }
      toast.success("Item removed");
      setRemovingItemId(null);
    } catch (error) {
      if (handleAuthError(error)) return;
      // Some APIs return 404 when the whole order was deleted with the last item
      if (error instanceof ApiError && error.status === 404) {
        toast.success("Order removed");
        router.replace("/admin/orders");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not remove item",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!order) return null;

  const customerName = [
    order.customer?.firstName,
    order.customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  const pending = order.status === "PENDING";
  const canBookShipment =
    order.status === "PAID" &&
    Boolean(order.shippingRateId) &&
    !order.shipmentId &&
    !order.shipmentBookedAt;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
              Back to orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pending ? (
            <>
              <Button
                disabled={actionLoading}
                onClick={() => void markStatus("PAID")}
              >
                Mark paid
              </Button>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => void markStatus("CANCELLED")}
              >
                Mark cancelled
              </Button>
            </>
          ) : null}
          {canBookShipment ? (
            <Button
              disabled={bookingShipment || actionLoading}
              onClick={() => void bookShipment()}
            >
              {bookingShipment ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Truck className="size-4" />
              )}
              Book shipment
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Customer
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">
                {customerName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{order.customer?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{order.customer?.phone || "—"}</dd>
            </div>
            {order.paidAt ? (
              <div>
                <dt className="text-muted-foreground">Paid at</dt>
                <dd>
                  {new Date(order.paidAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
            ) : null}
            {order.shippingRateId ? (
              <div>
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>
                  {order.shippingCarrierName || "Terminal rate"}
                  {typeof order.shippingAmount === "number"
                    ? ` · ${formatNaira(order.shippingAmount)}`
                    : ""}
                </dd>
              </div>
            ) : null}
            {order.shipmentId || order.shipmentBookedAt ? (
              <div>
                <dt className="text-muted-foreground">Shipment</dt>
                <dd>
                  {order.shipmentId
                    ? `Booked · ${order.shipmentId}`
                    : "Booked"}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Items
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {item.quantity}× {item.name}
                  </p>
                  {item.extras?.length ? (
                    <ul className="mt-1 text-xs text-muted-foreground">
                      {item.extras.map((extra) => (
                        <li key={`${item.id}-${extra.name}`}>
                          + {extra.name} ({formatNaira(extra.price)})
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">
                    {formatNaira(item.lineTotal ?? item.unitPrice * item.quantity)}
                  </p>
                  {pending ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => setRemovingItemId(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            {typeof order.subtotal === "number" ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
            ) : null}
            {typeof order.deliveryFee === "number" ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{formatNaira(order.deliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatNaira(order.total)}</span>
            </div>
          </div>

          {order.notes ? (
            <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium text-foreground">Notes</p>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          ) : null}

          {order.deliveryLine1 ? (
            <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium text-foreground">Delivery address</p>
              <p className="text-muted-foreground">
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
                <p className="mt-1 text-muted-foreground">
                  Landmark: {order.deliveryLandmark}
                </p>
              ) : null}
              {order.deliveryPhone ? (
                <p className="mt-1 text-muted-foreground">
                  Phone: {order.deliveryPhone}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <Dialog
        open={Boolean(removingItemId)}
        onOpenChange={(open) => {
          if (!open) setRemovingItemId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove item?</DialogTitle>
            <DialogDescription>
              Only allowed while the order is pending. Removing the last item
              deletes the whole order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingItemId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={() => void confirmRemoveItem()}
            >
              {actionLoading ? "Removing…" : "Remove item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
