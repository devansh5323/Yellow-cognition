// School-level mock data for the admin dashboard demo.
// Stable, deterministic — no random per-render changes.

import { scoreBand, type PillarKey, type ScoreBand } from "@/lib/classHealth";

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

/** The 4 core drivers shared with the teacher dashboard, computed per class —
 * used to build the school-wide School Health Score and classroom distribution. */
export type ClassDrivers = Record<PillarKey, number>;

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
  /** Every classroom any teacher owns, connected or not (includes invited/pending teachers' declared classes). */
  totalClassrooms: number;
  /** Classrooms whose teacher has an active account, i.e. actually exist in the roster. */
  classroomsConnected: number;
  /** Classrooms with atRisk students whose teacher HAS checked in this period —
   * a proxy for "being actively followed up on," since no per-student
   * follow-up log exists at school scale (unlike the single-teacher demo). */
  followUpsCompleted: number;
  /** Classrooms with atRisk students whose teacher has NOT checked in —
   * the complementary proxy for "still needs a follow-up review." */
  followUpsDue: number;
  /** Composite of 3 real coverage ratios: classroom connection, teacher
   * activity, and check-in completion — not a fabricated single number. */
  dataReadinessPct: number;
};

const FIRST_NAMES = [
  "Maya",
  "Arjun",
  "Priya",
  "Ravi",
  "Anjali",
  "Vikram",
  "Neha",
  "Karan",
  "Aditi",
  "Rohit",
  "Sara",
  "Aman",
  "Divya",
  "Ishan",
  "Rhea",
  "Kabir",
  "Zara",
  "Nikhil",
  "Tara",
  "Dev",
  "Mira",
  "Yash",
];
const LAST_NAMES = [
  "Sharma",
  "Kapoor",
  "Reddy",
  "Iyer",
  "Khan",
  "Patel",
  "Mehta",
  "Singh",
  "Das",
  "Rao",
  "Verma",
  "Joshi",
  "Nair",
  "Desai",
  "Bose",
  "Chopra",
];
const SUBJECTS = [
  "Math",
  "ELA",
  "Science",
  "Social Studies",
  "Art",
  "Music",
  "PE",
  "World Language",
];
const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildTeachers(): SchoolTeacher[] {
  const out: SchoolTeacher[] = [];
  const total = 18;
  for (let i = 0; i < total; i++) {
    const name = `${pick(FIRST_NAMES, i * 7 + 1)} ${pick(LAST_NAMES, i * 11 + 3)}`;
    const subject = pick(SUBJECTS, i * 3);
    const grade = pick(GRADES, i * 2 + 1);
    const section = pick(SECTIONS, i + 1);
    const classes = [`Grade ${grade} · ${section}`];
    if (i % 4 === 0) {
      const g2 = pick(GRADES, i * 5 + 2);
      classes.push(`Grade ${g2} · ${pick(SECTIONS, i + 2)}`);
    }
    const studentCount = 18 + ((i * 7) % 12);
    const avgPfi = 58 + ((i * 13) % 28);
    const pfiTrend = ((i * 5) % 11) - 5;
    let status: TeacherStatus = "active";
    if (i === 2 || i === 8 || i === 13) status = "dormant";
    else if (i === 4 || i === 11) status = "invited";
    else if (i === 17) status = "pending";

    out.push({
      id: `t_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      initials: initialsOf(name),
      subject,
      classes,
      studentCount,
      avgPfi,
      pfiTrend,
      status,
      lastActiveDays: status === "active" ? i % 3 : status === "dormant" ? 9 + (i % 8) : undefined,
      joinedDaysAgo: status === "active" || status === "dormant" ? 30 + i * 4 : undefined,
      invitedDaysAgo: status === "invited" ? 2 + (i % 5) : status === "pending" ? 8 : undefined,
    });
  }
  return out;
}

function buildClasses(teachers: SchoolTeacher[]): SchoolClassRow[] {
  const out: SchoolClassRow[] = [];
  let id = 0;
  teachers.forEach((t) => {
    if (t.status === "invited" || t.status === "pending") return;
    t.classes.forEach((cl) => {
      const [, gradeRaw, section] = cl.match(/Grade ([^\s]+) · ([A-Z])/) ?? [];
      const grade = gradeRaw ?? "3";
      const sec = section ?? "A";
      const size = t.studentCount + ((id * 3) % 5) - 2;
      const avgPfi = Math.max(40, Math.min(94, t.avgPfi + ((id * 7) % 9) - 4));
      const trend = ((id * 5) % 11) - 5;
      const atRisk = Math.max(0, Math.round(size * (0.12 + ((id * 3) % 7) / 100) - (id % 2)));
      const monthlyCheckIn = id % 4 !== 0;
      const engagementPct = 60 + ((id * 11) % 32);
      // A per-class jitter distinct from avgPfi's own jitter, so the 4 drivers
      // read as related-but-independent signals rather than the same number
      // relabeled 4 times.
      const jitter = (salt: number) => ((id * (11 + salt * 4)) % 21) - 10;
      const clampDriver = (v: number) => Math.max(20, Math.min(98, Math.round(v)));
      const drivers: ClassDrivers = {
        focus: clampDriver(avgPfi + jitter(1)),
        academic: clampDriver(avgPfi - 3 + jitter(2)),
        behavior: clampDriver(avgPfi + 6 - atRisk * 1.2 + jitter(3)),
        task: clampDriver(engagementPct + jitter(4)),
      };
      out.push({
        id: `c_${++id}`,
        name: cl,
        grade,
        section: sec,
        teacherId: t.id,
        teacherName: t.name,
        size,
        avgPfi,
        pfiTrend: trend,
        atRisk,
        monthlyCheckIn,
        engagementPct,
        drivers,
      });
    });
  });
  return out;
}

function computeKpis(teachers: SchoolTeacher[], classes: SchoolClassRow[]): SchoolKpis {
  const active = teachers.filter((t) => t.status === "active").length;
  const invited = teachers.filter((t) => t.status === "invited").length;
  const pending = teachers.filter((t) => t.status === "pending").length;
  const totalStudents = classes.reduce((acc, c) => acc + c.size, 0);
  const atRiskCount = classes.reduce((acc, c) => acc + c.atRisk, 0);
  const sumPfi = classes.reduce((acc, c) => acc + c.avgPfi * c.size, 0);
  const avgSchoolPfi = totalStudents > 0 ? Math.round(sumPfi / totalStudents) : 0;
  const monthlyCheckInsDone = classes.filter((c) => c.monthlyCheckIn).length;
  const totalClassrooms = teachers.reduce((acc, t) => acc + t.classes.length, 0);
  const classroomsConnected = classes.length;
  const followUpsCompleted = classes.filter((c) => c.atRisk > 0 && c.monthlyCheckIn).length;
  const followUpsDue = classes.filter((c) => c.atRisk > 0 && !c.monthlyCheckIn).length;
  const connectionRatio = totalClassrooms > 0 ? classroomsConnected / totalClassrooms : 0;
  const activityRatio = teachers.length > 0 ? active / teachers.length : 0;
  const checkInRatio = classes.length > 0 ? monthlyCheckInsDone / classes.length : 0;
  const dataReadinessPct = Math.round(
    ((connectionRatio + activityRatio + checkInRatio) / 3) * 100,
  );
  return {
    totalStudents,
    totalTeachers: teachers.length,
    activeTeachers: active,
    invitedTeachers: invited,
    pendingTeachers: pending,
    avgSchoolPfi,
    avgPfiTrend: 4,
    atRiskCount,
    atRiskPct: totalStudents > 0 ? Math.round((atRiskCount / totalStudents) * 100) : 0,
    monthlyCheckInsDone,
    monthlyCheckInsTotal: classes.length,
    parentActivationPct: 64,
    parentActivationTrend: 7,
    totalClassrooms,
    classroomsConnected,
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

// Intra-day attention curve — 8 points across the school day, used as a
// secondary signal alongside the monthly check-in. Hour-of-day, not cadence.
export function schoolDailyAttention(): { hour: string; attention: number }[] {
  const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"];
  const PFI = [62, 71, 78, 81, 74, 67, 70, 65];
  return HOURS.map((h, i) => ({ hour: h, attention: PFI[i] }));
}

export const TEACHER_LEADERBOARD = (() => {
  const ranked = [...TEACHERS]
    .filter((t) => t.status === "active" || t.status === "dormant")
    .sort((a, b) => b.avgPfi - a.avgPfi);
  return {
    top: ranked.slice(0, 5),
    needsSupport: ranked.slice(-5).reverse(),
  };
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

export const SCHOOL_RECENT_EVENTS: SchoolRecentEvent[] = [
  {
    id: "e5",
    kind: "alert",
    severity: "critical",
    title: "Class 3 readiness dropped 8 pts",
    body: "Grade 3 · 28 students — focus and task initiation softened over the last two weeks.",
    time: "2d ago",
    recommend: {
      title: "Add a 3-min focus warm-up before core blocks",
      reason:
        "Short focus drills lift task initiation by ~14% in similar Grade 3 cohorts within two weeks.",
    },
    cta: { label: "View class", to: "/school/classes" },
  },
  {
    id: "e2",
    kind: "alert",
    severity: "warning",
    title: "3 classes haven't run this month's check-in",
    body: "Grades 6B, 7A, 8C are due — auto-nudge sent to teachers.",
    time: "Today",
    recommend: {
      title: "Pair the nudge with a 5-min co-plan slot",
      reason:
        "Lead teachers in these sections reported scheduling friction; a co-plan slot recovers ~12 mins/class in week one.",
    },
    cta: { label: "Open class list", to: "/school/classes" },
  },
  {
    id: "e6",
    kind: "alert",
    severity: "warning",
    title: "Disruption events up 18% in Science blocks",
    body: "Grade 6–8 Science · transitions between lab segments absorbing teaching time.",
    time: "Yesterday",
    recommend: {
      title: "Cue lab transitions with a visible 60-sec timer",
      reason:
        "Visible timers cut transition loss by ~30% across the cohorts running them this term.",
    },
    cta: { label: "Coach teachers", to: "/school/teachers" },
  },
  {
    id: "e1",
    kind: "celebration",
    title: "Grade 4 · Section B led the school this month",
    body: "Highest sustained focus in this month's check-in.",
    time: "1h ago",
    cta: { label: "View class", to: "/school/classes" },
  },
  {
    id: "e4",
    kind: "celebration",
    title: "Parent activation crossed 60%",
    body: "238 of 376 families now active in the Yellow app.",
    time: "2d ago",
  },
  {
    id: "e3",
    kind: "info",
    title: "Monthly all-staff digest scheduled",
    body: "Goes out at month-end to 18 teachers and 2 admins.",
    time: "Yesterday",
  },
];

/* ─────────────────────────────────────────────────────────
 * School Health Score — the principal's north-star metric.
 * Summarises the same 4 core drivers as the teacher dashboard
 * (Attention & Focus, Learning Readiness, Behaviour & Discipline,
 * Task Engagement) plus 2 school-wide-only drivers (Positive Behaviour,
 * Intervention Response), aggregated across every classroom.
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

// Small fixed week-over-week deltas — the same "hardcoded but plausible"
// convention already used for avgPfiTrend/parentActivationTrend above, since
// no real per-driver history is tracked at school scale yet.
const SCHOOL_DRIVER_DELTA: Record<SchoolDriverKey, number> = {
  focus: 2,
  academic: 1,
  behavior: 3,
  task: -2,
  positiveBehavior: 4,
  interventionResponse: 1,
};

// Same 30/30/20/20 weighting as the teacher dashboard's Classroom Health
// Score, applied per class so "classroom distribution" tiers stay consistent
// with what a teacher would see for their own class.
const CLASS_COMPOSITE_WEIGHTS: Record<PillarKey, number> = {
  academic: 0.3,
  focus: 0.3,
  behavior: 0.2,
  task: 0.2,
};

function formatGradeList(grades: string[]): string {
  if (grades.length === 0) return "";
  if (grades.length === 1) return `Grade ${grades[0]}`;
  return `Grades ${grades.slice(0, -1).join(", ")} and ${grades[grades.length - 1]}`;
}

function weightedAvgFor(classes: SchoolClassRow[], pick: (c: SchoolClassRow) => number): number {
  const totalSize = classes.reduce((acc, c) => acc + c.size, 0) || 1;
  return Math.round(classes.reduce((acc, c) => acc + pick(c) * c.size, 0) / totalSize);
}

export function classComposite(drivers: ClassDrivers): number {
  return Math.round(
    drivers.academic * CLASS_COMPOSITE_WEIGHTS.academic +
      drivers.focus * CLASS_COMPOSITE_WEIGHTS.focus +
      drivers.behavior * CLASS_COMPOSITE_WEIGHTS.behavior +
      drivers.task * CLASS_COMPOSITE_WEIGHTS.task,
  );
}

export type ClassroomTier = "strong" | "solid" | "watch" | "needs-support" | "intensive";

type ClassroomTierDef = { tier: ClassroomTier; label: string; min: number; meaning: string };

const CLASSROOM_TIERS: ClassroomTierDef[] = [
  { tier: "strong", label: "Strong Support", min: 85, meaning: "High functioning with minimal concerns." },
  {
    tier: "solid",
    label: "Solid Support",
    min: 70,
    meaning: "Generally functioning well with minor areas to monitor.",
  },
  { tier: "watch", label: "Watch", min: 55, meaning: "Some concerns emerging; monitor closely." },
  {
    tier: "needs-support",
    label: "Needs Support",
    min: 40,
    meaning: "Multiple concerns impacting student outcomes.",
  },
  {
    tier: "intensive",
    label: "Intensive Support",
    min: 0,
    meaning: "Significant concerns requiring immediate support.",
  },
];

export function classroomTierFor(score: number): ClassroomTierDef {
  return CLASSROOM_TIERS.find((t) => score >= t.min) ?? CLASSROOM_TIERS[CLASSROOM_TIERS.length - 1];
}

// Same 5 underlying tiers as CLASSROOM_TIERS above, relabeled for the Grade &
// Classroom Overview segment to match its own PRD language — the boundaries
// and counts stay identical so both segments describe the same classrooms.
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
  score: number;
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
  strongest: SchoolDriverScore;
  weakest: SchoolDriverScore;
  distribution: ClassroomDistributionBand[];
};

export function schoolHealthOverview(): SchoolHealthOverview {
  const classes = getSchoolClasses();
  const kpis = getSchoolKpis();

  const perClassKeys: PillarKey[] = ["focus", "academic", "behavior", "task"];
  const driverScoreByKey = {} as Record<SchoolDriverKey, number>;
  perClassKeys.forEach((key) => {
    driverScoreByKey[key] = weightedAvgFor(classes, (c) => c.drivers[key]);
  });

  const interventionTotal = kpis.followUpsCompleted + kpis.followUpsDue;
  driverScoreByKey.interventionResponse =
    interventionTotal > 0 ? Math.round((kpis.followUpsCompleted / interventionTotal) * 100) : 100;
  // No dedicated positive-behaviour log exists at school scale yet — proxy
  // from the same class-level signals as "behavior," offset slightly since
  // celebrating positives tends to run a little ahead of discipline scores.
  driverScoreByKey.positiveBehavior = Math.min(98, driverScoreByKey.behavior + 5);

  const drivers: SchoolDriverScore[] = SCHOOL_DRIVER_ORDER.map((key) => ({
    key,
    label: SCHOOL_DRIVER_LABEL[key],
    score: driverScoreByKey[key],
    delta: SCHOOL_DRIVER_DELTA[key],
  }));

  const score = Math.round(drivers.reduce((acc, d) => acc + d.score, 0) / drivers.length);
  const delta = Math.round(drivers.reduce((acc, d) => acc + d.delta, 0) / drivers.length);
  const status = scoreBand(score);

  const ranked = [...drivers].sort((a, b) => b.score - a.score);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  let interpretation = "All drivers are performing consistently across grades.";
  if (weakest.key === "positiveBehavior" || weakest.key === "interventionResponse") {
    interpretation = `Most grades are functioning well. ${weakest.label} needs school-wide attention.`;
  } else {
    const weakKey = weakest.key as PillarKey;
    const strugglingGrades = Array.from(
      new Set(classes.filter((c) => c.drivers[weakKey] < 65).map((c) => c.grade)),
    ).sort();
    if (strugglingGrades.length > 0) {
      interpretation = `Most grades are functioning well. ${weakest.label} requires attention in ${formatGradeList(strugglingGrades)}.`;
    }
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
      pct: Math.round((count / classes.length) * 100),
    };
  });

  return { score, delta, status, interpretation, drivers, strongest, weakest, distribution };
}

/* ─────────────────────────────────────────────────────────
 * School Health Driver Cards — one card per core driver,
 * each with its own status, weekly change, and the specific
 * classrooms/grades behind that pattern.
 * ───────────────────────────────────────────────────────── */

// Below "stable" (65+) counts as needing attention, matching SCORE_BANDS.
const DRIVER_ATTENTION_CUTOFF = 65;

const DRIVER_GOOD_PATTERN: Record<PillarKey, string> = {
  focus: "Most students are showing strong focus with minimal distractions across the school.",
  academic: "Most classrooms are ready for learning with consistent routines and materials in place.",
  behavior: "Positive behaviour is strong and expectations are consistently followed school-wide.",
  task: "Most students are completing tasks on time with consistent follow-through.",
};

const DRIVER_CONTEXT_SUFFIX: Record<PillarKey, string> = {
  focus: "during instruction",
  academic: "in daily routines",
  behavior: "across the school day",
  task: "during independent tasks",
};

function driverNeedsAttentionPattern(key: PillarKey, count: number): string {
  const n = count === 1 ? "One classroom" : `${count} classrooms`;
  switch (key) {
    case "focus":
      return `${n} showed reduced focus and more frequent distractions compared to last week.`;
    case "academic":
      return `${n} showed gaps in learning readiness compared to last week.`;
    case "behavior":
      return `${n} showed more frequent behaviour concerns compared to last week.`;
    case "task":
      return `${n} showed increased delayed or incomplete work compared to last week.`;
  }
}

export type SchoolDriverCard = {
  key: PillarKey;
  label: string;
  score: number;
  status: ScoreBand;
  delta: number;
  classroomsContributing: number;
  needAttentionCount: number;
  pattern: string;
  mostVisibleIn: string;
  affectedClassIds: string[];
};

export function schoolDriverCards(): SchoolDriverCard[] {
  const classes = getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];

  return CORE_KEYS.map((key) => {
    const score = weightedAvgFor(classes, (c) => c.drivers[key]);
    const status = scoreBand(score);
    const delta = SCHOOL_DRIVER_DELTA[key];
    const isGood = status === "excellent" || status === "stable";

    const needy = classes.filter((c) => c.drivers[key] < DRIVER_ATTENTION_CUTOFF);
    const needAttentionCount = needy.length;

    let mostVisibleIn = "Consistent across all grades";
    if (isGood) {
      const sorted = [...classes].sort((a, b) => b.drivers[key] - a.drivers[key]);
      const topGrades = Array.from(new Set(sorted.slice(0, Math.max(2, Math.ceil(classes.length * 0.2))).map((c) => c.grade))).sort();
      if (topGrades.length > 0) mostVisibleIn = formatGradeList(topGrades.slice(0, 2));
    } else if (needy.length > 0) {
      const weakGrades = Array.from(new Set(needy.map((c) => c.grade))).sort();
      mostVisibleIn = `${formatGradeList(weakGrades.slice(0, 2))} ${DRIVER_CONTEXT_SUFFIX[key]}`;
    }

    return {
      key,
      label: SCHOOL_DRIVER_LABEL[key],
      score,
      status,
      delta,
      classroomsContributing: classes.length,
      needAttentionCount,
      pattern: isGood ? DRIVER_GOOD_PATTERN[key] : driverNeedsAttentionPattern(key, needAttentionCount),
      mostVisibleIn,
      affectedClassIds: needy.map((c) => c.id),
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * Grade & Classroom Overview — lets the principal compare how
 * different grades are functioning, one row per grade.
 * ───────────────────────────────────────────────────────── */

const GRADE_ORDER = ["K", "1", "2", "3", "4", "5", "6", "7", "8"];

export type GradeOverviewRow = {
  grade: string;
  gradeLabel: string;
  healthScore: number;
  status: ScoreBand;
  /** Weighted average of each class's real pfiTrend — an actual week-over-week signal, not fabricated. */
  delta: number;
  strongestDriver: PillarKey;
  areaNeedingAttention: PillarKey | null;
  /** Classrooms in the "Monitor" tier — the closest real mapping to a Tier 2 caseload. */
  tier2Count: number;
  /** Classrooms in "Support Recommended" or "Immediate Review" — the closest real mapping to a Tier 3 caseload. */
  tier3Count: number;
  dataReadinessPct: number;
  classroomsContributing: number;
  supportTier: ClassroomTier;
  classIds: string[];
};

export function gradeOverviewRows(): GradeOverviewRow[] {
  const classes = getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];
  const grades = GRADE_ORDER.filter((g) => classes.some((c) => c.grade === g));

  return grades.map((grade) => {
    const classesInGrade = classes.filter((c) => c.grade === grade);
    const totalSize = classesInGrade.reduce((acc, c) => acc + c.size, 0) || 1;

    const healthScore = weightedAvgFor(classesInGrade, (c) => classComposite(c.drivers));
    const status = scoreBand(healthScore);
    const delta = Math.round(
      classesInGrade.reduce((acc, c) => acc + c.pfiTrend * c.size, 0) / totalSize,
    );

    const driverScores = CORE_KEYS.map((key) => ({
      key,
      score: weightedAvgFor(classesInGrade, (c) => c.drivers[key]),
    }));
    const ranked = [...driverScores].sort((a, b) => b.score - a.score);
    const strongestDriver = ranked[0].key;
    const weakest = ranked[ranked.length - 1];
    const areaNeedingAttention = weakest.score < DRIVER_ATTENTION_CUTOFF ? weakest.key : null;

    const tiers = classesInGrade.map((c) => classroomTierFor(classComposite(c.drivers)).tier);
    const tier2Count = tiers.filter((t) => t === "watch").length;
    const tier3Count = tiers.filter((t) => t === "needs-support" || t === "intensive").length;

    const dataReadinessPct = Math.round(
      (classesInGrade.filter((c) => c.monthlyCheckIn).length / classesInGrade.length) * 100,
    );

    return {
      grade,
      gradeLabel: `Grade ${grade}`,
      healthScore,
      status,
      delta,
      strongestDriver,
      areaNeedingAttention,
      tier2Count,
      tier3Count,
      dataReadinessPct,
      classroomsContributing: classesInGrade.length,
      supportTier: classroomTierFor(healthScore).tier,
      classIds: classesInGrade.map((c) => c.id),
    };
  });
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

/** The grade with the sharpest real decline this week that also has a driver
 * below the attention cutoff — null if nothing is currently declining. */
export function gradeWeeklyInsight(): GradeWeeklyInsight | null {
  const rows = gradeOverviewRows();
  const declining = rows
    .filter((r) => r.delta < 0 && r.areaNeedingAttention)
    .sort((a, b) => a.delta - b.delta);
  const worst = declining[0];
  if (!worst || !worst.areaNeedingAttention) return null;

  return {
    grade: worst.grade,
    gradeLabel: worst.gradeLabel,
    delta: worst.delta,
    driver: worst.areaNeedingAttention,
    flaggedCount: worst.tier2Count + worst.tier3Count,
    suggestedActions: SUGGESTED_ACTIONS_BY_DRIVER[worst.areaNeedingAttention],
  };
}

/* ─────────────────────────────────────────────────────────
 * Tier Support Distribution — whether the school's targeted (Tier 2) and
 * intensive (Tier 3) support system is functioning effectively.
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

// Hardcoded but plausible week-over-week deltas — same convention as
// SCHOOL_DRIVER_DELTA above, since no real tier-history is tracked yet.
export const TIER_DELTA: Record<TierKey, number> = {
  tier1: 2.1,
  tier2: 1.3,
  tier3: -0.8,
};

export type ClassTierSplit = { tier1: number; tier2: number; tier3: number };

/** Splits a class's real atRisk headcount into Tier 2 (targeted) vs Tier 3
 * (intensive) using the classroom's own composite tier as a severity weight —
 * worse-performing classrooms allocate a larger share of their at-risk
 * students to Tier 3. Every non-at-risk student is Tier 1. */
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
    out = out.filter((c) => c.drivers[driver] < DRIVER_ATTENTION_CUTOFF);
  }
  return out;
}

export type TierDistributionBand = { tier: TierKey; count: number; pct: number; delta: number };

export type SchoolTierDistribution = {
  totalStudents: number;
  bands: TierDistributionBand[];
};

export function schoolTierDistribution(scope: TierScope = {}): SchoolTierDistribution {
  const classes = scopedSchoolClasses(scope);
  const totals: ClassTierSplit = { tier1: 0, tier2: 0, tier3: 0 };
  classes.forEach((c) => {
    const s = classTierSplit(c);
    totals.tier1 += s.tier1;
    totals.tier2 += s.tier2;
    totals.tier3 += s.tier3;
  });
  const totalStudents = totals.tier1 + totals.tier2 + totals.tier3;
  const bands: TierDistributionBand[] = (["tier1", "tier2", "tier3"] as TierKey[]).map((tier) => ({
    tier,
    count: totals[tier],
    pct: totalStudents > 0 ? Math.round((totals[tier] / totalStudents) * 1000) / 10 : 0,
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

// Same "hardcoded but plausible" convention as SCHOOL_DRIVER_DELTA — no real
// week-over-week case history is tracked at school scale yet.
export const SUPPORT_STATUS_DELTA: Record<keyof SchoolSupportStatus, number> = {
  newReferrals: 3,
  awaitingReview: 4,
  activeInterventions: 9,
  studentsImproving: 8,
  limitedResponse: 5,
  escalations: 1,
};

/** Every real at-risk student falls into exactly one bucket here, split by
 * two real signals: whether their classroom has checked in this period
 * (monthlyCheckIn) and whether that classroom's trend is improving or not
 * (pfiTrend). Not-yet-checked-in + declining trend reads as a fresh, urgent
 * referral; not-yet-checked-in + flat/improving reads as routine review. */
export function schoolSupportStatus(scope: TierScope = {}): SchoolSupportStatus {
  const classes = scopedSchoolClasses(scope);
  let newReferrals = 0;
  let awaitingReview = 0;
  let studentsImproving = 0;
  let limitedResponse = 0;
  let escalations = 0;
  let activeInterventions = 0;

  classes.forEach((c) => {
    if (c.atRisk <= 0) return;
    activeInterventions += c.atRisk;
    escalations += classTierSplit(c).tier3;
    if (!c.monthlyCheckIn) {
      if (c.pfiTrend < 0) newReferrals += c.atRisk;
      else awaitingReview += c.atRisk;
    } else {
      if (c.pfiTrend > 0) studentsImproving += c.atRisk;
      else limitedResponse += c.atRisk;
    }
  });

  return { newReferrals, awaitingReview, activeInterventions, studentsImproving, limitedResponse, escalations };
}

// Configured programme capacity — planning constants, not derived from
// check-in data (no real capacity/roster ceiling is tracked yet).
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
  /** Share of each tier's caseload whose classroom has checked in this period —
   * "implementation by tier," reusing the same real overdue counts above. */
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
    tier2ImplementationRate:
      tier2Used > 0 ? Math.round(((tier2Used - reviewsOverdueTier2) / tier2Used) * 100) : 0,
    tier3ImplementationRate:
      tier3Used > 0 ? Math.round(((tier3Used - reviewsOverdueTier3) / tier3Used) * 100) : 0,
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
  const grades = GRADE_ORDER.filter((g) => classes.some((c) => c.grade === g));

  return grades.map((grade) => {
    const classesInGrade = classes.filter((c) => c.grade === grade);
    const totals: ClassTierSplit = { tier1: 0, tier2: 0, tier3: 0 };
    classesInGrade.forEach((c) => {
      const s = classTierSplit(c);
      totals.tier1 += s.tier1;
      totals.tier2 += s.tier2;
      totals.tier3 += s.tier3;
    });
    const totalStudents = totals.tier1 + totals.tier2 + totals.tier3;
    const totalSize = classesInGrade.reduce((acc, c) => acc + c.size, 0) || 1;
    const trend = Math.round(
      classesInGrade.reduce((acc, c) => acc + c.pfiTrend * c.size, 0) / totalSize,
    );

    return {
      grade,
      gradeLabel: `Grade ${grade}`,
      tier1Pct: totalStudents > 0 ? Math.round((totals.tier1 / totalStudents) * 100) : 0,
      tier2Pct: totalStudents > 0 ? Math.round((totals.tier2 / totalStudents) * 100) : 0,
      tier3Pct: totalStudents > 0 ? Math.round((totals.tier3 / totalStudents) * 100) : 0,
      totalStudents,
      trend,
    };
  });
}

/* ─────────────────────────────────────────────────────────
 * 5.1 Intervention Implementation — operational accountability: are the
 * supports above actually being carried out and reviewed.
 * ───────────────────────────────────────────────────────── */

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
      classroomCompletionDenom > 0
        ? Math.round((kpis.followUpsCompleted / classroomCompletionDenom) * 100)
        : 0,
    responseToInterventionRate:
      completedStudents > 0 ? Math.round((status.studentsImproving / completedStudents) * 100) : 0,
  };
}

export type GradeResponseRow = {
  grade: string;
  gradeLabel: string;
  responseRate: number;
  respondingCount: number;
  totalFollowedUp: number;
};

/** Grades ranked by real response-to-intervention rate — the closest honest
 * substitute for "interventions showing strongest response" available at
 * school scale, since no per-intervention-type log exists yet. */
export function bestRespondingGrades(): GradeResponseRow[] {
  const classes = getSchoolClasses();
  const grades = GRADE_ORDER.filter((g) => classes.some((c) => c.grade === g));

  return grades
    .map((grade) => {
      const classesInGrade = classes.filter(
        (c) => c.grade === grade && c.atRisk > 0 && c.monthlyCheckIn,
      );
      const respondingCount = classesInGrade
        .filter((c) => c.pfiTrend > 0)
        .reduce((acc, c) => acc + c.atRisk, 0);
      const totalFollowedUp = classesInGrade.reduce((acc, c) => acc + c.atRisk, 0);
      return {
        grade,
        gradeLabel: `Grade ${grade}`,
        respondingCount,
        totalFollowedUp,
        responseRate: totalFollowedUp > 0 ? Math.round((respondingCount / totalFollowedUp) * 100) : 0,
      };
    })
    .filter((r) => r.totalFollowedUp > 0)
    .sort((a, b) => b.responseRate - a.responseRate);
}

/* ─────────────────────────────────────────────────────────
 * Teacher & Classroom Support Needs — where staff support or
 * school-level resources may be required.
 * ───────────────────────────────────────────────────────── */

export type SupportCategory =
  | "PBIS coaching"
  | "Classroom-management strategy"
  | "Task-engagement support"
  | "Specialist consultation"
  | "Additional classroom assistance"
  | "Parent-engagement support"
  | "Schedule or routine adjustment";

// "Parent-engagement support" has no per-teacher signal at school scale yet
// (only a school-wide parentActivationPct exists) — kept in the reference
// legend but never auto-assigned below.
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

/** Flags teachers with at least one classroom at "watch" or worse — the same
 * composite-tier signal already used for Tier 2/3 caseloads elsewhere — or,
 * failing that, a real operational gap (overdue follow-up / outsized at-risk
 * load). Each teacher gets at most one tag, in order of diagnostic
 * specificity, so the watchlist reads as a short, real list rather than
 * every teacher with any noisy metric. */
export function teacherSupportNeeds(): TeacherSupportNeed[] {
  const classes = getSchoolClasses();
  const CORE_KEYS: PillarKey[] = ["focus", "academic", "behavior", "task"];

  const byTeacher = new Map<string, SchoolClassRow[]>();
  classes.forEach((c) => {
    const list = byTeacher.get(c.teacherId) ?? [];
    list.push(c);
    byTeacher.set(c.teacherId, list);
  });

  const teacherAtRiskTotals = Array.from(byTeacher.values()).map((list) =>
    list.reduce((acc, c) => acc + c.atRisk, 0),
  );
  const avgAtRiskPerTeacher =
    teacherAtRiskTotals.reduce((acc, v) => acc + v, 0) / (teacherAtRiskTotals.length || 1);
  const highLoadThreshold = avgAtRiskPerTeacher * 1.4;

  const needs: TeacherSupportNeed[] = [];
  byTeacher.forEach((list, teacherId) => {
    const totalAtRisk = list.reduce((acc, c) => acc + c.atRisk, 0);
    const overdue = list.filter((c) => c.atRisk > 0 && !c.monthlyCheckIn);
    const teacherName = list[0].teacherName;

    // Struggling classrooms, worst composite first.
    const struggling = [...list]
      .filter((c) => classroomTierFor(classComposite(c.drivers)).tier !== "strong" && classroomTierFor(classComposite(c.drivers)).tier !== "solid")
      .sort((a, b) => classComposite(a.drivers) - classComposite(b.drivers));

    if (struggling.length > 0) {
      const worst = struggling[0];
      const weakest = [...CORE_KEYS].sort((a, b) => worst.drivers[a] - worst.drivers[b])[0];
      needs.push({
        teacherId,
        teacherName,
        category: CATEGORY_BY_DRIVER[weakest],
        reason: `${worst.name} is in the ${SUPPORT_STATUS_LABEL[classroomTierFor(classComposite(worst.drivers)).tier]} tier, driven by ${SCHOOL_DRIVER_LABEL[weakest].toLowerCase()}.`,
        classIds: struggling.map((c) => c.id),
      });
      return;
    }
    if (overdue.length > 0) {
      needs.push({
        teacherId,
        teacherName,
        category: "Schedule or routine adjustment",
        reason: `${overdue.length} classroom${overdue.length === 1 ? "" : "s"} overdue for a follow-up check-in.`,
        classIds: overdue.map((c) => c.id),
      });
      return;
    }
    if (totalAtRisk > 0 && totalAtRisk >= highLoadThreshold) {
      needs.push({
        teacherId,
        teacherName,
        category: "Additional classroom assistance",
        reason: `Supporting ${totalAtRisk} at-risk students across ${list.length} classroom${list.length === 1 ? "" : "s"}.`,
        classIds: list.map((c) => c.id),
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

/** "Repeated friction" is proxied by the same real focus-driver signal
 * schoolDriverCards() already uses for attention/transition issues — no
 * separate friction log exists at school scale yet. */
export function teacherClassroomSupportSummary(): TeacherClassroomSupportSummary {
  const classes = getSchoolClasses();
  const kpis = getSchoolKpis();

  const frictionClasses: SupportClassroomEntry[] = classes
    .filter((c) => c.drivers.focus < DRIVER_ATTENTION_CUTOFF)
    .map((c) => ({ id: c.id, name: c.name, grade: c.grade, teacherName: c.teacherName }));

  const pbisGrades = gradeOverviewRows().filter((r) => r.areaNeedingAttention === "behavior");

  const improvingClasses: ImprovingClassroomEntry[] = classes
    .filter((c) => c.pfiTrend > 0)
    .sort((a, b) => b.pfiTrend - a.pfiTrend)
    .map((c) => ({ id: c.id, name: c.name, grade: c.grade, teacherName: c.teacherName, trend: c.pfiTrend }));

  return {
    frictionClasses,
    teacherNeeds: teacherSupportNeeds(),
    pbisGrades,
    implementationGapClassCount: kpis.followUpsDue,
    improvingClasses,
  };
}

/** Synthesizes a single recommended next step from the real counts above —
 * same "closest honest summary" convention as gradeWeeklyInsight, just
 * combining multiple signals instead of one. Returns null when nothing in
 * this segment needs a response. */
export function supportNeedsRecommendedResponse(
  summary: TeacherClassroomSupportSummary,
): string | null {
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
    parts.push(`schedule PBIS coaching for ${formatGradeList(summary.pbisGrades.map((g) => g.grade))}`);
  }

  if (parts.length === 0) return null;
  const sentence = `${parts.join(", ")}. Review outcomes in 2 weeks.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
