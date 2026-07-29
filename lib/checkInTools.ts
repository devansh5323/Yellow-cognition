// Lightweight session-local counters for the voice-based check-in tools.
// No voice capture exists yet — these track when a teacher goes to log an
// event via the dashboard shortcut. Replace with real capture + backend
// persistence when that lands.

import { listCheckInsForTeacher } from "@/lib/checkIn";

export type LoggedEvent = { at: string; studentId?: string };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function isThisWeek(iso: string): boolean {
  return Date.now() - +new Date(iso) <= WEEK_MS;
}

function readLog(key: string): LoggedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    // Tolerate the older plain-string-array shape.
    return parsed.map((entry) =>
      typeof entry === "string" ? { at: entry } : (entry as LoggedEvent),
    );
  } catch {
    return [];
  }
}

function appendLog(key: string, eventName: string, studentId?: string) {
  if (typeof window === "undefined") return;
  const list = readLog(key);
  list.push({ at: new Date().toISOString(), studentId });
  window.localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(eventName));
}

const BEHAVIOR_KEY = "ah_behavior_log_events";
const POSITIVE_KEY = "ah_positive_log_events";

export function logBehaviorEvent(studentId?: string) {
  appendLog(BEHAVIOR_KEY, "ah-behavior-log-change", studentId);
}

export function logPositiveEvent(studentId?: string) {
  appendLog(POSITIVE_KEY, "ah-positive-log-change", studentId);
}

export function getBehaviorLogCountThisWeek(): number {
  return readLog(BEHAVIOR_KEY).filter((e) => isThisWeek(e.at)).length;
}

export function getPositiveLogCountThisWeek(): number {
  return readLog(POSITIVE_KEY).filter((e) => isThisWeek(e.at)).length;
}

export function getBehaviorLogCountThisWeekForStudent(studentId: string): number {
  return readLog(BEHAVIOR_KEY).filter((e) => isThisWeek(e.at) && e.studentId === studentId).length;
}

export function getPositiveLogCountThisWeekForStudent(studentId: string): number {
  return readLog(POSITIVE_KEY).filter((e) => isThisWeek(e.at) && e.studentId === studentId).length;
}

/** Mon–Fri counts of this student's logged events this week, for a given log key. */
function dailyCountsForStudent(key: string, studentId: string): number[] {
  const events = readLog(key).filter((e) => isThisWeek(e.at) && e.studentId === studentId);
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const mondayStart = new Date(now.getTime() - dayIndex * DAY_MS);
  mondayStart.setHours(0, 0, 0, 0);

  const counts = [0, 0, 0, 0, 0];
  for (const e of events) {
    const diffDays = Math.floor((+new Date(e.at) - +mondayStart) / DAY_MS);
    if (diffDays >= 0 && diffDays < 5) counts[diffDays] += 1;
  }
  return counts;
}

export function getBehaviorLogDailyCountsForStudent(studentId: string): number[] {
  return dailyCountsForStudent(BEHAVIOR_KEY, studentId);
}

export function getPositiveLogDailyCountsForStudent(studentId: string): number[] {
  return dailyCountsForStudent(POSITIVE_KEY, studentId);
}

export function getClassCheckInsThisWeek(teacher: string): number {
  return listCheckInsForTeacher(teacher).filter((c) => isThisWeek(c.createdAt)).length;
}
