"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getSafeNextPath } from "@/lib/auth/redirect";
import {
  getCustomerToken,
  getCustomerUser,
  updateCustomerUser,
} from "@/lib/auth/storage";
import type { AuthUser } from "@/types";

type Status = "loading" | "success" | "error" | "missing";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const next = getSafeNextPath(searchParams.get("next"), "/orders");

  const [status, setStatus] = useState<Status>(token ? "loading" : "missing");
  const [message, setMessage] = useState(
    token ? "Confirming your email…" : "This verification link is missing a token.",
  );
  const [email, setEmail] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getCustomerToken()));
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const result = await verifyEmail(token);
        if (cancelled) return;

        setStatus("success");
        setMessage(result.message || "Email verified successfully");
        setEmail(result.customer.email);

        const sessionUser = getCustomerUser<AuthUser>();
        if (
          sessionUser &&
          result.customer.id &&
          sessionUser.id === result.customer.id
        ) {
          updateCustomerUser({
            ...sessionUser,
            ...result.customer,
            emailVerified: true,
            role: "customer",
          });
        }
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "This verification link is invalid or has expired.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthShell
      title={
        status === "success"
          ? "Email verified"
          : status === "error" || status === "missing"
            ? "Verification failed"
            : "Verifying email"
      }
      description={
        status === "success"
          ? "Your account is confirmed. You can continue ordering."
          : status === "loading"
            ? "Hang tight — we’re confirming your address."
            : "Request a new link from your account if this one expired."
      }
      image="/login.png"
      imageAlt="JollofPlate meal"
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          {status === "loading" ? (
            <Loader2 className="size-7 animate-spin text-primary" />
          ) : status === "success" ? (
            <CheckCircle2 className="size-7 text-accent" />
          ) : (
            <XCircle className="size-7 text-destructive" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">{message}</p>
        {email ? (
          <p className="text-sm font-medium text-foreground">{email}</p>
        ) : null}

        <div className="grid gap-2">
          {status === "success" ? (
            <>
              <Button
                className="w-full"
                onClick={() => router.replace(loggedIn ? next : "/login")}
              >
                {loggedIn ? "Continue" : "Sign in"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/menu">Browse menu</Link>
              </Button>
            </>
          ) : status === "error" || status === "missing" ? (
            <>
              {loggedIn ? (
                <Button className="w-full" asChild>
                  <Link href="/orders">Go to my orders</Link>
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Create account</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
