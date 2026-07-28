export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const NIGERIA_DIAL_CODE = "234";

/** Digits only. */
export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

/**
 * Local NG number for the API / storage (e.g. 08012345678).
 * Accepts 801…, 0801…, or 234801….
 */
export function toNigeriaLocalPhone(phone: string) {
  let digits = digitsOnly(phone);
  if (!digits) return "";

  if (digits.startsWith(NIGERIA_DIAL_CODE)) {
    digits = digits.slice(NIGERIA_DIAL_CODE.length);
  }
  if (!digits.startsWith("0") && digits.length === 10) {
    digits = `0${digits}`;
  }
  return digits;
}

/** National part shown next to +234 (no leading 0). */
export function toNigeriaNationalNumber(phone: string) {
  const local = toNigeriaLocalPhone(phone);
  return local.startsWith("0") ? local.slice(1) : local;
}

export function formatPhoneForWhatsApp(phone: string) {
  const local = toNigeriaLocalPhone(phone);
  if (!local) return digitsOnly(phone);
  return `${NIGERIA_DIAL_CODE}${local.replace(/^0/, "")}`;
}

/**
 * E.164 for Terminal Africa / carriers (e.g. +2348012345678).
 * Matches country NG when pickup/delivery country is Nigeria.
 */
export function toNigeriaE164Phone(phone: string) {
  const digits = formatPhoneForWhatsApp(phone);
  if (!digits) return "";
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const WEEKDAY_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
