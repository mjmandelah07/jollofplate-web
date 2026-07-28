import { apiFetch } from "@/lib/api/client";
import { normalizePaginated } from "@/lib/api/pagination";
import type { PaginatedResult } from "@/types/pagination";
import { ADMIN_PAGE_SIZE } from "@/types/pagination";
import type {
  TerminalCarrier,
  TerminalPackaging,
  TerminalStatus,
} from "@/types/shipping";

type TerminalListQuery = {
  page?: number;
  limit?: number;
};

function toQuery(params?: TerminalListQuery) {
  if (!params) return "";
  const search = new URLSearchParams();
  if (typeof params.page === "number") search.set("page", String(params.page));
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Supports `{ items, meta }` and legacy `{ data: { carriers|packaging, pagination } }`. */
function normalizeTerminalList<T>(
  raw: unknown,
  key: "carriers" | "packaging",
  page: number,
  limit: number,
): PaginatedResult<T> {
  if (isRecord(raw) && Array.isArray(raw.items)) {
    return normalizePaginated<T>(raw, { page, limit });
  }

  if (isRecord(raw) && isRecord(raw.data)) {
    const nested = raw.data[key];
    const pagination = isRecord(raw.data.pagination)
      ? raw.data.pagination
      : null;

    if (Array.isArray(nested)) {
      const total = Number(pagination?.total);
      const currentPage = Number(
        pagination?.currentPage ?? pagination?.page ?? page,
      );
      const perPage = Number(
        pagination?.perPage ?? pagination?.limit ?? limit,
      );
      const pageCount = Number(
        pagination?.pageCount ?? pagination?.totalPages,
      );
      const hasNext = Boolean(pagination?.hasNextPage);

      const safeLimit = Number.isFinite(perPage) && perPage > 0 ? perPage : limit;
      const safeTotal = Number.isFinite(total) && total >= 0 ? total : nested.length;
      const computedPages = Math.max(1, Math.ceil(safeTotal / safeLimit) || 1);
      const totalPages =
        Number.isFinite(pageCount) && pageCount > 0
          ? pageCount
          : hasNext
            ? Math.max(computedPages, currentPage + 1)
            : computedPages;

      return normalizePaginated<T>(
        {
          items: nested,
          meta: {
            total: safeTotal,
            page: Number.isFinite(currentPage) && currentPage > 0 ? currentPage : page,
            limit: safeLimit,
            totalPages,
          },
        },
        { page, limit },
      );
    }
  }

  return normalizePaginated<T>(raw, { page, limit });
}

export function getTerminalStatus(token: string) {
  return apiFetch<TerminalStatus>("/admin/terminal/status", { token });
}

export function getTerminalCarriers(
  token: string,
  params?: TerminalListQuery,
): Promise<PaginatedResult<TerminalCarrier>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(
    `/admin/terminal/carriers${toQuery({ page, limit })}`,
    { token },
  ).then((result) =>
    normalizeTerminalList<TerminalCarrier>(result, "carriers", page, limit),
  );
}

export function getTerminalPackaging(
  token: string,
  params?: TerminalListQuery,
): Promise<PaginatedResult<TerminalPackaging>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? ADMIN_PAGE_SIZE;

  return apiFetch<unknown>(
    `/admin/terminal/packaging${toQuery({ page, limit })}`,
    { token },
  ).then((result) =>
    normalizeTerminalList<TerminalPackaging>(result, "packaging", page, limit),
  );
}
