// Monthly "classroom overview" pulse — 5 aggregate MCQs (teaching minutes,
// minutes lost to behaviour/transitions, disruptive incidents, repeated
// instructions), same bucket types the rest of the app already uses for
// class check-ins. Deliberately separate from ClassCheckIn (lib/checkIn.ts):
// that model requires per-student ratings this short monthly pulse never
// collects, so faking a roster of ratings just to reuse it would fabricate
// data this form doesn't actually gather.

import type { TeachingMinBucket, LostMinBucket, CountBucket } from "@/data/mockData";

export type MonthlyClassroomCheckIn = {
  id: string;
  month: string; // e.g. "August 2026" — the month this pulse describes
  createdAt: string; // ISO
  teachingMins: TeachingMinBucket;
  behaviourMins: LostMinBucket;
  transitionMins: LostMinBucket;
  disruptions: CountBucket;
  repetitions: CountBucket;
};

const KEY = "ah_monthly_classroom_checkins";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emit() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("ah-monthly-checkin-change"));
}

function read(): MonthlyClassroomCheckIn[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MonthlyClassroomCheckIn[]) : [];
  } catch {
    return [];
  }
}

function write(list: MonthlyClassroomCheckIn[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

export function newMonthlyCheckInId(): string {
  return `mci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function thisMonthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function getMonthlyCheckIns(): MonthlyClassroomCheckIn[] {
  return read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getLatestMonthlyCheckIn(): MonthlyClassroomCheckIn | undefined {
  return getMonthlyCheckIns()[0];
}

/** Has this exact month already been logged? Drives the "already submitted,
 * here's your summary" state instead of letting a teacher double-submit. */
export function hasSubmittedThisMonth(): boolean {
  const label = thisMonthLabel();
  return read().some((c) => c.month === label);
}

export function saveMonthlyCheckIn(
  answers: Pick<
    MonthlyClassroomCheckIn,
    "teachingMins" | "behaviourMins" | "transitionMins" | "disruptions" | "repetitions"
  >,
): MonthlyClassroomCheckIn {
  const list = read();
  const month = thisMonthLabel();
  const existingIdx = list.findIndex((c) => c.month === month);
  const record: MonthlyClassroomCheckIn = {
    id: existingIdx >= 0 ? list[existingIdx].id : newMonthlyCheckInId(),
    month,
    createdAt: new Date().toISOString(),
    ...answers,
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
