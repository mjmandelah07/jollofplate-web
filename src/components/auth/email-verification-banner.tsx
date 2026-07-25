"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendVerification } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  CUSTOMER_SESSION_EVENT,
  getCustomerToken,
  getCustomerUser,
  updateCustomerUser,
} from "@/lib/auth/storage";
import type { AuthUser } from "@/types";

export function EmailVerificationBanner() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function sync() {
      const token = getCustomerToken();
      const next = getCustomerUser<AuthUser>();
      setUser(token && next?.role === "customer" ? next : null);
    }
    sync();
    window.addEventListener(CUSTOMER_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (dismissed || !user || user.emailVerified !== false) {
    return null;
  }

  async function onResend() {
    const token = getCustomerToken();
    if (!token) return;

    setSending(true);
    try {
      const result = await resendVerification(token);
      const current = getCustomerUser<AuthUser>();
      if (result.customer) {
        updateCustomerUser({
          ...(current || {}),
          ...result.customer,
          role: "customer",
        });
      }
      toast.success(result.message || "Verification email sent");
      if (result.customer?.emailVerified) {
        setDismissed(true);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not resend verification email",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-b border-amber-200/80 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-start gap-2.5">
          <Mail className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p className="text-sm leading-snug">
            Confirm <span className="font-medium">{user.email}</span> — check
            your inbox for the verification link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            disabled={sending}
            onClick={() => void onResend()}
          >
            {sending ? "Sending…" : "Resend email"}
          </Button>
          <button
            type="button"
            className="text-xs font-medium text-amber-800/80 hover:text-amber-950"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
