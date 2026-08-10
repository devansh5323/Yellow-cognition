// The special educator's caseload — a real, derived subset of the existing
// 24-student roster (no new multi-teacher student model needed, since
// STUDENTS already has enough grade/section variation to represent
// "students across multiple classrooms"). Rebuilt minimally to back the
// dashboard's Support Status filter; will grow as later sections of the
// new design (Review Queue, Plan & Follow-Up Tracker, Priority Actions,
// etc.) are shared.

import { STUDENTS, type Student } from "@/data/mockData";
import { classDisruptionBreakdown, DISRUPTION_LABEL } from "@/lib/classBehavior";
import { pillarScores, studentComposites, type StudentComposite } from "@/lib/classHealth";
import type { FollowUpRecord, PendingFollowUp } from "@/lib/interventionFollowUps";

export type CaseloadTier = "tier2" | "tier3";

export const TIER_LABEL: Record<CaseloadTier, string> = {
  tier2: "Tier 2",
  tier3: "Tier 3",
};

export type CaseloadEntry = {
  student: Student;
  composite: StudentComposite;
  tier: CaseloadTier;
};

const CASELOAD_LIMIT = 9;

export function caseloadTierFromStatus(status: StudentComposite["status"]): CaseloadTier {
  return status === "needs-support" ? "tier3" : "tier2";
}

/** Real derivation: the students with the weakest composite scores who
 * fall in the "watch" or "needs-support" bands — the same real 4-pillar
 * scoring already used across the teacher dashboard, just applied
 * school-wide instead of to one class, and capped to a realistic
 * special-ed caseload size. */
export function getCaseloadEntries(limit = CASELOAD_LIMIT): CaseloadEntry[] {
  const composites = studentComposites(STUDENTS);
  return composites
    .filter((c) => c.status === "needs-support" || c.status === "watch")
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((composite) => ({
      student: composite.student,
      composite,
      tier: caseloadTierFromStatus(composite.status),
    }));
}

function firstName(student: Student): string {
  return student.name.split(" ")[0];
}

function joinNamesTruncated(names: string[], max = 2): string {
  if (names.length === 0) return "—";
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} +${names.length - max} more`;
}

/* ─────────────────────────────────────────────────────────
 * Section 3 — Student Support Action Hub. A dynamic, priority-ranked list:
 * a rung is only pushed when real data backs it, so this correctly shows
 * fewer items than a fully-built dashboard would (no IEP/accommodation/
 * meeting model exists yet in this rebuild) rather than padding with
 * placeholder rows. New rungs (upcoming IEP meetings, accommodation
 * confirmations, meeting summaries) get added here once their underlying
 * sections/data models are designed.
 * ───────────────────────────────────────────────────────── */

export type ActionHubPriority = "high" | "medium" | "low";

export type ActionHubItem = {
  id: string;
  priority: ActionHubPriority;
  action: string;
  whyItMatters: string;
  related: string;
  dueDate: string | null;
  ctaLabel: string;
  href: string;
};

export function studentSupportActionHub(
  entries: CaseloadEntry[],
  overduePending: PendingFollowUp[],
): ActionHubItem[] {
  const items: ActionHubItem[] = [];

  const urgent = entries.filter((e) => e.tier === "tier3");
  if (urgent.length > 0) {
    items.push({
      id: "urgent-cases",
      priority: "high",
      action: `Review ${urgent.length} urgent student case${urgent.length === 1 ? "" : "s"}`,
      whyItMatters: "Composite scores have dropped into the most severe support band — these cases need review first.",
      related: joinNamesTruncated(urgent.map((e) => firstName(e.student))),
      dueDate: null,
      ctaLabel: "Review now",
      href: "/specialist/review-queue",
    });
  }

  if (overduePending.length > 0) {
    items.push({
      id: "overdue-follow-ups",
      priority: "high",
      action: `Log ${overduePending.length} overdue follow-up${overduePending.length === 1 ? "" : "s"}`,
      whyItMatters: "These students were flagged with a risk reason but no follow-up has been logged yet.",
      related: joinNamesTruncated(overduePending.map((p) => firstName(p.student))),
      dueDate: null,
      ctaLabel: "Log follow-ups",
      href: "/specialist/support-plans",
    });
  }

  const rank: Record<ActionHubPriority, number> = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

/* ─────────────────────────────────────────────────────────
 * Section 4 — Review Queue. The main working list. Every column is a real
 * derivation from data that already exists — "Pathway" honestly reads "Not
 * yet assigned" for every row since no IEP/504 plan-assignment model
 * exists yet (that's Table B/C's job, not yet reached), and "Next Review"
 * reads "—" since no review-date model exists yet either. Status and
 * Main Concern *are* real: Status reuses the same urgency signals as the
 * Action Hub (Tier 3 / pending follow-up), and Main Concern picks the
 * weakest signal across academic/attention/task pillars and this
 * student's active behaviour drivers — whichever is genuinely worst.
 * ───────────────────────────────────────────────────────── */

export type ReviewQueueStatus = "high-priority" | "follow-up-due" | "monitoring";

export const REVIEW_QUEUE_STATUS_LABEL: Record<ReviewQueueStatus, string> = {
  "high-priority": "High Priority",
  "follow-up-due": "Follow-up Due",
  monitoring: "Monitoring",
};

export const REVIEW_QUEUE_STATUS_TONE: Record<ReviewQueueStatus, string> = {
  "high-priority": "hsl(0 78% 56%)",
  "follow-up-due": "hsl(38 92% 48%)",
  monitoring: "hsl(212 55% 50%)",
};

export type ReviewQueueRow = {
  studentId: string;
  student: Student;
  pathway: string;
  concern: string;
  evidenceSource: string;
  status: ReviewQueueStatus;
  statusLabel: string;
  statusTone: string;
  nextReview: string | null;
  actionLabel: string;
};

/** Weakest real signal for this one student, across the academic/focus/
 * task pillars and any actively-flagged behaviour driver — same "pick the
 * worst of what's real" approach used elsewhere in this app. */
export function mainConcernAndEvidence(student: Student): { concern: string; evidenceSource: string } {
  const pillars = pillarScores(student);
  const candidates: { label: string; score: number; evidenceSource: string }[] = [
    { label: "Learning Progress", score: pillars.academic, evidenceSource: "Subject scores" },
    { label: "Attention & Focus", score: pillars.focus, evidenceSource: "Attention domain scores" },
    { label: "Task Engagement", score: pillars.task, evidenceSource: "Task completion signal" },
  ];
  for (const d of classDisruptionBreakdown([student])) {
    if (d.studentCount > 0) {
      candidates.push({ label: DISRUPTION_LABEL[d.key], score: d.score, evidenceSource: "Behaviour driver signal" });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  const top = candidates[0];
  return top ? { concern: top.label, evidenceSource: top.evidenceSource } : { concern: "—", evidenceSource: "—" };
}

export function getReviewQueueRows(entries: CaseloadEntry[], overduePending: PendingFollowUp[]): ReviewQueueRow[] {
  const pendingIds = new Set(overduePending.map((p) => p.student.id));

  const rows = entries.map((e) => {
    const { concern, evidenceSource } = mainConcernAndEvidence(e.student);
    const status: ReviewQueueStatus = pendingIds.has(e.student.id)
      ? "follow-up-due"
      : e.tier === "tier3"
        ? "high-priority"
        : "monitoring";
    return {
      studentId: e.student.id,
      student: e.student,
      pathway: "Not yet assigned",
      concern,
      evidenceSource,
      status,
      statusLabel: REVIEW_QUEUE_STATUS_LABEL[status],
      statusTone: REVIEW_QUEUE_STATUS_TONE[status],
      nextReview: null,
      actionLabel: status === "follow-up-due" ? "Log follow-up" : status === "high-priority" ? "Review" : "Open case",
    };
  });

  const urgency: Record<ReviewQueueStatus, number> = { "high-priority": 0, "follow-up-due": 1, monitoring: 2 };
  return rows.sort((a, b) => urgency[a.status] - urgency[b.status]);
}

/* ─────────────────────────────────────────────────────────
 * Section 5 — Plan & Follow-Up Tracker. Reuses lib/interventionFollowUps.ts
 * directly rather than a new intervention model — its FollowUpRecord shape
 * (support/implementation/outcome/nextStep) already matches this section's
 * Strategy/Implementation/Outcome/Next Step columns almost exactly, and
 * it's real, already-logged data (from the teacher's PBIS follow-up flow),
 * not fabricated. "Type" substitutes the caseload Tier for IEP/504, since
 * no plan-type assignment model exists yet (same gap as Review Queue's
 * "Pathway" column). Starts empty until a follow-up is actually logged —
 * an honest empty state, not a padded one.
 * ───────────────────────────────────────────────────────── */

export type PlanTrackerRow = {
  id: string;
  studentId: string;
  student: Student;
  strategy: string;
  type: string;
  implementation: string;
  outcome: string;
  nextStep: string;
  record: FollowUpRecord;
};

export function getPlanTrackerRows(entries: CaseloadEntry[], records: FollowUpRecord[]): PlanTrackerRow[] {
  const byId = new Map(entries.map((e) => [e.student.id, e]));
  return records
    .filter((r) => byId.has(r.studentId))
    .map((r) => {
      const entry = byId.get(r.studentId)!;
      return {
        id: r.id,
        studentId: r.studentId,
        student: entry.student,
        strategy: r.support,
        type: TIER_LABEL[entry.tier],
        implementation: r.implementation,
        outcome: r.outcome,
        nextStep: r.nextStep,
        record: r,
      };
    })
    .sort((a, b) => +new Date(b.record.createdAt) - +new Date(a.record.createdAt));
}

/* ─────────────────────────────────────────────────────────
 * Section 6 — Support Signals / Patterns. Every stat is a real, current
 * snapshot; none carries a month-over-month delta or trend line, since no
 * historical snapshot of the caseload's composite scores or concern mix
 * is actually persisted anywhere — a fabricated "+9 from last month" would
 * be exactly the kind of unsupported number this dashboard has avoided
 * everywhere else. "Overall Support Trend" is the one card with no real
 * current substitute either, so it's marked unavailable like Section 2's
 * IEP/504/Upcoming Reviews tiles.
 * ───────────────────────────────────────────────────────── */

export type ConcernBreakdownEntry = { label: string; count: number; pct: number };

/** Real distribution of each caseload student's single worst signal (see
 * mainConcernAndEvidence) — "Top Support Reason" is just the first entry. */
export function concernBreakdown(entries: CaseloadEntry[]): ConcernBreakdownEntry[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const { concern } = mainConcernAndEvidence(e.student);
    counts.set(concern, (counts.get(concern) ?? 0) + 1);
  }
  const total = entries.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

/** School-wide (not caseload-scoped), since "improving" is a distinct
 * composite band from the "watch"/"needs-support" bands the caseload
 * itself is filtered to — a caseload student can't carry this status by
 * definition, so this signal only means something across the full real
 * student roster. */
export function studentsImprovingCount(allStudents: Student[] = STUDENTS): number {
  return studentComposites(allStudents).filter((c) => c.status === "improving").length;
}
