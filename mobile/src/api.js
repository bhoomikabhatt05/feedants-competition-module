import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * All competition/business data (title, prize, fee, spots, judge, dates,
 * winners, rewards, registration/lifecycle state) comes from the backend.
 * This module holds NO hardcoded competition values — only UI labels.
 * The last successful server response is cached for offline display and is
 * always labelled stale; it is never a substitute for live data.
 */

// Change via EXPO_PUBLIC_API_URL (e.g. http://<your-lan-ip>:4000)
export const API_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "http://localhost:4000";
export const SLUG = "feedants-classical-dance";

const CACHE_KEY = `feedants_cache_${SLUG}`;

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Demo auth: persistent per-device user id (production would use JWT). */
export async function getUserId() {
  let id = await AsyncStorage.getItem("feedants_user_id");
  if (!id || !/^[A-Za-z0-9_-]{3,128}$/.test(id)) {
    id = "user-" + Math.random().toString(36).slice(2, 9);
    await AsyncStorage.setItem("feedants_user_id", id);
  }
  return id;
}

export async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCache(data) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
  } catch {}
}

async function req(path, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  let r;
  try {
    r = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      ...opts,
    });
  } catch (e) {
    throw new ApiError("Network error — backend unreachable", 0, "NETWORK");
  } finally {
    clearTimeout(t);
  }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(body.error || `HTTP ${r.status}`, r.status, body.code);
  return body.data;
}

export const api = {
  async detail(userId) {
    const data = await req(`/api/competitions/${SLUG}?userId=${encodeURIComponent(userId)}`);
    await writeCache(data);
    return data;
  },
  register: (userId, referralCode) =>
    req(`/api/competitions/${SLUG}/register`, {
      method: "POST",
      body: JSON.stringify({ userId, idempotencyKey: `${userId}-${SLUG}`, referralCode: referralCode || undefined }),
    }),
  cancel: (userId) =>
    req(`/api/competitions/${SLUG}/cancel`, { method: "POST", body: JSON.stringify({ userId }) }),
  submit: (userId, submissionUrl, fileType, fileSizeBytes) =>
    req(`/api/competitions/${SLUG}/submit`, {
      method: "POST",
      body: JSON.stringify({ userId, submissionUrl, fileType, fileSizeBytes }),
    }),
  referral: (userId) => req(`/api/competitions/${SLUG}/referral?userId=${encodeURIComponent(userId)}`),
  testimonials: () => req(`/api/competitions/${SLUG}/testimonials`),
  mockCheckout: (userId, amount) =>
    req(`/api/payments/mock-checkout`, {
      method: "POST",
      body: JSON.stringify({ userId, competitionSlug: SLUG, amount }),
    }),
};
