"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { PlanTrackerTable } from "@/components/specialist/PlanTrackerTable";
import { getCaseloadEntries, getPlanTrackerRows } from "@/lib/specialEdCaseload";
import { fillPlanTrackerPlaceholders } from "@/lib/specialEdPlaceholderData";
import { getAllFollowUpRecords, type FollowUpRecord } from "@/lib/interventionFollowUps";

export default function Page() {
  return (
    <SpecialistAppShell>
      <SupportPlansPage />
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function SupportPlansPage() {
  const reduce = useReducedMotion();
  const entries = useMemo(() => getCaseloadEntries(), []);

  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  useEffect(() => {
    const refresh = () => setRecords(getAllFollowUpRecords());
    refresh();
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, []);

  const rows = useMemo(
    () => fillPlanTrackerPlaceholders(getPlanTrackerRows(entries, records), entries),
    [entries, records],
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
          <ClipboardList className="h-3 w-3" />
          <span>Support Plans</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          Plan &amp; Follow-Up Tracker
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Track whether interventions, accommodations, and supports are actually being implemented.
        </p>
      </header>

      <PlanTrackerTable rows={rows} title="Plan & Follow-Up Tracker" subtitle={`${rows.length} logged follow-ups`} />
    </motion.div>
  );
}
