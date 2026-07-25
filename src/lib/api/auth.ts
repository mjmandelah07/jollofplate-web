import { apiFetch } from "@/lib/api/client";
import type {
  AuthResponse,
  AuthUser,
  RawAuthResponse,
  VerifyEmailResponse,
} from "@/types";

function normalize(
  raw: RawAuthResponse,
  fallbackRole: AuthUser["role"],
): AuthResponse {
  const profile = raw.admin ?? raw.customer ?? raw.user;

  return {
    accessToken: raw.accessToken ?? "",
    user: profile
      ? { ...profile, role: profile.role || fallbackRole }
      : { id: "", email: "", role: fallbackRole },
    ...(raw.message ? { message: raw.message } : {}),
  };
}

export async function customerRegister(body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const raw = await apiFetch<RawAuthResponse>("/auth/register", {
    method: "POST",
    body,
  });
  return normalize(raw, "customer");
}

export async function customerLogin(body: {
  email: string;
  password: string;
}) {
  const raw = await apiFetch<RawAuthResponse>("/auth/customer/login", {
    method: "POST",
    body,
  });
  return normalize(raw, "customer");
}

export async function adminLogin(body: { email: string; password: string }) {
  const raw = await apiFetch<RawAuthResponse>("/auth/login", {
    method: "POST",
    body,
  });
  return normalize(raw, "admin");
}

/** Public — called from `/verify-email?token=...`. */
export function verifyEmail(token: string) {
  return apiFetch<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

/** Customer JWT — resend verification email. */
export function resendVerification(token: string) {
  return apiFetch<VerifyEmailResponse>("/auth/resend-verification", {
    method: "POST",
    token,
  });
}
