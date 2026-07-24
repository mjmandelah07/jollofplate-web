"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError } from "@/lib/api/client";
import { clearAdminSession, getAdminToken } from "@/lib/auth/storage";

export function useAdminAuth() {
  const router = useRouter();

  const requireToken = useCallback(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return null;
    }
    return token;
  }, [router]);

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAdminSession();
        router.replace("/admin/login");
        return true;
      }
      return false;
    },
    [router],
  );

  return { requireToken, handleAuthError };
}
