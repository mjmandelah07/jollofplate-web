import { apiFetch } from "@/lib/api/client";
import type { AuthResponse, AuthUser, RawAuthResponse } from "@/types";

function normalize(
  raw: RawAuthResponse,
  fallbackRole: AuthUser["role"],
): AuthResponse {
  const profile = raw.admin ?? raw.customer ?? raw.user;

  return {
    accessToken: raw.accessToken,
    user: profile ?? { id: "", email: "", role: fallbackRole },
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
