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
  | "non-compliance"
  | "peer"
  | "impulse"
  | "emotional"
  | "participation";

export const DISRUPTION_LABEL: Record<DisruptionKey, string> = {
  "off-task": "Off-Task Behaviour",
  "non-compliance": "Non-Compliance",
  peer: "Peer Interaction",
  impulse: "Impulse Control",
  emotional: "Emotional Regulation",
  participation: "Participation Control",
};

export const DISRUPTION_DESCRIPTION: Record<DisruptionKey, string> = {
  "off-task": "Drifting from the assigned activity — doodling, side conversations, fidgeting.",
  "non-compliance": "Not following instructions or classroom expectations, even after prompts.",
  peer: "Disrupting peers, interrupting, or escalating conflicts during work.",
  impulse: "Movement and restlessness control — calling out, leaving seat, struggling to wait their turn.",
  emotional: "Big reactions to small frustrations — shutting down or escalating.",
  participation: "Disengaging from class activities and discussions instead of taking part.",
};

export const DISRUPTION_HUE: Record<DisruptionKey, string> = {
  "off-task": "hsl(38 92% 55%)",
  "non-compliance": "hsl(0 78% 58%)",
  peer: "hsl(286 60% 60%)",
  impulse: "hsl(20 85% 58%)",
  emotional: "hsl(258 55% 60%)",
  participation: "hsl(196 75% 50%)",
};

/** Short 2–4 word pattern labels for compact spaces (the watchlist rail) —
 * same real driver categorisation as DISRUPTION_LABEL, just condensed. */
export const DISRUPTION_SHORT_PATTERN: Record<DisruptionKey, string> = {
  "off-task": "Off-task + repeated reminders",
  "non-compliance": "Non-compliance / not following instructions",
  peer: "Peer conflict",
  impulse: "Impulsive / calling out",
  emotional: "Emotional dysregulation",
  participation: "Low participation / disengagement",
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
  "non-compliance": [
    "Ignores or resists instructions even after redirection.",
    "Argues or negotiates rather than following directions.",
    "Repeated non-completion of assigned tasks despite reminders.",
  ],
  peer: [
    "Conflicts cluster around the same seating groups.",
    "Interruptions rise during partner or group work.",
    "Peer proximity correlates with off-task drift.",
  ],
  impulse: [
    "Calling out before being called on.",
    "Leaving seat without permission during work blocks.",
    "Struggles to wait during turn-taking activities.",
  ],
  emotional: [
    "Shuts down or escalates after small frustrations.",
    "Recovery time after an outburst is longer than peers.",
    "Big reactions to minor changes in routine.",
  ],
  participation: [
    "Opts out of class discussions and group activities.",
    "Minimal verbal or written contribution during lessons.",
    "Disengages during whole-class instruction.",
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
    case "non-compliance":
      return monitor.compliance === "LOW";
    case "peer":
      return subAt(6) < 60;
    case "impulse":
      return dom.hyp > 70;
    case "emotional":
      return subAt(5) < 58;
    case "participation":
      return dom.sel < 58;
  }
}

const DISRUPTION_ORDER: DisruptionKey[] = [
  "off-task",
  "non-compliance",
  "peer",
  "impulse",
  "emotional",
  "participation",
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
    "non-compliance": 4,
    peer: 2,
    impulse: 5,
    emotional: -3,
    participation: 2,
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

export type DistributionChangePoint = {
  key: DisruptionKey;
  label: string;
  hue: string;
  /** % share of total disruption load, last week vs this week — reuses
   * each driver's own severity/prevSeverity rather than a separate history
   * model, so the two points are exactly what classDisruptionBreakdown
   * already computed. */
  prevPct: number;
  pct: number;
};

export function behaviorTypeDistributionChange(breakdown: DisruptionStat[]): DistributionChangePoint[] {
  const totalNow = Math.max(1, breakdown.reduce((a, d) => a + d.severity, 0));
  const totalPrev = Math.max(1, breakdown.reduce((a, d) => a + d.prevSeverity, 0));
  return breakdown.map((d) => ({
    key: d.key,
    label: d.label,
    hue: d.hue,
    prevPct: Math.round((d.prevSeverity / totalPrev) * 100),
    pct: Math.round((d.severity / totalNow) * 100),
  }));
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
    { name: "Sustained Attention", value: (s) => studentAttentionDomains(s).sus },
    {
      name: "Task persistence",
      value: (s) => {
        const c = studentMonitorRow(s).compliance;
        return c === "HIGH" ? 85 : c === "MEDIUM" ? 60 : 35;
      },
    },
    { name: "Verbal Self-Regulation", value: (s) => studentMonitorRow(s).selfReg },
  ],
  "non-compliance": [
    { name: "Monitoring", value: (s) => studentMonitorRow(s).selfReg },
    { name: "Self-Regulation", value: (s) => studentAttentionDomains(s).beh },
  ],
  peer: [
    { name: "Cooperation", value: (s) => s.subDomains[6]?.score ?? 60 },
    { name: "Behavioral control", value: (s) => studentAttentionDomains(s).beh },
    { name: "Auditory inhibition", value: (s) => s.subDomains[7]?.score ?? 60 },
  ],
  impulse: [
    { name: "Motor Control", value: (s) => 100 - studentAttentionDomains(s).hyp },
    { name: "Behavioral control", value: (s) => studentAttentionDomains(s).beh },
    { name: "Sustained Attention", value: (s) => studentAttentionDomains(s).sus },
  ],
  emotional: [
    { name: "Self-awareness", value: (s) => s.subDomains[5]?.score ?? 60 },
    { name: "Frustration Tolerance", value: (s) => studentAttentionDomains(s).beh },
    { name: "Self-Regulation", value: (s) => studentMonitorRow(s).selfReg },
  ],
  participation: [
    { name: "Behavioral control", value: (s) => studentAttentionDomains(s).beh },
    { name: "Arousal Modulation", value: (s) => 100 - studentAttentionDomains(s).hyp },
    { name: "Verbal Self-Regulation", value: (s) => studentMonitorRow(s).selfReg },
  ],
};

// Presentational qualifiers shown alongside the base driver label in the
// Problem Area → Skills table only — every other component just uses the
// plain DISRUPTION_LABEL.
const PROBLEM_AREA_NOTE: Partial<Record<DisruptionKey, string>> = {
  impulse: "movement/restlessness",
  participation: "interrupting / over-talking / under-participation",
};

/** Static Problem Area → Skills reference (Component 3) — the same skill
 * names driverImpactingSkills scores per student, just without a score
 * attached, in the app's real driver order. */
export function problemAreaToSkills(): { key: DisruptionKey; label: string; note?: string; skills: string[] }[] {
  return DISRUPTION_ORDER.map((key) => ({
    key,
    label: DISRUPTION_LABEL[key],
    note: PROBLEM_AREA_NOTE[key],
    skills: DRIVER_SKILL_FIELDS[key].map((f) => f.name),
  }));
}

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
  "non-compliance": "Non-compliance with instructions increased this week.",
  peer: "Peer conflicts increased this week.",
  impulse: "Impulse-control incidents increased this week.",
  emotional: "Emotional regulation dipped this week.",
  participation: "Class participation dipped this week.",
};

const STRENGTH_TEXT: Record<DisruptionKey, string> = {
  "off-task": "Focus during independent work held steady this week.",
  "non-compliance": "Students are following instructions more consistently this week.",
  peer: "Peer interaction stayed positive this week.",
  impulse: "Impulse control is holding steady this week.",
  emotional: "Emotional recovery is improving this week.",
  participation: "Class participation is holding steady this week.",
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

export type StrategyKind = "Whole Class" | "Small Group" | "Individual" | "Routine" | "Game";

export type BehaviorStrategy = {
  id: string;
  title: string;
  rationale: string;
  kind: StrategyKind;
  durationMins: number;
  targets: DisruptionKey[];
  /** Real ANTECEDENT_OPTIONS labels (behaviorForm.ts) this strategy addresses
   * — lets triggers actually logged on the Record Behaviour form connect to
   * a matched strategy, not just disruption drivers. */
  triggers?: string[];
};

const STRATEGIES: BehaviorStrategy[] = [
  {
    id: "praise-specific",
    title: "Use specific behavior-based praise",
    rationale: "Naming the behavior (not just 'good job') reinforces what works.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["off-task", "participation"],
    triggers: ["Difficult task"],
  },
  {
    id: "silent-signals",
    title: "Establish silent attention signals",
    rationale: "Replaces verbal redirects, lowering interruptions and noise.",
    kind: "Routine",
    durationMins: 0,
    targets: ["off-task", "non-compliance"],
    triggers: ["Noise levels"],
  },
  {
    id: "calm-corner",
    title: "Set up a calm corner protocol",
    rationale: "Gives emotionally-flooded students a structured reset path.",
    kind: "Individual",
    durationMins: 5,
    targets: ["emotional"],
    triggers: ["Correction"],
  },
  {
    id: "transition-30",
    title: "Run a 30-second transition countdown",
    rationale: "Most lost minutes happen between activities — a visible timer cuts it.",
    kind: "Routine",
    durationMins: 0,
    targets: ["non-compliance", "impulse"],
    triggers: ["Transition"],
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
    targets: ["peer", "participation"],
    triggers: ["Peer proximity"],
  },
  {
    id: "calming-checkin",
    title: "Use a 2-minute calming check-in routine",
    rationale: "A brief self-check-in before demanding tasks builds coping capacity over time.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["emotional"],
    triggers: ["Change in routine", "Unknown"],
  },
  {
    id: "chunk-instructions",
    title: "Break instructions into shorter chunks",
    rationale: "Long instruction blocks strain working memory — shorter chunks with a quick check keep the whole class following.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["off-task", "non-compliance"],
    triggers: ["Long instruction blocks"],
  },
  {
    id: "movement-break",
    title: "Introduce movement breaks",
    rationale: "A brief movement reset channels restlessness before it turns into off-task drift or disruption.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["impulse", "off-task"],
    triggers: ["Long wait"],
  },
  {
    id: "participation-rules",
    title: "Set clear participation rules (raise hand, turn-taking)",
    rationale: "Explicit turn-taking rules cut down on talking-out-of-turn and peer-proximity friction.",
    kind: "Routine",
    durationMins: 0,
    targets: ["non-compliance", "participation"],
    triggers: ["Peer proximity", "Correction"],
  },
  {
    id: "freeze-focus",
    title: "“Freeze & focus” game",
    rationale: "A quick freeze-on-cue game resets attention and impulse control after a noisy or high-energy stretch.",
    kind: "Game",
    durationMins: 3,
    targets: ["impulse", "off-task"],
    triggers: ["Noise levels", "Difficult task"],
  },
];

/** Best-matched strategy for a single driver — used by the driver cards'
 * "Try strategy" / "Generate strategy" actions. */
export function strategyForDriver(key: DisruptionKey): BehaviorStrategy | null {
  return STRATEGIES.find((s) => s.targets.includes(key)) ?? null;
}

/** Best-matched strategy for a real logged trigger (ANTECEDENT_OPTIONS
 * label) — used by Behavior Triggers & Actions and Classroom Management
 * Strategies to connect what teachers actually logged to a real strategy. */
export function strategyForTrigger(trigger: string): BehaviorStrategy | null {
  return STRATEGIES.find((s) => s.triggers?.includes(trigger)) ?? null;
}

// Shown before any real trigger match when no behaviour logs record a
// trigger yet this week — the general-purpose classroom-management set,
// not tied to any one driver or trigger.
const DEFAULT_STRATEGY_IDS = ["chunk-instructions", "movement-break", "participation-rules", "freeze-focus"];

/** Ranks strategies by how well they match this week's real logged
 * triggers (falls back to the general default set, then the full catalog,
 * same dedup-fill convention as pickBehaviorStrategies below). */
export function pickStrategiesForTriggers(antecedentsThisWeek: string[], count = 4): BehaviorStrategy[] {
  const counts = new Map<string, number>();
  for (const trigger of antecedentsThisWeek) counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  const rankedTriggers = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([trigger]) => trigger);
  const focusTriggers = new Set(rankedTriggers.slice(0, 3));
  const matched = STRATEGIES.filter((s) => s.triggers?.some((t) => focusTriggers.has(t)));
  const byId = new Map(STRATEGIES.map((s) => [s.id, s]));
  const defaults = DEFAULT_STRATEGY_IDS.map((id) => byId.get(id)).filter((s): s is BehaviorStrategy => !!s);
  const seen = new Set<string>();
  const out: BehaviorStrategy[] = [];
  for (const s of [...matched, ...defaults, ...STRATEGIES]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
    if (out.length >= count) break;
  }
  return out;
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
  const compliance = studentMonitorRow(s).compliance;
  const complianceScore = compliance === "HIGH" ? 85 : compliance === "MEDIUM" ? 60 : 30;
  const candidates: { key: DisruptionKey; signal: number }[] = [
    { key: "impulse", signal: dom.hyp - 60 },
    { key: "non-compliance", signal: 60 - complianceScore },
    { key: "off-task", signal: 60 - dom.sus },
    { key: "emotional", signal: 60 - subAt(5) },
    { key: "peer", signal: 60 - subAt(6) },
    { key: "participation", signal: 60 - dom.sel },
  ];
  candidates.sort((a, b) => b.signal - a.signal);
  return candidates[0].key;
}

const INSIGHT_BY_KEY: Record<DisruptionKey, (s: Student) => string> = {
  "off-task": (s) =>
    `${s.name.split(" ")[0]} drifts after ~10 min — a single-channel worksheet helps.`,
  "non-compliance": (s) =>
    `${s.name.split(" ")[0]} pushes back on instructions — consistent, calm follow-through helps.`,
  peer: (s) => `${s.name.split(" ")[0]} escalates near the back row — try a buddy-pair this week.`,
  impulse: (s) =>
    `${s.name.split(" ")[0]} calls out before being called on — a hand-raise rubric reduces it.`,
  emotional: (s) =>
    `${s.name.split(" ")[0]} shuts down on tough tasks — a 2-min anchor routine helps re-enter.`,
  participation: (s) =>
    `${s.name.split(" ")[0]} disengages during class discussions — structured turn-taking helps.`,
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
    prompt: "How much time is spent managing behavior?",
    helper: "Includes time spent redirecting, settling students, and addressing disruptions.",
    options: [
      { id: "lt2", label: "< 2 mins", weight: 2 },
      { id: "2to5", label: "2–5 mins", weight: 1 },
      { id: "6to10", label: "6–10 mins", weight: 0 },
      { id: "10to15", label: "10–15 mins", weight: -1 },
      { id: "gt15", label: "15+ mins", weight: -2 },
    ],
  },
  {
    id: "transitions",
    prompt: "How much time is lost during transitions between activities?",
    helper: "Time from ending one activity to the class being fully ready for the next.",
    options: [
      { id: "lt2", label: "< 2 mins", weight: 2 },
      { id: "2to5", label: "2–5 mins", weight: 1 },
      { id: "6to10", label: "6–10 mins", weight: 0 },
      { id: "10to15", label: "10–15 mins", weight: -1 },
      { id: "gt15", label: "15+ mins", weight: -2 },
    ],
  },
  {
    id: "disruptions",
    prompt: "How often do disruptions occur in a typical class?",
    helper: "Includes any behavior that interrupts teaching or learning.",
    options: [
      { id: "rare", label: "Rare (0–2 times)", weight: 2 },
      { id: "occasional", label: "Occasional (3–5 times)", weight: 1 },
      { id: "frequent", label: "Frequent (5–10 times)", weight: -1 },
      { id: "very-frequent", label: "Very frequent (>10 times)", weight: -2 },
    ],
  },
  {
    id: "repetitions",
    prompt: "How often do you need to repeat instructions?",
    helper: "Think about the need to repeat directions for most of the class.",
    options: [
      { id: "rare", label: "Rarely", weight: 2 },
      { id: "some", label: "Sometimes", weight: 1 },
      { id: "often", label: "Often", weight: -1 },
      { id: "very-often", label: "Very often", weight: -2 },
    ],
  },
  {
    id: "challenge",
    prompt: "What is the most common challenge in your class?",
    helper: "Choose the one that happens most often.",
    options: [
      { id: "talking", label: "Talking out of turn", weight: -1 },
      { id: "restlessness", label: "Restlessness / movement", weight: -1 },
      { id: "not-following", label: "Not following instructions", weight: -1 },
      { id: "losing-focus", label: "Losing focus mid-task", weight: -1 },
      { id: "transitions", label: "Difficulty during transitions", weight: -1 },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
 * Quick Pulse — optional daily companion to the monthly check-in above.
 * Separate and much lighter: one tap, one question, no scoring model —
 * just a rolling "how manageable was today" sentiment read.
 * ───────────────────────────────────────────────────────── */

export type QuickPulseRating = "smooth" | "manageable" | "difficult";

export const QUICK_PULSE_OPTIONS: {
  id: QuickPulseRating;
  label: string;
  description: string;
  tone: string;
}[] = [
  {
    id: "smooth",
    label: "Very smooth",
    description: "Class ran very smoothly with minimal issues",
    tone: "hsl(142 55% 42%)",
  },
  {
    id: "manageable",
    label: "Manageable",
    description: "Some challenges, but handled well",
    tone: "hsl(38 92% 48%)",
  },
  {
    id: "difficult",
    label: "Difficult",
    description: "Many disruptions, hard to manage",
    tone: "hsl(0 78% 56%)",
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

  const nonCompliance = byKey("non-compliance");
  if (nonCompliance && nonCompliance.studentCount > 0) {
    rows.push({
      id: "whole-class-instruction",
      context: "Whole-class instructions",
      mainFriction: "Not following directions after prompts",
      count: nonCompliance.studentCount,
      recommendedAction:
        strategyForDriver("non-compliance")?.title ?? "Use a consistent instruction-and-check routine",
      driverKey: "non-compliance",
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

/* ─────────────────────────────────────────────────────────
 * Behaviour Triggers & Actions — "why is this happening?" Sourced from the
 * real "what happened right before" antecedent teachers pick on the Record
 * Behaviour form (see ANTECEDENT_OPTIONS in behaviorForm.ts), now actually
 * persisted per log (see getBehaviorLogAntecedentsThisWeek in
 * checkInTools.ts) instead of being discarded after the note is composed —
 * genuine teacher-log data, not a fabricated distribution.
 * ───────────────────────────────────────────────────────── */

export type BehaviorTriggerRow = {
  id: string;
  trigger: string;
  count: number;
  recommendedAction: string;
};

/** Ranks the real triggers teachers have actually logged this week — empty
 * until at least one behaviour log records an antecedent, same "no logs yet"
 * convention as behaviorTimeOfDayPattern. Recommended action comes from the
 * same STRATEGIES catalog strategyForDriver already draws on, keyed by
 * trigger instead of driver, so there's one source of truth for "what to do
 * about it" everywhere on this page. */
export function behaviorTriggerPatterns(antecedentsThisWeek: string[], limit = 5): BehaviorTriggerRow[] {
  const counts = new Map<string, number>();
  for (const trigger of antecedentsThisWeek) {
    counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([trigger, count]) => ({
      id: trigger.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      trigger,
      count,
      recommendedAction:
        strategyForTrigger(trigger)?.title ?? "Log more detail next time to refine this suggestion.",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
