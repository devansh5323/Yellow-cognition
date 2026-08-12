// SEL Pulse & Check-in Tool — localStorage CRUD for pulses the SEL
// coordinator creates (who/when/frequency/format/competencies), following
// the same pattern as lib/interventionFollowUps.ts / lib/checkIn.ts.
//
// No real per-student pulse-response collection exists yet (no survey
// delivery/backend), so weekly grade-level scores are seed/demo data,
// clearly isolated below — same convention as SEED_CHECKINS in
// data/mockData.ts. Everything computed FROM that seed data (bands,
// week-over-week deltas, the 3-consecutive-week trend detection that
// backs "emerging patterns") is a real derivation over it, not a
// fabricated sentence.

import { STUDENTS, type Grade } from "@/data/mockData";

export const SEL_COMPETENCIES = [
  "Emotional regulation",
  "Coping with Challenges",
  "Peer relationships",
  "Sense of belonging",
  "Student-Teacher Relationships",
  "Emotional safety",
  "Help-seeking",
  "Confidence & self-efficacy",
  "Conflict",
  "School connectedness",
] as const;
export type SelCompetency = (typeof SEL_COMPETENCIES)[number];

// "Conflict" is an incidence signal — a rising score means more reported
// conflict, which is worse. Every other competency is a capacity signal —
// a rising score means healthier.
const HIGHER_IS_WORSE = new Set<SelCompetency>(["Conflict"]);

export type PulseDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
export const PULSE_DAYS: PulseDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export type PulseFrequency = "Weekly" | "Biweekly" | "Monthly";
export const PULSE_FREQUENCIES: PulseFrequency[] = ["Weekly", "Biweekly", "Monthly"];

export type PulseFormat = "4-question" | "6-question" | "8-question";
export const PULSE_FORMATS: { key: PulseFormat; questionCount: number; label: string }[] = [
  { key: "4-question", questionCount: 4, label: "4-question pulse" },
  { key: "6-question", questionCount: 6, label: "6-question pulse" },
  { key: "8-question", questionCount: 8, label: "8-question pulse" },
];

export function questionCountFor(format: PulseFormat): number {
  return PULSE_FORMATS.find((f) => f.key === format)?.questionCount ?? 4;
}

export type PulseStatus = "draft" | "active";

export type Pulse = {
  id: string;
  title: string;
  grade: Grade;
  day: PulseDay;
  frequency: PulseFrequency;
  format: PulseFormat;
  competencies: SelCompetency[];
  status: PulseStatus;
  createdAt: string;
};

/** Real, if currently narrow — the grades that actually have students in
 * the roster (the wider GRADES constant in mockData.ts is a school-wide
 * taxonomy list, not all of it backed by real students). */
export function pulseGradeOptions(): Grade[] {
  return Array.from(new Set(STUDENTS.map((s) => s.grade))).sort() as Grade[];
}

const KEY = "ah_sel_pulses";
const SEED_KEY = "ah_sel_pulses_seeded_v2";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const REAL_GRADES = ["Grade 3", "Grade 4"] as const;
const SEED_COMPETENCIES: SelCompetency[] = [
  "Sense of belonging",
  "Conflict",
  "Peer relationships",
  "Emotional safety",
  "Student-Teacher Relationships",
];

function seedPulses(): Pulse[] {
  const daysAgo = 34; // ~5 weekly cycles back
  return REAL_GRADES.map((grade, i) => ({
    id: `seed-pulse-${grade}`,
    title: "How are students feeling this week?",
    grade,
    day: "Friday",
    frequency: "Weekly",
    format: "4-question",
    competencies: SEED_COMPETENCIES,
    status: "active",
    createdAt: new Date(Date.now() - (daysAgo - i) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function ensureSeeded() {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(SEED_KEY)) return;
  window.localStorage.setItem(KEY, JSON.stringify(seedPulses()));
  window.localStorage.setItem(SEED_KEY, "1");
}

export function getPulses(): Pulse[] {
  if (!isBrowser()) return seedPulses();
  ensureSeeded();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Pulse[]) : [];
  } catch {
    return [];
  }
}

function writePulses(pulses: Pulse[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(pulses));
  window.dispatchEvent(new CustomEvent("ah-sel-pulse-change"));
}

export function createPulse(input: Omit<Pulse, "id" | "status" | "createdAt">): Pulse {
  const pulse: Pulse = { ...input, id: `pulse-${Date.now()}`, status: "draft", createdAt: new Date().toISOString() };
  writePulses([pulse, ...getPulses()]);
  return pulse;
}

export function assignPulse(id: string) {
  writePulses(getPulses().map((p) => (p.id === id ? { ...p, status: "active" } : p)));
}

/* ─────────────────────────────────────────────────────────
 * Weekly grade-level scores — SEED / DEMO DATA. No pulse-response
 * collection backend exists yet, so these stand in for what a real
 * multi-week rollout would produce. Only Grade 3 and Grade 4 appear here —
 * the only two grades with real students in data/mockData.ts. Index 0 =
 * oldest of the 5 weeks, last index = most recent — deliberately shaped so
 * Grade 4's Conflict signal is genuinely rising for 3 consecutive weeks
 * while Sense of Belonging holds flat, so "emerging patterns" below is a
 * real computation over this data, not a hardcoded sentence.
 * ───────────────────────────────────────────────────────── */

const SEED_WEEKLY_SERIES: Record<Grade, Partial<Record<SelCompetency, number[]>>> = {
  "Grade 3": {
    "Sense of belonging": [76, 77, 76, 78, 77],
    Conflict: [18, 17, 19, 18, 17],
    "Peer relationships": [74, 75, 74, 76, 75],
    "Emotional safety": [80, 81, 80, 82, 81],
    "Student-Teacher Relationships": [83, 84, 83, 85, 84],
  },
  "Grade 4": {
    "Sense of belonging": [74, 73, 75, 74, 75],
    Conflict: [22, 24, 29, 35, 42],
    "Peer relationships": [70, 71, 69, 70, 71],
    "Emotional safety": [78, 77, 79, 78, 79],
    "Student-Teacher Relationships": [80, 81, 82, 81, 83],
  },
} as Record<Grade, Partial<Record<SelCompetency, number[]>>>;

/** Ascending (oldest → newest) weekly scores for a grade+competency, or
 * `[]` if no pulse has collected that combination yet. */
export function weeklySeriesFor(grade: Grade, competency: SelCompetency): number[] {
  return SEED_WEEKLY_SERIES[grade]?.[competency] ?? [];
}

export type Band = "healthy" | "watch" | "concern";

export const BAND_LABEL: Record<Band, string> = { healthy: "Healthy", watch: "Watch", concern: "Concern" };
export const BAND_TONE: Record<Band, string> = {
  healthy: "hsl(142 55% 45%)",
  watch: "hsl(38 92% 48%)",
  concern: "hsl(0 78% 56%)",
};

export function bandFor(competency: SelCompetency, score: number): Band {
  if (HIGHER_IS_WORSE.has(competency)) {
    if (score <= 20) return "healthy";
    if (score <= 40) return "watch";
    return "concern";
  }
  if (score >= 70) return "healthy";
  if (score >= 50) return "watch";
  return "concern";
}

export type PulseResult = {
  competency: SelCompetency;
  score: number | null;
  delta: number | null;
  band: Band | null;
};

/** "View results" — latest score, band, and week-over-week delta for each
 * competency this pulse tracks. `null` for a competency with no
 * collected weeks yet (honest empty state, not a fabricated number). */
export function resultsForPulse(pulse: Pulse): PulseResult[] {
  return pulse.competencies.map((competency) => {
    const series = weeklySeriesFor(pulse.grade, competency);
    if (series.length === 0) return { competency, score: null, delta: null, band: null };
    const score = series[series.length - 1];
    const delta = series.length >= 2 ? score - series[series.length - 2] : null;
    return { competency, score, delta, band: bandFor(competency, score) };
  });
}

export type GradeComparisonRow = { grade: Grade; score: number | null; band: Band | null };

/** "Compare grades" — latest score for one competency across every real
 * grade that has an active pulse tracking it. */
export function compareGrades(competency: SelCompetency, grades: Grade[]): GradeComparisonRow[] {
  return grades.map((grade) => {
    const series = weeklySeriesFor(grade, competency);
    if (series.length === 0) return { grade, score: null, band: null };
    const score = series[series.length - 1];
    return { grade, score, band: bandFor(competency, score) };
  });
}

export type PatternInsight = {
  grade: Grade;
  concernCompetency: SelCompetency;
  direction: "increasing" | "decreasing";
  stableCompetency: SelCompetency | null;
  sentence: string;
};

function isConsecutiveTrend(series: number[], weeks = 3): "increasing" | "decreasing" | null {
  if (series.length < weeks) return null;
  const window = series.slice(-weeks);
  let increasing = true;
  let decreasing = true;
  for (let i = 1; i < window.length; i++) {
    if (window[i] <= window[i - 1]) increasing = false;
    if (window[i] >= window[i - 1]) decreasing = false;
  }
  if (increasing) return "increasing";
  if (decreasing) return "decreasing";
  return null;
}

function isStable(series: number[], weeks = 4, maxRange = 4): boolean {
  if (series.length < weeks) return false;
  const window = series.slice(-weeks);
  return Math.max(...window) - Math.min(...window) <= maxRange;
}

/** "View emerging patterns" — flags a competency that's been trending in
 * the direction that actually matters (rising conflict, falling belonging,
 * etc.) for 3 straight weeks, for one grade. Returns `null` when nothing
 * in that grade's real weekly series clears the bar — an honest "nothing
 * to flag" rather than padding every grade with a manufactured concern. */
export function emergingPatternFor(grade: Grade): PatternInsight | null {
  const tracked = Object.keys(SEED_WEEKLY_SERIES[grade] ?? {}) as SelCompetency[];
  for (const competency of tracked) {
    const series = weeklySeriesFor(grade, competency);
    const trend = isConsecutiveTrend(series);
    if (!trend) continue;
    const worsening = HIGHER_IS_WORSE.has(competency) ? trend === "increasing" : trend === "decreasing";
    if (!worsening) continue;

    const stableCompetency = tracked.find((c) => c !== competency && isStable(weeklySeriesFor(grade, c))) ?? null;
    const verb = trend === "increasing" ? "increased" : "declined";
    const sentence = stableCompetency
      ? `${grade} ${stableCompetency} has remained stable, but reported ${competency.toLowerCase()} has ${verb} for three consecutive weeks.`
      : `Reported ${competency.toLowerCase()} has ${verb} for three consecutive weeks in ${grade}.`;
    return { grade, concernCompetency: competency, direction: trend, stableCompetency, sentence };
  }
  return null;
}

/** Every grade with an active pulse, flagged where a real pattern exists —
 * feeds the dashboard's Action Hub. */
export function allEmergingPatterns(pulses: Pulse[]): PatternInsight[] {
  const grades = Array.from(new Set(pulses.filter((p) => p.status === "active").map((p) => p.grade)));
  return grades.map((g) => emergingPatternFor(g)).filter((p): p is PatternInsight => p !== null);
}

/* ─────────────────────────────────────────────────────────
 * Segment 1 — Action Hub. Priority-ranked, real-only rungs — same "no
 * padding" convention as lib/specialEdCaseload.ts's Action Hub. Right now
 * the only tool feeding it is the Pulse & Check-in tool's emerging
 * patterns; more rungs join here as later SEL tools (referrals, coaching
 * requests, group reviews, etc.) get built.
 * ───────────────────────────────────────────────────────── */

export type SelActionPriority = "high" | "medium" | "low";

export type SelActionItem = {
  id: string;
  priority: SelActionPriority;
  action: string;
  whyItMatters: string;
  related: string;
  ctaLabel: string;
  href: string;
};

export function buildSelActionHub(pulses: Pulse[]): SelActionItem[] {
  const patterns = allEmergingPatterns(pulses);
  const items: SelActionItem[] = patterns.map((p) => ({
    id: `pattern-${p.grade}-${p.concernCompetency}`,
    priority: bandFor(p.concernCompetency, weeklySeriesFor(p.grade, p.concernCompetency).slice(-1)[0]) === "concern"
      ? "high"
      : "medium",
    action: `Review rising ${p.concernCompetency.toLowerCase()} in ${p.grade}`,
    whyItMatters: p.sentence,
    related: p.grade,
    ctaLabel: "View pattern",
    href: `/sel/pulse?grade=${encodeURIComponent(p.grade)}`,
  }));
  const rank: Record<SelActionPriority, number> = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
