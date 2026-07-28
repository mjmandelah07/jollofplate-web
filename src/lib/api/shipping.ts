import { apiFetch } from "@/lib/api/client";
import type { DeliveryAddressInput } from "@/types/admin";
import type { ShippingRatesResponse } from "@/types/shipping";

export type ShippingRatesItemInput = {
  mealId: string;
  quantity: number;
};

export type GetShippingRatesInput = {
  deliveryAddress: DeliveryAddressInput;
  items: ShippingRatesItemInput[];
};

export function getShippingRates(
  token: string,
  body: GetShippingRatesInput,
  signal?: AbortSignal,
) {
  return apiFetch<ShippingRatesResponse>("/shipping/rates", {
    method: "POST",
    token,
    body,
    signal,
  });
}
