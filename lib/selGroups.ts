// Tiered SEL Support & Response — Tool 5 + Tool 10 combined, per the
// spec's own framing ("this combines targeted-group monitoring and
// intervention-response tracking so these do not become duplicate L1
// components").
//
// Tier 1 reuses Tool 4's real assigned-program participation. Tier 2/3
// reuse classHealth.ts's real per-student composite bands — the same
// "watch"/"needs-support" bands the Special Educator's caseload is built
// on (see lib/specialEdCaseload.ts), applied independently here rather
// than importing that role's module directly. Tier 2 group membership,
// facilitator, and session counts are seed data (no group-support backend
// exists), but which real students are *eligible* for a group, and every
// tier count / response tally / recommendation below, is computed from
// real composite + behaviour-driver data.

import { STUDENTS, type Student } from "@/data/mockData";
import { studentComposites } from "@/lib/classHealth";
import { classDisruptionBreakdown, DISRUPTION_LABEL, type DisruptionKey } from "@/lib/classBehavior";
import type { SelActionItem, SelCompetency } from "@/lib/selPulse";
import { studentParticipationSummary, type SelProgram } from "@/lib/selProgram";

export const RESPONSE_CATEGORIES = [
  "Improving",
  "Early Improvement",
  "No Clear Change",
  "Adjustment Required",
  "Escalation Referral Recommended",
] as const;
export type ResponseCategory = (typeof RESPONSE_CATEGORIES)[number];

export const RESPONSE_TONE: Record<ResponseCategory, string> = {
  Improving: "hsl(142 60% 40%)",
  "Early Improvement": "hsl(142 55% 45%)",
  "No Clear Change": "hsl(38 92% 48%)",
  "Adjustment Required": "hsl(20 85% 55%)",
  "Escalation Referral Recommended": "hsl(0 78% 56%)",
};

export type GroupOutcome = "active" | "graduated" | "referred";

export type SelGroup = {
  id: string;
  name: string;
  targetSkill: SelCompetency;
  facilitator: string;
  studentIds: string[];
  createdAt: string;
  reviewDate: string;
  sessionsPlanned: number;
  sessionsHeld: number;
  responseCategory: ResponseCategory;
  outcome: GroupOutcome;
};

const KEY = "ah_sel_groups";
const SEED_KEY = "ah_sel_groups_seeded_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function studentIdsByName(names: string[]): string[] {
  return STUDENTS.filter((s) => names.includes(s.name)).map((s) => s.id);
}

function seedGroups(): SelGroup[] {
  return [
    {
      id: "seed-group-emotional",
      name: "Emotional Regulation Circle",
      targetSkill: "Emotional regulation",
      facilitator: "Ms. Priya Sharma",
      studentIds: studentIdsByName(["Aarav Patel", "Kabir Khanna"]),
      createdAt: daysAgo(28),
      reviewDate: daysFromNow(2),
      sessionsPlanned: 6,
      sessionsHeld: 5,
      responseCategory: "Early Improvement",
      outcome: "active",
    },
    {
      id: "seed-group-peer",
      name: "Peer Connections Group",
      targetSkill: "Peer relationships",
      facilitator: "Ms. Riya Kapoor",
      studentIds: studentIdsByName(["Advik Choudhary", "Anika Saxena", "Kyra Bose"]),
      createdAt: daysAgo(28),
      reviewDate: daysFromNow(-1),
      sessionsPlanned: 6,
      sessionsHeld: 3,
      responseCategory: "No Clear Change",
      outcome: "active",
    },
  ];
}

function ensureSeeded() {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(SEED_KEY)) return;
  window.localStorage.setItem(KEY, JSON.stringify(seedGroups()));
  window.localStorage.setItem(SEED_KEY, "1");
}

export function getGroups(): SelGroup[] {
  if (!isBrowser()) return seedGroups();
  ensureSeeded();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SelGroup[]) : [];
  } catch {
    return [];
  }
}

function writeGroups(groups: SelGroup[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(groups));
  window.dispatchEvent(new CustomEvent("ah-sel-group-change"));
}

export function createGroup(input: {
  name: string;
  targetSkill: SelCompetency;
  facilitator: string;
  studentIds: string[];
  sessionsPlanned: number;
}): SelGroup {
  const group: SelGroup = {
    id: `group-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
    reviewDate: daysFromNow(14),
    sessionsHeld: 0,
    responseCategory: "Early Improvement",
    outcome: "active",
  };
  writeGroups([group, ...getGroups()]);
  return group;
}

export type NextStep = "continue" | "adjust" | "close" | "refer";

export function applyNextStep(id: string, step: NextStep) {
  writeGroups(
    getGroups().map((g) => {
      if (g.id !== id) return g;
      if (step === "continue") return { ...g, reviewDate: daysFromNow(14) };
      if (step === "adjust") return { ...g, responseCategory: "Adjustment Required", reviewDate: daysFromNow(14) };
      if (step === "close") return { ...g, outcome: "graduated" as GroupOutcome };
      return { ...g, outcome: "referred" as GroupOutcome };
    }),
  );
}

/* ─────────────────────────────────────────────────────────
 * L1 — Tier Support Distribution
 * ───────────────────────────────────────────────────────── */

export type TierDistribution = {
  tier1: { count: number; total: number; pct: number };
  tier2: { count: number; total: number; pct: number };
  tier3: { count: number };
};

export function tierDistribution(programs: SelProgram[], groups: SelGroup[]): TierDistribution {
  const total = STUDENTS.length;
  const tier1 = studentParticipationSummary(programs);

  const activeGroupStudentIds = new Set(groups.filter((g) => g.outcome === "active").flatMap((g) => g.studentIds));
  const tier2Count = activeGroupStudentIds.size;

  const needsSupportIds = new Set(
    studentComposites(STUDENTS).filter((c) => c.status === "needs-support").map((c) => c.student.id),
  );
  const tier3Count = Array.from(needsSupportIds).filter((id) => !activeGroupStudentIds.has(id)).length;

  return {
    tier1: { count: tier1.participating, total, pct: tier1.pct },
    tier2: { count: tier2Count, total, pct: total === 0 ? 0 : Math.round((tier2Count / total) * 100) },
    tier3: { count: tier3Count },
  };
}

/* ─────────────────────────────────────────────────────────
 * L2.1 — Active Tier 2 Groups
 * ───────────────────────────────────────────────────────── */

export type ActiveGroupsSummary = { activeGroups: number; studentsParticipating: number; dueForReview: number };

export function activeGroupsSummary(groups: SelGroup[]): ActiveGroupsSummary {
  const active = groups.filter((g) => g.outcome === "active");
  const nowMs = Date.now();
  return {
    activeGroups: active.length,
    studentsParticipating: new Set(active.flatMap((g) => g.studentIds)).size,
    dueForReview: active.filter((g) => +new Date(g.reviewDate) <= nowMs).length,
  };
}

/* ─────────────────────────────────────────────────────────
 * L2.2 — Response to Support
 * ───────────────────────────────────────────────────────── */

export function responseToSupportCounts(groups: SelGroup[]): Record<ResponseCategory, number> {
  const active = groups.filter((g) => g.outcome === "active");
  const counts = Object.fromEntries(RESPONSE_CATEGORIES.map((c) => [c, 0])) as Record<ResponseCategory, number>;
  for (const g of active) counts[g.responseCategory]++;
  return counts;
}

/* ─────────────────────────────────────────────────────────
 * L2.3 — Students Requiring More Support
 * ───────────────────────────────────────────────────────── */

export type StudentsNeedingMoreSupport = { needReview: Student[]; awaitingReferral: Student[] };

export function studentsRequiringMoreSupport(groups: SelGroup[]): StudentsNeedingMoreSupport {
  const active = groups.filter((g) => g.outcome === "active");
  const activeGroupStudentIds = new Set(active.flatMap((g) => g.studentIds));

  const tier3Students = studentComposites(STUDENTS)
    .filter((c) => c.status === "needs-support" && !activeGroupStudentIds.has(c.student.id))
    .map((c) => c.student);

  const escalationGroupStudentIds = new Set(
    active.filter((g) => g.responseCategory === "Escalation Referral Recommended").flatMap((g) => g.studentIds),
  );
  const awaitingReferral = STUDENTS.filter((s) => escalationGroupStudentIds.has(s.id));

  const needReviewIds = new Set([...tier3Students.map((s) => s.id), ...awaitingReferral.map((s) => s.id)]);
  const needReview = STUDENTS.filter((s) => needReviewIds.has(s.id));

  return { needReview, awaitingReferral };
}

/* ─────────────────────────────────────────────────────────
 * L2.5 — Implementation vs Response Signal (Yellow-generated insight)
 * ───────────────────────────────────────────────────────── */

export type ImplementationVsResponse = { group: SelGroup; fidelityPct: number; sentence: string };

const CONCERNING: ResponseCategory[] = ["No Clear Change", "Adjustment Required", "Escalation Referral Recommended"];
const SEVERITY: Record<ResponseCategory, number> = {
  Improving: 0,
  "Early Improvement": 1,
  "No Clear Change": 2,
  "Adjustment Required": 3,
  "Escalation Referral Recommended": 4,
};

/** For the single most-concerning active group, explains whether limited
 * response is more likely a delivery problem (low session fidelity) or a
 * strategy problem (delivered as planned, still limited change) — `null`
 * when no active group's response is actually concerning. */
export function implementationVsResponseInsight(groups: SelGroup[]): ImplementationVsResponse | null {
  const candidates = groups.filter((g) => g.outcome === "active" && CONCERNING.includes(g.responseCategory));
  if (candidates.length === 0) return null;
  const group = candidates.reduce((a, b) => (SEVERITY[b.responseCategory] > SEVERITY[a.responseCategory] ? b : a));
  const fidelityPct = group.sessionsPlanned === 0 ? 0 : Math.round((group.sessionsHeld / group.sessionsPlanned) * 100);

  const sentence =
    fidelityPct >= 80
      ? `${group.name} has been implemented as planned (${group.sessionsHeld} of ${group.sessionsPlanned} sessions held), but response has been limited — this looks like a strategy issue, not a delivery issue.`
      : `${group.name} has held only ${group.sessionsHeld} of ${group.sessionsPlanned} planned sessions — limited response may reflect inconsistent implementation rather than an ineffective strategy.`;

  return { group, fidelityPct, sentence };
}

/* ─────────────────────────────────────────────────────────
 * "Manage groups" → Yellow-recommended groupings for students who are
 * real Watch/Needs-Support cases but aren't in an active group yet,
 * clustered by whichever real behaviour driver is their shared primary
 * concern (only recommended when at least 2 students share one).
 * ───────────────────────────────────────────────────────── */

const DRIVER_TO_COMPETENCY: Partial<Record<DisruptionKey, SelCompetency>> = {
  emotional: "Emotional regulation",
  peer: "Peer relationships",
  anxiety: "Coping with Challenges",
};

export type GroupRecommendation = {
  suggestedName: string;
  targetSkill: SelCompetency;
  studentIds: string[];
  students: Student[];
  rationale: string;
};

export function recommendGroups(groups: SelGroup[]): GroupRecommendation[] {
  const activeGroupStudentIds = new Set(
    groups.filter((g) => g.outcome === "active").flatMap((g) => g.studentIds),
  );
  const ungrouped = studentComposites(STUDENTS)
    .filter((c) => (c.status === "watch" || c.status === "needs-support") && !activeGroupStudentIds.has(c.student.id))
    .map((c) => c.student);

  // Only cluster by drivers this SEL framework actually tracks a
  // competency for — off-task/impulse/transition are real signals too, but
  // they're attention/behaviour concepts outside this tool's SEL taxonomy,
  // so they're excluded before picking each student's "worst" rather than
  // being allowed to win ties and silently swallow every recommendation.
  const trackedDrivers = new Set(Object.keys(DRIVER_TO_COMPETENCY) as DisruptionKey[]);

  const byDriver = new Map<DisruptionKey, Student[]>();
  for (const student of ungrouped) {
    const worst = classDisruptionBreakdown([student])
      .filter((d) => d.studentCount > 0 && trackedDrivers.has(d.key))
      .sort((a, b) => a.score - b.score)[0];
    if (!worst) continue;
    const list = byDriver.get(worst.key) ?? [];
    list.push(student);
    byDriver.set(worst.key, list);
  }

  const recommendations: GroupRecommendation[] = [];
  for (const [driverKey, students] of byDriver) {
    if (students.length < 2) continue;
    const competency = DRIVER_TO_COMPETENCY[driverKey];
    if (!competency) continue;
    recommendations.push({
      suggestedName: `${competency} Group`,
      targetSkill: competency,
      studentIds: students.map((s) => s.id),
      students,
      rationale: `${students.length} ungrouped students show ${DISRUPTION_LABEL[driverKey].toLowerCase()} as their primary concern.`,
    });
  }
  return recommendations;
}

/** Feeds the dashboard's Action Hub — groups due for review or showing an
 * escalation-worthy response. */
export function buildGroupActionItems(groups: SelGroup[]): SelActionItem[] {
  const items: SelActionItem[] = [];
  const { dueForReview } = activeGroupsSummary(groups);
  if (dueForReview > 0) {
    items.push({
      id: "groups-due-for-review",
      priority: "medium",
      action: `Review ${dueForReview} Tier 2 group${dueForReview === 1 ? "" : "s"} due this week`,
      whyItMatters: "These groups have reached their scheduled review date.",
      related: "Tier 2 groups",
      ctaLabel: "Manage groups",
      href: "/sel/groups",
    });
  }
  const insight = implementationVsResponseInsight(groups);
  if (insight && insight.group.responseCategory === "Escalation Referral Recommended") {
    items.push({
      id: `escalation-${insight.group.id}`,
      priority: "high",
      action: `Review escalation recommendation for ${insight.group.name}`,
      whyItMatters: insight.sentence,
      related: insight.group.name,
      ctaLabel: "Review group",
      href: "/sel/groups",
    });
  }
  return items;
}
