"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, PackageSearch, Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Button } from "@/components/ui/button";
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
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
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
    setPage(1);
  }, [debouncedSearch, tab]);

  const loadOrders = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/orders");
      return;
    }

    setLoading(true);
    try {
      const data = await getMyOrders(token, {
        search: debouncedSearch,
        status: tab === "ALL" ? undefined : tab,
        page,
        limit: ADMIN_PAGE_SIZE,
      });
      setOrders(data.items);
      setMeta(data.meta);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
        router.replace("/login?next=/orders");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not load orders",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, router, tab]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-3xl border border-border/80 bg-card p-4 shadow-[0_16px_40px_-36px_rgba(34,34,34,0.4)]">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or notes…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? "default" : "outline"}
              className={cn(tab === item.id && "pointer-events-none")}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PackageSearch className="size-6" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {debouncedSearch || tab !== "ALL"
              ? "Nothing matches these filters."
              : "When you checkout, your orders will show up here."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/menu">Browse menu</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-3xl border border-border/80 bg-card p-4 transition-shadow hover:shadow-[0_18px_40px_-32px_rgba(34,34,34,0.45)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading text-base font-semibold text-foreground">
                    {order.orderNumber}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatOrderDate(order.createdAt)}
                  {order.items?.length
                    ? ` · ${order.items.length} item${order.items.length === 1 ? "" : "s"}`
                    : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-heading text-base font-bold text-primary">
                  {formatNaira(order.total)}
                </p>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {meta ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
