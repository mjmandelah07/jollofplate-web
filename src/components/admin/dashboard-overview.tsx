"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getAdminStats } from "@/lib/api/admin/stats";
import { ApiError } from "@/lib/api/client";
import type { AdminStats } from "@/types/admin";

const quickLinks = [
  { href: "/admin/orders", label: "View pending orders" },
  { href: "/admin/meals", label: "Add meal" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Edit settings" },
];

export function DashboardOverview() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    const token = requireToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getAdminStats(token);
      setStats(data);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not load stats",
      );
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, requireToken]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const cards = [
    { label: "Total meals", value: stats?.totalMeals },
    { label: "Categories", value: stats?.totalCategories },
    { label: "Available meals", value: stats?.availableMeals },
    { label: "Unavailable meals", value: stats?.unavailableMeals },
    { label: "Featured meals", value: stats?.featuredMeals },
    { label: "Pending orders", value: stats?.pendingOrders },
    { label: "Paid orders", value: stats?.paidOrders },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Stats and quick actions for JollofPlate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 7 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-16" />
                </CardHeader>
              </Card>
            ))
          : cards.map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {card.value ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Jump into common admin tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Button key={link.href} variant="outline" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
