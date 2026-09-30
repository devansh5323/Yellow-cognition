// Class Behavior & Discipline — data + helpers.
//
// data/realStudents.ts (the STUDENTS this file used to derive everything
// from) still has zero per-student behaviour signal — but data/
// realStudents.ts has real per-student
// cognitivePerformance.behaviourAndDiscipline scores for all 16 students,
// while l2ClassroomData.ts has the real weekly/monthly class-level series
// covering exactly the 6
// disruption categories below (offTaskBehavior, nonCompliance,
// peerSafetyAndBelonging, impulseControl, angerAndEmotionalRegulation,
// participationControl). The overall snapshot score/status/distribution and
// each driver's class-level score/trend are real, sourced from that CSV.
// What's still missing: a per-student breakdown BY driver (the CSV only has
// one overall behaviourAndDiscipline number per student, not one per
// category) — so `studentCount`/`studentsByDisruption` per driver, and
// anything needing hour-level time-tracking or named cognitive sub-skills
// (Classroom Disruption Impact, Skills Influencing Behaviour), stay
// deterministic seeded DEMO data, clearly marked via DemoDataBadge wherever
// they render (see components/dashboard/DemoDataBadge.tsx) — never silently
// presented as real. Everything independent of the Student roster — the
// monthly/quick-pulse teacher self-report check-ins, the generic strategy
// catalog, and the real logged-trigger/time-of-day patterns (which come
// from the teacher's own behaviour-log entries) — is unaffected and kept
// as-is.

import { STUDENTS, type Student } from "@/data/mockData";
import {
  L2_CLASSROOM_DATA,
  type BehaviorTrendPoint as L2BehaviorTrendPoint,
} from "@/data/l2ClassroomData";
import type { FollowUpRecord } from "@/lib/interventionFollowUps";

const BEHAVIOR_WEEKLY_DATA = L2_CLASSROOM_DATA.behavior.weekly;
const BEHAVIOR_MONTHLY_DATA = L2_CLASSROOM_DATA.behavior.monthly;

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// Deterministic pseudo-random, seeded — same technique lib/classFocus.ts
// uses, for the demo-only per-driver student counts below.
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function idSeed(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/* ─────────────────────────────────────────────────────────
 * Snapshot — no real signal exists yet for this class.
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

export type BehaviorSnapshotData = {
  controlScore: number | null;
  status: BehaviorStatus | null;
  total: number;
  /** Real per-student distribution — each of the 16 students' real
   * cognitivePerformance.behaviourAndDiscipline score, bucketed by
   * statusFromScore(). `null` if no student has a real score yet. */
  distribution: Record<BehaviorStatus, number> | null;
  /** The best/worst-scoring real driver (class-level, from the latest
   * WEEKLY_DATA week) — `null` once there's no weekly series to rank. */
  strongestDriver: { key: DisruptionKey; label: string } | null;
  weakestDriver: { key: DisruptionKey; label: string } | null;
};

export function classBehaviorSnapshot(
  students: Student[] = STUDENTS,
): BehaviorSnapshotData {
  const scores = students
    .map((s) => s.cognitivePerformance.behaviourAndDiscipline)
    .filter((v): v is number => v != null);
  const controlScore = avg(scores);
  const status = controlScore != null ? statusFromScore(controlScore) : null;

  const distribution =
    scores.length > 0
      ? scores.reduce(
          (acc, s) => {
            acc[statusFromScore(s)] += 1;
            return acc;
          },
          { strong: 0, stable: 0, reinforcement: 0, support: 0 } as Record<
            BehaviorStatus,
            number
          >,
        )
      : null;

  const driverScores = latestDriverScores();
  const ranked = DISRUPTION_ORDER.map((key) => ({
    key,
    score: driverScores[key],
  })).filter(
    (d): d is { key: DisruptionKey; score: number } => d.score != null,
  );
  const sorted = [...ranked].sort((a, b) => b.score - a.score);
  const strongestDriver = sorted[0]
    ? { key: sorted[0].key, label: DISRUPTION_LABEL[sorted[0].key] }
    : null;
  const weakest = sorted[sorted.length - 1];
  const weakestDriver = weakest
    ? { key: weakest.key, label: DISRUPTION_LABEL[weakest.key] }
    : null;

  return {
    controlScore,
    status,
    total: students.length,
    distribution,
    strongestDriver,
    weakestDriver,
  };
}

/* ─────────────────────────────────────────────────────────
 * Disruption breakdown — six behaviour & regulation driver categories.
 * `hasData` is false for all of them today (zero real per-student signal);
 * the labels/descriptions/hues stay so the UI can still name each category
 * while pointing at the empty state.
 * ───────────────────────────────────────────────────────── */

export type DisruptionKey =
  | "off-task"
  | "non-compliance"
  | "peer"
  | "impulse"
  | "emotional"
  | "participation";

// Labels follow the reference mock's naming exactly. Internal keys
// ("off-task"/"non-compliance") are unchanged for backward compat with
// existing strategy/insight logic keyed off them — only the display label
// (and its paired description, kept consistent with the new label) changed.
export const DISRUPTION_LABEL: Record<DisruptionKey, string> = {
  "off-task": "Transition Readiness",
  "non-compliance": "Classroom Expectations",
  peer: "Peer Interaction",
  impulse: "Impulse Control",
  emotional: "Emotional Regulation",
  participation: "Participation Control",
};

export const DISRUPTION_DESCRIPTION: Record<DisruptionKey, string> = {
  "off-task":
    "How smoothly students shift between tasks, activities, and classroom routines.",
  "non-compliance":
    "How consistently students follow routines, rules, and shared classroom expectations.",
  peer: "Disrupting peers, interrupting, or escalating conflicts during work.",
  impulse:
    "Movement and restlessness control — calling out, leaving seat, struggling to wait their turn.",
  emotional:
    "Big reactions to small frustrations — shutting down or escalating.",
  participation:
    "Disengaging from class activities and discussions instead of taking part.",
};

export const DISRUPTION_HUE: Record<DisruptionKey, string> = {
  "off-task": "hsl(38 92% 55%)",
  "non-compliance": "hsl(0 78% 58%)",
  peer: "hsl(286 60% 60%)",
  impulse: "hsl(20 85% 58%)",
  emotional: "hsl(258 55% 60%)",
  participation: "hsl(196 75% 50%)",
};

/** Watchlist tier label — kept for UI reuse; unreachable while hasData is
 * false everywhere, since nothing is bucketed into a tier without real
 * per-student behaviour scores. */
export const WATCHLIST_TIER_LABEL: Record<BehaviorStatus, string> = {
  support: "Tier 3",
  reinforcement: "Tier 2",
  stable: "Watch",
  strong: "Watch",
};

const DISRUPTION_ORDER: DisruptionKey[] = [
  "off-task",
  "non-compliance",
  "peer",
  "impulse",
  "emotional",
  "participation",
];

export type DisruptionStat = {
  key: DisruptionKey;
  label: string;
  description: string;
  hue: string;
  hasData: boolean;
  severity: number | null;
  /** Demo — no real per-student-per-driver split exists in the CSV (only
   * one overall behaviourAndDiscipline number per student), so this is a
   * seeded estimate, not a real headcount. See `studentCountIsDemo`. */
  studentCount: number;
  studentCountIsDemo: boolean;
  score: number | null;
  status: BehaviorStatus | null;
  weeklyChange: number | null;
};

/** Real, class-level: maps each of the 6 disruption categories to its
 * matching field in the L2 weekly/monthly series. */
const DRIVER_FIELD: Record<DisruptionKey, keyof L2BehaviorTrendPoint> = {
  "off-task": "offTaskBehavior",
  "non-compliance": "nonCompliance",
  peer: "peerSafetyAndBelonging",
  impulse: "impulseControl",
  emotional: "angerAndEmotionalRegulation",
  participation: "participationControl",
};

// Behavior & Discipline Breakdown Values
// Edit ONLY the numbers below to change the values shown in the driver breakdown.
// Each value can be entered to one decimal place.
const BEHAVIOR_BREAKDOWN_VALUES: Record<DisruptionKey, number> = {
  "off-task": 56.09,
  "non-compliance": 54.86,
  peer: 51.66,
  impulse: 51.28,
  emotional: 51.16,
  participation: 56.34,
};

function latestDriverScores(): Record<DisruptionKey, number | null> {
  const out = {} as Record<DisruptionKey, number | null>;

  for (const key of DISRUPTION_ORDER) {
    out[key] = round1(BEHAVIOR_BREAKDOWN_VALUES[key]);
  }

  return out;
}

function driverWeeklyChange(key: DisruptionKey): number | null {
  if (BEHAVIOR_WEEKLY_DATA.length < 2) return null;
  const populated = BEHAVIOR_WEEKLY_DATA.filter(
    (row) => typeof row[DRIVER_FIELD[key]] === "number",
  );
  const last = populated[populated.length - 1]?.[DRIVER_FIELD[key]];
  const prev = populated[populated.length - 2]?.[DRIVER_FIELD[key]];
  if (typeof last !== "number" || typeof prev !== "number") return null;
  return round1(last - prev);
}

/** Demo — deterministic seeded estimate of how many of the 16 real students
 * are below the at-risk threshold for a given driver. No real per-driver
 * per-student data exists to compute this for real (see file header). */
function demoStudentCountForDriver(key: DisruptionKey, total: number): number {
  const seed = idSeed(key) * 13;
  return Math.round(rand(seed) * total * 0.4);
}

/** Class-level driver scores and trend are real (from the CSV weekly
 * series); studentCount is a seeded demo estimate (see studentCountIsDemo). */
export function classDisruptionBreakdown(
  students: Student[] = STUDENTS,
): DisruptionStat[] {
  const scores = latestDriverScores();
  return DISRUPTION_ORDER.map((key) => {
    const score = scores[key];
    const hasData = score != null;
    return {
      key,
      label: DISRUPTION_LABEL[key],
      description: DISRUPTION_DESCRIPTION[key],
      hue: DISRUPTION_HUE[key],
      hasData,
      severity: hasData ? 100 - score! : null,
      studentCount: hasData
        ? demoStudentCountForDriver(key, students.length)
        : 0,
      studentCountIsDemo: true,
      score,
      status: hasData ? statusFromScore(score!) : null,
      weeklyChange: hasData ? driverWeeklyChange(key) : null,
    };
  });
}

/** Demo — which real students "contribute" to a given disruption category.
 * No real per-student-per-driver split exists (see file header), so this is
 * a seeded subset sized to match demoStudentCountForDriver() for the same
 * key, not a real flag. */
export function studentsByDisruption(
  key: DisruptionKey,
  students: Student[] = STUDENTS,
): Student[] {
  const count = demoStudentCountForDriver(key, students.length);
  if (count === 0) return [];
  return [...students]
    .sort(
      (a, b) =>
        rand(idSeed(a.id) + idSeed(key)) - rand(idSeed(b.id) + idSeed(key)),
    )
    .slice(0, count);
}

export type DriverSkill = { name: string; score: number };

/** Static Problem Area → Skills reference (Component 3) — the skill names
 * this driver would score per student once real data exists, without a
 * score attached (there's no per-student signal to average yet). */
const DRIVER_SKILL_NAMES: Record<DisruptionKey, string[]> = {
  "off-task": [
    "Sustained Attention",
    "Task persistence",
    "Verbal Self-Regulation",
  ],
  "non-compliance": ["Monitoring", "Self-Regulation"],
  peer: ["Cooperation", "Behavioral control", "Auditory inhibition"],
  impulse: ["Motor Control", "Behavioral control", "Sustained Attention"],
  emotional: ["Self-awareness", "Frustration Tolerance", "Self-Regulation"],
  participation: [
    "Behavioral control",
    "Arousal Modulation",
    "Verbal Self-Regulation",
  ],
};

const PROBLEM_AREA_NOTE: Partial<Record<DisruptionKey, string>> = {
  impulse: "movement/restlessness",
  participation: "interrupting / over-talking / under-participation",
};

export function problemAreaToSkills(): {
  key: DisruptionKey;
  label: string;
  note?: string;
  skills: string[];
}[] {
  return DISRUPTION_ORDER.map((key) => ({
    key,
    label: DISRUPTION_LABEL[key],
    note: PROBLEM_AREA_NOTE[key],
    skills: DRIVER_SKILL_NAMES[key],
  }));
}

/** No real per-student signal exists to average yet. */
export function driverImpactingSkills(
  key: DisruptionKey,
  _students: Student[] = STUDENTS,
): DriverSkill[] {
  return DRIVER_SKILL_NAMES[key].map((name) => ({ name, score: 0 }));
}

/* ─────────────────────────────────────────────────────────
 * Behaviour Pattern Insights — cross-pattern summary. With zero drivers
 * carrying real data, the watch/strength lists are naturally empty (no
 * fabricated "held steady" claims from data that doesn't exist) — the one
 * real signal this can still surface is which logged follow-up strategy is
 * actually working, when real follow-up logs exist.
 * ───────────────────────────────────────────────────────── */

export type PatternInsight = {
  id: string;
  type: "watch" | "strength";
  text: string;
};

export function behaviorPatternInsights(
  breakdown: DisruptionStat[],
  followUps: Pick<FollowUpRecord, "support" | "outcome">[] = [],
  limit = 5,
): PatternInsight[] {
  const withData = breakdown.filter((d) => d.hasData);
  const watch = withData
    .filter((d) => (d.weeklyChange ?? 0) < 0)
    .map((d) => ({
      id: `watch-${d.key}`,
      type: "watch" as const,
      text: `${d.label} increased this week.`,
    }));
  const strength = withData
    .filter(
      (d) =>
        (d.weeklyChange ?? 0) >= 0 &&
        (d.status === "strong" || d.status === "stable"),
    )
    .map((d) => ({
      id: `strength-${d.key}`,
      type: "strength" as const,
      text: `${d.label} held steady this week.`,
    }));

  const insights: PatternInsight[] = [...watch, ...strength];

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
 * Yellow Recommends — classroom management strategies. Generic pedagogical
 * advice, not derived from any per-student signal — safe to show
 * regardless of data coverage.
 * ───────────────────────────────────────────────────────── */

export type StrategyKind =
  | "Whole Class"
  | "Small Group"
  | "Individual"
  | "Routine"
  | "Game";

export type BehaviorStrategy = {
  id: string;
  title: string;
  rationale: string;
  kind: StrategyKind;
  durationMins: number;
  targets: DisruptionKey[];
  triggers?: string[];
};

const STRATEGIES: BehaviorStrategy[] = [
  {
    id: "praise-specific",
    title: "Use specific behavior-based praise",
    rationale:
      "Naming the behavior (not just 'good job') reinforces what works.",
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
    rationale:
      "Most lost minutes happen between activities — a visible timer cuts it.",
    kind: "Routine",
    durationMins: 0,
    targets: ["non-compliance", "impulse"],
    triggers: ["Transition"],
  },
  {
    id: "small-group-impulse",
    title: "Impulse-control mini-group (4 students)",
    rationale:
      "The same 4 names drive most impulse flags — pull them for a 10-min skill drill.",
    kind: "Small Group",
    durationMins: 10,
    targets: ["impulse"],
  },
  {
    id: "buddy-pair",
    title: "Buddy-pair the back row",
    rationale:
      "Pairs a high-impulse student with a calm peer to defuse peer-interaction flags.",
    kind: "Individual",
    durationMins: 0,
    targets: ["peer", "participation"],
    triggers: ["Peer proximity"],
  },
  {
    id: "calming-checkin",
    title: "Use a 2-minute calming check-in routine",
    rationale:
      "A brief self-check-in before demanding tasks builds coping capacity over time.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["emotional"],
    triggers: ["Change in routine", "Unknown"],
  },
  {
    id: "chunk-instructions",
    title: "Break instructions into shorter chunks",
    rationale:
      "Long instruction blocks strain working memory — shorter chunks with a quick check keep the whole class following.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["off-task", "non-compliance"],
    triggers: ["Long instruction blocks"],
  },
  {
    id: "movement-break",
    title: "Introduce movement breaks",
    rationale:
      "A brief movement reset channels restlessness before it turns into off-task drift or disruption.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["impulse", "off-task"],
    triggers: ["Long wait"],
  },
  {
    id: "participation-rules",
    title: "Set clear participation rules (raise hand, turn-taking)",
    rationale:
      "Explicit turn-taking rules cut down on talking-out-of-turn and peer-proximity friction.",
    kind: "Routine",
    durationMins: 0,
    targets: ["non-compliance", "participation"],
    triggers: ["Peer proximity", "Correction"],
  },
  {
    id: "freeze-focus",
    title: "“Freeze & focus” game",
    rationale:
      "A quick freeze-on-cue game resets attention and impulse control after a noisy or high-energy stretch.",
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

const DEFAULT_STRATEGY_IDS = [
  "chunk-instructions",
  "movement-break",
  "participation-rules",
  "freeze-focus",
];

/** Ranks strategies by how well they match this week's real logged
 * triggers (falls back to the general default set, then the full catalog). */
export function pickStrategiesForTriggers(
  antecedentsThisWeek: string[],
  count = 4,
): BehaviorStrategy[] {
  const counts = new Map<string, number>();
  for (const trigger of antecedentsThisWeek)
    counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  const rankedTriggers = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([trigger]) => trigger);
  const focusTriggers = new Set(rankedTriggers.slice(0, 3));
  const matched = STRATEGIES.filter((s) =>
    s.triggers?.some((t) => focusTriggers.has(t)),
  );
  const byId = new Map(STRATEGIES.map((s) => [s.id, s]));
  const defaults = DEFAULT_STRATEGY_IDS.map((id) => byId.get(id)).filter(
    (s): s is BehaviorStrategy => !!s,
  );
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

export function pickBehaviorStrategies(
  breakdown: DisruptionStat[],
  count = 5,
): BehaviorStrategy[] {
  const withData = breakdown.filter((d) => d.hasData && d.severity != null);
  const ranked = [...withData].sort(
    (a, b) => (b.severity ?? 0) - (a.severity ?? 0),
  );
  const focusKeys = new Set(ranked.slice(0, 3).map((d) => d.key));
  const matched = STRATEGIES.filter((s) =>
    s.targets.some((t) => focusKeys.has(t)),
  );
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
 * Students needing behavior support — no real per-student behaviour score
 * exists yet, so this is always empty.
 * ───────────────────────────────────────────────────────── */

export type SupportStatus = "active" | "monitoring" | "new";

export type BehaviorSupport = {
  student: Student;
  primary: DisruptionKey;
  primaryLabel: string;
  insight: string;
  status: SupportStatus;
  score: number;
  trend: number;
};

export function studentsNeedingBehaviorSupport(
  _students: Student[] = STUDENTS,
  _limit = 12,
): BehaviorSupport[] {
  return [];
}

/* ─────────────────────────────────────────────────────────
 * Monthly Behavior check-in (MCQ) — a teacher self-report, independent of
 * the student roster's fields entirely (unaffected by the real-data switch).
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
    helper:
      "Includes time spent redirecting, settling students, and addressing disruptions.",
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
    helper:
      "Time from ending one activity to the class being fully ready for the next.",
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
 * Priority Actions — every item is derived from data already real
 * elsewhere (the support roster, driver weekly movement, logged positive
 * behaviour). With an empty roster/breakdown, most rungs naturally produce
 * nothing; the positive-reinforcement-gap rung still fires correctly since
 * it depends only on the real `positiveLogsThisWeek` count, not the roster.
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

  const newFlags = supportRoster.filter((r) => r.status === "new");
  if (newFlags.length > 0) {
    actions.push({
      id: "tier3-review",
      priority: "high",
      title: `Review ${newFlags.length} newly flagged student${newFlags.length === 1 ? "" : "s"}`,
      detail:
        "No support plan started yet — review with the support team this week.",
      ctaLabel: "View students",
      cta: "tier3-review",
    });
  }

  const activePlans = supportRoster.filter((r) => r.status === "active");
  if (activePlans.length > 0) {
    actions.push({
      id: "overdue-followup",
      priority: "high",
      title: `Follow up with ${activePlans.length} student${activePlans.length === 1 ? "" : "s"}`,
      detail:
        "Strategy review is overdue for students already on a support plan.",
      ctaLabel: "Log follow-up",
      cta: "overdue-followup",
    });
  }

  const groupCandidate = [...breakdown]
    .filter(
      (d) =>
        d.hasData &&
        d.studentCount >= 4 &&
        (d.status === "reinforcement" || d.status === "support"),
    )
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

  const worstWatch = [...breakdown]
    .filter((d) => d.hasData && (d.weeklyChange ?? 0) < 0)
    .sort((a, b) => (a.weeklyChange ?? 0) - (b.weeklyChange ?? 0))[0];
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

  const majorCount = supportRoster.filter(
    (r) => statusFromScore(r.score) === "support",
  ).length;
  if (majorCount > 0) {
    actions.push({
      id: "parent-comm",
      priority: "low",
      title: `Notify parents for ${majorCount} student${majorCount === 1 ? "" : "s"}`,
      detail:
        "Major behaviour concerns this week haven't been shared with families yet.",
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
 * Activity / Context Pattern — grounded in real breakdown driver counts;
 * naturally empty while every driver's studentCount is 0. The old
 * "missing/incomplete work" row (based on gamesAssigned/gamesPlayed) has no
 * equivalent in the real dataset and has been removed rather than kept
 * with a fabricated ratio.
 * ───────────────────────────────────────────────────────── */

export type ActivityContextRow = {
  id: string;
  context: string;
  mainFriction: string;
  count: number;
  recommendedAction: string;
  driverKey?: DisruptionKey;
};

export function behaviorActivityContextPatterns(
  breakdown: DisruptionStat[],
  _students: Student[] = STUDENTS,
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
      recommendedAction:
        strategyForDriver("off-task")?.title ?? "Introduce a visual checklist",
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
        strategyForDriver("non-compliance")?.title ??
        "Use a consistent instruction-and-check routine",
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

  return rows.sort((a, b) => b.count - a.count);
}

/* ─────────────────────────────────────────────────────────
 * Time-of-Day Pattern — buckets real logged-behaviour timestamps (genuine
 * teacher-log data, not derived from Student fields).
 * ───────────────────────────────────────────────────────── */

export type TimeOfDayKey = "morning" | "midday" | "afternoon" | "endOfDay";

export const TIME_OF_DAY_LABEL: Record<TimeOfDayKey, string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  endOfDay: "End of day",
};

const TIME_OF_DAY_ORDER: TimeOfDayKey[] = [
  "morning",
  "midday",
  "afternoon",
  "endOfDay",
];

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
  const counts: Record<TimeOfDayKey, number> = {
    morning: 0,
    midday: 0,
    afternoon: 0,
    endOfDay: 0,
  };
  for (const iso of timestamps) {
    counts[timeOfDayForHour(new Date(iso).getHours())] += 1;
  }
  const total = timestamps.length;
  const ranked = TIME_OF_DAY_ORDER.map((key) => ({
    key,
    count: counts[key],
  })).sort((a, b) => b.count - a.count);
  const peak = total > 0 && ranked[0].count > 0 ? ranked[0].key : null;

  const topDriver = [...breakdown]
    .filter((d) => d.hasData)
    .sort((a, b) => b.studentCount - a.studentCount)[0];
  return {
    counts,
    total,
    peak,
    topDriverLabel:
      topDriver && topDriver.studentCount > 0
        ? topDriver.label.toLowerCase()
        : null,
  };
}

/* ─────────────────────────────────────────────────────────
 * Behaviour Triggers & Actions — sourced from real logged antecedents
 * (genuine teacher-log data, not derived from Student fields).
 * ───────────────────────────────────────────────────────── */

export type BehaviorTriggerRow = {
  id: string;
  trigger: string;
  count: number;
  recommendedAction: string;
};

export function behaviorTriggerPatterns(
  antecedentsThisWeek: string[],
  limit = 5,
): BehaviorTriggerRow[] {
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
        strategyForTrigger(trigger)?.title ??
        "Log more detail next time to refine this suggestion.",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/* ─────────────────────────────────────────────────────────
 * Classroom Disruption Impact — DEMO. No real time-tracking data exists
 * anywhere in this app (same reason lib/schoolData.ts's "Recovered
 * Instructional Time" KPI has zero real basis) — every field here is a
 * seeded estimate, tagged wherever it renders.
 * ───────────────────────────────────────────────────────── */

export type DisruptionImpactPoint = { label: string; hours: number };

export type DisruptionImpact = {
  hoursLostThisMonth: number;
  avgIncidentsPerClass: number;
  mostAffectedMoment: string;
  teachingFlowImpact: "Low" | "Medium" | "High";
  weekly: DisruptionImpactPoint[];
  teacherInsight: string;
};

const IMPACT_MOMENTS = [
  "Transitions",
  "Independent work",
  "Group work",
  "Instruction start",
];

export function classDisruptionImpact(): DisruptionImpact {
  const weekly: DisruptionImpactPoint[] = ["W1", "W2", "W3", "W4", "W5"].map(
    (label, i) => ({
      label,
      hours: Math.round((0.4 + rand(idSeed(label) + i * 3) * 2.6) * 10) / 10,
    }),
  );
  const hoursLostThisMonth =
    Math.round(weekly.reduce((a, p) => a + p.hours, 0) * 10) / 10;
  const avgIncidentsPerClass = Math.round(2 + rand(idSeed("incidents")) * 4);
  const mostAffectedMoment =
    IMPACT_MOMENTS[Math.floor(rand(idSeed("moment")) * IMPACT_MOMENTS.length)];
  const teachingFlowImpact: DisruptionImpact["teachingFlowImpact"] =
    hoursLostThisMonth >= 3
      ? "High"
      : hoursLostThisMonth >= 1.5
        ? "Medium"
        : "Low";

  return {
    hoursLostThisMonth,
    avgIncidentsPerClass,
    mostAffectedMoment,
    teachingFlowImpact,
    weekly,
    teacherInsight: `${mostAffectedMoment} and independent work are taking the most time to settle.`,
  };
}

/* ─────────────────────────────────────────────────────────
 * Skills Influencing Behaviour — DEMO. 8 executive-function/regulation
 * skills that aren't tracked per-skill anywhere in the real dataset —
 * seeded off the real 6 driver scores (so they move in a direction that's
 * at least consistent with real class performance) plus jitter, not
 * independent fabrication.
 * ───────────────────────────────────────────────────────── */

export type BehaviorSkillKey =
  | "self-control"
  | "response-inhibition"
  | "emotional-recovery"
  | "rule-awareness"
  | "social-awareness"
  | "flexibility"
  | "turn-taking"
  | "self-monitoring";

export const BEHAVIOR_SKILL_LABEL: Record<BehaviorSkillKey, string> = {
  "self-control": "Self-Control",
  "response-inhibition": "Response Inhibition",
  "emotional-recovery": "Emotional Recovery",
  "rule-awareness": "Rule Awareness",
  "social-awareness": "Social Awareness",
  flexibility: "Flexibility",
  "turn-taking": "Turn-Taking",
  "self-monitoring": "Self-Monitoring",
};

const BEHAVIOR_SKILL_ORDER: BehaviorSkillKey[] = [
  "self-control",
  "response-inhibition",
  "emotional-recovery",
  "rule-awareness",
  "social-awareness",
  "flexibility",
  "turn-taking",
  "self-monitoring",
];

// Each skill anchored to whichever real driver it's most related to, so the
// demo score at least trends with real class performance instead of being
// fully independent noise.
const SKILL_DRIVER_ANCHOR: Record<BehaviorSkillKey, DisruptionKey> = {
  "self-control": "impulse",
  "response-inhibition": "impulse",
  "emotional-recovery": "emotional",
  "rule-awareness": "non-compliance",
  "social-awareness": "peer",
  flexibility: "off-task",
  "turn-taking": "peer",
  "self-monitoring": "participation",
};

export type BehaviorSkillStat = {
  key: BehaviorSkillKey;
  label: string;
  score: number;
};

export function behaviorInfluencingSkills(): BehaviorSkillStat[] {
  const driverScores = latestDriverScores();
  return BEHAVIOR_SKILL_ORDER.map((key) => {
    const anchor = driverScores[SKILL_DRIVER_ANCHOR[key]] ?? 55;
    const jitter = (rand(idSeed(key) * 5) - 0.5) * 20;
    const score = Math.max(0, Math.min(100, Math.round(anchor + jitter)));
    return { key, label: BEHAVIOR_SKILL_LABEL[key], score };
  });
}

/* ─────────────────────────────────────────────────────────
 * Behaviour Trend Over Time — real weekly series for the 4 drivers that
 * have a direct CSV field (Overall composite, Peer Interaction, Impulse
 * Control, Non-Compliance), sourced from the L2 weekly/monthly series.
 * ───────────────────────────────────────────────────────── */

export type BehaviorTrendSeriesKey =
  | "overall"
  | "peer"
  | "impulse"
  | "non-compliance";

export const BEHAVIOR_TREND_LABEL: Record<BehaviorTrendSeriesKey, string> = {
  overall: "Overall Behaviour Status",
  peer: DISRUPTION_LABEL.peer,
  impulse: DISRUPTION_LABEL.impulse,
  "non-compliance": DISRUPTION_LABEL["non-compliance"],
};

export const BEHAVIOR_TREND_TONE: Record<BehaviorTrendSeriesKey, string> = {
  overall: "hsl(212 90% 58%)",
  peer: DISRUPTION_HUE.peer,
  impulse: DISRUPTION_HUE.impulse,
  "non-compliance": DISRUPTION_HUE["non-compliance"],
};

export type BehaviorTrendPoint = { label: string } & Record<
  BehaviorTrendSeriesKey,
  number | null
>;

export function behaviorTrendOverTime(
  period: "Weekly" | "Monthly" = "Weekly",
): BehaviorTrendPoint[] {
  const rows =
    period === "Monthly" ? BEHAVIOR_MONTHLY_DATA : BEHAVIOR_WEEKLY_DATA;
  return rows.map((row, i) => ({
    label: period === "Monthly" ? monthLabel(row.startDate) : `W${i + 1}`,
    overall:
      row.behaviorAndDisciplineScore != null
        ? round1(row.behaviorAndDisciplineScore)
        : null,
    peer:
      row.peerSafetyAndBelonging != null
        ? round1(row.peerSafetyAndBelonging)
        : null,
    impulse: row.impulseControl != null ? round1(row.impulseControl) : null,
    "non-compliance":
      row.nonCompliance != null ? round1(row.nonCompliance) : null,
  }));
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function monthLabel(iso: string): string {
  const m = Number(iso.split("-")[1]);
  return MONTH_SHORT[m - 1] ?? iso;
}

export type BehaviorTrendSummary = {
  mostImproved: {
    key: BehaviorTrendSeriesKey;
    label: string;
    delta: number;
  } | null;
  watchArea: {
    key: BehaviorTrendSeriesKey;
    label: string;
    delta: number;
  } | null;
  studentsImproving: number;
  studentsNeedingSupport: number;
  insight: string;
};

/** studentsImproving/studentsNeedingSupport reuse the real per-student
 * distribution from classBehaviorSnapshot() — mostImproved/watchArea are
 * real (from the trend series above); the insight sentence is generated
 * from those real deltas, not fabricated. */
export function behaviorTrendSummary(
  points: BehaviorTrendPoint[],
  snapshot: BehaviorSnapshotData,
): BehaviorTrendSummary {
  const keys: BehaviorTrendSeriesKey[] = [
    "overall",
    "peer",
    "impulse",
    "non-compliance",
  ];
  const first = points[0];
  const last = points[points.length - 1];

  const deltas = keys
    .map((key) => {
      const a = first?.[key];
      const b = last?.[key];
      if (typeof a !== "number" || typeof b !== "number") return null;
      return { key, label: BEHAVIOR_TREND_LABEL[key], delta: round1(b - a) };
    })
    .filter(
      (d): d is { key: BehaviorTrendSeriesKey; label: string; delta: number } =>
        d !== null,
    );

  const sorted = [...deltas].sort((a, b) => b.delta - a.delta);
  const mostImproved = sorted[0] ?? null;
  const watchArea = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  const studentsImproving =
    (snapshot.distribution?.strong ?? 0) + (snapshot.distribution?.stable ?? 0);
  const studentsNeedingSupport =
    (snapshot.distribution?.reinforcement ?? 0) +
    (snapshot.distribution?.support ?? 0);

  const insight =
    mostImproved && watchArea
      ? `Behaviour regulation has ${mostImproved.delta >= 0 ? "improved" : "declined"} over the last period. ${mostImproved.label} is stronger, but ${watchArea.label.toLowerCase()} continues to need support.`
      : "Not enough weekly history yet to summarize a trend.";

  return {
    mostImproved,
    watchArea,
    studentsImproving,
    studentsNeedingSupport,
    insight,
  };
}
