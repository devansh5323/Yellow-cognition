// School-leader KPI model.
// Three composite KPIs roll up the school's outcomes — Recovered Instructional
// Time (RIT), Teacher Efficiency Index (TEI), and Learning Readiness Score (LRS).
// Each KPI carries three sub-metrics that explain how the score is built.
// All numbers are deterministic mocks; replace with real data when the
// backend is ready — the shape stays the same.

export type KpiId = "rit" | "tei" | "lrs";

export type KpiStatus =
  | "high-gain"
  | "improving"
  | "strong"
  | "stable"
  | "building"
  | "at-risk"
  | "needs-support";

export type BreakdownDim = "class" | "subject" | "teacher";

export type BreakdownEntry = {
  /** Short name shown to the user, e.g. "Class 6", "Science", "Ms. Anjali R." */
  name: string;
  /** Optional secondary line, e.g. "Grade 6 · 31 students" */
  meta?: string;
  /** Display value, e.g. "33", "+6.8 min", "94%". */
  value: string;
};

export type SubMetricBreakdown = Record<
  BreakdownDim,
  { best: BreakdownEntry; worst: BreakdownEntry }
>;

/** Names of small lucide-style icons that can decorate a sub-metric card. */
export type SubMetricIcon = "wave" | "swap" | "shield" | "scale" | "star" | "play" | "rotate";

/** Bespoke visualization rendered at the bottom of a sub-metric card. */
export type SubMetricViz =
  | {
      kind: "components";
      /** Stacked horizontal bar — segments must sum to 100. */
      items: { label: string; pct: number; tone: string }[];
    }
  | {
      kind: "phases";
      /** Up to 3 phase tiles, each with its own icon and percentage. */
      items: {
        label: string;
        icon: SubMetricIcon;
        pct: number;
        tone: string;
      }[];
    }
  | {
      kind: "compare";
      baseline: number;
      now: number;
      unit: string;
      /** Optional override for the headline value (e.g., "-31%"). */
      valueDisplay?: string;
      /** Pretty line like "3.2 → 2.2 disruptions/class". */
      summaryLine?: string;
    };

export type SubMetric = {
  id: string;
  label: string;
  description: string;
  /** 0–100 unless `unit` says otherwise. */
  value: number;
  unit?: string;
  delta: number;
  /** When true, a *negative* delta is the better direction. */
  negativeIsGood?: boolean;
  spark: number[];
  /** Optional band breakdown — used by composite metrics like LRS. */
  bands?: { label: string; pct: number; tone: string }[];
  /** Custom status label shown in the top-right pill (e.g. "Moderate friction"). */
  statusLabel?: string;
  /** Tone for the status pill — defaults to neutral if not set. */
  statusTone?: string;
  /** Short caption under the value, e.g. "Friction down by 24% this month". */
  deltaText?: string;
  /** Drilldown best/worst slices by class · subject · teacher. */
  breakdown?: SubMetricBreakdown;
  /** Small muted line right under the score (e.g. "Lower is better"). */
  caption?: string;
  /** Icon shown next to the sub-metric title. */
  headerIcon?: SubMetricIcon;
  /** Icon shown inside the status pill. */
  statusIcon?: SubMetricIcon;
  /** Bespoke bottom-of-card visualization. */
  viz?: SubMetricViz;
};

/**
 * One headline highlight (best or needs-attention) for the KPI as a whole,
 * scoped to a single breakdown dimension (class · subject · teacher).
 */
export type KpiDimensionalHighlight = {
  /** Short name shown to the user, e.g. "Class 6", "Math", "Mr. K. Verma". */
  name: string;
  /** Optional secondary line, e.g. "Grade 6 · 31 students". */
  meta?: string;
  /** Headline value at this slice, in the KPI's own unit (e.g. "+9.4"). */
  value: string;
  /** Smaller unit suffix paired with `value` (e.g. "min / class", "/ 100"). */
  unit: string;
  /** Delta vs baseline at this slice (signed integer; meaning matches the KPI). */
  delta: number;
  /** Trailing copy after the delta, e.g. "vs baseline", "this term". */
  deltaLabel: string;
  /** One-liner explaining what's driving the result for this slice. */
  reason: string;
};

export type KpiDimensionalHighlights = Record<
  BreakdownDim,
  { best: KpiDimensionalHighlight; worst: KpiDimensionalHighlight }
>;

export type SchoolKpi = {
  id: KpiId;
  title: string;
  meaning: string;
  /** Headline value (e.g. "+6.8" or "74"). */
  value: number;
  /** Suffix appended in a smaller weight (e.g. "min/class", "/100"). */
  unit: string;
  status: KpiStatus;
  delta: number;
  /** "vs baseline", "this term", etc. */
  deltaLabel: string;
  spark: number[];
  /** Display-only, used in cards. */
  band?: string;
  /** Optional readiness-band breakdown shown in the summary card. */
  bands?: { label: string; pct: number; tone: string }[];
  tone: string;
  subMetrics: SubMetric[];
  /** Top-performing and needs-attention slices, per dimension. */
  dimensionalHighlights: KpiDimensionalHighlights;
};

export const STATUS_COPY: Record<KpiStatus, string> = {
  "high-gain": "High Gain",
  improving: "Improving",
  strong: "Strong",
  stable: "Stable",
  building: "Building",
  "at-risk": "At Risk",
  "needs-support": "Needs Support",
};

export const STATUS_TONE: Record<KpiStatus, string> = {
  "high-gain": "hsl(142 55% 45%)",
  improving: "hsl(142 55% 45%)",
  strong: "hsl(142 55% 45%)",
  stable: "hsl(200 60% 50%)",
  building: "hsl(38 92% 55%)",
  "at-risk": "hsl(0 78% 58%)",
  "needs-support": "hsl(0 78% 58%)",
};

export type SchoolContext = {
  scope: string;
  term: string;
  students: number;
  teachers: number;
  classrooms: number;
  /** Share of students with active Yellow coverage (0–100). */
  activeCoveragePct: number;
  /** ISO timestamp of the last KPI refresh. */
  lastUpdated: string;
  /** Cadence at which KPIs refresh. */
  refreshCadence: string;
};

export const SCHOOL_CONTEXT: SchoolContext = {
  scope: "Whole School",
  term: "Term 2",
  students: 1284,
  teachers: 74,
  classrooms: 312,
  activeCoveragePct: 92,
  lastUpdated: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  refreshCadence: "Refreshes every 6 hours",
};

// ─── Filters ────────────────────────────────────────────────────────────────

export type FilterKey = "timePeriod" | "gradeBand" | "section" | "subject" | "teacherGroup";

export type FilterDef = {
  key: FilterKey;
  label: string;
  options: string[];
};

export const FILTERS: FilterDef[] = [
  {
    key: "timePeriod",
    label: "Time period",
    options: ["This week", "This month", "This term", "Year to date"],
  },
  {
    key: "gradeBand",
    label: "Grade band",
    options: ["All grades", "K–2", "3–5", "6–8", "9–12"],
  },
  {
    key: "section",
    label: "Section",
    options: ["All sections", "Primary", "Middle", "Secondary"],
  },
  {
    key: "subject",
    label: "Subject",
    options: ["All subjects", "Math", "ELA", "Science", "Social Studies"],
  },
  {
    key: "teacherGroup",
    label: "Teacher group",
    options: ["All teachers", "Lead teachers", "New teachers", "Coaches"],
  },
];

export const DEFAULT_FILTERS: Record<FilterKey, string> = {
  timePeriod: "This term",
  gradeBand: "All grades",
  section: "All sections",
  subject: "All subjects",
  teacherGroup: "All teachers",
};

// ─── Sparkline shape ────────────────────────────────────────────────────────

function spark(start: number, end: number, jitterSeed = 1, length = 10): number[] {
  const NOISE = [0, 1.4, -1.1, 0.7, -0.6, 1.0, -0.4, 0.3, 0.8, -0.9];
  const span = Math.max(1, Math.abs(end - start));
  const step = (end - start) / (length - 1);
  const scale = Math.max(0.6, span * 0.06);
  return Array.from({ length }, (_, i) => {
    const n = NOISE[(i + jitterSeed) % NOISE.length] * scale;
    const v = start + step * i + n;
    return Math.round(v * 10) / 10;
  });
}

// ─── KPI data ───────────────────────────────────────────────────────────────

const RIT_TONE = "hsl(142 55% 45%)";
const TEI_TONE = "hsl(200 60% 50%)";
const LRS_TONE = "hsl(260 55% 60%)";

const RIT: SchoolKpi = {
  id: "rit",
  title: "Recovered Instructional Time",
  meaning: "How much time Yellow has added back to the school day for teaching and learning.",
  value: 6.8,
  unit: "min / class",
  status: "high-gain",
  delta: 17,
  deltaLabel: "vs baseline",
  spark: spark(2.4, 6.8, 1),
  band: "+17% vs baseline",
  tone: RIT_TONE,
  subMetrics: [
    {
      id: "ifi",
      label: "Instructional Friction Index",
      description:
        "A composite score of everyday frictions that eat into teaching time — delayed settling, transition loss, repeated instructions, off-task behavior, and disruption events.",
      value: 29,
      unit: "/ 100",
      delta: -11,
      negativeIsGood: true,
      spark: spark(40, 29, 2),
      caption: "Lower is better",
      statusLabel: "Moderate friction",
      statusTone: "hsl(38 92% 55%)",
      headerIcon: "wave",
      statusIcon: "wave",
      deltaText: "11 pts since baseline",
      viz: {
        kind: "components",
        items: [
          { label: "Delayed settling", pct: 26, tone: "hsl(258 55% 65%)" },
          { label: "Transition loss", pct: 22, tone: "hsl(220 70% 60%)" },
          { label: "Repeated instructions", pct: 20, tone: "hsl(170 50% 50%)" },
          { label: "Off-task behavior", pct: 18, tone: "hsl(20 80% 60%)" },
          { label: "Disruption events", pct: 14, tone: "hsl(330 70% 60%)" },
        ],
      },
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "33" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "71" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "36" },
          worst: { name: "Science", meta: "Across 8 sections", value: "68" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "31" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "74" },
        },
      },
    },
    {
      id: "transition",
      label: "Transition Efficiency",
      description:
        "How quickly and smoothly students move into, between, and back to learning tasks without unnecessary loss of instructional time.",
      value: 82,
      unit: "/ 100",
      delta: 9,
      spark: spark(70, 82, 3),
      caption: "Avg transition loss: 52 sec",
      statusLabel: "Stable",
      statusTone: "hsl(142 55% 45%)",
      headerIcon: "swap",
      statusIcon: "scale",
      deltaText: "+9 pts this month",
      viz: {
        kind: "phases",
        items: [
          {
            label: "Start of lesson",
            icon: "play",
            pct: 88,
            tone: "hsl(220 70% 60%)",
          },
          {
            label: "Between activities",
            icon: "swap",
            pct: 76,
            tone: "hsl(38 92% 55%)",
          },
          {
            label: "Return after interruption",
            icon: "rotate",
            pct: 80,
            tone: "hsl(142 55% 45%)",
          },
        ],
      },
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "94" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "61" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "91" },
          worst: { name: "Science", meta: "Across 8 sections", value: "68" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "93" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "64" },
        },
      },
    },
    {
      id: "disruption",
      label: "Disruption Reduction Index",
      description:
        "The reduction in disruptive classroom behaviors that interrupt lesson flow and reduce usable teaching time.",
      value: 31,
      unit: "%",
      delta: 31,
      spark: spark(10, 31, 4),
      caption: "Disruptive incidents reduced from 3.2 to 2.2 per class",
      statusLabel: "Strong improvement",
      statusTone: "hsl(142 55% 45%)",
      headerIcon: "shield",
      statusIcon: "star",
      deltaText: "vs baseline",
      viz: {
        kind: "compare",
        baseline: 3.2,
        now: 2.2,
        unit: "disruptions/class",
        valueDisplay: "-31%",
      },
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "88" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "54" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "84" },
          worst: { name: "Science", meta: "Across 8 sections", value: "57" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "86" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "55" },
        },
      },
    },
  ],
  dimensionalHighlights: {
    class: {
      best: {
        name: "Class 6",
        meta: "Grade 6 · 31 students",
        value: "+9.4",
        unit: "min / class",
        delta: 24,
        deltaLabel: "vs baseline",
        reason: "Fastest transitions, lowest disruption.",
      },
      worst: {
        name: "Class 3",
        meta: "Grade 3 · 28 students",
        value: "+2.8",
        unit: "min / class",
        delta: 7,
        deltaLabel: "vs baseline",
        reason: "High delayed-settling and repeat-instruction loss.",
      },
    },
    subject: {
      best: {
        name: "Math",
        meta: "Across 9 sections",
        value: "+9.1",
        unit: "min / class",
        delta: 22,
        deltaLabel: "vs baseline",
        reason: "Strong start-of-lesson efficiency school-wide.",
      },
      worst: {
        name: "Science",
        meta: "Across 8 sections",
        value: "+3.2",
        unit: "min / class",
        delta: 8,
        deltaLabel: "vs baseline",
        reason: "Activity transitions absorb the most class time.",
      },
    },
    teacher: {
      best: {
        name: "Mr. K. Verma",
        meta: "Math · Grades 5–7",
        value: "+9.8",
        unit: "min / class",
        delta: 26,
        deltaLabel: "vs baseline",
        reason: "Routines compress settling to under 40 seconds.",
      },
      worst: {
        name: "Ms. A. Sharma",
        meta: "Science · Grades 3–5",
        value: "+1.9",
        unit: "min / class",
        delta: 5,
        deltaLabel: "vs baseline",
        reason: "Frequent re-direction events shorten teaching blocks.",
      },
    },
  },
};

const TEI: SchoolKpi = {
  id: "tei",
  title: "Teacher Efficiency Index",
  meaning: "How efficiently teachers are able to teach with less friction and less wasted effort.",
  value: 74,
  unit: "/ 100",
  status: "strong",
  delta: 11,
  deltaLabel: "this term",
  spark: spark(58, 74, 5),
  band: "+11 pts this term",
  tone: TEI_TONE,
  subMetrics: [
    {
      id: "delivery",
      label: "Instructional Delivery Time",
      description:
        "How much class time teachers spend teaching, guiding, and supporting learning instead of managing disruptions.",
      value: 29.6,
      unit: "/ 40 mins",
      delta: 4.2,
      spark: spark(25.4, 29.6, 6),
      caption: "Time spent on instruction · 74% of class time",
      statusLabel: "Strong",
      statusTone: "hsl(142 55% 45%)",
      deltaText: "4.2 mins vs baseline",
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "32.8 mins" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "23.2 mins" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "31.6 mins" },
          worst: { name: "Science", meta: "Across 8 sections", value: "24.4 mins" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "33.6 mins" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "22.8 mins" },
        },
      },
    },
    {
      id: "load",
      label: "Teacher Cognitive Load",
      description:
        "Mental effort teachers spend monitoring, redirecting, correcting, and adjusting in real time.",
      value: 38,
      unit: "/ 100",
      delta: -10,
      negativeIsGood: true,
      spark: spark(48, 38, 7),
      caption: "Lower is better · Moderate load",
      statusLabel: "Moderate",
      statusTone: "hsl(38 92% 55%)",
      deltaText: "10 pts vs baseline",
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "31" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "63" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "34" },
          worst: { name: "Science", meta: "Across 8 sections", value: "59" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "29" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "66" },
        },
      },
    },
    {
      id: "stability",
      label: "Classroom Stability",
      description:
        "How steadily the classroom progresses without repeated disruption, delay, or reset.",
      value: 81,
      unit: "/ 100",
      delta: 8,
      spark: spark(73, 81, 8),
      caption: "Stability of lesson flow",
      statusLabel: "Stable",
      statusTone: "hsl(142 55% 45%)",
      deltaText: "8 pts vs baseline",
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "91" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "59" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "87" },
          worst: { name: "Science", meta: "Across 8 sections", value: "64" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "90" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "62" },
        },
      },
    },
  ],
  dimensionalHighlights: {
    class: {
      best: {
        name: "Class 6",
        meta: "Grade 6 · 31 students",
        value: "88",
        unit: "/ 100",
        delta: 18,
        deltaLabel: "this term",
        reason: "High delivery time, low cognitive load.",
      },
      worst: {
        name: "Class 3",
        meta: "Grade 3 · 28 students",
        value: "54",
        unit: "/ 100",
        delta: -11,
        deltaLabel: "this term",
        reason: "Teaching time eroded by reactive management.",
      },
    },
    subject: {
      best: {
        name: "Math",
        meta: "Across 9 sections",
        value: "83",
        unit: "/ 100",
        delta: 15,
        deltaLabel: "this term",
        reason: "Consistent delivery rhythm across sections.",
      },
      worst: {
        name: "Science",
        meta: "Across 8 sections",
        value: "61",
        unit: "/ 100",
        delta: -6,
        deltaLabel: "this term",
        reason: "Lab transitions inflate teacher load.",
      },
    },
    teacher: {
      best: {
        name: "Mr. K. Verma",
        meta: "Math · Grades 5–7",
        value: "86",
        unit: "/ 100",
        delta: 19,
        deltaLabel: "this term",
        reason: "Steady classroom — minimal reset events.",
      },
      worst: {
        name: "Ms. A. Sharma",
        meta: "Science · Grades 3–5",
        value: "55",
        unit: "/ 100",
        delta: -9,
        deltaLabel: "this term",
        reason: "Recurring redirections raise cognitive load.",
      },
    },
  },
};

const LRS: SchoolKpi = {
  id: "lrs",
  title: "Learning Readiness Score",
  meaning: "How prepared students are to understand, engage, and persist in grade-level tasks.",
  value: 71,
  unit: "/ 100",
  status: "improving",
  delta: 9,
  deltaLabel: "vs baseline",
  spark: spark(62, 71, 9),
  band: "62% of classes improved",
  bands: [
    { label: "Strong", pct: 22, tone: "hsl(142 55% 45%)" },
    { label: "Stable", pct: 62, tone: "hsl(200 60% 50%)" },
    { label: "Building", pct: 12, tone: "hsl(38 92% 55%)" },
    { label: "Needs Support", pct: 4, tone: "hsl(0 78% 58%)" },
  ],
  tone: LRS_TONE,
  subMetrics: [
    {
      id: "focus",
      label: "Focus",
      description:
        "How well students remain meaningfully engaged long enough for learning to happen.",
      value: 7.8,
      unit: "mins",
      delta: 1.4,
      spark: spark(6.4, 7.8, 11),
      caption: "Avg sustained focus · 64% hold attention",
      statusLabel: "Emerging",
      statusTone: "hsl(180 50% 40%)",
      deltaText: "1.4 mins vs baseline",
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "10.4 mins" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "4.2 mins" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "9.6 mins" },
          worst: { name: "Science", meta: "Across 8 sections", value: "5.2 mins" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "10.0 mins" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "4.0 mins" },
        },
      },
    },
    {
      id: "engagement",
      label: "Task Engagement",
      description:
        "How readily and actively students engage with classroom tasks after instructions are given.",
      value: 78,
      unit: "%",
      delta: 12,
      spark: spark(66, 78, 12),
      caption: "Students actively engaged within first 2 mins",
      statusLabel: "Strong",
      statusTone: "hsl(142 55% 45%)",
      deltaText: "12 pts vs baseline",
      breakdown: {
        class: {
          best: { name: "Class 6", meta: "Grade 6 · 31 students", value: "81" },
          worst: { name: "Class 3", meta: "Grade 3 · 28 students", value: "54" },
        },
        subject: {
          best: { name: "Math", meta: "Across 9 sections", value: "78" },
          worst: { name: "Science", meta: "Across 8 sections", value: "59" },
        },
        teacher: {
          best: { name: "Mr. K. Verma", meta: "Math · Grades 5–7", value: "80" },
          worst: { name: "Ms. A. Sharma", meta: "Science · Grades 3–5", value: "52" },
        },
      },
    },
  ],
  dimensionalHighlights: {
    class: {
      best: {
        name: "Class 6",
        meta: "Grade 6 · 31 students",
        value: "78",
        unit: "/ 100",
        delta: 20,
        deltaLabel: "this term",
        reason: "Strong attention and task persistence.",
      },
      worst: {
        name: "Class 3",
        meta: "Grade 3 · 28 students",
        value: "51",
        unit: "/ 100",
        delta: -13,
        deltaLabel: "this term",
        reason: "Slow task initiation, fragile focus.",
      },
    },
    subject: {
      best: {
        name: "Math",
        meta: "Across 9 sections",
        value: "74",
        unit: "/ 100",
        delta: 14,
        deltaLabel: "this term",
        reason: "Sustained focus during problem-solving blocks.",
      },
      worst: {
        name: "Science",
        meta: "Across 8 sections",
        value: "56",
        unit: "/ 100",
        delta: -7,
        deltaLabel: "this term",
        reason: "Engagement dips during multi-step labs.",
      },
    },
    teacher: {
      best: {
        name: "Mr. K. Verma",
        meta: "Math · Grades 5–7",
        value: "76",
        unit: "/ 100",
        delta: 18,
        deltaLabel: "this term",
        reason: "Clear directions lift task initiation.",
      },
      worst: {
        name: "Ms. A. Sharma",
        meta: "Science · Grades 3–5",
        value: "53",
        unit: "/ 100",
        delta: -10,
        deltaLabel: "this term",
        reason: "Self-regulation gaps shorten focus windows.",
      },
    },
  },
};

const ALL: Record<KpiId, SchoolKpi> = { rit: RIT, tei: TEI, lrs: LRS };

export function getSchoolKpiList(): SchoolKpi[] {
  return [RIT, TEI, LRS];
}

export type SchoolHealthStatus = "strong" | "improving" | "mixed" | "at-risk";

export type SchoolHealth = {
  status: SchoolHealthStatus;
  label: string;
  /** Short, principal-facing headline shown in the pill (e.g. "Whole-school gains"). */
  headline: string;
  /** One-sentence interpretation a principal can act on or report up. */
  meaning: string;
  detail: string;
  positiveCount: number;
  total: number;
  tone: string;
  /** Per-KPI breakdown (in RIT, TEI, LRS order) for compact visual indicators. */
  kpiSignals: {
    id: KpiId;
    title: string;
    delta: number;
    deltaLabel: string;
    tone: string;
  }[];
};

const HEALTH_TONE: Record<SchoolHealthStatus, string> = {
  strong: "hsl(142 55% 45%)",
  improving: "hsl(260 55% 60%)",
  mixed: "hsl(38 92% 55%)",
  "at-risk": "hsl(0 78% 58%)",
};

const HEALTH_LABEL: Record<SchoolHealthStatus, string> = {
  strong: "Strong",
  improving: "Improving",
  mixed: "Mixed",
  "at-risk": "At risk",
};

export function getSchoolHealth(): SchoolHealth {
  const kpis = getSchoolKpiList();
  const total = kpis.length;
  const positiveCount = kpis.filter((k) => k.delta >= 0).length;

  let status: SchoolHealthStatus;
  if (positiveCount === total) status = "strong";
  else if (positiveCount >= 2) status = "improving";
  else if (positiveCount === 1) status = "mixed";
  else status = "at-risk";

  const POSITIVE = "hsl(142 55% 45%)";
  const NEGATIVE = "hsl(0 78% 58%)";

  const HEADLINE: Record<SchoolHealthStatus, string> = {
    strong: "Whole-school gains",
    improving: "Most outcomes improving",
    mixed: "Mixed signals",
    "at-risk": "Outcomes slipping",
  };

  const MEANING: Record<SchoolHealthStatus, string> = {
    strong:
      "Time, teaching efficiency, and student readiness are all up this month — Yellow is creating consistent impact across the school.",
    improving:
      "Most core outcomes are trending up. Yellow is moving the needle, with one area still building.",
    mixed:
      "Only one of three outcomes is up. Worth a closer look at where teachers need more support.",
    "at-risk":
      "Core outcomes are softening this month. Time to step in — pick one area and coach this week.",
  };

  return {
    status,
    label: HEALTH_LABEL[status],
    headline: HEADLINE[status],
    meaning: MEANING[status],
    detail: `${positiveCount} of ${total} outcomes up this month`,
    positiveCount,
    total,
    tone: HEALTH_TONE[status],
    kpiSignals: kpis.map((k) => ({
      id: k.id,
      title: k.title,
      delta: k.delta,
      deltaLabel: k.deltaLabel,
      tone: k.delta >= 0 ? POSITIVE : NEGATIVE,
    })),
  };
}

export function getSchoolKpi(id: KpiId): SchoolKpi {
  return ALL[id];
}

const KPI_ATTENTION: Record<KpiId, number> = {
  rit: 24,
  tei: 38,
  lrs: 47,
};

export function getKpiAttentionCount(kpiId: KpiId): { count: number; total: number } {
  return { count: KPI_ATTENTION[kpiId], total: SCHOOL_CONTEXT.classrooms };
}

// ─── Value narrative ─────────────────────────────────────────────────────────

export const VALUE_NARRATIVE = {
  eyebrow: "Why this matters",
  title: "Yellow turns classroom support into recovered teaching time",
  body: "When Yellow supports teachers with classroom insights and skill-building recommendations, students improve in focus, task persistence, behavior regulation, accountability, and higher-order thinking. This reduces time spent managing disruptions, repeating instructions, and resetting the classroom — giving more time back to effective teaching.",
};

// ─── KPI roster (per-class table) ───────────────────────────────────────────

export type RosterTrend = "moving-up" | "stable" | "declining";
export type RosterStatus = "improving" | "stable" | "declining";

export type SchoolKpiRosterRow = {
  classId: string;
  className: string;
  classMeta: string;
  /** Scores aligned to each sub-metric (in `kpi.subMetrics` order). */
  subMetricValues: number[];
  /**
   * The headline delta for this class on this KPI — for RIT this is the
   * disruption-reduction delta (% change); for TEI/LRS it's the composite
   * delta. The trend pill is derived from this.
   */
  delta: number;
  /** Direction of recent movement (last 30 days). */
  trend: RosterTrend;
  /** Overall status flag. */
  status: RosterStatus;
};

// Stable cohort used for the class roster. Reused across KPIs so the same
// classes line up row-for-row regardless of which KPI you're viewing.
const ROSTER_CLASSES: { id: string; name: string; meta: string }[] = [
  { id: "c-6a", name: "Class 6", meta: "Grade 6 · 31 students" },
  { id: "c-5b", name: "Class 5B", meta: "Grade 5 · 29 students" },
  { id: "c-7a", name: "Class 7", meta: "Grade 7 · 33 students" },
  { id: "c-5a", name: "Class 5A", meta: "Grade 5 · 28 students" },
  { id: "c-4a", name: "Class 4A", meta: "Grade 4 · 30 students" },
  { id: "c-8a", name: "Class 8", meta: "Grade 8 · 32 students" },
  { id: "c-4b", name: "Class 4B", meta: "Grade 4 · 27 students" },
  { id: "c-2a", name: "Class 2", meta: "Grade 2 · 26 students" },
  { id: "c-7b", name: "Class 7B", meta: "Grade 7 · 30 students" },
  { id: "c-3a", name: "Class 3", meta: "Grade 3 · 28 students" },
];

type RosterTuple = [
  /* IFI / Delivery / Focus */ number,
  /* Transition / Load / Engagement */ number,
  /* Disruption / Stability / (unused for LRS) */ number,
  /* delta */ number,
  RosterTrend,
  RosterStatus,
];

// Per-class rows for each KPI. The three numeric columns map to the KPI's
// three sub-metrics, in order. Values are deterministic mocks.
const ROSTER_DATA: Record<KpiId, RosterTuple[]> = {
  rit: [
    [33, 94, 88, 22, "moving-up", "improving"],
    [38, 90, 84, 18, "moving-up", "improving"],
    [42, 86, 81, 14, "moving-up", "improving"],
    [46, 83, 76, 9, "stable", "stable"],
    [49, 82, 72, 6, "stable", "stable"],
    [52, 79, 70, 4, "stable", "stable"],
    [55, 76, 67, -2, "stable", "stable"],
    [58, 74, 65, -5, "declining", "declining"],
    [64, 68, 60, -8, "declining", "declining"],
    [71, 61, 54, -12, "declining", "declining"],
  ],
  tei: [
    [32.8, 31, 91, 18, "moving-up", "improving"],
    [31.2, 35, 87, 14, "moving-up", "improving"],
    [30.4, 38, 84, 11, "moving-up", "improving"],
    [29.2, 41, 81, 8, "stable", "stable"],
    [28.4, 38, 81, 6, "stable", "stable"],
    [27.2, 46, 74, 3, "stable", "stable"],
    [25.6, 49, 71, -1, "stable", "stable"],
    [24.4, 53, 68, -4, "declining", "declining"],
    [23.2, 58, 64, -7, "declining", "declining"],
    [21.6, 64, 59, -11, "declining", "declining"],
  ],
  lrs: [
    [10.4, 91, 0, 20, "moving-up", "improving"],
    [9.6, 87, 0, 16, "moving-up", "improving"],
    [9.0, 83, 0, 12, "moving-up", "improving"],
    [8.4, 79, 0, 8, "stable", "stable"],
    [7.8, 78, 0, 5, "stable", "stable"],
    [7.2, 72, 0, 2, "stable", "stable"],
    [6.6, 67, 0, -2, "stable", "stable"],
    [5.8, 62, 0, -6, "declining", "declining"],
    [5.0, 57, 0, -9, "declining", "declining"],
    [4.2, 51, 0, -13, "declining", "declining"],
  ],
};

export function getSchoolKpiRoster(kpiId: KpiId): SchoolKpiRosterRow[] {
  const count = ALL[kpiId].subMetrics.length;
  return ROSTER_DATA[kpiId].map((tuple, i) => {
    const cls = ROSTER_CLASSES[i];
    return {
      classId: cls.id,
      className: cls.name,
      classMeta: cls.meta,
      subMetricValues: [tuple[0], tuple[1], tuple[2]].slice(0, count),
      delta: tuple[3],
      trend: tuple[4],
      status: tuple[5],
    };
  });
}

export const ROSTER_TREND_COPY: Record<RosterTrend, string> = {
  "moving-up": "Moving up",
  stable: "Stable",
  declining: "Declining",
};

export const ROSTER_STATUS_COPY: Record<RosterStatus, string> = {
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
};

export const ROSTER_TREND_TONE: Record<RosterTrend, string> = {
  "moving-up": "hsl(142 55% 45%)",
  stable: "hsl(200 60% 50%)",
  declining: "hsl(0 78% 58%)",
};

export const ROSTER_STATUS_TONE: Record<RosterStatus, string> = {
  improving: "hsl(142 55% 45%)",
  stable: "hsl(200 60% 50%)",
  declining: "hsl(0 78% 58%)",
};
