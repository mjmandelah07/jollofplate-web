"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  LogOut,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";
import { AddressesManager } from "@/components/account/addresses-manager";
import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { CustomerOrdersManager } from "@/components/orders/customer-orders-manager";
import { Button } from "@/components/ui/button";
import { clearCustomerSession } from "@/lib/auth/storage";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "address", label: "Address", icon: MapPin },
  { id: "settings", label: "Settings", icon: KeyRound },
  { id: "orders", label: "Orders", icon: Package },
] as const;

type AccountTab = (typeof tabs)[number]["id"];

function parseTab(value: string | null): AccountTab {
  if (value === "address" || value === "settings" || value === "orders") {
    return value;
  }
  return "profile";
}

export function AccountManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<AccountTab>(() =>
    parseTab(searchParams.get("tab")),
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  function selectTab(next: AccountTab) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function logout() {
    clearCustomerSession();
    router.replace("/login");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        role="tablist"
        aria-label="Account sections"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border/80 bg-background/80 p-1.5 shadow-sm sm:flex sm:gap-1"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(item.id)}
              className={cn(
                "inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-colors sm:flex-1 sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "profile" ? <ProfileForm /> : null}
        {tab === "address" ? <AddressesManager /> : null}
        {tab === "settings" ? (
          <div className="space-y-4">
            <PasswordForm />
            <div className="rounded-2xl border border-border/80 bg-background/80 p-4 sm:p-5">
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="mt-1 text-sm text-muted-foreground">
                End your session on this device.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={logout}
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            </div>
          </div>
        ) : null}
        {tab === "orders" ? <CustomerOrdersManager /> : null}
      </div>
    </div>
  );
}
