// DEMO PLACEHOLDER DATA — static, plausible values that fill in the fields
// this dashboard currently has no real data model for (IEP/504 plan
// assignment, review scheduling, accommodation implementation, meeting
// calendar). Requested explicitly so the full, populated layout can be
// previewed before those models are actually built. Every fill function
// here only overrides a field when the real value is genuinely empty
// ("Not yet assigned", null, or zero real records) — it never overwrites
// real data. Delete this file and the calls into it once the real IEP/
// 504/meeting/accommodation models exist; nothing here is persisted.

import type { ActionHubItem, CaseloadEntry, ReviewQueueRow, PlanTrackerRow } from "@/lib/specialEdCaseload";
import { TIER_LABEL } from "@/lib/specialEdCaseload";
import type { FollowUpRecord } from "@/lib/interventionFollowUps";

export type PlaceholderPathway = "IEP" | "504";

const PATHWAYS: PlaceholderPathway[] = ["IEP", "504"];

export function placeholderPathwayFor(index: number): PlaceholderPathway {
  return PATHWAYS[index % PATHWAYS.length];
}

// A mix of past (overdue) and future (upcoming) offsets, so the Review
// Queue's "overdue" and "upcoming" filters/summary each have something
// real to show rather than an all-future list.
const REVIEW_DAYS_OUT = [-3, 2, 5, -6, 9, 14, 3, 7, 11, 16];

export function placeholderNextReviewFor(index: number): string {
  const daysOut = REVIEW_DAYS_OUT[index % REVIEW_DAYS_OUT.length];
  return new Date(Date.now() + daysOut * 24 * 60 * 60 * 1000).toISOString();
}

export type PlaceholderGoalStatus = "On Track" | "Needs Attention" | "Not Started";

const GOAL_STATUSES: PlaceholderGoalStatus[] = ["On Track", "On Track", "Needs Attention", "Not Started"];

export type PlaceholderAssignment = {
  pathway: PlaceholderPathway;
  nextReview: string;
  /** Whether this is a brand-new (teacher/self) referral vs. a Yellow-
   * generated flag — real referral capture doesn't exist yet (see
   * RecordBehaviorForm's "special educator referral" checkbox, which only
   * folds into free-text notes today), so this is a small stable subset
   * standing in for it. */
  isNewReferral: boolean;
  /** No IEP goal-tracking model exists yet — a small stable subset
   * standing in for per-goal progress until that model is built. */
  goalStatus: PlaceholderGoalStatus;
  /** No related-services (OT/speech/counseling) confirmation model exists
   * yet — true for a small stable subset, standing in for "teacher/provider
   * hasn't confirmed this service is happening as written." */
  servicesAwaitingConfirmation: boolean;
};

/** Assigns each student a stable pathway + next-review date + referral
 * flag, keyed by student ID, built once from the *full, unfiltered*
 * caseload. Stable keying matters once the header filters (grade/status/
 * view) can shrink `entries` before it reaches this function elsewhere —
 * without it, a given student's placeholder pathway would flicker
 * depending on which index they happened to land at after filtering. */
export function buildPlaceholderAssignments(fullEntries: CaseloadEntry[]): Map<string, PlaceholderAssignment> {
  const map = new Map<string, PlaceholderAssignment>();
  fullEntries.forEach((e, i) => {
    map.set(e.student.id, {
      pathway: placeholderPathwayFor(i),
      nextReview: placeholderNextReviewFor(i),
      isNewReferral: i === 0,
      goalStatus: GOAL_STATUSES[i % GOAL_STATUSES.length],
      servicesAwaitingConfirmation: i % 3 === 0,
    });
  });
  return map;
}

/** Fills Review Queue's "Pathway" and "Next Review" columns wherever the
 * real derivation came back empty, using the stable per-student assignment
 * so a student's placeholder pathway doesn't change as filters are applied. */
export function fillReviewQueuePlaceholders(
  rows: ReviewQueueRow[],
  assignments: Map<string, PlaceholderAssignment>,
): ReviewQueueRow[] {
  return rows.map((row) => {
    const a = assignments.get(row.studentId);
    return {
      ...row,
      pathway: row.pathway === "Not yet assigned" ? a?.pathway ?? "IEP" : row.pathway,
      nextReview: row.nextReview ?? a?.nextReview ?? null,
    };
  });
}

type TrackerTemplate = {
  strategy: string;
  implementation: FollowUpRecord["implementation"];
  outcome: FollowUpRecord["outcome"];
  nextStep: FollowUpRecord["nextStep"];
  reason: FollowUpRecord["reason"];
  teacherResponse: string;
  evidence: string;
};

const TRACKER_TEMPLATES: TrackerTemplate[] = [
  {
    strategy: "Check-In / Check-Out",
    implementation: "Tried a few times",
    outcome: "No change",
    nextStep: "Adjust strategy",
    reason: "Declining Performance",
    teacherResponse: "Checked in each morning and afternoon for the past two weeks.",
    evidence: "No change in classroom engagement observed during check-ins.",
  },
  {
    strategy: "Visual schedule",
    implementation: "Tried consistently",
    outcome: "Improved",
    nextStep: "Continue",
    reason: "At Risk (CSI<50)",
    teacherResponse: "Posted a visual schedule at the student's desk and reviewed it each transition.",
    evidence: "Fewer transition-related redirects logged this week.",
  },
  {
    strategy: "Preferential seating",
    implementation: "Tried consistently",
    outcome: "No change",
    nextStep: "Escalate to Tier 2",
    reason: "High Impulsivity",
    teacherResponse: "Moved seat to the front row away from high-traffic areas.",
    evidence: "Impulse-control incidents held steady rather than declining.",
  },
  {
    strategy: "Movement breaks",
    implementation: "Tried once",
    outcome: "Too early to tell",
    nextStep: "Involve special educator",
    reason: "Emotional Dips",
    teacherResponse: "Offered a 2-minute movement break before independent work.",
    evidence: "Only one data point so far — need another week before judging effect.",
  },
  {
    strategy: "Extended processing time",
    implementation: "Tried consistently",
    outcome: "Improved",
    nextStep: "Continue",
    reason: "Declining Performance",
    teacherResponse: "Gave an extra 10 minutes on independent tasks and quizzes.",
    evidence: "Completion rate on independent work rose noticeably.",
  },
];

function placeholderCreatedAtFor(index: number): string {
  const daysAgo = [3, 6, 1, 9, 4][index % 5];
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

/** Fills the Plan & Follow-Up Tracker with plausible rows built from the
 * *real* caseload students, only when no real follow-up has actually been
 * logged yet. */
export function fillPlanTrackerPlaceholders(
  rows: PlanTrackerRow[],
  entries: CaseloadEntry[],
): PlanTrackerRow[] {
  if (rows.length > 0) return rows;
  return entries.slice(0, TRACKER_TEMPLATES.length).map((e, i) => {
    const t = TRACKER_TEMPLATES[i % TRACKER_TEMPLATES.length];
    const record: FollowUpRecord = {
      id: `placeholder-${e.student.id}`,
      studentId: e.student.id,
      reason: t.reason,
      support: t.strategy,
      implementation: t.implementation,
      teacherResponse: t.teacherResponse,
      outcome: t.outcome,
      evidence: t.evidence,
      nextStep: t.nextStep,
      createdAt: placeholderCreatedAtFor(i),
    };
    return {
      id: record.id,
      studentId: e.student.id,
      student: e.student,
      strategy: t.strategy,
      type: TIER_LABEL[e.tier],
      implementation: t.implementation,
      outcome: t.outcome,
      nextStep: t.nextStep,
      record,
    };
  });
}

/** Today & Upcoming rail — plausible meeting slots built from real
 * caseload students, matching the reference design's own worked example. */
export type PlaceholderMeeting = {
  time: string;
  type: string;
  studentName: string;
  note: string;
  ctaLabel: string;
};

const MEETING_TEMPLATES: { time: string; type: string; note: string; ctaLabel: string }[] = [
  { time: "10:00 AM", type: "IEP Review", note: "Prep needed: teacher follow-up missing", ctaLabel: "Prepare summary" },
  { time: "1:00 PM", type: "504 Review", note: "Accommodation confirmation pending", ctaLabel: "Request update" },
  { time: "3:30 PM", type: "Parent Meeting", note: "Progress review scheduled", ctaLabel: "Generate parent summary" },
];

export function placeholderMeetings(entries: CaseloadEntry[]): PlaceholderMeeting[] {
  return MEETING_TEMPLATES.map((m, i) => ({
    ...m,
    studentName: entries[i % Math.max(1, entries.length)]?.student.name.split(" ")[0] ?? "—",
  })).filter(() => entries.length > 0);
}

/* ─────────────────────────────────────────────────────────
 * Review Queue Trend — "is the workload increasing, stabilising, or
 * resolving?" needs real week-over-week history this app doesn't persist
 * anywhere (same limitation as Support Signals' Overall Support Trend).
 * Static placeholder datasets per time filter, scaled to a caseload this
 * size — not derived from anything, purely illustrative until real
 * history exists.
 * ───────────────────────────────────────────────────────── */

export type ReviewQueueTrendPeriod = "week" | "month" | "term";

export type ReviewQueueTrendData = {
  newReferrals: number;
  studentsReviewed: number;
  studentsEscalated: number;
  studentsMovedToMonitoring: number;
  casesClosed: number;
  avgDaysAwaitingReview: number;
  insight: string;
};

const REVIEW_QUEUE_TREND: Record<ReviewQueueTrendPeriod, ReviewQueueTrendData> = {
  week: {
    newReferrals: 1,
    studentsReviewed: 3,
    studentsEscalated: 1,
    studentsMovedToMonitoring: 1,
    casesClosed: 0,
    avgDaysAwaitingReview: 4,
    insight: "Workload is stable this week — reviews are keeping pace with new referrals.",
  },
  month: {
    newReferrals: 4,
    studentsReviewed: 11,
    studentsEscalated: 2,
    studentsMovedToMonitoring: 3,
    casesClosed: 2,
    avgDaysAwaitingReview: 5,
    insight: "Reviews are resolving faster than new referrals are arriving this month.",
  },
  term: {
    newReferrals: 9,
    studentsReviewed: 26,
    studentsEscalated: 4,
    studentsMovedToMonitoring: 7,
    casesClosed: 6,
    avgDaysAwaitingReview: 6,
    insight: "Workload has been increasing gradually this term — escalations are up slightly.",
  },
};

export function reviewQueueTrendFor(period: ReviewQueueTrendPeriod): ReviewQueueTrendData {
  return REVIEW_QUEUE_TREND[period];
}

/** Action Hub — the three rungs that need IEP/504/meeting data this
 * rebuild doesn't have yet, using real caseload students for personalisation. */
export function placeholderActionHubItems(entries: CaseloadEntry[]): ActionHubItem[] {
  if (entries.length === 0) return [];
  const names = (n: number) => entries.slice(0, n).map((e) => e.student.name.split(" ")[0]).join(", ") || "—";
  return [
    {
      id: "placeholder-iep-meetings",
      priority: "medium",
      action: "Prepare 2 upcoming IEP meetings",
      whyItMatters: "IEP meetings are scheduled in the next 7 days and need a pre-meeting summary.",
      related: names(2),
      dueDate: placeholderNextReviewFor(0),
      ctaLabel: "Prepare",
      href: "/specialist/support-plans",
    },
    {
      id: "placeholder-accommodation-confirmations",
      priority: "medium",
      action: "Confirm 3 accommodation implementations",
      whyItMatters: "Teacher confirmations are pending for active accommodation plans.",
      related: names(3),
      dueDate: null,
      ctaLabel: "Request updates",
      href: "/specialist/support-plans",
    },
    {
      id: "placeholder-parent-summary",
      priority: "low",
      action: "Generate support summary for parent meeting",
      whyItMatters: "A parent meeting is coming up and needs a pre-meeting summary generated.",
      related: names(1),
      dueDate: placeholderNextReviewFor(2),
      ctaLabel: "Generate",
      href: "/specialist/support-plans",
    },
  ];
}
