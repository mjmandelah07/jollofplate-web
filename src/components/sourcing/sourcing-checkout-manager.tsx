"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { CheckoutDeliverySection } from "@/components/checkout/checkout-delivery-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSourcingRequest } from "@/lib/api/sourcing";
import { ApiError } from "@/lib/api/client";
import { getCustomerToken } from "@/lib/auth/storage";
import {
  DEFAULT_DELIVERY_ADDRESS,
  getSavedDeliveryAddress,
} from "@/lib/cart";
import { toNigeriaE164Phone } from "@/lib/format";
import {
  clearSourcingCart,
  clearSourcingNotes,
  getSourcingCart,
  getSourcingNotes,
  saveSourcingNotes,
  sourcingCartToRequestItems,
  type SourcingCartLine,
} from "@/lib/sourcing-cart";
import {
  buildSourcingWhatsAppUrl,
  openSourcingWhatsApp,
} from "@/lib/whatsapp-sourcing";
import type { DeliveryAddressInput } from "@/types/admin";
import type { SourcingRequest } from "@/types/sourcing";

export function SourcingCheckoutManager() {
  const router = useRouter();
  const [cart, setCart] = useState<SourcingCartLine[]>([]);
  const [address, setAddress] = useState<DeliveryAddressInput>(
    DEFAULT_DELIVERY_ADDRESS,
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<SourcingRequest | null>(null);

  useEffect(() => {
    setCart(getSourcingCart());
    setNotes(getSourcingNotes());
    setAddress(getSavedDeliveryAddress());
  }, []);

  async function submit() {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/custom-shopping/checkout");
      return;
    }

    if (cart.length === 0) {
      toast.error("Add at least one item to your list");
      return;
    }

    if (!address.line1.trim() || address.line1.trim().length < 3) {
      toast.error("Enter a delivery street address");
      return;
    }
    if (!address.city.trim()) {
      toast.error("Enter a delivery city");
      return;
    }

    setSubmitting(true);
    const whatsappWindow = window.open("", "_blank");

    try {
      const request = await createSourcingRequest(token, {
        items: sourcingCartToRequestItems(cart),
        deliveryAddress: {
          line1: address.line1.trim(),
          line2: address.line2?.trim() || undefined,
          city: address.city.trim(),
          state: address.state?.trim() || undefined,
          landmark: address.landmark?.trim() || undefined,
          phone: address.phone?.trim()
            ? toNigeriaE164Phone(address.phone)
            : undefined,
        },
        notes: notes.trim() || undefined,
      });

      clearSourcingCart();
      clearSourcingNotes();
      setCart([]);
      setPlaced(request);

      const phone =
        request.checkout?.whatsappNumber ||
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
        "";

      if (phone) {
        const url = buildSourcingWhatsAppUrl(phone, request);
        if (whatsappWindow) whatsappWindow.location.href = url;
        else openSourcingWhatsApp(phone, request);
      } else {
        whatsappWindow?.close();
        toast.warning("Request submitted, but WhatsApp number is unavailable");
      }

      toast.success(`Request ${request.requestNumber} submitted`);
    } catch (error) {
      whatsappWindow?.close();
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login?next=/custom-shopping/checkout");
        return;
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not submit shopping request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    const phone =
      placed.checkout?.whatsappNumber ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      "";

    return (
      <Card className="mx-auto max-w-lg gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
            Request submitted
          </p>
          <h2 className="font-heading text-2xl font-bold">{placed.requestNumber}</h2>
          <p className="text-sm text-muted-foreground">
            We’ll confirm availability and price on WhatsApp. Aim ~24 hours for
            delivery once quoted.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {phone ? (
              <Button
                className="rounded-xl"
                onClick={() => openSourcingWhatsApp(phone, placed)}
              >
                <MessageCircle className="size-4" />
                Open WhatsApp again
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={`/sourcing-requests/${placed.id}`}>View request</Link>
            </Button>
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href="/custom-shopping">Back to shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cart.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed py-0">
        <CardContent className="px-5 py-14 text-center">
          <p className="text-sm text-muted-foreground">Your list is empty.</p>
          <Button className="mt-4 rounded-xl" asChild>
            <Link href="/custom-shopping">
              <ArrowLeft className="size-4" />
              Browse items
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-3 p-4 sm:p-5">
            <h2 className="font-heading text-base font-semibold">Your list</h2>
            <ul className="space-y-2">
              {cart.map((line) => (
                <li
                  key={line.key}
                  className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{line.name}</p>
                    {line.notes ? (
                      <p className="text-xs text-muted-foreground">{line.notes}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    ×{line.quantity}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href="/custom-shopping">Edit list</Link>
            </Button>
          </CardContent>
        </Card>

        <CheckoutDeliverySection
          address={address}
          onAddressChange={setAddress}
          disabled={submitting}
        />

        <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-2 p-4 sm:p-5">
            <Label htmlFor="sourcing-notes">Notes (optional)</Label>
            <Textarea
              id="sourcing-notes"
              value={notes}
              disabled={submitting}
              placeholder="Please deliver within 24 hours if possible"
              className="min-h-24 rounded-xl"
              onChange={(e) => {
                setNotes(e.target.value);
                saveSourcingNotes(e.target.value);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="space-y-3 p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
              No prices online. We’ll confirm availability and quote on
              WhatsApp.
            </p>
            <Button
              className="w-full rounded-xl"
              disabled={submitting}
              onClick={() => void submit()}
            >
              <MessageCircle className="size-4" />
              {submitting ? "Submitting…" : "Submit & open WhatsApp"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
