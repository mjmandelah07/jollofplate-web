import type { DeliveryAddressInput } from "@/types/admin";
import type { MealExtra } from "@/types/catalog";

export type CartLine = {
  mealId: string;
  slug: string;
  name: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  extras: MealExtra[];
  lineTotal: number;
  image?: string;
};

const CART_KEY = "jollofplate.cart";
export const CART_NOTES_KEY = "jollofplate.cartNotes";
export const CART_ADDRESS_KEY = "jollofplate.deliveryAddress";
export const CART_UPDATED_EVENT = "jollofplate:cart-updated";

export const DEFAULT_DELIVERY_ADDRESS: DeliveryAddressInput = {
  line1: "",
  line2: "",
  city: "Ikorodu",
  state: "Lagos",
  landmark: "",
  phone: "",
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function extrasTotal(extras: MealExtra[]) {
  return extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
}

export function computeLineTotal(line: Omit<CartLine, "lineTotal">) {
  return (line.unitPrice + extrasTotal(line.extras)) * line.quantity;
}

function extrasKey(extras: MealExtra[]) {
  return [...extras]
    .map((extra) => `${extra.name}:${extra.price}`)
    .sort()
    .join("|");
}

export function lineKey(line: Pick<CartLine, "mealId" | "extras">) {
  return `${line.mealId}::${extrasKey(line.extras)}`;
}

export function getCart(): CartLine[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

/** Merges into an existing line when the meal and extras match exactly. */
export function addToCart(line: Omit<CartLine, "lineTotal">) {
  const cart = getCart();
  const key = extrasKey(line.extras);
  const existing = cart.find(
    (item) => item.mealId === line.mealId && extrasKey(item.extras) === key,
  );

  if (existing) {
    existing.quantity += line.quantity;
    existing.lineTotal = computeLineTotal(existing);
  } else {
    cart.push({ ...line, lineTotal: computeLineTotal(line) });
  }

  saveCart(cart);
  return cart;
}

export function updateCartLineQuantity(key: string, quantity: number) {
  const nextQty = Math.max(0, Math.floor(quantity));
  const cart = getCart()
    .map((line) => {
      if (lineKey(line) !== key) return line;
      return {
        ...line,
        quantity: nextQty,
        lineTotal: computeLineTotal({ ...line, quantity: nextQty }),
      };
    })
    .filter((line) => line.quantity > 0);

  saveCart(cart);
  return cart;
}

export function removeCartLine(key: string) {
  const cart = getCart().filter((line) => lineKey(line) !== key);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartNotes() {
  if (!canUseStorage()) return "";
  return localStorage.getItem(CART_NOTES_KEY) ?? "";
}

export function saveCartNotes(notes: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(CART_NOTES_KEY, notes);
}

export function clearCartNotes() {
  if (!canUseStorage()) return;
  localStorage.removeItem(CART_NOTES_KEY);
}

export function getSavedDeliveryAddress(): DeliveryAddressInput {
  if (!canUseStorage()) return { ...DEFAULT_DELIVERY_ADDRESS };
  try {
    const raw = localStorage.getItem(CART_ADDRESS_KEY);
    if (!raw) return { ...DEFAULT_DELIVERY_ADDRESS };
    const parsed = JSON.parse(raw) as Partial<DeliveryAddressInput>;
    return {
      ...DEFAULT_DELIVERY_ADDRESS,
      ...parsed,
      line1: parsed.line1 ?? "",
      city: parsed.city || DEFAULT_DELIVERY_ADDRESS.city,
      state: parsed.state || DEFAULT_DELIVERY_ADDRESS.state,
    };
  } catch {
    return { ...DEFAULT_DELIVERY_ADDRESS };
  }
}

export function saveDeliveryAddress(address: DeliveryAddressInput) {
  if (!canUseStorage()) return;
  localStorage.setItem(CART_ADDRESS_KEY, JSON.stringify(address));
}

export function clearDeliveryAddress() {
  if (!canUseStorage()) return;
  localStorage.removeItem(CART_ADDRESS_KEY);
}

export function getCartCount() {
  return getCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartSubtotal() {
  return getCart().reduce((sum, line) => sum + line.lineTotal, 0);
}
