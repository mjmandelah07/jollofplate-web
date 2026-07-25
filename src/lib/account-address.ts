import type { SavedAddress } from "@/types/account";
import type { DeliveryAddressInput } from "@/types/admin";
import { DEFAULT_DELIVERY_ADDRESS } from "@/lib/cart";
import { toNigeriaLocalPhone } from "@/lib/format";

export function savedAddressToDelivery(
  address: SavedAddress,
): DeliveryAddressInput {
  return {
    line1: address.line1,
    line2: address.line2 || "",
    city: address.city,
    state: address.state || DEFAULT_DELIVERY_ADDRESS.state,
    landmark: address.landmark || "",
    phone: address.phone || "",
  };
}

export function formatSavedAddress(address: SavedAddress) {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.landmark ? `Landmark: ${address.landmark}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

export function emptyAddressForm(defaults?: Partial<SavedAddress>) {
  return {
    label: defaults?.label || "",
    line1: defaults?.line1 || "",
    line2: defaults?.line2 || "",
    city: defaults?.city || DEFAULT_DELIVERY_ADDRESS.city,
    state: defaults?.state || DEFAULT_DELIVERY_ADDRESS.state || "Lagos",
    landmark: defaults?.landmark || "",
    phone: defaults?.phone || "",
    isDefault: Boolean(defaults?.isDefault),
  };
}

export function normalizeAddressPayload(form: {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  landmark: string;
  phone: string;
  isDefault: boolean;
}) {
  return {
    line1: form.line1.trim(),
    city: form.city.trim(),
    ...(form.label.trim() ? { label: form.label.trim() } : {}),
    ...(form.line2.trim() ? { line2: form.line2.trim() } : { line2: "" }),
    ...(form.state.trim() ? { state: form.state.trim() } : {}),
    ...(form.landmark.trim()
      ? { landmark: form.landmark.trim() }
      : { landmark: "" }),
    ...(form.phone.trim()
      ? { phone: toNigeriaLocalPhone(form.phone) }
      : { phone: "" }),
    isDefault: form.isDefault,
  };
}
