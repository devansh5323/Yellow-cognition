// Shared filter logic for the Review Queue L2 — used by the page itself,
// the Summary tiles, and the L1 dashboard's metric-tile deep links
// (?filter=<key> on this route).

import type { ReviewQueueRow } from "@/lib/specialEdCaseload";

export type ReviewQueueFilterKey =
  | "iep"
  | "504"
  | "upcoming"
  | "escalations"
  | "overdue"
  | "new-referral"
  | "yellow-flag";

export const REVIEW_QUEUE_FILTER_LABEL: Record<ReviewQueueFilterKey, string> = {
  iep: "IEP",
  "504": "504",
  upcoming: "Upcoming Reviews",
  escalations: "Priority Escalations",
  overdue: "Overdue for Review",
  "new-referral": "New Referrals",
  "yellow-flag": "Yellow-Generated Flags",
};

const UPCOMING_WINDOW_DAYS = 7;

export function filterReviewQueueRows(
  rows: ReviewQueueRow[],
  filter: ReviewQueueFilterKey | null,
  newReferralIds: Set<string>,
  nowMs: number,
): ReviewQueueRow[] {
  if (!filter) return rows;
  switch (filter) {
    case "iep":
      return rows.filter((r) => r.pathway === "IEP");
    case "504":
      return rows.filter((r) => r.pathway === "504");
    case "escalations":
      return rows.filter((r) => r.status === "high-priority");
    case "overdue":
      return rows.filter((r) => r.nextReview && +new Date(r.nextReview) < nowMs);
    case "upcoming":
      return rows.filter(
        (r) =>
          r.nextReview &&
          +new Date(r.nextReview) >= nowMs &&
          +new Date(r.nextReview) <= nowMs + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      );
    case "new-referral":
      return rows.filter((r) => newReferralIds.has(r.studentId));
    case "yellow-flag":
      return rows.filter((r) => !newReferralIds.has(r.studentId));
    default:
      return rows;
  }
}
