// Class Focus — data + helpers for the Focus tab.
// Derives a class-level attention picture from the existing student mocks
// (PFI, attention sub-domains, monthly check-in series). No new mocks required.

import {
  ATTENTION_DOMAINS,
  DOMAIN_INTERVENTIONS,
  STUDENTS,
  classMonthlyAttention,
  studentAttentionDomains,
  type AttentionDomainKey,
  type Student,
} from "@/data/mockData";
import {
  getBehaviorLogTotalCount,
  getClassCheckInsThisWeek,
  getPositiveLogTotalCount,
} from "@/lib/checkInTools";
import { getFollowUpProgress } from "@/lib/interventionFollowUps";

/* ─────────────────────────────────────────────────────────
 * Focus Snapshot
 * ───────────────────────────────────────────────────────── */

export type FocusStatus = "strong" | "fluctuating" | "at-risk";

export const FOCUS_STATUS_LABEL: Record<FocusStatus, string> = {
  strong: "Strong",
  fluctuating: "Fluctuating",
  "at-risk": "At Risk",
};

export const FOCUS_STATUS_TONE: Record<FocusStatus, string> = {
  strong: "hsl(142 55% 42%)",
  fluctuating: "hsl(38 92% 50%)",
  "at-risk": "hsl(0 78% 56%)",
};

export const FOCUS_STATUS_DESCRIPTION: Record<FocusStatus, string> = {
  strong: "Class is sustaining attention well during learning.",
  fluctuating: "Attention dips often — pacing or breaks may help.",
  "at-risk": "Sustained attention is below benchmark — interventions needed.",
};

export const FOCUS_STATUS_RANGE: Record<FocusStatus, string> = {
  strong: "71–100",
  fluctuating: "40–70",
  "at-risk": "0–39",
};

export function statusFromScore(score: number): FocusStatus {
  if (score > 70) return "strong";
  if (score >= 40) return "fluctuating";
  return "at-risk";
}

export type StaminaBand = "focused" | "fluctuating" | "distracted";

export const STAMINA_LABEL: Record<StaminaBand, string> = {
  focused: "Focused",
  fluctuating: "Fluctuating",
  distracted: "Distracted",
};

export const STAMINA_DESCRIPTION: Record<StaminaBand, string> = {
  focused: "PFI > 70 — staying on task.",
  fluctuating: "PFI 40–70 — attention drifting in and out.",
  distracted: "PFI < 40 — struggling to engage.",
};

export const STAMINA_TONE: Record<StaminaBand, string> = {
  focused: "hsl(142 55% 46%)",
  fluctuating: "hsl(38 92% 55%)",
  distracted: "hsl(0 78% 58%)",
};

export function staminaForPfi(pfi: number): StaminaBand {
  if (pfi > 70) return "focused";
  if (pfi >= 40) return "fluctuating";
  return "distracted";
}

export type StaminaDistribution = Record<StaminaBand, number>;

export type WeekTrendPoint = {
  label: string;
  score: number;
  focused: number;
  fluctuating: number;
  distracted: number;
};

export type MonthTrendPoint = {
  label: string;
  score: number;
  focused: number;
  fluctuating: number;
  distracted: number;
};

export type FocusSnapshot = {
  classScore: number;
  prevClassScore: number;
  delta: number;
  status: FocusStatus;
  total: number;
  distribution: StaminaDistribution;
  weekly: WeekTrendPoint[];
  monthly: MonthTrendPoint[];
};

function distributionFromPfi(pfis: number[]): StaminaDistribution {
  const out: StaminaDistribution = { focused: 0, fluctuating: 0, distracted: 0 };
  for (const p of pfis) out[staminaForPfi(p)] += 1;
  return out;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/**
 * Synth weekly snapshot from each student's 4-week intra-month history. The
 * history weeks are labelled W1…W4 already; we average across the class for
 * each label.
 */
function buildWeekly(students: Student[]): WeekTrendPoint[] {
  const weeks = students[0]?.history?.length ?? 4;
  const labels = students[0]?.history?.map((h) => h.week) ?? ["W1", "W2", "W3", "W4"];
  return Array.from({ length: weeks }, (_, i) => {
    const pfis = students.map((s) => s.history[i]?.pfi ?? s.pfi);
    const score = avg(pfis);
    const dist = distributionFromPfi(pfis);
    return {
      label: labels[i] ?? `W${i + 1}`,
      score,
      focused: dist.focused,
      fluctuating: dist.fluctuating,
      distracted: dist.distracted,
    };
  });
}

/**
 * Build a 6-month trend from the existing class monthly attention series.
 * For each month we estimate the focused/fluctuating/distracted split using
 * each student's monthly series — months with no submission are nulled
 * out at the per-student level and skipped so the bar reflects real cadence.
 */
function buildMonthly(students: Student[]): MonthTrendPoint[] {
  const series = classMonthlyAttention(students);
  return series.map((m, i) => {
    const pfis = students.map((s) => s.monthly[i]).filter((v): v is number => v != null);
    const dist = distributionFromPfi(pfis);
    return {
      label: m.month,
      score: m.attention ?? 0,
      focused: dist.focused,
      fluctuating: dist.fluctuating,
      distracted: dist.distracted,
    };
  });
}

export function classFocusSnapshot(students: Student[] = STUDENTS): FocusSnapshot {
  const total = students.length;
  const classScore = avg(students.map((s) => s.pfi));
  const prevClassScore = avg(students.map((s) => s.pfiPrevCheckIn));
  const distribution = distributionFromPfi(students.map((s) => s.pfi));
  return {
    classScore,
    prevClassScore,
    delta: classScore - prevClassScore,
    status: statusFromScore(classScore),
    total,
    distribution,
    weekly: buildWeekly(students),
    monthly: buildMonthly(students),
  };
}

/* ─────────────────────────────────────────────────────────
 * Class Attention Profile (focus sub-domains only)
 * ───────────────────────────────────────────────────────── */

export type FocusDomainKey = Extract<
  AttentionDomainKey,
  "sus" | "vis" | "aud" | "sel" | "div" | "swi"
>;

export const FOCUS_DOMAIN_ORDER: FocusDomainKey[] = ["sus", "vis", "aud", "sel", "div", "swi"];

export const FOCUS_DOMAIN_LABEL: Record<FocusDomainKey, string> = {
  sus: "Sustained Focus",
  vis: "Visual Focus",
  aud: "Auditory Focus",
  sel: "Selective Focus",
  div: "Divided Focus",
  swi: "Focus Switching",
};

export const FOCUS_DOMAIN_DESCRIPTION: Record<FocusDomainKey, string> = {
  sus: "Staying on task for long periods.",
  vis: "Focusing on reading material and visual instructions.",
  aud: "Listening to instructions and following them accurately.",
  sel: "Focusing despite distractions.",
  div: "Managing multiple tasks at once.",
  swi: "Transitioning smoothly between activities and topics.",
};

export const FOCUS_DOMAIN_HUE: Record<FocusDomainKey, string> = {
  sus: "hsl(142 55% 46%)",
  vis: "hsl(196 75% 50%)",
  aud: "hsl(258 55% 60%)",
  sel: "hsl(38 92% 55%)",
  div: "hsl(286 60% 60%)",
  swi: "hsl(168 62% 42%)",
};

export type FocusDomainStat = {
  key: FocusDomainKey;
  label: string;
  description: string;
  hue: string;
  score: number;
  prevScore: number;
  atRiskCount: number;
  atRiskPct: number;
};

export function classFocusDomains(students: Student[] = STUDENTS): FocusDomainStat[] {
  return FOCUS_DOMAIN_ORDER.map((key) => {
    const meta = ATTENTION_DOMAINS.find((d) => d.key === key)!;
    const scores = students.map((s) => studentAttentionDomains(s)[key]);
    const score = avg(scores);
    const atRiskCount = scores.filter((v) => v < 55).length;
    return {
      key,
      label: FOCUS_DOMAIN_LABEL[key] ?? meta.label,
      description: FOCUS_DOMAIN_DESCRIPTION[key],
      hue: FOCUS_DOMAIN_HUE[key],
      score,
      // Slight backward offset so we can show a real-looking delta without
      // wiring a separate prior series; treats last month as ~3pts lower.
      prevScore: Math.max(0, score - 3),
      atRiskCount,
      atRiskPct: Math.round((atRiskCount / Math.max(1, students.length)) * 100),
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Attention Domain Heatmap (all 8 sub-domains)
 * ───────────────────────────────────────────────────────── */

export type AttentionHeatmapStatus = "high" | "med" | "low";

/** Structurally compatible with FocusDomainStat (a strict subset by key) —
 * AttentionSubDomainDrawer accepts either, since both describe "a domain's
 * score picture," just for a wider vs. narrower set of domains. */
export type AttentionHeatmapStat = {
  key: AttentionDomainKey;
  short: string;
  label: string;
  description: string;
  score: number;
  prevScore: number;
  hue: string;
  status: AttentionHeatmapStatus;
  atRiskCount: number;
  atRiskPct: number;
};

const HEATMAP_HUE: Record<AttentionDomainKey, string> = {
  sus: "hsl(142 55% 46%)",
  vis: "hsl(196 75% 50%)",
  aud: "hsl(258 55% 60%)",
  sel: "hsl(38 92% 55%)",
  div: "hsl(286 60% 60%)",
  swi: "hsl(168 62% 42%)",
  hyp: "hsl(0 70% 55%)",
  beh: "hsl(200 70% 48%)",
};

const HEATMAP_DESCRIPTION: Record<AttentionDomainKey, string> = {
  sus: FOCUS_DOMAIN_DESCRIPTION.sus,
  vis: FOCUS_DOMAIN_DESCRIPTION.vis,
  aud: FOCUS_DOMAIN_DESCRIPTION.aud,
  sel: FOCUS_DOMAIN_DESCRIPTION.sel,
  div: FOCUS_DOMAIN_DESCRIPTION.div,
  swi: FOCUS_DOMAIN_DESCRIPTION.swi,
  hyp: "Staying settled and in-seat during instruction.",
  beh: "Managing impulses and following classroom expectations.",
};

export const ATTENTION_HEATMAP_STATUS_LABEL: Record<AttentionHeatmapStatus, string> = {
  high: "High",
  med: "Med",
  low: "Low",
};

export const ATTENTION_HEATMAP_STATUS_TONE: Record<AttentionHeatmapStatus, string> = {
  high: "hsl(152 55% 45%)",
  med: "hsl(32 92% 52%)",
  low: "hsl(0 78% 58%)",
};

function heatmapStatus(score: number): AttentionHeatmapStatus {
  if (score >= 75) return "high";
  if (score >= 55) return "med";
  return "low";
}

/**
 * All 8 attention/behaviour sub-domains — unlike classFocusDomains() (which
 * deliberately covers only the 6 focus-specific ones), this includes
 * hyp/beh too, since the heatmap is meant to show the whole sub-domain
 * picture rather than just the focus slice used elsewhere on this page.
 */
export function classAttentionHeatmap(students: Student[] = STUDENTS): AttentionHeatmapStat[] {
  return ATTENTION_DOMAINS.map((d) => {
    const scores = students.map((s) => studentAttentionDomains(s)[d.key]);
    const score = avg(scores);
    const atRiskCount = scores.filter((v) => v < 55).length;
    return {
      key: d.key,
      short: d.short,
      label: d.label,
      description: HEATMAP_DESCRIPTION[d.key],
      score,
      prevScore: Math.max(0, score - 3),
      hue: HEATMAP_HUE[d.key],
      status: heatmapStatus(score),
      atRiskCount,
      atRiskPct: Math.round((atRiskCount / Math.max(1, students.length)) * 100),
    };
  });
}

/** Real (if class-wide, not per-domain) engagement volume — total logged
 * behaviour + positive observations spread across the roster — shown on
 * every heatmap card for context on how much data backs these scores. */
export function attentionHeatmapLogsPerStudent(students: Student[] = STUDENTS): number {
  const total = getBehaviorLogTotalCount() + getPositiveLogTotalCount();
  return Math.round((total / Math.max(1, students.length)) * 10) / 10;
}

/* ─────────────────────────────────────────────────────────
 * Time-Based Attention Drop (within-session decline curve)
 * ───────────────────────────────────────────────────────── */

export type AttentionDropPoint = { minute: number; level: number };

/**
 * A within-session attention curve tied to the real "Sustained Focus"
 * sub-domain score — no per-minute data exists in this app, so rather than
 * a fixed illustrative shape, the drop-off point and steepness both scale
 * with the actual sustained-attention score (weaker sustained focus →
 * earlier, steeper decline), so it moves when the underlying data does.
 */
export function attentionDropCurve(
  students: Student[] = STUDENTS,
): { points: AttentionDropPoint[]; dropAtMinute: number } {
  const sustained = classFocusDomains(students).find((d) => d.key === "sus")?.score ?? 70;
  const dropAtMinute = Math.max(10, Math.min(25, Math.round(sustained / 4)));
  const points = [0, 15, 30, 45, 60].map((minute) => {
    const past = Math.max(0, minute - dropAtMinute);
    const level = Math.max(25, 95 - past * 1.6);
    return { minute, level: Math.round(level) };
  });
  return { points, dropAtMinute };
}

/* ─────────────────────────────────────────────────────────
 * Attention Pattern Insights
 * ───────────────────────────────────────────────────────── */

export type AttentionInsightTone = "warning" | "watch" | "info" | "positive";

export type AttentionInsight = {
  id: string;
  title: string;
  detail: string;
  tone: AttentionInsightTone;
  iconKey: "clock" | "ear" | "eye" | "timer" | "shuffle" | "layers" | "spark";
  /** The students this specific pattern is actually about — at-risk students
   * for watch/warning cards, strong performers for positive ones — so "View
   * students" links to a real, relevant subset instead of the whole roster. */
  studentIds: string[];
};

/** Students below the at-risk threshold (or at/above the strong threshold)
 * for a given attention sub-domain. */
function domainStudentIds(
  students: Student[],
  key: FocusDomainKey,
  direction: "at-risk" | "strong",
): string[] {
  return students
    .filter((s) => {
      const score = studentAttentionDomains(s)[key];
      return direction === "at-risk" ? score < 55 : score >= 65;
    })
    .map((s) => s.id);
}

function staminaStudentIds(students: Student[], bands: StaminaBand[]): string[] {
  return students.filter((s) => bands.includes(staminaForPfi(s.pfi))).map((s) => s.id);
}

/**
 * Surface 4–5 plain-language insights drawn from the class focus picture so
 * the teacher gets a 5-second read of *why* the score sits where it does.
 * Each insight is paired to the underlying signal (sub-domain or stamina
 * mix), so the wording stays grounded even when the numbers move.
 */
export function attentionPatternInsights(students: Student[] = STUDENTS): AttentionInsight[] {
  const total = Math.max(1, students.length);
  const domains = classFocusDomains(students);
  const get = (k: FocusDomainKey) => domains.find((d) => d.key === k)!;
  const sustained = get("sus");
  const auditory = get("aud");
  const visual = get("vis");
  const switching = get("swi");
  const divided = get("div");

  const distractedPct = Math.round(
    (students.filter((s) => staminaForPfi(s.pfi) === "distracted").length / total) * 100,
  );
  const fluctuatingPct = Math.round(
    (students.filter((s) => staminaForPfi(s.pfi) === "fluctuating").length / total) * 100,
  );
  const losesFocusPct = Math.max(28, Math.min(60, 100 - sustained.score));
  const delayedStartPct = Math.max(20, Math.min(50, switching.atRiskPct + 10));

  const insights: AttentionInsight[] = [
    {
      id: "stamina-15",
      title: `${losesFocusPct}% of students lose focus after 15 minutes`,
      detail:
        "Sustained attention drops mid-session — consider splitting blocks with a 2-minute reset.",
      tone: losesFocusPct >= 40 ? "warning" : "watch",
      iconKey: "clock",
      studentIds: domainStudentIds(students, "sus", "at-risk"),
    },
    {
      id: "auditory",
      title:
        auditory.score < 65
          ? "High sensitivity to auditory distractions"
          : "Auditory focus is steady",
      detail:
        auditory.score < 65
          ? "Repeated instructions and ambient noise are eroding listening accuracy."
          : "Most students are following spoken instructions on the first pass.",
      tone: auditory.score < 65 ? "warning" : "positive",
      iconKey: "ear",
      studentIds: domainStudentIds(students, "aud", auditory.score < 65 ? "at-risk" : "strong"),
    },
    {
      id: "delayed-init",
      title: `Delayed task initiation for ${delayedStartPct}% of children`,
      detail:
        "Students take longer than expected to begin once instructions end — visual schedules help.",
      tone: delayedStartPct >= 35 ? "warning" : "watch",
      iconKey: "timer",
      studentIds: domainStudentIds(students, "swi", "at-risk"),
    },
    {
      id: "switching",
      title:
        switching.score < 65
          ? "Transitions between activities are costly"
          : "Smooth transitions between activities",
      detail:
        switching.score < 65
          ? "Switching from one task to the next loses ~5 minutes per change. Try 2-min countdowns."
          : "Class is shifting between tasks without losing pace.",
      tone: switching.score < 65 ? "watch" : "positive",
      iconKey: "shuffle",
      studentIds: domainStudentIds(students, "swi", switching.score < 65 ? "at-risk" : "strong"),
    },
    {
      id: "stamina-mix",
      title:
        distractedPct > 0
          ? `${distractedPct}% are distracted, ${fluctuatingPct}% fluctuating`
          : `${fluctuatingPct}% of students fluctuate during learning`,
      detail:
        distractedPct + fluctuatingPct > 50
          ? "Most of the class is drifting in and out. A movement break can restore baseline."
          : "Stamina is mostly healthy — keep current routines and monitor outliers.",
      tone:
        distractedPct + fluctuatingPct > 50
          ? "warning"
          : distractedPct + fluctuatingPct > 30
            ? "watch"
            : "positive",
      iconKey: "layers",
      studentIds: staminaStudentIds(
        students,
        distractedPct + fluctuatingPct > 30 ? ["distracted", "fluctuating"] : ["focused"],
      ),
    },
    {
      id: "visual",
      title:
        visual.score < 65
          ? "Visual instructions need more scaffolding"
          : "Visual focus is a class strength",
      detail:
        visual.score < 65
          ? "Worksheets with dense layouts are losing readers — try larger fonts and color cues."
          : "Reading and visual instruction follow-through is consistent.",
      tone: visual.score < 65 ? "watch" : "positive",
      iconKey: "eye",
      studentIds: domainStudentIds(students, "vis", visual.score < 65 ? "at-risk" : "strong"),
    },
    {
      id: "divided",
      title:
        divided.score < 60
          ? "Multi-step instructions are hard to hold"
          : "Divided attention is holding up",
      detail:
        divided.score < 60
          ? "Multi-step tasks are losing students — break instructions into single steps with a checklist."
          : "Most students are managing 2-step tasks without re-prompting.",
      tone: divided.score < 60 ? "watch" : "positive",
      iconKey: "spark",
      studentIds: domainStudentIds(students, "div", divided.score < 60 ? "at-risk" : "strong"),
    },
  ];

  // Trim to the 5 most informative — drop "positive"-only ones if there are
  // enough actionable cards to fill the strip.
  const actionable = insights.filter((i) => i.tone !== "positive");
  if (actionable.length >= 5) return actionable.slice(0, 5);
  return insights.slice(0, 5);
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — Recommended Actions & Quick Activities
 * ───────────────────────────────────────────────────────── */

export type RecommendedAction = {
  id: string;
  title: string;
  detail: string;
  visual: "timer" | "clock";
  durationLabel: string;
};

/** 2 whole-class habit changes — deliberately few and concrete (matches
 * "simple changes you can try in your next class," not a long backlog). */
export const RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    id: "act-2min-reset",
    title: "Add 2-min reset after 15 mins",
    detail: "Take a short movement or mindfulness break to recharge attention.",
    visual: "timer",
    durationLabel: "2 min",
  },
  {
    id: "act-visual-timer",
    title: "Use visual timer for timed tasks",
    detail: "Helps students pace their work and stay on track.",
    visual: "clock",
    durationLabel: "15:00",
  },
];

export type QuickActivityType = "Movement" | "Discussion" | "Game";

export type QuickActivity = {
  id: string;
  type: QuickActivityType;
  title: string;
  description: string;
  durationMins: number;
  groupSize: string;
  category: string;
  howToPlay: string[];
};

/** A small "Attention Hero" activity library — enough per type (Movement /
 * Discussion / Game) for the tab filter to be meaningfully different, not
 * just cosmetic. Names reuse the same game universe as ALL_GAMES in
 * mockData.ts where it fits, for consistency with the rest of the app. */
export const QUICK_ACTIVITIES: QuickActivity[] = [
  {
    id: "clap-at-7",
    type: "Game",
    title: "Clap at 7",
    description: "Builds focus, working memory and self-control.",
    durationMins: 5,
    groupSize: "Whole class",
    category: "Focus & Memory",
    howToPlay: [
      "Take turns counting numbers aloud (Child: 1, You: 2, Child: 3…).",
      "Clap instead of saying any multiple of 7.",
      "Try one round and track errors.",
      "Discuss a strategy to improve (e.g., silently mouthing numbers, finger tapping to keep rhythm).",
      "Play again and compare performance. Add more rules for extra challenge (e.g., clap at multiples of 5 and 7).",
    ],
  },
  {
    id: "memory-chain",
    type: "Game",
    title: "Memory Chain",
    description: "Builds sustained attention and working memory through a growing list.",
    durationMins: 5,
    groupSize: "Whole class",
    category: "Focus & Memory",
    howToPlay: [
      "First student says one word (e.g., an animal).",
      "The next student repeats it and adds one more.",
      "Continue around the room, repeating the whole growing list each time.",
      "When someone misses, start a new chain with a different theme.",
    ],
  },
  {
    id: "stretch-reset",
    type: "Movement",
    title: "Stretch & Reset",
    description: "A short standing stretch sequence to shake off restlessness.",
    durationMins: 3,
    groupSize: "Whole class",
    category: "Regulation",
    howToPlay: [
      "Everyone stands next to their desk.",
      "Lead 4 simple stretches (reach up, touch toes, twist left/right, shake out arms), 10 seconds each.",
      "Finish with 3 slow breaths together.",
      "Sit back down and begin the next task.",
    ],
  },
  {
    id: "simon-says-focus",
    type: "Movement",
    title: "Simon Says — Focus Edition",
    description: "Classic listening game that rewards careful attention to instructions.",
    durationMins: 5,
    groupSize: "Whole class",
    category: "Auditory Focus",
    howToPlay: [
      "Play a fast round of Simon Says with simple movements.",
      "Only follow instructions that start with \"Simon says\".",
      "Speed up the pace every few rounds.",
      "The last students standing lead the next round.",
    ],
  },
  {
    id: "one-word-checkin",
    type: "Discussion",
    title: "One-Word Check-In",
    description: "A quick round of one-word feelings to re-center attention.",
    durationMins: 4,
    groupSize: "Whole class",
    category: "Self-Awareness",
    howToPlay: [
      "Ask each student to share one word describing how they feel right now.",
      "No explanations needed — just the word.",
      "Go around the room quickly, table by table.",
      "Note any patterns (e.g., several students say \"tired\") to adjust pacing.",
    ],
  },
  {
    id: "would-you-rather",
    type: "Discussion",
    title: "Would You Rather — Quick Round",
    description: "A fast, fun prompt that re-engages wandering attention.",
    durationMins: 3,
    groupSize: "Small group",
    category: "Engagement",
    howToPlay: [
      "Pose a light \"would you rather\" question to the class.",
      "Students vote by raising hands or moving to a side of the room.",
      "Ask 1–2 students to explain their choice.",
      "Transition straight into the next activity while energy is up.",
    ],
  },
];

/** The single most informative pattern insight, surfaced as "based on your
 * top insight" context for Yellow Recommends — same data Component 2
 * already generates, just reused instead of duplicated. */
export function yellowRecommendsTopInsight(students: Student[] = STUDENTS): string {
  return (
    attentionPatternInsights(students)[0]?.title ?? "Keep an eye on class focus this week."
  );
}

/* ─────────────────────────────────────────────────────────
 * Monthly Focus Check-in (MCQ)
 * ───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
 * Data Sources & Confidence
 * ───────────────────────────────────────────────────────── */

export type DataConfidenceLevel = "strong" | "good" | "needs-more-data";

export const DATA_CONFIDENCE_LABEL: Record<DataConfidenceLevel, string> = {
  strong: "Strong",
  good: "Good",
  "needs-more-data": "Needs more data",
};

export const DATA_CONFIDENCE_TONE: Record<DataConfidenceLevel, string> = {
  strong: "hsl(142 55% 45%)",
  good: "hsl(212 90% 58%)",
  "needs-more-data": "hsl(38 92% 50%)",
};

export type DataSourcesSnapshot = {
  gamesActiveStudents: number;
  gamesTotalStudents: number;
  observationCount: number;
  checkInCount: number;
  positiveLogCount: number;
  followUpsCompleted: number;
  followUpsTotal: number;
  confidence: DataConfidenceLevel;
};

/** Pulls together the same real signals already tracked elsewhere in the app
 * (neurogame play, behaviour notes, class check-ins, positive logs, and
 * intervention follow-ups) into one "how much can I trust this page" snapshot.
 * No new mock data — the confidence label is a simple coverage heuristic over
 * these 5 signals, not a fabricated score. */
export function dataSourcesSnapshot(
  teacherName: string,
  students: Student[] = STUDENTS,
): DataSourcesSnapshot {
  const gamesTotalStudents = students.length;
  const gamesActiveStudents = students.filter((s) => s.gamesPlayed > 0).length;
  const observationCount = getBehaviorLogTotalCount();
  const checkInCount = getClassCheckInsThisWeek(teacherName);
  const positiveLogCount = getPositiveLogTotalCount();
  const { completed: followUpsCompleted, total: followUpsTotal } = getFollowUpProgress();

  const signals = [
    gamesTotalStudents > 0 && gamesActiveStudents / gamesTotalStudents >= 0.5,
    observationCount >= 5,
    checkInCount >= 1,
    positiveLogCount >= 3,
    followUpsTotal === 0 || followUpsCompleted / followUpsTotal >= 0.5,
  ];
  const strongSignals = signals.filter(Boolean).length;
  const confidence: DataConfidenceLevel =
    strongSignals >= 4 ? "strong" : strongSignals >= 3 ? "good" : "needs-more-data";

  return {
    gamesActiveStudents,
    gamesTotalStudents,
    observationCount,
    checkInCount,
    positiveLogCount,
    followUpsCompleted,
    followUpsTotal,
    confidence,
  };
}

/* ─────────────────────────────────────────────────────────
 * Students Needing Focus Support
 * ───────────────────────────────────────────────────────── */

export type FocusSupportStatus = "strong" | "watch" | "needs-support";

export const FOCUS_SUPPORT_STATUS_LABEL: Record<FocusSupportStatus, string> = {
  strong: "On Track",
  watch: "Fluctuating",
  "needs-support": "At Risk",
};

export const FOCUS_SUPPORT_STATUS_TONE: Record<FocusSupportStatus, string> = {
  strong: "hsl(142 55% 42%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(0 78% 52%)",
};

/** Short, plain-language reason a sub-domain is a student's weakest —
 * distinct from FOCUS_DOMAIN_DESCRIPTION (which describes what the domain
 * measures in general, not why a specific student is struggling with it). */
export const FOCUS_DOMAIN_WEAKNESS_REASON: Record<FocusDomainKey, string> = {
  sus: "Loses focus after 10–15 minutes",
  vis: "Misses details in visual instructions",
  aud: "High sensitivity to auditory distractions",
  sel: "Easily distracted by classroom noise",
  div: "Struggles to manage multiple tasks at once",
  swi: "Takes longer to shift between tasks",
};

export type FocusSupportRow = {
  student: Student;
  score: number;
  status: FocusSupportStatus;
  trend: number;
  topDomain: FocusDomainKey;
  topDomainLabel: string;
  topDomainScore: number;
  topDomainReason: string;
  evidence: string;
  recommendedActions: string[];
};

/** Students whose overall focus score isn't yet "strong", ranked worst-first,
 * each paired with their single weakest attention sub-domain — the same
 * domain data that powers the sub-domain breakdown above, just re-sliced
 * per student instead of per domain. Pass `includeAll: true` to keep
 * "strong" students in the list too (the class-wide view), instead of only
 * the priority cases. */
export function focusSupportRoster(
  students: Student[] = STUDENTS,
  opts: { includeAll?: boolean } = {},
): FocusSupportRow[] {
  return students
    .map((s) => {
      const overallStatus = statusFromScore(s.pfi);
      const domainScores = studentAttentionDomains(s);
      const topDomain = FOCUS_DOMAIN_ORDER.reduce(
        (weakest, key) => (domainScores[key] < domainScores[weakest] ? key : weakest),
        FOCUS_DOMAIN_ORDER[0],
      );
      const topDomainScore = Math.round(domainScores[topDomain]);
      const topDomainLabel = FOCUS_DOMAIN_LABEL[topDomain];
      if (overallStatus === "strong" && !opts.includeAll) return null;
      return {
        student: s,
        score: Math.round(s.pfi),
        status:
          overallStatus === "at-risk"
            ? ("needs-support" as const)
            : overallStatus === "fluctuating"
              ? ("watch" as const)
              : ("strong" as const),
        trend: Math.round(s.pfi - s.pfiPrevCheckIn),
        topDomain,
        topDomainLabel,
        topDomainScore,
        topDomainReason: FOCUS_DOMAIN_WEAKNESS_REASON[topDomain],
        evidence: `Scored ${topDomainScore}/100 on ${topDomainLabel} — from Attention Hero activity and teacher observations.`,
        recommendedActions: DOMAIN_INTERVENTIONS[topDomain],
      };
    })
    .filter((r): r is FocusSupportRow => r !== null)
    .sort((a, b) => a.score - b.score);
}

/** Best-fit "Attention Hero" activity per sub-domain — reuses the same
 * QUICK_ACTIVITIES library Yellow Recommends already has, so a suggested
 * activity here always links to a real, playable entry there. */
const DOMAIN_SUGGESTED_ACTIVITY: Record<FocusDomainKey, string> = {
  sus: "stretch-reset",
  vis: "clap-at-7",
  aud: "simon-says-focus",
  sel: "one-word-checkin",
  div: "memory-chain",
  swi: "would-you-rather",
};

export function suggestedActivityForDomain(domain: FocusDomainKey): QuickActivity {
  const id = DOMAIN_SUGGESTED_ACTIVITY[domain];
  return QUICK_ACTIVITIES.find((a) => a.id === id) ?? QUICK_ACTIVITIES[0];
}
