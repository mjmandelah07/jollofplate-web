"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  toLegacyBusinessHours,
} from "@/lib/business-hours";
import type { StructuredBusinessHours } from "@/types/admin";

type SettingsForm = {
  restaurantName: string;
  email: string;
  whatsappNumber: string;
  contactNumber: string;
  address: string;
  deliveryFee: string;
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
  instagram: "",
  facebook: "",
  twitter: "",
  tiktok: "",
  hours: emptyBusinessHours(),
};

export function SettingsManager() {
  const { requireToken, handleAuthError } = useAdminAuth();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [baseline, setBaseline] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(baseline);

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
        businessHours: toLegacyBusinessHours(form.hours),
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restaurant identity, delivery fee, hours, and social links.
          </p>
        </div>
        <Button type="submit" disabled={saving || !isDirty}>
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

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Identity
        </h2>
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
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Delivery
        </h2>
        <div className="max-w-xs space-y-2">
          <Label htmlFor="deliveryFee">Delivery fee (₦)</Label>
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
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Business hours
          </h2>
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
                onChange={(e) => updateHour(index, { open: e.target.value })}
                aria-label={`${day.label} open`}
              />
              <Input
                type="time"
                disabled={day.closed}
                value={day.close}
                onChange={(e) => updateHour(index, { close: e.target.value })}
                aria-label={`${day.label} close`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Social links
        </h2>
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
      </section>
    </form>
  );
}
