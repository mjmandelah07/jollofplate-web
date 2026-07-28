"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, PackageSearch, Search } from "lucide-react";
import { SourcingStatusBadge } from "@/components/sourcing/sourcing-status-badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getMySourcingRequests } from "@/lib/api/sourcing";
import { ApiError } from "@/lib/api/client";
import { clearCustomerSession, getCustomerToken } from "@/lib/auth/storage";
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
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CustomerSourcingRequestsManager() {
  const router = useRouter();
  const [items, setItems] = useState<SourcingRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | SourcingRequestStatus>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/sourcing-requests");
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const data = await getMySourcingRequests(token, {
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
        if (error instanceof ApiError && error.status === 401) {
          clearCustomerSession();
          router.replace("/login?next=/sourcing-requests");
          return;
        }
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not load shopping requests",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedSearch, page, router, tab]);

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
        <CardContent className="space-y-3 p-3 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search request number…"
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                className={cn(
                  "rounded-lg px-1.5 py-2.5 text-xs font-semibold sm:text-sm",
                  tab === item.id
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                    : "text-muted-foreground",
                )}
                onClick={() => {
                  setTab(item.id);
                  setPage(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-0">
          <CardContent className="px-5 py-14 text-center">
            <PackageSearch className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No shopping requests yet.
            </p>
            <Button className="mt-4 rounded-xl" asChild>
              <Link href="/custom-shopping">Start a list</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((request) => (
            <Link
              key={request.id}
              href={`/sourcing-requests/${request.id}`}
              className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm transition-colors hover:border-primary/30">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-base font-bold">
                        {request.requestNumber}
                      </h2>
                      <SourcingStatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(request.createdAt)} ·{" "}
                      {request.items?.length || 0} item
                      {(request.items?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-primary" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
