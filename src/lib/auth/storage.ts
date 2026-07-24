const CUSTOMER_TOKEN_KEY = "customerToken";
const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";
const CUSTOMER_USER_KEY = "customerUser";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getCustomerToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerSession(token: string, user: unknown) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
}

export function getCustomerUser<T = unknown>() {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(CUSTOMER_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(token: string, user: unknown) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getAdminUser<T = unknown>() {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
