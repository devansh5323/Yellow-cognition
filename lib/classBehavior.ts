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
  };
}

/* ─────────────────────────────────────────────────────────
 * Disruption breakdown — six behaviour categories
 * ───────────────────────────────────────────────────────── */

export type DisruptionKey =
  | "off-task"
  | "non-compliance"
  | "peer"
  | "impulse"
  | "emotional"
  | "participation";

export const DISRUPTION_LABEL: Record<DisruptionKey, string> = {
  "off-task": "Off-task behaviour",
  "non-compliance": "Non-compliance",
  peer: "Peer interaction",
  impulse: "Impulse control",
  emotional: "Emotional regulation",
  participation: "Participation control",
};

export const DISRUPTION_DESCRIPTION: Record<DisruptionKey, string> = {
  "off-task": "Drifting from the assigned activity — doodling, side conversations, fidgeting.",
  "non-compliance": "Slow or refusing response to instructions and reminders.",
  peer: "Disrupting peers, interrupting, or escalating conflicts during work.",
  impulse: "Calling out, leaving seat, struggling to wait their turn.",
  emotional: "Big reactions to small frustrations — shutting down or escalating.",
  participation: "Over-participating or under-participating despite cues to balance.",
};

export const DISRUPTION_HUE: Record<DisruptionKey, string> = {
  "off-task": "hsl(38 92% 55%)",
  "non-compliance": "hsl(0 78% 58%)",
  peer: "hsl(286 60% 60%)",
  impulse: "hsl(20 85% 58%)",
  emotional: "hsl(258 55% 60%)",
  participation: "hsl(196 75% 50%)",
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
};

/**
 * Score each category by inspecting how many students present that pattern
 * and how strong the underlying signal is. Mock-only: thresholds picked so
 * the seven "high contributors" surface visibly without any one dominating.
 */
export function classDisruptionBreakdown(students: Student[] = STUDENTS): DisruptionStat[] {
  const total = Math.max(1, students.length);
  const byKey = (predicate: (s: Student) => boolean): number => students.filter(predicate).length;

  const getDom = (s: Student) => studentAttentionDomains(s);
  const subAt = (s: Student, i: number) => s.subDomains[i]?.score ?? 60;

  const offTask = byKey((s) => getDom(s).sus < 60);
  const nonComp = byKey((s) => getDom(s).beh < 55);
  const peer = byKey((s) => subAt(s, 6) < 60);
  const impulse = byKey((s) => getDom(s).hyp > 70);
  const emotional = byKey((s) => subAt(s, 5) < 58);
  const participation = byKey((s) => subAt(s, 7) < 60);

  const toSeverity = (count: number) => Math.round((count / total) * 100);

  const stats: DisruptionStat[] = [
    {
      key: "off-task",
      label: DISRUPTION_LABEL["off-task"],
      description: DISRUPTION_DESCRIPTION["off-task"],
      hue: DISRUPTION_HUE["off-task"],
      severity: toSeverity(offTask),
      prevSeverity: toSeverity(offTask) + 6,
      studentCount: offTask,
    },
    {
      key: "non-compliance",
      label: DISRUPTION_LABEL["non-compliance"],
      description: DISRUPTION_DESCRIPTION["non-compliance"],
      hue: DISRUPTION_HUE["non-compliance"],
      severity: toSeverity(nonComp),
      prevSeverity: toSeverity(nonComp) + 4,
      studentCount: nonComp,
    },
    {
      key: "peer",
      label: DISRUPTION_LABEL.peer,
      description: DISRUPTION_DESCRIPTION.peer,
      hue: DISRUPTION_HUE.peer,
      severity: toSeverity(peer),
      prevSeverity: toSeverity(peer) + 2,
      studentCount: peer,
    },
    {
      key: "impulse",
      label: DISRUPTION_LABEL.impulse,
      description: DISRUPTION_DESCRIPTION.impulse,
      hue: DISRUPTION_HUE.impulse,
      severity: toSeverity(impulse),
      prevSeverity: toSeverity(impulse) + 5,
      studentCount: impulse,
    },
    {
      key: "emotional",
      label: DISRUPTION_LABEL.emotional,
      description: DISRUPTION_DESCRIPTION.emotional,
      hue: DISRUPTION_HUE.emotional,
      severity: toSeverity(emotional),
      prevSeverity: Math.max(0, toSeverity(emotional) - 3),
      studentCount: emotional,
    },
    {
      key: "participation",
      label: DISRUPTION_LABEL.participation,
      description: DISRUPTION_DESCRIPTION.participation,
      hue: DISRUPTION_HUE.participation,
      severity: toSeverity(participation),
      prevSeverity: toSeverity(participation) + 1,
      studentCount: participation,
    },
  ];

  return stats;
}

/** Returns students who contribute to a given disruption category. */
export function studentsByDisruption(
  key: DisruptionKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students.filter((s) => {
    const dom = studentAttentionDomains(s);
    const subAt = (i: number) => s.subDomains[i]?.score ?? 60;
    switch (key) {
      case "off-task":
        return dom.sus < 60;
      case "non-compliance":
        return dom.beh < 55;
      case "peer":
        return subAt(6) < 60;
      case "impulse":
        return dom.hyp > 70;
      case "emotional":
        return subAt(5) < 58;
      case "participation":
        return subAt(7) < 60;
    }
  });
}

/* ─────────────────────────────────────────────────────────
 * Triggers & actions — paired with the underlying skills each
 * trigger taxes, so a single card can answer "what's setting
 * this off, what to try, and what skills it's training."
 * ───────────────────────────────────────────────────────── */

export type TriggerSeverity = "high" | "medium" | "low";

export type TriggerSkill = {
  name: string;
  /** Class-level mastery (0–100). Lower = more taxed by this trigger. */
  score: number;
};

export type BehaviorTrigger = {
  id: string;
  label: string;
  detail: string;
  severity: TriggerSeverity;
  /** A short, paired action the teacher can try. */
  action: string;
  iconKey: "clock" | "users" | "volume" | "shuffle" | "sun";
  /** Cognitive / social-emotional skills this trigger taxes, with the
   * class's current mastery score for each. */
  skills: TriggerSkill[];
};

export const BEHAVIOR_TRIGGERS: BehaviorTrigger[] = [
  {
    id: "long-instruction",
    label: "Long instruction blocks",
    detail: "Disruptions cluster after 12+ minutes of direct instruction.",
    severity: "high",
    action: "Insert a 90-second active recall every 12 minutes.",
    iconKey: "clock",
    skills: [
      { name: "Sustained attention", score: 52 },
      { name: "Working memory", score: 58 },
      { name: "Self-regulation", score: 55 },
    ],
  },
  {
    id: "peer-proximity",
    label: "Peer proximity",
    detail: "Adjacent-seat conflicts triggered ~30% of off-task incidents.",
    severity: "medium",
    action: "Pair-swap the back row using the seating template.",
    iconKey: "users",
    skills: [
      { name: "Social cognition", score: 64 },
      { name: "Impulse control", score: 60 },
      { name: "Perspective taking", score: 62 },
    ],
  },
  {
    id: "noise-level",
    label: "Noise levels",
    detail: "Ambient classroom noise above 60 dB doubled redirects this week.",
    severity: "medium",
    action: "Run a 'silent-signal' minute when noise builds.",
    iconKey: "volume",
    skills: [
      { name: "Auditory processing", score: 66 },
      { name: "Self-regulation", score: 55 },
      { name: "Cognitive flexibility", score: 62 },
    ],
  },
  {
    id: "transitions",
    label: "Transition windows",
    detail: "Most lost minutes happen in the 2 minutes after activity changes.",
    severity: "high",
    action: "Use a 30-second visual countdown between activities.",
    iconKey: "shuffle",
    skills: [
      { name: "Cognitive flexibility", score: 50 },
      { name: "Self-monitoring", score: 54 },
      { name: "Inhibitory control", score: 48 },
    ],
  },
  {
    id: "post-recess",
    label: "Post-recess re-entry",
    detail: "First period after recess shows the highest impulse-control flags.",
    severity: "low",
    action: "Open with a 2-minute breath-and-anchor routine.",
    iconKey: "sun",
    skills: [
      { name: "Emotion identification", score: 70 },
      { name: "Calming strategies", score: 68 },
      { name: "Self-regulation", score: 55 },
    ],
  },
];

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
    targets: ["off-task", "participation"],
  },
  {
    id: "silent-signals",
    title: "Establish silent attention signals",
    rationale: "Replaces verbal redirects, lowering interruptions and noise.",
    kind: "Routine",
    durationMins: 0,
    targets: ["off-task", "non-compliance"],
  },
  {
    id: "calm-corner",
    title: "Set up a calm corner protocol",
    rationale: "Gives emotionally-flooded students a structured reset path.",
    kind: "Individual",
    durationMins: 5,
    targets: ["emotional"],
  },
  {
    id: "transition-30",
    title: "Run a 30-second transition countdown",
    rationale: "Most lost minutes happen between activities — a visible timer cuts it.",
    kind: "Routine",
    durationMins: 0,
    targets: ["off-task", "impulse"],
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
    targets: ["peer", "non-compliance"],
  },
  {
    id: "participation-cards",
    title: "Use participation cards (3 per student)",
    rationale: "Caps over-participators and cues quieter students to contribute.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["participation"],
  },
];

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
  const candidates: { key: DisruptionKey; signal: number }[] = [
    { key: "impulse", signal: dom.hyp - 60 },
    { key: "non-compliance", signal: 60 - dom.beh },
    { key: "off-task", signal: 60 - dom.sus },
    { key: "emotional", signal: 60 - subAt(5) },
    { key: "peer", signal: 60 - subAt(6) },
    { key: "participation", signal: 60 - subAt(7) },
  ];
  candidates.sort((a, b) => b.signal - a.signal);
  return candidates[0].key;
}

const INSIGHT_BY_KEY: Record<DisruptionKey, (s: Student) => string> = {
  "off-task": (s) =>
    `${s.name.split(" ")[0]} drifts after ~10 min — a single-channel worksheet helps.`,
  "non-compliance": (s) =>
    `${s.name.split(" ")[0]} responds best when instructions are paired with a visual cue.`,
  peer: (s) => `${s.name.split(" ")[0]} escalates near the back row — try a buddy-pair this week.`,
  impulse: (s) =>
    `${s.name.split(" ")[0]} calls out before being called on — a hand-raise rubric reduces it.`,
  emotional: (s) =>
    `${s.name.split(" ")[0]} shuts down on tough tasks — a 2-min anchor routine helps re-enter.`,
  participation: (s) =>
    `${s.name.split(" ")[0]} dominates discussions — try participation cards for balance.`,
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
      { id: "non-comp", label: "Non-compliance", weight: -1 },
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
