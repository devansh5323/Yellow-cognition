// Class Focus — data + helpers for the Attention & Focus tab.
//
// data/realStudents.ts and data/l2ClassroomData.ts provide real per-student
// focus scores, class summary/distribution, current subdomain averages, and
// weekly/monthly trends. The supplied export does not include per-student
// subdomain scores or within-session attention history, so panels that need
// those finer-grained signals still use deterministic demo estimates and
// remain explicitly marked with DemoDataBadge.
//
// The seeded generator mirrors the exact shape/derivation the old
// mock-data-era version used (per-student pfi → 8 attention sub-domains via
// fixed offsets + jitter) so the page's UI/UX carries over unchanged — only
// the input (a seeded hash of the student's real id, not a removed mock
// field) and the "this is demo" labeling are new.

import { STUDENTS, type Student } from "@/data/mockData";
import { L2_CLASSROOM_DATA, type FocusTrendPoint } from "@/data/l2ClassroomData";
import { getBehaviorLogTotalCount, getClassCheckInsThisWeek, getPositiveLogTotalCount } from "@/lib/checkInTools";
import { getFollowUpProgress } from "@/lib/interventionFollowUps";

const FOCUS_DATA = L2_CLASSROOM_DATA.focus;

// Deterministic pseudo-random, seeded — same technique the old mock data
// generator used, so re-derived per-student scores are stable across
// reloads instead of re-randomizing on every render.
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function idSeed(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Each real student's demo "focus base" — stands in for the removed
 * pfi/csi mock fields. Centered in a plausible 40–80 range so the page
 * shows a realistic mix of strong/fluctuating/at-risk demo students rather
 * than everyone clustering at the same score. */
function demoFocusBase(id: string): number {
  const seed = idSeed(id);
  return clamp(60 + (rand(seed) - 0.5) * 40);
}

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
  fluctuating: "hsl(38 92% 48%)",
  "at-risk": "hsl(0 78% 55%)",
};

export const FOCUS_STATUS_DESCRIPTION: Record<FocusStatus, string> = {
  strong: "Consistently attentive across sessions.",
  fluctuating: "Attention varies session to session.",
  "at-risk": "Struggling to maintain attention.",
};

export const FOCUS_STATUS_RANGE: Record<FocusStatus, string> = {
  strong: "Score 70+",
  fluctuating: "Score 40–70",
  "at-risk": "Score below 40",
};

export function statusFromScore(score: number): FocusStatus {
  if (score >= 70) return "strong";
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
  focused: "Sustaining attention well through sessions.",
  fluctuating: "Attention dips in and out.",
  distracted: "Struggling to engage for most of the session.",
};

export const STAMINA_TONE: Record<StaminaBand, string> = {
  focused: "hsl(142 55% 42%)",
  fluctuating: "hsl(38 92% 48%)",
  distracted: "hsl(0 78% 55%)",
};

export function staminaForPfi(pfi: number): StaminaBand {
  if (pfi > 70) return "focused";
  if (pfi >= 40) return "fluctuating";
  return "distracted";
}

export type StaminaDistribution = Record<StaminaBand, number>;

export type WeekTrendPoint = {
  label: string;
  score: number | null;
};

export type MonthTrendPoint = {
  label: string;
  score: number | null;
};

export type FocusSnapshot = {
  classScore: number;
  prevClassScore: number;
  delta: number;
  status: FocusStatus;
  total: number;
  distribution: StaminaDistribution;
  previousDistribution: StaminaDistribution;
  weekly: WeekTrendPoint[];
  monthly: MonthTrendPoint[];
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function focusTrendPoints(rows: readonly FocusTrendPoint[], period: "Weekly" | "Monthly"): WeekTrendPoint[] {
  return rows.map((row, index) => ({
    label:
      period === "Monthly"
        ? (MONTH_SHORT[Number(row.startDate.split("-")[1]) - 1] ?? row.startDate)
        : `W${index + 1}`,
    score: row.averageScore,
  }));
}

export function classFocusSnapshot(students: Student[] = STUDENTS): FocusSnapshot {
  const { classSummary, distribution: sourceDistribution } = FOCUS_DATA;
  const distribution: StaminaDistribution = {
    focused: sourceDistribution.current.focussed,
    fluctuating: sourceDistribution.current.fluctuating,
    distracted: sourceDistribution.current.distracted,
  };
  const previousDistribution: StaminaDistribution = {
    focused: sourceDistribution.previous.focussed,
    fluctuating: sourceDistribution.previous.fluctuating,
    distracted: sourceDistribution.previous.distracted,
  };
  const total = distribution.focused + distribution.fluctuating + distribution.distracted || students.length;
  const classScore = classSummary.currentScore;
  const prevClassScore = classSummary.previousScore;
  return {
    classScore,
    prevClassScore,
    delta: Math.round((classScore - prevClassScore) * 10) / 10,
    status: statusFromScore(classScore),
    total,
    distribution,
    previousDistribution,
    weekly: focusTrendPoints(FOCUS_DATA.weekly, "Weekly"),
    monthly: focusTrendPoints(FOCUS_DATA.monthly, "Monthly"),
  };
}

/* ─────────────────────────────────────────────────────────
 * Class Attention Profile (focus sub-domains only)
 * ───────────────────────────────────────────────────────── */

export type AttentionDomainKey = "sus" | "sel" | "vis" | "aud" | "div" | "swi" | "hyp" | "beh";

const ATTENTION_DOMAINS: { key: AttentionDomainKey; label: string }[] = [
  { key: "sus", label: "Sustained Attention" },
  { key: "sel", label: "Selective Attention" },
  { key: "vis", label: "Visual Attention" },
  { key: "aud", label: "Auditory Attention" },
  { key: "div", label: "Divided Attention" },
  { key: "swi", label: "Attention Switching" },
  { key: "hyp", label: "Impulse Control" },
  { key: "beh", label: "Behavioral Regulation" },
];

export type AttentionDomainScores = Record<AttentionDomainKey, number>;

/** Deterministic per-student 8-domain demo scores derived from the seeded
 * focus base above — same offset/jitter shape the old mock generator used. */
export function studentAttentionDomains(s: Student): AttentionDomainScores {
  const seed = idSeed(s.id);
  const base = demoFocusBase(s.id);
  const offsets = [0, -4, 6, -7, 3, -2, -10, 5];
  const out = {} as AttentionDomainScores;
  ATTENTION_DOMAINS.forEach((d, i) => {
    const j = (rand((seed + i) * 3) - 0.5) * 12;
    out[d.key] = clamp(base + offsets[i] + j);
  });
  return out;
}

export type FocusDomainKey = Extract<AttentionDomainKey, "sus" | "vis" | "aud" | "sel" | "div" | "swi">;

export const FOCUS_DOMAIN_ORDER: FocusDomainKey[] = ["sus", "vis", "aud", "sel", "div", "swi"];

export const FOCUS_DOMAIN_LABEL: Record<FocusDomainKey, string> = {
  sus: "Sustained Attention",
  vis: "Visual Attention",
  aud: "Auditory Attention",
  sel: "Selective Attention",
  div: "Divided Attention",
  swi: "Attention Switching",
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
  hasTrendData: boolean;
  atRiskCount: number;
  atRiskPct: number;
};

export function classFocusDomains(students: Student[] = STUDENTS): FocusDomainStat[] {
  const heatmap = classAttentionHeatmap(students);
  return FOCUS_DOMAIN_ORDER.map((key) => {
    const domain = heatmap.find((item) => item.key === key)!;
    return {
      key,
      label: FOCUS_DOMAIN_LABEL[key],
      description: FOCUS_DOMAIN_DESCRIPTION[key],
      hue: FOCUS_DOMAIN_HUE[key],
      score: domain.score,
      prevScore: domain.prevScore,
      hasTrendData: domain.hasTrendData,
      atRiskCount: domain.atRiskCount,
      atRiskPct: domain.atRiskPct,
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
  label: string;
  description: string;
  score: number;
  prevScore: number;
  hasTrendData: boolean;
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

const L2_SUBDOMAIN_KEY: Record<AttentionDomainKey, string> = {
  sus: "sustainedAttention",
  vis: "visualAttention",
  aud: "auditoryAttention",
  sel: "selectiveAttention",
  div: "dividedAttention",
  swi: "attentionSwitching",
  hyp: "impulseControl",
  beh: "emotionalRegulation",
};

export const ATTENTION_HEATMAP_STATUS_LABEL: Record<AttentionHeatmapStatus, string> = {
  high: "High",
  med: "Medium",
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

/** All 8 attention/behaviour sub-domains — unlike classFocusDomains() (which
 * deliberately covers only the 6 focus-specific ones), this includes
 * hyp/beh too, for the heatmap's fuller picture. */
export function classAttentionHeatmap(students: Student[] = STUDENTS): AttentionHeatmapStat[] {
  return ATTENTION_DOMAINS.map((d) => {
    const scores = students.map((s) => studentAttentionDomains(s)[d.key]);
    const supplied = FOCUS_DATA.subdomains.find((item) => item.key === L2_SUBDOMAIN_KEY[d.key]);
    const score = supplied?.averageScore ?? avg(scores);
    const atRiskCount = scores.filter((v) => v < 55).length;
    return {
      key: d.key,
      label: d.label,
      description: HEATMAP_DESCRIPTION[d.key],
      score,
      // The PDF supplies current subdomain averages only. Keep the baseline
      // neutral instead of inventing a historical movement.
      prevScore: score,
      hasTrendData: false,
      hue: HEATMAP_HUE[d.key],
      status: supplied?.status.toLowerCase() === "med" ? "med" : heatmapStatus(score),
      atRiskCount,
      atRiskPct: Math.round((atRiskCount / Math.max(1, students.length)) * 100),
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Time-Based Attention Drop (within-session decline curve)
 * ───────────────────────────────────────────────────────── */

export type AttentionDropPoint = { minute: number; level: number };

export function attentionDropCurve(students: Student[] = STUDENTS): { points: AttentionDropPoint[]; dropAtMinute: number } {
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
  studentIds: string[];
};

function domainStudentIds(students: Student[], key: FocusDomainKey, direction: "at-risk" | "strong"): string[] {
  return students
    .filter((s) => {
      const score = studentAttentionDomains(s)[key];
      return direction === "at-risk" ? score < 55 : score >= 65;
    })
    .map((s) => s.id);
}

function staminaStudentIds(students: Student[], bands: StaminaBand[]): string[] {
  return students.filter((s) => bands.includes(staminaForPfi(demoFocusBase(s.id)))).map((s) => s.id);
}

export function attentionPatternInsights(students: Student[] = STUDENTS): AttentionInsight[] {
  const total = Math.max(1, students.length);
  const domains = classFocusDomains(students);
  const get = (k: FocusDomainKey) => domains.find((d) => d.key === k)!;
  const auditory = get("aud");
  const visual = get("vis");
  const switching = get("swi");
  const divided = get("div");

  const distractedPct = Math.round(
    (students.filter((s) => staminaForPfi(demoFocusBase(s.id)) === "distracted").length / total) * 100,
  );
  const fluctuatingPct = Math.round(
    (students.filter((s) => staminaForPfi(demoFocusBase(s.id)) === "fluctuating").length / total) * 100,
  );
  // const losesFocusPct = Math.max(28, Math.min(60, 100 - sustained.score));
  const delayedStartPct = Math.max(20, Math.min(50, switching.atRiskPct + 10));

  const insights: AttentionInsight[] = [
    {
      id: "stamina-longer-task",
      title: "52.4% of students lose focus during longer tasks",
      detail:
        "Break longer activities into smaller stages & use brief attention checks at regular intervals",
      tone: "warning",
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
      studentIds: domainStudentIds(
        students,
        "aud",
        auditory.score < 65 ? "at-risk" : "strong",
      ),
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
      studentIds: domainStudentIds(
        students,
        "swi",
        switching.score < 65 ? "at-risk" : "strong",
      ),
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
        distractedPct + fluctuatingPct > 30
          ? ["distracted", "fluctuating"]
          : ["focused"],
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
      studentIds: domainStudentIds(
        students,
        "vis",
        visual.score < 65 ? "at-risk" : "strong",
      ),
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
      studentIds: domainStudentIds(
        students,
        "div",
        divided.score < 60 ? "at-risk" : "strong",
      ),
    },
  ];

  const actionable = insights.filter((i) => i.tone !== "positive");
  if (actionable.length >= 5) return actionable.slice(0, 5);
  return insights.slice(0, 5);
}

/* ─────────────────────────────────────────────────────────
 * Yellow Recommends — Recommended Actions & Quick Activities
 * (static content, not derived from student data — real either way)
 * ───────────────────────────────────────────────────────── */

export type RecommendedAction = {
  id: string;
  title: string;
  detail: string;
  visual: "timer" | "clock";
  durationLabel: string;
};

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
    category: "Auditory Attention",
    howToPlay: [
      "Play a fast round of Simon Says with simple movements.",
      'Only follow instructions that start with "Simon says".',
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
      'Note any patterns (e.g., several students say "tired") to adjust pacing.',
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
      'Pose a light "would you rather" question to the class.',
      "Students vote by raising hands or moving to a side of the room.",
      "Ask 1–2 students to explain their choice.",
      "Transition straight into the next activity while energy is up.",
    ],
  },
];

export function yellowRecommendsTopInsight(students: Student[] = STUDENTS): string {
  return attentionPatternInsights(students)[0]?.title ?? "Keep an eye on class focus this week.";
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

export const FOCUS_DOMAIN_WEAKNESS_REASON: Record<FocusDomainKey, string> = {
  sus: "Loses focus after 10–15 minutes",
  vis: "Misses details in visual instructions",
  aud: "High sensitivity to auditory distractions",
  sel: "Easily distracted by classroom noise",
  div: "Struggles to manage multiple tasks at once",
  swi: "Takes longer to shift between tasks",
};

/** Recommended interventions per attention/behaviour domain — static
 * content, covers all 8 AttentionDomainKey values (the 6 focus domains plus
 * hyp/beh, which the heatmap shows but the 6-domain FocusSupportRow never
 * indexes into). */
export const DOMAIN_INTERVENTIONS: Record<AttentionDomainKey, string[]> = {
  sus: ["Use 10-15 minute focus blocks", "Add a 2-minute movement reset", "Give one clear goal for each work block"],
  sel: ["Seat away from noisy clusters", "Use a quiet attention cue before instructions", "Show one active question area at a time"],
  vis: ["Pair instructions with a visual checklist", "Use color cues for the next step", "Reduce clutter on worksheets or slides"],
  aud: ["Ask the student to repeat directions back", "Pair spoken instructions with a written cue", "Move closer during direct instruction"],
  div: ["Break multi-step work into one step at a time", "Use a checklist students can tick off", "Pause before adding the next instruction"],
  swi: ["Give a 2-minute transition warning", "Use a visual schedule on the desk or board", "Start the next task with a first-step prompt"],
  hyp: ["Plan short movement breaks", "Use a structured fidget during listening time", "Practice a quick impulse-control routine"],
  beh: ["Use a calm-down routine before returning to work", "Add a daily self-regulation check-in", "Provide a quiet reset spot when needed"],
};

/** Students whose demo score in a given attention/behaviour domain is below
 * 55 (at-risk for that domain), worst-first. */
export function studentsByAttentionDomain(domainKey: AttentionDomainKey, students: Student[] = STUDENTS): Student[] {
  return students
    .map((s) => ({ s, v: studentAttentionDomains(s)[domainKey] }))
    .filter((x) => x.v < 55)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}

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

export function focusSupportRoster(
  students: Student[] = STUDENTS,
  opts: { includeAll?: boolean } = {},
): FocusSupportRow[] {
  return students
    .map((s) => {
      const growth = FOCUS_DATA.studentGrowth.find((item) => item.userId === s.id);
      if (!growth) return null;
      const pfi = growth.currentScore;
      const overallStatus = statusFromScore(pfi);
      const domainScores = studentAttentionDomains(s);
      const topDomain = FOCUS_DOMAIN_ORDER.reduce(
        (weakest, key) => (domainScores[key] < domainScores[weakest] ? key : weakest),
        FOCUS_DOMAIN_ORDER[0],
      );
      const topDomainScore = Math.round(domainScores[topDomain] * 10) / 10;
      const topDomainLabel = FOCUS_DOMAIN_LABEL[topDomain];
      if (overallStatus === "strong" && !opts.includeAll) return null;
      return {
        student: s,
        score: Math.round(pfi * 10) / 10,
        status:
          overallStatus === "at-risk" ? ("needs-support" as const) : overallStatus === "fluctuating" ? ("watch" as const) : ("strong" as const),
        trend: growth.growthPct,
        topDomain,
        topDomainLabel,
        topDomainScore,
        topDomainReason: FOCUS_DOMAIN_WEAKNESS_REASON[topDomain],
        evidence: `Current focus score ${pfi.toFixed(1)}/100 (${growth.growthPct >= 0 ? "+" : ""}${growth.growthPct.toFixed(1)}% growth). ${topDomainLabel} remains a demo estimate until per-student domain data is available.`,
        recommendedActions: DOMAIN_INTERVENTIONS[topDomain],
      };
    })
    .filter((r): r is FocusSupportRow => r !== null)
    .sort((a, b) => a.score - b.score);
}

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

/* ─────────────────────────────────────────────────────────
 * Data Sources & Confidence — genuinely REAL, not demo. Shared by
 * components/dashboard/DataSourcesConfidence.tsx (used on both this page
 * and /behavior) and BehaviorDriverCards.tsx. Pulls together real signals
 * already tracked elsewhere in the app (behaviour notes, class check-ins,
 * positive logs, intervention follow-ups) into one "how much can I trust
 * this page" snapshot — the confidence label is a coverage heuristic over
 * these real counts, not a fabricated score.
 * ───────────────────────────────────────────────────────── */

export type DataConfidenceLevel = "good" | "average" | "needs-more-data";

export const DATA_CONFIDENCE_LABEL: Record<DataConfidenceLevel, string> = {
  good: "Good",
  average: "Average",
  "needs-more-data": "Needs more data",
};

export const DATA_CONFIDENCE_TONE: Record<DataConfidenceLevel, string> = {
  good: "hsl(142 55% 45%)",
  average: "hsl(212 90% 58%)",
  "needs-more-data": "hsl(38 92% 50%)",
};

export type DataSourcesSnapshot = {
  observationCount: number;
  checkInCount: number;
  positiveLogCount: number;
  followUpsCompleted: number;
  followUpsTotal: number;
  confidence: DataConfidenceLevel;
};

export function dataSourcesSnapshot(teacherName: string): DataSourcesSnapshot {
  const observationCount = getBehaviorLogTotalCount();
  const checkInCount = getClassCheckInsThisWeek(teacherName);
  const positiveLogCount = getPositiveLogTotalCount();
  const { completed: followUpsCompleted, total: followUpsTotal } = getFollowUpProgress();

  const signals = [
    observationCount >= 5,
    checkInCount >= 1,
    positiveLogCount >= 3,
    followUpsTotal === 0 || followUpsCompleted / followUpsTotal >= 0.5,
  ];
  const strongSignals = signals.filter(Boolean).length;
  const confidence: DataConfidenceLevel = strongSignals >= 3 ? "good" : strongSignals >= 1 ? "average" : "needs-more-data";

  return { observationCount, checkInCount, positiveLogCount, followUpsCompleted, followUpsTotal, confidence };
}
