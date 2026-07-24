"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminShell({
  adminName,
  pendingOrders = 0,
  children,
}: {
  adminName?: string;
  pendingOrders?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-svh">
          <AdminSidebar pendingOrders={pendingOrders} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open admin menu"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin navigation</SheetTitle>
                </SheetHeader>
                <AdminSidebar
                  pendingOrders={pendingOrders}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
              Dashboard
            </p>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {adminName ? `Signed in as ${adminName}` : "Admin"}
          </p>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
