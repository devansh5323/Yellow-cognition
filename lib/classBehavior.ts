// Class Behavior & Discipline — data + helpers.
// Derives the class-level behavior picture from the existing student mocks
// (CSI, BEH/HYP attention domains, sub-domain scores, monthly series). No
// new mocks required; purely a re-shape of what already powers the dashboard.

import {
  STUDENTS,
  behaviorAnalytics,
  classMonthlyAttention,
  studentAttentionDomains,
  studentMonitorRow,
  type Student,
} from "@/data/mockData";
import { studentComposites } from "@/lib/classHealth";
import type { FollowUpRecord } from "@/lib/interventionFollowUps";

/* ─────────────────────────────────────────────────────────
 * Snapshot
 * ───────────────────────────────────────────────────────── */

export type BehaviorStatus = "strong" | "stable" | "reinforcement" | "support";

export const BEHAVIOR_STATUS_LABEL: Record<BehaviorStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  reinforcement: "Needs Reinforcement",
  support: "Needs Support",
};

export const BEHAVIOR_STATUS_TONE: Record<BehaviorStatus, string> = {
  strong: "hsl(142 55% 42%)",
  stable: "hsl(212 55% 45%)",
  reinforcement: "hsl(38 92% 50%)",
  support: "hsl(0 78% 56%)",
};

export const BEHAVIOR_STATUS_RANGE: Record<BehaviorStatus, string> = {
  strong: "85–100",
  stable: "70–84",
  reinforcement: "55–69",
  support: "0–54",
};

export const BEHAVIOR_STATUS_DESCRIPTION: Record<BehaviorStatus, string> = {
  strong: "Class is regulating itself — keep current routines.",
  stable: "Most students are managing well — light reinforcement helps the rest.",
  reinforcement:
    "Disruptions are interrupting flow — tighten transitions and restate expectations.",
  support: "Behaviour is eroding learning time — structured supports needed.",
};

/** Same 4 bands as BEHAVIOR_STATUS_LABEL, relabeled for driver cards
 * (Strong / Stable / Watch / Needs Support) to match that section's own
 * naming convention. */
export const DRIVER_STATUS_LABEL: Record<BehaviorStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  reinforcement: "Watch",
  support: "Needs Support",
};

export function statusFromScore(score: number): BehaviorStatus {
  if (score >= 85) return "strong";
  if (score >= 70) return "stable";
  if (score >= 55) return "reinforcement";
  return "support";
}

export type BehaviorTrendPoint = {
  label: string;
  /** Behaviour control score (higher = better) */
  score: number;
  /** Disruptions per class (lower = better) */
  disruptions: number;
  /** Time gained vs the worst month, in minutes */
  timeGained: number;
};

export type BehaviorSnapshotData = {
  controlScore: number;
  prevControlScore: number;
  delta: number;
  status: BehaviorStatus;
  total: number;
  /** Avg disruptions per class (current month) */
  disruptionsPerClass: number;
  prevDisruptionsPerClass: number;
  /** Minutes gained from improved behaviour management this month */
  minutesGained: number;
  prevMinutesGained: number;
  /** Class discipline health label — derived from controlScore */
  healthLabel: string;
  /** Counts at each status band */
  statusDistribution: Record<BehaviorStatus, number>;
  /** Last 6 months trend */
  trend: BehaviorTrendPoint[];
  /** Students in the "Watch"-equivalent band — a real proxy for "minor
   * behaviours" this period (no per-incident severity log exists yet). */
  minorBehaviours: number;
  prevMinorBehaviours: number;
  /** Students in the "Needs Support" band — the real proxy for "major
   * behaviours" this period. */
  majorBehaviours: number;
  prevMajorBehaviours: number;
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function studentBehaviorScore(s: Student): number {
  // Blend of:
  //  - BEH attention domain (regulation)
  //  - inverse of HYP (impulse / hyperactivity)
  //  - composite pillar (impulse + emo) — already in classHealth's pillarScores
  const dom = studentAttentionDomains(s);
  const beh = dom.beh;
  const hyp = dom.hyp;
  const impulse = s.subDomains[4]?.score ?? s.csi;
  const emo = s.subDomains[5]?.score ?? s.csi;
  const blended = beh * 0.35 + (100 - hyp) * 0.2 + impulse * 0.25 + emo * 0.2;
  return Math.max(0, Math.min(100, Math.round(blended)));
}

function studentPrevBehaviorScore(s: Student): number {
  return Math.max(0, studentBehaviorScore(s) - 4);
}

function buildTrend(students: Student[]): BehaviorTrendPoint[] {
  const monthly = classMonthlyAttention(students);
  // Synth disruption + time-gained around the monthly attention series so the
  // three lines stay coherent (better attention -> fewer disruptions -> more
  // teaching time recovered).
  return monthly.map((m, i) => {
    const score = m.attention ?? 60;
    // Disruptions per class — invert score, anchor to ~6.
    const disruptions = Math.max(2, Math.round(8 - (score - 60) / 6));
    // Time gained — positive when score climbs, soft floor at 0.
    const timeGained = Math.max(0, Math.round((score - 55) * (i / 5 + 0.6)));
    return { label: m.month, score, disruptions, timeGained };
  });
}

export function classBehaviorSnapshot(students: Student[] = STUDENTS): BehaviorSnapshotData {
  const total = students.length;
  const scores = students.map(studentBehaviorScore);
  const prevScores = students.map(studentPrevBehaviorScore);
  const controlScore = avg(scores);
  const prevControlScore = avg(prevScores);

  const statusDistribution: Record<BehaviorStatus, number> = {
    strong: 0,
    stable: 0,
    reinforcement: 0,
    support: 0,
  };
  for (const s of scores) statusDistribution[statusFromScore(s)] += 1;

  const prevStatusDistribution: Record<BehaviorStatus, number> = {
    strong: 0,
    stable: 0,
    reinforcement: 0,
    support: 0,
  };
  for (const s of prevScores) prevStatusDistribution[statusFromScore(s)] += 1;

  const analytics = behaviorAnalytics(students);
  // Per-class disruption count — the seed analytics gives a per-week figure;
  // assume ~5 classes/week. Anchor to the score so the number tracks reality.
  const disruptionsPerClass = Math.max(
    1,
    Math.round(analytics.incidentsPerWeek / 5 + (75 - controlScore) / 12),
  );
  const prevDisruptionsPerClass = disruptionsPerClass + 2;
  const minutesGained = analytics.timeRecovered;
  const prevMinutesGained = Math.max(0, minutesGained - 18);

  return {
    controlScore,
    prevControlScore,
    delta: controlScore - prevControlScore,
    status: statusFromScore(controlScore),
    total,
    disruptionsPerClass,
    prevDisruptionsPerClass,
    minutesGained,
    prevMinutesGained,
    healthLabel: BEHAVIOR_STATUS_LABEL[statusFromScore(controlScore)],
    statusDistribution,
    trend: buildTrend(students),
    minorBehaviours: statusDistribution.reinforcement,
    prevMinorBehaviours: prevStatusDistribution.reinforcement,
    majorBehaviours: statusDistribution.support,
    prevMajorBehaviours: prevStatusDistribution.support,
  };
}

/* ─────────────────────────────────────────────────────────
 * Weekly trend — score, minor/major behaviours, positive logs.
 * No real week-over-week history is tracked at class scale yet — this
 * backfills a plausible 5-week series ending exactly at today's real
 * values, same "hardcoded but plausible" convention used across this file
 * (see buildTrend/PREV_OFFSET above).
 * ───────────────────────────────────────────────────────── */

export type WeeklyTrendPoint = {
  label: string;
  score: number;
  minor: number;
  major: number;
  positive: number;
};

const WEEKLY_TREND_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4", "This Week"];

function backfillWeekly(current: number, weeklyDelta: number, weeks: number): number[] {
  const series = [current];
  let value = current;
  for (let i = 1; i < weeks; i++) {
    value = Math.max(0, Math.round(value - weeklyDelta * (0.5 + (i % 3) * 0.2)));
    series.unshift(value);
  }
  return series;
}

export function behaviorWeeklyTrend(current: {
  score: number;
  scoreDelta: number;
  minor: number;
  minorDelta: number;
  major: number;
  majorDelta: number;
  positive: number;
  positiveDelta: number;
}): WeeklyTrendPoint[] {
  const weeks = WEEKLY_TREND_LABELS.length;
  const scoreSeries = backfillWeekly(current.score, current.scoreDelta, weeks);
  const minorSeries = backfillWeekly(current.minor, current.minorDelta, weeks);
  const majorSeries = backfillWeekly(current.major, current.majorDelta, weeks);
  const positiveSeries = backfillWeekly(current.positive, current.positiveDelta, weeks);

  return WEEKLY_TREND_LABELS.map((label, i) => ({
    label,
    score: scoreSeries[i],
    minor: minorSeries[i],
    major: majorSeries[i],
    positive: positiveSeries[i],
  }));
}

/* ─────────────────────────────────────────────────────────
 * Disruption breakdown — six behaviour & regulation driver signals
 * ───────────────────────────────────────────────────────── */

export type DisruptionKey =
  | "off-task"
  | "impulse"
  | "transition"
  | "peer"
  | "anxiety"
  | "emotional";

export const DISRUPTION_LABEL: Record<DisruptionKey, string> = {
  "off-task": "Off-Task Behaviour",
  impulse: "Impulse Control",
  transition: "Transition Readiness",
  peer: "Peer Interaction",
  anxiety: "Anxiety & Coping Readiness",
  emotional: "Emotional Regulation",
};

export const DISRUPTION_DESCRIPTION: Record<DisruptionKey, string> = {
  "off-task": "Drifting from the assigned activity — doodling, side conversations, fidgeting.",
  impulse: "Calling out, leaving seat, struggling to wait their turn.",
  transition: "Losing focus and momentum in the minutes around activity changes.",
  peer: "Disrupting peers, interrupting, or escalating conflicts during work.",
  anxiety: "Difficulty settling and coping under pressure or unfamiliar demands.",
  emotional: "Big reactions to small frustrations — shutting down or escalating.",
};

export const DISRUPTION_HUE: Record<DisruptionKey, string> = {
  "off-task": "hsl(38 92% 55%)",
  impulse: "hsl(20 85% 58%)",
  transition: "hsl(196 75% 50%)",
  peer: "hsl(286 60% 60%)",
  anxiety: "hsl(0 78% 58%)",
  emotional: "hsl(258 55% 60%)",
};

/** Short 2–4 word pattern labels for compact spaces (the watchlist rail) —
 * same real driver categorisation as DISRUPTION_LABEL, just condensed. */
export const DISRUPTION_SHORT_PATTERN: Record<DisruptionKey, string> = {
  "off-task": "Off-task + repeated reminders",
  impulse: "Impulsive / calling out",
  transition: "Transition difficulty",
  peer: "Peer conflict",
  anxiety: "Anxiety / coping difficulty",
  emotional: "Emotional dysregulation",
};

/** Watchlist tier label — reuses the same real score bands as
 * BEHAVIOR_STATUS_LABEL/DRIVER_STATUS_LABEL, relabeled again for this
 * section's own PBIS-tier framing (Tier 3 = most severe). */
export const WATCHLIST_TIER_LABEL: Record<BehaviorStatus, string> = {
  support: "Tier 3",
  reinforcement: "Tier 2",
  stable: "Watch",
  strong: "Watch",
};

/** 2–3 short, concrete "what's showing up" bullets per driver — the same
 * illustrative-pattern convention as DISRUPTION_DESCRIPTION, just broken
 * into the bullet list the expanded driver card shows. */
export const DISRUPTION_SIGNS: Record<DisruptionKey, string[]> = {
  "off-task": [
    "Students lose focus after task instructions.",
    "Repeated prompts needed during independent work.",
    "Delayed start is visible in written assignments.",
  ],
  impulse: [
    "Calling out before being called on.",
    "Leaving seat without permission during work blocks.",
    "Struggles to wait during turn-taking activities.",
  ],
  transition: [
    "Most lost minutes happen in the 2 minutes after activity changes.",
    "Slow re-engagement after switching tasks or materials.",
    "Lines and hand-offs between activities run long.",
  ],
  peer: [
    "Conflicts cluster around the same seating groups.",
    "Interruptions rise during partner or group work.",
    "Peer proximity correlates with off-task drift.",
  ],
  anxiety: [
    "Hesitates or avoids starting unfamiliar or high-stakes tasks.",
    "Physical signs of stress before assessments or transitions.",
    "Difficulty self-soothing after a setback.",
  ],
  emotional: [
    "Shuts down or escalates after small frustrations.",
    "Recovery time after an outburst is longer than peers.",
    "Big reactions to minor changes in routine.",
  ],
};

export type DisruptionStat = {
  key: DisruptionKey;
  label: string;
  description: string;
  hue: string;
  /** Severity score 0–100; higher = more disruption (inverted relative to control). */
  severity: number;
  prevSeverity: number;
  /** Count of students contributing to this disruption pattern. */
  studentCount: number;
  /** Control score 0–100 (100 − severity) — higher is healthier, matching how
   * every other score reads in this app. */
  score: number;
  status: BehaviorStatus;
  /** This week's score change vs last week (positive = improving). */
  weeklyChange: number;
};

function driverSignal(key: DisruptionKey, s: Student): boolean {
  const dom = studentAttentionDomains(s);
  const subAt = (i: number) => s.subDomains[i]?.score ?? 60;
  const monitor = studentMonitorRow(s);
  switch (key) {
    case "off-task":
      return dom.sus < 60;
    case "impulse":
      return dom.hyp > 70;
    case "transition":
      return dom.swi < 60;
    case "peer":
      return subAt(6) < 60;
    case "anxiety":
      return monitor.selfReg < 60;
    case "emotional":
      return subAt(5) < 58;
  }
}

const DISRUPTION_ORDER: DisruptionKey[] = [
  "off-task",
  "impulse",
  "transition",
  "peer",
  "anxiety",
  "emotional",
];

/**
 * Score each driver by inspecting how many students present that pattern.
 * Mock-only: thresholds picked so the six drivers surface visibly without
 * any one dominating.
 */
export function classDisruptionBreakdown(students: Student[] = STUDENTS): DisruptionStat[] {
  const total = Math.max(1, students.length);
  const toSeverity = (count: number) => Math.round((count / total) * 100);

  // Same "hardcoded but plausible" weekly-shift convention used across this
  // app — no real week-over-week disruption log exists yet, so the prior
  // week's severity is nudged by a small fixed offset per driver.
  const PREV_OFFSET: Record<DisruptionKey, number> = {
    "off-task": 6,
    impulse: 5,
    transition: 3,
    peer: 2,
    anxiety: 2,
    emotional: -3,
  };

  return DISRUPTION_ORDER.map((key) => {
    const studentCount = students.filter((s) => driverSignal(key, s)).length;
    const severity = toSeverity(studentCount);
    const prevSeverity = Math.max(0, severity + PREV_OFFSET[key]);
    const score = 100 - severity;
    const prevScore = 100 - prevSeverity;
    return {
      key,
      label: DISRUPTION_LABEL[key],
      description: DISRUPTION_DESCRIPTION[key],
      hue: DISRUPTION_HUE[key],
      severity,
      prevSeverity,
      studentCount,
      score,
      status: statusFromScore(score),
      weeklyChange: score - prevScore,
    };
  });
}

/** Returns students who contribute to a given disruption category. */
export function studentsByDisruption(
  key: DisruptionKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students.filter((s) => driverSignal(key, s));
}

export type DriverSkill = { name: string; score: number };

/** Real per-driver skill fields, averaged across the students actually
 * contributing to that driver (falls back to the whole class if none are
 * currently flagged) — same "closest honest proxy" convention used
 * throughout this file, just presented as named skills instead of raw
 * attention-domain scores. */
const DRIVER_SKILL_FIELDS: Record<DisruptionKey, { name: string; value: (s: Student) => number }[]> = {
  "off-task": [
    { name: "Sustained attention", value: (s) => studentAttentionDomains(s).sus },
    { name: "Self-monitoring", value: (s) => studentAttentionDomains(s).swi },
    { name: "Task initiation", value: (s) => studentMonitorRow(s).selfReg },
  ],
  impulse: [
    { name: "Impulse control", value: (s) => s.subDomains[4]?.score ?? 60 },
    { name: "Inhibitory control", value: (s) => 100 - studentAttentionDomains(s).hyp },
    { name: "Self-regulation", value: (s) => studentMonitorRow(s).selfReg },
  ],
  transition: [
    { name: "Cognitive flexibility", value: (s) => studentAttentionDomains(s).swi },
    { name: "Attention switching", value: (s) => s.subDomains[3]?.score ?? 60 },
    { name: "Self-monitoring", value: (s) => studentMonitorRow(s).selfReg },
  ],
  peer: [
    { name: "Social cognition", value: (s) => s.subDomains[6]?.score ?? 60 },
    { name: "Impulse control", value: (s) => s.subDomains[4]?.score ?? 60 },
    { name: "Perspective taking", value: (s) => studentMonitorRow(s).selfReg },
  ],
  anxiety: [
    { name: "Emotion identification", value: (s) => s.subDomains[5]?.score ?? 60 },
    { name: "Calming strategies", value: (s) => studentMonitorRow(s).selfReg },
    { name: "Self-regulation", value: (s) => studentAttentionDomains(s).beh },
  ],
  emotional: [
    { name: "Self-regulation", value: (s) => s.subDomains[5]?.score ?? 60 },
    { name: "Frustration tolerance", value: (s) => studentAttentionDomains(s).beh },
    { name: "Coping strategies", value: (s) => studentMonitorRow(s).selfReg },
  ],
};

export function driverImpactingSkills(
  key: DisruptionKey,
  students: Student[] = STUDENTS,
): DriverSkill[] {
  const contributing = studentsByDisruption(key, students);
  const pool = contributing.length > 0 ? contributing : students;
  return DRIVER_SKILL_FIELDS[key].map(({ name, value }) => ({
    name,
    score: avg(pool.map(value)),
  }));
}

/* ─────────────────────────────────────────────────────────
 * Behaviour Pattern Insights — cross-pattern summary of what's
 * showing up across every driver's real weekly movement, plus (when
 * real follow-up logs exist) which tried strategy is actually working.
 * ───────────────────────────────────────────────────────── */

export type PatternInsight = {
  id: string;
  type: "watch" | "strength";
  text: string;
};

const WATCH_TEXT: Record<DisruptionKey, string> = {
  "off-task": "Repeated reminders increased this week.",
  impulse: "Impulse-control incidents increased this week.",
  transition: "Transitions are creating more friction this week.",
  peer: "Peer conflicts increased this week.",
  anxiety: "Coping and self-regulation dipped this week.",
  emotional: "Emotional regulation dipped this week.",
};

const STRENGTH_TEXT: Record<DisruptionKey, string> = {
  "off-task": "Focus during independent work held steady this week.",
  impulse: "Impulse control is holding steady this week.",
  transition: "Transitions are running smoother this week.",
  peer: "Peer interaction stayed positive this week.",
  anxiety: "Coping strategies are taking hold this week.",
  emotional: "Emotional recovery is improving this week.",
};

const GOOD_STATUS: BehaviorStatus[] = ["strong", "stable"];

/** Cross-pattern insights — "what is Yellow noticing across all logs and
 * check-ins?" Each driver contributes at most one insight (Watch if it
 * worsened this week, Strength if it's healthy and holding/improving);
 * borderline cases (improving but still Watch/Needs Support) are skipped
 * rather than forced into either bucket. When real follow-up logs exist,
 * the single most-effective tried strategy is added as a Strength insight
 * too — omitted entirely when nothing has been logged yet, rather than
 * fabricating one. */
export function behaviorPatternInsights(
  breakdown: DisruptionStat[],
  followUps: Pick<FollowUpRecord, "support" | "outcome">[] = [],
  limit = 5,
): PatternInsight[] {
  const watch = breakdown
    .filter((d) => d.weeklyChange < 0)
    .sort((a, b) => a.weeklyChange - b.weeklyChange)
    .map((d) => ({ id: `watch-${d.key}`, type: "watch" as const, text: WATCH_TEXT[d.key] }));

  const strength = breakdown
    .filter((d) => d.weeklyChange >= 0 && GOOD_STATUS.includes(d.status))
    .sort((a, b) => b.weeklyChange - a.weeklyChange)
    .map((d) => ({ id: `strength-${d.key}`, type: "strength" as const, text: STRENGTH_TEXT[d.key] }));

  const insights: PatternInsight[] = [];
  // Interleave so the mix reads as genuinely cross-pattern, not one long
  // watch list followed by one long strength list.
  const maxLen = Math.max(watch.length, strength.length);
  for (let i = 0; i < maxLen; i++) {
    if (watch[i]) insights.push(watch[i]);
    if (strength[i]) insights.push(strength[i]);
  }

  if (followUps.length > 0) {
    const byStrategy = new Map<string, { improved: number; total: number }>();
    for (const f of followUps) {
      const entry = byStrategy.get(f.support) ?? { improved: 0, total: 0 };
      entry.total += 1;
      if (f.outcome === "Improved") entry.improved += 1;
      byStrategy.set(f.support, entry);
    }
    const ranked = Array.from(byStrategy.entries())
      .filter(([, v]) => v.improved > 0)
      .sort((a, b) => b[1].improved / b[1].total - a[1].improved / a[1].total);
    if (ranked[0]) {
      const [support, v] = ranked[0];
      insights.push({
        id: "strategy-effectiveness",
        type: "strength",
        text: `"${support}" is showing the strongest results — ${v.improved} of ${v.total} follow-ups improved.`,
      });
    }
  }

  return insights.slice(0, limit);
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — classroom management strategies
 * ───────────────────────────────────────────────────────── */

export type StrategyKind = "Whole Class" | "Small Group" | "Individual" | "Routine";

export type BehaviorStrategy = {
  id: string;
  title: string;
  rationale: string;
  kind: StrategyKind;
  durationMins: number;
  targets: DisruptionKey[];
};

const STRATEGIES: BehaviorStrategy[] = [
  {
    id: "praise-specific",
    title: "Use specific behavior-based praise",
    rationale: "Naming the behavior (not just 'good job') reinforces what works.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["off-task", "anxiety"],
  },
  {
    id: "silent-signals",
    title: "Establish silent attention signals",
    rationale: "Replaces verbal redirects, lowering interruptions and noise.",
    kind: "Routine",
    durationMins: 0,
    targets: ["off-task", "transition"],
  },
  {
    id: "calm-corner",
    title: "Set up a calm corner protocol",
    rationale: "Gives emotionally-flooded students a structured reset path.",
    kind: "Individual",
    durationMins: 5,
    targets: ["emotional", "anxiety"],
  },
  {
    id: "transition-30",
    title: "Run a 30-second transition countdown",
    rationale: "Most lost minutes happen between activities — a visible timer cuts it.",
    kind: "Routine",
    durationMins: 0,
    targets: ["transition", "impulse"],
  },
  {
    id: "small-group-impulse",
    title: "Impulse-control mini-group (4 students)",
    rationale: "The same 4 names drive most impulse flags — pull them for a 10-min skill drill.",
    kind: "Small Group",
    durationMins: 10,
    targets: ["impulse"],
  },
  {
    id: "buddy-pair",
    title: "Buddy-pair the back row",
    rationale: "Pairs a high-impulse student with a calm peer to defuse peer-interaction flags.",
    kind: "Individual",
    durationMins: 0,
    targets: ["peer", "transition"],
  },
  {
    id: "calming-checkin",
    title: "Use a 2-minute calming check-in routine",
    rationale: "A brief self-check-in before demanding tasks builds coping capacity over time.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["anxiety"],
  },
];

/** Best-matched strategy for a single driver — used by the driver cards'
 * "Try strategy" / "Generate strategy" actions. */
export function strategyForDriver(key: DisruptionKey): BehaviorStrategy | null {
  return STRATEGIES.find((s) => s.targets.includes(key)) ?? null;
}

export function pickBehaviorStrategies(breakdown: DisruptionStat[], count = 5): BehaviorStrategy[] {
  const ranked = [...breakdown].sort((a, b) => b.severity - a.severity);
  const focusKeys = new Set(ranked.slice(0, 3).map((d) => d.key));
  const matched = STRATEGIES.filter((s) => s.targets.some((t) => focusKeys.has(t)));
  const seen = new Set<string>();
  const out: BehaviorStrategy[] = [];
  for (const s of [...matched, ...STRATEGIES]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
    if (out.length >= count) break;
  }
  return out;
}

/* ─────────────────────────────────────────────────────────
 * Students needing behavior support
 * ───────────────────────────────────────────────────────── */

export type SupportStatus = "active" | "monitoring" | "new";

export type BehaviorSupport = {
  student: Student;
  primary: DisruptionKey;
  primaryLabel: string;
  insight: string;
  status: SupportStatus;
  /** Behavior score 0–100. */
  score: number;
  trend: number;
};

function inferPrimary(s: Student): DisruptionKey {
  const dom = studentAttentionDomains(s);
  const subAt = (i: number) => s.subDomains[i]?.score ?? 60;
  const selfReg = studentMonitorRow(s).selfReg;
  const candidates: { key: DisruptionKey; signal: number }[] = [
    { key: "impulse", signal: dom.hyp - 60 },
    { key: "transition", signal: 60 - dom.swi },
    { key: "off-task", signal: 60 - dom.sus },
    { key: "emotional", signal: 60 - subAt(5) },
    { key: "peer", signal: 60 - subAt(6) },
    { key: "anxiety", signal: 60 - selfReg },
  ];
  candidates.sort((a, b) => b.signal - a.signal);
  return candidates[0].key;
}

const INSIGHT_BY_KEY: Record<DisruptionKey, (s: Student) => string> = {
  "off-task": (s) =>
    `${s.name.split(" ")[0]} drifts after ~10 min — a single-channel worksheet helps.`,
  transition: (s) =>
    `${s.name.split(" ")[0]} loses momentum after activity changes — a visual countdown helps.`,
  peer: (s) => `${s.name.split(" ")[0]} escalates near the back row — try a buddy-pair this week.`,
  impulse: (s) =>
    `${s.name.split(" ")[0]} calls out before being called on — a hand-raise rubric reduces it.`,
  emotional: (s) =>
    `${s.name.split(" ")[0]} shuts down on tough tasks — a 2-min anchor routine helps re-enter.`,
  anxiety: (s) =>
    `${s.name.split(" ")[0]} hesitates on unfamiliar tasks — a calming check-in builds confidence.`,
};

export function studentsNeedingBehaviorSupport(
  students: Student[] = STUDENTS,
  limit = 12,
): BehaviorSupport[] {
  const composites = studentComposites(students);
  // Pick the lowest behavior pillar scores first.
  const ranked = [...composites]
    .sort((a, b) => a.pillars.behavior - b.pillars.behavior)
    .slice(0, limit);

  return ranked.map((c, i) => {
    const primary = inferPrimary(c.student);
    const monitor = studentMonitorRow(c.student);
    return {
      student: c.student,
      primary,
      primaryLabel: DISRUPTION_LABEL[primary],
      insight: INSIGHT_BY_KEY[primary](c.student),
      status: i === 0 ? "active" : i < 3 ? "monitoring" : "new",
      score: c.pillars.behavior,
      trend: monitor.trend,
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Monthly Behavior check-in (MCQ)
 * ───────────────────────────────────────────────────────── */

export type BehaviorCheckInOption = {
  id: string;
  label: string;
  weight: number;
};

export type BehaviorCheckInQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: BehaviorCheckInOption[];
};

export const BEHAVIOR_CHECKIN_QUESTIONS: BehaviorCheckInQuestion[] = [
  {
    id: "mgmt-time",
    prompt: "How many minutes per class did you spend managing behaviour?",
    options: [
      { id: "lt2", label: "Under 2 min", weight: 2 },
      { id: "2to5", label: "2–5 min", weight: 1 },
      { id: "6to10", label: "6–10 min", weight: 0 },
      { id: "10to15", label: "10–15 min", weight: -1 },
      { id: "gt15", label: "Over 15 min", weight: -2 },
    ],
  },
  {
    id: "transitions",
    prompt: "How many minutes did transitions cost you?",
    options: [
      { id: "lt2", label: "Under 2 min", weight: 2 },
      { id: "2to5", label: "2–5 min", weight: 1 },
      { id: "6to10", label: "6–10 min", weight: -1 },
      { id: "gt10", label: "Over 10 min", weight: -2 },
    ],
  },
  {
    id: "disruptions",
    prompt: "How frequent were classroom disruptions?",
    options: [
      { id: "lt3", label: "Fewer than 3", weight: 2 },
      { id: "3to5", label: "3–5", weight: 1 },
      { id: "5to10", label: "5–10", weight: -1 },
      { id: "gt10", label: "More than 10", weight: -2 },
    ],
  },
  {
    id: "repetitions",
    prompt: "How often did you have to repeat the same instruction?",
    options: [
      { id: "rare", label: "Rarely", weight: 2 },
      { id: "some", label: "Sometimes", weight: 1 },
      { id: "often", label: "Often", weight: -1 },
      { id: "always", label: "Almost every time", weight: -2 },
    ],
  },
  {
    id: "challenge",
    prompt: "What was the biggest classroom-management challenge this month?",
    options: [
      { id: "off-task", label: "Off-task drift", weight: -1 },
      { id: "impulse", label: "Calling out / impulse", weight: -1 },
      { id: "transition", label: "Transition friction", weight: -1 },
      { id: "peer", label: "Peer conflict", weight: -1 },
      { id: "emotional", label: "Emotional dysregulation", weight: -1 },
      { id: "none", label: "No major challenge", weight: 2 },
    ],
  },
  {
    id: "manageable",
    prompt: "Quick pulse — how manageable was the class today?",
    helper: "Single tap. We use this as a 30-day rolling sentiment line.",
    options: [
      { id: "great", label: "Great — calm and focused", weight: 2 },
      { id: "ok", label: "Manageable with some redirects", weight: 1 },
      { id: "tough", label: "Tough — many redirects", weight: -1 },
      { id: "exhausting", label: "Exhausting", weight: -2 },
    ],
  },
];

export function behaviorCheckInScore(answers: Record<string, string>): {
  score: number;
  max: number;
  pct: number;
} {
  let weighted = 0;
  let max = 0;
  for (const q of BEHAVIOR_CHECKIN_QUESTIONS) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    const best = Math.max(...q.options.map((o) => o.weight));
    max += best;
    if (opt) weighted += opt.weight;
  }
  const range = max + 2 * BEHAVIOR_CHECKIN_QUESTIONS.length;
  const offset = weighted + 2 * BEHAVIOR_CHECKIN_QUESTIONS.length;
  const pct = Math.round((offset / Math.max(1, range)) * 100);
  return { score: weighted, max, pct };
}

/* ─────────────────────────────────────────────────────────
 * Priority Actions — a dedicated, aggregated action-items list for this
 * page. Every item is derived from data already real elsewhere on the
 * page (the support roster, driver weekly movement, logged positive
 * behaviour) — no separate action-tracking model.
 *
 * Priority order (highest first), per spec:
 *  1. Safety / major incident
 *  2. Tier 3 (individual) review needed
 *  3. Overdue intervention follow-up
 *  4. Repeated Tier 2 (small-group) pattern
 *  5. Whole-class Tier 1 strategy
 *  6. Positive reinforcement gap
 *  7. Parent communication due
 * Items are pushed in exactly this order and priority (high/medium/low)
 * is assigned per rung, so a stable sort preserves the intended order
 * even when several rungs are "high" at once.
 * ───────────────────────────────────────────────────────── */

export type ActionPriority = "high" | "medium" | "low";

export type PriorityActionCta =
  | "safety-incident"
  | "tier3-review"
  | "overdue-followup"
  | "repeated-tier2"
  | "tier1-strategy"
  | "positive-gap"
  | "parent-comm";

export type PriorityAction = {
  id: string;
  priority: ActionPriority;
  title: string;
  detail: string;
  ctaLabel: string;
  cta: PriorityActionCta;
  driverKey?: DisruptionKey;
};

export function behaviorPriorityActions(
  breakdown: DisruptionStat[],
  supportRoster: BehaviorSupport[],
  positiveLogsThisWeek: number,
): PriorityAction[] {
  const actions: PriorityAction[] = [];

  // 1. Safety / major incident — the single most severe individual case,
  // if any student's real behaviour score has dropped into the worst band.
  const worstStudent = supportRoster[0];
  if (worstStudent && statusFromScore(worstStudent.score) === "support") {
    actions.push({
      id: "safety-incident",
      priority: "high",
      title: `Review ${worstStudent.student.name.split(" ")[0]} with support team`,
      detail: `Behaviour score dropped to ${worstStudent.score}/100 — the most severe case this week.`,
      ctaLabel: "Share summary",
      cta: "safety-incident",
    });
  }

  // 2. Tier 3 review needed — newly flagged students with no plan yet.
  const newFlags = supportRoster.filter((r) => r.status === "new");
  if (newFlags.length > 0) {
    actions.push({
      id: "tier3-review",
      priority: "high",
      title: `Review ${newFlags.length} newly flagged student${newFlags.length === 1 ? "" : "s"}`,
      detail: "No support plan started yet — review with the support team this week.",
      ctaLabel: "View students",
      cta: "tier3-review",
    });
  }

  // 3. Overdue intervention follow-up — students already on a plan.
  const activePlans = supportRoster.filter((r) => r.status === "active");
  if (activePlans.length > 0) {
    actions.push({
      id: "overdue-followup",
      priority: "high",
      title: `Follow up with ${activePlans.length} student${activePlans.length === 1 ? "" : "s"}`,
      detail: "Strategy review is overdue for students already on a support plan.",
      ctaLabel: "Log follow-up",
      cta: "overdue-followup",
    });
  }

  // 4. Repeated Tier 2 pattern — a driver several students keep showing.
  const groupCandidate = [...breakdown]
    .filter((d) => d.studentCount >= 4 && (d.status === "reinforcement" || d.status === "support"))
    .sort((a, b) => b.studentCount - a.studentCount)[0];
  if (groupCandidate) {
    actions.push({
      id: "repeated-tier2",
      priority: "medium",
      title: `Create ${groupCandidate.label.toLowerCase()} support group`,
      detail: `${groupCandidate.studentCount} students struggled with ${groupCandidate.label.toLowerCase()} this week.`,
      ctaLabel: "Create group",
      cta: "repeated-tier2",
      driverKey: groupCandidate.key,
    });
  }

  // 5. Whole-class Tier 1 strategy — the worst-trending driver overall.
  const worstWatch = [...breakdown]
    .filter((d) => d.weeklyChange < 0)
    .sort((a, b) => a.weeklyChange - b.weeklyChange)[0];
  if (worstWatch) {
    const strategy = strategyForDriver(worstWatch.key);
    if (strategy) {
      actions.push({
        id: "tier1-strategy",
        priority: "medium",
        title: `Try "${strategy.title}"`,
        detail: `${worstWatch.label} increased this week — ${strategy.rationale}`,
        ctaLabel: "Use strategy",
        cta: "tier1-strategy",
        driverKey: worstWatch.key,
      });
    }
  }

  // 6. Positive reinforcement gap.
  if (positiveLogsThisWeek < 3) {
    actions.push({
      id: "positive-gap",
      priority: "low",
      title: "Log positive behaviour recognition",
      detail:
        positiveLogsThisWeek === 0
          ? "No positive recognition logged this week."
          : `Only ${positiveLogsThisWeek} positive log${positiveLogsThisWeek === 1 ? "" : "s"} recorded this week.`,
      ctaLabel: "Log positive",
      cta: "positive-gap",
    });
  }

  // 7. Parent communication due — reuses the same real major-behaviour
  // signal as the safety-incident rung, since that's the only case where
  // a parent update is clearly warranted with the data tracked today.
  const majorCount = supportRoster.filter((r) => statusFromScore(r.score) === "support").length;
  if (majorCount > 0) {
    actions.push({
      id: "parent-comm",
      priority: "low",
      title: `Notify parents for ${majorCount} student${majorCount === 1 ? "" : "s"}`,
      detail: "Major behaviour concerns this week haven't been shared with families yet.",
      ctaLabel: "Send update",
      cta: "parent-comm",
    });
  }

  const rank: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };
  return actions
    .map((a, i) => ({ a, i }))
    .sort((x, y) => rank[x.a.priority] - rank[y.a.priority] || x.i - y.i)
    .map(({ a }) => a);
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — Tier-Wise Insights. A reference menu of one
 * recommendation per PBIS tier (distinct from Priority Actions, which is
 * an urgent to-do queue — this is "what's generally available at each
 * support level"). Each pick reuses real signals already computed above.
 * ───────────────────────────────────────────────────────── */

export type RecommendationTier = "wholeClass" | "smallGroup" | "individual";

export const TIER_RECOMMENDATION_LABEL: Record<RecommendationTier, string> = {
  wholeClass: "Tier 1 — Whole Class",
  smallGroup: "Tier 2 — Small Group",
  individual: "Tier 3 — Individual Support",
};

export type TierRecommendation = {
  tier: RecommendationTier;
  title: string;
  detail: string;
  driverKey?: DisruptionKey;
  studentId?: string;
  studentName?: string;
};

export function behaviorTierRecommendations(
  breakdown: DisruptionStat[],
  supportRoster: BehaviorSupport[],
): TierRecommendation[] {
  const recs: TierRecommendation[] = [];

  // Tier 1 — Whole Class: the worst-trending driver (or, failing that, the
  // single lowest-scoring one) paired with its matched strategy.
  const wholeClassDriver =
    [...breakdown].filter((d) => d.weeklyChange < 0).sort((a, b) => a.weeklyChange - b.weeklyChange)[0] ??
    [...breakdown].sort((a, b) => a.score - b.score)[0];
  if (wholeClassDriver) {
    const strategy = strategyForDriver(wholeClassDriver.key);
    recs.push({
      tier: "wholeClass",
      title: strategy ? strategy.title : `Re-teach ${wholeClassDriver.label.toLowerCase()} expectations`,
      detail: strategy ? strategy.rationale : wholeClassDriver.description,
      driverKey: wholeClassDriver.key,
    });
  }

  // Tier 2 — Small Group: whichever driver the most students are still
  // struggling with.
  const smallGroupDriver = [...breakdown]
    .filter((d) => d.status === "reinforcement" || d.status === "support")
    .sort((a, b) => b.studentCount - a.studentCount)[0];
  if (smallGroupDriver) {
    recs.push({
      tier: "smallGroup",
      title: `Create a small ${smallGroupDriver.label.toLowerCase()} routine for ${smallGroupDriver.studentCount} students.`,
      detail: smallGroupDriver.description,
      driverKey: smallGroupDriver.key,
    });
  }

  // Tier 3 — Individual: the single most severe case on the roster.
  const worstStudent = supportRoster[0];
  if (worstStudent) {
    const firstName = worstStudent.student.name.split(" ")[0];
    recs.push({
      tier: "individual",
      title: `Share ${firstName}'s observation summary with the special educator.`,
      detail: worstStudent.insight,
      studentId: worstStudent.student.id,
      studentName: worstStudent.student.name,
    });
  }

  return recs;
}

/* ─────────────────────────────────────────────────────────
 * Activity / Context Pattern — "where is the behaviour happening?"
 * This app doesn't persist per-incident location/activity data (the
 * logging form captures it, but only a bare timestamp is saved today —
 * see logBehaviorEvent in checkInTools.ts), so contexts are grounded in
 * the closest real signal available per row rather than a true location
 * log. Playground/hallway is omitted entirely since no real proxy exists
 * for it yet, rather than fabricating a count.
 * ───────────────────────────────────────────────────────── */

export type ActivityContextRow = {
  id: string;
  context: string;
  mainFriction: string;
  count: number;
  recommendedAction: string;
  driverKey?: DisruptionKey;
};

// Assignment-completion ratio below this reads as "missing work" — same
// threshold studentMonitorRow already uses for its LOW compliance band.
const MISSING_WORK_RATIO = 0.4;

export function behaviorActivityContextPatterns(
  breakdown: DisruptionStat[],
  students: Student[] = STUDENTS,
): ActivityContextRow[] {
  const rows: ActivityContextRow[] = [];
  const byKey = (key: DisruptionKey) => breakdown.find((d) => d.key === key);

  const offTask = byKey("off-task");
  if (offTask && offTask.studentCount > 0) {
    rows.push({
      id: "independent-work",
      context: "Independent work",
      mainFriction: "Off-task, repeated reminders",
      count: offTask.studentCount,
      recommendedAction: strategyForDriver("off-task")?.title ?? "Introduce a visual checklist",
      driverKey: "off-task",
    });
  }

  const transition = byKey("transition");
  if (transition && transition.studentCount > 0) {
    rows.push({
      id: "transitions",
      context: "Transitions",
      mainFriction: "Delayed movement between activities",
      count: transition.studentCount,
      recommendedAction: strategyForDriver("transition")?.title ?? "Use a 2-minute transition warning",
      driverKey: "transition",
    });
  }

  const peer = byKey("peer");
  if (peer && peer.studentCount > 0) {
    rows.push({
      id: "group-work",
      context: "Group work",
      mainFriction: "Peer conflict",
      count: peer.studentCount,
      recommendedAction: strategyForDriver("peer")?.title ?? "Use role cards",
      driverKey: "peer",
    });
  }

  const missingWorkCount = students.filter(
    (s) => s.gamesAssigned > 0 && s.gamesPlayed / s.gamesAssigned < MISSING_WORK_RATIO,
  ).length;
  if (missingWorkCount > 0) {
    rows.push({
      id: "homework-review",
      context: "Homework review",
      mainFriction: "Missing or incomplete assigned work",
      count: missingWorkCount,
      recommendedAction: "Send a parent nudge about missing work",
    });
  }

  return rows.sort((a, b) => b.count - a.count);
}

/* ─────────────────────────────────────────────────────────
 * Time-of-Day Pattern — buckets real logged-behaviour timestamps into 4
 * windows (same buckets as TIME_OF_DAY_OPTIONS in behaviorForm.ts). This
 * reflects the real hour a teacher submitted each log — not necessarily
 * the exact incident time, since no per-incident time-of-day field is
 * actually persisted (see logBehaviorEvent in checkInTools.ts) — but it's
 * genuine data, not fabricated. The "most common pattern" name is the real
 * top driver overall this week; it isn't claimed to be specifically tied
 * to the peak time bucket, since incident type and timestamp aren't
 * linked in what's stored today.
 * ───────────────────────────────────────────────────────── */

export type TimeOfDayKey = "morning" | "midday" | "afternoon" | "endOfDay";

export const TIME_OF_DAY_LABEL: Record<TimeOfDayKey, string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  endOfDay: "End of day",
};

const TIME_OF_DAY_ORDER: TimeOfDayKey[] = ["morning", "midday", "afternoon", "endOfDay"];

function timeOfDayForHour(hour: number): TimeOfDayKey {
  if (hour < 11) return "morning";
  if (hour < 13) return "midday";
  if (hour < 16) return "afternoon";
  return "endOfDay";
}

export type TimeOfDayPattern = {
  counts: Record<TimeOfDayKey, number>;
  total: number;
  peak: TimeOfDayKey | null;
  topDriverLabel: string | null;
};

export function behaviorTimeOfDayPattern(
  timestamps: string[],
  breakdown: DisruptionStat[],
): TimeOfDayPattern {
  const counts: Record<TimeOfDayKey, number> = { morning: 0, midday: 0, afternoon: 0, endOfDay: 0 };
  for (const iso of timestamps) {
    counts[timeOfDayForHour(new Date(iso).getHours())] += 1;
  }
  const total = timestamps.length;
  const ranked = TIME_OF_DAY_ORDER.map((key) => ({ key, count: counts[key] })).sort(
    (a, b) => b.count - a.count,
  );
  const peak = total > 0 && ranked[0].count > 0 ? ranked[0].key : null;

  const topDriver = [...breakdown].sort((a, b) => b.studentCount - a.studentCount)[0];
  return {
    counts,
    total,
    peak,
    topDriverLabel: topDriver && topDriver.studentCount > 0 ? topDriver.label.toLowerCase() : null,
  };
}
