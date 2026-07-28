"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getTerminalCarriers,
  getTerminalPackaging,
  getTerminalStatus,
} from "@/lib/api/admin/terminal";
import { ApiError } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type {
  TerminalCarrier,
  TerminalPackaging,
  TerminalStatus,
} from "@/types/shipping";
import { cn } from "@/lib/utils";

function servesNigeria(carrier: TerminalCarrier) {
  const pools = [
    carrier.available_countries,
    carrier.available_countries_local,
  ];
  return pools.some((list) => Array.isArray(list) && list.includes("NG"));
}

function packagingSize(item: TerminalPackaging) {
  if (
    typeof item.length !== "number" ||
    typeof item.width !== "number" ||
    typeof item.height !== "number"
  ) {
    return null;
  }
  const unit = item.size_unit || "cm";
  return `${item.length}×${item.width}×${item.height} ${unit}`;
}

function showPagination(meta: PaginationMeta | null) {
  if (!meta) return false;
  return meta.totalPages > 1 || meta.total > meta.limit;
}

export function TerminalManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [status, setStatus] = useState<TerminalStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [carriers, setCarriers] = useState<TerminalCarrier[]>([]);
  const [carriersMeta, setCarriersMeta] = useState<PaginationMeta | null>(null);
  const [carriersPage, setCarriersPage] = useState(1);
  const [carriersLoading, setCarriersLoading] = useState(true);

  const [packaging, setPackaging] = useState<TerminalPackaging[]>([]);
  const [packagingMeta, setPackagingMeta] = useState<PaginationMeta | null>(
    null,
  );
  const [packagingPage, setPackagingPage] = useState(1);
  const [packagingLoading, setPackagingLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const sortedCarriers = useMemo(() => {
    return [...carriers].sort((a, b) => {
      const aNg = servesNigeria(a) ? 0 : 1;
      const bNg = servesNigeria(b) ? 0 : 1;
      if (aNg !== bNg) return aNg - bNg;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [carriers]);

  const loadStatus = useCallback(async () => {
    const token = requireToken();
    if (!token) return;
    try {
      setStatus(await getTerminalStatus(token));
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not load Terminal status",
      );
    } finally {
      setStatusLoading(false);
    }
  }, [handleAuthError, requireToken]);

  const loadCarriers = useCallback(async () => {
    const token = requireToken();
    if (!token) return;
    setCarriersLoading(true);
    try {
      const result = await getTerminalCarriers(token, {
        page: carriersPage,
        limit: ADMIN_PAGE_SIZE,
      });
      setCarriers(result.items);
      setCarriersMeta(result.meta);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not load carriers",
      );
    } finally {
      setCarriersLoading(false);
    }
  }, [carriersPage, handleAuthError, requireToken]);

  const loadPackaging = useCallback(async () => {
    const token = requireToken();
    if (!token) return;
    setPackagingLoading(true);
    try {
      const result = await getTerminalPackaging(token, {
        page: packagingPage,
        limit: ADMIN_PAGE_SIZE,
      });
      setPackaging(result.items);
      setPackagingMeta(result.meta);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not load packaging",
      );
    } finally {
      setPackagingLoading(false);
    }
  }, [handleAuthError, packagingPage, requireToken]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void loadCarriers();
  }, [loadCarriers]);

  useEffect(() => {
    void loadPackaging();
  }, [loadPackaging]);

  async function refreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([loadStatus(), loadCarriers(), loadPackaging()]);
    } finally {
      setRefreshing(false);
    }
  }

  function copyId(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success("Copied packaging ID");
  }

  if (statusLoading && carriersLoading && packagingLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
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
            Live rates at checkout. Copy packaging IDs into Settings → Delivery
            tiers, then book shipment after payment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/settings?tab=delivery">Packaging tiers</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/settings?tab=pickup">Kitchen pickup</Link>
          </Button>
          <Button
            className="rounded-xl"
            disabled={refreshing}
            onClick={() => void refreshAll()}
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
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-semibold">
              {connected ? "Connected" : "Not connected"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {status?.message ||
                (status?.configured
                  ? "Configured, but the health check failed."
                  : "Set TERMINAL_SECRET_KEY on the API to enable shipping.")}
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Mode</dt>
                <dd className="font-medium capitalize">
                  {status?.mode || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Public key</dt>
                <dd className="truncate font-medium">
                  {status?.publicKeyPrefix || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Base URL</dt>
                <dd className="truncate font-medium">
                  {status?.baseUrl || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Carriers</dt>
                <dd className="font-medium">
                  {carriersMeta?.total ?? status?.carriersSample ?? "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              <h2 className="font-heading text-base font-semibold">Carriers</h2>
            </div>
            {carriersLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-xs text-muted-foreground">
                {carriersMeta
                  ? `${carriersMeta.total} total`
                  : `${carriers.length} shown`}
              </span>
            )}
          </div>

          <div
            className={cn(
              "min-h-72 flex-1 px-5 py-2 transition-opacity",
              carriersLoading && carriers.length > 0 ? "opacity-50" : "",
            )}
          >
            {carriersLoading && carriers.length === 0 ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : sortedCarriers.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No carriers on this page.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {sortedCarriers.map((carrier, index) => {
                  const ng = servesNigeria(carrier);
                  return (
                    <li
                      key={String(
                        carrier.carrier_id || carrier.slug || index,
                      )}
                      className="flex items-center gap-3 py-3"
                    >
                      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                        {carrier.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={carrier.logo}
                            alt=""
                            className="size-full object-contain p-1.5"
                          />
                        ) : (
                          <Truck className="size-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">
                          {carrier.name || carrier.slug || "Carrier"}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                          {ng ? <span>NG</span> : null}
                          {carrier.domestic ? <span>Domestic</span> : null}
                          {carrier.international ? (
                            <span>International</span>
                          ) : null}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          carrier.active === false
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent/15 text-accent",
                        )}
                      >
                        {carrier.active === false ? "Inactive" : "Active"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {showPagination(carriersMeta) && carriersMeta ? (
            <div className="border-t border-border/70 px-3 py-3">
              <AdminPagination
                meta={carriersMeta}
                onPageChange={setCarriersPage}
                className="border-0 bg-transparent px-1 py-0 shadow-none"
              />
            </div>
          ) : null}
        </section>

        <section className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              <h2 className="font-heading text-base font-semibold">Packaging</h2>
            </div>
            {packagingLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-xs text-muted-foreground">
                {packagingMeta
                  ? `${packagingMeta.total} total`
                  : `${packaging.length} shown`}
              </span>
            )}
          </div>

          <div
            className={cn(
              "min-h-72 flex-1 px-5 py-2 transition-opacity",
              packagingLoading && packaging.length > 0 ? "opacity-50" : "",
            )}
          >
            {packagingLoading && packaging.length === 0 ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : packaging.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No packaging on this page. Create boxes in Terminal, then
                refresh.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {packaging.map((item, index) => {
                  const size = packagingSize(item);
                  const id = item.packaging_id || item.id || "";
                  return (
                    <li
                      key={String(item.packaging_id || item.id || index)}
                      className="flex items-start justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.name || item.type || "Packaging"}
                          {item.default ? (
                            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                              Default
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                          {id || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[
                            item.type,
                            size,
                            typeof item.weight === "number"
                              ? `${item.weight} ${item.weight_unit || "kg"}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {id ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="shrink-0 rounded-lg"
                          onClick={() => copyId(id)}
                        >
                          <Copy className="size-3.5" />
                          Copy
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {showPagination(packagingMeta) && packagingMeta ? (
            <div className="border-t border-border/70 px-3 py-3">
              <AdminPagination
                meta={packagingMeta}
                onPageChange={setPackagingPage}
                className="border-0 bg-transparent px-1 py-0 shadow-none"
              />
            </div>
          ) : null}
        </section>
      </div>

      <p className="text-sm text-muted-foreground">
        Flow: customer picks a live rate → WhatsApp pay → mark order PAID →{" "}
        <strong className="font-medium text-foreground">Book shipment</strong>.
      </p>
    </div>
  );
}
