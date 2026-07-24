export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export const ADMIN_PAGE_SIZE = 20;
