"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Package,
  PackageSearch,
  Search,
} from "lucide-react";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { SourcingStatusBadge } from "@/components/sourcing/sourcing-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getAdminSourcingRequests } from "@/lib/api/admin/sourcing";
import { ApiError } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type { SourcingRequest, SourcingRequestStatus } from "@/types/sourcing";
import { cn } from "@/lib/utils";

const tabs: Array<{ id: "ALL" | SourcingRequestStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function formatDate(value: string) {
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

function customerLabel(request: SourcingRequest) {
  const name = [request.customer?.firstName, request.customer?.lastName]
    .filter(Boolean)
    .join(" ");
  return {
    name: name || "Customer",
    detail: request.customer?.email || request.customer?.phone || "",
  };
}

function itemPreview(request: SourcingRequest) {
  const items = request.items || [];
  if (!items.length) return "No items";
  const names = items.slice(0, 2).map((item) => item.name);
  const rest = items.length - names.length;
  return `${names.join(", ")}${rest > 0 ? ` +${rest} more` : ""}`;
}

export function AdminSourcingRequestsManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [items, setItems] = useState<SourcingRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | SourcingRequestStatus>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const isFiltered = Boolean(debouncedSearch.trim()) || tab !== "ALL";

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tab]);

  useEffect(() => {
    const token = requireToken();
    if (!token) return;

    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const data = await getAdminSourcingRequests(token, {
          search: debouncedSearch || undefined,
          status: tab === "ALL" ? undefined : tab,
          page,
          limit: ADMIN_PAGE_SIZE,
          signal: controller.signal,
        });
        setItems(data.items);
        setMeta(data.meta);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (handleAuthError(error)) return;
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not load sourcing requests",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedSearch, handleAuthError, page, requireToken, tab]);

  function selectTab(next: "ALL" | SourcingRequestStatus) {
    setTab(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Shopping requests
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Customer sourcing lists — quote and confirm on WhatsApp. No prices
            online.
          </p>
        </div>
        <Button variant="outline" className="h-10 shrink-0 rounded-xl" asChild>
          <Link href="/admin/sourcing-items">Manage catalog</Link>
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 py-0 shadow-sm">
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search request number or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl pl-9"
              aria-label="Search shopping requests"
            />
          </div>
          <div
            className="grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1"
            aria-label="Filter by status"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                className={cn(
                  "rounded-lg px-1.5 py-2.5 text-center text-xs font-semibold transition-all sm:px-3 sm:text-sm",
                  tab === item.id
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => selectTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/80 bg-card/60 py-0 shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PackageSearch className="size-6" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
              {isFiltered ? "No matching requests" : "No shopping requests yet"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {isFiltered
                ? "Try another search or choose a different status."
                : "When customers submit custom shopping lists from the site, they appear here so you can quote on WhatsApp."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {isFiltered ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setSearch("");
                    setTab("ALL");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button className="rounded-xl" asChild>
                  <Link href="/admin/sourcing-items">
                    <Package className="size-4" />
                    Set up catalog first
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((request) => {
            const customer = customerLabel(request);
            const count = request.items?.length || 0;

            return (
              <Link
                key={request.id}
                href={`/admin/sourcing-requests/${request.id}`}
                className="group block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 py-0 shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-card">
                  <CardContent className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                            {request.requestNumber}
                          </h2>
                          <SourcingStatusBadge status={request.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary sm:text-sm">
                        View
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted/50 px-3 py-2.5 sm:px-3.5 sm:py-3">
                      <p className="text-sm font-medium text-foreground">
                        {customer.name}
                        {customer.detail ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {customer.detail}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="text-foreground/80">
                          {count} item{count === 1 ? "" : "s"}
                        </span>
                        {" · "}
                        {itemPreview(request)}
                      </p>
                      {request.deliveryCity ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Deliver to {request.deliveryCity}
                          {request.deliveryState
                            ? `, ${request.deliveryState}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
