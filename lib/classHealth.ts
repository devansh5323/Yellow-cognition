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

import { STUDENTS, type Student } from "@/data/mockData";

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
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
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

const RECS_BY_PILLAR: Partial<Record<PillarKey, Recommendation[]>> = {
  task: [
    {
      id: "task-1",
      pillar: "task",
      title: "Break tasks into smaller visible steps",
      rationale: "Helps students complete work more consistently.",
      type: "Whole Class",
    },
  ],
  academic: [
    {
      id: "academic-1",
      pillar: "academic",
      title: "Run a 5-minute learning-readiness warm-up",
      rationale: "Supports students whose current readiness scores are lower.",
      type: "Whole Class",
    },
  ],
};

/** Pick recommendations driven by Top Support Areas — only pillars the
 * current data actually covers ever appear here. */
export function recommendations(students: Student[] = STUDENTS): Recommendation[] {
  const top = topSupportAreas(students);
  return top
    .map((area) => RECS_BY_PILLAR[area.pillar]?.[0])
    .filter((r): r is Recommendation => Boolean(r));
}
