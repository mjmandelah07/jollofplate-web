import type {
  BusinessHourDay,
  LegacyBusinessHours,
  StructuredBusinessHours,
} from "@/types/admin";

const DAY_META = [
  { key: "mon", day: "monday", label: "Monday" },
  { key: "tue", day: "tuesday", label: "Tuesday" },
  { key: "wed", day: "wednesday", label: "Wednesday" },
  { key: "thu", day: "thursday", label: "Thursday" },
  { key: "fri", day: "friday", label: "Friday" },
  { key: "sat", day: "saturday", label: "Saturday" },
  { key: "sun", day: "sunday", label: "Sunday" },
] as const;

function defaultWeek(): BusinessHourDay[] {
  return DAY_META.map((day) => ({
    day: day.day,
    label: day.label,
    open: "10:00",
    close: "21:00",
    closed: false,
  }));
}

function parseLegacyRange(value?: string): Pick<
  BusinessHourDay,
  "open" | "close" | "closed"
> {
  if (!value || value.toLowerCase() === "closed") {
    return { open: "10:00", close: "21:00", closed: true };
  }
  const [open, close] = value.split("-").map((part) => part.trim());
  if (!open || !close) {
    return { open: "10:00", close: "21:00", closed: false };
  }
  return { open, close, closed: false };
}

export function normalizeBusinessHours(
  value: unknown,
): StructuredBusinessHours {
  if (
    value &&
    typeof value === "object" &&
    "week" in value &&
    Array.isArray((value as StructuredBusinessHours).week)
  ) {
    const structured = value as StructuredBusinessHours;
    const byDay = new Map(
      structured.week.map((day) => [day.day.toLowerCase(), day]),
    );
    return {
      timezone: structured.timezone || "Africa/Lagos",
      week: DAY_META.map((meta) => {
        const existing = byDay.get(meta.day);
        return {
          day: meta.day,
          label: meta.label,
          open: existing?.open || "10:00",
          close: existing?.close || "21:00",
          closed: Boolean(existing?.closed),
        };
      }),
    };
  }

  const legacy = (value || {}) as LegacyBusinessHours;
  return {
    timezone: "Africa/Lagos",
    week: DAY_META.map((meta) => ({
      day: meta.day,
      label: meta.label,
      ...parseLegacyRange(legacy[meta.key]),
    })),
  };
}

/** Persist in the legacy map shape older APIs understood. Kept for fallback. */
export function toLegacyBusinessHours(
  hours: StructuredBusinessHours,
): LegacyBusinessHours {
  const result: LegacyBusinessHours = {};
  for (const meta of DAY_META) {
    const day = hours.week.find((item) => item.day === meta.day);
    if (!day || day.closed) {
      result[meta.key] = "closed";
    } else {
      result[meta.key] = `${day.open}-${day.close}`;
    }
  }
  return result;
}

export type ApiBusinessHourDay = {
  day: string;
  label: string;
  closed: boolean;
  open?: string;
  close?: string;
};

export type ApiBusinessHours = {
  timezone: string;
  week: ApiBusinessHourDay[];
};

/**
 * Structured shape the API expects: `{ timezone, week[] }` with all 7 days,
 * full lowercase day names, and `open`/`close` omitted when `closed`.
 */
export function toApiBusinessHours(
  hours: StructuredBusinessHours,
): ApiBusinessHours {
  return {
    timezone: hours.timezone?.trim() || "Africa/Lagos",
    week: DAY_META.map((meta) => {
      const day = hours.week.find((item) => item.day === meta.day);
      const closed = Boolean(day?.closed);
      return {
        day: meta.day,
        label: meta.label,
        closed,
        ...(closed
          ? {}
          : {
              open: day?.open || "10:00",
              close: day?.close || "21:00",
            }),
      };
    }),
  };
}

export function emptyBusinessHours() {
  return {
    timezone: "Africa/Lagos",
    week: defaultWeek(),
  } satisfies StructuredBusinessHours;
}
