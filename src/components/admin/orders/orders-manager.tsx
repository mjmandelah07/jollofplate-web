"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getAdminOrders } from "@/lib/api/admin/orders";
import { ApiError } from "@/lib/api/client";
import type { Order, OrderStatus } from "@/types/admin";
import type { PaginationMeta } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import { cn } from "@/lib/utils";

const tabs: Array<{ id: "ALL" | OrderStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Paid" },
  { id: "CANCELLED", label: "Cancelled" },
];

export function OrdersManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
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
    const token = requireToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getAdminOrders(token, {
        search: debouncedSearch,
        status: tab === "ALL" ? undefined : tab,
        page,
        limit: ADMIN_PAGE_SIZE,
      });
      setOrders(data.items);
      setMeta(data.meta);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not load orders",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, handleAuthError, page, requireToken, tab]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending WhatsApp checkouts and mark them paid or cancelled.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Search order number, notes, or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-lg"
        />
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

      <OrdersTable orders={orders} loading={loading} />

      {meta ? (
        <AdminPagination meta={meta} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
