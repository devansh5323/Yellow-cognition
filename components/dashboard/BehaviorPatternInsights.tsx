"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Shield, TrendingDown, TrendingUp, TriangleAlert, type LucideIcon } from "lucide-react";
import type { PatternInsight, PatternInsightKind } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 42%)";
const AMBER = "hsl(38 92% 50%)";
const RED = "hsl(0 78% 56%)";
const BLUE = "hsl(212 55% 48%)";

const KIND_STYLE: Record<PatternInsightKind, { tone: string; Icon: LucideIcon }> = {
  growth: { tone: GREEN, Icon: TrendingUp },
  alert: { tone: RED, Icon: TriangleAlert },
  watch: { tone: AMBER, Icon: TrendingDown },
  strength: { tone: BLUE, Icon: Shield },
};

export function BehaviorPatternInsights({ insights }: { insights: PatternInsight[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Behaviour pattern insights"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Pattern insights</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          What Yellow is noticing across logs and check-ins
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
          Real weekly change across every behaviour driver — review the 4 cards and act on
          whichever needs it.
        </p>
      </header>

      {insights.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Not enough movement yet this week to surface a pattern — check back after a few more
          logs and check-ins.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} reduce={!!reduce} />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function InsightCard({ insight, index, reduce }: { insight: PatternInsight; index: number; reduce: boolean }) {
  const { tone, Icon } = KIND_STYLE[insight.kind];

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.32, ease: EASE }}
      className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <span
          className="text-[9.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full"
          style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
        >
          {insight.tag}
        </span>
      </div>

      <div>
        <p className="font-heading font-extrabold text-[14.5px] leading-snug">{insight.title}</p>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{insight.detail}</p>
      </div>

      {insight.ctaAction === "log-positive" ? (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("ah-open-positive-form"))}
          className="mt-auto inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline text-left"
          style={{ color: tone }}
        >
          {insight.ctaLabel}
          <ArrowRight className="h-3 w-3" />
        </button>
      ) : (
        <Link
          href="/behavior"
          className="mt-auto inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
          style={{ color: tone }}
        >
          {insight.ctaLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </motion.div>
  );
}
