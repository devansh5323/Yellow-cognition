"use client";

import { useMemo } from "react";
import { BehaviorPatternInsights } from "@/components/dashboard/BehaviorPatternInsights";
import { classDisruptionBreakdown, behaviorPatternInsights } from "@/lib/classBehavior";

/** Reuses the /behavior page's disruption breakdown to drive the dashboard's
 * "Pattern insights" (RTUE) segment. An empty breakdown degrades cleanly —
 * behaviorPatternInsights() only surfaces drivers with a real score and
 * weekly change, and a zeroed/empty roster has neither, so it naturally
 * returns no insights and the component's own "not enough movement yet"
 * empty state takes over. */
export function BehaviorPatternInsightsSection({ locked = false }: { locked?: boolean }) {
  const breakdown = useMemo(
    () => (locked ? [] : classDisruptionBreakdown()),
    [locked],
  );

  const insights = useMemo(() => behaviorPatternInsights(breakdown), [breakdown]);

  return <BehaviorPatternInsights insights={insights} />;
}
