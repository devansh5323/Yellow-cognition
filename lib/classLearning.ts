// Class Learning Readiness — data + helpers for the Learning Readiness
// experience. Computed directly from real per-student learning-readiness
// fields (data/realStudents.ts) — the real dataset only covers 5 of the 6
// areas below (never any real "Curiosity & Exploration" signal), and even
// those 5 are sparse per student, so every average here skips missing
// values rather than treating them as zero, and an area with zero real
// values across the roster surfaces as `null` ("not enough data yet").

import { STUDENTS, type Student } from "@/data/mockData";

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/* ─────────────────────────────────────────────────────────
 * 6 Learning Readiness areas
 * ───────────────────────────────────────────────────────── */

export type LearningAreaKey =
  | "problemSolving"
  | "reasoning"
  | "creativeExpression"
  | "readingComprehension"
  | "recallRetention"
  | "curiosityExploration";

export const LEARNING_AREA_LABEL: Record<LearningAreaKey, string> = {
  problemSolving: "Problem Solving",
  reasoning: "Reasoning",
  creativeExpression: "Creative Expression",
  readingComprehension: "Reading & Comprehension",
  recallRetention: "Recall & Retention",
  curiosityExploration: "Curiosity & Exploration",
};

export const LEARNING_AREA_DESCRIPTION: Record<LearningAreaKey, string> = {
  problemSolving: "How students break down tasks and use strategies to solve problems.",
  reasoning: "How students understand ideas, connect concepts, and choose the right approach.",
  creativeExpression: "How clearly students explain, create, or show what they've understood.",
  readingComprehension: "How students understand written questions, instructions, and task expectations.",
  recallRetention: "How well students remember previously taught concepts, information, or rules.",
  curiosityExploration: "How willing students are to try new approaches and engage with unfamiliar tasks.",
};

const AREA_ORDER: LearningAreaKey[] = [
  "problemSolving",
  "reasoning",
  "creativeExpression",
  "readingComprehension",
  "recallRetention",
  "curiosityExploration",
];

export const LEARNING_AREA_HUE: Record<LearningAreaKey, string> = {
  problemSolving: "hsl(142 55% 46%)",
  reasoning: "hsl(212 55% 50%)",
  creativeExpression: "hsl(262 60% 60%)",
  readingComprehension: "hsl(0 78% 58%)",
  recallRetention: "hsl(28 88% 54%)",
  curiosityExploration: "hsl(168 62% 42%)",
};

function studentLearningAreaScore(s: Student, key: LearningAreaKey): number | null {
  const lr = s.cognitivePerformance.learningReadiness;
  switch (key) {
    case "problemSolving":
      return lr.problemSolving;
    case "reasoning":
      return lr.reasoning;
    case "creativeExpression":
      return lr.creativeExpression;
    case "readingComprehension":
      return lr.readingComprehension;
    case "recallRetention":
      return lr.recallRetention;
    case "curiosityExploration":
      return null; // no real field exists for this area at all yet
  }
}

export type LearningAreaStat = {
  key: LearningAreaKey;
  label: string;
  description: string;
  hue: string;
  score: number | null;
  studentCount: number;
};

export type ReadinessStatus = "strong" | "stable" | "watch" | "support";

export const READINESS_STATUS_LABEL: Record<ReadinessStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  watch: "Watch",
  support: "Needs Support",
};

export const READINESS_STATUS_TONE: Record<ReadinessStatus, string> = {
  strong: "hsl(142 55% 42%)",
  stable: "hsl(212 55% 45%)",
  watch: "hsl(38 92% 50%)",
  support: "hsl(0 78% 56%)",
};

export function readinessStatusFromScore(score: number): ReadinessStatus {
  if (score >= 80) return "strong";
  if (score >= 65) return "stable";
  if (score >= 50) return "watch";
  return "support";
}

const STRUGGLE_THRESHOLD = 55;

export function classLearningAreas(students: Student[] = STUDENTS): LearningAreaStat[] {
  return AREA_ORDER.map((key) => {
    const scores = students
      .map((s) => studentLearningAreaScore(s, key))
      .filter((v): v is number => v != null);
    const score = avg(scores);
    const studentCount = scores.filter((v) => v < STRUGGLE_THRESHOLD).length;
    return {
      key,
      label: LEARNING_AREA_LABEL[key],
      description: LEARNING_AREA_DESCRIPTION[key],
      hue: LEARNING_AREA_HUE[key],
      score,
      studentCount,
    };
  });
}

export function studentsByLearningArea(
  key: LearningAreaKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students
    .map((s) => ({ s, v: studentLearningAreaScore(s, key) }))
    .filter((x): x is { s: Student; v: number } => x.v != null && x.v < STRUGGLE_THRESHOLD)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}

/* ─────────────────────────────────────────────────────────
 * Overall snapshot
 * ───────────────────────────────────────────────────────── */

export type ReadinessSnapshot = {
  score: number | null;
  /** Direct average of the source Learning Readiness Score column. */
  rawScore: number | null;
  /** Kept for presentation compatibility; no unsupported penalty is applied. */
  supportRiskPenalty: number;
  status: ReadinessStatus | null;
  total: number;
  /** Count of students at each status band, for the distribution bar —
   * only counts students who have at least one real learning-area score. */
  statusDistribution: Record<ReadinessStatus, number>;
  areas: LearningAreaStat[];
  strongestAreas: LearningAreaStat[];
  supportAreas: LearningAreaStat[];
};

export function classReadinessSnapshot(students: Student[] = STUDENTS): ReadinessSnapshot {
  const areas = classLearningAreas(students);
  const score = avg(
    students
      .map((student) => student.cognitivePerformance.learningReadiness.score)
      .filter((value): value is number => value != null),
  );
  const total = students.length;

  const statusDistribution: Record<ReadinessStatus, number> = {
    strong: 0,
    stable: 0,
    watch: 0,
    support: 0,
  };
  for (const s of students) {
    const perStudentScore = s.cognitivePerformance.learningReadiness.score;
    if (perStudentScore != null) statusDistribution[readinessStatusFromScore(perStudentScore)] += 1;
  }

  const withScore = areas.filter((a): a is LearningAreaStat & { score: number } => a.score != null);
  const ranked = [...withScore].sort((a, b) => b.score - a.score);

  return {
    score,
    rawScore: score,
    supportRiskPenalty: 0,
    status: score != null ? readinessStatusFromScore(score) : null,
    total,
    statusDistribution,
    areas,
    strongestAreas: ranked.slice(0, 2),
    supportAreas: ranked.slice(-2).reverse(),
  };
}

/* ─────────────────────────────────────────────────────────
 * Learning areas → skills — static reference table, independent of any
 * per-student field (kept as-is; unaffected by the real-data switch).
 * ───────────────────────────────────────────────────────── */

const LEARNING_AREA_SKILLS: Record<LearningAreaKey, string[]> = {
  problemSolving: ["Critical Thinking", "Decision Making", "Planning"],
  reasoning: ["Analytical Reasoning", "Abstract Thinking", "Inductive Reasoning"],
  creativeExpression: ["Oral Expression", "Written Expression", "Creative Thinking"],
  readingComprehension: ["Processing Speed", "Oral Comprehension", "Auditory Shifting"],
  recallRetention: ["Working Memory", "Information Processing", "Active Listening"],
  curiosityExploration: ["Adaptive Thinking", "Mental Flexibility", "Active Learning"],
};

export function learningAreaToSkills(): { key: LearningAreaKey; label: string; skills: string[] }[] {
  return AREA_ORDER.map((key) => ({
    key,
    label: LEARNING_AREA_LABEL[key],
    skills: LEARNING_AREA_SKILLS[key],
  }));
}
