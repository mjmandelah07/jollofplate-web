import { apiFetch } from "@/lib/api/client";
import type { AdminStats } from "@/types/admin";

export function getAdminStats(token: string) {
  return apiFetch<AdminStats>("/admin/stats", { token });
}
