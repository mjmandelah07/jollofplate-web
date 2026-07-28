"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SourcingStatusBadge } from "@/components/sourcing/sourcing-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cancelMySourcingRequest,
  getMySourcingRequest,
} from "@/lib/api/sourcing";
import { getSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/client";
import { clearCustomerSession, getCustomerToken } from "@/lib/auth/storage";
import { openSourcingWhatsApp } from "@/lib/whatsapp-sourcing";
import type { SourcingRequest } from "@/types/sourcing";

function formatAddress(request: SourcingRequest) {
  return [
    request.deliveryLine1,
    request.deliveryLine2,
    request.deliveryCity,
    request.deliveryState,
    request.deliveryLandmark,
    request.deliveryPhone,
  ]
    .filter(Boolean)
    .join(", ");
}

export function CustomerSourcingRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<SourcingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [whatsapp, setWhatsapp] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  );

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.replace(`/login?next=/sourcing-requests/${id}`);
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const [data, settings] = await Promise.all([
          getMySourcingRequest(token, id),
          getSettings().catch(() => null),
        ]);
        setRequest(data);
        setWhatsapp(
          data.checkout?.whatsappNumber ||
            settings?.whatsappNumber ||
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
            "",
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearCustomerSession();
          router.replace(`/login?next=/sourcing-requests/${id}`);
          return;
        }
        toast.error(
          error instanceof ApiError ? error.message : "Could not load request",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  async function onCancel() {
    const token = getCustomerToken();
    if (!token || !request) return;
    setCancelling(true);
    try {
      const updated = await cancelMySourcingRequest(token, request.id);
      setRequest(updated);
      toast.success("Request cancelled");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not cancel request",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  if (!request) {
    return (
      <Card className="rounded-2xl border-dashed py-0">
        <CardContent className="px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">Request not found.</p>
          <Button className="mt-4 rounded-xl" asChild>
            <Link href="/sourcing-requests">Back</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const address = formatAddress(request);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2 rounded-lg" asChild>
        <Link href="/sourcing-requests">
          <ArrowLeft className="size-4" />
          All requests
        </Link>
      </Button>

      <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-bold">
                {request.requestNumber}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleString("en-NG")}
              </p>
            </div>
            <SourcingStatusBadge status={request.status} />
          </div>

          <div>
            <h2 className="text-sm font-semibold">Items</h2>
            <ul className="mt-2 space-y-2">
              {request.items?.map((item, index) => (
                <li
                  key={item.id || `${item.name}-${index}`}
                  className="rounded-xl bg-muted/40 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  {item.quantity ? (
                    <span className="text-muted-foreground">
                      {" "}
                      ×{item.quantity}
                    </span>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.notes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {address ? (
            <div>
              <h2 className="text-sm font-semibold">Delivery</h2>
              <p className="mt-1 text-sm text-muted-foreground">{address}</p>
            </div>
          ) : null}

          {request.notes ? (
            <div>
              <h2 className="text-sm font-semibold">Notes</h2>
              <p className="mt-1 text-sm text-muted-foreground">{request.notes}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            {whatsapp && request.status === "PENDING" ? (
              <Button
                className="rounded-xl"
                onClick={() => openSourcingWhatsApp(whatsapp, request)}
              >
                <MessageCircle className="size-4" />
                Open WhatsApp
              </Button>
            ) : null}
            {request.status === "PENDING" ? (
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={cancelling}
                onClick={() => void onCancel()}
              >
                {cancelling ? "Cancelling…" : "Cancel request"}
              </Button>
            ) : null}
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href="/custom-shopping">Shop again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
