// Quick Pulse — the optional daily companion to the monthly behaviour
// check-in. One tap, one rating, no scoring model — a rolling "how
// manageable was today" sentiment log, separate from the monthly MCQs.

import { QUICK_PULSE_OPTIONS, type QuickPulseRating } from "@/lib/classBehavior";

export type DailyClassPulse = {
  id: string;
  date: string; // YYYY-MM-DD, local
  rating: QuickPulseRating;
  createdAt: string; // ISO
};

const KEY = "ah_daily_class_pulse";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emit() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("ah-daily-pulse-change"));
}

function read(): DailyClassPulse[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DailyClassPulse[]) : [];
  } catch {
    return [];
  }
}

function write(list: DailyClassPulse[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

function todayKey(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export function getTodayPulse(): DailyClassPulse | undefined {
  const today = todayKey();
  return read().find((p) => p.date === today);
}

export function logTodayPulse(rating: QuickPulseRating): DailyClassPulse {
  const list = read();
  const today = todayKey();
  const existingIdx = list.findIndex((p) => p.date === today);
  const record: DailyClassPulse = {
    id: existingIdx >= 0 ? list[existingIdx].id : `pulse_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    date: today,
    rating,
    createdAt: new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    const out = [...list];
    out[existingIdx] = record;
    write(out);
  } else {
    write([record, ...list]);
  }
  return record;
}

export function pulseOption(rating: QuickPulseRating) {
  return QUICK_PULSE_OPTIONS.find((o) => o.id === rating)!;
}
