// Class Learning Readiness — data + helpers for the Learning Readiness experience.
// Derives the class-level picture entirely from existing gameplay-adjacent student
// mocks (KSAs, indicators, sub-domains, attention domains, history) — deliberately
// NOT from `subjects[]` (report-card-style marks), since this page is framed as
// "generated from gameplay signals, not academic achievement."

import {
  STUDENTS,
  studentAttentionDomains,
  type AttentionDomainKey,
  type Student,
} from "@/data/mockData";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function ksaScore(s: Student, name: string): number {
  return s.ksa.find((k) => k.name === name)?.score ?? 60;
}

function indicatorScore(s: Student, name: string): number {
  return s.indicators.find((i) => i.name === name)?.score ?? 60;
}

function subDomainScore(s: Student, name: string): number {
  return s.subDomains.find((d) => d.name === name)?.score ?? 60;
}

// `ksa`/`indicators`/`subDomains` are each seeded as `pfi ± small offset +
// noise` with no systematic per-name variation, so any blend of them
// regresses to roughly the same class average regardless of which named
// entries are picked. `studentAttentionDomains()` is the one field with a
// real fixed per-domain offset baked in — anchoring each area's primary
// score there is what gives the 6 areas genuine, honest spread at the
// class level rather than all clustering within a couple of points.
function domainScore(s: Student, key: AttentionDomainKey): number {
  return studentAttentionDomains(s)[key];
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

// Overall readiness weights each area by how much it tends to block
// classroom learning day to day — reading and recall gate independent
// work, problem solving gates application, reasoning gates conceptual
// clarity; curiosity and creative expression matter but don't block in the
// same way, so they carry less weight.
export const LEARNING_AREA_WEIGHT: Record<LearningAreaKey, number> = {
  readingComprehension: 0.2,
  recallRetention: 0.2,
  problemSolving: 0.2,
  reasoning: 0.15,
  curiosityExploration: 0.15,
  creativeExpression: 0.1,
};

function weightedAreaAverage(scoreFor: (key: LearningAreaKey) => number): number {
  return clamp(AREA_ORDER.reduce((sum, key) => sum + scoreFor(key) * LEARNING_AREA_WEIGHT[key], 0));
}

// Reading & Comprehension, Recall & Retention, and Problem Solving gate
// independent classroom work most directly — if these are weak, the class
// is at real risk even when the weighted average still looks fine.
const FOUNDATIONAL_AREAS: LearningAreaKey[] = ["readingComprehension", "recallRetention", "problemSolving"];

/** Tiers escalate rather than stack — a class with one foundational area
 * under 50 is already the worst case (-8), not additionally penalized for
 * also tripping the "any area under 60" and "two areas under 60" tiers. */
function supportRiskPenalty(scoreFor: (key: LearningAreaKey) => number): number {
  const scores = FOUNDATIONAL_AREAS.map(scoreFor);
  const below60 = scores.filter((v) => v < 60).length;
  const below50 = scores.some((v) => v < 50);

  let penalty = 0;
  if (below60 >= 1) penalty = Math.max(penalty, 3);
  if (below60 >= 2) penalty = Math.max(penalty, 6);
  if (below50) penalty = Math.max(penalty, 8);
  return penalty;
}

export const LEARNING_AREA_HUE: Record<LearningAreaKey, string> = {
  problemSolving: "hsl(142 55% 46%)",
  reasoning: "hsl(212 55% 50%)",
  creativeExpression: "hsl(262 60% 60%)",
  readingComprehension: "hsl(0 78% 58%)",
  recallRetention: "hsl(28 88% 54%)",
  curiosityExploration: "hsl(168 62% 42%)",
};

function studentLearningAreaScore(s: Student, key: LearningAreaKey): number {
  switch (key) {
    case "problemSolving":
      // Switching + divided attention: holding a strategy while managing
      // multiple problem steps at once.
      return clamp(
        domainScore(s, "swi") * 0.5 +
          domainScore(s, "div") * 0.2 +
          ksaScore(s, "Mental Flexibility") * 0.3,
      );
    case "reasoning":
      // Selective + sustained attention: filtering to the relevant detail
      // and staying with it long enough to connect ideas.
      return clamp(
        domainScore(s, "sel") * 0.5 +
          domainScore(s, "sus") * 0.2 +
          ksaScore(s, "Working Memory") * 0.3,
      );
    case "creativeExpression":
      // Visual attention is the strongest real proxy this dataset has for
      // generative/expressive output.
      return clamp(
        domainScore(s, "vis") * 0.5 +
          indicatorScore(s, "Adapts self to new rules") * 0.25 +
          ksaScore(s, "Self - Awareness") * 0.25,
      );
    case "readingComprehension":
      // Auditory attention: processing spoken instructions and questions.
      return clamp(
        domainScore(s, "aud") * 0.5 +
          indicatorScore(s, "Accurately interprets spoken information") * 0.25 +
          ksaScore(s, "Active Listening") * 0.25,
      );
    case "recallRetention":
      // Sustained attention + how steady the student's 4-week history is —
      // a genuinely different-shaped signal from the domain offsets, so
      // this area doesn't just track "reasoning" a second time.
      return clamp(
        domainScore(s, "sus") * 0.35 +
          ksaScore(s, "Working Memory") * 0.3 +
          (100 - historySpread(s)) * 0.35,
      );
    case "curiosityExploration":
      // Divided attention (juggling new things) + behavioural regulation
      // (bouncing back without shutting down) + frustration tolerance.
      return clamp(
        domainScore(s, "div") * 0.4 +
          domainScore(s, "beh") * 0.3 +
          ksaScore(s, "Frustration Tolerance") * 0.3,
      );
  }
}

/** Spread across the 4-week intra-month history — a wide swing reads as
 * inconsistent retention week to week. */
function historySpread(s: Student): number {
  const weeks = s.history.map((h) => h.pfi);
  return Math.max(...weeks) - Math.min(...weeks);
}

export type LearningAreaStat = {
  key: LearningAreaKey;
  label: string;
  description: string;
  hue: string;
  score: number;
  prevScore: number;
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
    const scores = students.map((s) => studentLearningAreaScore(s, key));
    const score = avg(scores);
    const studentCount = scores.filter((v) => v < STRUGGLE_THRESHOLD).length;
    return {
      key,
      label: LEARNING_AREA_LABEL[key],
      description: LEARNING_AREA_DESCRIPTION[key],
      hue: LEARNING_AREA_HUE[key],
      score,
      prevScore: Math.max(0, score - 3),
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
    .filter((x) => x.v < STRUGGLE_THRESHOLD)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}

/* ─────────────────────────────────────────────────────────
 * Overall snapshot
 * ───────────────────────────────────────────────────────── */

export type ReadinessSnapshot = {
  score: number;
  /** Weighted area average before the support-risk adjustment below. */
  rawScore: number;
  /** Points subtracted because one or more foundational areas are weak. */
  supportRiskPenalty: number;
  status: ReadinessStatus;
  total: number;
  /** Count of students at each status band, for the distribution bar. */
  statusDistribution: Record<ReadinessStatus, number>;
  areas: LearningAreaStat[];
  strongestAreas: LearningAreaStat[];
  supportAreas: LearningAreaStat[];
};

export function classReadinessSnapshot(students: Student[] = STUDENTS): ReadinessSnapshot {
  const areas = classLearningAreas(students);
  const scoreByKey = new Map(areas.map((a) => [a.key, a.score]));
  const rawScore = weightedAreaAverage((key) => scoreByKey.get(key) ?? 0);
  const penalty = supportRiskPenalty((key) => scoreByKey.get(key) ?? 0);
  const score = clamp(rawScore - penalty);
  const total = students.length;

  const statusDistribution: Record<ReadinessStatus, number> = {
    strong: 0,
    stable: 0,
    watch: 0,
    support: 0,
  };
  for (const s of students) {
    const perStudentScore = weightedAreaAverage((key) => studentLearningAreaScore(s, key));
    statusDistribution[readinessStatusFromScore(perStudentScore)] += 1;
  }

  const ranked = [...areas].sort((a, b) => b.score - a.score);

  return {
    score,
    rawScore,
    supportRiskPenalty: penalty,
    status: readinessStatusFromScore(score),
    total,
    statusDistribution,
    areas,
    strongestAreas: ranked.slice(0, 2),
    supportAreas: ranked.slice(-2).reverse(),
  };
}

/* ─────────────────────────────────────────────────────────
 * Skill composition by area — 4 named sub-skills per area, each mapped to a
 * real per-student signal (no fabricated numbers).
 * ───────────────────────────────────────────────────────── */

export type AreaSkill = {
  name: string;
  score: number;
};

const AREA_SKILL_FIELDS: Record<LearningAreaKey, { name: string; value: (s: Student) => number }[]> = {
  problemSolving: [
    { name: "Pattern Recognition", value: (s) => indicatorScore(s, "Shows attention to detail") },
    { name: "Multi-step Execution", value: (s) => indicatorScore(s, "Follows multiple-step directions") },
    { name: "Strategy Planning", value: (s) => ksaScore(s, "Mental Flexibility") },
    { name: "Error Correction", value: (s) => subDomainScore(s, "Impulse Control") },
  ],
  reasoning: [
    { name: "Concept Linking", value: (s) => ksaScore(s, "Working Memory") },
    { name: "Logical Inference", value: (s) => ksaScore(s, "Mental Flexibility") },
    { name: "Comparison & Sorting", value: (s) => subDomainScore(s, "Selective Attention") },
    { name: "Decision Making", value: (s) => ksaScore(s, "Self Regulation") },
  ],
  creativeExpression: [
    { name: "Idea Generation", value: (s) => indicatorScore(s, "Adapts self to new rules") },
    { name: "Flexible Thinking", value: (s) => ksaScore(s, "Mental Flexibility") },
    { name: "Original Responses", value: (s) => ksaScore(s, "Self - Awareness") },
    { name: "Expression Clarity", value: (s) => ksaScore(s, "Social Perception") },
  ],
  readingComprehension: [
    { name: "Instruction Understanding", value: (s) => indicatorScore(s, "Follows multiple-step directions") },
    { name: "Question Interpretation", value: (s) => indicatorScore(s, "Accurately interprets spoken information") },
    { name: "Detail Extraction", value: (s) => indicatorScore(s, "Shows attention to detail") },
    { name: "Passage Comprehension", value: (s) => subDomainScore(s, "Auditory Attention") },
  ],
  recallRetention: [
    { name: "Working Recall", value: (s) => ksaScore(s, "Working Memory") },
    { name: "Sequence Memory", value: (s) => subDomainScore(s, "Sustained Attention") },
    { name: "Rule Retention", value: (s) => ksaScore(s, "Behavior Control") },
    { name: "Retrieval Speed", value: (s) => s.csi },
  ],
  curiosityExploration: [
    {
      name: "Trying New Approaches",
      value: (s) => indicatorScore(s, "Demonstrates ability to switch between tasks without resistance"),
    },
    { name: "Experimentation", value: (s) => subDomainScore(s, "Divided Attention") },
    { name: "Persistence in Novelty", value: (s) => ksaScore(s, "Frustration Tolerance") },
    { name: "Discovery Drive", value: (s) => Math.round((s.pfi + s.csi) / 2) },
  ],
};

export function learningAreaSkillComposition(
  key: LearningAreaKey,
  students: Student[] = STUDENTS,
): AreaSkill[] {
  return AREA_SKILL_FIELDS[key].map(({ name, value }) => ({
    name,
    score: avg(students.map(value)),
  }));
}

/* ─────────────────────────────────────────────────────────
 * Learning areas → skills — static reference table.
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
