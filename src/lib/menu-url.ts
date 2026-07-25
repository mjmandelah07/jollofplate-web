export function buildMenuHref({
  category,
  search,
  page,
}: {
  category?: string | null;
  search?: string | null;
  page?: number | null;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search?.trim()) params.set("search", search.trim());
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/menu?${qs}` : "/menu";
}
