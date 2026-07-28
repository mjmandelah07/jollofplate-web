import { apiFetch } from "@/lib/api/client";
import type { RestaurantSettings } from "@/types";

export type AdminSettingsInput = Partial<{
  restaurantName: string;
  whatsappNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  deliveryFee: number;
  businessHours: RestaurantSettings["businessHours"] | Record<string, unknown>;
  socialLinks: RestaurantSettings["socialLinks"];
  pickupLine1: string;
  pickupLine2: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  pickupCountry: string;
  pickupPhone: string;
  pickupEmail: string;
  pickupFirstName: string;
  pickupLastName: string;
}>;

export function getAdminSettings(token: string) {
  return apiFetch<RestaurantSettings>("/admin/settings", { token });
}

export function updateAdminSettings(token: string, body: AdminSettingsInput) {
  return apiFetch<RestaurantSettings>("/admin/settings", {
    method: "PATCH",
    token,
    body,
  });
}
