// Class Health scoring layer for the teacher dashboard.
// Implements the 4-pillar weighted model defined in the Teacher Dashboard PRD:
// Academic Progress (30%), Attention & Focus (30%), Behavior (20%), Task Completion (20%).

import { STUDENTS, type Student } from "@/data/mockData";

export type PillarKey = "academic" | "focus" | "behavior" | "task";

export type StudentStatus = "on-track" | "watch" | "needs-support" | "improving";

export type ClassHealthLabel = "Excellent" | "Good" | "Improving" | "Needs Support";

const WEIGHTS: Record<PillarKey, number> = {
  academic: 0.3,
  focus: 0.3,
  behavior: 0.2,
  task: 0.2,
};

const PILLAR_LABELS: Record<PillarKey, string> = {
  academic: "Learning",
  focus: "Focus",
  behavior: "Behavior",
  task: "Task Completion",
};

export function pillarLabel(p: PillarKey) {
  return PILLAR_LABELS[p];
}

/**
 * Per-student pillar scores derived from existing mock fields.
 * Real implementation will replace these derivations with checked-in signals.
 */
export function pillarScores(s: Student): Record<PillarKey, number> {
  const academic = Math.round(
    s.subjects.reduce((a, x) => a + x.score, 0) / Math.max(1, s.subjects.length),
  );
  const focus = s.pfi;
  // Behavior: blend impulse control + emotional regulation sub-domains.
  const impulse = s.subDomains[4]?.score ?? s.csi;
  const emo = s.subDomains[5]?.score ?? s.csi;
  const behavior = Math.round((impulse + emo) / 2);
  // Task completion: ratio of games played to assigned.
  const task = Math.round((s.gamesPlayed / Math.max(1, s.gamesAssigned)) * 100);
  return { academic, focus, behavior, task: clamp(task) };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function compositeScore(p: Record<PillarKey, number>): number {
  return Math.round(
    p.academic * WEIGHTS.academic +
      p.focus * WEIGHTS.focus +
      p.behavior * WEIGHTS.behavior +
      p.task * WEIGHTS.task,
  );
}

export function statusForScore(score: number, prevScore?: number): StudentStatus {
  if (prevScore != null && score - prevScore >= 8) return "improving";
  if (score >= 75) return "on-track";
  if (score >= 60) return "watch";
  return "needs-support";
}

export function classHealthLabel(score: number): ClassHealthLabel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Improving";
  return "Needs Support";
}

export type StudentComposite = {
  student: Student;
  pillars: Record<PillarKey, number>;
  prevPillars: Record<PillarKey, number>;
  score: number;
  prevScore: number;
  status: StudentStatus;
};

/** Compute every student's pillar scores, composite, and status. */
export function studentComposites(students: Student[] = STUDENTS): StudentComposite[] {
  return students.map((s) => {
    const pillars = pillarScores(s);
    // Derive a "previous" pillar set from the previous PFI snapshot
    // and a small constant decay on the others — keeps the prototype lively.
    const focusDelta = s.pfi - s.pfiPrevCheckIn;
    const prevPillars: Record<PillarKey, number> = {
      academic: clamp(pillars.academic - 3),
      focus: clamp(pillars.focus - focusDelta),
      behavior: clamp(pillars.behavior - 2),
      task: clamp(pillars.task - 4),
    };
    const score = compositeScore(pillars);
    const prevScore = compositeScore(prevPillars);
    return {
      student: s,
      pillars,
      prevPillars,
      score,
      prevScore,
      status: statusForScore(score, prevScore),
    };
  });
}

export type StatusDistribution = Record<StudentStatus, number>;

export type ClassHealth = {
  score: number;
  prevScore: number;
  delta: number;
  label: ClassHealthLabel;
  supportingLine: string;
  pillars: Record<PillarKey, number>;
  prevPillars: Record<PillarKey, number>;
  pillarDelta: Record<PillarKey, number>;
  distribution: StatusDistribution;
  total: number;
};

export function classHealth(students: Student[] = STUDENTS): ClassHealth {
  const composites = studentComposites(students);
  const total = composites.length;

  const meanPillar = (k: PillarKey, useprev = false): number =>
    Math.round(
      composites.reduce((a, c) => a + (useprev ? c.prevPillars[k] : c.pillars[k]), 0) /
        Math.max(1, total),
    );

  const pillars: Record<PillarKey, number> = {
    academic: meanPillar("academic"),
    focus: meanPillar("focus"),
    behavior: meanPillar("behavior"),
    task: meanPillar("task"),
  };
  const prevPillars: Record<PillarKey, number> = {
    academic: meanPillar("academic", true),
    focus: meanPillar("focus", true),
    behavior: meanPillar("behavior", true),
    task: meanPillar("task", true),
  };
  const pillarDelta: Record<PillarKey, number> = {
    academic: pillars.academic - prevPillars.academic,
    focus: pillars.focus - prevPillars.focus,
    behavior: pillars.behavior - prevPillars.behavior,
    task: pillars.task - prevPillars.task,
  };

  const score = compositeScore(pillars);
  const prevScore = compositeScore(prevPillars);
  const label = classHealthLabel(score);

  const distribution: StatusDistribution = {
    "on-track": 0,
    watch: 0,
    "needs-support": 0,
    improving: 0,
  };
  for (const c of composites) distribution[c.status] += 1;

  // Plain-language supporting line: name the two weakest pillars.
  const ranked = (Object.entries(pillars) as [PillarKey, number][])
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => PILLAR_LABELS[k].toLowerCase());
  const supportingLine =
    score >= 85
      ? "Most of your class is doing well across the board."
      : score >= 70
        ? `Most of your class is steady. Two areas could use a push this week: ${ranked[0]} and ${ranked[1]}.`
        : score >= 50
          ? `Some students are slipping. Start with ${ranked[0]} and ${ranked[1]} this week.`
          : `A few areas need real attention — start with ${ranked[0]}.`;

  return {
    score,
    prevScore,
    delta: score - prevScore,
    label,
    supportingLine,
    pillars,
    prevPillars,
    pillarDelta,
    distribution,
    total,
  };
}

/* ─────────────────────────────────────────────────────────
 * Pillar-level classification (drives the Pillar Health row)
 * ───────────────────────────────────────────────────────── */
export type PillarStatus = "stable" | "watch" | "improving" | "needs-attention";

export function pillarStatus(score: number, delta: number): PillarStatus {
  if (delta >= 5 && score < 80) return "improving";
  if (score >= 75) return "stable";
  if (score >= 60) return "watch";
  return "needs-attention";
}

export function pillarEvidence(pillar: PillarKey, composites: StudentComposite[]): string {
  const struggling = composites.filter((c) => c.pillars[pillar] < 60).length;
  switch (pillar) {
    case "academic":
      return struggling === 0
        ? "Most students are on grade level."
        : `${struggling} students are slipping below grade level.`;
    case "focus":
      return struggling === 0
        ? "Most students are staying focused."
        : `${struggling} students are losing focus during work.`;
    case "behavior":
      return struggling === 0
        ? "Fewer disruptions than last week."
        : `${struggling} students disrupted lessons this week.`;
    case "task":
      return struggling === 0
        ? "Most students are finishing their work."
        : `${struggling} students didn't finish their work.`;
  }
}

/**
 * Per-pillar student distribution — bucketed by the same thresholds as
 * `statusForScore` so the cards stay in sync with the snapshot tally.
 */
export type PillarBucketCounts = {
  onTrack: number;
  watch: number;
  needsSupport: number;
  total: number;
};

export function pillarDistribution(
  pillar: PillarKey,
  composites: StudentComposite[],
): PillarBucketCounts {
  let onTrack = 0;
  let watch = 0;
  let needsSupport = 0;
  for (const c of composites) {
    const score = c.pillars[pillar];
    if (score >= 75) onTrack++;
    else if (score >= 60) watch++;
    else needsSupport++;
  }
  return { onTrack, watch, needsSupport, total: composites.length };
}

/**
 * Assigns each student to exactly ONE pillar — used by the dashboard KPI
 * cards so the four counts add up to the total class size.
 *
 * Demo bias: Learning is the primary KPI we're showcasing, so any student
 * whose academic score is below the on-track threshold (75) is bucketed
 * under Learning regardless of how their other pillars look. Everyone else
 * is bucketed by the weakest of the remaining pillars.
 */
export function primaryPillarCounts(composites: StudentComposite[]): Record<PillarKey, number> {
  const counts: Record<PillarKey, number> = {
    academic: 0,
    focus: 0,
    behavior: 0,
    task: 0,
  };
  const fallback: PillarKey[] = ["focus", "behavior", "task"];
  for (const c of composites) {
    if (c.pillars.academic < 75) {
      counts.academic++;
      continue;
    }
    let weakest: PillarKey = fallback[0];
    let weakestScore = c.pillars[weakest];
    for (const k of fallback) {
      if (c.pillars[k] < weakestScore) {
        weakest = k;
        weakestScore = c.pillars[k];
      }
    }
    counts[weakest]++;
  }
  return counts;
}

/* ─────────────────────────────────────────────────────────
 * Top Support Areas — priority-ranked
 * ───────────────────────────────────────────────────────── */
export type SupportArea = {
  id: "task-completion" | "focus-independent" | "transitions-behavior" | "academic-progress";
  pillar: PillarKey;
  title: string;
  evidence: string;
  context: string;
  studentsAffected: number;
  rank: number;
};

export function topSupportAreas(students: Student[] = STUDENTS): SupportArea[] {
  const composites = studentComposites(students);
  const counts = {
    task: composites.filter((c) => c.pillars.task < 60).length,
    focus: composites.filter((c) => c.pillars.focus < 60).length,
    behavior: composites.filter((c) => c.pillars.behavior < 60).length,
    academic: composites.filter((c) => c.pillars.academic < 60).length,
  };

  const candidates: SupportArea[] = [
    {
      id: "task-completion",
      pillar: "task",
      title: "Task Completion",
      evidence: `${counts.task} students missed or delayed work this week`,
      context: "Most visible in homework and independent work",
      studentsAffected: counts.task,
      rank: 0,
    },
    {
      id: "focus-independent",
      pillar: "focus",
      title: "Focus During Independent Work",
      evidence: `${counts.focus} students showed distraction patterns`,
      context: "Most visible during self-paced tasks",
      studentsAffected: counts.focus,
      rank: 0,
    },
    {
      id: "transitions-behavior",
      pillar: "behavior",
      title: "Transitions & Classroom Behavior",
      evidence: `${counts.behavior} students struggled during activity changes`,
      context: "Most visible between tasks and group movement",
      studentsAffected: counts.behavior,
      rank: 0,
    },
    {
      id: "academic-progress",
      pillar: "academic",
      title: "Academic Progress",
      evidence: `${counts.academic} students slipped below grade range`,
      context: "Most visible on recent quizzes and class work",
      studentsAffected: counts.academic,
      rank: 0,
    },
  ];

  return candidates
    .sort((a, b) => b.studentsAffected - a.studentsAffected)
    .slice(0, 3)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

/* ─────────────────────────────────────────────────────────
 * Visible Growth + Priority Alert
 * ───────────────────────────────────────────────────────── */
export type GrowthAlert = {
  pillar: PillarKey;
  pillarLabel: string;
  changePct: number;
  headline: string;
  detail: string;
};

export function visibleGrowth(students: Student[] = STUDENTS): GrowthAlert | null {
  const ch = classHealth(students);
  const ranked = (Object.entries(ch.pillarDelta) as [PillarKey, number][])
    .filter(([, d]) => d > 0)
    .sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;
  const [pillar, delta] = ranked[0];
  const composites = studentComposites(students);
  const improved = composites.filter((c) => c.status === "improving").length;
  const headlines: Record<PillarKey, string> = {
    academic: `Learning improved by ${delta}%`,
    focus: `Focus improved by ${delta}%`,
    behavior: `Behavior improved by ${delta}%`,
    task: `Task completion improved by ${delta}%`,
  };
  return {
    pillar,
    pillarLabel: PILLAR_LABELS[pillar],
    changePct: delta,
    headline: headlines[pillar],
    detail:
      improved > 0
        ? `${improved} students showed better re-engagement during independent work.`
        : "Class trending up across this area.",
  };
}

export function priorityAlert(students: Student[] = STUDENTS): GrowthAlert | null {
  const ch = classHealth(students);
  const ranked = (Object.entries(ch.pillarDelta) as [PillarKey, number][])
    .filter(([, d]) => d < 0)
    .sort((a, b) => a[1] - b[1]);
  if (ranked.length === 0) {
    // Fallback to weakest pillar if nothing dropped.
    const weakest = (Object.entries(ch.pillars) as [PillarKey, number][]).sort(
      (a, b) => a[1] - b[1],
    )[0];
    if (!weakest) return null;
    const [pillar] = weakest;
    const composites = studentComposites(students);
    const struggling = composites.filter((c) => c.pillars[pillar] < 60).length;
    return {
      pillar,
      pillarLabel: PILLAR_LABELS[pillar],
      changePct: 0,
      headline: `${struggling} students need support with ${PILLAR_LABELS[pillar].toLowerCase()} this week`,
      detail: "Most visible in independent work and home tasks.",
    };
  }
  const [pillar, delta] = ranked[0];
  const composites = studentComposites(students);
  const struggling = composites.filter((c) => c.pillars[pillar] < 60).length;
  const headlines: Record<PillarKey, string> = {
    academic: `Learning dropped by ${Math.abs(delta)}%`,
    focus: `Focus dropped by ${Math.abs(delta)}%`,
    behavior: `Behavior dropped by ${Math.abs(delta)}%`,
    task: `Task completion dropped by ${Math.abs(delta)}%`,
  };
  return {
    pillar,
    pillarLabel: PILLAR_LABELS[pillar],
    changePct: delta,
    headline: headlines[pillar],
    detail: `${struggling} students had repeated incomplete work.`,
  };
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

const RECS_BY_PILLAR: Record<PillarKey, Recommendation[]> = {
  task: [
    {
      id: "task-1",
      pillar: "task",
      title: "Break tasks into smaller visible steps",
      rationale: "Helps students complete work more consistently.",
      type: "Whole Class",
    },
    {
      id: "task-2",
      pillar: "task",
      title: "Add an exit ticket on what's incomplete",
      rationale: "Surfaces blockers before they spread to homework.",
      type: "Quick Check",
    },
    {
      id: "task-3",
      pillar: "task",
      title: "Pair struggling students for partner-checks",
      rationale: "Peer accountability raises completion on independent work.",
      type: "Small Group",
    },
  ],
  focus: [
    {
      id: "focus-1",
      pillar: "focus",
      title: "Use shorter instructions followed by a quick check",
      rationale: "Useful when students lose focus during independent work.",
      type: "Whole Class",
    },
    {
      id: "focus-2",
      pillar: "focus",
      title: "Insert a 3-minute movement break mid-block",
      rationale: "Restores attention after 20+ minutes of seat work.",
      type: "Routine Change",
    },
    {
      id: "focus-3",
      pillar: "focus",
      title: "Front-row seat the 5 distracted students",
      rationale: "Reduces visual distractions and improves re-engagement.",
      type: "Small Group",
    },
  ],
  behavior: [
    {
      id: "behavior-1",
      pillar: "behavior",
      title: "Give a 2-minute transition warning before activity changes",
      rationale: "Can reduce disruption during transitions.",
      type: "Routine Change",
    },
    {
      id: "behavior-2",
      pillar: "behavior",
      title: "Co-create a class agreement on group work",
      rationale: "Shared norms reduce friction during collaborative tasks.",
      type: "Whole Class",
    },
    {
      id: "behavior-3",
      pillar: "behavior",
      title: "Pull a 6-min check-in with the 4 affected students",
      rationale: "Pre-empts repeat incidents during the next activity change.",
      type: "Small Group",
    },
  ],
  academic: [
    {
      id: "academic-1",
      pillar: "academic",
      title: "Run a 5-minute warm-up on last week's weakest topic",
      rationale: "Reinforces the concept students are slipping on.",
      type: "Whole Class",
    },
    {
      id: "academic-2",
      pillar: "academic",
      title: "Pull a small reteach group on prerequisite skills",
      rationale: "Targets the gap before this week's new concept.",
      type: "Small Group",
    },
    {
      id: "academic-3",
      pillar: "academic",
      title: "Use a 3-question exit ticket to confirm mastery",
      rationale: "Quick signal on whether today's instruction landed.",
      type: "Quick Check",
    },
  ],
};

/**
 * Pick recommendations driven by Top Support Areas, prioritising the weakest pillar.
 * Returns 3 unique recs (one per top area).
 */
export function recommendations(students: Student[] = STUDENTS): Recommendation[] {
  const top = topSupportAreas(students);
  return top
    .map((area) => RECS_BY_PILLAR[area.pillar][0])
    .filter((r): r is Recommendation => Boolean(r));
}

/* ─────────────────────────────────────────────────────────
 * Progress Over Time — 5-line trend (Overall + 4 pillars)
 * ───────────────────────────────────────────────────────── */
export type TrendPoint = {
  week: string;
  overall: number;
  academic: number;
  focus: number;
  behavior: number;
  task: number;
};

/** Synthesize a 5-week trend ending at the current pillar means. */
export function classHealthTrend(students: Student[] = STUDENTS): TrendPoint[] {
  const ch = classHealth(students);
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  // Walk backwards from current pillar values using a linear ease.
  const startOffsets: Record<PillarKey, number> = {
    academic: -10,
    focus: -12,
    behavior: -8,
    task: -10,
  };
  return weeks.map((label, i) => {
    const t = i / (weeks.length - 1); // 0 → 1
    const v = (k: PillarKey) =>
      Math.max(0, Math.min(100, Math.round(ch.pillars[k] + startOffsets[k] * (1 - t))));
    const academic = v("academic");
    const focus = v("focus");
    const behavior = v("behavior");
    const task = v("task");
    const overall = compositeScore({ academic, focus, behavior, task });
    return { week: label, overall, academic, focus, behavior, task };
  });
}

export type PillarSideCard = {
  pillar: PillarKey;
  label: string;
  current: number;
  change: number;
  status: PillarStatus;
};

export function pillarSideCards(students: Student[] = STUDENTS): PillarSideCard[] {
  const ch = classHealth(students);
  return (Object.keys(ch.pillars) as PillarKey[]).map((p) => ({
    pillar: p,
    label: PILLAR_LABELS[p],
    current: ch.pillars[p],
    change: ch.pillarDelta[p],
    status: pillarStatus(ch.pillars[p], ch.pillarDelta[p]),
  }));
}

export function yellowInsight(students: Student[] = STUDENTS): {
  summary: string;
  delta: number;
} {
  const ch = classHealth(students);
  const trend = classHealthTrend(students);
  const start = trend[0]?.overall ?? ch.score;
  const end = trend[trend.length - 1]?.overall ?? ch.score;
  const delta = end - start;
  const climbing = (Object.entries(ch.pillarDelta) as [PillarKey, number][])
    .filter(([, d]) => d > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => PILLAR_LABELS[p].toLowerCase());
  const lagging = (Object.entries(ch.pillarDelta) as [PillarKey, number][]).sort(
    (a, b) => a[1] - b[1],
  )[0];
  const climbingTxt =
    climbing.length === 0
      ? "No area is gaining ground yet"
      : climbing.length === 1
        ? `${capitalize(climbing[0])} keeps climbing`
        : `${capitalize(climbing[0])} and ${climbing[1]} keep climbing`;
  const lagTxt = lagging
    ? `${PILLAR_LABELS[lagging[0]].toLowerCase()} is still the gap`
    : "everything else is holding";
  const weeksWord = numberToWord(trend.length);
  return {
    summary: `Your class moved from ${start} to ${end} over the last ${weeksWord} weeks. ${climbingTxt} — ${lagTxt}.`,
    delta,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function numberToWord(n: number): string {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  return words[n] ?? String(n);
}
