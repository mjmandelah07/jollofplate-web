import { apiFetch } from "@/lib/api/client";
import type {
  CustomerProfile,
  UpdatePasswordInput,
  UpdateProfileInput,
} from "@/types/account";

export function getAccountProfile(token: string) {
  return apiFetch<CustomerProfile>("/account/profile", { token });
}

export function updateAccountProfile(
  token: string,
  body: UpdateProfileInput,
) {
  return apiFetch<{ message: string; customer: CustomerProfile }>(
    "/account/profile",
    {
      method: "PATCH",
      token,
      body,
    },
  );
}

export function updateAccountPassword(
  token: string,
  body: UpdatePasswordInput,
) {
  return apiFetch<{ message: string }>("/account/password", {
    method: "PATCH",
    token,
    body,
  });
}
