"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { customerRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getSafeNextPath, withNextQuery } from "@/lib/auth/redirect";
import { setCustomerSession } from "@/lib/auth/storage";
import { toNigeriaLocalPhone } from "@/lib/format";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next"));

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const phone = toNigeriaLocalPhone(form.phone);
      if (phone.length < 11) {
        setError("Enter a valid Nigerian phone number.");
        setLoading(false);
        return;
      }

      const result = await customerRegister({ ...form, phone });
      setCustomerSession(result.accessToken, {
        ...result.user,
        role: "customer",
        emailVerified: result.user.emailVerified ?? false,
      });
      toast.success(
        result.message ||
          "Registered. Check your email to verify your account.",
      );
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create your account right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Save orders and checkout with WhatsApp in minutes."
      image="/register.png"
      imageAlt="JollofPlate meal ready to share"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={withNextQuery("/login", next)}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <PhoneInput
            id="phone"
            required
            value={form.phone}
            onChange={(phone) => update("phone", phone)}
          />
          <p className="text-xs text-muted-foreground">Nigeria (+234)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full py-2" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
