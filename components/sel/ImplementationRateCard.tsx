"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import type { ImplementationSummary } from "@/lib/selImplementation";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function ImplementationRateCard({ summary }: { summary: ImplementationSummary }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="SEL Implementation Overview"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <ClipboardCheck className="h-3 w-3" />
            <span>SEL Implementation Overview</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-heading font-black text-[30px] leading-none tabular-nums">{summary.completionPct}%</span>
            <span className="text-[13px] font-bold text-muted-foreground">implementation</span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            {summary.classesParticipating} of {summary.totalClasses} classrooms completed planned SEL activities this
            month.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            {summary.teachersActive} of {summary.totalTeachers} teachers active this month · No prior period on record
            yet.
          </p>
        </div>

        <Link
          href="/sel/implementation"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary shrink-0"
        >
          View implementation
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.section>
  );
}
