// School-leader KPI model.
// This school is the one real class covered by data/realStudents.ts (see
// lib/schoolData.ts). Of the three KPIs this page was built around, only
// Learning Readiness Score has any real backing — Recovered Instructional
// Time and Teacher Efficiency Index needed per-minute instructional-time and
// teacher-cognitive-load tracking that doesn't exist anywhere in this data
// model, so they now honestly report `hasData: false` (no value, no
// sub-metrics, no roster) instead of the invented "Mr. K. Verma" / "Class 6"
// breakdowns that used to fill this page. There is no real week-over-week
// history, so every delta/sparkline is flat (0) rather than a fabricated
// swing, and every "best/worst by class·subject·teacher" breakdown has been
// dropped — there's only one real class and one real teacher, so there's
// nothing to compare.

import { classReadinessSnapshot } from "@/lib/classLearning";
import { classTaskSnapshot } from "@/lib/classTask";
import { STUDENTS } from "@/data/mockData";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";

export type KpiId = "rit" | "tei" | "lrs";

export type KpiStatus =
  | "high-gain"
  | "improving"
  | "strong"
  | "stable"
  | "building"
  | "at-risk"
  | "needs-support";

export type SubMetric = {
  id: string;
  label: string;
  description: string;
  value: number | null;
  unit?: string;
  delta: number;
  negativeIsGood?: boolean;
  spark: number[];
  caption?: string;
  statusLabel?: string;
  statusTone?: string;
  deltaText?: string;
};

export type SchoolKpi = {
  id: KpiId;
  title: string;
  meaning: string;
  /** Whether this KPI has any real signal at all. */
  hasData: boolean;
  /** Headline value (e.g. "74"). Null when hasData is false. */
  value: number | null;
  unit: string;
  status: KpiStatus | null;
  delta: number;
  deltaLabel: string;
  spark: number[];
  band?: string;
  bands?: { label: string; pct: number; tone: string }[];
  tone: string;
  subMetrics: SubMetric[];
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
  activeCoveragePct: number;
  lastUpdated: string;
  refreshCadence: string;
};

export function getSchoolContext(): SchoolContext {
  return {
    scope: "Your Class",
    term: "This Term",
    students: STUDENTS.length,
    teachers: 1,
    classrooms: 1,
    activeCoveragePct: 100,
    lastUpdated: new Date().toISOString(),
    refreshCadence: "Refreshes as new data arrives",
  };
}

// Kept for import-path compatibility — call getSchoolContext() for the
// current real values (this constant can't compute STUDENTS.length once at
// module scope in a way that reflects live changes, so it's a snapshot).
export const SCHOOL_CONTEXT: SchoolContext = getSchoolContext();

// ─── Filters ────────────────────────────────────────────────────────────────

export type FilterKey = "timePeriod" | "gradeBand" | "section" | "subject" | "teacherGroup";

export type FilterDef = {
  key: FilterKey;
  label: string;
  options: string[];
};

export const FILTERS: FilterDef[] = [
  { key: "timePeriod", label: "Time period", options: ["This term"] },
];

export const DEFAULT_FILTERS: Record<FilterKey, string> = {
  timePeriod: "This term",
  gradeBand: "All grades",
  section: "All sections",
  subject: "All subjects",
  teacherGroup: "All teachers",
};

const FLAT_SPARK = Array.from({ length: 10 }, () => 0);

function flatSpark(value: number): number[] {
  return Array.from({ length: 10 }, () => value);
}

// ─── KPI data ───────────────────────────────────────────────────────────────

const RIT_TONE = "hsl(142 55% 45%)";
const TEI_TONE = "hsl(200 60% 50%)";
const LRS_TONE = "hsl(260 55% 60%)";

const RIT: SchoolKpi = {
  id: "rit",
  title: "Recovered Instructional Time",
  meaning: "How much time Yellow has added back to the school day for teaching and learning.",
  hasData: false,
  value: null,
  unit: "min / class",
  status: null,
  delta: 0,
  deltaLabel: "not enough data yet",
  spark: FLAT_SPARK,
  tone: RIT_TONE,
  subMetrics: [],
};

const TEI: SchoolKpi = {
  id: "tei",
  title: "Teacher Efficiency Index",
  meaning: "How efficiently teachers are able to teach with less friction and less wasted effort.",
  hasData: false,
  value: null,
  unit: "/ 100",
  status: null,
  delta: 0,
  deltaLabel: "not enough data yet",
  spark: FLAT_SPARK,
  tone: TEI_TONE,
  subMetrics: [],
};

function buildLRS(): SchoolKpi {
  const readiness = classReadinessSnapshot();
  const task = classTaskSnapshot();
  const hasData = readiness.score != null;

  const subMetrics: SubMetric[] = [
    {
      id: "readiness-areas",
      label: "Learning Readiness Areas",
      description: "Average of the source Learning Readiness Score values available for this class.",
      value: readiness.rawScore,
      unit: "/ 100",
      delta: 0,
      spark: readiness.rawScore != null ? flatSpark(readiness.rawScore) : FLAT_SPARK,
      caption: readiness.rawScore != null ? undefined : "Not enough data yet",
    },
    {
      id: "task-engagement",
      label: "Task Engagement",
      description: "How readily and actively students engage with classroom tasks.",
      value: task.engagementScore,
      unit: "/ 100",
      delta: 0,
      spark: task.engagementScore != null ? flatSpark(task.engagementScore) : FLAT_SPARK,
      caption: task.engagementScore != null ? undefined : "Not enough data yet",
    },
  ];

  return {
    id: "lrs",
    title: "Learning Readiness Score",
    meaning: "How prepared students are to understand, engage, and persist in grade-level tasks.",
    hasData,
    value: readiness.score,
    unit: "/ 100",
    status: readiness.status
      ? ({ strong: "strong", stable: "stable", watch: "building", support: "needs-support" } as const)[readiness.status]
      : null,
    delta: 0,
    deltaLabel: "not enough data yet",
    spark: readiness.score != null ? flatSpark(readiness.score) : FLAT_SPARK,
    bands: undefined,
    tone: LRS_TONE,
    subMetrics,
  };
}

const ALL: Record<KpiId, SchoolKpi> = { rit: RIT, tei: TEI, lrs: buildLRS() };

export function getSchoolKpiList(): SchoolKpi[] {
  return [ALL.rit, ALL.tei, ALL.lrs];
}

export type SchoolHealthStatus = "strong" | "improving" | "mixed" | "at-risk";

export type SchoolHealth = {
  status: SchoolHealthStatus;
  label: string;
  headline: string;
  meaning: string;
  detail: string;
  positiveCount: number;
  total: number;
  tone: string;
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

/** With only one KPI (Learning Readiness) carrying real data, "school
 * health" collapses to whether that one KPI looks healthy — the other two
 * simply don't count toward the read since they have nothing to report. */
export function getSchoolHealth(): SchoolHealth {
  const kpis = getSchoolKpiList().filter((k) => k.hasData);
  const total = kpis.length;
  const positiveCount = kpis.filter((k) => k.status === "strong" || k.status === "stable").length;

  const status: SchoolHealthStatus = total === 0 ? "mixed" : positiveCount === total ? "strong" : positiveCount > 0 ? "improving" : "at-risk";

  const HEADLINE: Record<SchoolHealthStatus, string> = {
    strong: "Looking healthy",
    improving: "Some areas improving",
    mixed: "Not enough data yet",
    "at-risk": "Needs attention",
  };

  const MEANING: Record<SchoolHealthStatus, string> = {
    strong: "The metrics we can track for this class are in a healthy range.",
    improving: "Some tracked metrics are healthy; others need a closer look.",
    mixed: "Only Learning Readiness has real data yet — the other two KPIs need more tracked signal before they can report a status.",
    "at-risk": "The metrics we can track for this class need attention.",
  };

  return {
    status,
    label: HEALTH_LABEL[status],
    headline: HEADLINE[status],
    meaning: MEANING[status],
    detail: total > 0 ? `${positiveCount} of ${total} tracked outcomes healthy` : "No KPIs have enough real data yet",
    positiveCount,
    total,
    tone: HEALTH_TONE[status],
    kpiSignals: getSchoolKpiList().map((k) => ({
      id: k.id,
      title: k.title,
      delta: k.delta,
      deltaLabel: k.deltaLabel,
      tone: k.hasData ? "hsl(142 55% 45%)" : "hsl(230 10% 55%)",
    })),
  };
}

export function getSchoolKpi(id: KpiId): SchoolKpi {
  return ALL[id];
}

export function getKpiAttentionCount(kpiId: KpiId): { count: number; total: number } {
  const kpi = ALL[kpiId];
  return { count: 0, total: kpi.hasData ? 1 : 0 };
}

// ─── Value narrative ─────────────────────────────────────────────────────────

export const VALUE_NARRATIVE = {
  eyebrow: "Why this matters",
  title: "Yellow turns classroom support into recovered teaching time",
  body: "When Yellow supports teachers with classroom insights and skill-building recommendations, students improve in focus, task persistence, behavior regulation, accountability, and higher-order thinking. This reduces time spent managing disruptions, repeating instructions, and resetting the classroom — giving more time back to effective teaching.",
};

// ─── KPI roster (per-class table) — one real class, so at most one row ─────

export type RosterTrend = "moving-up" | "stable" | "declining";
export type RosterStatus = "improving" | "stable" | "declining";

export type SchoolKpiRosterRow = {
  classId: string;
  className: string;
  classMeta: string;
  subMetricValues: (number | null)[];
  delta: number;
  trend: RosterTrend;
  status: RosterStatus;
};

export function getSchoolKpiRoster(kpiId: KpiId): SchoolKpiRosterRow[] {
  const kpi = ALL[kpiId];
  if (!kpi.hasData) return [];
  return [
    {
      classId: "c_1",
      className: `${TEACHER_NAME}'s class`,
      classMeta: `${STUDENTS.length} students`,
      subMetricValues: kpi.subMetrics.map((m) => m.value),
      delta: 0,
      trend: "stable",
      status: "stable",
    },
  ];
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
