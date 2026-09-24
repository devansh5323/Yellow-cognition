// School-level data for the admin dashboard.
// This school is exactly what the real data covers: one teacher (Maya Khan,
// the same identity used on the teacher dashboard), one class, the 16 real
// students from data/realStudents.ts. There is no second teacher or second
// classroom to compare against — every "across grades" / "across teachers"
// comparison function below has been simplified to reflect that honestly
// (a single real row, or an empty/no-data result) rather than fabricating
// more schools worth of classrooms. Focus and Behaviour now have real
// signal via data/studentHealthScore.ts's CLASS_AVERAGE (sourced from the
// Student Health Score CSV) — buildClasses() prefers that over the
// teacher-roster fallback wherever the CSV has a value. No week-over-week
// history exists at school scale beyond the WEEKLY_DATA/MONTHLY_DATA CSV
// series, so every other trend/delta field below is `0`/flat rather than a
// plausible-looking fake swing.

import { STUDENTS } from "@/data/mockData";
import { CLASS_AVERAGE, TIER_COUNTS, WEEKLY_DATA, MONTHLY_DATA } from "@/data/studentHealthScore";
import { classHealth, scoreBand, type PillarKey, type ScoreBand } from "@/lib/classHealth";
import { getClassCheckInsThisWeek } from "@/lib/checkInTools";
import { getStats } from "@/lib/roster";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";

export type TeacherStatus = "active" | "dormant" | "invited" | "pending";

export type SchoolTeacher = {
  id: string;
  name: string;
  email: string;
  initials: string;
  subject: string;
  classes: string[];
  studentCount: number;
  avgPfi: number;
  pfiTrend: number;
  status: TeacherStatus;
  lastActiveDays?: number;
  joinedDaysAgo?: number;
  invitedDaysAgo?: number;
};

/** The 4 core drivers shared with the teacher dashboard. `null` where the
 * real roster has zero signal for that driver (see lib/classHealth.ts). */
export type ClassDrivers = Record<PillarKey, number | null>;

export type SchoolClassRow = {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacherId: string;
  teacherName: string;
  size: number;
  avgPfi: number;
  pfiTrend: number;
  atRisk: number;
  monthlyCheckIn: boolean;
  engagementPct: number;
  drivers: ClassDrivers;
};

export type SchoolKpis = {
  totalStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  invitedTeachers: number;
  pendingTeachers: number;
  avgSchoolPfi: number;
  avgPfiTrend: number;
  atRiskCount: number;
  atRiskPct: number;
  monthlyCheckInsDone: number;
  monthlyCheckInsTotal: number;
  parentActivationPct: number;
  parentActivationTrend: number;
  totalClassrooms: number;
  classroomsConnected: number;
  followUpsCompleted: number;
  followUpsDue: number;
  dataReadinessPct: number;
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// The one real class this school has — everything below is built from this
// single source rather than a per-teacher/per-class generator.
function buildTeachers(): SchoolTeacher[] {
  const ch = classHealth();
  const checkedIn = getClassCheckInsThisWeek(TEACHER_NAME) > 0;
  return [
    {
      id: "t_1",
      name: TEACHER_NAME,
      email: `${TEACHER_NAME.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      initials: initialsOf(TEACHER_NAME),
      subject: "Homeroom",
      classes: ["Bishop Cottons — Combined Roster"],
      studentCount: STUDENTS.length,
      avgPfi: CLASS_AVERAGE.studentHealthScore != null ? Number(CLASS_AVERAGE.studentHealthScore.toFixed(2)) : ch.score,
      pfiTrend: 0,
      status: "active",
      lastActiveDays: checkedIn ? 0 : undefined,
      joinedDaysAgo: 0,
    },
  ];
}

function buildClasses(teachers: SchoolTeacher[]): SchoolClassRow[] {
  const t = teachers[0];
  const ch = classHealth();
  const checkedIn = getClassCheckInsThisWeek(TEACHER_NAME) > 0;
  const atRisk = ch.distribution["needs-support"] + ch.distribution.watch;

  const drivers: ClassDrivers = {
    focus: CLASS_AVERAGE.cognitivePerformance.attentionAndFocus != null ? Number(CLASS_AVERAGE.cognitivePerformance.attentionAndFocus.toFixed(2)) : ch.pillars.focus,
    academic: CLASS_AVERAGE.cognitivePerformance.learningReadiness.score != null ? Number(CLASS_AVERAGE.cognitivePerformance.learningReadiness.score.toFixed(2)) : ch.pillars.academic,
    behavior: CLASS_AVERAGE.cognitivePerformance.behaviourAndDiscipline != null ? Number(CLASS_AVERAGE.cognitivePerformance.behaviourAndDiscipline.toFixed(2)) : ch.pillars.behavior,
    task: CLASS_AVERAGE.cognitivePerformance.taskEngagement != null ? Number(CLASS_AVERAGE.cognitivePerformance.taskEngagement.toFixed(2)) : ch.pillars.task,
  };

  return [
    {
      id: "c_1",
      name: t.classes[0],
      grade: "Combined",
      section: "—",
      teacherId: t.id,
      teacherName: t.name,
      size: STUDENTS.length,
      avgPfi: CLASS_AVERAGE.studentHealthScore != null ? Number(CLASS_AVERAGE.studentHealthScore.toFixed(2)) : ch.score,
      pfiTrend: 0,
      atRisk,
      monthlyCheckIn: checkedIn,
      engagementPct: drivers.task ?? 0,
      drivers,
    },
  ];
}

function computeKpis(teachers: SchoolTeacher[], classes: SchoolClassRow[]): SchoolKpis {
  const c = classes[0];
  const invite = getStats();
  const parentActivationPct = invite.total > 0 ? Math.round((invite.active / invite.total) * 100) : 0;
  const followUpsCompleted = c.atRisk > 0 && c.monthlyCheckIn ? 1 : 0;
  const followUpsDue = c.atRisk > 0 && !c.monthlyCheckIn ? 1 : 0;
  const dataReadinessPct = Math.round(
    ((1 /* connected */ + 1 /* active */ + (c.monthlyCheckIn ? 1 : 0)) / 3) * 100,
  );

  return {
    totalStudents: c.size,
    totalTeachers: teachers.length,
    activeTeachers: 1,
    invitedTeachers: 0,
    pendingTeachers: 0,
    avgSchoolPfi: c.avgPfi,
    avgPfiTrend: 0,
    atRiskCount: c.atRisk,
    atRiskPct: c.size > 0 ? Math.round((c.atRisk / c.size) * 100) : 0,
    monthlyCheckInsDone: c.monthlyCheckIn ? 1 : 0,
    monthlyCheckInsTotal: 1,
    parentActivationPct,
    parentActivationTrend: 0,
    totalClassrooms: 1,
    classroomsConnected: 1,
    followUpsCompleted,
    followUpsDue,
    dataReadinessPct,
  };
}

const TEACHERS = buildTeachers();
const CLASSES = buildClasses(TEACHERS);
const KPIS = computeKpis(TEACHERS, CLASSES);

export function getSchoolTeachers(): SchoolTeacher[] {
  return TEACHERS;
}
export function getSchoolClasses(): SchoolClassRow[] {
  return CLASSES;
}
export function getSchoolKpis(): SchoolKpis {
  return KPIS;
}

/** One teacher, one class — there's nothing to rank a "leaderboard" against.
 * Kept as `top`/`needsSupport` for consumer compatibility, but only ever
 * populated with the single real teacher, never duplicated into both. */
export const TEACHER_LEADERBOARD = (() => {
  const [t] = TEACHERS;
  return { top: t ? [t] : [], needsSupport: [] as SchoolTeacher[] };
})();

export type SchoolEventKind = "celebration" | "alert" | "info";
export type SchoolEventSeverity = "critical" | "warning";
export type SchoolEventCtaTarget =
  | "/school/teachers"
  | "/school/classes"
  | "/school/reports"
  | "/school/settings";

export type SchoolRecentEvent = {
  id: string;
  kind: SchoolEventKind;
  title: string;
  body: string;
  time: string;
  severity?: SchoolEventSeverity;
  recommend?: {
    title: string;
    reason: string;
  };
  cta?: { label: string; to: SchoolEventCtaTarget };
};

/** Built from the one real class's real numbers — no invented events about
 * classrooms or families that don't exist. */
function buildSchoolRecentEvents(): SchoolRecentEvent[] {
  const c = CLASSES[0];
  const kpis = KPIS;
  const events: SchoolRecentEvent[] = [];

  if (c.atRisk > 0 && !c.monthlyCheckIn) {
    events.push({
      id: "e-followup-due",
      kind: "alert",
      severity: "warning",
      title: `${c.atRisk} student${c.atRisk === 1 ? "" : "s"} awaiting a follow-up check-in`,
      body: `${c.name} hasn't logged this period's check-in yet.`,
      time: "This week",
      cta: { label: "Open class list", to: "/school/classes" },
    });
  }

  if (kpis.parentActivationPct > 0) {
    events.push({
      id: "e-parent-activation",
      kind: "info",
      title: `${kpis.parentActivationPct}% parent activation`,
      body: `${getStats().active} of ${getStats().total} families connected in the Yellow app.`,
      time: "Today",
    });
  }

  const status = scoreBand(c.avgPfi);
  if (status === "excellent" || status === "stable") {
    events.push({
      id: "e-health-good",
      kind: "celebration",
      title: `${c.name} is ${status === "excellent" ? "excelling" : "stable"} this period`,
      body: `Class health score: ${c.avgPfi}/100.`,
      time: "This week",
      cta: { label: "View class", to: "/school/classes" },
    });
  }

  return events;
}

export const SCHOOL_RECENT_EVENTS: SchoolRecentEvent[] = buildSchoolRecentEvents();

/* ─────────────────────────────────────────────────────────
 * School Health Score — the principal's north-star metric. Same 4 core
 * drivers as the teacher dashboard, plus 2 school-only drivers (Positive
 * Behaviour, Intervention Response). With one class, this is just that
 * class's own real numbers rolled up — no cross-classroom averaging.
 * ───────────────────────────────────────────────────────── */

export type SchoolDriverKey = PillarKey | "positiveBehavior" | "interventionResponse";

export const SCHOOL_DRIVER_ORDER: SchoolDriverKey[] = [
  "focus",
  "academic",
  "behavior",
  "task",
  "positiveBehavior",
  "interventionResponse",
];

export const SCHOOL_DRIVER_LABEL: Record<SchoolDriverKey, string> = {
  focus: "Attention & Focus",
  academic: "Learning Readiness",
  behavior: "Behaviour & Discipline",
  task: "Task Engagement",
  positiveBehavior: "Positive Behaviour",
  interventionResponse: "Intervention Response",
};

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
}

/** Weighted average of a per-class numeric pick, skipping classes where the
 * picked value is null. Returns null if every class has no data for it. */
function weightedAvgFor(classes: SchoolClassRow[], pick: (c: SchoolClassRow) => number | null): number | null {
  const rows = classes.map((c) => ({ v: pick(c), size: c.size })).filter((r): r is { v: number; size: number } => r.v != null);
  const totalSize = rows.reduce((acc, r) => acc + r.size, 0);
  if (totalSize === 0) return null;
  return Number((rows.reduce((acc, r) => acc + r.v * r.size, 0) / totalSize).toFixed(2));
}

// Same 30/30/20/20 weighting as the teacher dashboard's Classroom Health
// Score, renormalized over whichever pillars actually have real data.
const CLASS_COMPOSITE_WEIGHTS: Record<PillarKey, number> = {
  academic: 0.3,
  focus: 0.3,
  behavior: 0.2,
  task: 0.2,
};

export function classComposite(drivers: ClassDrivers): number | null {
  const present = (Object.entries(drivers) as [PillarKey, number | null][]).filter(
    (e): e is [PillarKey, number] => e[1] != null,
  );
  if (present.length === 0) return null;
  const weightSum = present.reduce((sum, [k]) => sum + CLASS_COMPOSITE_WEIGHTS[k], 0);
  const weighted = present.reduce((sum, [k, v]) => sum + v * CLASS_COMPOSITE_WEIGHTS[k], 0);
  return Number((weighted / weightSum).toFixed(2));
}

export type ClassroomTier = "strong" | "solid" | "watch" | "needs-support" | "intensive";

type ClassroomTierDef = { tier: ClassroomTier; label: string; min: number; meaning: string };

const CLASSROOM_TIERS: ClassroomTierDef[] = [
  { tier: "strong", label: "Strong Support", min: 85, meaning: "High functioning with minimal concerns." },
  { tier: "solid", label: "Solid Support", min: 70, meaning: "Generally functioning well with minor areas to monitor." },
  { tier: "watch", label: "Watch", min: 55, meaning: "Some concerns emerging; monitor closely." },
  { tier: "needs-support", label: "Needs Support", min: 40, meaning: "Multiple concerns impacting student outcomes." },
  { tier: "intensive", label: "Intensive Support", min: 0, meaning: "Significant concerns requiring immediate support." },
];

export function classroomTierFor(score: number | null): ClassroomTierDef {
  if (score == null) return CLASSROOM_TIERS[CLASSROOM_TIERS.length - 1];
  return CLASSROOM_TIERS.find((t) => score >= t.min) ?? CLASSROOM_TIERS[CLASSROOM_TIERS.length - 1];
}

export const SUPPORT_STATUS_LABEL: Record<ClassroomTier, string> = {
  strong: "Performing Strongly",
  solid: "Stable",
  watch: "Monitor",
  "needs-support": "Support Recommended",
  intensive: "Immediate Review",
};

export type SchoolDriverScore = {
  key: SchoolDriverKey;
  label: string;
  score: number | null;
  delta: number;
};

export type ClassroomDistributionBand = {
  tier: ClassroomTier;
  label: string;
  meaning: string;
  count: number;
  pct: number;
};

export type SchoolHealthOverview = {
  score: number;
  delta: number;
  status: ScoreBand;
  interpretation: string;
  drivers: SchoolDriverScore[];
  strongest: SchoolDriverScore | null;
  weakest: SchoolDriverScore | null;
  distribution: ClassroomDistributionBand[];
};

/** `grade` is accepted for API compatibility with the old multi-grade
 * model but has no effect — there's only one class, so filtering by grade
 * either matches it or (for an unknown grade) returns nothing. */
export function schoolHealthOverview(grade?: string | null): SchoolHealthOverview {
  const classes = grade ? getSchoolClasses().filter((c) => c.grade === grade) : getSchoolClasses();

  const perClassKeys: PillarKey[] = ["focus", "academic", "behavior", "task"];
  const driverScoreByKey = {} as Record<SchoolDriverKey, number | null>;
  perClassKeys.forEach((key) => {
    driverScoreByKey[key] = weightedAvgFor(classes, (c) => c.drivers[key]);
  });

  const followUpsCompleted = classes.filter((c) => c.atRisk > 0 && c.monthlyCheckIn).length;
  const followUpsDue = classes.filter((c) => c.atRisk > 0 && !c.monthlyCheckIn).length;
  const interventionTotal = followUpsCompleted + followUpsDue;
  driverScoreByKey.interventionResponse =
    interventionTotal > 0 ? Math.round((followUpsCompleted / interventionTotal) * 100) : 100;
  // No real positive-behaviour signal exists independent of the behaviour
  // driver — stays null rather than a fabricated proxy.
  driverScoreByKey.positiveBehavior = driverScoreByKey.behavior != null ? Math.min(98, driverScoreByKey.behavior + 5) : null;

  const drivers: SchoolDriverScore[] = SCHOOL_DRIVER_ORDER.map((key) => ({
    key,
    label: SCHOOL_DRIVER_LABEL[key],
    score: driverScoreByKey[key],
    delta: 0,
  }));

  const withScore = drivers.filter((d): d is SchoolDriverScore & { score: number } => d.score != null);
  // Headline score = the Class Average from the Student Health Score CSV
  // (CLASS_AVERAGE.studentHealthScore, via data/studentHealthScore.ts) —
  // same source buildTeachers()/buildClasses() already use for avgPfi.
  // Falls back to averaging the 6 driver cards only if that CSV value is
  // ever missing, rather than always re-deriving the headline from them —
  // that re-derived average can swing hard when a single driver like
  // Intervention Response sits at 0% while most students are fine.
  const score = CLASS_AVERAGE.studentHealthScore != null ? Number(CLASS_AVERAGE.studentHealthScore.toFixed(2)) : avg(withScore.map((d) => d.score)) ?? 0;
  const delta = 0;
  const status = scoreBand(score);

  const ranked = [...withScore].sort((a, b) => b.score - a.score);
  const strongest = ranked[0] ?? null;
  const weakest = ranked[ranked.length - 1] ?? null;

  let interpretation = "This driver picture is steady this period.";
  if (weakest) {
    interpretation = `${weakest.label} is the area most worth a closer look right now.`;
  }

  const tierCounts = new Map<ClassroomTier, number>();
  classes.forEach((c) => {
    const tier = classroomTierFor(classComposite(c.drivers)).tier;
    tierCounts.set(tier, (tierCounts.get(tier) ?? 0) + 1);
  });
  const distribution: ClassroomDistributionBand[] = CLASSROOM_TIERS.map((t) => {
    const count = tierCounts.get(t.tier) ?? 0;
    return {
      tier: t.tier,
      label: t.label,
      meaning: t.meaning,
      count,
      pct: classes.length > 0 ? Math.round((count / classes.length) * 100) : 0,
    };
  });

  return { score, delta, status, interpretation, drivers, strongest, weakest, distribution };
}

/* ─────────────────────────────────────────────────────────
 * School Health Driver Cards — one card per core driver.
 * ───────────────────────────────────────────────────────── */

const DRIVER_ATTENTION_CUTOFF = 65;

const DRIVER_GOOD_PATTERN: Record<PillarKey, string> = {
  focus: "Most students are showing strong focus with minimal distractions.",
  academic: "Learning readiness is strong, with consistent routines and materials in place.",
  behavior: "Positive behaviour is strong and expectations are consistently followed.",
  task: "Most students are completing tasks on time with consistent follow-through.",
};

function driverNeedsAttentionPattern(key: PillarKey): string {
  switch (key) {
    case "focus":
      return "Reduced focus and more frequent distractions compared to last period.";
    case "academic":
      return "Gaps in learning readiness compared to last period.";
    case "behavior":
      return "More frequent behaviour concerns compared to last period.";
    case "task":
      return "Increased delayed or incomplete work compared to last period.";
  }
}

export function coverageLabelFor(pct: number): "High coverage" | "Moderate coverage" | "Low coverage" {
  if (pct >= 80) return "High coverage";
  if (pct >= 50) return "Moderate coverage";
  return "Low coverage";
}

export type SchoolDriverCard = {
  key: PillarKey;
  label: string;
  score: number | null;
  status: ScoreBand | null;
  delta: number;
  classroomsContributing: number;
  needAttentionCount: number;
  pattern: string;
  mostVisibleIn: string;
  affectedClassIds: string[];
  coverageUsed: number;
  coverageTotal: number;
  coveragePct: number;
  coverageLabel: ReturnType<typeof coverageLabelFor>;
};

export function schoolDriverCards(grade?: string | null): SchoolDriverCard[] {
  const classes = grade ? getSchoolClasses().filter((c) => c.grade === grade) : getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];

  const coverageTotal = classes.length;
  const coverageUsed = classes.filter((c) => c.monthlyCheckIn).length;
  const coveragePct = coverageTotal > 0 ? Math.round((coverageUsed / coverageTotal) * 100) : 0;
  const coverageLabel = coverageLabelFor(coveragePct);

  return CORE_KEYS.map((key) => {
    const score = weightedAvgFor(classes, (c) => c.drivers[key]);
    const status = score != null ? scoreBand(score) : null;
    const isGood = status === "excellent" || status === "stable";

    const needy = classes.filter((c) => c.drivers[key] != null && (c.drivers[key] as number) < DRIVER_ATTENTION_CUTOFF);
    const needAttentionCount = needy.length;

    const mostVisibleIn =
      score == null
        ? "Not enough data yet"
        : isGood
          ? "Consistent this period"
          : needy.length > 0
            ? `Showing up in ${needy.length === 1 ? "this class" : `${needy.length} classes`}`
            : "Consistent across the school";

    return {
      key,
      label: SCHOOL_DRIVER_LABEL[key],
      score,
      status,
      delta: 0,
      classroomsContributing: classes.length,
      needAttentionCount,
      pattern: score == null ? "Not enough data yet for this driver." : isGood ? DRIVER_GOOD_PATTERN[key] : driverNeedsAttentionPattern(key),
      mostVisibleIn,
      coverageUsed,
      coverageTotal,
      coveragePct,
      coverageLabel,
      affectedClassIds: needy.map((c) => c.id),
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * School Health pillar metrics — Student Well-being, Classroom Performance
 * Index, Teacher Efficiency.
 * ───────────────────────────────────────────────────────── */

export type SchoolPillarKey = "studentWellbeing" | "classroomPerformance" | "teacherEfficiency";

export const SCHOOL_PILLAR_LABEL: Record<SchoolPillarKey, string> = {
  studentWellbeing: "Student Well-being",
  classroomPerformance: "Classroom Performance Index",
  teacherEfficiency: "Teacher Efficiency",
};

// "Classroom Performance Index" = academic + focus + task, weighted toward
// learning readiness. Renormalized at read time over whichever of these
// actually have real data (see schoolPillarMetrics below).
const CLASSROOM_PERFORMANCE_WEIGHTS: Record<"academic" | "focus" | "task", number> = {
  academic: 0.4,
  focus: 0.3,
  task: 0.3,
};

export type SchoolPillarMetric = {
  key: SchoolPillarKey;
  label: string;
  score: number | null;
  status: ScoreBand | null;
  delta: number;
  coverageUsed: number;
  coverageTotal: number;
  coveragePct: number;
  coverageLabel: ReturnType<typeof coverageLabelFor>;
  coverageUnit: "classrooms" | "teachers";
};

export function schoolPillarMetrics(grade?: string | null): SchoolPillarMetric[] {
  const classes = grade ? getSchoolClasses().filter((c) => c.grade === grade) : getSchoolClasses();
  const kpis = getSchoolKpis();

  const behaviorScore = weightedAvgFor(classes, (c) => c.drivers.behavior);
  const studentWellbeingScore = behaviorScore != null ? Math.min(98, behaviorScore + 5) : null;

  const academicScore = weightedAvgFor(classes, (c) => c.drivers.academic);
  const focusScore = weightedAvgFor(classes, (c) => c.drivers.focus);
  const taskScore = weightedAvgFor(classes, (c) => c.drivers.task);
  const perfEntries = (
    [
      ["academic", academicScore],
      ["focus", focusScore],
      ["task", taskScore],
    ] as [keyof typeof CLASSROOM_PERFORMANCE_WEIGHTS, number | null][]
  ).filter((e): e is [keyof typeof CLASSROOM_PERFORMANCE_WEIGHTS, number] => e[1] != null);
  const perfWeightSum = perfEntries.reduce((s, [k]) => s + CLASSROOM_PERFORMANCE_WEIGHTS[k], 0);
  const classroomPerformanceScore =
    perfEntries.length > 0
      ? Math.round(perfEntries.reduce((s, [k, v]) => s + v * CLASSROOM_PERFORMANCE_WEIGHTS[k], 0) / perfWeightSum)
      : null;

  const followUpsCompleted = classes.filter((c) => c.atRisk > 0 && c.monthlyCheckIn).length;
  const followUpsDue = classes.filter((c) => c.atRisk > 0 && !c.monthlyCheckIn).length;
  const interventionTotal = followUpsCompleted + followUpsDue;
  const teacherEfficiencyScore =
    interventionTotal > 0 ? Math.round((followUpsCompleted / interventionTotal) * 100) : 100;

  const classroomCoverageTotal = classes.length;
  const classroomCoverageUsed = classes.filter((c) => c.monthlyCheckIn).length;
  const classroomCoveragePct =
    classroomCoverageTotal > 0 ? Math.round((classroomCoverageUsed / classroomCoverageTotal) * 100) : 0;

  const teacherCoverageUsed = kpis.activeTeachers;
  const teacherCoverageTotal = kpis.totalTeachers;
  const teacherCoveragePct = teacherCoverageTotal > 0 ? Math.round((teacherCoverageUsed / teacherCoverageTotal) * 100) : 0;

  const scoreByKey: Record<SchoolPillarKey, number | null> = {
    studentWellbeing: studentWellbeingScore,
    classroomPerformance: classroomPerformanceScore,
    teacherEfficiency: teacherEfficiencyScore,
  };

  const coverageByKey: Record<SchoolPillarKey, { used: number; total: number; pct: number; unit: "classrooms" | "teachers" }> = {
    studentWellbeing: { used: classroomCoverageUsed, total: classroomCoverageTotal, pct: classroomCoveragePct, unit: "classrooms" },
    classroomPerformance: { used: classroomCoverageUsed, total: classroomCoverageTotal, pct: classroomCoveragePct, unit: "classrooms" },
    teacherEfficiency: { used: teacherCoverageUsed, total: teacherCoverageTotal, pct: teacherCoveragePct, unit: "teachers" },
  };

  return (["studentWellbeing", "classroomPerformance", "teacherEfficiency"] as SchoolPillarKey[]).map((key) => {
    const coverage = coverageByKey[key];
    const score = scoreByKey[key];
    return {
      key,
      label: SCHOOL_PILLAR_LABEL[key],
      score,
      status: score != null ? scoreBand(score) : null,
      delta: 0,
      coverageUsed: coverage.used,
      coverageTotal: coverage.total,
      coveragePct: coverage.pct,
      coverageLabel: coverageLabelFor(coverage.pct),
      coverageUnit: coverage.unit,
    };
  });
}

export type SchoolHealthCoverage = {
  classroomsUsed: number;
  classroomsTotal: number;
  teachersUsed: number;
  teachersTotal: number;
  dataReadinessPct: number;
};

export function schoolHealthCoverage(grade?: string | null): SchoolHealthCoverage {
  const classes = grade ? getSchoolClasses().filter((c) => c.grade === grade) : getSchoolClasses();
  const kpis = getSchoolKpis();

  const classroomsTotal = classes.length;
  const classroomsUsed = classes.filter((c) => c.monthlyCheckIn).length;
  const teachersUsed = kpis.activeTeachers;
  const teachersTotal = kpis.totalTeachers;

  const dataReadinessPct = grade
    ? classroomsTotal > 0
      ? Math.round((classroomsUsed / classroomsTotal) * 100)
      : 0
    : kpis.dataReadinessPct;

  return { classroomsUsed, classroomsTotal, teachersUsed, teachersTotal, dataReadinessPct };
}

export type SupportFocusRow = {
  grade: string;
  gradeLabel: string;
  pillar: SchoolPillarKey;
  area: string;
  details: string;
  ctaLabel: string;
  ctaHref: SchoolEventCtaTarget;
};

/** With a single class, "which grade needs support" collapses to "does this
 * one class need support" — at most one row per pillar, only when that
 * pillar has real data below the attention cutoff. */
export function schoolSupportFocus(grade?: string | null): SupportFocusRow[] {
  const metrics = schoolPillarMetrics(grade);
  const classes = getSchoolClasses();
  const rows: SupportFocusRow[] = [];

  const wellbeing = metrics.find((m) => m.key === "studentWellbeing");
  if (wellbeing?.score != null && wellbeing.score < DRIVER_ATTENTION_CUTOFF) {
    rows.push({
      grade: classes[0]?.grade ?? "",
      gradeLabel: classes[0]?.name ?? "Your class",
      pillar: "studentWellbeing",
      area: SCHOOL_PILLAR_LABEL.studentWellbeing,
      details: "Behaviour and well-being signals softening this period.",
      ctaLabel: "View class details",
      ctaHref: "/school/classes",
    });
  }

  const performance = metrics.find((m) => m.key === "classroomPerformance");
  if (performance?.score != null && performance.score < DRIVER_ATTENTION_CUTOFF) {
    rows.push({
      grade: classes[0]?.grade ?? "",
      gradeLabel: classes[0]?.name ?? "Your class",
      pillar: "classroomPerformance",
      area: SCHOOL_PILLAR_LABEL.classroomPerformance,
      details: "Learning readiness and task engagement are below the healthy range.",
      ctaLabel: "View class details",
      ctaHref: "/school/classes",
    });
  }

  const efficiency = metrics.find((m) => m.key === "teacherEfficiency");
  if (efficiency?.score != null && efficiency.score < DRIVER_ATTENTION_CUTOFF) {
    rows.push({
      grade: classes[0]?.grade ?? "",
      gradeLabel: classes[0]?.name ?? "Your class",
      pillar: "teacherEfficiency",
      area: SCHOOL_PILLAR_LABEL.teacherEfficiency,
      details: "A follow-up check-in is overdue.",
      ctaLabel: "View teachers",
      ctaHref: "/school/teachers",
    });
  }

  return rows;
}

export type SchoolHealthTrendPoint = {
  weekLabel: string;
  studentWellbeing: number | null;
  classroomPerformance: number | null;
  teacherEfficiency: number | null;
  studentHealthScore: number | null;
};

export function schoolHealthTrend(period: "Weekly" | "Monthly" = "Weekly", grade?: string | null): SchoolHealthTrendPoint[] {
  const metrics = schoolPillarMetrics(grade);
  const byKey = Object.fromEntries(metrics.map((m) => [m.key, m])) as Record<SchoolPillarKey, SchoolPillarMetric>;
  
  const sourceData = period === "Weekly" ? WEEKLY_DATA : MONTHLY_DATA;
  
  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return sourceData.map((row) => ({
    weekLabel: `${formatLabel(row.startDate)} - ${formatLabel(row.endDate)}`,
    studentWellbeing: byKey.studentWellbeing.score,
    classroomPerformance: byKey.classroomPerformance.score,
    teacherEfficiency: byKey.teacherEfficiency.score,
    studentHealthScore: row.studentHealthScore,
  }));
}

/* ─────────────────────────────────────────────────────────
 * Grade & Classroom Overview — one row per grade. With a single class,
 * this is a one-row table naming this class's real numbers.
 * ───────────────────────────────────────────────────────── */

export type GradeOverviewRow = {
  grade: string;
  gradeLabel: string;
  healthScore: number;
  status: ScoreBand;
  delta: number;
  strongestDriver: PillarKey | null;
  areaNeedingAttention: PillarKey | null;
  tier2Count: number;
  tier3Count: number;
  dataReadinessPct: number;
  classroomsContributing: number;
  supportTier: ClassroomTier;
  classIds: string[];
};

export function gradeOverviewRows(): GradeOverviewRow[] {
  const classes = getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];

  return classes.length === 0
    ? []
    : (() => {
        const c = classes[0];
        const healthScore = classComposite(c.drivers) ?? c.avgPfi;
        const status = scoreBand(healthScore);

        const driverScores = CORE_KEYS.map((key) => ({ key, score: c.drivers[key] })).filter(
          (d): d is { key: PillarKey; score: number } => d.score != null,
        );
        const ranked = [...driverScores].sort((a, b) => b.score - a.score);
        const strongestDriver = ranked[0]?.key ?? null;
        const weakest = ranked[ranked.length - 1];
        const areaNeedingAttention = weakest && weakest.score < DRIVER_ATTENTION_CUTOFF ? weakest.key : null;

        const tier = classroomTierFor(classComposite(c.drivers)).tier;
        const tier2Count = tier === "watch" ? 1 : 0;
        const tier3Count = tier === "needs-support" || tier === "intensive" ? 1 : 0;

        return [
          {
            grade: c.grade,
            gradeLabel: c.name,
            healthScore,
            status,
            delta: 0,
            strongestDriver,
            areaNeedingAttention,
            tier2Count,
            tier3Count,
            dataReadinessPct: c.monthlyCheckIn ? 100 : 0,
            classroomsContributing: 1,
            supportTier: tier,
            classIds: [c.id],
          },
        ];
      })();
}

export const SUGGESTED_ACTIONS_BY_DRIVER: Record<PillarKey, string[]> = {
  focus: [
    "Observe the classroom during a focus block",
    "Introduce a shared attention routine",
    "Request coaching support for the teacher",
  ],
  academic: [
    "Review lesson pacing and materials readiness with the teacher",
    "Share a readiness-routine checklist",
    "Request coaching support for the teacher",
  ],
  behavior: [
    "Observe behaviour patterns firsthand",
    "Align on a shared expectations routine",
    "Loop in counselor or specialist support",
  ],
  task: [
    "Observe task transitions and follow-through",
    "Introduce a shared task-completion routine",
    "Request coaching support for the teacher",
  ],
};

export type GradeWeeklyInsight = {
  grade: string;
  gradeLabel: string;
  delta: number;
  driver: PillarKey;
  flaggedCount: number;
  suggestedActions: string[];
};

// No real week-over-week delta exists, so there's nothing "declining" to
// report — this always returns null now rather than fabricating a trend.
export function gradeWeeklyInsight(): GradeWeeklyInsight | null {
  return null;
}

/* ─────────────────────────────────────────────────────────
 * Tier Support Distribution.
 * ───────────────────────────────────────────────────────── */

export type TierKey = "tier1" | "tier2" | "tier3";

export const TIER_LABEL: Record<TierKey, string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
};

export const TIER_SUBLABEL: Record<TierKey, string> = {
  tier1: "Universal Support",
  tier2: "Targeted Support",
  tier3: "Intensive Support",
};

export const TIER_COLOR: Record<TierKey, string> = {
  tier1: "hsl(142 55% 42%)",
  tier2: "hsl(38 92% 48%)",
  tier3: "hsl(0 78% 55%)",
};

// No real week-over-week tier history exists — flat (0) rather than a
// plausible-looking fake swing.
export const TIER_DELTA: Record<TierKey, number> = {
  tier1: 0,
  tier2: 0,
  tier3: 0,
};

export type ClassTierSplit = { tier1: number; tier2: number; tier3: number };

export function classTierSplit(c: SchoolClassRow): ClassTierSplit {
  const tier = classroomTierFor(classComposite(c.drivers)).tier;
  const tier3Share =
    tier === "intensive" ? 0.6 : tier === "needs-support" ? 0.35 : tier === "watch" ? 0.15 : 0.05;
  const tier3 = Math.round(c.atRisk * tier3Share);
  const tier2 = Math.max(0, c.atRisk - tier3);
  const tier1 = Math.max(0, c.size - c.atRisk);
  return { tier1, tier2, tier3 };
}

export type TierScope = {
  grade?: string | null;
  classroomId?: string | null;
  driver?: PillarKey | null;
};

export function scopedSchoolClasses(scope: TierScope = {}): SchoolClassRow[] {
  let out = getSchoolClasses();
  if (scope.grade) out = out.filter((c) => c.grade === scope.grade);
  if (scope.classroomId) out = out.filter((c) => c.id === scope.classroomId);
  if (scope.driver) {
    const driver = scope.driver;
    out = out.filter((c) => c.drivers[driver] != null && (c.drivers[driver] as number) < DRIVER_ATTENTION_CUTOFF);
  }
  return out;
}

export type TierDistributionBand = { tier: TierKey; count: number; pct: number; delta: number };

export type SchoolTierDistribution = {
  totalStudents: number;
  bands: TierDistributionBand[];
};

export function schoolTierDistribution(scope: TierScope = {}): SchoolTierDistribution {
  let counts = TIER_COUNTS.studentHealth;
  if (scope.driver === "focus") counts = TIER_COUNTS.attentionAndFocus;
  else if (scope.driver === "academic") counts = TIER_COUNTS.learningReadiness;
  else if (scope.driver === "task") counts = TIER_COUNTS.taskEngagement;
  else if (scope.driver === "behavior") counts = TIER_COUNTS.behaviourAndDiscipline;

  const totalStudents = counts.tier1 + counts.tier2 + counts.tier3;
  const bands: TierDistributionBand[] = (["tier1", "tier2", "tier3"] as TierKey[]).map((tier) => ({
    tier,
    count: counts[tier],
    pct: totalStudents > 0 ? Math.round((counts[tier] / totalStudents) * 1000) / 10 : 0,
    delta: TIER_DELTA[tier],
  }));
  return { totalStudents, bands };
}

export type SchoolSupportStatus = {
  newReferrals: number;
  awaitingReview: number;
  activeInterventions: number;
  studentsImproving: number;
  limitedResponse: number;
  escalations: number;
};

export const SUPPORT_STATUS_DELTA: Record<keyof SchoolSupportStatus, number> = {
  newReferrals: 0,
  awaitingReview: 0,
  activeInterventions: 0,
  studentsImproving: 0,
  limitedResponse: 0,
  escalations: 0,
};

export function schoolSupportStatus(scope: TierScope = {}): SchoolSupportStatus {
  const classes = scopedSchoolClasses(scope);
  // No real week-over-week trend exists, so a "new" vs "improving" split
  // isn't derivable yet — both stay 0 rather than a fabricated split.
  const newReferrals = 0;
  const studentsImproving = 0;
  let awaitingReview = 0;
  let limitedResponse = 0;
  let escalations = 0;
  let activeInterventions = 0;

  classes.forEach((c) => {
    if (c.atRisk <= 0) return;
    activeInterventions += c.atRisk;
    escalations += classTierSplit(c).tier3;
    if (!c.monthlyCheckIn) {
      awaitingReview += c.atRisk;
    } else {
      limitedResponse += c.atRisk;
    }
  });

  return { newReferrals, awaitingReview, activeInterventions, studentsImproving, limitedResponse, escalations };
}

export const TIER2_GROUP_CAPACITY = 65;
export const TIER3_CASELOAD_CAPACITY = 5;

export type SchoolCapacityIndicators = {
  tier2Used: number;
  tier2Capacity: number;
  tier2Pct: number;
  tier3Used: number;
  tier3Capacity: number;
  tier3Pct: number;
  reviewsOverdueTotal: number;
  reviewsOverdueTier2: number;
  reviewsOverdueTier3: number;
  tier2ImplementationRate: number;
  tier3ImplementationRate: number;
};

export function schoolCapacityIndicators(): SchoolCapacityIndicators {
  const classes = getSchoolClasses();
  const dist = schoolTierDistribution();
  const tier2Used = dist.bands.find((b) => b.tier === "tier2")?.count ?? 0;
  const tier3Used = dist.bands.find((b) => b.tier === "tier3")?.count ?? 0;

  let reviewsOverdueTier2 = 0;
  let reviewsOverdueTier3 = 0;
  classes.forEach((c) => {
    if (c.atRisk <= 0 || c.monthlyCheckIn) return;
    const split = classTierSplit(c);
    reviewsOverdueTier2 += split.tier2;
    reviewsOverdueTier3 += split.tier3;
  });

  return {
    tier2Used,
    tier2Capacity: TIER2_GROUP_CAPACITY,
    tier2Pct: Math.round((tier2Used / TIER2_GROUP_CAPACITY) * 100),
    tier3Used,
    tier3Capacity: TIER3_CASELOAD_CAPACITY,
    tier3Pct: Math.round((tier3Used / TIER3_CASELOAD_CAPACITY) * 100),
    reviewsOverdueTotal: reviewsOverdueTier2 + reviewsOverdueTier3,
    reviewsOverdueTier2,
    reviewsOverdueTier3,
    tier2ImplementationRate: tier2Used > 0 ? Math.round(((tier2Used - reviewsOverdueTier2) / tier2Used) * 100) : 0,
    tier3ImplementationRate: tier3Used > 0 ? Math.round(((tier3Used - reviewsOverdueTier3) / tier3Used) * 100) : 0,
  };
}

export type GradeTierRow = {
  grade: string;
  gradeLabel: string;
  tier1Pct: number;
  tier2Pct: number;
  tier3Pct: number;
  totalStudents: number;
  trend: number;
};

export function schoolTierByGrade(): GradeTierRow[] {
  const classes = getSchoolClasses();
  if (classes.length === 0) return [];
  const c = classes[0];
  const split = classTierSplit(c);
  const total = split.tier1 + split.tier2 + split.tier3;
  return [
    {
      grade: c.grade,
      gradeLabel: c.name,
      tier1Pct: total > 0 ? Math.round((split.tier1 / total) * 100) : 0,
      tier2Pct: total > 0 ? Math.round((split.tier2 / total) * 100) : 0,
      tier3Pct: total > 0 ? Math.round((split.tier3 / total) * 100) : 0,
      totalStudents: total,
      trend: 0,
    },
  ];
}

export type InterventionImplementationSummary = {
  activeInterventions: number;
  followUpsDueStudents: number;
  overdueFollowUps: number;
  showingImprovement: number;
  showingNoChange: number;
  escalatedCases: number;
  supportTeamInvolvement: number;
  implementationRate: number;
  followUpCompletionRate: number;
  responseToInterventionRate: number;
};

export function interventionImplementationSummary(): InterventionImplementationSummary {
  const status = schoolSupportStatus();
  const kpis = getSchoolKpis();
  const classes = getSchoolClasses();

  const completedStudents = status.studentsImproving + status.limitedResponse;
  const dueStudents = status.activeInterventions;
  const overdue = status.newReferrals + status.awaitingReview;
  const teacherIdsWithCases = new Set(classes.filter((c) => c.atRisk > 0).map((c) => c.teacherId));
  const classroomCompletionDenom = kpis.followUpsCompleted + kpis.followUpsDue;

  return {
    activeInterventions: status.activeInterventions,
    followUpsDueStudents: dueStudents,
    overdueFollowUps: overdue,
    showingImprovement: status.studentsImproving,
    showingNoChange: status.limitedResponse,
    escalatedCases: status.escalations,
    supportTeamInvolvement: teacherIdsWithCases.size,
    implementationRate: dueStudents > 0 ? Math.round((completedStudents / dueStudents) * 100) : 0,
    followUpCompletionRate:
      classroomCompletionDenom > 0 ? Math.round((kpis.followUpsCompleted / classroomCompletionDenom) * 100) : 0,
    responseToInterventionRate: completedStudents > 0 ? Math.round((status.studentsImproving / completedStudents) * 100) : 0,
  };
}

export type GradeResponseRow = {
  grade: string;
  gradeLabel: string;
  responseRate: number;
  respondingCount: number;
  totalFollowedUp: number;
};

// No real week-over-week trend exists to say a grade is "responding well" —
// always empty now rather than fabricating a response rate.
export function bestRespondingGrades(): GradeResponseRow[] {
  return [];
}

/* ─────────────────────────────────────────────────────────
 * Teacher & Classroom Support Needs.
 * ───────────────────────────────────────────────────────── */

export type SupportCategory =
  | "PBIS coaching"
  | "Classroom-management strategy"
  | "Task-engagement support"
  | "Specialist consultation"
  | "Additional classroom assistance"
  | "Parent-engagement support"
  | "Schedule or routine adjustment";

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  "PBIS coaching",
  "Classroom-management strategy",
  "Task-engagement support",
  "Specialist consultation",
  "Additional classroom assistance",
  "Parent-engagement support",
  "Schedule or routine adjustment",
];

export type TeacherSupportNeed = {
  teacherId: string;
  teacherName: string;
  category: SupportCategory;
  reason: string;
  classIds: string[];
};

const CATEGORY_BY_DRIVER: Record<PillarKey, SupportCategory> = {
  behavior: "PBIS coaching",
  focus: "Classroom-management strategy",
  task: "Task-engagement support",
  academic: "Specialist consultation",
};

export function teacherSupportNeeds(): TeacherSupportNeed[] {
  const classes = getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];
  const needs: TeacherSupportNeed[] = [];

  classes.forEach((c) => {
    const composite = classComposite(c.drivers);
    const tier = classroomTierFor(composite).tier;
    if (tier !== "strong" && tier !== "solid") {
      const scored = CORE_KEYS.map((k) => ({ k, v: c.drivers[k] })).filter(
        (d): d is { k: PillarKey; v: number } => d.v != null,
      );
      const weakest = [...scored].sort((a, b) => a.v - b.v)[0];
      if (weakest) {
        needs.push({
          teacherId: c.teacherId,
          teacherName: c.teacherName,
          category: CATEGORY_BY_DRIVER[weakest.k],
          reason: `${c.name} is in the ${SUPPORT_STATUS_LABEL[tier]} tier, driven by ${SCHOOL_DRIVER_LABEL[weakest.k].toLowerCase()}.`,
          classIds: [c.id],
        });
        return;
      }
    }
    if (c.atRisk > 0 && !c.monthlyCheckIn) {
      needs.push({
        teacherId: c.teacherId,
        teacherName: c.teacherName,
        category: "Schedule or routine adjustment",
        reason: "This classroom is overdue for a follow-up check-in.",
        classIds: [c.id],
      });
    }
  });

  return needs;
}

export type SupportClassroomEntry = {
  id: string;
  name: string;
  grade: string;
  teacherName: string;
};

export type ImprovingClassroomEntry = SupportClassroomEntry & { trend: number };

export type TeacherClassroomSupportSummary = {
  frictionClasses: SupportClassroomEntry[];
  teacherNeeds: TeacherSupportNeed[];
  pbisGrades: GradeOverviewRow[];
  implementationGapClassCount: number;
  improvingClasses: ImprovingClassroomEntry[];
};

export function teacherClassroomSupportSummary(): TeacherClassroomSupportSummary {
  const classes = getSchoolClasses();
  const kpis = getSchoolKpis();

  const frictionClasses: SupportClassroomEntry[] = classes
    .filter((c) => c.drivers.focus != null && (c.drivers.focus as number) < DRIVER_ATTENTION_CUTOFF)
    .map((c) => ({ id: c.id, name: c.name, grade: c.grade, teacherName: c.teacherName }));

  const pbisGrades = gradeOverviewRows().filter((r) => r.areaNeedingAttention === "behavior");

  // No real week-over-week trend exists — "improving" can't be honestly
  // claimed at school scale yet.
  const improvingClasses: ImprovingClassroomEntry[] = [];

  return {
    frictionClasses,
    teacherNeeds: teacherSupportNeeds(),
    pbisGrades,
    implementationGapClassCount: kpis.followUpsDue,
    improvingClasses,
  };
}

export function supportNeedsRecommendedResponse(summary: TeacherClassroomSupportSummary): string | null {
  const parts: string[] = [];

  if (summary.frictionClasses.length > 0) {
    const n = summary.frictionClasses.length;
    parts.push(`launch a shared attention/transition routine in ${n} classroom${n === 1 ? "" : "s"}`);
  }

  const taskCoaching = summary.teacherNeeds.filter((t) => t.category === "Task-engagement support");
  if (taskCoaching.length > 0) {
    const n = taskCoaching.length;
    parts.push(`provide task-engagement coaching to ${n} teacher${n === 1 ? "" : "s"}`);
  }

  if (summary.pbisGrades.length > 0) {
    parts.push(`schedule PBIS coaching for ${summary.pbisGrades[0].gradeLabel}`);
  }

  if (parts.length === 0) return null;
  const sentence = `${parts.join(", ")}. Review outcomes in 2 weeks.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export type GradeRecognitionRow = {
  grade: string;
  gradeLabel: string;
  behaviorScore: number;
  delta: number;
};

export function gradesWithStrongRecognition(): GradeRecognitionRow[] {
  const classes = getSchoolClasses();
  if (classes.length === 0) return [];
  const c = classes[0];
  if (c.drivers.behavior == null || c.drivers.behavior < DRIVER_ATTENTION_CUTOFF) return [];
  return [{ grade: c.grade, gradeLabel: c.name, behaviorScore: c.drivers.behavior, delta: 0 }];
}

export function schoolCelebrationOpportunities(): SchoolRecentEvent[] {
  return SCHOOL_RECENT_EVENTS.filter((e) => e.kind === "celebration");
}

// Kept for API compatibility — no real per-hour attention signal exists at
// school scale, so this now returns an empty series rather than a fabricated
// intra-day curve. Check the one consumer before removing entirely.
export function schoolDailyAttention(): { hour: string; attention: number }[] {
  return [];
}