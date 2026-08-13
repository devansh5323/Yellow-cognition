"use client";

import { useEffect, useMemo, useState } from "react";
import { BehaviorPatternInsights } from "@/components/dashboard/BehaviorPatternInsights";
import { classDisruptionBreakdown, behaviorPatternInsights } from "@/lib/classBehavior";
import { getAllFollowUpRecords } from "@/lib/interventionFollowUps";

/** Reuses the /behavior page's pattern-insights panel on the dashboard's
 * "Behaviour Pattern Insights" (RTUE) segment. An empty breakdown degrades
 * cleanly — behaviorPatternInsights() only surfaces drivers that are
 * declining or in good standing, and a zeroed/empty roster is neither, so it
 * naturally returns no insights and the component's own "not enough
 * movement yet" empty state takes over. */
export function BehaviorPatternInsightsSection({ locked = false }: { locked?: boolean }) {
  const breakdown = useMemo(
    () => (locked ? [] : classDisruptionBreakdown()),
    [locked],
  );
  const [followUps, setFollowUps] = useState<ReturnType<typeof getAllFollowUpRecords>>([]);
  useEffect(() => {
    const refresh = () => setFollowUps(locked ? [] : getAllFollowUpRecords());
    refresh();
    if (locked) return;
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, [locked]);

  const insights = useMemo(
    () => behaviorPatternInsights(breakdown, followUps),
    [breakdown, followUps],
  );

  return <BehaviorPatternInsights insights={insights} />;
}
