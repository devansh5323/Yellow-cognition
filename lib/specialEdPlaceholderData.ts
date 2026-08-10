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

const REVIEW_DAYS_OUT = [2, 5, 9, 14, 20, 3, 7, 11, 16];

export function placeholderNextReviewFor(index: number): string {
  const daysOut = REVIEW_DAYS_OUT[index % REVIEW_DAYS_OUT.length];
  return new Date(Date.now() + daysOut * 24 * 60 * 60 * 1000).toISOString();
}

/** Fills Review Queue's "Pathway" and "Next Review" columns wherever the
 * real derivation came back empty. */
export function fillReviewQueuePlaceholders(rows: ReviewQueueRow[]): ReviewQueueRow[] {
  return rows.map((row, i) => ({
    ...row,
    pathway: row.pathway === "Not yet assigned" ? placeholderPathwayFor(i) : row.pathway,
    nextReview: row.nextReview ?? placeholderNextReviewFor(i),
  }));
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
