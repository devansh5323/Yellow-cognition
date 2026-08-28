"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { allEmergingPatterns, type Pulse } from "@/lib/selPulse";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** "What Changed & SEL Trends" — real week-over-week movement, per grade,
 * from the same allEmergingPatterns() the Action Hub already draws its
 * "review rising X in Y" rungs from. Its own 3-consecutive-week gate is
 * what keeps this honestly muted until there's enough real data — no
 * separate "two time periods" check needed on top of it. */
export function SelTrendsCard({ pulses }: { pulses: Pulse[] }) {
  const reduce = useReducedMotion();
  const patterns = allEmergingPatterns(pulses);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="What Changed & SEL Trends"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <TrendingUp className="h-3 w-3" />
          <span>What Changed &amp; SEL Trends</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          {patterns.length > 0 ? "Real movement across grades" : "Trends over time"}
        </h3>
      </header>

      {patterns.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Trends will appear once at least two comparable weeks of pulse data exist for a grade.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {patterns.map((p) => {
            const Icon = p.direction === "increasing" ? TrendingUp : TrendingDown;
            return (
              <li
                key={`${p.grade}-${p.concernCompetency}`}
                className="rounded-xl border border-border bg-background p-3.5"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full bg-[hsl(38_92%_48%/0.12)] text-[hsl(38_92%_40%)]">
                    <Icon className="h-3 w-3" />
                    {p.direction === "increasing" ? "Rising" : "Falling"}
                  </span>
                  <span className="font-heading font-bold text-[13px]">
                    {p.grade} · {p.concernCompetency}
                  </span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-snug mt-1.5">{p.sentence}</p>
              </li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
}
