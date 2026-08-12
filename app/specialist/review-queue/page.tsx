"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ListChecks, X } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ReviewQueueTable } from "@/components/specialist/ReviewQueueTable";
import { ReviewQueueSummary } from "@/components/specialist/ReviewQueueSummary";
import { ReviewQueueTrend } from "@/components/specialist/ReviewQueueTrend";
import { PriorityCasesTable } from "@/components/specialist/PriorityCasesTable";
import { PriorityQuickActions } from "@/components/specialist/PriorityQuickActions";
import {
  getCaseloadEntries,
  getReviewQueueRows,
  reviewQueueSummary,
  studentSupportActionHub,
  type ActionHubItem,
} from "@/lib/specialEdCaseload";
import {
  buildPlaceholderAssignments,
  fillReviewQueuePlaceholders,
  placeholderActionHubItems,
} from "@/lib/specialEdPlaceholderData";
import { getPendingFollowUps, type PendingFollowUp } from "@/lib/interventionFollowUps";
import { filterReviewQueueRows, REVIEW_QUEUE_FILTER_LABEL, type ReviewQueueFilterKey } from "./filters";

export default function Page() {
  return (
    <SpecialistAppShell>
      <Suspense fallback={null}>
        <ReviewQueuePage />
      </Suspense>
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function ReviewQueuePage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") as ReviewQueueFilterKey | null;

  const entries = useMemo(() => getCaseloadEntries(), []);

  const [overduePending, setOverduePending] = useState<PendingFollowUp[]>([]);
  useEffect(() => {
    const refresh = () => {
      const caseloadIds = new Set(entries.map((e) => e.student.id));
      setOverduePending(getPendingFollowUps().filter((p) => caseloadIds.has(p.student.id)));
    };
    refresh();
  }, [entries]);

  const assignments = useMemo(() => buildPlaceholderAssignments(entries), [entries]);
  const newReferralIds = useMemo(
    () => new Set(Array.from(assignments.entries()).filter(([, a]) => a.isNewReferral).map(([id]) => id)),
    [assignments],
  );

  const allRows = useMemo(
    () => fillReviewQueuePlaceholders(getReviewQueueRows(entries, overduePending), assignments),
    [entries, overduePending, assignments],
  );

  // Read the impure Date.now() once per mount rather than on every render.
  const [nowMs] = useState(() => Date.now());
  const summaryStats = useMemo(
    () => reviewQueueSummary(allRows, newReferralIds, nowMs),
    [allRows, newReferralIds, nowMs],
  );
  const visibleRows = useMemo(
    () => filterReviewQueueRows(allRows, activeFilter, newReferralIds, nowMs),
    [allRows, activeFilter, newReferralIds, nowMs],
  );

  const priorityCases = useMemo(() => {
    const real = studentSupportActionHub(entries, overduePending);
    const combined = [...real, ...placeholderActionHubItems(entries)];
    const rank: Record<ActionHubItem["priority"], number> = { high: 0, medium: 1, low: 2 };
    return combined.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, [entries, overduePending]);

  const setFilter = (key: ReviewQueueFilterKey | null) => {
    router.push(key ? `/specialist/review-queue?filter=${key}` : "/specialist/review-queue");
  };

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <ListChecks className="h-3 w-3" />
          <span>Review Queue</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          The main working list
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Every student on caseload, sorted by urgency. Click a row to open their student support profile.
        </p>
      </header>

      <ReviewQueueSummary stats={summaryStats} activeFilter={activeFilter} onFilterChange={setFilter} />

      {activeFilter && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1 text-[11.5px] font-bold">
            Filtered by: {REVIEW_QUEUE_FILTER_LABEL[activeFilter] ?? activeFilter}
            <button
              type="button"
              onClick={() => setFilter(null)}
              aria-label="Clear filter"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            {visibleRows.length} of {allRows.length} students
          </span>
        </div>
      )}

      <PriorityCasesTable items={priorityCases} />

      <PriorityQuickActions />

      <ReviewQueueTrend />

      <ReviewQueueTable rows={visibleRows} title="Review Queue" subtitle={`${visibleRows.length} students`} />
    </motion.div>
  );
}
