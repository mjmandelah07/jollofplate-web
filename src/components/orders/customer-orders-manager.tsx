"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  MapPin,
  PackageSearch,
  Search,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getMyOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { clearCustomerSession, getCustomerToken } from "@/lib/auth/storage";
import { formatNaira } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/admin";
import type { PaginationMeta } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tabs: Array<{ id: "ALL" | OrderStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Paid" },
  { id: "CANCELLED", label: "Cancelled" },
];

function formatOrderDate(value: string) {
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

function orderItemSummary(order: Order) {
  if (!order.items?.length) return "Order items";

  const names = order.items.slice(0, 2).map((item) => item.name);
  const remaining = order.items.length - names.length;
  return `${names.join(", ")}${remaining > 0 ? ` +${remaining} more` : ""}`;
}

function orderPlateCount(order: Order) {
  return order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

function orderAddress(order: Order) {
  return [order.deliveryLine1, order.deliveryCity, order.deliveryState]
    .filter(Boolean)
    .join(", ");
}

export function CustomerOrdersManager() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | OrderStatus>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/orders");
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const data = await getMyOrders(token, {
          search: debouncedSearch || undefined,
          status: tab === "ALL" ? undefined : tab,
          page,
          limit: ADMIN_PAGE_SIZE,
          signal: controller.signal,
        });
        setOrders(data.items);
        setMeta(data.meta);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          clearCustomerSession();
          router.replace("/login?next=/orders");
          return;
        }
        toast.error(
          error instanceof ApiError ? error.message : "Could not load orders",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [debouncedSearch, page, router, tab]);

  function selectTab(next: "ALL" | OrderStatus) {
    setTab(next);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
        <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search order number…"
              aria-label="Search orders"
              className="h-11 rounded-xl bg-background pl-9 text-base sm:text-sm"
            />
          </div>

          <div
            className="grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1"
            aria-label="Filter orders by status"
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
                    : "text-muted-foreground",
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
        <div className="grid gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl sm:h-44" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="rounded-2xl border-dashed bg-card/70 py-0 shadow-none">
          <CardContent className="px-5 py-14 text-center sm:px-6 sm:py-20">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PackageSearch className="size-6" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
              {debouncedSearch || tab !== "ALL"
                ? "No matching orders"
                : "Your order history is empty"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {debouncedSearch || tab !== "ALL"
                ? "Try a different search or choose another status."
                : "Once you place an order, you can track payment and delivery here."}
            </p>
            <Button className="mt-6 h-11 w-full rounded-xl sm:w-auto" asChild>
              <Link href="/menu">Browse the menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {orders.map((order) => {
            const address = orderAddress(order);
            const plates = orderPlateCount(order);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
              >
                <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-card">
                  <CardContent className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="min-w-0 truncate font-heading text-[15px] font-bold tracking-tight text-foreground sm:text-lg">
                            {order.orderNumber}
                          </h2>
                          <div className="shrink-0">
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-heading text-base font-bold text-primary sm:text-xl">
                          {formatNaira(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl bg-muted/50 px-3 py-2.5 sm:px-3.5 sm:py-3">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">
                          {plates} plate{plates === 1 ? "" : "s"} ·{" "}
                        </span>
                        <span className="line-clamp-1">
                          {orderItemSummary(order)}
                        </span>
                      </p>
                      {address ? (
                        <p className="flex items-start gap-1.5 text-xs leading-snug text-muted-foreground sm:text-sm">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                          <span className="line-clamp-2">{address}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-xs text-muted-foreground sm:text-sm">
                        Tap for full details
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary sm:text-sm">
                        View
                        <ChevronRight className="size-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <AdminPagination
          meta={meta}
          onPageChange={setPage}
          className="rounded-2xl border-border/70 shadow-sm"
        />
      ) : null}
    </div>
  );
}
