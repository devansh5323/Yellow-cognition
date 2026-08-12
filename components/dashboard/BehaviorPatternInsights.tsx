"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eye, TrendingUp } from "lucide-react";
import type { PatternInsight } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TYPE_META = {
  watch: { label: "Watch", tone: "hsl(38 92% 48%)", Icon: Eye },
  strength: { label: "Strength", tone: "hsl(142 55% 42%)", Icon: TrendingUp },
} as const;

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
          Cross-pattern signals pulled from every driver&apos;s real weekly movement and logged
          follow-ups.
        </p>
      </header>

      {insights.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Not enough movement yet this week to surface a pattern — check back after a few more
          logs and check-ins.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {insights.map((insight, i) => {
            const meta = TYPE_META[insight.type];
            const Icon = meta.Icon;
            return (
              <motion.div
                key={insight.id}
                initial={reduce ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                className="rounded-xl border border-border bg-background p-3.5 flex flex-col gap-2"
              >
                <span
                  className="inline-flex items-center gap-1 w-fit rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: meta.tone, background: `color-mix(in srgb, ${meta.tone} 12%, transparent)` }}
                >
                  <Icon className="h-3 w-3" strokeWidth={2.4} />
                  {meta.label}
                </span>
                <p className="text-[12px] leading-snug text-foreground/85">{insight.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
