"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getTerminalCarriers,
  getTerminalPackaging,
  getTerminalStatus,
} from "@/lib/api/admin/terminal";
import { ApiError } from "@/lib/api/client";
import type {
  TerminalCarrier,
  TerminalPackaging,
  TerminalStatus,
} from "@/types/shipping";
import { cn } from "@/lib/utils";

function carrierLabel(carrier: TerminalCarrier) {
  return (
    String(carrier.name || carrier.slug || carrier.id || "Carrier").trim() ||
    "Carrier"
  );
}

function packagingLabel(item: TerminalPackaging) {
  return (
    String(item.name || item.type || item.id || "Packaging").trim() ||
    "Packaging"
  );
}

export function TerminalManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [status, setStatus] = useState<TerminalStatus | null>(null);
  const [carriers, setCarriers] = useState<TerminalCarrier[]>([]);
  const [packaging, setPackaging] = useState<TerminalPackaging[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (soft = false) => {
      const token = requireToken();
      if (!token) return;

      if (soft) setRefreshing(true);
      else setLoading(true);

      try {
        const [nextStatus, nextCarriers, nextPackaging] = await Promise.all([
          getTerminalStatus(token),
          getTerminalCarriers(token).catch(() => [] as TerminalCarrier[]),
          getTerminalPackaging(token).catch(() => [] as TerminalPackaging[]),
        ]);
        setStatus(nextStatus);
        setCarriers(nextCarriers);
        setPackaging(nextPackaging);
      } catch (error) {
        if (handleAuthError(error)) return;
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not load Terminal status",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handleAuthError, requireToken],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  const connected = Boolean(status?.configured && status?.ok);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Terminal Africa
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Live shipping rates at checkout and book shipment after payment.
            Keys live on the API server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/settings">Kitchen pickup settings</Link>
          </Button>
          <Button
            className="rounded-xl"
            disabled={refreshing}
            onClick={() => void load(true)}
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <section
        className={cn(
          "rounded-2xl border p-5 shadow-sm",
          connected
            ? "border-accent/30 bg-accent/5"
            : "border-border/80 bg-card",
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              connected
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {connected ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold">
              {connected ? "Connected" : "Not connected"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {status?.message ||
                (status?.configured
                  ? "Configured, but the health check failed."
                  : "Set TERMINAL_SECRET_KEY on the API to enable shipping.")}
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Mode</dt>
                <dd className="font-medium capitalize">
                  {status?.mode || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Base URL</dt>
                <dd className="truncate font-medium">
                  {status?.baseUrl || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Carriers sample</dt>
                <dd className="font-medium">
                  {typeof status?.carriersSample === "number"
                    ? status.carriersSample
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            <h2 className="font-heading text-base font-semibold">Carriers</h2>
          </div>
          {carriers.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No carriers returned. Check Terminal dashboard or API keys.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {carriers.map((carrier, index) => (
                <li
                  key={String(carrier.id || carrier.slug || index)}
                  className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <span className="font-medium text-foreground">
                    {carrierLabel(carrier)}
                  </span>
                  {carrier.active === false ? (
                    <span className="text-xs text-muted-foreground">
                      Inactive
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-accent">
                      Active
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            <h2 className="font-heading text-base font-semibold">Packaging</h2>
          </div>
          {packaging.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No packaging types returned from Terminal.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {packaging.map((item, index) => (
                <li
                  key={String(item.id || index)}
                  className="py-3 text-sm font-medium text-foreground first:pt-0 last:pb-0"
                >
                  {packagingLabel(item)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-sm text-muted-foreground">
        After a customer pays on WhatsApp, mark the order PAID, then use{" "}
        <strong className="font-medium text-foreground">Book shipment</strong>{" "}
        on the order detail page.
      </p>
    </div>
  );
}
