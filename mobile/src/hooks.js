import { useEffect, useState } from "react";

export function formatMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d)}d : ${p(h)}h : ${p(m)}m : ${p(sec)}s`;
}

/**
 * Ticks every second from a server-provided millisecond value.
 * Calls onExpiry exactly once when reaching zero so the app can
 * re-fetch and refresh the lifecycle state (never shows a stale timer).
 */
export function useCountdown(initialMs, onExpiry) {
  const [ms, setMs] = useState(initialMs ?? 0);
  useEffect(() => setMs(initialMs ?? 0), [initialMs]);
  useEffect(() => {
    if (!ms || ms <= 0) return;
    const t = setInterval(() => {
      setMs((v) => {
        const next = Math.max(0, v - 1000);
        if (next === 0) {
          clearInterval(t);
          onExpiry && onExpiry();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ms > 0]);
  return ms;
}

export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
    let h = d.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const time = `${String(h).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
    return { date, time };
  } catch {
    return { date: "--", time: "--" };
  }
}
