import type { PaginatedResult, PaginationMeta } from "@/types/pagination";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPositiveInt(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function toNonNegativeInt(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (!isRecord(raw)) return [];
  if (Array.isArray(raw.items)) return raw.items as T[];
  if (Array.isArray(raw.data)) return raw.data as T[];
  if (Array.isArray(raw.results)) return raw.results as T[];
  return [];
}

function extractMeta(
  raw: unknown,
  fallback: { page: number; limit: number; total: number },
): PaginationMeta | null {
  if (!isRecord(raw)) return null;
  const meta = isRecord(raw.meta) ? raw.meta : null;
  if (!meta && typeof raw.total !== "number" && typeof raw.page !== "number") {
    return null;
  }

  const source = meta ?? raw;
  const total = toNonNegativeInt(source.total, fallback.total);
  const page = toPositiveInt(source.page, fallback.page);
  const limit = toPositiveInt(source.limit, fallback.limit);
  const totalPages = toPositiveInt(
    source.totalPages,
    Math.max(1, Math.ceil(total / Math.max(limit, 1)) || 1),
  );

  return { total, page, limit, totalPages };
}

/**
 * Normalizes list endpoints that may return either a bare array or
 * `{ items, meta }`. When meta is missing, optionally filters and paginates
 * client-side so the UI still works against older admin APIs.
 */
export function normalizePaginated<T>(
  raw: unknown,
  options: {
    page?: number;
    limit?: number;
    filter?: (item: T) => boolean;
  } = {},
): PaginatedResult<T> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const items = extractItems<T>(raw);
  const serverMeta = extractMeta(raw, {
    page,
    limit,
    total: items.length,
  });

  if (serverMeta) {
    return { items, meta: serverMeta };
  }

  const filtered = options.filter ? items.filter(options.filter) : items;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    meta: {
      total,
      page: safePage,
      limit,
      totalPages,
    },
  };
}
