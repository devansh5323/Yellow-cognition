// Learning Outcome Status — data + helpers for the subject-level placement
// page (distinct from Learning Readiness — see lib/classLearning.ts, which
// this file reuses as a REAL supporting signal rather than duplicating it).
//
// No marks-card / grades data exists anywhere in this app's data model — the
// spec's own MVP assumption ("the system may have marks-card data from
// current or previous class") doesn't hold for this dataset yet, so every
// student's subject band placement below is DEMO: a deterministic seeded
// score anchored to that student's real overall studentHealthScore (so it
// at least tracks with real performance rather than being independent
// noise), clearly tagged wherever it renders. The "Learning Skill Signals"
// section is the one part of this page that's fully real — it's a direct
// reuse of lib/classLearning.ts's classLearningAreas()/classReadinessSnapshot().

import { STUDENTS, type Student } from "@/data/mockData";
import { classLearningAreas, type LearningAreaKey, type LearningAreaStat } from "@/lib/classLearning";

function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function idSeed(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}
function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/* ─────────────────────────────────────────────────────────
 * Bands
 * ───────────────────────────────────────────────────────── */

export type OutcomeBand = "advanced" | "secure" | "developing" | "building" | "needs-support";

export const BAND_ORDER: OutcomeBand[] = ["advanced", "secure", "developing", "building", "needs-support"];

export const BAND_LABEL: Record<OutcomeBand, string> = {
  advanced: "Advanced",
  secure: "Secure",
  developing: "Developing",
  building: "Building",
  "needs-support": "Needs Support",
};

export const BAND_TONE: Record<OutcomeBand, string> = {
  advanced: "hsl(168 62% 38%)",
  secure: "hsl(142 55% 46%)",
  developing: "hsl(38 92% 50%)",
  building: "hsl(20 85% 55%)",
  "needs-support": "hsl(0 78% 55%)",
};

export const BAND_DESCRIPTION: Record<OutcomeBand, string> = {
  advanced: "Performing above expected level",
  secure: "Meeting expected level",
  developing: "Partial understanding; needs reinforcement",
  building: "Needs structured support",
  "needs-support": "Needs foundation-level intervention",
};

export function bandFromScore(score: number): OutcomeBand {
  if (score >= 85) return "advanced";
  if (score >= 70) return "secure";
  if (score >= 55) return "developing";
  if (score >= 40) return "building";
  return "needs-support";
}

function bandIndex(b: OutcomeBand): number {
  return BAND_ORDER.indexOf(b);
}

export type Movement = "moving-up" | "stable" | "slipping";

export const MOVEMENT_LABEL: Record<Movement, string> = {
  "moving-up": "Moving Up",
  stable: "Stable",
  slipping: "Slipping",
};

/* ─────────────────────────────────────────────────────────
 * Demo subject scores — no real marks/grades data exists (see file
 * header). Anchored to each student's real overall studentHealthScore with
 * a seeded per-subject offset, so scores at least correlate with real
 * performance instead of being fully independent.
 * ───────────────────────────────────────────────────────── */

export const SUBJECTS = ["Math", "Reading", "Science"] as const;
export type Subject = (typeof SUBJECTS)[number];

function demoSubjectScore(student: Student, subject: Subject): number {
  const seed = idSeed(student.id + subject);
  const offset = (rand(seed) - 0.5) * 26;
  return clamp(student.studentHealthScore + offset);
}

function demoPrevSubjectScore(student: Student, subject: Subject): number {
  const seed = idSeed(student.id + subject) * 7;
  const current = demoSubjectScore(student, subject);
  return clamp(current + (rand(seed) - 0.5) * 18);
}

function movementFromBands(band: OutcomeBand, prevBand: OutcomeBand): Movement {
  if (band === prevBand) return "stable";
  return bandIndex(band) < bandIndex(prevBand) ? "moving-up" : "slipping";
}

/* ─────────────────────────────────────────────────────────
 * Per-student outcome
 * ───────────────────────────────────────────────────────── */

const SUPPORT_NEEDS: Record<OutcomeBand, string[]> = {
  advanced: ["Ready for enrichment", "Stretch with extension tasks"],
  secure: ["Maintain & monitor", "Light reinforcement"],
  developing: ["Needs guided practice", "Targeted reteach"],
  building: ["Needs visual model", "Step-by-step scaffolding"],
  "needs-support": ["Needs accuracy support", "Foundation reteach"],
};

const REASONS_BY_MOVEMENT: Record<Movement, string[]> = {
  "moving-up": [
    "Gameplay signals suggest readiness for enrichment",
    "Improved recall in gameplay supports stronger marks",
    "Reasoning signals stable, marks climbing",
  ],
  stable: [
    "Marks stable, gameplay problem-solving is stable",
    "Recall signals are low despite stable marks",
    "Reasoning steady but reading-comprehension dipping",
  ],
  slipping: [
    "Marks declined from previous month",
    "Recall signals dropped before marks did",
    "Reading comprehension slipping in recent gameplay",
  ],
};

export type StudentOutcome = {
  student: Student;
  subject: Subject;
  subjectScore: number;
  prevSubjectScore: number;
  delta: number;
  band: OutcomeBand;
  prevBand: OutcomeBand;
  movement: Movement;
  reasonFlagged: string;
  supportNeeded: string;
  /** Real — the student's 2 weakest Learning Readiness areas with any real
   * signal, reused from lib/classLearning.ts rather than duplicated. */
  relatedAreas: LearningAreaKey[];
};

/** Real signal, reused rather than duplicated: for a given student, rank
 * whichever Learning Readiness areas have real per-student data and return
 * the weakest 2 — `[]` if this student has no real area scores at all. */
function weakestRealAreasForStudent(student: Student): LearningAreaKey[] {
  const lr = student.cognitivePerformance.learningReadiness;
  const candidates: { key: LearningAreaKey; v: number | null }[] = [
    { key: "problemSolving", v: lr.problemSolving },
    { key: "reasoning", v: lr.reasoning },
    { key: "creativeExpression", v: lr.creativeExpression },
    { key: "readingComprehension", v: lr.readingComprehension },
    { key: "recallRetention", v: lr.recallRetention },
  ];
  const scored = candidates.filter((x): x is { key: LearningAreaKey; v: number } => x.v != null);
  return scored
    .sort((a, b) => a.v - b.v)
    .slice(0, 2)
    .map((x) => x.key);
}

export function computeStudentOutcomes(subject: Subject = "Math", students: Student[] = STUDENTS): StudentOutcome[] {
  return students.map((s, i) => {
    const subjectScore = demoSubjectScore(s, subject);
    const prevSubjectScore = demoPrevSubjectScore(s, subject);
    const band = bandFromScore(subjectScore);
    const prevBand = bandFromScore(prevSubjectScore);
    const delta = subjectScore - prevSubjectScore;
    const movement = movementFromBands(band, prevBand);
    const reasonPool = REASONS_BY_MOVEMENT[movement];
    const supportPool = SUPPORT_NEEDS[band];
    return {
      student: s,
      subject,
      subjectScore,
      prevSubjectScore,
      delta,
      band,
      prevBand,
      movement,
      reasonFlagged: reasonPool[i % reasonPool.length],
      supportNeeded: supportPool[i % supportPool.length],
      relatedAreas: weakestRealAreasForStudent(s),
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Class-level summary
 * ───────────────────────────────────────────────────────── */

export type OutcomeSummary = {
  total: number;
  meeting: number;
  meetingPct: number;
  needingSupport: number;
  movingUp: number;
  placementsToReview: number;
  distribution: Record<OutcomeBand, number>;
  headline: string;
  trend: "positive" | "holding" | "watch";
};

export function summariseOutcomes(outcomes: StudentOutcome[], confirmations: OutcomeConfirmationState): OutcomeSummary {
  const total = outcomes.length;
  const distribution: Record<OutcomeBand, number> = {
    advanced: 0,
    secure: 0,
    developing: 0,
    building: 0,
    "needs-support": 0,
  };
  let movingUp = 0;
  let placementsToReview = 0;
  for (const o of outcomes) {
    distribution[o.band] += 1;
    if (o.movement === "moving-up") movingUp += 1;
    const confirmed = confirmations[o.student.id]?.status === "confirmed";
    if (!confirmed && o.movement !== "stable") placementsToReview += 1;
  }
  const meeting = distribution.advanced + distribution.secure;
  const needingSupport = distribution.developing + distribution.building + distribution["needs-support"];
  const meetingPct = Math.round((meeting / Math.max(1, total)) * 100);

  const trend: OutcomeSummary["trend"] =
    movingUp > distribution["needs-support"] + distribution.building ? "positive" : needingSupport > meeting ? "watch" : "holding";

  const headline = meetingPct >= 80 ? "Stretching" : meetingPct >= 60 ? "Mostly Secure" : meetingPct >= 40 ? "Building" : "Needs Support";

  return { total, meeting, meetingPct, needingSupport, movingUp, placementsToReview, distribution, headline, trend };
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — bound to the class's real weakest Learning Readiness
 * areas (lib/classLearning.ts), not duplicated fabrication.
 * ───────────────────────────────────────────────────────── */

export type OutcomeRecommendationKind = "Whole Class" | "Small Group" | "Quick Check";

export type OutcomeRecommendation = {
  id: string;
  title: string;
  rationale: string;
  kind: OutcomeRecommendationKind;
};

const RECS_BY_AREA: Record<LearningAreaKey, OutcomeRecommendation> = {
  problemSolving: {
    id: "ps-worked",
    title: "Use worked examples and step breakdowns",
    rationale: "Helps students who need support in Problem Solving and Recall & Retention.",
    kind: "Whole Class",
  },
  reasoning: {
    id: "rs-think",
    title: "Add 'show your reasoning' prompts to exit tickets",
    rationale: "Surfaces gaps in reasoning before they harden into marks dips.",
    kind: "Quick Check",
  },
  creativeExpression: {
    id: "ce-open",
    title: "Run an open-ended applied problem this week",
    rationale: "Strong creative signals — channel them into the new chapter.",
    kind: "Small Group",
  },
  readingComprehension: {
    id: "rc-vocab",
    title: "Pre-teach key vocabulary and highlight question words",
    rationale: "Helps improve Reading & Comprehension during subject tasks.",
    kind: "Small Group",
  },
  recallRetention: {
    id: "rr-retrieve",
    title: "Use quick retrieval checks before students solve on their own",
    rationale: "Helps strengthen Recall & Retention before students solve independently.",
    kind: "Quick Check",
  },
  curiosityExploration: {
    id: "ce-stretch",
    title: "Offer a stretch challenge for the strongest students",
    rationale: "Capitalises on high curiosity to push toward the Advanced band.",
    kind: "Small Group",
  },
};

/** Real — picks recommendations for whichever real Learning Readiness areas
 * currently score weakest (skips areas with zero real signal instead of
 * ranking them as if a 0 were real). */
export function pickOutcomeRecommendations(areas: LearningAreaStat[] = classLearningAreas(), count = 3): OutcomeRecommendation[] {
  const withScore = areas.filter((a): a is LearningAreaStat & { score: number } => a.score != null);
  const ranked = [...withScore].sort((a, b) => a.score - b.score);
  return ranked.slice(0, count).map((a) => RECS_BY_AREA[a.key]);
}

/* ─────────────────────────────────────────────────────────
 * Monthly Teacher Check — persisted confirmation state, same
 * localStorage + event-dispatch pattern as lib/schoolOnboarding.ts.
 * ───────────────────────────────────────────────────────── */

const KEY = "ah_learning_outcome_confirmations";
const EVENT = "ah-learning-outcome-change";

export type OutcomeConfirmationEntry = {
  status: "pending" | "confirmed";
  /** Teacher-adjusted band, if different from the system-suggested one. */
  band: OutcomeBand;
};

export type OutcomeConfirmationState = Record<string, OutcomeConfirmationEntry>;

export function getOutcomeConfirmations(): OutcomeConfirmationState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OutcomeConfirmationState) : {};
  } catch {
    return {};
  }
}

function writeOutcomeConfirmations(state: OutcomeConfirmationState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function setOutcomeConfirmation(studentId: string, band: OutcomeBand, status: "pending" | "confirmed" = "confirmed") {
  const current = getOutcomeConfirmations();
  writeOutcomeConfirmations({ ...current, [studentId]: { status, band } });
}

export function confirmAllOutcomes(outcomes: StudentOutcome[]) {
  const current = getOutcomeConfirmations();
  const next: OutcomeConfirmationState = { ...current };
  for (const o of outcomes) {
    const existing = next[o.student.id];
    next[o.student.id] = { status: "confirmed", band: existing?.band ?? o.band };
  }
  writeOutcomeConfirmations(next);
}

/** The band actually shown for a student — the teacher's confirmed/adjusted
 * band if one exists, otherwise the system-suggested band from the outcome. */
export function effectiveBand(outcome: StudentOutcome, confirmations: OutcomeConfirmationState): OutcomeBand {
  return confirmations[outcome.student.id]?.band ?? outcome.band;
}
