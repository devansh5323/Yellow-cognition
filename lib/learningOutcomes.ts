// Learning Outcome Status — data + helpers
// Derives MVP outcome bands from existing student mocks (marks-card ranges,
// month-on-month movement, gameplay-derived skill signals).
// No topic-wise outcome data is required.

import { STUDENTS, type Student } from "@/data/mockData";

export type OutcomeBand = "advanced" | "secure" | "developing" | "building" | "needs-support";

export const BAND_ORDER: OutcomeBand[] = [
  "advanced",
  "secure",
  "developing",
  "building",
  "needs-support",
];

export const BAND_LABEL: Record<OutcomeBand, string> = {
  advanced: "Advanced",
  secure: "Secure",
  developing: "Developing",
  building: "Building",
  "needs-support": "Needs Support",
};

export const BAND_HUE: Record<OutcomeBand, string> = {
  advanced: "hsl(168 62% 38%)",
  secure: "hsl(142 55% 46%)",
  developing: "hsl(38 92% 55%)",
  building: "hsl(20 85% 58%)",
  "needs-support": "hsl(0 78% 58%)",
};

export const BAND_HUE_SOFT: Record<OutcomeBand, string> = {
  advanced: "hsl(168 60% 92%)",
  secure: "hsl(142 60% 92%)",
  developing: "hsl(38 92% 92%)",
  building: "hsl(20 90% 93%)",
  "needs-support": "hsl(0 82% 94%)",
};

export const BAND_DESCRIPTION: Record<OutcomeBand, string> = {
  advanced: "Performing above expected level",
  secure: "Meeting expected level",
  developing: "Partial understanding; needs reinforcement",
  building: "Needs structured support",
  "needs-support": "Needs foundation-level intervention",
};

export type Movement = "moving-up" | "stable" | "slipping" | "new";

export const MOVEMENT_LABEL: Record<Movement, string> = {
  "moving-up": "Moving Up",
  stable: "Stable",
  slipping: "Slipping",
  new: "New",
};

/* ─────────────────────────────────────────────────────────
 * Band classifier — uses subject score + last-month delta
 * ───────────────────────────────────────────────────────── */
export function bandFromScore(score: number): OutcomeBand {
  if (score >= 85) return "advanced";
  if (score >= 70) return "secure";
  if (score >= 55) return "developing";
  if (score >= 40) return "building";
  return "needs-support";
}

export function movementFromDelta(delta: number): Movement {
  if (delta >= 6) return "moving-up";
  if (delta <= -5) return "slipping";
  return "stable";
}

/* ─────────────────────────────────────────────────────────
 * Per-student outcome (subject-aware)
 * ───────────────────────────────────────────────────────── */
export type StudentOutcome = {
  student: Student;
  subjectScore: number;
  prevSubjectScore: number;
  delta: number;
  band: OutcomeBand;
  prevBand: OutcomeBand;
  movement: Movement;
  /** Plain-language reason flagged for review */
  reasonFlagged: string;
  supportNeeded: string;
  /**
   * Learning skill signals most relevant to this student's support need —
   * surfaced as chips next to the support text so the teacher can see *why*.
   */
  relatedSignals: SkillKey[];
  confirmation: "pending" | "confirmed";
};

function subjectScoreFor(s: Student, subject: string): number {
  const m = s.subjects.find((x) => x.name === subject);
  if (m) return m.score;
  return Math.round(s.subjects.reduce((a, x) => a + x.score, 0) / s.subjects.length);
}

function subjectTrendFor(s: Student, subject: string): number {
  const m = s.subjects.find((x) => x.name === subject);
  return m?.trend ?? 0;
}

const SUPPORT_NEEDS: Record<OutcomeBand, string[]> = {
  advanced: ["Ready for enrichment", "Stretch with extension tasks"],
  secure: ["Maintain & monitor", "Light reinforcement"],
  developing: ["Needs guided practice", "Targeted reteach"],
  building: ["Needs visual model", "Step-by-step scaffolding"],
  "needs-support": ["Needs accuracy support", "Foundation reteach"],
};

/**
 * Per-band pool of skill signals most likely to be the underlying cause of a
 * student landing in that band. Two signals are picked per student off these
 * pools so the support row in the per-student review can show the WHY.
 */
const SIGNAL_POOLS_BY_BAND: Record<OutcomeBand, SkillKey[]> = {
  "needs-support": ["reading-comprehension", "recall-retention", "problem-solving"],
  building: ["recall-retention", "problem-solving", "reasoning"],
  developing: ["reasoning", "problem-solving", "creative-expression"],
  secure: ["recall-retention", "creative-expression"],
  advanced: ["curiosity-exploration", "creative-expression"],
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
  new: ["New roster entry — needs baseline review"],
};

export function computeStudentOutcomes(
  subject = "Mathematics",
  students: Student[] = STUDENTS,
): StudentOutcome[] {
  return students.map((s, i) => {
    const subjectScore = subjectScoreFor(s, subject);
    const trend = subjectTrendFor(s, subject);
    const prevSubjectScore = Math.max(0, Math.min(100, subjectScore - trend));
    const band = bandFromScore(subjectScore);
    const prevBand = bandFromScore(prevSubjectScore);
    const delta = subjectScore - prevSubjectScore;
    const movement: Movement =
      band !== prevBand
        ? bandIndex(band) < bandIndex(prevBand)
          ? "moving-up"
          : "slipping"
        : movementFromDelta(delta);
    const reasonPool = REASONS_BY_MOVEMENT[movement];
    const supportPool = SUPPORT_NEEDS[band];
    const signalPool = SIGNAL_POOLS_BY_BAND[band];
    // Pick two distinct signals per student, varying by index so adjacent
    // rows don't all look the same.
    const first = signalPool[i % signalPool.length];
    const second = signalPool.length > 1 ? signalPool[(i + 1) % signalPool.length] : undefined;
    const relatedSignals: SkillKey[] = second && second !== first ? [first, second] : [first];
    return {
      student: s,
      subjectScore,
      prevSubjectScore,
      delta,
      band,
      prevBand,
      movement,
      reasonFlagged: reasonPool[i % reasonPool.length],
      supportNeeded: supportPool[i % supportPool.length],
      relatedSignals,
      // Mostly pending in first half of class to drive the review flow.
      confirmation: i % 7 === 0 ? "confirmed" : "pending",
    };
  });
}

function bandIndex(b: OutcomeBand) {
  return BAND_ORDER.indexOf(b);
}

/* ─────────────────────────────────────────────────────────
 * Class-level summary
 * ───────────────────────────────────────────────────────── */
export type OutcomeSummary = {
  total: number;
  meeting: number; // advanced + secure
  meetingPct: number;
  needingSupport: number; // developing + building + needs-support
  needingSupportPct: number;
  movingUp: number;
  movingUpPct: number;
  placementsToReview: number;
  distribution: Record<OutcomeBand, number>;
  prevDistribution: Record<OutcomeBand, number>;
  /** Headline tag like "Mostly Secure" / "Stretching" */
  headline: string;
  /** Trend tag like "Positive Progress" / "Holding" */
  trend: "positive" | "holding" | "watch";
};

export function summariseOutcomes(outcomes: StudentOutcome[]): OutcomeSummary {
  const total = outcomes.length;
  const distribution: Record<OutcomeBand, number> = {
    advanced: 0,
    secure: 0,
    developing: 0,
    building: 0,
    "needs-support": 0,
  };
  const prevDistribution: Record<OutcomeBand, number> = {
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
    prevDistribution[o.prevBand] += 1;
    if (o.movement === "moving-up") movingUp += 1;
    if (o.confirmation === "pending" && o.movement !== "stable") placementsToReview += 1;
  }
  const meeting = distribution.advanced + distribution.secure;
  const needingSupport =
    distribution.developing + distribution.building + distribution["needs-support"];

  const meetingPct = pct(meeting, total);
  const needingSupportPct = pct(needingSupport, total);
  const movingUpPct = pct(movingUp, total);

  const trend: OutcomeSummary["trend"] =
    movingUp > distribution["needs-support"] + distribution.building
      ? "positive"
      : needingSupport > meeting
        ? "watch"
        : "holding";

  const headline =
    meetingPct >= 80
      ? "Stretching"
      : meetingPct >= 60
        ? "Mostly Secure"
        : meetingPct >= 40
          ? "Building"
          : "Needs Support";

  return {
    total,
    meeting,
    meetingPct,
    needingSupport,
    needingSupportPct,
    movingUp,
    movingUpPct,
    placementsToReview,
    distribution,
    prevDistribution,
    headline,
    trend,
  };
}

function pct(part: number, whole: number) {
  return Math.round((part / Math.max(1, whole)) * 100);
}

/* ─────────────────────────────────────────────────────────
 * Learning Skill Signals — gameplay-derived (supporting only)
 * ───────────────────────────────────────────────────────── */
export type SkillKey =
  | "problem-solving"
  | "reasoning"
  | "creative-expression"
  | "reading-comprehension"
  | "recall-retention"
  | "curiosity-exploration";

export type SkillStatus = "strong" | "stable" | "watch" | "needs-support";

/** A single cognitive skill that feeds a signal. */
export type ImpactingSkill = {
  name: string;
  score: number;
};

export type SkillSignal = {
  key: SkillKey;
  label: string;
  iconKey: "puzzle" | "brain" | "sparkles" | "book-open" | "rotate-ccw" | "compass";
  hue: string;
  /** Cumulative score — average of the impactingSkills below. */
  score: number;
  prevScore: number;
  status: SkillStatus;
  blurb: string;
  /** What this signal is measuring — surfaced in the card detail popover. */
  description: string;
  /** Underlying cognitive skills whose scores cumulate into the signal score. */
  impactingSkills: ImpactingSkill[];
};

const SKILL_HUES: Record<SkillKey, string> = {
  "problem-solving": "hsl(142 55% 48%)",
  reasoning: "hsl(258 55% 60%)",
  "creative-expression": "hsl(286 60% 60%)",
  "reading-comprehension": "hsl(20 85% 58%)",
  "recall-retention": "hsl(38 92% 55%)",
  "curiosity-exploration": "hsl(196 75% 50%)",
};

const SKILL_LABELS: Record<SkillKey, string> = {
  "problem-solving": "Problem Solving",
  reasoning: "Reasoning",
  "creative-expression": "Expression & Response",
  "reading-comprehension": "Reading & Comprehension",
  "recall-retention": "Recall & Retention",
  "curiosity-exploration": "Learning Exploration",
};

const SKILL_ICONS: Record<SkillKey, SkillSignal["iconKey"]> = {
  "problem-solving": "puzzle",
  reasoning: "brain",
  "creative-expression": "sparkles",
  "reading-comprehension": "book-open",
  "recall-retention": "rotate-ccw",
  "curiosity-exploration": "compass",
};

/** Plain-language summary of what each signal measures. */
const SKILL_DESCRIPTIONS: Record<SkillKey, string> = {
  "problem-solving": "How students break down tasks and use strategies to solve problems.",
  reasoning: "How students understand ideas, connect concepts, and choose the right approach.",
  "creative-expression": "How clearly students explain, write, or show what they have understood.",
  "reading-comprehension":
    "How students understand written questions, instructions, and task expectations.",
  "recall-retention":
    "How well students remember previously taught concepts, information, or rules.",
  "curiosity-exploration":
    "How willing students are to try new approaches, explore ideas, and engage with unfamiliar tasks.",
};

/**
 * Underlying cognitive skills that drive each signal. The numeric `offset`
 * is applied around the signal's anchor score so each skill ends up with a
 * realistic value, and the signal's final `score` is the average across them.
 */
const SKILL_IMPACTS: Record<SkillKey, { name: string; offset: number }[]> = {
  "problem-solving": [
    { name: "Critical Thinking", offset: 3 },
    { name: "Decision Making", offset: -4 },
    { name: "Planning", offset: 1 },
  ],
  reasoning: [
    { name: "Analytical Reasoning", offset: 2 },
    { name: "Abstract Thinking", offset: -5 },
    { name: "Inductive Reasoning", offset: 3 },
  ],
  "creative-expression": [
    { name: "Oral Expression", offset: 4 },
    { name: "Written Expression", offset: -3 },
    { name: "Creative Thinking", offset: -1 },
  ],
  "reading-comprehension": [
    { name: "Processing Speed", offset: 2 },
    { name: "Oral Comprehension", offset: -2 },
    { name: "Auditory Shifting", offset: 0 },
  ],
  "recall-retention": [
    { name: "Working Memory", offset: 4 },
    { name: "Information Processing", offset: -3 },
    { name: "Active Listening", offset: -1 },
  ],
  "curiosity-exploration": [
    { name: "Adaptive Thinking", offset: 3 },
    { name: "Mental Flexibility", offset: 0 },
    { name: "Active Learning", offset: -3 },
  ],
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Lookup a signal's display label + hue without needing the full record. */
export function signalMeta(key: SkillKey): { label: string; hue: string } {
  return { label: SKILL_LABELS[key], hue: SKILL_HUES[key] };
}

/**
 * Per-student skill signal scores — mirrors the blend used in
 * `classSkillSignals` so a single student's radar is comparable against
 * the class signal scores.
 */
export function studentSkillScores(student: Student): Record<SkillKey, number> {
  const sub = (i: number) =>
    student.subDomains[i % student.subDomains.length]?.score ?? 0;
  return {
    "problem-solving": clampScore(sub(0)),
    reasoning: clampScore(sub(2) - 2),
    "creative-expression": clampScore(sub(7) + 4),
    "reading-comprehension": clampScore(sub(1) - 3),
    "recall-retention": clampScore(sub(3) - 4),
    "curiosity-exploration": clampScore(sub(6) + 3),
  };
}

function skillStatus(score: number): SkillStatus {
  if (score >= 78) return "strong";
  if (score >= 65) return "stable";
  if (score >= 55) return "watch";
  return "needs-support";
}

const SKILL_BLURBS: Record<SkillStatus, string> = {
  strong: "Class is consistently above benchmark.",
  stable: "Steady week-on-week — keep current routines.",
  watch: "Slipping in recent gameplay sessions.",
  "needs-support": "Below benchmark — drives marks dip.",
};

/** Synthesise per-skill class scores from student composites. */
export function classSkillSignals(students: Student[] = STUDENTS): SkillSignal[] {
  const avg = (i: number, jitter = 0) => {
    const base =
      students.reduce((a, s) => a + (s.subDomains[i % s.subDomains.length]?.score ?? 0), 0) /
      Math.max(1, students.length);
    return Math.round(Math.max(0, Math.min(100, base + jitter)));
  };

  const scores: Record<SkillKey, number> = {
    "problem-solving": 74,
    reasoning: 68,
    "creative-expression": 81,
    "reading-comprehension": 62,
    "recall-retention": 58,
    "curiosity-exploration": 77,
  };

  // Light blend so the numbers aren't fully static — uses real student data.
  const blendedScores: Record<SkillKey, number> = {
    "problem-solving": Math.round((scores["problem-solving"] + avg(0)) / 2),
    reasoning: Math.round((scores.reasoning + avg(2, -2)) / 2),
    "creative-expression": Math.round((scores["creative-expression"] + avg(7, 4)) / 2),
    "reading-comprehension": Math.round((scores["reading-comprehension"] + avg(1, -3)) / 2),
    "recall-retention": Math.round((scores["recall-retention"] + avg(3, -4)) / 2),
    "curiosity-exploration": Math.round((scores["curiosity-exploration"] + avg(6, 3)) / 2),
  };

  return (Object.keys(blendedScores) as SkillKey[]).map((k) => {
    const anchor = blendedScores[k];
    // Per-skill scores fan out around the anchor by their declared offset…
    const impactingSkills: ImpactingSkill[] = SKILL_IMPACTS[k].map((entry) => ({
      name: entry.name,
      score: clampScore(anchor + entry.offset),
    }));
    // …and the signal's headline score is the cumulative average of those.
    const score = clampScore(
      impactingSkills.reduce((sum, s) => sum + s.score, 0) / impactingSkills.length,
    );
    const status = skillStatus(score);
    return {
      key: k,
      label: SKILL_LABELS[k],
      iconKey: SKILL_ICONS[k],
      hue: SKILL_HUES[k],
      score,
      prevScore: Math.max(0, score - 3),
      status,
      blurb: SKILL_BLURBS[status],
      description: SKILL_DESCRIPTIONS[k],
      impactingSkills,
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — bound to weakest two skills
 * ───────────────────────────────────────────────────────── */
export type RecommendationKind = "Whole Class" | "Small Group" | "Quick Check";

export type OutcomeRecommendation = {
  id: string;
  title: string;
  rationale: string;
  kind: RecommendationKind;
  skills: SkillKey[];
};

const RECS_BY_SKILL: Record<SkillKey, OutcomeRecommendation[]> = {
  "problem-solving": [
    {
      id: "ps-worked",
      title: "Use worked examples and step breakdowns",
      rationale: "Helps students who need support in Problem Solving and Recall & Retention.",
      kind: "Whole Class",
      skills: ["problem-solving", "recall-retention"],
    },
  ],
  reasoning: [
    {
      id: "rs-think",
      title: "Add 'show your reasoning' prompts to exit tickets",
      rationale: "Surfaces gaps in reasoning before they harden into marks dips.",
      kind: "Quick Check",
      skills: ["reasoning"],
    },
  ],
  "creative-expression": [
    {
      id: "ce-open",
      title: "Run an open-ended applied problem this week",
      rationale: "Strong creative signals — channel them into the new chapter.",
      kind: "Small Group",
      skills: ["creative-expression"],
    },
  ],
  "reading-comprehension": [
    {
      id: "rc-vocab",
      title: "Pre-teach key vocabulary and highlight question words",
      rationale: "Helps improve Reading & Comprehension during Math tasks.",
      kind: "Small Group",
      skills: ["reading-comprehension"],
    },
  ],
  "recall-retention": [
    {
      id: "rr-retrieve",
      title: "Use quick retrieval checks before students solve on their own",
      rationale: "Helps strengthen Recall & Retention before students solve on their own.",
      kind: "Quick Check",
      skills: ["recall-retention"],
    },
  ],
  "curiosity-exploration": [
    {
      id: "ce-stretch",
      title: "Offer a stretch challenge for the strongest students",
      rationale: "Capitalises on high curiosity to push toward the Advanced band.",
      kind: "Small Group",
      skills: ["curiosity-exploration"],
    },
  ],
};

export function pickRecommendations(signals: SkillSignal[]): OutcomeRecommendation[] {
  const ranked = [...signals].sort((a, b) => a.score - b.score);
  const lowestTwo = ranked.slice(0, 2).map((s) => s.key);
  // Pull one rec per weakest skill, plus one strong-skill stretch.
  const stretchKey = ranked[ranked.length - 1].key;
  const ids: SkillKey[] = [...lowestTwo, stretchKey];
  return ids
    .flatMap((k) => RECS_BY_SKILL[k] ?? [])
    .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    .slice(0, 3);
}

/* ─────────────────────────────────────────────────────────
 * Convenience: all-in-one snapshot for the page
 * ───────────────────────────────────────────────────────── */
export type LearningOutcomeSnapshot = {
  subject: string;
  outcomes: StudentOutcome[];
  summary: OutcomeSummary;
  signals: SkillSignal[];
  recommendations: OutcomeRecommendation[];
};

export function learningOutcomeSnapshot(
  subject = "Mathematics",
  students: Student[] = STUDENTS,
): LearningOutcomeSnapshot {
  const outcomes = computeStudentOutcomes(subject, students);
  const summary = summariseOutcomes(outcomes);
  const signals = classSkillSignals(students);
  const recommendations = pickRecommendations(signals);
  return { subject, outcomes, summary, signals, recommendations };
}
