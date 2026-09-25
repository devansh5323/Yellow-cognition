// Class Student Wellbeing — data + helpers for the "Student Wellbeing"
// driver group. Computed directly from real per-student wellbeing fields
// (data/realStudents.ts) rather than derived gameplay proxies — the real
// Scores/counts are averaged/filtered over the real values that exist, and a
// driver with zero source values across the roster surfaces as `null` ("not
// enough data yet") instead of a fabricated number.

import { REAL_STUDENTS, type RealStudent } from "@/data/realStudents";

const STUDENTS = REAL_STUDENTS;
type Student = RealStudent;

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/* ─────────────────────────────────────────────────────────
 * 3 Student Wellbeing drivers
 * ───────────────────────────────────────────────────────── */

export type WellbeingDriverKey = "anxiety" | "peer-safety" | "frustration";

const DRIVER_ORDER: WellbeingDriverKey[] = ["anxiety", "peer-safety", "frustration"];

export const WELLBEING_LABEL: Record<WellbeingDriverKey, string> = {
  anxiety: "Anxiety and Coping Index",
  "peer-safety": "Peer Safety and Belonging",
  frustration: "Anger and Emotional Regulation",
};

export const WELLBEING_DESCRIPTION: Record<WellbeingDriverKey, string> = {
  anxiety: "How well your class copes with stress",
  "peer-safety": "How inclusive peer interactions are in your class",
  frustration: "How your class manages strong emotions",
};

export const WELLBEING_HUE: Record<WellbeingDriverKey, string> = {
  anxiety: "hsl(243 75% 65%)",
  "peer-safety": "hsl(262 60% 62%)",
  frustration: "hsl(28 88% 54%)",
};

function studentDriverScore(s: Student, key: WellbeingDriverKey): number | null {
  switch (key) {
    case "anxiety":
      return s.studentWellbeing.anxietyAndCopingIndex;
    case "peer-safety":
      return s.studentWellbeing.peerSafetyAndBelonging;
    case "frustration":
      return s.studentWellbeing.angerAndEmotionalRegulation;
  }
}

export type WellbeingStatus = "strong" | "stable" | "watch" | "support";

export const WELLBEING_STATUS_LABEL: Record<WellbeingStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  watch: "Watch",
  support: "Needs Support",
};

export const WELLBEING_STATUS_TONE: Record<WellbeingStatus, string> = {
  strong: "hsl(142 55% 42%)",
  stable: "hsl(212 55% 45%)",
  watch: "hsl(38 92% 50%)",
  support: "hsl(0 78% 56%)",
};

export function wellbeingStatusFromScore(score: number): WellbeingStatus {
  if (score >= 80) return "strong";
  if (score >= 65) return "stable";
  if (score >= 50) return "watch";
  return "support";
}

const STRUGGLE_THRESHOLD = 55;

const MAIN_SIGNAL: Record<WellbeingDriverKey, (count: number, hasData: boolean) => string> = {
  anxiety: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} elevated stress responses during high-pressure tasks.`
        : "No students currently show elevated stress signals.",
  "peer-safety": (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} reduced engagement during group or peer activities.`
        : "Peer interactions look healthy across the class.",
  frustration: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} frequent frustration spikes after setbacks.`
        : "Emotional regulation looks steady across the class.",
};

export type WellbeingDriverStat = {
  key: WellbeingDriverKey;
  label: string;
  description: string;
  hue: string;
  score: number | null;
  status: WellbeingStatus | null;
  dataCount: number;
  studentCount: number;
  mainSignal: string;
};

export function classWellbeingDrivers(students: Student[] = STUDENTS): WellbeingDriverStat[] {
  return DRIVER_ORDER.map((key) => {
    const scores = students
      .map((s) => studentDriverScore(s, key))
      .filter((v): v is number => v != null);
    const score = avg(scores);
    const hasData = scores.length > 0;
    const studentCount = scores.filter((v) => v < STRUGGLE_THRESHOLD).length;
    return {
      key,
      label: WELLBEING_LABEL[key],
      description: WELLBEING_DESCRIPTION[key],
      hue: WELLBEING_HUE[key],
      score,
      status: score != null ? wellbeingStatusFromScore(score) : null,
      dataCount: scores.length,
      studentCount,
      mainSignal: MAIN_SIGNAL[key](studentCount, hasData),
    };
  });
}

export function studentsByWellbeingDriver(
  key: WellbeingDriverKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students
    .map((s) => ({ s, v: studentDriverScore(s, key) }))
    .filter((x): x is { s: Student; v: number } => x.v != null && x.v < STRUGGLE_THRESHOLD)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}
