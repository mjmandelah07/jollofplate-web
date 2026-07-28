import { buildWhatsAppUrl, openWhatsAppCheckout } from "@/lib/whatsapp-order";
import type { SourcingRequest } from "@/types/sourcing";

function formatDeliveryAddress(request: SourcingRequest) {
  return [
    request.deliveryLine1,
    request.deliveryLine2,
    request.deliveryCity,
    request.deliveryState,
    request.deliveryLandmark ? `Landmark: ${request.deliveryLandmark}` : null,
    request.deliveryPhone ? `Phone: ${request.deliveryPhone}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Prefer full rebuild; fall back to API suggestedMessage. */
export function buildSourcingWhatsAppMessage(request: SourcingRequest) {
  if (request.checkout?.suggestedMessage?.trim()) {
    return request.checkout.suggestedMessage.trim();
  }

  const lines = (request.items || []).map((item) => {
    const qty = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : "";
    const notes = item.notes ? ` (${item.notes})` : "";
    return `- ${item.name}${qty}${notes}`;
  });

  const address = formatDeliveryAddress(request);

  return [
    `Hello JollofPlate! Custom shopping request ${request.requestNumber}.`,
    "Please quote prices — I need these sourced (aim ~24 hours):",
    ...lines,
    address ? `\nDeliver to: ${address}` : "",
    request.notes ? `Note: ${request.notes}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function openSourcingWhatsApp(
  phone: string,
  request: SourcingRequest,
) {
  openWhatsAppCheckout(phone, buildSourcingWhatsAppMessage(request));
}

export function buildSourcingWhatsAppUrl(
  phone: string,
  request: SourcingRequest,
) {
  return buildWhatsAppUrl(phone, buildSourcingWhatsAppMessage(request));
}
