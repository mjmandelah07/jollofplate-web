import { apiFetch } from "@/lib/api/client";
import type {
  TerminalCarrier,
  TerminalPackaging,
  TerminalStatus,
} from "@/types/shipping";

export function getTerminalStatus(token: string) {
  return apiFetch<TerminalStatus>("/admin/terminal/status", { token });
}

export function getTerminalCarriers(token: string) {
  return apiFetch<TerminalCarrier[] | { data?: TerminalCarrier[] }>(
    "/admin/terminal/carriers",
    { token },
  ).then((result) =>
    Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [],
  );
}

export function getTerminalPackaging(token: string) {
  return apiFetch<TerminalPackaging[] | { data?: TerminalPackaging[] }>(
    "/admin/terminal/packaging",
    { token },
  ).then((result) =>
    Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [],
  );
}
