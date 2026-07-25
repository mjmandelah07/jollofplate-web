"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CheckoutDeliverySection } from "@/components/checkout/checkout-delivery-section";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { createOrder, type CreatedOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import {
  clearCustomerSession,
  getCustomerToken,
  getCustomerUser,
} from "@/lib/auth/storage";
import {
  clearCart,
  clearCartNotes,
  DEFAULT_DELIVERY_ADDRESS,
  getCartNotes,
  getSavedDeliveryAddress,
  saveCartNotes,
  saveDeliveryAddress,
} from "@/lib/cart";
import { formatNaira, toNigeriaLocalPhone } from "@/lib/format";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp-order";
import type { DeliveryAddressInput } from "@/types/admin";

const PLACED_ORDER_KEY = "jollofplate.lastPlacedOrder";

type StoredPlacedOrder = {
  order: CreatedOrder;
  whatsappNumber: string;
};

type CustomerProfile = {
  phone?: string | null;
};

function readPlacedOrder(): StoredPlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLACED_ORDER_KEY);
    return raw ? (JSON.parse(raw) as StoredPlacedOrder) : null;
  } catch {
    return null;
  }
}

function formatPlacedAddress(order: CreatedOrder) {
  return [
    order.deliveryLine1,
    order.deliveryLine2,
    order.deliveryCity,
    order.deliveryState,
    order.deliveryLandmark ? `Near ${order.deliveryLandmark}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

export function CheckoutManager({
  deliveryFee = 0,
  fallbackWhatsappNumber = "",
}: {
  deliveryFee?: number;
  fallbackWhatsappNumber?: string;
}) {
  const router = useRouter();
  const { lines, ready, subtotal } = useCart();
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState<DeliveryAddressInput>({
    ...DEFAULT_DELIVERY_ADDRESS,
  });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<StoredPlacedOrder | null>(null);

  useEffect(() => {
    setNotes(getCartNotes());
    const saved = getSavedDeliveryAddress();
    const profile = getCustomerUser<CustomerProfile>();
    setAddress({
      ...saved,
      phone: saved.phone || profile?.phone || "",
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (lines.length > 0) {
      sessionStorage.removeItem(PLACED_ORDER_KEY);
      setPlaced(null);
      return;
    }
    setPlaced(readPlacedOrder());
  }, [lines.length, ready]);

  const estimatedTotal = subtotal + Math.max(0, deliveryFee);
  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  function updateAddress(next: DeliveryAddressInput) {
    setAddress(next);
    saveDeliveryAddress(next);
  }

  function validateAddress() {
    if (address.line1.trim().length < 3) {
      toast.error("Enter a street address (at least 3 characters)");
      return false;
    }
    if (!address.city.trim()) {
      toast.error("Enter a city");
      return false;
    }
    return true;
  }

  async function placeOrder() {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/checkout");
      return;
    }
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validateAddress()) return;

    const deliveryAddress: DeliveryAddressInput = {
      line1: address.line1.trim(),
      city: address.city.trim(),
      ...(address.line2?.trim() ? { line2: address.line2.trim() } : {}),
      ...(address.state?.trim() ? { state: address.state.trim() } : {}),
      ...(address.landmark?.trim()
        ? { landmark: address.landmark.trim() }
        : {}),
      ...(address.phone?.trim()
        ? { phone: toNigeriaLocalPhone(address.phone) }
        : {}),
    };

    // Open during the click gesture so browsers do not block WhatsApp later.
    const whatsappWindow = window.open("", "_blank");
    setPlacing(true);

    try {
      const order = await createOrder(token, {
        items: lines.map((line) => ({
          mealId: line.mealId,
          quantity: line.quantity,
          ...(line.extras.length ? { extras: line.extras } : {}),
        })),
        deliveryAddress,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      const whatsappNumber =
        order.checkout?.whatsappNumber || fallbackWhatsappNumber;
      const result = { order, whatsappNumber };

      sessionStorage.setItem(PLACED_ORDER_KEY, JSON.stringify(result));
      clearCart();
      clearCartNotes();
      setPlaced(result);

      if (whatsappNumber) {
        const url = buildWhatsAppUrl(
          whatsappNumber,
          buildWhatsAppMessage(order),
        );
        if (whatsappWindow) {
          whatsappWindow.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } else {
        whatsappWindow?.close();
        toast.warning("Order placed, but the WhatsApp number is unavailable");
      }
    } catch (error) {
      whatsappWindow?.close();
      if (error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
        router.replace("/login?next=/checkout");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not place order",
      );
    } finally {
      setPlacing(false);
    }
  }

  function reopenWhatsApp() {
    if (!placed?.whatsappNumber) {
      toast.error("WhatsApp number is not available");
      return;
    }
    window.open(
      buildWhatsAppUrl(
        placed.whatsappNumber,
        buildWhatsAppMessage(placed.order),
      ),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function startAnotherOrder() {
    sessionStorage.removeItem(PLACED_ORDER_KEY);
    setPlaced(null);
    router.push("/menu");
  }

  if (!ready) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (placed) {
    const { order } = placed;
    const deliveredTo = formatPlacedAddress(order);
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-card p-6 text-center shadow-[0_24px_70px_-45px_rgba(34,34,34,0.5)] sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="size-8" />
        </div>
        <p className="mt-5 text-xs font-semibold tracking-wide text-primary uppercase">
          Order placed
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">
          {order.orderNumber}
        </h1>
        <div className="mt-3 flex justify-center">
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Your order is pending payment. Continue in WhatsApp to arrange
          payment with JollofPlate.
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-muted/50 p-4 text-left">
          {deliveredTo ? (
            <div className="mb-3 border-b border-border pb-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Deliver to
              </p>
              <p className="mt-1 text-sm text-foreground">{deliveredTo}</p>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium">{order.items.length}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3 border-t border-border pt-3">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading text-xl font-bold text-primary">
              {formatNaira(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            className="h-12 rounded-2xl"
            onClick={reopenWhatsApp}
          >
            <MessageCircle className="size-4" />
            Open WhatsApp again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-2xl"
            asChild
          >
            <Link href={`/orders/${order.id}`}>View order</Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={startAnotherOrder}
          className="mt-5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          Back to menu
        </button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Nothing to checkout
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a meal to your cart before placing an order.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">Your order</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {itemCount} plate{itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">Edit cart</Link>
            </Button>
          </div>

          <ul className="mt-5 divide-y divide-border/80">
            {lines.map((line) => (
              <li
                key={`${line.mealId}-${line.extras
                  .map((extra) => extra.name)
                  .join("-")}`}
                className="flex gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-medium text-foreground">
                      {line.quantity}× {line.name}
                    </p>
                    <p className="shrink-0 font-heading font-semibold text-primary">
                      {formatNaira(line.lineTotal)}
                    </p>
                  </div>
                  {line.extras.length ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Extras:{" "}
                      {line.extras.map((extra) => extra.name).join(", ")}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <CheckoutDeliverySection
          address={address}
          onAddressChange={updateAddress}
          disabled={placing}
        />

        <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
          <div className="space-y-2">
            <label htmlFor="checkout-notes" className="text-sm font-medium">
              Order notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              id="checkout-notes"
              rows={3}
              value={notes}
              disabled={placing}
              onChange={(event) => {
                setNotes(event.target.value);
                saveCartNotes(event.target.value);
              }}
              placeholder="Extra spicy, no onions, call on arrival…"
            />
          </div>
        </section>
      </div>

      <aside className="rounded-3xl border border-border/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_8%,var(--card))_0%,var(--card)_100%)] p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)] lg:sticky lg:top-24">
        <h2 className="font-heading text-lg font-semibold">Payment summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatNaira(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">
              {formatNaira(Math.max(0, deliveryFee))}
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-4">
            <span className="font-heading font-semibold">Estimated total</span>
            <span className="font-heading text-2xl font-bold text-primary">
              {formatNaira(estimatedTotal)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The server confirms current prices and delivery fee when your order
          is placed.
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-6 h-14 w-full rounded-2xl text-base font-semibold"
          disabled={placing}
          onClick={() => void placeOrder()}
        >
          {placing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              <MessageCircle className="size-4" />
              Place order & open WhatsApp
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          You’ll confirm payment directly with JollofPlate on WhatsApp.
        </p>
      </aside>
    </div>
  );
}
