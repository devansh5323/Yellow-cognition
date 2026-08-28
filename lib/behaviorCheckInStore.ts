// Persistence for the monthly "Behavior Friction" check-in (Component 4 of
// the Classroom Behaviour & Regulation page) — same read/write/emit shape
// as lib/monthlyClassroomCheckIn.ts, one record per calendar month.

import { behaviorCheckInScore } from "@/lib/classBehavior";

export type BehaviorCheckInRecord = {
  id: string;
  month: string; // e.g. "August 2026"
  createdAt: string; // ISO
  answers: Record<string, string>;
  pct: number; // behaviorCheckInScore(answers).pct at save time
};

const KEY = "ah_behavior_monthly_checkins";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emit() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("ah-behavior-checkin-change"));
}

function read(): BehaviorCheckInRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BehaviorCheckInRecord[]) : [];
  } catch {
    return [];
  }
}

function write(list: BehaviorCheckInRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

export function thisMonthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function getLatestBehaviorCheckIn(): BehaviorCheckInRecord | undefined {
  return read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
}

export function hasSubmittedBehaviorCheckInThisMonth(): boolean {
  const label = thisMonthLabel();
  return read().some((c) => c.month === label);
}

export function saveBehaviorCheckIn(answers: Record<string, string>): BehaviorCheckInRecord {
  const list = read();
  const month = thisMonthLabel();
  const existingIdx = list.findIndex((c) => c.month === month);
  const record: BehaviorCheckInRecord = {
    id: existingIdx >= 0 ? list[existingIdx].id : `bci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    month,
    createdAt: new Date().toISOString(),
    answers,
    pct: behaviorCheckInScore(answers).pct,
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
