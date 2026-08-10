// District-level mock data for the District Superintendent Dashboard demo.
// Stable, deterministic — no random per-render changes (mirrors lib/schoolData.ts).

export type SchoolStatus =
  | "strong"
  | "stable"
  | "monitor"
  | "support-recommended"
  | "immediate-review";

export const SCHOOL_STATUS_META: Record<SchoolStatus, { label: string; tone: string; meaning: string }> = {
  strong: {
    label: "Performing Strongly",
    tone: "hsl(142 55% 45%)",
    meaning: "Consistently strong implementation and outcomes across measures.",
  },
  stable: {
    label: "Stable",
    tone: "hsl(212 90% 58%)",
    meaning: "Functioning steadily, with no significant areas of concern.",
  },
  monitor: {
    label: "Monitor",
    tone: "hsl(38 92% 55%)",
    meaning: "One or more emerging signals worth tracking over the next period.",
  },
  "support-recommended": {
    label: "District Support Recommended",
    tone: "hsl(28 88% 54%)",
    meaning: "Would benefit from coaching, resources or leadership consultation.",
  },
  "immediate-review": {
    label: "Immediate District Review",
    tone: "hsl(0 78% 58%)",
    meaning: "Requires direct district attention and a response plan now.",
  },
};

export type GradeBand = "elementary" | "middle" | "high";

export type PbisImplementation = "Strong" | "Moderate" | "Needs Support";
export type TierPressure = "Low" | "Moderate" | "High" | "Critical";
export type SupportActionStatus =
  | "No support required"
  | "Monitoring"
  | "Coaching assigned"
  | "Resource review in progress"
  | "District support plan active"
  | "Immediate district review";

export const PBIS_TONE: Record<PbisImplementation, string> = {
  Strong: "hsl(142 55% 45%)",
  Moderate: "hsl(38 92% 55%)",
  "Needs Support": "hsl(0 78% 58%)",
};

export const TIER_PRESSURE_TONE: Record<TierPressure, string> = {
  Low: "hsl(142 55% 45%)",
  Moderate: "hsl(212 90% 58%)",
  High: "hsl(38 92% 55%)",
  Critical: "hsl(0 78% 58%)",
};

// Rotated across schools to give the comparison table plausible variety —
// mirrors the 7 District Health Drivers (Segment 3) by label.
const SCHOOL_DRIVER_LABELS = [
  "Attention & Focus",
  "Learning Readiness",
  "Behaviour & Discipline",
  "Task Engagement",
  "Positive Behaviour Culture",
  "Intervention Response",
  "PBIS Implementation",
];

const DISTRICT_OWNERS = ["Dr. Elena Ruiz", "Marcus Webb", "Priya Anand", "Dana Coleman"];
const REVIEW_DATES = ["Jul 8", "Jul 15", "Jul 22", "Jul 29", "Aug 5", "Aug 12"];

export type DistrictSchool = {
  id: string;
  name: string;
  cluster: string;
  gradeConfig: string;
  gradeBand: GradeBand;
  totalStudents: number;
  totalTeachers: number;
  connectedToYellow: boolean;
  principalActive: boolean;
  classroomReportingCoveragePct: number;
  interventionFollowUpCoveragePct: number;
  healthScore: number;
  healthDelta: number;
  status: SchoolStatus;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  tier3Capacity: number;
  tier3Caseload: number;
  tierPressure: TierPressure;
  tierPressurePct: number;
  overdueActionPlans: number;
  pbisImplementation: PbisImplementation;
  strongestDriverLabel: string;
  areaNeedingAttentionLabel: string;
  districtOwner: string;
  lastReviewDate: string;
  nextReviewDate: string;
  actionStatus: SupportActionStatus;
  reasoning: string;
};

const SCHOOL_NAMES = [
  "Lincoln Elementary",
  "Roosevelt Middle School",
  "Jefferson High School",
  "Maple Grove Elementary",
  "Riverside Middle School",
  "Washington Elementary",
  "Franklin High School",
  "Cedar Hill Elementary",
  "Sunnyvale Middle School",
  "Oakwood Elementary",
  "Kennedy High School",
  "Brookside Elementary",
  "Hilltop Middle School",
  "Meadowbrook Elementary",
  "Central High School",
  "Willow Creek Elementary",
  "Parkview Middle School",
  "Fairview Elementary",
  "Eastside High School",
  "Pinecrest Elementary",
  "Northgate Middle School",
  "Southbrook Elementary",
  "Union High School",
  "Greenfield Elementary",
];

const CLUSTERS = ["North", "South", "East", "Central"];

// Derived from the school's name so "Grade band" in the comparison table
// actually agrees with what the school is called (e.g. an "Elementary"
// school is never shown as a 9-12 grade config).
function gradeConfigForName(name: string): string {
  if (name.includes("Elementary") || name.includes("Primary")) return "K-5";
  if (name.includes("Middle")) return "6-8";
  if (name.includes("High")) return "9-12";
  return "K-8";
}

const IMMEDIATE_REVIEW_INDEXES = new Set([3, 14]);
const SUPPORT_RECOMMENDED_INDEXES = new Set([7, 16, 21]);
const MONITOR_INDEXES = new Set([1, 9, 12, 19]);
const DISCONNECTED_INDEXES = new Set([5, 11, 18]);
const PRINCIPAL_VACANT_INDEXES = new Set([3, 7, 14, 16, 21]);
const OVERDUE_ACTION_PLAN_COUNTS: Record<number, number> = { 3: 2, 14: 2, 7: 1 };

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function statusFor(i: number): SchoolStatus {
  if (IMMEDIATE_REVIEW_INDEXES.has(i)) return "immediate-review";
  if (SUPPORT_RECOMMENDED_INDEXES.has(i)) return "support-recommended";
  if (MONITOR_INDEXES.has(i)) return "monitor";
  return i % 3 === 0 ? "stable" : "strong";
}

function gradeBandFor(gradeConfig: string): GradeBand {
  if (gradeConfig === "9-12") return "high";
  if (gradeConfig === "6-8") return "middle";
  return "elementary";
}

const GRADE_BAND_LABEL: Record<GradeBand, string> = {
  elementary: "elementary",
  middle: "middle-school",
  high: "high-school",
};

export function scoreToStatus(score: number): SchoolStatus {
  if (score >= 85) return "strong";
  if (score >= 70) return "stable";
  if (score >= 55) return "monitor";
  if (score >= 40) return "support-recommended";
  return "immediate-review";
}

function pbisImplementationFor(classroomCoverage: number, interventionCoverage: number): PbisImplementation {
  const composite = (classroomCoverage + interventionCoverage) / 2;
  if (composite >= 78) return "Strong";
  if (composite >= 55) return "Moderate";
  return "Needs Support";
}

function tierPressureFor(caseload: number, capacity: number): { band: TierPressure; pct: number } {
  const pct = Math.round((caseload / Math.max(1, capacity)) * 100);
  if (pct < 80) return { band: "Low", pct };
  if (pct < 100) return { band: "Moderate", pct };
  if (pct < 130) return { band: "High", pct };
  return { band: "Critical", pct };
}

function actionStatusFor(status: SchoolStatus, i: number): SupportActionStatus {
  switch (status) {
    case "strong":
      return "No support required";
    case "stable":
      return i % 2 === 0 ? "No support required" : "Monitoring";
    case "monitor":
      return "Monitoring";
    case "support-recommended":
      return i % 2 === 0 ? "Coaching assigned" : "Resource review in progress";
    case "immediate-review":
      return i % 2 === 0 ? "District support plan active" : "Immediate district review";
  }
}

function reasoningFor(school: {
  healthDelta: number;
  areaNeedingAttentionLabel: string;
  gradeConfig: string;
  tierPressure: TierPressure;
  tierPressurePct: number;
  overdueActionPlans: number;
  pbisImplementation: PbisImplementation;
}): string {
  const deltaClause =
    school.healthDelta < 0
      ? `School Health declined by ${Math.abs(school.healthDelta)} points this month.`
      : school.healthDelta > 0
        ? `School Health improved by ${school.healthDelta} points this month.`
        : "School Health has held steady this month.";
  const driverClause =
    school.areaNeedingAttentionLabel !== "—"
      ? ` ${school.areaNeedingAttentionLabel} has weakened across ${school.gradeConfig} classrooms.`
      : "";
  const tierClause =
    school.tierPressure === "High" || school.tierPressure === "Critical"
      ? ` Tier 3 demand is running at ${school.tierPressurePct}% of capacity.`
      : "";
  const overdueClause =
    school.overdueActionPlans > 0
      ? ` ${school.overdueActionPlans} action plan${school.overdueActionPlans === 1 ? " is" : "s are"} overdue.`
      : "";
  const pbisClause = ` PBIS implementation remains ${school.pbisImplementation.toLowerCase()}.`;
  return `${deltaClause}${driverClause}${tierClause}${overdueClause}${pbisClause}`;
}

function buildSchools(): DistrictSchool[] {
  const out: DistrictSchool[] = [];
  const total = SCHOOL_NAMES.length;

  for (let i = 0; i < total; i++) {
    const cluster = pick(CLUSTERS, i);
    const status = statusFor(i);
    const totalStudents = 380 + ((i * 37) % 620);
    const totalTeachers = 18 + ((i * 5) % 42);

    const classroomReportingCoveragePct =
      status === "immediate-review" ? 48 + (i % 10) : 72 + ((i * 3) % 27);
    const interventionFollowUpCoveragePct =
      status === "immediate-review" ? 42 + (i % 10) : 65 + ((i * 7) % 31);

    const healthScore =
      status === "immediate-review"
        ? 38 + (i % 8)
        : status === "support-recommended"
          ? 52 + (i % 10)
          : status === "monitor"
            ? 63 + (i % 8)
            : 74 + ((i * 3) % 22);
    const healthDelta = ((i * 5) % 11) - 5;

    const tier1Count = Math.round(totalStudents * (0.72 + ((i % 5) * 0.02)));
    const tier2Count = Math.round(totalStudents * (0.14 + ((i % 4) * 0.015)));
    const tier3Count = totalStudents - tier1Count - tier2Count;

    // North-cluster schools are intentionally under-resourced on Tier 3 capacity
    // this period, so the executive queue can surface a concrete cluster signal.
    const tier3Capacity = cluster === "North" ? Math.round(tier3Count * 0.7) : Math.round(tier3Count * 1.15);

    const gradeConfig = gradeConfigForName(SCHOOL_NAMES[i]);
    const classroomCoverage = Math.min(99, classroomReportingCoveragePct);
    const interventionCoverage = Math.min(99, interventionFollowUpCoveragePct);
    const pbisImplementation = pbisImplementationFor(classroomCoverage, interventionCoverage);
    const { band: tierPressure, pct: tierPressurePct } = tierPressureFor(tier3Count, tier3Capacity);
    const overdueActionPlans = OVERDUE_ACTION_PLAN_COUNTS[i] ?? 0;
    const strongestDriverLabel = pick(SCHOOL_DRIVER_LABELS, i);
    const areaNeedingAttentionLabel = status === "strong" ? "—" : pick(SCHOOL_DRIVER_LABELS, i + 3);

    const reasoning = reasoningFor({
      healthDelta,
      areaNeedingAttentionLabel,
      gradeConfig,
      tierPressure,
      tierPressurePct,
      overdueActionPlans,
      pbisImplementation,
    });

    out.push({
      id: `sch_${i + 1}`,
      name: SCHOOL_NAMES[i],
      cluster,
      gradeConfig,
      gradeBand: gradeBandFor(gradeConfig),
      totalStudents,
      totalTeachers,
      connectedToYellow: !DISCONNECTED_INDEXES.has(i),
      principalActive: !PRINCIPAL_VACANT_INDEXES.has(i),
      classroomReportingCoveragePct: classroomCoverage,
      interventionFollowUpCoveragePct: interventionCoverage,
      healthScore,
      healthDelta,
      status,
      tier1Count,
      tier2Count,
      tier3Count,
      tier3Capacity,
      tier3Caseload: tier3Count,
      tierPressure,
      tierPressurePct,
      overdueActionPlans,
      pbisImplementation,
      strongestDriverLabel,
      areaNeedingAttentionLabel,
      districtOwner: pick(DISTRICT_OWNERS, i),
      lastReviewDate: pick(REVIEW_DATES, i),
      nextReviewDate: pick(REVIEW_DATES, i + 3),
      actionStatus: actionStatusFor(status, i),
      reasoning,
    });
  }

  return out;
}

let cached: DistrictSchool[] | null = null;

export function districtSchools(): DistrictSchool[] {
  if (!cached) cached = buildSchools();
  return cached;
}

export type DistrictReadiness = {
  totalSchools: number;
  schoolsConnected: number;
  principalsActive: number;
  classroomReportingCoveragePct: number;
  interventionFollowUpCoveragePct: number;
  dataReadinessPct: number;
  lastUpdate: string;
};

export function districtReadiness(): DistrictReadiness {
  const schools = districtSchools();
  const total = schools.length;
  const schoolsConnected = schools.filter((s) => s.connectedToYellow).length;
  const principalsActive = schools.filter((s) => s.principalActive).length;
  const classroomReportingCoveragePct = Math.round(
    schools.reduce((sum, s) => sum + s.classroomReportingCoveragePct, 0) / total,
  );
  const interventionFollowUpCoveragePct = Math.round(
    schools.reduce((sum, s) => sum + s.interventionFollowUpCoveragePct, 0) / total,
  );
  const dataReadinessPct = Math.round(
    ((schoolsConnected / total) * 100 +
      (principalsActive / total) * 100 +
      classroomReportingCoveragePct +
      interventionFollowUpCoveragePct) /
      4,
  );

  return {
    totalSchools: total,
    schoolsConnected,
    principalsActive,
    classroomReportingCoveragePct,
    interventionFollowUpCoveragePct,
    dataReadinessPct,
    lastUpdate: "Today · 6:45 AM",
  };
}

export type PriorityItem = {
  id: string;
  title: string;
  detail: string;
  severity: "Urgent" | "High" | "Routine";
  tone: string;
};

export function executivePriorityQueue(): PriorityItem[] {
  const schools = districtSchools();
  const items: PriorityItem[] = [];

  const immediate = schools.filter((s) => s.status === "immediate-review");
  if (immediate.length > 0) {
    items.push({
      id: "immediate-review",
      title: `Review ${immediate.length} school${immediate.length === 1 ? "" : "s"} requiring immediate support`,
      detail: immediate.map((s) => s.name).join(" · "),
      severity: "Urgent",
      tone: "hsl(0 78% 58%)",
    });
  }

  const clusterTier3 = new Map<string, { capacity: number; caseload: number }>();
  for (const s of schools) {
    const entry = clusterTier3.get(s.cluster) ?? { capacity: 0, caseload: 0 };
    entry.capacity += s.tier3Capacity;
    entry.caseload += s.tier3Caseload;
    clusterTier3.set(s.cluster, entry);
  }
  let tightestCluster: string | null = null;
  let tightestRatio = 1;
  for (const [cluster, { capacity, caseload }] of clusterTier3) {
    const ratio = caseload / Math.max(1, capacity);
    if (ratio > tightestRatio) {
      tightestRatio = ratio;
      tightestCluster = cluster;
    }
  }
  if (tightestCluster) {
    items.push({
      id: "tier3-capacity",
      title: `Address Tier 3 capacity in the ${tightestCluster} cluster`,
      detail: `Caseload is running at ${Math.round(tightestRatio * 100)}% of available Tier 3 capacity.`,
      severity: "High",
      tone: "hsl(38 92% 55%)",
    });
  }

  const overdueTotal = schools.reduce((sum, s) => sum + s.overdueActionPlans, 0);
  if (overdueTotal > 0) {
    items.push({
      id: "overdue-plans",
      title: `Follow up on ${overdueTotal} overdue school action plan${overdueTotal === 1 ? "" : "s"}`,
      detail: schools
        .filter((s) => s.overdueActionPlans > 0)
        .map((s) => `${s.name} (${s.overdueActionPlans})`)
        .join(" · "),
      severity: "High",
      tone: "hsl(38 92% 55%)",
    });
  }

  items.push({
    id: "pbis-summary",
    title: "Prepare district PBIS summary",
    detail: "Due for this month's district leadership review cycle.",
    severity: "Routine",
    tone: "hsl(212 90% 58%)",
  });

  return items;
}

export type DistrictDriverKey =
  | "attention"
  | "readiness"
  | "behavior"
  | "task"
  | "positive-culture"
  | "intervention-response"
  | "pbis-consistency";

export type DistrictDriver = {
  key: DistrictDriverKey;
  label: string;
  score: number;
  delta: number;
};

// Driver offsets are a fixed, deterministic weighting against the average
// school health score — not derived from a real per-driver dataset, since
// none exists yet at district grain. Kept here so Segment 2 (Health Score)
// and Segment 3 (Driver Cards) read from one shared source.
const DRIVER_META: { key: DistrictDriverKey; label: string; offset: number; delta: number }[] = [
  { key: "readiness", label: "Learning Readiness", offset: 7, delta: 3 },
  { key: "positive-culture", label: "Positive Behaviour Culture", offset: 3, delta: 2 },
  { key: "attention", label: "Attention & Focus", offset: 4, delta: 2 },
  { key: "behavior", label: "Behaviour & Discipline", offset: 1, delta: 1 },
  { key: "intervention-response", label: "Intervention Response", offset: -4, delta: 1 },
  { key: "pbis-consistency", label: "PBIS Implementation", offset: -2, delta: 0 },
  { key: "task", label: "Task Engagement", offset: -9, delta: -2 },
];

export function districtDrivers(): DistrictDriver[] {
  const schools = districtSchools();
  const avgHealth = schools.reduce((sum, s) => sum + s.healthScore, 0) / schools.length;

  return DRIVER_META.map((d) => ({
    key: d.key,
    label: d.label,
    score: Math.max(0, Math.min(100, Math.round(avgHealth + d.offset))),
    delta: d.delta,
  }));
}

const DRIVER_CARD_META: Record<
  DistrictDriverKey,
  { goodPattern: string; watchPattern: string; visibleIn: string }
> = {
  attention: {
    goodPattern: "Most classrooms are sustaining focus through longer independent work blocks.",
    watchPattern: "Attention dips are more frequent during transitions and independent work.",
    visibleIn: "Most visible in the North cluster",
  },
  readiness: {
    goodPattern: "Students are consistently ready for grade-level, multi-step tasks.",
    watchPattern: "Readiness gaps are widening on multi-step and grade-level tasks.",
    visibleIn: "Most visible in elementary grades",
  },
  behavior: {
    goodPattern: "Expectations are being followed consistently across most classrooms.",
    watchPattern: "Waiting and turn-taking incidents are trending up in shared spaces.",
    visibleIn: "Most visible in the East cluster",
  },
  task: {
    goodPattern: "Independent work and homework completion are holding steady district-wide.",
    watchPattern: "Independent work and homework completion are slipping in several schools.",
    visibleIn: "Most visible in middle-school grades",
  },
  "positive-culture": {
    goodPattern: "Positive recognition is being logged consistently across most schools.",
    watchPattern: "Positive recognition logging has slowed relative to behaviour logging.",
    visibleIn: "Most visible in the Central cluster",
  },
  "intervention-response": {
    goodPattern: "Students in active interventions are showing steady, tracked progress.",
    watchPattern: "A growing share of interventions are showing limited or stalled response.",
    visibleIn: "Most visible in the North cluster",
  },
  "pbis-consistency": {
    goodPattern: "Check-ins, reviews and Tier 1 strategies are being logged on schedule.",
    watchPattern: "Check-in and review completion is inconsistent across several schools.",
    visibleIn: "Most visible in schools with a vacant principal seat",
  },
};

export type DistrictDriverCard = DistrictDriver & {
  status: SchoolStatus;
  tone: string;
  statusLabel: string;
  pattern: string;
  visibleIn: string;
  schoolsContributing: number;
  totalSchools: number;
  schoolsNeedingAttention: number;
};

export function districtDriverCards(): DistrictDriverCard[] {
  const schools = districtSchools();
  const readiness = districtReadiness();
  const drivers = districtDrivers();
  const ranked = [...drivers].sort((a, b) => a.score - b.score); // weakest first
  const baseNeedingAttention = schools.filter(
    (s) => s.status === "support-recommended" || s.status === "immediate-review",
  ).length;

  return drivers.map((driver) => {
    const status = scoreToStatus(driver.score);
    const meta = SCHOOL_STATUS_META[status];
    const cardMeta = DRIVER_CARD_META[driver.key];
    const good = status === "strong" || status === "stable";

    const rank = ranked.findIndex((d) => d.key === driver.key); // 0 = weakest
    const attentionAdjustment = rank === 0 ? 2 : rank === 1 ? 1 : rank >= ranked.length - 2 ? -1 : 0;
    const schoolsNeedingAttention = Math.max(0, Math.min(schools.length, baseNeedingAttention + attentionAdjustment));

    return {
      ...driver,
      status,
      tone: meta.tone,
      statusLabel: meta.label,
      pattern: good ? cardMeta.goodPattern : cardMeta.watchPattern,
      visibleIn: cardMeta.visibleIn,
      schoolsContributing: readiness.schoolsConnected,
      totalSchools: readiness.totalSchools,
      schoolsNeedingAttention,
    };
  });
}

function tightestGradeBandTier3(): { band: string; pct: number } | null {
  const schools = districtSchools();
  const byBand = new Map<GradeBand, { capacity: number; caseload: number }>();
  for (const s of schools) {
    const entry = byBand.get(s.gradeBand) ?? { capacity: 0, caseload: 0 };
    entry.capacity += s.tier3Capacity;
    entry.caseload += s.tier3Caseload;
    byBand.set(s.gradeBand, entry);
  }
  let tightestBand: GradeBand | null = null;
  let tightestRatio = 1;
  for (const [band, { capacity, caseload }] of byBand) {
    const ratio = caseload / Math.max(1, capacity);
    if (ratio > tightestRatio) {
      tightestRatio = ratio;
      tightestBand = band;
    }
  }
  return tightestBand ? { band: GRADE_BAND_LABEL[tightestBand], pct: Math.round(tightestRatio * 100) } : null;
}

const STATUS_SENTENCE: Record<SchoolStatus, string> = {
  strong: "Schools across the district are performing strongly.",
  stable: "Most schools are functioning steadily.",
  monitor: "Several schools need closer monitoring.",
  "support-recommended": "A meaningful share of schools need district support.",
  "immediate-review": "Multiple schools require immediate district attention.",
};

export type DistrictHealth = {
  score: number;
  delta: number;
  period: "month";
  status: SchoolStatus;
  statusLabel: string;
  tone: string;
  strongest: DistrictDriver;
  weakest: DistrictDriver;
  interpretation: string;
  confidence: { label: string; pct: number };
  distribution: { status: SchoolStatus; label: string; tone: string; count: number }[];
};

export function districtHealth(): DistrictHealth {
  const schools = districtSchools();
  const score = Math.round(schools.reduce((sum, s) => sum + s.healthScore, 0) / schools.length);
  const delta = Math.round(schools.reduce((sum, s) => sum + s.healthDelta, 0) / schools.length);
  const status = scoreToStatus(score);
  const statusMeta = SCHOOL_STATUS_META[status];

  const drivers = districtDrivers();
  const ranked = [...drivers].sort((a, b) => b.score - a.score);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  const tier3Pressure = tightestGradeBandTier3();
  const interpretation = tier3Pressure
    ? `${STATUS_SENTENCE[status]} ${weakest.label} and Tier 3 capacity require attention in the ${tier3Pressure.band} cluster.`
    : `${STATUS_SENTENCE[status]} ${weakest.label} requires the most attention district-wide.`;

  const readiness = districtReadiness();
  const confidence =
    readiness.dataReadinessPct >= 85
      ? { label: "High confidence", pct: readiness.dataReadinessPct }
      : readiness.dataReadinessPct >= 65
        ? { label: "Moderate confidence", pct: readiness.dataReadinessPct }
        : { label: "Low confidence", pct: readiness.dataReadinessPct };

  const statusOrder: SchoolStatus[] = ["strong", "stable", "monitor", "support-recommended", "immediate-review"];
  const distribution = statusOrder.map((s) => ({
    status: s,
    label: SCHOOL_STATUS_META[s].label,
    tone: SCHOOL_STATUS_META[s].tone,
    count: schools.filter((sc) => sc.status === s).length,
  }));

  return {
    score,
    delta,
    period: "month",
    status,
    statusLabel: statusMeta.label,
    tone: statusMeta.tone,
    strongest,
    weakest,
    interpretation,
    confidence,
    distribution,
  };
}

export function schoolComparisonInsights(): string[] {
  const schools = districtSchools();
  const insights: string[] = [];

  const decliningTask = schools.filter(
    (s) => s.healthDelta < 0 && s.areaNeedingAttentionLabel === "Task Engagement",
  );
  if (decliningTask.length > 0) {
    insights.push(
      `${decliningTask.length} school${decliningTask.length === 1 ? "" : "s"} declined in Task Engagement over the last month.`,
    );
  }

  const middleTierPressure = schools.filter(
    (s) => s.gradeBand === "middle" && (s.tierPressure === "High" || s.tierPressure === "Critical"),
  );
  if (middleTierPressure.length > 0) {
    insights.push(
      `${middleTierPressure.length} middle school${middleTierPressure.length === 1 ? "" : "s"} show${middleTierPressure.length === 1 ? "s" : ""} elevated Tier 3 support demand.`,
    );
  }

  const strongHealthWeakPbis = schools.filter(
    (s) => s.healthScore >= 70 && s.pbisImplementation === "Needs Support",
  );
  if (strongHealthWeakPbis.length > 0) {
    insights.push(
      `${strongHealthWeakPbis.length} school${strongHealthWeakPbis.length === 1 ? "" : "s"} have strong School Health but inconsistent PBIS implementation.`,
    );
  }

  const elementaryPositiveCulture = schools.filter(
    (s) => s.gradeBand === "elementary" && s.strongestDriverLabel === "Positive Behaviour Culture",
  );
  if (elementaryPositiveCulture.length > 0) {
    insights.push(
      `${elementaryPositiveCulture.length} elementary school${elementaryPositiveCulture.length === 1 ? "" : "s"} show strong positive behaviour culture.`,
    );
  }

  const newImmediateReview = schools.find(
    (s) => s.status === "immediate-review" && s.overdueActionPlans > 0,
  );
  if (newImmediateReview) {
    insights.push(
      `${newImmediateReview.name} moved into Immediate District Review due to ${newImmediateReview.overdueActionPlans} overdue action plan${newImmediateReview.overdueActionPlans === 1 ? "" : "s"}.`,
    );
  }

  return insights;
}

// ───────────────────────────────────────────────────────────
// Segment 5 — District Trends
// ───────────────────────────────────────────────────────────

export type TrendCard = {
  id: string;
  eyebrow: string;
  headline: string;
  detail: string;
  tone: string;
  count: number;
};

const GRADE_BAND_PLURAL: Record<GradeBand, string> = {
  elementary: "elementary school",
  middle: "middle school",
  high: "high school",
};
const GRADE_BANDS: GradeBand[] = ["elementary", "middle", "high"];

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** Finds whichever grade band has the most schools matching a driver label
 * on the given field, so a trend card never surfaces a degenerate "0 schools"
 * headline just because the demo data happened to skew that way. */
function bestGradeBandFor(
  schools: DistrictSchool[],
  field: "strongestDriverLabel" | "areaNeedingAttentionLabel",
  label: string,
): { band: GradeBand; count: number } {
  let best: { band: GradeBand; count: number } = { band: "elementary", count: -1 };
  for (const band of GRADE_BANDS) {
    const count = schools.filter((s) => s.gradeBand === band && s[field] === label).length;
    if (count > best.count) best = { band, count };
  }
  return best;
}

export function districtTrends(): TrendCard[] {
  const schools = districtSchools();
  const GREEN = "hsl(142 55% 45%)";
  const RED = "hsl(0 78% 58%)";
  const AMBER = "hsl(38 92% 50%)";
  const BLUE = "hsl(212 90% 58%)";

  const growth = bestGradeBandFor(schools, "strongestDriverLabel", "Positive Behaviour Culture");
  const alert = bestGradeBandFor(schools, "areaNeedingAttentionLabel", "Task Engagement");

  // Emerging pattern: the area-needing-attention label spread across the most clusters.
  const attentionClusters = new Map<string, Set<string>>();
  for (const s of schools) {
    if (s.areaNeedingAttentionLabel === "—") continue;
    const set = attentionClusters.get(s.areaNeedingAttentionLabel) ?? new Set<string>();
    set.add(s.cluster);
    attentionClusters.set(s.areaNeedingAttentionLabel, set);
  }
  let patternLabel = "Intervention Response";
  let patternClusterCount = 0;
  for (const [label, clusters] of attentionClusters) {
    if (clusters.size > patternClusterCount) {
      patternClusterCount = clusters.size;
      patternLabel = label;
    }
  }
  const patternSchoolCount = schools.filter((s) => s.areaNeedingAttentionLabel === patternLabel).length;

  // Maintained strength: the most common strongest-driver among schools that held or improved.
  const strengthCounts = new Map<string, number>();
  for (const s of schools) {
    if (s.healthDelta >= 0) {
      strengthCounts.set(s.strongestDriverLabel, (strengthCounts.get(s.strongestDriverLabel) ?? 0) + 1);
    }
  }
  let strengthLabel = "PBIS Implementation";
  let strengthCount = 0;
  for (const [label, count] of strengthCounts) {
    if (count > strengthCount) {
      strengthCount = count;
      strengthLabel = label;
    }
  }

  return [
    {
      id: "growth",
      eyebrow: "Visible Growth",
      headline: `Positive behaviour recognition increased across ${pluralize(growth.count, GRADE_BAND_PLURAL[growth.band])}.`,
      detail: "Driven by consistent Tier 1 recognition routines and check-in completion.",
      tone: GREEN,
      count: growth.count,
    },
    {
      id: "alert",
      eyebrow: "Priority Alert",
      headline: `Task engagement declined across ${pluralize(alert.count, GRADE_BAND_PLURAL[alert.band])} during independent work.`,
      detail: "Concentrated in schools with rising Tier 2 referrals this month.",
      tone: RED,
      count: alert.count,
    },
    {
      id: "pattern",
      eyebrow: "Emerging Cross-School Pattern",
      headline: `${patternLabel} is emerging as a concern across ${pluralize(patternSchoolCount, "school")} in ${pluralize(patternClusterCount, "cluster")}.`,
      detail: "Worth a district-wide review before it becomes a broader trend.",
      tone: AMBER,
      count: patternSchoolCount,
    },
    {
      id: "strength",
      eyebrow: "Maintained Strength",
      headline: `${strengthLabel} has remained a consistent strength across ${pluralize(strengthCount, "school")} this month.`,
      detail: "No district-wide action needed — continue reinforcing current practice.",
      tone: BLUE,
      count: strengthCount,
    },
  ];
}

// ───────────────────────────────────────────────────────────
// Segment 6 — District Tier Support & Student-Support Overview
// ───────────────────────────────────────────────────────────

export type DistrictTierSupport = {
  totalStudents: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  tier1Pct: number;
  tier2Pct: number;
  tier3Pct: number;
  tier1Delta: number;
  tier2Delta: number;
  tier3Delta: number;
  newReferrals: number;
  casesAwaitingReview: number;
  activeInterventions: number;
  studentsImproving: number;
  limitedResponse: number;
  escalations: number;
  schoolsHighSupportDemand: number;
};

export function districtTierSupport(): DistrictTierSupport {
  const schools = districtSchools();
  const totalStudents = schools.reduce((sum, s) => sum + s.totalStudents, 0);
  const tier1Total = schools.reduce((sum, s) => sum + s.tier1Count, 0);
  const tier2Total = schools.reduce((sum, s) => sum + s.tier2Count, 0);
  const tier3Total = schools.reduce((sum, s) => sum + s.tier3Count, 0);

  const activeInterventions = tier2Total + tier3Total;

  return {
    totalStudents,
    tier1Count: tier1Total,
    tier2Count: tier2Total,
    tier3Count: tier3Total,
    tier1Pct: Math.round((tier1Total / totalStudents) * 100),
    tier2Pct: Math.round((tier2Total / totalStudents) * 100),
    tier3Pct: Math.round((tier3Total / totalStudents) * 100),
    tier1Delta: -1,
    tier2Delta: 1,
    tier3Delta: 0,
    newReferrals: Math.round(activeInterventions * 0.06),
    casesAwaitingReview: schools.reduce((sum, s) => sum + s.overdueActionPlans, 0) + Math.round(tier3Total * 0.04),
    activeInterventions,
    studentsImproving: Math.round(activeInterventions * 0.42),
    limitedResponse: Math.round(activeInterventions * 0.11),
    escalations: schools.filter((s) => s.status === "immediate-review").length,
    schoolsHighSupportDemand: schools.filter((s) => s.tierPressure === "High" || s.tierPressure === "Critical")
      .length,
  };
}

// ───────────────────────────────────────────────────────────
// Segment 7 — PBIS Implementation Across Schools
// ───────────────────────────────────────────────────────────

export type DistrictPbisOverview = {
  totalSchools: number;
  meetingExpectations: number;
  partialImplementation: number;
  needsSupport: number;
  checkInCompletionPct: number;
  positiveRecognitionPct: number;
  interventionFollowThroughPct: number;
  leadershipReviewCompletionPct: number;
  actionPlanStatusCounts: { status: SupportActionStatus; count: number }[];
};

const ACTION_STATUS_ORDER: SupportActionStatus[] = [
  "No support required",
  "Monitoring",
  "Coaching assigned",
  "Resource review in progress",
  "District support plan active",
  "Immediate district review",
];

export function districtPbisOverview(): DistrictPbisOverview {
  const schools = districtSchools();
  const total = schools.length;

  const checkInCompletionPct = Math.round(
    schools.reduce((sum, s) => sum + s.classroomReportingCoveragePct, 0) / total,
  );
  const interventionFollowThroughPct = Math.round(
    schools.reduce((sum, s) => sum + s.interventionFollowUpCoveragePct, 0) / total,
  );

  return {
    totalSchools: total,
    meetingExpectations: schools.filter((s) => s.pbisImplementation === "Strong").length,
    partialImplementation: schools.filter((s) => s.pbisImplementation === "Moderate").length,
    needsSupport: schools.filter((s) => s.pbisImplementation === "Needs Support").length,
    checkInCompletionPct,
    // Recognition logging tends to lag slightly behind check-in completion —
    // a fixed correlation factor, not an independently modeled metric.
    positiveRecognitionPct: Math.round(checkInCompletionPct * 0.88),
    interventionFollowThroughPct,
    leadershipReviewCompletionPct: Math.round(
      (schools.filter((s) => s.overdueActionPlans === 0).length / total) * 100,
    ),
    actionPlanStatusCounts: ACTION_STATUS_ORDER.map((status) => ({
      status,
      count: schools.filter((s) => s.actionStatus === status).length,
    })),
  };
}
