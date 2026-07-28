"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { SourcingStatusBadge } from "@/components/sourcing/sourcing-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAdminSourcingRequest,
  updateAdminSourcingRequestStatus,
} from "@/lib/api/admin/sourcing";
import { ApiError } from "@/lib/api/client";
import { openWhatsAppCheckout } from "@/lib/whatsapp-order";
import type { SourcingRequest, SourcingRequestStatus } from "@/types/sourcing";

function formatWhen(value: string) {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildAdminQuoteMessage(request: SourcingRequest) {
  const lines = (request.items || []).map((item) => {
    const qty = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : "";
    const notes = item.notes ? ` (${item.notes})` : "";
    return `- ${item.name}${qty}${notes}`;
  });

  return [
    `Hi! Re: your shopping request ${request.requestNumber}.`,
    "Here is your quote for these items:",
    ...lines,
    "",
    "Total: ₦____ (delivery included/excluded — please confirm).",
    "Reply here to confirm and we'll source within ~24 hours.",
  ].join("\n");
}

export function AdminSourcingRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { requireToken, handleAuthError } = useAdminAuth();
  const [request, setRequest] = useState<SourcingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = requireToken();
    if (!token) return;

    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const data = await getAdminSourcingRequest(token, id);
        if (controller.signal.aborted) return;
        setRequest(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (handleAuthError(error)) return;
        toast.error(
          error instanceof ApiError ? error.message : "Could not load request",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [handleAuthError, id, requireToken]);

  async function setStatus(status: SourcingRequestStatus) {
    const token = requireToken();
    if (!token || !request) return;
    setUpdating(true);
    try {
      const updated = await updateAdminSourcingRequestStatus(
        token,
        request.id,
        status,
      );
      setRequest(updated);
      toast.success(
        status === "COMPLETED" ? "Marked completed" : "Marked cancelled",
      );
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not update status",
      );
    } finally {
      setUpdating(false);
    }
  }

  function messageCustomer() {
    if (!request) return;
    const phone = request.deliveryPhone || request.customer?.phone;
    if (!phone) {
      toast.error("No customer phone on this request");
      return;
    }
    openWhatsAppCheckout(phone, buildAdminQuoteMessage(request));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" asChild>
          <Link href="/admin/sourcing-requests">Back to requests</Link>
        </Button>
      </div>
    );
  }

  const customerName = [
    request.customer?.firstName,
    request.customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  const pending = request.status === "PENDING";
  const itemCount = request.items?.length || 0;
  const customerPhone = request.deliveryPhone || request.customer?.phone;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/admin/sourcing-requests">
              <ArrowLeft className="size-4" />
              Back to requests
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {request.requestNumber}
            </h1>
            <SourcingStatusBadge status={request.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted {formatWhen(request.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {customerPhone ? (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={messageCustomer}
            >
              <MessageCircle className="size-4" />
              Quote on WhatsApp
            </Button>
          ) : null}
          {pending ? (
            <>
              <Button
                className="rounded-xl"
                disabled={updating}
                onClick={() => void setStatus("COMPLETED")}
              >
                {updating ? <Loader2 className="size-4 animate-spin" /> : null}
                Mark completed
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={updating}
                onClick={() => void setStatus("CANCELLED")}
              >
                Mark cancelled
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 lg:col-span-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Customer
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">
                {customerName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-foreground">
                {request.customer?.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="text-foreground">
                {request.customer?.phone || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Items
            </h2>
            <p className="text-xs text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"} · no prices online
            </p>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {(request.items || []).map((item, index) => (
              <li
                key={item.id || `${item.name}-${index}`}
                className="flex flex-col gap-0.5 py-3 first:pt-1 last:pb-1"
              >
                <p className="font-medium text-foreground">
                  {item.quantity ? `${item.quantity}× ` : ""}
                  {item.name}
                </p>
                {item.notes ? (
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {item.notes}
                  </p>
                ) : null}
              </li>
            ))}
            {!itemCount ? (
              <li className="py-6 text-sm text-muted-foreground">No items</li>
            ) : null}
          </ul>

          {request.notes ? (
            <div className="mt-4 rounded-xl bg-muted/50 px-3.5 py-3 text-sm">
              <p className="font-medium text-foreground">Customer notes</p>
              <p className="mt-1 text-muted-foreground">{request.notes}</p>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl bg-muted/50 px-3.5 py-3 text-sm">
            <p className="font-medium text-foreground">Delivery</p>
            <p className="mt-1 text-muted-foreground">
              {[
                request.deliveryLine1,
                request.deliveryLine2,
                request.deliveryCity,
                request.deliveryState,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
            {request.deliveryLandmark ? (
              <p className="mt-1 text-muted-foreground">
                Landmark: {request.deliveryLandmark}
              </p>
            ) : null}
            {request.deliveryPhone ? (
              <p className="mt-1 text-muted-foreground">
                Phone: {request.deliveryPhone}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
