import type { SourcingItem } from "@/types/sourcing";

export type SourcingCartLine = {
  key: string;
  sourcingItemId?: string;
  name: string;
  quantity: number;
  notes?: string;
  image?: string | null;
  unitHint?: string | null;
  isCustom: boolean;
};

const CART_KEY = "jollofplate.sourcingCart";
export const SOURCING_NOTES_KEY = "jollofplate.sourcingNotes";
export const SOURCING_CART_UPDATED_EVENT = "jollofplate:sourcing-cart-updated";

function canUseStorage() {
  return typeof window !== "undefined";
}

function notify() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(SOURCING_CART_UPDATED_EVENT));
}

export function getSourcingCart(): SourcingCartLine[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SourcingCartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveSourcingCart(lines: SourcingCartLine[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  notify();
}

export function getSourcingCartCount() {
  return getSourcingCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function addCatalogItemToSourcingCart(
  item: SourcingItem,
  quantity = 1,
) {
  const cart = getSourcingCart();
  const existing = cart.find((line) => line.sourcingItemId === item.id);
  const qty = Math.max(1, Math.floor(quantity));

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      key: `item:${item.id}`,
      sourcingItemId: item.id,
      name: item.name,
      quantity: qty,
      image: item.image,
      unitHint: item.unitHint,
      isCustom: false,
    });
  }

  saveSourcingCart(cart);
  return cart;
}

export function addCustomItemToSourcingCart(input: {
  name: string;
  quantity?: number;
  notes?: string;
}) {
  const name = input.name.trim();
  if (!name) return getSourcingCart();

  const cart = getSourcingCart();
  const qty = Math.max(1, Math.floor(input.quantity || 1));
  cart.push({
    key: `custom:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    name,
    quantity: qty,
    notes: input.notes?.trim() || undefined,
    isCustom: true,
  });
  saveSourcingCart(cart);
  return cart;
}

export function updateSourcingCartQuantity(key: string, quantity: number) {
  const nextQty = Math.max(0, Math.floor(quantity));
  const cart = getSourcingCart()
    .map((line) =>
      line.key === key ? { ...line, quantity: nextQty } : line,
    )
    .filter((line) => line.quantity > 0);
  saveSourcingCart(cart);
  return cart;
}

export function updateSourcingCartNotes(key: string, notes: string) {
  const cart = getSourcingCart().map((line) =>
    line.key === key
      ? { ...line, notes: notes.trim() || undefined }
      : line,
  );
  saveSourcingCart(cart);
  return cart;
}

export function removeSourcingCartLine(key: string) {
  const cart = getSourcingCart().filter((line) => line.key !== key);
  saveSourcingCart(cart);
  return cart;
}

export function clearSourcingCart() {
  saveSourcingCart([]);
}

export function getSourcingNotes() {
  if (!canUseStorage()) return "";
  return localStorage.getItem(SOURCING_NOTES_KEY) ?? "";
}

export function saveSourcingNotes(notes: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(SOURCING_NOTES_KEY, notes);
}

export function clearSourcingNotes() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SOURCING_NOTES_KEY);
}

export function sourcingCartToRequestItems(lines: SourcingCartLine[]) {
  return lines.map((line) => {
    if (line.sourcingItemId) {
      return {
        sourcingItemId: line.sourcingItemId,
        quantity: line.quantity,
        ...(line.notes ? { notes: line.notes } : {}),
      };
    }
    return {
      name: line.name,
      quantity: line.quantity,
      ...(line.notes ? { notes: line.notes } : {}),
    };
  });
}
