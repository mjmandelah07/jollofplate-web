/**
 * Only allow same-origin relative paths (open-redirect safe).
 * Falls back to `/orders` when missing or invalid.
 */
export function getSafeNextPath(
  next: string | null | undefined,
  fallback = "/orders",
) {
  if (!next) return fallback;
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export function withNextQuery(href: string, next: string) {
  if (!next || next === "/orders") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}next=${encodeURIComponent(next)}`;
}
