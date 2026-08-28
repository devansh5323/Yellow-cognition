"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/dashboard/AppShell";
import { FocusSnapshot } from "@/components/dashboard/FocusSnapshot";
import { AttentionPatternInsights } from "@/components/dashboard/AttentionPatternInsights";
import { ClassAttentionProfile } from "@/components/dashboard/ClassAttentionProfile";
import { FocusSupportTable } from "@/components/dashboard/FocusSupportTable";
import { FocusRecommendsStrip } from "@/components/dashboard/FocusRecommendsStrip";
import { FocusTrendsSection } from "@/components/dashboard/FocusTrendsSection";
import { MonthlyFocusCheckIn } from "@/components/dashboard/MonthlyFocusCheckIn";
import {
  attentionHeatmapLogsPerStudent,
  attentionPatternInsights,
  classAttentionHeatmap,
  classFocusSnapshot,
} from "@/lib/classFocus";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <AppShell>
      <FocusPage />
    </AppShell>
  );
}

// Just the 8 spec'd segments, in order — no page header, data-sources
// strip, or class/period filters, since none of those are one of the 8.
function FocusPage() {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => classFocusSnapshot(), []);
  const insights = useMemo(() => attentionPatternInsights(), []);
  const heatmap = useMemo(() => classAttentionHeatmap(), []);
  const logsPerStudent = useMemo(() => attentionHeatmapLogsPerStudent(), []);

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        {/* 1. Focus Snapshot */}
        <FocusSnapshot snapshot={snapshot} />

        {/* 2. Attention Pattern Insights */}
        <AttentionPatternInsights insights={insights} />

        {/* 3. Monthly Check-In */}
        <MonthlyFocusCheckIn />

        {/* 4. Attention Domain Heatmap */}
        <ClassAttentionProfile domains={heatmap} logsPerStudent={logsPerStudent} />

        {/* 6. Yellow Recommends */}
        <div id="yellow-recommends">
          <FocusRecommendsStrip />
        </div>

        {/* 7. Trends */}
        <FocusTrendsSection snapshot={snapshot} />

        {/* 8. Students Needing Focus Support */}
        <FocusSupportTable />
      </motion.div>
    </div>
  );
}
