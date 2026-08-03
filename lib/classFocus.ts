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
 * Yellow Recommends — Focus
 * ───────────────────────────────────────────────────────── */

export type FocusRecommendKind = "Whole Class" | "Small Group" | "Hero Activity";

export type FocusRecommendation = {
  id: string;
  title: string;
  rationale: string;
  kind: FocusRecommendKind;
  durationMins: number;
  /** Sub-domains the activity targets. */
  targets: FocusDomainKey[];
};

const HERO_ACTIVITIES: FocusRecommendation[] = [
  {
    id: "hero-lighthouse",
    title: "Run the Lighthouse focus drill (10 min)",
    rationale: "Builds sustained attention through a single-channel timed challenge.",
    kind: "Hero Activity",
    durationMins: 10,
    targets: ["sus", "sel"],
  },
  {
    id: "hero-echo",
    title: "Echo: repeat-back instruction game",
    rationale: "Trains auditory focus and reduces 'please repeat' moments in class.",
    kind: "Hero Activity",
    durationMins: 8,
    targets: ["aud", "sel"],
  },
  {
    id: "hero-spotter",
    title: "Spotter visual-search sprint",
    rationale: "Sharpens visual attention with a fast, low-stakes warm-up.",
    kind: "Hero Activity",
    durationMins: 6,
    targets: ["vis", "sel"],
  },
  {
    id: "hero-task-switch",
    title: "Task-Switch ramp (3 levels)",
    rationale: "Rehearses smooth transitions between activity types.",
    kind: "Hero Activity",
    durationMins: 9,
    targets: ["swi", "div"],
  },
];

const CLASSROOM_ACTIONS: FocusRecommendation[] = [
  {
    id: "act-pomodoro",
    title: "Run a 15/3 focus block before breaks",
    rationale: "Most students lose focus after 15 minutes — short resets restore baseline.",
    kind: "Whole Class",
    durationMins: 18,
    targets: ["sus"],
  },
  {
    id: "act-2min-warning",
    title: "Use a 2-minute transition warning",
    rationale: "Reduces lost minutes between activities and supports switching.",
    kind: "Whole Class",
    durationMins: 2,
    targets: ["swi"],
  },
  {
    id: "act-front-row",
    title: "Front-row seating for 4 students this week",
    rationale: "Shields the most distractible students from peripheral noise.",
    kind: "Small Group",
    durationMins: 0,
    targets: ["sel", "aud"],
  },
  {
    id: "act-checklist",
    title: "Single-step checklists on multi-step work",
    rationale: "Helps divided-attention strugglers hold the sequence.",
    kind: "Small Group",
    durationMins: 0,
    targets: ["div"],
  },
];

export function pickFocusRecommendations(
  domains: FocusDomainStat[],
  count = 5,
): FocusRecommendation[] {
  const ranked = [...domains].sort((a, b) => a.score - b.score);
  const weakest = new Set(ranked.slice(0, 3).map((d) => d.key));

  // Pick the hero activities that hit a weak sub-domain first…
  const heroes = HERO_ACTIVITIES.filter((h) => h.targets.some((t) => weakest.has(t)));
  // …and the same for classroom actions.
  const actions = CLASSROOM_ACTIONS.filter((a) => a.targets.some((t) => weakest.has(t)));

  // Interleave so the strip alternates between actions and heroes.
  const ordered: FocusRecommendation[] = [];
  const pool = [...actions, ...heroes];
  const seen = new Set<string>();
  for (const r of pool) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    ordered.push(r);
    if (ordered.length >= count) break;
  }
  // Fall back to the full list if filtering left too few items.
  if (ordered.length < count) {
    for (const r of [...HERO_ACTIVITIES, ...CLASSROOM_ACTIONS]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      ordered.push(r);
      if (ordered.length >= count) break;
    }
  }
  return ordered;
}

/* ─────────────────────────────────────────────────────────
 * Monthly Focus Check-in (MCQ)
 * ───────────────────────────────────────────────────────── */

export type FocusCheckInOption = {
  id: string;
  label: string;
  /** -2 (worst) … +2 (best) — used to derive a friction read on submit. */
  weight: number;
};

export type FocusCheckInQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: FocusCheckInOption[];
};

/**
 * 8 monthly MCQs. Single-select per question. Designed to be completable in
 * under 90 seconds — captures classroom-friction signal that the daily
 * gameplay/PFI feed cannot see.
 */
export const FOCUS_CHECKIN_QUESTIONS: FocusCheckInQuestion[] = [
  {
    id: "sustain",
    prompt: "On average, how long does the class sustain attention during direct instruction?",
    options: [
      { id: "lt5", label: "Under 5 min", weight: -2 },
      { id: "5to10", label: "5–10 min", weight: -1 },
      { id: "10to15", label: "10–15 min", weight: 0 },
      { id: "15to25", label: "15–25 min", weight: 1 },
      { id: "gt25", label: "25 min+", weight: 2 },
    ],
  },
  {
    id: "drift",
    prompt: "When attention drifts, what is the most common trigger?",
    options: [
      { id: "noise", label: "Ambient noise / chatter", weight: -1 },
      { id: "peers", label: "Peer distraction", weight: -1 },
      { id: "task", label: "Task is too hard", weight: -2 },
      { id: "boring", label: "Task feels repetitive", weight: 0 },
      { id: "rare", label: "Rarely drifts", weight: 2 },
    ],
  },
  {
    id: "instruction",
    prompt: "How often do you need to repeat verbal instructions?",
    options: [
      { id: "always", label: "Every time", weight: -2 },
      { id: "often", label: "Most lessons", weight: -1 },
      { id: "some", label: "Sometimes", weight: 0 },
      { id: "rare", label: "Rarely", weight: 1 },
      { id: "never", label: "Almost never", weight: 2 },
    ],
  },
  {
    id: "transitions",
    prompt: "How smoothly does the class move between activities?",
    options: [
      { id: "chaotic", label: "Chaotic — 5+ min lost", weight: -2 },
      { id: "slow", label: "Slow — 3–5 min lost", weight: -1 },
      { id: "ok", label: "Acceptable — under 3 min", weight: 0 },
      { id: "fast", label: "Quick — under 1 min", weight: 2 },
    ],
  },
  {
    id: "multi-step",
    prompt: "When given a 3-step instruction, what share of the class executes all 3 steps?",
    options: [
      { id: "lt25", label: "Under 25%", weight: -2 },
      { id: "25to50", label: "25–50%", weight: -1 },
      { id: "50to75", label: "50–75%", weight: 0 },
      { id: "gt75", label: "Over 75%", weight: 2 },
    ],
  },
  {
    id: "visual",
    prompt: "How well does the class follow written / visual instructions on a worksheet?",
    options: [
      { id: "poor", label: "Most need 1:1 prompting", weight: -2 },
      { id: "mixed", label: "Half struggle without help", weight: -1 },
      { id: "ok", label: "Most follow with light cueing", weight: 0 },
      { id: "strong", label: "Independently follows", weight: 2 },
    ],
  },
  {
    id: "initiation",
    prompt: "After instructions end, how quickly does the class start the task?",
    options: [
      { id: "long", label: "More than 2 min", weight: -2 },
      { id: "1to2", label: "1–2 min", weight: -1 },
      { id: "30to60", label: "30–60 sec", weight: 0 },
      { id: "lt30", label: "Under 30 sec", weight: 2 },
    ],
  },
  {
    id: "regulation",
    prompt: "What share of students need a redirect or movement break in a typical class?",
    options: [
      { id: "many", label: "More than 5", weight: -2 },
      { id: "few", label: "3–5", weight: -1 },
      { id: "couple", label: "1–2", weight: 0 },
      { id: "none", label: "None", weight: 2 },
    ],
  },
];

export function focusCheckInFrictionScore(answers: Record<string, string>): {
  score: number;
  max: number;
  pct: number;
} {
  let weighted = 0;
  let max = 0;
  for (const q of FOCUS_CHECKIN_QUESTIONS) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    const best = Math.max(...q.options.map((o) => o.weight));
    max += best;
    if (opt) weighted += opt.weight;
  }
  // Re-base from −2…+2 to 0…100 so the badge reads as "% friction-free".
  const range = max + 2 * FOCUS_CHECKIN_QUESTIONS.length;
  const offset = weighted + 2 * FOCUS_CHECKIN_QUESTIONS.length;
  const pct = Math.round((offset / Math.max(1, range)) * 100);
  return { score: weighted, max, pct };
}

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

export type FocusSupportStatus = "watch" | "needs-support";

export const FOCUS_SUPPORT_STATUS_LABEL: Record<FocusSupportStatus, string> = {
  watch: "Watch",
  "needs-support": "Needs Support",
};

export const FOCUS_SUPPORT_STATUS_TONE: Record<FocusSupportStatus, string> = {
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
 * per student instead of per domain. */
export function focusSupportRoster(students: Student[] = STUDENTS): FocusSupportRow[] {
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
      if (overallStatus === "strong") return null;
      return {
        student: s,
        score: Math.round(s.pfi),
        status: overallStatus === "at-risk" ? ("needs-support" as const) : ("watch" as const),
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
