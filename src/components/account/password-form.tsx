"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { updateAccountPassword } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { getCustomerToken } from "@/lib/auth/storage";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    const token = getCustomerToken();
    if (!token) return;

    setSaving(true);
    try {
      const result = await updateAccountPassword(token, {
        currentPassword,
        newPassword,
      });
      toast.success(result.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update password",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-border/70 px-4 py-3.5 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Password
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Change your account password.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              required
              minLength={6}
              value={currentPassword}
              disabled={saving}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              disabled={saving}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              disabled={saving}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl sm:w-auto"
            disabled={saving}
          >
            {saving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
