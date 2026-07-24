"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { getCustomerToken } from "@/lib/auth/storage";
import {
  clearCart,
  getCartNotes,
  lineKey,
  removeCartLine,
  saveCartNotes,
  updateCartLineQuantity,
} from "@/lib/cart";
import { formatNaira } from "@/lib/format";

export function CartManager({ deliveryFee = 0 }: { deliveryFee?: number }) {
  const router = useRouter();
  const { lines, ready, subtotal } = useCart();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(getCartNotes());
  }, []);

  function onNotesChange(value: string) {
    setNotes(value);
    saveCartNotes(value);
  }

  function handleCheckout() {
    saveCartNotes(notes);
    if (!getCustomerToken()) {
      router.push("/login?next=/checkout");
      return;
    }
    router.push("/checkout");
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the menu and add a plate to get started.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  const estimatedTotal = subtotal + Math.max(0, deliveryFee);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div className="space-y-3">
        {lines.map((line) => {
          const key = lineKey(line);
          return (
            <article
              key={key}
              className="flex gap-3 rounded-3xl border border-border/80 bg-card p-3 shadow-[0_16px_40px_-36px_rgba(34,34,34,0.45)] sm:gap-4 sm:p-4"
            >
              <Link
                href={`/menu/${line.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:size-24"
              >
                {line.image ? (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] font-semibold text-primary">
                    JP
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/menu/${line.slug}`}
                      className="font-heading text-base font-semibold text-foreground hover:text-primary"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatNaira(line.unitPrice)}
                      {line.originalPrice > line.unitPrice ? (
                        <span className="ml-2 line-through">
                          {formatNaira(line.originalPrice)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => removeCartLine(key)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {line.extras.length > 0 ? (
                  <ul className="mt-2 space-y-0.5">
                    {line.extras.map((extra) => (
                      <li
                        key={`${extra.name}-${extra.price}`}
                        className="text-xs text-muted-foreground"
                      >
                        + {extra.name} ({formatNaira(extra.price)})
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-2xl border border-border bg-background p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      className="rounded-xl"
                      onClick={() =>
                        updateCartLineQuantity(key, line.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      className="rounded-xl"
                      onClick={() =>
                        updateCartLineQuantity(key, line.quantity + 1)
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <p className="font-heading text-base font-bold text-primary">
                    {formatNaira(line.lineTotal)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => clearCart()}
          className="text-sm text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
        >
          Clear cart
        </button>
      </div>

      <aside className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)] lg:sticky lg:top-24">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Order summary
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatNaira(subtotal)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Est. delivery</span>
            <span className="font-medium text-foreground">
              {formatNaira(Math.max(0, deliveryFee))}
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3">
            <span className="font-heading font-semibold text-foreground">
              Estimated total
            </span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatNaira(estimatedTotal)}
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Final delivery fee is confirmed when you place the order.
        </p>

        <div className="mt-5 space-y-2">
          <label
            htmlFor="cart-notes"
            className="text-sm font-medium text-foreground"
          >
            Order notes{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="cart-notes"
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Extra spicy, no onions, call on arrival…"
          />
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-5 h-14 w-full rounded-2xl text-base font-semibold"
          onClick={handleCheckout}
        >
          Checkout
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-2 h-12 w-full rounded-2xl"
          asChild
        >
          <Link href="/menu">Continue shopping</Link>
        </Button>
      </aside>
    </div>
  );
}
