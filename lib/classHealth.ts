// Class Health scoring layer for the teacher dashboard.
// Computed directly from the real per-student data (data/realStudents.ts) —
// `studentHealthScore` is already the real composite the source data
// provides, so this file averages/counts over real fields instead of
// re-deriving a weighted score from gameplay signals that no longer exist.
// Behaviour & Discipline has no source values in the current 16-student
// batch, so it surfaces as `null` ("not enough data yet") rather than a
// fabricated number. There is also no real week-over-week history, so
// every previous/delta/trend concept from the old mock-driven model has
// been removed rather than kept with a fake value.

import { REAL_STUDENTS, type RealStudent } from "@/data/realStudents";
import { classTaskBreakdown, type TaskAreaKey } from "@/lib/classTask";
import { classReadinessSnapshot, type LearningAreaKey } from "@/lib/classLearning";

const STUDENTS = REAL_STUDENTS;
type Student = RealStudent;

export type PillarKey = "academic" | "focus" | "behavior" | "task";

const PILLAR_LABELS: Record<PillarKey, string> = {
  academic: "Learning readiness",
  focus: "Attention and focus",
  behavior: "Behavior and discipline",
  task: "Task engagement",
};

export function pillarLabel(p: PillarKey) {
  return PILLAR_LABELS[p];
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function pillarValue(s: Student, p: PillarKey): number | null {
  switch (p) {
    case "academic":
      return s.cognitivePerformance.learningReadiness.score;
    case "focus":
      return s.cognitivePerformance.attentionAndFocus;
    case "behavior":
      return s.cognitivePerformance.behaviourAndDiscipline;
    case "task":
      return s.cognitivePerformance.taskEngagement;
  }
}

/** How many real students actually have a value for this pillar — the same
 * "X students contributing" subtext pattern lib/classWellbeing.ts's driver
 * cards already show. */
export function pillarDataCount(p: PillarKey, students: Student[] = STUDENTS): number {
  return students.filter((s) => pillarValue(s, p) != null).length;
}

const PILLAR_STRUGGLE_THRESHOLD = 55;

/** Same convention as lib/classWellbeing.ts's MAIN_SIGNAL — a plain-language
 * read of what the real per-student numbers show, not a generic count. */
const PILLAR_MAIN_SIGNAL: Record<PillarKey, (count: number, hasData: boolean) => string> = {
  focus: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "shows" : "show"} reduced attention and focus during lessons.`
        : "Attention and focus look steady across the class.",
  academic: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "needs" : "need"} more support to be ready for new concepts.`
        : "Most students are ready for new concepts.",
  task: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "disengages" : "disengage"} from assigned tasks partway through.`
        : "Task engagement looks steady across the class.",
  behavior: (n, has) =>
    !has
      ? "Not enough data yet for this area."
      : n > 0
        ? `${n} student${n === 1 ? "" : "s"} ${n === 1 ? "needs" : "need"} reinforcement to meet behaviour expectations.`
        : "Behaviour expectations are being met consistently.",
};

/** Real — a plain-language signal sentence per pillar, built from how many
 * of the real students with a value for this pillar fall below the same
 * struggle threshold used elsewhere in the app, not a fabricated claim. */
export function pillarMainSignal(p: PillarKey, students: Student[] = STUDENTS): string {
  const scores = students.map((s) => pillarValue(s, p)).filter((v): v is number => v != null);
  const hasData = scores.length > 0;
  const strugglingCount = scores.filter((v) => v < PILLAR_STRUGGLE_THRESHOLD).length;
  return PILLAR_MAIN_SIGNAL[p](strugglingCount, hasData);
}

/* ─────────────────────────────────────────────────────────
 * Score Bands — canonical 4-tier classification used for the
 * Classroom Health score, every pillar's status pill, and per-student
 * status everywhere in the app.
 * ───────────────────────────────────────────────────────── */
export type ScoreBand = "excellent" | "stable" | "watch" | "needs-support";

export type ScoreBandDef = {
  band: ScoreBand;
  min: number;
  range: string;
  tag: string;
  meaning: string;
};

export const SCORE_BANDS: ScoreBandDef[] = [
  {
    band: "excellent",
    min: 80,
    range: "80–100",
    tag: "Excellent",
    meaning: "Class is functioning well with strong regulation and engagement.",
  },
  {
    band: "stable",
    min: 65,
    range: "65–79",
    tag: "Stable",
    meaning: "Most students are meeting expectations, with some areas to monitor.",
  },
  {
    band: "watch",
    min: 45,
    range: "45–64",
    tag: "Watch",
    meaning: "Multiple students need support in one or more areas.",
  },
  {
    band: "needs-support",
    min: 0,
    range: "0–44",
    tag: "Needs Support",
    meaning: "Class requires structured intervention and close monitoring.",
  },
];

export function scoreBand(score: number): ScoreBand {
  return SCORE_BANDS.find((b) => score >= b.min)?.band ?? "needs-support";
}

export type ClassHealthLabel = "Excellent" | "Good" | "Improving" | "Needs Support";

export function classHealthLabel(score: number): ClassHealthLabel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Improving";
  return "Needs Support";
}

/** Per-student status — the real `studentHealthScore`, banded the same way
 * as the class-wide score. Replaces the old weighted 4-pillar composite,
 * which depended on fields (`subjects`, `pfi`, `subDomains`, `gamesPlayed`)
 * that don't exist in the real dataset. */
export type StudentComposite = {
  student: Student;
  score: number;
  status: ScoreBand;
};

export function studentComposites(students: Student[] = STUDENTS): StudentComposite[] {
  return students.map((s) => ({
    student: s,
    score: s.studentHealthScore,
    status: scoreBand(s.studentHealthScore),
  }));
}

export type ClassHealth = {
  score: number;
  label: ClassHealthLabel;
  supportingLine: string;
  /** null = no real students have this pillar's field yet. */
  pillars: Record<PillarKey, number | null>;
  /** Real per-band student counts — the "Student distribution" bar. */
  distribution: Record<ScoreBand, number>;
  total: number;
};

export function classHealth(students: Student[] = STUDENTS): ClassHealth {
  const total = students.length;
  const score = avg(students.map((s) => s.studentHealthScore)) ?? 0;
  const label = classHealthLabel(score);

  const pillars: Record<PillarKey, number | null> = {
    academic: avg(students.map((s) => pillarValue(s, "academic")).filter((v): v is number => v != null)),
    focus: avg(students.map((s) => pillarValue(s, "focus")).filter((v): v is number => v != null)),
    behavior: avg(students.map((s) => pillarValue(s, "behavior")).filter((v): v is number => v != null)),
    task: avg(students.map((s) => pillarValue(s, "task")).filter((v): v is number => v != null)),
  };

  const distribution: Record<ScoreBand, number> = {
    excellent: 0,
    stable: 0,
    watch: 0,
    "needs-support": 0,
  };
  for (const s of students) distribution[scoreBand(s.studentHealthScore)] += 1;

  const dataPillars = (Object.entries(pillars) as [PillarKey, number | null][]).filter(
    (e): e is [PillarKey, number] => e[1] != null,
  );
  const supportingLine =
    dataPillars.length === 0
      ? "Not enough data yet to break this down by area."
      : (() => {
          const weakest = dataPillars.sort((a, b) => a[1] - b[1])[0];
          return score >= 70
            ? "Most of your class is steady across the areas we have data for."
            : `${PILLAR_LABELS[weakest[0]].toLowerCase()} is the area most worth a closer look right now.`;
        })();

  return { score, label, supportingLine, pillars, distribution, total };
}

/* ─────────────────────────────────────────────────────────
 * Top Support Areas — priority-ranked, real per-student counts only for
 * pillars the current data covers (academic, task).
 * ───────────────────────────────────────────────────────── */
export type SupportArea = {
  id: "task-completion" | "academic-progress";
  pillar: PillarKey;
  title: string;
  evidence: string;
  context: string;
  studentsAffected: number;
  rank: number;
};

export function topSupportAreas(students: Student[] = STUDENTS): SupportArea[] {
  const below = (p: PillarKey) =>
    students.filter((s) => {
      const v = pillarValue(s, p);
      return v != null && v < 60;
    }).length;

  const candidates: SupportArea[] = [
    {
      id: "task-completion",
      pillar: "task",
      title: "Task Engagement",
      evidence: `${below("task")} students have Task Engagement scores below 60`,
      context: "Based on the current student metric export",
      studentsAffected: below("task"),
      rank: 0,
    },
    {
      id: "academic-progress",
      pillar: "academic",
      title: "Learning Readiness",
      evidence: `${below("academic")} students have Learning Readiness scores below 60`,
      context: "Based on the current student metric export",
      studentsAffected: below("academic"),
      rank: 0,
    },
  ];

  return candidates
    .sort((a, b) => b.studentsAffected - a.studentsAffected)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends
 * ───────────────────────────────────────────────────────── */
export type RecommendationType = "Whole Class" | "Small Group" | "Routine Change" | "Quick Check";

export type Recommendation = {
  id: string;
  pillar: PillarKey;
  title: string;
  rationale: string;
  type: RecommendationType;
};

// One strategy per real sub-area, keyed to the same areas
// lib/classTask.ts's Task Engagement breakdown and lib/classLearning.ts's
// Learning Readiness breakdown already compute from real data — so the
// Strategy shown here tracks whichever specific sub-area is genuinely
// weakest this week/month, instead of a single fixed line for the pillar.
const TASK_AREA_RECS: Record<TaskAreaKey, { title: string; rationale: string }> = {
  initiation: {
    title: "Give a 60-second \"first step\" prompt before independent work",
    rationale: "Task Initiation is the class's weakest task-engagement area right now.",
  },
  persistence: {
    title: "Build in a short reset before the hardest part of a task",
    rationale: "Task Persistence is the class's weakest task-engagement area right now.",
  },
  completion: {
    title: "Use a visible checklist so students can confirm each step is done",
    rationale: "Task Completion is the class's weakest task-engagement area right now.",
  },
  consistency: {
    title: "Keep a consistent daily task routine and start cue",
    rationale: "Task Consistency is the class's weakest task-engagement area right now.",
  },
  planning: {
    title: "Model breaking one assignment into a mini timeline before starting",
    rationale: "Planning & Time Management is the class's weakest task-engagement area right now.",
  },
  "independent-execution": {
    title: "Fade prompts gradually once a task is underway",
    rationale: "Independent Execution is the class's weakest task-engagement area right now.",
  },
  "response-to-challenge": {
    title: "Normalize mistakes with a quick \"what would you try next\" prompt",
    rationale: "Response to Challenge is the class's weakest task-engagement area right now.",
  },
};

const LEARNING_AREA_RECS: Record<LearningAreaKey, { title: string; rationale: string }> = {
  problemSolving: {
    title: "Model one worked example before independent practice",
    rationale: "Problem Solving is the class's weakest learning-readiness area right now.",
  },
  reasoning: {
    title: "Use think-aloud questioning to connect new ideas to familiar ones",
    rationale: "Reasoning is the class's weakest learning-readiness area right now.",
  },
  creativeExpression: {
    title: "Offer more than one way to show understanding — draw, say, or write it",
    rationale: "Creative Expression is the class's weakest learning-readiness area right now.",
  },
  readingComprehension: {
    title: "Pre-teach key vocabulary before new reading material",
    rationale: "Reading & Comprehension is the class's weakest learning-readiness area right now.",
  },
  recallRetention: {
    title: "Run a 5-minute retrieval-practice warm-up on prior concepts",
    rationale: "Recall & Retention is the class's weakest learning-readiness area right now.",
  },
};

/** Task Completion's source values sit on a different scale (~0–4) than the
 * other six task areas (~40–90) in the current CSV export, so it's excluded
 * here to avoid a scaling artifact masquerading as "the real weakest area". */
function realWeakestTaskArea(): TaskAreaKey | null {
  const scored = classTaskBreakdown().filter(
    (a): a is typeof a & { score: number } => a.score != null && a.key !== "completion",
  );
  if (scored.length === 0) return null;
  return scored.reduce((worst, a) => (a.score < worst.score ? a : worst)).key;
}

function realWeakestLearningArea(students: Student[]): LearningAreaKey | null {
  return classReadinessSnapshot(students).supportAreas[0]?.key ?? null;
}

/** Pick recommendations driven by Top Support Areas, then tailor the
 * strategy to whichever real sub-area is genuinely weakest for that pillar
 * — only pillars the current data actually covers ever appear here. */
export function recommendations(students: Student[] = STUDENTS): Recommendation[] {
  const top = topSupportAreas(students);
  return top
    .map((area): Recommendation | undefined => {
      if (area.pillar === "task") {
        const key = realWeakestTaskArea() ?? "initiation";
        const strategy = TASK_AREA_RECS[key];
        return { id: `task-${key}`, pillar: "task", type: "Whole Class", ...strategy };
      }
      if (area.pillar === "academic") {
        const key = realWeakestLearningArea(students) ?? "recallRetention";
        const strategy = LEARNING_AREA_RECS[key];
        return { id: `academic-${key}`, pillar: "academic", type: "Whole Class", ...strategy };
      }
      return undefined;
    })
    .filter((r): r is Recommendation => Boolean(r));
}
