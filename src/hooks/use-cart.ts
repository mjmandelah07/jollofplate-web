"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CART_UPDATED_EVENT,
  getCart,
  getCartCount,
  getCartSubtotal,
  type CartLine,
} from "@/lib/cart";

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    setLines(getCart());
    setReady(true);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return {
    lines,
    ready,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    refresh: sync,
  };
}

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartCount());
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return count;
}

export function useCartSubtotal() {
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const sync = () => setSubtotal(getCartSubtotal());
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return subtotal;
}
