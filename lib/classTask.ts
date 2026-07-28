// Class Task Engagement — data + helpers for the Task Engagement experience.
// Derives the class-level picture from the existing student mocks (PFI, CSI,
// games played ratio, sub-domain scores, attention domains, subject trends).
// No new mocks required — purely a re-shape of existing signals.

import {
  STUDENTS,
  classMonthlyAttention,
  studentAttentionDomains,
  type Student,
} from "@/data/mockData";
import { studentComposites } from "@/lib/classHealth";

/* ─────────────────────────────────────────────────────────
 * Snapshot
 * ───────────────────────────────────────────────────────── */

export type TaskStatus = "strong" | "stable" | "reinforcement" | "support";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  reinforcement: "Needs Reinforcement",
  support: "Needs Support",
};

export const TASK_STATUS_TONE: Record<TaskStatus, string> = {
  strong: "hsl(142 55% 42%)",
  stable: "hsl(212 55% 45%)",
  reinforcement: "hsl(38 92% 50%)",
  support: "hsl(0 78% 56%)",
};

export const TASK_STATUS_RANGE: Record<TaskStatus, string> = {
  strong: "85–100",
  stable: "70–84",
  reinforcement: "55–69",
  support: "0–54",
};

export const TASK_STATUS_DESCRIPTION: Record<TaskStatus, string> = {
  strong: "Class is starting, sustaining, and finishing work consistently — keep current routines.",
  stable: "Most students are completing work — light scaffolding will lift the rest.",
  reinforcement:
    "Students start but stall — add checkpoints, clearer steps, and visible time cues.",
  support: "Engagement and follow-through are eroding learning time — structured supports needed.",
};

export function statusFromScore(score: number): TaskStatus {
  if (score >= 85) return "strong";
  if (score >= 70) return "stable";
  if (score >= 55) return "reinforcement";
  return "support";
}

export type TaskTrendPoint = {
  label: string;
  /** Engagement score (higher = better) */
  engagement: number;
  /** Completion rate (% of work finished) */
  completion: number;
  /** Initiation score (how quickly students begin) */
  initiation: number;
  /** Persistence score (how well students push through) */
  persistence: number;
};

export type TaskSnapshotData = {
  engagementScore: number;
  prevEngagementScore: number;
  delta: number;
  status: TaskStatus;
  total: number;
  completionRate: number;
  prevCompletionRate: number;
  initiationScore: number;
  prevInitiationScore: number;
  persistenceScore: number;
  prevPersistenceScore: number;
  /** Counts at each status band */
  statusDistribution: Record<TaskStatus, number>;
  /** Last 6 months trend */
  trend: TaskTrendPoint[];
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function studentCompletionRate(s: Student): number {
  return clamp((s.gamesPlayed / Math.max(1, s.gamesAssigned)) * 100);
}

function studentInitiation(s: Student): number {
  // Lower hyperactivity + higher behavioural regulation reads as smoother
  // task initiation — fewer false starts and faster onset of work.
  const dom = studentAttentionDomains(s);
  return clamp((100 - dom.hyp) * 0.55 + dom.beh * 0.45);
}

function studentPersistence(s: Student): number {
  // Sustained attention plus a slice of overall PFI.
  const dom = studentAttentionDomains(s);
  return clamp(dom.sus * 0.7 + s.pfi * 0.3);
}

function studentEngagement(s: Student): number {
  // Blend completion ratio with the attention/persistence picture.
  const completion = studentCompletionRate(s);
  const persistence = studentPersistence(s);
  const init = studentInitiation(s);
  return clamp(completion * 0.4 + persistence * 0.35 + init * 0.25);
}

function buildTrend(students: Student[]): TaskTrendPoint[] {
  const monthly = classMonthlyAttention(students);
  // Synth completion / initiation / persistence around the monthly attention
  // series so all four lines tell a coherent story month over month.
  return monthly.map((m, i) => {
    const engagement = m.attention ?? 65;
    const completion = clamp(engagement - 4 + ((i % 3) - 1) * 2);
    const initiation = clamp(engagement - 6 + ((i % 4) - 1) * 1.5);
    const persistence = clamp(engagement - 2 + ((i % 5) - 2));
    return { label: m.month, engagement, completion, initiation, persistence };
  });
}

export function classTaskSnapshot(students: Student[] = STUDENTS): TaskSnapshotData {
  const total = students.length;
  const engagement = students.map(studentEngagement);
  const completion = students.map(studentCompletionRate);
  const initiation = students.map(studentInitiation);
  const persistence = students.map(studentPersistence);

  const engagementScore = avg(engagement);
  const completionRate = avg(completion);
  const initiationScore = avg(initiation);
  const persistenceScore = avg(persistence);

  // Synth a "previous" snapshot a few points lower so the deltas read as
  // "trend up vs last month" by default — keeps the prototype lively.
  const prevEngagementScore = Math.max(0, engagementScore - 3);
  const prevCompletionRate = Math.max(0, completionRate - 5);
  const prevInitiationScore = Math.max(0, initiationScore - 2);
  const prevPersistenceScore = Math.max(0, persistenceScore - 3);

  const statusDistribution: Record<TaskStatus, number> = {
    strong: 0,
    stable: 0,
    reinforcement: 0,
    support: 0,
  };
  for (const s of engagement) statusDistribution[statusFromScore(s)] += 1;

  return {
    engagementScore,
    prevEngagementScore,
    delta: engagementScore - prevEngagementScore,
    status: statusFromScore(engagementScore),
    total,
    completionRate,
    prevCompletionRate,
    initiationScore,
    prevInitiationScore,
    persistenceScore,
    prevPersistenceScore,
    statusDistribution,
    trend: buildTrend(students),
  };
}

/* ─────────────────────────────────────────────────────────
 * Category breakdown — 7 task-engagement categories
 * ───────────────────────────────────────────────────────── */

export type TaskCategoryKey =
  | "initiation"
  | "persistence"
  | "completion"
  | "consistency"
  | "planning"
  | "independence"
  | "challenge";

export const TASK_CATEGORY_LABEL: Record<TaskCategoryKey, string> = {
  initiation: "Task initiation",
  persistence: "Persistence",
  completion: "Completion",
  consistency: "Consistency",
  planning: "Planning & time management",
  independence: "Independent execution",
  challenge: "Response to challenge",
};

export const TASK_CATEGORY_DESCRIPTION: Record<TaskCategoryKey, string> = {
  initiation: "How quickly students begin work after instructions end.",
  persistence: "Continuing through difficulty without giving up or asking for help too soon.",
  completion: "Finishing the work that was started in the available time.",
  consistency: "Producing similar effort and output day after day.",
  planning: "Sequencing steps and using the available time well.",
  independence: "Working without prompts, follow-up, or repeated instructions.",
  challenge: "Bouncing back from a wrong answer or a hard problem.",
};

export const TASK_CATEGORY_HUE: Record<TaskCategoryKey, string> = {
  initiation: "hsl(38 92% 55%)",
  persistence: "hsl(258 55% 60%)",
  completion: "hsl(142 55% 46%)",
  consistency: "hsl(196 75% 50%)",
  planning: "hsl(286 60% 60%)",
  independence: "hsl(20 85% 58%)",
  challenge: "hsl(168 62% 42%)",
};

export type TaskCategoryStat = {
  key: TaskCategoryKey;
  label: string;
  description: string;
  hue: string;
  /** 0–100 score; higher = better */
  score: number;
  prevScore: number;
  /** Count of students struggling in this category. */
  studentCount: number;
};

function studentCategoryScore(s: Student, key: TaskCategoryKey): number {
  const dom = studentAttentionDomains(s);
  const subAt = (i: number) => s.subDomains[i]?.score ?? 60;
  switch (key) {
    case "initiation":
      return clamp(studentInitiation(s));
    case "persistence":
      return clamp(studentPersistence(s));
    case "completion":
      return clamp(studentCompletionRate(s));
    case "consistency": {
      // Stability of the 4-week intra-month history — narrower spread = more
      // consistent effort. Map low-spread to a high score.
      const weeks = s.history.map((h) => h.pfi);
      const min = Math.min(...weeks);
      const max = Math.max(...weeks);
      const spread = max - min;
      return clamp(85 - spread * 1.6);
    }
    case "planning":
      // Divided attention + behavioural regulation read as the planning lane.
      return clamp(dom.div * 0.6 + dom.beh * 0.4);
    case "independence":
      // Behavioural reg + selective attention proxy independence.
      return clamp(dom.beh * 0.55 + dom.sel * 0.45);
    case "challenge":
      // Curiosity / adaptive thinking sub-domain proxies bouncing back.
      return clamp(subAt(7) * 0.55 + dom.sus * 0.45);
  }
}

function struggleThreshold(key: TaskCategoryKey): number {
  if (key === "completion") return 60;
  if (key === "consistency") return 65;
  return 60;
}

const CATEGORY_ORDER: TaskCategoryKey[] = [
  "initiation",
  "persistence",
  "completion",
  "consistency",
  "planning",
  "independence",
  "challenge",
];

export function classTaskBreakdown(students: Student[] = STUDENTS): TaskCategoryStat[] {
  return CATEGORY_ORDER.map((key) => {
    const scores = students.map((s) => studentCategoryScore(s, key));
    const score = avg(scores);
    const threshold = struggleThreshold(key);
    const studentCount = scores.filter((v) => v < threshold).length;
    return {
      key,
      label: TASK_CATEGORY_LABEL[key],
      description: TASK_CATEGORY_DESCRIPTION[key],
      hue: TASK_CATEGORY_HUE[key],
      score,
      prevScore: Math.max(0, score - 3),
      studentCount,
    };
  });
}

export function studentsByTaskCategory(
  key: TaskCategoryKey,
  students: Student[] = STUDENTS,
): Student[] {
  const threshold = struggleThreshold(key);
  return students
    .map((s) => ({ s, v: studentCategoryScore(s, key) }))
    .filter((x) => x.v < threshold)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}

/** Returns the strongest and weakest categories for the headline call-out. */
export function topAndBottomCategory(
  breakdown: TaskCategoryStat[],
): { strongest: TaskCategoryStat; weakest: TaskCategoryStat } | null {
  if (breakdown.length === 0) return null;
  const sorted = [...breakdown].sort((a, b) => b.score - a.score);
  return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
}

/* ─────────────────────────────────────────────────────────
 * Insights — engagement patterns + the underlying skills
 * each one taxes, so a single card answers "what's slowing
 * the class down, what to try, and what skills it's training."
 * ───────────────────────────────────────────────────────── */

export type TaskInsightTone = "warning" | "watch" | "info" | "positive";

export type TaskInsightSkill = {
  name: string;
  /** Class-level mastery (0–100). Lower = more taxed by this pattern. */
  score: number;
};

export type TaskInsight = {
  id: string;
  title: string;
  detail: string;
  tone: TaskInsightTone;
  iconKey: "list" | "timer" | "flag" | "scale" | "users" | "spark" | "checks";
  /** Cognitive / executive-function skills this pattern taxes, with the
   * class's current mastery score for each. */
  skills: TaskInsightSkill[];
};

export function taskEngagementInsights(students: Student[] = STUDENTS): TaskInsight[] {
  const total = Math.max(1, students.length);
  const breakdown = classTaskBreakdown(students);
  const find = (k: TaskCategoryKey) => breakdown.find((b) => b.key === k)!;
  const initiation = find("initiation");
  const persistence = find("persistence");
  const completion = find("completion");
  const independence = find("independence");
  const consistency = find("consistency");

  const slowStartPct = Math.max(20, Math.min(60, 100 - initiation.score));
  const dropPct = Math.max(15, Math.min(55, 100 - persistence.score));
  const finishedPct = completion.score;
  const promptedCount = independence.studentCount;
  const inconsistentCount = consistency.studentCount;

  const insights: TaskInsight[] = [
    {
      id: "instructions",
      title: "Instructions may be unclear for independent work",
      detail: `${promptedCount} students need extra prompting after instructions end — try restating in a single sentence on the board.`,
      tone: promptedCount > total * 0.25 ? "warning" : "watch",
      iconKey: "list",
      skills: [
        { name: "Auditory processing", score: 58 },
        { name: "Working memory", score: 60 },
        { name: "Self-regulation", score: 62 },
      ],
    },
    {
      id: "structure",
      title: "Tasks may lack step-by-step structure",
      detail:
        "Multi-step prompts lose ~30% of students by the third step. Add a printed checklist to long tasks.",
      tone: "watch",
      iconKey: "checks",
      skills: [
        { name: "Working memory", score: 56 },
        { name: "Sequencing", score: 58 },
        { name: "Sustained attention", score: 60 },
      ],
    },
    {
      id: "difficulty",
      title: "Difficulty level may be inconsistent",
      detail: `${inconsistentCount} students show big week-on-week swings. A short opening warm-up calibrates the room.`,
      tone: inconsistentCount > total * 0.3 ? "warning" : "watch",
      iconKey: "scale",
      skills: [
        { name: "Cognitive flexibility", score: 60 },
        { name: "Self-regulation", score: 58 },
        { name: "Adaptive thinking", score: 62 },
      ],
    },
    {
      id: "init-time",
      title: `${slowStartPct}% take more than 90 seconds to begin`,
      detail: "A visible 'start now' cue and 90-second countdown lifts on-time starts.",
      tone: slowStartPct >= 40 ? "warning" : "watch",
      iconKey: "timer",
      skills: [
        { name: "Processing speed", score: 54 },
        { name: "Self-regulation", score: 60 },
        { name: "Behavioural control", score: 58 },
      ],
    },
    {
      id: "drop",
      title: `Persistence drops for ${dropPct}% after the first wrong answer`,
      detail:
        "Pre-teach a single recovery line ('try one more thing, then ask a friend') before independent work.",
      tone: dropPct >= 35 ? "warning" : "watch",
      iconKey: "flag",
      skills: [
        { name: "Frustration tolerance", score: 52 },
        { name: "Sustained attention", score: 58 },
        { name: "Cognitive flexibility", score: 60 },
      ],
    },
    {
      id: "finish",
      title:
        finishedPct >= 70
          ? `${finishedPct}% of class finishes assigned work`
          : `Only ${finishedPct}% finish in the time given`,
      detail:
        finishedPct >= 70
          ? "Healthy completion — keep the current pace and difficulty mix."
          : "Try shrinking the work bundle by 20% and adding a 'done' tray.",
      tone: finishedPct >= 70 ? "positive" : "warning",
      iconKey: "users",
      skills: [
        { name: "Working memory", score: 60 },
        { name: "Planning", score: 58 },
        { name: "Sustained attention", score: 62 },
      ],
    },
    {
      id: "early-finishers",
      title: "Early finishers need a warm landing",
      detail: "Pin a 2-minute extension challenge so early finishers don't disrupt the rest.",
      tone: "info",
      iconKey: "spark",
      skills: [
        { name: "Self-regulation", score: 70 },
        { name: "Time sharing", score: 68 },
        { name: "Self-monitoring", score: 72 },
      ],
    },
  ];

  // Trim to 5 most informative — drop pure positives if there's enough actionable.
  const actionable = insights.filter((i) => i.tone !== "positive");
  if (actionable.length >= 5) return actionable.slice(0, 5);
  return insights.slice(0, 5);
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — task engagement strategies
 * ───────────────────────────────────────────────────────── */

export type TaskStrategyKind = "Whole Class" | "Small Group" | "Individual" | "Routine";

export type TaskStrategy = {
  id: string;
  title: string;
  rationale: string;
  kind: TaskStrategyKind;
  durationMins: number;
  targets: TaskCategoryKey[];
};

const STRATEGIES: TaskStrategy[] = [
  {
    id: "start-window",
    title: "Set a 90-second start window with a visible timer",
    rationale: "Anchors the start of independent work and reduces drift.",
    kind: "Routine",
    durationMins: 0,
    targets: ["initiation", "consistency"],
  },
  {
    id: "countdown",
    title: "Use a 'start-now' countdown cue between steps",
    rationale: "Cuts the second-step latency on multi-step tasks.",
    kind: "Routine",
    durationMins: 0,
    targets: ["initiation", "planning"],
  },
  {
    id: "checkpoints",
    title: "Add 3 checkpoints to long tasks",
    rationale: "Breaks large work into chunks students actually finish.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["completion", "planning", "persistence"],
  },
  {
    id: "quick-start",
    title: "Open with a 60-second quick-start challenge",
    rationale: "Warms the room and calibrates difficulty before the main task.",
    kind: "Whole Class",
    durationMins: 1,
    targets: ["initiation", "challenge"],
  },
  {
    id: "first-then",
    title: "Use 'first / then' cards for multi-step work",
    rationale: "Visually scaffolds independent execution for the bottom third.",
    kind: "Small Group",
    durationMins: 0,
    targets: ["independence", "planning"],
  },
  {
    id: "done-tray",
    title: "Set up a 'done' tray with an extension card",
    rationale: "Closes the loop for early finishers without disrupting the rest.",
    kind: "Routine",
    durationMins: 0,
    targets: ["completion", "consistency"],
  },
  {
    id: "praise-effort",
    title: "Praise persistence specifically — name the strategy",
    rationale: "Shifts the room toward the recovery move you want to see again.",
    kind: "Whole Class",
    durationMins: 0,
    targets: ["persistence", "challenge"],
  },
  {
    id: "pair-plan",
    title: "Pair-share the plan before independent work",
    rationale: "Surfaces the 'how' so independence isn't blocked by missing steps.",
    kind: "Small Group",
    durationMins: 2,
    targets: ["planning", "independence"],
  },
];

export function pickTaskStrategies(breakdown: TaskCategoryStat[], count = 5): TaskStrategy[] {
  const ranked = [...breakdown].sort((a, b) => a.score - b.score);
  const focusKeys = new Set(ranked.slice(0, 3).map((d) => d.key));
  const matched = STRATEGIES.filter((s) => s.targets.some((t) => focusKeys.has(t)));
  const seen = new Set<string>();
  const out: TaskStrategy[] = [];
  for (const s of [...matched, ...STRATEGIES]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
    if (out.length >= count) break;
  }
  return out;
}

/* ─────────────────────────────────────────────────────────
 * Students needing task support
 * ───────────────────────────────────────────────────────── */

export type TaskSupportStatus = "active" | "monitoring" | "new";

export type TaskSupport = {
  student: Student;
  primary: TaskCategoryKey;
  primaryLabel: string;
  insight: string;
  status: TaskSupportStatus;
  /** Engagement score 0–100 */
  score: number;
  /** Trend vs previous month (rough delta) */
  trend: number;
};

const INSIGHT_BY_KEY: Record<TaskCategoryKey, (s: Student) => string> = {
  initiation: (s) =>
    `${s.name.split(" ")[0]} takes 2+ minutes to begin — try a 'start-now' cue at the desk.`,
  persistence: (s) =>
    `${s.name.split(" ")[0]} stops after the first wrong answer — pre-teach a recovery line.`,
  completion: (s) =>
    `${s.name.split(" ")[0]} starts strong but rarely finishes — shrink the work bundle by 20%.`,
  consistency: (s) =>
    `${s.name.split(" ")[0]} swings 20+ points week-to-week — a daily warm-up steadies the room.`,
  planning: (s) =>
    `${s.name.split(" ")[0]} skips steps — 'first / then' cards keep the order clear.`,
  independence: (s) =>
    `${s.name.split(" ")[0]} needs repeated prompts — a printed checklist removes the bottleneck.`,
  challenge: (s) =>
    `${s.name.split(" ")[0]} disengages on hard problems — pair them with a calm partner first.`,
};

function inferPrimaryCategory(s: Student): TaskCategoryKey {
  // Pick the category with the lowest student score — that's where they need
  // help most.
  let weakest: TaskCategoryKey = "initiation";
  let worst = 101;
  for (const k of CATEGORY_ORDER) {
    const v = studentCategoryScore(s, k);
    if (v < worst) {
      worst = v;
      weakest = k;
    }
  }
  return weakest;
}

export function studentsNeedingTaskSupport(
  students: Student[] = STUDENTS,
  limit = 12,
): TaskSupport[] {
  const composites = studentComposites(students);
  // Lowest task-pillar scores first.
  const ranked = [...composites].sort((a, b) => a.pillars.task - b.pillars.task).slice(0, limit);
  return ranked.map((c, i) => {
    const primary = inferPrimaryCategory(c.student);
    const score = studentEngagement(c.student);
    return {
      student: c.student,
      primary,
      primaryLabel: TASK_CATEGORY_LABEL[primary],
      insight: INSIGHT_BY_KEY[primary](c.student),
      status: i === 0 ? "active" : i < 3 ? "monitoring" : "new",
      score,
      trend: c.pillars.task - c.prevPillars.task,
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Monthly Task check-in (MCQ)
 * ───────────────────────────────────────────────────────── */

export type TaskCheckInOption = {
  id: string;
  label: string;
  weight: number;
};

export type TaskCheckInQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: TaskCheckInOption[];
};

export const TASK_CHECKIN_QUESTIONS: TaskCheckInQuestion[] = [
  {
    id: "completion",
    prompt: "What share of students completed independent work this month?",
    options: [
      { id: "lt25", label: "Under 25%", weight: -2 },
      { id: "25to50", label: "25–50%", weight: -1 },
      { id: "50to75", label: "50–75%", weight: 0 },
      { id: "gt75", label: "Over 75%", weight: 2 },
    ],
  },
  {
    id: "consistency",
    prompt: "How consistent was task completion week-to-week?",
    options: [
      { id: "swing", label: "Big swings", weight: -2 },
      { id: "varied", label: "Varied — depends on the task", weight: -1 },
      { id: "ok", label: "Mostly steady", weight: 1 },
      { id: "steady", label: "Very steady", weight: 2 },
    ],
  },
  {
    id: "independence",
    prompt: "How independently did students work on assigned tasks?",
    options: [
      { id: "high-prompt", label: "Most needed prompting", weight: -2 },
      { id: "some-prompt", label: "Some needed reminders", weight: -1 },
      { id: "ok", label: "Most worked on their own", weight: 1 },
      { id: "very", label: "Strong independence", weight: 2 },
    ],
  },
  {
    id: "engagement",
    prompt: "How consistent was engagement during the month?",
    options: [
      { id: "low", label: "Hard to keep them engaged", weight: -2 },
      { id: "patchy", label: "Patchy — depended on activity", weight: -1 },
      { id: "ok", label: "Engaged on most days", weight: 1 },
      { id: "high", label: "Engaged across the month", weight: 2 },
    ],
  },
  {
    id: "initiation",
    prompt: "How quickly did the class begin tasks after instructions?",
    options: [
      { id: "slow", label: "More than 2 min", weight: -2 },
      { id: "1to2", label: "1–2 min", weight: -1 },
      { id: "30to60", label: "30–60 sec", weight: 0 },
      { id: "lt30", label: "Under 30 sec", weight: 2 },
    ],
  },
  {
    id: "pulse",
    prompt: "Quick pulse — how engaged was the class today?",
    helper: "Single tap. We use this as a 30-day rolling sentiment line.",
    options: [
      { id: "great", label: "Great — focused and persistent", weight: 2 },
      { id: "ok", label: "Engaged with some redirects", weight: 1 },
      { id: "tough", label: "Tough — many drop-offs", weight: -1 },
      { id: "exhausting", label: "Exhausting", weight: -2 },
    ],
  },
];

export function taskCheckInScore(answers: Record<string, string>): {
  score: number;
  max: number;
  pct: number;
} {
  let weighted = 0;
  let max = 0;
  for (const q of TASK_CHECKIN_QUESTIONS) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    const best = Math.max(...q.options.map((o) => o.weight));
    max += best;
    if (opt) weighted += opt.weight;
  }
  const range = max + 2 * TASK_CHECKIN_QUESTIONS.length;
  const offset = weighted + 2 * TASK_CHECKIN_QUESTIONS.length;
  const pct = Math.round((offset / Math.max(1, range)) * 100);
  return { score: weighted, max, pct };
}
