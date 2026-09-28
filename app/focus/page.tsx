"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { DataSourcesConfidence } from "@/components/dashboard/DataSourcesConfidence";
import { MonthlyFocusCheckIn } from "@/components/dashboard/MonthlyFocusCheckIn";
import { FocusSnapshot } from "@/components/dashboard/FocusSnapshot";
import { AttentionPatternInsights } from "@/components/dashboard/AttentionPatternInsights";
import { ClassAttentionProfile } from "@/components/dashboard/ClassAttentionProfile";
import { FocusSupportTable } from "@/components/dashboard/FocusSupportTable";
import { FocusRecommendsStrip } from "@/components/dashboard/FocusRecommendsStrip";
import { FocusTrendsSection } from "@/components/dashboard/FocusTrendsSection";
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

// Visual hierarchy per the Attention & Focus Detail Page spec:
// Snapshot (what's happening overall) → Patterns (what's coming up across
// domains) → Priority (who needs help and where) → Actions (what to do) →
// Trends (is it working). The real, independent pieces (data sources,
// monthly check-in) stay above all of it; everything below is demo data —
// see lib/classFocus.ts and components/dashboard/DemoDataBadge.tsx.
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
        {/* Page header */}
        <header className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">Attention & Focus</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">Attention & focus</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">How well this roster is holding attention and staying on task.</p>
        </header>

        {/* Data sources & confidence — real */}
        <DataSourcesConfidence />

        {/* Monthly check-in — an independent, real teacher self-report */}
        <MonthlyFocusCheckIn />

        {/* Snapshot — what's happening overall in the classroom */}
        <FocusSnapshot snapshot={snapshot} />

        {/* Patterns — what's coming up across all focus domains */}
        <AttentionPatternInsights insights={insights} />
        <ClassAttentionProfile domains={heatmap} logsPerStudent={logsPerStudent} />

        {/* Priority — who needs help and where */}
        <FocusSupportTable />

        {/* Actions — what to do */}
        <div id="yellow-recommends">
          <FocusRecommendsStrip />
        </div>

        {/* Trends — is it working */}
        <FocusTrendsSection snapshot={snapshot} />
      </motion.div>
    </div>
  );
}
