import { formatPhoneForWhatsApp } from "@/lib/format";
import type { Order } from "@/types/admin";

function formatDeliveryAddress(order: {
  deliveryLine1?: string | null;
  deliveryLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryLandmark?: string | null;
  deliveryPhone?: string | null;
}) {
  return [
    order.deliveryLine1,
    order.deliveryLine2,
    order.deliveryCity,
    order.deliveryState,
    order.deliveryLandmark ? `Landmark: ${order.deliveryLandmark}` : null,
    order.deliveryPhone ? `Phone: ${order.deliveryPhone}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Full WhatsApp payment message from an order (preferred over API suggestedMessage). */
export function buildWhatsAppMessage(order: {
  orderNumber: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  notes?: string | null;
  deliveryLine1?: string | null;
  deliveryLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryLandmark?: string | null;
  deliveryPhone?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    lineTotal: number;
    extras?: Array<{ name: string; price: number }> | null;
  }>;
}) {
  const lines = order.items.map((item) => {
    const extras =
      Array.isArray(item.extras) && item.extras.length
        ? ` (+${item.extras.map((e) => e.name).join(", ")})`
        : "";
    return `• ${item.quantity}x ${item.name}${extras} — ₦${item.lineTotal}`;
  });

  const address = formatDeliveryAddress(order);

  return [
    `Hello JollofPlate! I want to pay for order ${order.orderNumber}.`,
    "",
    "Items:",
    ...lines,
    "",
    `Subtotal: ₦${order.subtotal ?? order.total}`,
    `Delivery: ₦${order.deliveryFee ?? 0}`,
    `*Total: ₦${order.total}*`,
    address ? `\nDeliver to: ${address}` : "",
    order.notes ? `Note: ${order.notes}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function openWhatsAppCheckout(phone: string, message: string) {
  const digits = formatPhoneForWhatsApp(phone);
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Narrow type guard for "order deleted after last item removed". */
export function isOrderDeletedResponse(
  value: unknown,
): value is { deleted: true; message?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "deleted" in value &&
    (value as { deleted: unknown }).deleted === true
  );
}

export type { Order };
