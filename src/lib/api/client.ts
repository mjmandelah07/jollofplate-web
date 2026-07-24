export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://jollofplate-api-develop.onrender.com";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token, headers }: RequestOptions = {},
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : String(data.message)
        : null) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
