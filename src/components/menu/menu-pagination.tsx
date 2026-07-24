import Link from "next/link";
import { buildMenuHref } from "@/lib/menu-url";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";

export function MenuPagination({
  meta,
  category,
  search,
  className,
}: {
  meta: PaginationMeta;
  category?: string;
  search?: string;
  className?: string;
}) {
  if (meta.total === 0 || meta.totalPages <= 1) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  const prevHref = buildMenuHref({
    category,
    search,
    page: meta.page - 1,
  });
  const nextHref = buildMenuHref({
    category,
    search,
    page: meta.page + 1,
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{meta.total}</span>
      </p>
      <div className="flex items-center gap-2">
        {meta.page > 1 ? (
          <Link
            href={prevHref}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium opacity-40">
            Previous
          </span>
        )}
        <span className="min-w-20 text-center text-sm text-muted-foreground">
          Page {meta.page} / {meta.totalPages}
        </span>
        {meta.page < meta.totalPages ? (
          <Link
            href={nextHref}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium opacity-40">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
