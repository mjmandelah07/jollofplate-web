"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountProfile, updateAccountProfile } from "@/lib/api/account";
import { resendVerification } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  clearCustomerSession,
  getCustomerToken,
  updateCustomerUser,
} from "@/lib/auth/storage";
import { toNigeriaLocalPhone } from "@/lib/format";
import type { CustomerProfile } from "@/types/account";
import { cn } from "@/lib/utils";

export function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/account");
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const data = await getAccountProfile(token);
        setProfile(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");
        updateCustomerUser({
          ...data,
          role: "customer",
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearCustomerSession();
          router.replace("/login?next=/account");
          return;
        }
        toast.error(
          error instanceof ApiError ? error.message : "Could not load profile",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function onResendVerification() {
    const token = getCustomerToken();
    if (!token) return;

    setResending(true);
    try {
      const result = await resendVerification(token);
      if (result.customer) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...result.customer,
                emailVerified:
                  result.customer.emailVerified ?? prev.emailVerified,
              }
            : prev,
        );
        updateCustomerUser({
          ...result.customer,
          role: "customer",
        });
      }
      toast.success(result.message || "Verification email sent");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not resend verification email",
      );
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;

    const token = getCustomerToken();
    if (!token) return;

    const nextPhone = phone.trim() ? toNigeriaLocalPhone(phone) : "";
    const body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    } = {};

    if (firstName.trim() !== (profile.firstName || "")) {
      body.firstName = firstName.trim();
    }
    if (lastName.trim() !== (profile.lastName || "")) {
      body.lastName = lastName.trim();
    }
    if (nextPhone !== (profile.phone || "")) {
      body.phone = nextPhone;
    }

    if (Object.keys(body).length === 0) {
      toast.message("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const result = await updateAccountProfile(token, body);
      setProfile(result.customer);
      setFirstName(result.customer.firstName || "");
      setLastName(result.customer.lastName || "");
      setPhone(result.customer.phone || "");
      updateCustomerUser({
        ...result.customer,
        role: "customer",
      });
      toast.success(result.message || "Profile updated");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-72 w-full rounded-2xl" />;
  }

  if (!profile) return null;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-border/70 px-4 py-3.5 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Profile
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Update your name and delivery phone.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              value={profile.email}
              disabled
              className="h-11 rounded-xl bg-muted/40"
            />
            <div
              className={cn(
                "flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
                profile.emailVerified
                  ? "border-emerald-200/80 bg-emerald-50 text-emerald-950"
                  : "border-amber-200/80 bg-amber-50 text-amber-950",
              )}
            >
              <div className="flex min-w-0 items-start gap-2">
                {profile.emailVerified ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                ) : (
                  <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-700" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {profile.emailVerified
                      ? "Email verified"
                      : "Email not verified"}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug opacity-80">
                    {profile.emailVerified
                      ? "Your account email is confirmed."
                      : "Check your inbox for the verification link."}
                  </p>
                </div>
              </div>
              {!profile.emailVerified ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg border-amber-300/80 bg-background/70 text-amber-950 hover:bg-background"
                  disabled={resending}
                  onClick={onResendVerification}
                >
                  {resending ? "Sending…" : "Resend email"}
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Email can’t be changed here.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-firstName">First name</Label>
              <Input
                id="account-firstName"
                required
                value={firstName}
                disabled={saving}
                className="h-11 rounded-xl"
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-lastName">Last name</Label>
              <Input
                id="account-lastName"
                required
                value={lastName}
                disabled={saving}
                className="h-11 rounded-xl"
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-phone">Phone</Label>
            <PhoneInput
              id="account-phone"
              value={phone}
              disabled={saving}
              className="h-11 rounded-xl"
              onChange={setPhone}
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl sm:w-auto"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
