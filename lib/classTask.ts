// Class Task Engagement — data + helpers for the Task Engagement experience.
//
// data/realStudents.ts covers a single top-line `taskEngagement` score per
// student (real, used for the snapshot and the support ranking below). For
// the category breakdown, data/l2ClassroomData.ts's weekly/monthly export
// has real CLASS-LEVEL scores for exactly
// the 7 task-engagement areas below (taskInitiation, persistence,
// completion, consistency, planningAndTimeManagement, independentExecution,
// responseToChallenge) — same pattern lib/classBehavior.ts uses. What's
// still missing: a per-student breakdown BY area (only one overall
// taskEngagement number per student exists) — so "major area needing
// support" per student in the support table stays a seeded DEMO estimate,
// clearly tagged (see components/dashboard/DemoDataBadge.tsx), never
// silently presented as real.

import { STUDENTS, type Student } from "@/data/mockData";
import {
  L2_CLASSROOM_DATA,
  type TaskEngagementTrendPoint,
} from "@/data/l2ClassroomData";

const TASK_WEEKLY_DATA = L2_CLASSROOM_DATA.taskEngagement.weekly;
const TASK_MONTHLY_DATA = L2_CLASSROOM_DATA.taskEngagement.monthly;

function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function idSeed(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

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

export function statusFromScore(score: number): TaskStatus {
  if (score >= 85) return "strong";
  if (score >= 70) return "stable";
  if (score >= 55) return "reinforcement";
  return "support";
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export type TaskSnapshotData = {
  engagementScore: number | null;
  status: TaskStatus | null;
  total: number;
  statusDistribution: Record<TaskStatus, number>;
};

export function classTaskSnapshot(students: Student[] = STUDENTS): TaskSnapshotData {
  const scores = students
    .map((s) => s.cognitivePerformance.taskEngagement)
    .filter((v): v is number => v != null);
  const engagementScore = avg(scores);

  const statusDistribution: Record<TaskStatus, number> = {
    strong: 0,
    stable: 0,
    reinforcement: 0,
    support: 0,
  };
  for (const s of scores) statusDistribution[statusFromScore(s)] += 1;

  return {
    engagementScore,
    status: engagementScore != null ? statusFromScore(engagementScore) : null,
    total: students.length,
    statusDistribution,
  };
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — generic task strategies, not derived from any
 * per-student signal (safe to show regardless of data coverage).
 * ───────────────────────────────────────────────────────── */

export type TaskStrategyKind = "Whole Class" | "Small Group" | "Individual" | "Routine";

export type TaskStrategy = {
  id: string;
  title: string;
  rationale: string;
  kind: TaskStrategyKind;
};

export const TASK_STRATEGIES: TaskStrategy[] = [
  {
    id: "start-window",
    title: "Set clear time limits for each step",
    rationale: "Breaks the task into visible time boxes so momentum doesn't stall mid-way.",
    kind: "Routine",
  },
  {
    id: "checkpoints",
    title: "Add check-points within tasks",
    rationale: "Breaks large work into chunks students actually finish.",
    kind: "Whole Class",
  },
  {
    id: "first-then",
    title: "Use 'first / then' cards for multi-step work",
    rationale: "Visually scaffolds independent execution for the bottom third.",
    kind: "Small Group",
  },
  {
    id: "done-tray",
    title: "Set up a 'done' tray with an extension card",
    rationale: "Closes the loop for early finishers without disrupting the rest.",
    kind: "Routine",
  },
];

/* ─────────────────────────────────────────────────────────
 * Students needing task support — ranked directly by the real
 * taskEngagement score, lowest first.
 * ───────────────────────────────────────────────────────── */

export type TaskSupport = {
  student: Student;
  score: number;
  status: TaskStatus;
};

export function studentsNeedingTaskSupport(
  students: Student[] = STUDENTS,
  limit = 5,
): TaskSupport[] {
  return students
    .map((s) => ({ student: s, score: s.cognitivePerformance.taskEngagement }))
    .filter((x): x is { student: Student; score: number } => x.score != null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => ({ ...x, status: statusFromScore(x.score) }));
}

/* ─────────────────────────────────────────────────────────
 * Monthly Task check-in (MCQ) — a teacher self-report, independent of the
 * student roster's fields entirely (unaffected by the real-data switch).
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
    id: "completion-share",
    prompt: "How many students complete tasks fully?",
    options: [
      { id: "most", label: "Most students", weight: 2 },
      { id: "half", label: "About half", weight: 0 },
      { id: "few", label: "Few students", weight: -1 },
      { id: "almost-none", label: "Almost None", weight: -2 },
    ],
  },
  {
    id: "completion-frequency",
    prompt: "How often do students complete tasks fully?",
    options: [
      { id: "almost-always", label: "Almost always", weight: 2 },
      { id: "most-of-time", label: "Most of the time", weight: 1 },
      { id: "sometimes", label: "Sometimes", weight: 0 },
      { id: "occasionally", label: "Occasionally", weight: -1 },
      { id: "never", label: "Never", weight: -2 },
    ],
  },
  {
    id: "independence",
    prompt: "How independently do students work?",
    options: [
      { id: "mostly-independent", label: "Mostly independent", weight: 2 },
      { id: "peer-support", label: "Some support from peers", weight: 0 },
      { id: "teacher-guidance", label: "Constant guidance from teachers", weight: -2 },
    ],
  },
  {
    id: "engagement-consistency",
    prompt: "How consistent is engagement across the class?",
    options: [
      { id: "consistent", label: "Consistent", weight: 2 },
      { id: "fluctuates", label: "Fluctuates", weight: 0 },
      { id: "highly-inconsistent", label: "Highly inconsistent", weight: -2 },
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

/* ─────────────────────────────────────────────────────────
 * Task Engagement Breakdown — real, class-level. 7 areas, each mapped to
 * its matching field in the L2 weekly/monthly series.
 * ───────────────────────────────────────────────────────── */

export type TaskAreaKey =
  | "initiation"
  | "persistence"
  | "completion"
  | "consistency"
  | "planning"
  | "independent-execution"
  | "response-to-challenge";

export const TASK_AREA_ORDER: TaskAreaKey[] = [
  "initiation",
  "persistence",
  "completion",
  "consistency",
  "planning",
  "independent-execution",
  "response-to-challenge",
];

export const TASK_AREA_LABEL: Record<TaskAreaKey, string> = {
  initiation: "Task Initiation",
  persistence: "Task Persistence",
  completion: "Task Completion",
  consistency: "Task Consistency",
  planning: "Planning & Time Management",
  "independent-execution": "Independent Execution",
  "response-to-challenge": "Response to Challenge",
};

export const TASK_AREA_DESCRIPTION: Record<TaskAreaKey, string> = {
  initiation: "Starting tasks independently and without delay.",
  persistence: "Staying engaged and continuing even when tasks get difficult.",
  completion: "Finishing tasks accurately and submitting on time.",
  consistency: "Maintaining steady engagement across tasks and days.",
  planning: "Planning steps, managing time, and meeting deadlines.",
  "independent-execution": "Working independently with minimal guidance.",
  "response-to-challenge": "Adapting to difficulty and handling challenging tasks.",
};

export const TASK_AREA_SKILLS: Record<TaskAreaKey, string[]> = {
  initiation: ["Processing Speed", "Procedural Knowledge", "Self-Regulation"],
  persistence: ["Sustained Attention", "Frustration Tolerance", "Working Memory"],
  completion: ["Working Memory", "Planning", "Monitoring"],
  consistency: ["Behavioral Control", "Monitoring"],
  planning: ["Planning", "Time Sharing", "Working Memory"],
  "independent-execution": ["Procedural Knowledge", "Self-Regulation", "Mental Flexibility"],
  "response-to-challenge": ["Adaptive Thinking", "Frustration Tolerance", "Complex Problem Solving"],
};

const TASK_AREA_FIELD: Record<TaskAreaKey, keyof TaskEngagementTrendPoint> = {
  initiation: "taskInitiation",
  persistence: "persistence",
  completion: "completion",
  consistency: "consistency",
  planning: "planningAndTimeManagement",
  "independent-execution": "independentExecution",
  "response-to-challenge": "responseToChallenge",
};

export type TaskAreaStat = {
  key: TaskAreaKey;
  label: string;
  description: string;
  hasData: boolean;
  score: number | null;
  status: TaskStatus | null;
  weeklyChange: number | null;
};

function latestTaskAreaScores(): Record<TaskAreaKey, number | null> {
  const latest = TASK_WEEKLY_DATA[TASK_WEEKLY_DATA.length - 1];
  const out = {} as Record<TaskAreaKey, number | null>;
  for (const key of TASK_AREA_ORDER) {
    const v = latest?.[TASK_AREA_FIELD[key]];
    out[key] = typeof v === "number" ? Math.round(v) : null;
  }
  return out;
}

function taskAreaWeeklyChange(key: TaskAreaKey): number | null {
  if (TASK_WEEKLY_DATA.length < 2) return null;
  const populated = TASK_WEEKLY_DATA.filter((row) => typeof row[TASK_AREA_FIELD[key]] === "number");
  const last = populated[populated.length - 1]?.[TASK_AREA_FIELD[key]];
  const prev = populated[populated.length - 2]?.[TASK_AREA_FIELD[key]];
  if (typeof last !== "number" || typeof prev !== "number") return null;
  return Math.round(last - prev);
}

export function classTaskBreakdown(): TaskAreaStat[] {
  const scores = latestTaskAreaScores();
  return TASK_AREA_ORDER.map((key) => {
    const score = scores[key];
    const hasData = score != null;
    return {
      key,
      label: TASK_AREA_LABEL[key],
      description: TASK_AREA_DESCRIPTION[key],
      hasData,
      score,
      status: hasData ? statusFromScore(score!) : null,
      weeklyChange: hasData ? taskAreaWeeklyChange(key) : null,
    };
  });
}

export type TaskAreaExtreme = { key: TaskAreaKey; label: string } | null;

export function taskBreakdownExtremes(breakdown: TaskAreaStat[]): { strongest: TaskAreaExtreme; weakest: TaskAreaExtreme } {
  const withData = breakdown.filter((d): d is TaskAreaStat & { score: number } => d.score != null);
  if (withData.length === 0) return { strongest: null, weakest: null };
  const sorted = [...withData].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  return {
    strongest: { key: best.key, label: best.label },
    weakest: { key: worst.key, label: worst.label },
  };
}

/* ─────────────────────────────────────────────────────────
 * Task Engagement Insights — real, generated from the real breakdown above
 * (which areas are below a healthy bar / declining week over week), not
 * fabricated sentences.
 * ───────────────────────────────────────────────────────── */

export function taskEngagementInsights(breakdown: TaskAreaStat[]): string[] {
  const insights: string[] = [];
  const weak = breakdown.filter((d) => d.hasData && d.score! < 60);
  const declining = breakdown.filter((d) => d.hasData && (d.weeklyChange ?? 0) < 0);

  if (weak.some((d) => d.key === "initiation")) {
    insights.push("Instructions may be unclear for independent work.");
  }
  if (weak.some((d) => d.key === "planning" || d.key === "independent-execution")) {
    insights.push("Tasks may lack structure or step-by-step guidance.");
  }
  if (weak.some((d) => d.key === "response-to-challenge" || d.key === "persistence")) {
    insights.push("Difficulty level may be too high or inconsistent.");
  }
  if (weak.length > 0) {
    insights.push("Students may need more scaffolding to start and stay on task.");
  }
  if (declining.length > 0) {
    const names = declining.map((d) => d.label).join(", ");
    insights.push(`${names} declined from last week — worth a closer look.`);
  }
  if (insights.length === 0) {
    insights.push("No specific problem areas stand out this period — engagement is holding steady.");
  }
  return insights.slice(0, 5);
}

/* ─────────────────────────────────────────────────────────
 * Task Trend Tracking — real weekly/monthly series for Task Completion,
 * Initiation Score, and Persistence Score.
 * ───────────────────────────────────────────────────────── */

export type TaskTrendSeriesKey = "completion" | "initiation" | "persistence";

export const TASK_TREND_LABEL: Record<TaskTrendSeriesKey, string> = {
  completion: "Task Completion (%)",
  initiation: "Initiation Score",
  persistence: "Persistence Score",
};

export const TASK_TREND_TONE: Record<TaskTrendSeriesKey, string> = {
  completion: "hsl(142 55% 45%)",
  initiation: "hsl(212 90% 58%)",
  persistence: "hsl(262 60% 60%)",
};

export type TaskTrendPoint = { label: string } & Record<TaskTrendSeriesKey, number | null>;

export function taskTrendOverTime(period: "Weekly" | "Monthly" = "Weekly"): TaskTrendPoint[] {
  const rows = period === "Monthly" ? TASK_MONTHLY_DATA : TASK_WEEKLY_DATA;
  return rows.map((row, i) => ({
    label: period === "Monthly" ? monthLabel(row.startDate) : `W${i + 1}`,
    completion: row.completion != null ? Math.round(row.completion) : null,
    initiation: row.taskInitiation != null ? Math.round(row.taskInitiation) : null,
    persistence: row.persistence != null ? Math.round(row.persistence) : null,
  }));
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthLabel(iso: string): string {
  const m = Number(iso.split("-")[1]);
  return MONTH_SHORT[m - 1] ?? iso;
}

export type TaskTrendChangeSummary = { key: TaskTrendSeriesKey; label: string; deltaPct: number; improving: boolean };

/** Real % change between the first and last point with data for each
 * series — feeds the 3 "is it improving" callouts below the trend chart. */
export function taskTrendChangeSummary(points: TaskTrendPoint[]): TaskTrendChangeSummary[] {
  const keys: TaskTrendSeriesKey[] = ["completion", "initiation", "persistence"];
  return keys
    .map((key) => {
      const withData = points.filter((p) => p[key] != null);
      const first = withData[0]?.[key];
      const last = withData[withData.length - 1]?.[key];
      if (typeof first !== "number" || typeof last !== "number" || first === 0) return null;
      const deltaPct = Math.round(((last - first) / first) * 100);
      return { key, label: TASK_TREND_LABEL[key], deltaPct, improving: deltaPct >= 0 };
    })
    .filter((s): s is TaskTrendChangeSummary => s !== null);
}

/* ─────────────────────────────────────────────────────────
 * Students Needing Task Support — "major area" per student is DEMO (no
 * real per-student-by-area breakdown exists), seeded off each student's
 * real overall score for a stable, if not real, ranking.
 * ───────────────────────────────────────────────────────── */

export type TaskSupportDetail = {
  majorArea: TaskAreaKey;
  majorAreaLabel: string;
  whatThisLooksLike: string;
  suggestedFocus: string[];
};

const AREA_LOOKS_LIKE: Record<TaskAreaKey, string> = {
  initiation: "Takes longer to start tasks; needs reminders.",
  persistence: "Stops when tasks get challenging.",
  completion: "Leaves tasks incomplete; misses final steps.",
  consistency: "Engagement varies across days and subjects.",
  planning: "Struggles to plan steps and manage time.",
  "independent-execution": "Needs frequent check-ins to keep working.",
  "response-to-challenge": "Avoids or gives up on harder problems quickly.",
};

/** Demo — deterministic per-student "which area is weakest," seeded off
 * the student's id so it's stable across reloads. */
export function demoTaskSupportDetail(studentId: string): TaskSupportDetail {
  const areas = TASK_AREA_ORDER;
  const majorArea = areas[Math.floor(rand(idSeed(studentId) * 11) * areas.length)];
  return {
    majorArea,
    majorAreaLabel: TASK_AREA_LABEL[majorArea],
    whatThisLooksLike: AREA_LOOKS_LIKE[majorArea],
    suggestedFocus: TASK_AREA_SKILLS[majorArea],
  };
}
