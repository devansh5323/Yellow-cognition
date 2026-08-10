"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ReviewQueueTable } from "@/components/specialist/ReviewQueueTable";
import { getCaseloadEntries, getReviewQueueRows } from "@/lib/specialEdCaseload";
import { fillReviewQueuePlaceholders } from "@/lib/specialEdPlaceholderData";
import { getPendingFollowUps, type PendingFollowUp } from "@/lib/interventionFollowUps";

export default function Page() {
  return (
    <SpecialistAppShell>
      <ReviewQueuePage />
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function ReviewQueuePage() {
  const reduce = useReducedMotion();
  const entries = useMemo(() => getCaseloadEntries(), []);

  const [overduePending, setOverduePending] = useState<PendingFollowUp[]>([]);
  useEffect(() => {
    const refresh = () => {
      const caseloadIds = new Set(entries.map((e) => e.student.id));
      setOverduePending(getPendingFollowUps().filter((p) => caseloadIds.has(p.student.id)));
    };
    refresh();
  }, [entries]);

  const rows = useMemo(
    () => fillReviewQueuePlaceholders(getReviewQueueRows(entries, overduePending)),
    [entries, overduePending],
  );

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

      <ReviewQueueTable rows={rows} title="Review Queue" subtitle={`${rows.length} students`} />
    </motion.div>
  );
}
