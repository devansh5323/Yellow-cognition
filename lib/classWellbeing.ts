// Class Student Wellbeing — data + helpers for the "Student Wellbeing" driver
// group. Derived from the same gameplay-adjacent student mocks (KSAs,
// indicators, sub-domains, attention domains) used by lib/classLearning.ts —
// deliberately anchored on studentAttentionDomains() for the primary score,
// since that's the one field in this mock dataset with a real systematic
// per-domain offset; ksa/indicator/subDomain entries are independently
// pfi-jittered with no per-name bias, so they only add per-student flavor.

import {
  STUDENTS,
  studentAttentionDomains,
  type AttentionDomainKey,
  type Student,
} from "@/data/mockData";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function ksaScore(s: Student, name: string): number {
  return s.ksa.find((k) => k.name === name)?.score ?? 60;
}

function indicatorScore(s: Student, name: string): number {
  return s.indicators.find((i) => i.name === name)?.score ?? 60;
}

function subDomainScore(s: Student, name: string): number {
  return s.subDomains.find((d) => d.name === name)?.score ?? 60;
}

function domainScore(s: Student, key: AttentionDomainKey): number {
  return studentAttentionDomains(s)[key];
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

// A small, deliberately-authored weekly delta per driver — this mock dataset
// has no real historical wellbeing time series (only pfi/engagement history
// exists), so the trend direction is asserted the same way TaskSnapshotData
// synthesizes its "previous" values: explicit, not fabricated to look
// falsely precise.
const WEEKLY_DELTA: Record<WellbeingDriverKey, number> = {
  anxiety: 3,
  "peer-safety": 2,
  frustration: -2,
};

function studentDriverScore(s: Student, key: WellbeingDriverKey): number {
  switch (key) {
    case "anxiety":
      // Lower hyperactivity reads as calmer under pressure; blended with
      // frustration tolerance and emotional-regulation sub-domain.
      return clamp(
        (100 - domainScore(s, "hyp")) * 0.5 +
          ksaScore(s, "Frustration Tolerance") * 0.3 +
          subDomainScore(s, "Emotional Regulation") * 0.2,
      );
    case "peer-safety":
      // Behavioural regulation is the strongest real proxy this dataset has
      // for prosocial peer interaction, blended with social/listening KSAs.
      return clamp(
        domainScore(s, "beh") * 0.5 +
          ksaScore(s, "Social Perception") * 0.3 +
          indicatorScore(s, "Listens without interrupting") * 0.2,
      );
    case "frustration":
      // Selective attention + impulse control + self-regulation — how well
      // a student holds together when frustrated.
      return clamp(
        domainScore(s, "sel") * 0.4 +
          subDomainScore(s, "Impulse Control") * 0.35 +
          ksaScore(s, "Self Regulation") * 0.25,
      );
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

const MAIN_SIGNAL: Record<WellbeingDriverKey, (count: number) => string> = {
  anxiety: (n) =>
    n > 0
      ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} elevated stress responses during high-pressure tasks.`
      : "No students currently show elevated stress signals.",
  "peer-safety": (n) =>
    n > 0
      ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} reduced engagement during group or peer activities.`
      : "Peer interactions look healthy across the class.",
  frustration: (n) =>
    n > 0
      ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} frequent frustration spikes after setbacks.`
      : "Emotional regulation looks steady across the class.",
};

const TOP_SKILL_FIELDS: Record<WellbeingDriverKey, { name: string; value: (s: Student) => number }[]> = {
  anxiety: [
    { name: "Frustration Tolerance", value: (s) => ksaScore(s, "Frustration Tolerance") },
    { name: "Emotional Regulation", value: (s) => subDomainScore(s, "Emotional Regulation") },
    { name: "Self-Calming", value: (s) => 100 - domainScore(s, "hyp") },
  ],
  "peer-safety": [
    { name: "Social Perception", value: (s) => ksaScore(s, "Social Perception") },
    { name: "Active Listening", value: (s) => ksaScore(s, "Active Listening") },
    { name: "Behavioral Regulation", value: (s) => domainScore(s, "beh") },
  ],
  frustration: [
    { name: "Impulse Control", value: (s) => subDomainScore(s, "Impulse Control") },
    { name: "Self Regulation", value: (s) => ksaScore(s, "Self Regulation") },
    { name: "Selective Attention", value: (s) => domainScore(s, "sel") },
  ],
};

export type WellbeingDriverStat = {
  key: WellbeingDriverKey;
  label: string;
  description: string;
  hue: string;
  score: number;
  prevScore: number;
  status: WellbeingStatus;
  studentCount: number;
  mainSignal: string;
  topSkills: { name: string; score: number }[];
};

export function classWellbeingDrivers(students: Student[] = STUDENTS): WellbeingDriverStat[] {
  return DRIVER_ORDER.map((key) => {
    const scores = students.map((s) => studentDriverScore(s, key));
    const score = avg(scores);
    const studentCount = scores.filter((v) => v < STRUGGLE_THRESHOLD).length;
    const topSkills = TOP_SKILL_FIELDS[key].map(({ name, value }) => ({
      name,
      score: avg(students.map(value)),
    }));
    return {
      key,
      label: WELLBEING_LABEL[key],
      description: WELLBEING_DESCRIPTION[key],
      hue: WELLBEING_HUE[key],
      score,
      prevScore: clamp(score - WEEKLY_DELTA[key]),
      status: wellbeingStatusFromScore(score),
      studentCount,
      mainSignal: MAIN_SIGNAL[key](studentCount),
      topSkills,
    };
  });
}

export function studentsByWellbeingDriver(
  key: WellbeingDriverKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students
    .map((s) => ({ s, v: studentDriverScore(s, key) }))
    .filter((x) => x.v < STRUGGLE_THRESHOLD)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}
