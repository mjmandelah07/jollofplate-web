import { apiFetch } from "@/lib/api/client";
import type { RestaurantSettings } from "@/types";

export function getSettings() {
  return apiFetch<RestaurantSettings>("/settings");
}
