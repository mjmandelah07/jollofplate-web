"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Clock3,
  Loader2,
  MapPin,
  Share2,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/api/admin/settings";
import { ApiError } from "@/lib/api/client";
import {
  emptyBusinessHours,
  normalizeBusinessHours,
  toApiBusinessHours,
} from "@/lib/business-hours";
import { toNigeriaE164Phone, toNigeriaLocalPhone } from "@/lib/format";
import type { StructuredBusinessHours } from "@/types/admin";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Store },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "pickup", label: "Pickup", icon: MapPin },
  { id: "hours", label: "Hours", icon: Clock3 },
  { id: "social", label: "Social", icon: Share2 },
] as const;

type SettingsTab = (typeof tabs)[number]["id"];

function parseTab(value: string | null): SettingsTab {
  if (
    value === "delivery" ||
    value === "pickup" ||
    value === "hours" ||
    value === "social"
  ) {
    return value;
  }
  return "general";
}

type SettingsForm = {
  restaurantName: string;
  email: string;
  whatsappNumber: string;
  contactNumber: string;
  address: string;
  deliveryFee: string;
  pickupLine1: string;
  pickupLine2: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  pickupCountry: string;
  pickupPhone: string;
  pickupEmail: string;
  pickupFirstName: string;
  pickupLastName: string;
  terminalPackagingIdLight: string;
  terminalPackagingIdStandard: string;
  terminalPackagingIdLarge: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  hours: StructuredBusinessHours;
};

const emptyForm: SettingsForm = {
  restaurantName: "",
  email: "",
  whatsappNumber: "",
  contactNumber: "",
  address: "",
  deliveryFee: "0",
  pickupLine1: "",
  pickupLine2: "",
  pickupCity: "",
  pickupState: "Lagos",
  pickupZip: "",
  pickupCountry: "NG",
  pickupPhone: "",
  pickupEmail: "",
  pickupFirstName: "",
  pickupLastName: "",
  terminalPackagingIdLight: "",
  terminalPackagingIdStandard: "",
  terminalPackagingIdLarge: "",
  instagram: "",
  facebook: "",
  twitter: "",
  tiktok: "",
  hours: emptyBusinessHours(),
};

export function SettingsManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { requireToken, handleAuthError } = useAdminAuth();
  const [tab, setTab] = useState<SettingsTab>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [baseline, setBaseline] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(baseline);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  function selectTab(next: SettingsTab) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "general") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const loadSettings = useCallback(async () => {
    const token = requireToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getAdminSettings(token);
      const next: SettingsForm = {
        restaurantName: data.restaurantName ?? "",
        email: data.email ?? "",
        whatsappNumber: data.whatsappNumber ?? "",
        contactNumber: data.contactNumber ?? "",
        address: data.address ?? "",
        deliveryFee: String(data.deliveryFee ?? 0),
        pickupLine1: data.pickupLine1 ?? "",
        pickupLine2: data.pickupLine2 ?? "",
        pickupCity: data.pickupCity ?? "",
        pickupState: data.pickupState ?? "Lagos",
        pickupZip: data.pickupZip ?? "",
        pickupCountry: data.pickupCountry ?? "NG",
        pickupPhone: toNigeriaLocalPhone(data.pickupPhone ?? ""),
        pickupEmail: data.pickupEmail ?? "",
        pickupFirstName: data.pickupFirstName ?? "",
        pickupLastName: data.pickupLastName ?? "",
        terminalPackagingIdLight: data.terminalPackagingIdLight ?? "",
        terminalPackagingIdStandard: data.terminalPackagingIdStandard ?? "",
        terminalPackagingIdLarge: data.terminalPackagingIdLarge ?? "",
        instagram: data.socialLinks?.instagram ?? "",
        facebook: data.socialLinks?.facebook ?? "",
        twitter: data.socialLinks?.twitter ?? "",
        tiktok: data.socialLinks?.tiktok ?? "",
        hours: normalizeBusinessHours(data.businessHours),
      };
      setForm(next);
      setBaseline(next);
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not load settings",
      );
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, requireToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateHour(
    index: number,
    patch: Partial<StructuredBusinessHours["week"][number]>,
  ) {
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        week: prev.hours.week.map((day, i) =>
          i === index ? { ...day, ...patch } : day,
        ),
      },
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = requireToken();
    if (!token) return;

    setSaving(true);
    try {
      await updateAdminSettings(token, {
        restaurantName: form.restaurantName.trim(),
        email: form.email.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
        deliveryFee: Math.max(0, Math.round(Number(form.deliveryFee) || 0)),
        pickupLine1: form.pickupLine1.trim(),
        pickupLine2: form.pickupLine2.trim(),
        pickupCity: form.pickupCity.trim(),
        pickupState: form.pickupState.trim(),
        pickupZip: form.pickupZip.trim(),
        pickupCountry: form.pickupCountry.trim() || "NG",
        pickupPhone: form.pickupPhone.trim()
          ? toNigeriaE164Phone(form.pickupPhone)
          : "",
        pickupEmail: form.pickupEmail.trim(),
        pickupFirstName: form.pickupFirstName.trim(),
        pickupLastName: form.pickupLastName.trim(),
        terminalPackagingIdLight: form.terminalPackagingIdLight.trim(),
        terminalPackagingIdStandard: form.terminalPackagingIdStandard.trim(),
        terminalPackagingIdLarge: form.terminalPackagingIdLarge.trim(),
        businessHours: toApiBusinessHours(form.hours),
        socialLinks: {
          instagram: form.instagram.trim() || undefined,
          facebook: form.facebook.trim() || undefined,
          twitter: form.twitter.trim() || undefined,
          tiktok: form.tiktok.trim() || undefined,
        },
      });
      setBaseline(form);
      toast.success("Settings saved");
    } catch (error) {
      if (handleAuthError(error)) return;
      toast.error(
        error instanceof ApiError ? error.message : "Could not save settings",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restaurant identity, delivery, kitchen pickup, hours, and social
            links.
          </p>
        </div>
        <Button type="submit" className="rounded-xl" disabled={saving || !isDirty}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border/80 bg-background/80 p-1.5 shadow-sm sm:flex sm:gap-1"
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

      <div role="tabpanel" className="rounded-xl border border-border bg-card p-4 sm:p-5">
        {tab === "general" ? (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Identity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                How JollofPlate appears to customers.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="restaurantName">Restaurant name</Label>
                <Input
                  id="restaurantName"
                  required
                  value={form.restaurantName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      restaurantName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp number</Label>
                <Input
                  id="whatsappNumber"
                  required
                  value={form.whatsappNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      whatsappNumber: e.target.value,
                    }))
                  }
                  placeholder="2348012345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact number</Label>
                <Input
                  id="contactNumber"
                  value={form.contactNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "delivery" ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Delivery from
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shown as “from” when live Terminal rates aren’t available.
                </p>
              </div>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="deliveryFee">Amount (₦)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min={0}
                  required
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, deliveryFee: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-5">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Packaging tiers (Terminal)
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paste packaging IDs from Terminal (&lt;2kg / &lt;5kg / 5kg+).
                  Create boxes in Terminal, then copy IDs from the Terminal page.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="packaging-light">Light (&lt;2kg)</Label>
                  <Input
                    id="packaging-light"
                    value={form.terminalPackagingIdLight}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        terminalPackagingIdLight: e.target.value,
                      }))
                    }
                    placeholder="PA-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packaging-standard">Standard (&lt;5kg)</Label>
                  <Input
                    id="packaging-standard"
                    value={form.terminalPackagingIdStandard}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        terminalPackagingIdStandard: e.target.value,
                      }))
                    }
                    placeholder="PA-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packaging-large">Large (5kg+)</Label>
                  <Input
                    id="packaging-large"
                    value={form.terminalPackagingIdLarge}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        terminalPackagingIdLarge: e.target.value,
                      }))
                    }
                    placeholder="PA-..."
                  />
                </div>
              </div>
              <Button type="button" variant="outline" className="rounded-xl" asChild>
                <Link href="/admin/terminal">Browse Terminal packaging</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {tab === "pickup" ? (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Kitchen pickup (Terminal)
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Required for live carrier rates at checkout. This is where
                riders collect orders.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pickupLine1">Street address</Label>
                <Input
                  id="pickupLine1"
                  value={form.pickupLine1}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupLine1: e.target.value,
                    }))
                  }
                  placeholder="12 Allen Avenue"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pickupLine2">
                  Apartment / floor (optional)
                </Label>
                <Input
                  id="pickupLine2"
                  value={form.pickupLine2}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupLine2: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupCity">City</Label>
                <Input
                  id="pickupCity"
                  value={form.pickupCity}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pickupCity: e.target.value }))
                  }
                  placeholder="Ikorodu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupState">State</Label>
                <Input
                  id="pickupState"
                  value={form.pickupState}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupState: e.target.value,
                    }))
                  }
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupZip">ZIP / postal (optional)</Label>
                <Input
                  id="pickupZip"
                  value={form.pickupZip}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pickupZip: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupCountry">Country</Label>
                <Input
                  id="pickupCountry"
                  value={form.pickupCountry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupCountry: e.target.value,
                    }))
                  }
                  placeholder="NG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupPhone">Pickup phone</Label>
                <PhoneInput
                  id="pickupPhone"
                  value={form.pickupPhone}
                  onChange={(phone) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupPhone: phone,
                    }))
                  }
                  className="h-10 rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Saved as +234… for Terminal Africa (must match NG).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupEmail">Pickup email (optional)</Label>
                <Input
                  id="pickupEmail"
                  type="email"
                  value={form.pickupEmail}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupFirstName">Contact first name</Label>
                <Input
                  id="pickupFirstName"
                  value={form.pickupFirstName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupFirstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupLastName">Contact last name</Label>
                <Input
                  id="pickupLastName"
                  value={form.pickupLastName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pickupLastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === "hours" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Business hours
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Weekly open and close times.
                </p>
              </div>
              <div className="max-w-xs space-y-1">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={form.hours.timezone || "Africa/Lagos"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hours: { ...prev.hours, timezone: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              {form.hours.week.map((day, index) => (
                <div
                  key={day.day}
                  className="grid gap-3 rounded-xl border border-border/80 p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                >
                  <p className="font-medium text-foreground">{day.label}</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!day.closed}
                      onCheckedChange={(open) =>
                        updateHour(index, { closed: !open })
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {day.closed ? "Closed" : "Open"}
                    </span>
                  </div>
                  <Input
                    type="time"
                    disabled={day.closed}
                    value={day.open}
                    onChange={(e) =>
                      updateHour(index, { open: e.target.value })
                    }
                    aria-label={`${day.label} open`}
                  />
                  <Input
                    type="time"
                    disabled={day.closed}
                    value={day.close}
                    onChange={(e) =>
                      updateHour(index, { close: e.target.value })
                    }
                    aria-label={`${day.label} close`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "social" ? (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Social links
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Shown in the site footer.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["instagram", "Instagram"],
                  ["facebook", "Facebook"],
                  ["twitter", "Twitter / X"],
                  ["tiktok", "TikTok"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="url"
                    placeholder="https://"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
