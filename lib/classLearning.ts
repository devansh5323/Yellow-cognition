// Class Learning Readiness — data + helpers for the Learning Readiness
// experience. Computed directly from real per-student learning-readiness
// fields (data/realStudents.ts) — the real dataset only covers 5 of the 6
// areas below (never any real "Curiosity & Exploration" signal), and even
// those 5 are sparse per student, so every average here skips missing
// values rather than treating them as zero, and an area with zero real
// values across the roster surfaces as `null` ("not enough data yet").

import { STUDENTS, type Student } from "@/data/mockData";
import { L2_CLASSROOM_DATA } from "@/data/l2ClassroomData";
import { QUICK_ACTIVITIES, type QuickActivity } from "@/lib/classFocus";

const READINESS_WEEKLY_DATA = L2_CLASSROOM_DATA.learningReadiness.weekly;
const READINESS_MONTHLY_DATA = L2_CLASSROOM_DATA.learningReadiness.monthly;

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthLabel(iso: string): string {
  const m = Number(iso.split("-")[1]);
  return MONTH_SHORT[m - 1] ?? iso;
}

export type ReadinessTrendPoint = { label: string; score: number | null };

/** Real weekly/monthly overall learning-readiness score, from the same
 * L2_CLASSROOM_DATA series the Focus/Task/Behaviour snapshot cards use. */
export function readinessTrendOverTime(period: "Weekly" | "Monthly" = "Weekly"): ReadinessTrendPoint[] {
  const rows = period === "Monthly" ? READINESS_MONTHLY_DATA : READINESS_WEEKLY_DATA;
  return rows.map((row, i) => ({
    label: period === "Monthly" ? monthLabel(row.startDate) : `W${i + 1}`,
    score: row.learningReadiness != null ? round1(row.learningReadiness) : null,
  }));
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

export const READINESS_STATUS_RANGE: Record<ReadinessStatus, string> = {
  strong: "Score 80+",
  stable: "Score 65–79",
  watch: "Score 50–64",
  support: "Score below 50",
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
 * Per-student readiness rows — real score + real weakest area per student,
 * for a per-student review table. No demo data: students with no real
 * score/area signal surface as `null` rather than a fabricated value.
 * ───────────────────────────────────────────────────────── */

export type StudentReadinessRow = {
  student: Student;
  score: number | null;
  status: ReadinessStatus | null;
  weakestArea: { key: LearningAreaKey; label: string; score: number } | null;
};

export function studentReadinessRows(students: Student[] = STUDENTS): StudentReadinessRow[] {
  return students.map((s) => {
    const score = s.cognitivePerformance.learningReadiness.score;
    const status = score != null ? readinessStatusFromScore(score) : null;

    const lr = s.cognitivePerformance.learningReadiness;
    const candidates: { key: LearningAreaKey; v: number | null }[] = [
      { key: "problemSolving", v: lr.problemSolving },
      { key: "reasoning", v: lr.reasoning },
      { key: "creativeExpression", v: lr.creativeExpression },
      { key: "readingComprehension", v: lr.readingComprehension },
      { key: "recallRetention", v: lr.recallRetention },
    ];
    const scored = candidates.filter((c): c is { key: LearningAreaKey; v: number } => c.v != null);
    const weakest = scored.length > 0 ? scored.reduce((a, b) => (b.v < a.v ? b : a)) : null;

    return {
      student: s,
      score,
      status,
      weakestArea: weakest ? { key: weakest.key, label: LEARNING_AREA_LABEL[weakest.key], score: weakest.v } : null,
    };
  });
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

export type LearningAreaSkill = { name: string; score: number };

// Fixed per-area offsets (always summing to 0) for splitting an area's real
// score across its 3 skills — there's no real per-skill signal yet, so each
// skill's score is the area's real average nudged by a fixed offset, which
// means their average is always exactly the area's real score. A
// visualization aid for "which skills feed this signal," not an independent
// measurement.
const SKILL_SCORE_OFFSETS: Record<LearningAreaKey, [number, number, number]> = {
  problemSolving: [3, -4, 1],
  reasoning: [2, -5, 3],
  creativeExpression: [4, -3, -1],
  readingComprehension: [3, -5, 2],
  recallRetention: [4, -2, -2],
  curiosityExploration: [2, 3, -5],
};

export function learningAreaSkillBreakdown(area: LearningAreaStat): LearningAreaSkill[] | null {
  if (area.score == null) return null;
  const score = area.score;
  const offsets = SKILL_SCORE_OFFSETS[area.key];
  return LEARNING_AREA_SKILLS[area.key].map((name, i) => ({
    name,
    score: Math.max(0, Math.min(100, score + offsets[i])),
  }));
}

// Reuses classFocus.ts's real QUICK_ACTIVITIES library (the same one the
// Attention & Focus "Yellow Insights" panel suggests from) via a learning-
// area-specific mapping, so the readiness panel can show a "Suggested
// Activity" without inventing new, area-specific content.
const LEARNING_AREA_SUGGESTED_ACTIVITY: Record<LearningAreaKey, string> = {
  problemSolving: "clap-at-7",
  reasoning: "would-you-rather",
  creativeExpression: "one-word-checkin",
  readingComprehension: "simon-says-focus",
  recallRetention: "memory-chain",
  curiosityExploration: "stretch-reset",
};

export function suggestedActivityForLearningArea(key: LearningAreaKey): QuickActivity {
  const id = LEARNING_AREA_SUGGESTED_ACTIVITY[key];
  return QUICK_ACTIVITIES.find((a) => a.id === id) ?? QUICK_ACTIVITIES[0];
}
