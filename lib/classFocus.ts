// Class Focus — data + helpers.
// The real per-student dataset (data/realStudents.ts) has zero signal for
// Attention & Focus across every one of the 16 students, and there is no
// per-student attention-domain, weekly, or monthly history in this data
// model at all — every per-student/per-domain scoring function that used
// to live here (pfi/csi/attention-domain derived) has been removed rather
// than kept with a fabricated number; the Focus page now shows an honest
// "not enough data yet" state instead. What survives is the one
// cross-page, genuinely-real feature this file provided: a "how much can I
// trust this page" confidence read built from real logged signals
// (behaviour notes, check-ins, positive logs, follow-ups) — still shown on
// both the Focus and Behavior pages.

import { getBehaviorLogTotalCount, getClassCheckInsThisWeek, getPositiveLogTotalCount } from "@/lib/checkInTools";
import { getFollowUpProgress } from "@/lib/interventionFollowUps";

/* ─────────────────────────────────────────────────────────
 * Data Sources & Confidence
 * ───────────────────────────────────────────────────────── */

export type DataConfidenceLevel = "strong" | "good" | "needs-more-data";

export const DATA_CONFIDENCE_LABEL: Record<DataConfidenceLevel, string> = {
  strong: "Strong",
  good: "Good",
  "needs-more-data": "Needs more data",
};

export const DATA_CONFIDENCE_TONE: Record<DataConfidenceLevel, string> = {
  strong: "hsl(142 55% 45%)",
  good: "hsl(212 90% 58%)",
  "needs-more-data": "hsl(38 92% 50%)",
};

export type DataSourcesSnapshot = {
  observationCount: number;
  checkInCount: number;
  positiveLogCount: number;
  followUpsCompleted: number;
  followUpsTotal: number;
  confidence: DataConfidenceLevel;
};

/** Pulls together real signals already tracked elsewhere in the app
 * (behaviour notes, class check-ins, positive logs, and intervention
 * follow-ups) into one "how much can I trust this page" snapshot — a
 * coverage heuristic over these real signals, not a fabricated score. */
export function dataSourcesSnapshot(teacherName: string): DataSourcesSnapshot {
  const observationCount = getBehaviorLogTotalCount();
  const checkInCount = getClassCheckInsThisWeek(teacherName);
  const positiveLogCount = getPositiveLogTotalCount();
  const { completed: followUpsCompleted, total: followUpsTotal } = getFollowUpProgress();

  const signals = [
    observationCount >= 5,
    checkInCount >= 1,
    positiveLogCount >= 3,
    followUpsTotal === 0 || followUpsCompleted / followUpsTotal >= 0.5,
  ];
  const strongSignals = signals.filter(Boolean).length;
  const confidence: DataConfidenceLevel =
    strongSignals >= 3 ? "strong" : strongSignals >= 2 ? "good" : "needs-more-data";

  return {
    observationCount,
    checkInCount,
    positiveLogCount,
    followUpsCompleted,
    followUpsTotal,
    confidence,
  };
}
