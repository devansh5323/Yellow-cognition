// Class Task Engagement — data + helpers for the Task Engagement experience.
// The real per-student dataset (data/realStudents.ts) covers a single
// top-line `taskEngagement` score per student — no category breakdown
// (initiation/persistence/planning/etc.), no trend history, and no
// per-category skill diagnosis exists in real data, so those have been
// removed rather than kept with fabricated numbers. Only what the real
// data actually supports survives here: a real class average, and a real
// per-student ranking for the support table.

import { STUDENTS, type Student } from "@/data/mockData";

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
