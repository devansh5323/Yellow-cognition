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
// never silently presented as real.

import { STUDENTS, type Student } from "@/data/mockData";
import {
  L2_CLASSROOM_DATA,
  type TaskEngagementTrendPoint,
} from "@/data/l2ClassroomData";
import { QUICK_ACTIVITIES, type QuickActivity } from "@/lib/classFocus";

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

export const TASK_STATUS_RANGE: Record<TaskStatus, string> = {
  strong: "Score 85+",
  stable: "Score 70–84",
  reinforcement: "Score 55–69",
  support: "Score below 55",
};

export function statusFromScore(score: number): TaskStatus {
  if (score >= 85) return "strong";
  if (score >= 70) return "stable";
  if (score >= 55) return "reinforcement";
  return "support";
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
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
    out[key] = typeof v === "number" ? round1(v) : null;
  }
  return out;
}

function taskAreaWeeklyChange(key: TaskAreaKey): number | null {
  if (TASK_WEEKLY_DATA.length < 2) return null;
  const populated = TASK_WEEKLY_DATA.filter((row) => typeof row[TASK_AREA_FIELD[key]] === "number");
  const last = populated[populated.length - 1]?.[TASK_AREA_FIELD[key]];
  const prev = populated[populated.length - 2]?.[TASK_AREA_FIELD[key]];
  if (typeof last !== "number" || typeof prev !== "number") return null;
  return round1(last - prev);
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

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthLabel(iso: string): string {
  const m = Number(iso.split("-")[1]);
  return MONTH_SHORT[m - 1] ?? iso;
}

export type TaskTrendPoint = { label: string; score: number | null };

/** Real weekly/monthly overall task engagement score, from the same
 * L2_CLASSROOM_DATA series classTaskBreakdown() reads its area scores from. */
export function taskTrendOverTime(period: "Weekly" | "Monthly" = "Weekly"): TaskTrendPoint[] {
  const rows = period === "Monthly" ? TASK_MONTHLY_DATA : TASK_WEEKLY_DATA;
  return rows.map((row, i) => ({
    label: period === "Monthly" ? monthLabel(row.startDate) : `W${i + 1}`,
    score: row.taskEngagementScore != null ? round1(row.taskEngagementScore) : null,
  }));
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

/** Students whose (demo) major area matches the given task-engagement
 * area, worst real overall score first — same demoTaskSupportDetail()
 * methodology TaskSupportTable already uses, just filtered to one area. */
export function studentsByTaskArea(key: TaskAreaKey, students: Student[] = STUDENTS): Student[] {
  return students
    .map((s) => ({ s, score: s.cognitivePerformance.taskEngagement }))
    .filter((x): x is { s: Student; score: number } => x.score != null && demoTaskSupportDetail(x.s.id).majorArea === key)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.s);
}

// Reuses classFocus.ts's real QUICK_ACTIVITIES library (the same one the
// Attention & Focus and Learning Readiness "Yellow Insights" panels
// suggest from) via a task-area-specific mapping, so this panel can show a
// "Suggested Activity" without inventing new, area-specific content.
const TASK_AREA_SUGGESTED_ACTIVITY: Record<TaskAreaKey, string> = {
  initiation: "stretch-reset",
  persistence: "memory-chain",
  completion: "clap-at-7",
  consistency: "one-word-checkin",
  planning: "would-you-rather",
  "independent-execution": "simon-says-focus",
  "response-to-challenge": "stretch-reset",
};

export function suggestedActivityForTaskArea(key: TaskAreaKey): QuickActivity {
  const id = TASK_AREA_SUGGESTED_ACTIVITY[key];
  return QUICK_ACTIVITIES.find((a) => a.id === id) ?? QUICK_ACTIVITIES[0];
}
