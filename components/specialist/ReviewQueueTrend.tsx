"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewQueueTrendFor, type ReviewQueueTrendPeriod } from "@/lib/specialEdPlaceholderData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const PERIOD_TABS: { key: ReviewQueueTrendPeriod; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "term", label: "This Term" },
];

function comingSoon() {
  toast("Coming soon", { description: "Custom date-range trends aren't available yet." });
}

export function ReviewQueueTrend() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<ReviewQueueTrendPeriod>("month");
  const data = reviewQueueTrendFor(period);

  const stats: { label: string; value: number | string }[] = [
    { label: "New referrals over time", value: data.newReferrals },
    { label: "Students reviewed", value: data.studentsReviewed },
    { label: "Students escalated", value: data.studentsEscalated },
    { label: "Moved to monitoring", value: data.studentsMovedToMonitoring },
    { label: "Cases closed", value: data.casesClosed },
    { label: "Avg. days awaiting review", value: data.avgDaysAwaitingReview },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Review Queue Trend"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="premium-eyebrow">
            <span>Review Queue Trend</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Is the support-review workload increasing, stabilising, or resolving?
          </h3>
        </div>

        <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1 shrink-0">
          {PERIOD_TABS.map((t) => {
            const active = period === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setPeriod(t.key)}
                className={cn(
                  "h-7 rounded-full px-2.5 text-[10.5px] font-bold transition-colors whitespace-nowrap",
                  active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={comingSoon}
            className="h-7 rounded-full px-2.5 text-[10.5px] font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors whitespace-nowrap"
          >
            Custom
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/80 bg-background p-3">
            <div className="font-heading font-extrabold text-[20px] leading-none tabular-nums">{s.value}</div>
            <div className="text-[9.5px] font-semibold text-muted-foreground leading-snug mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
        <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-foreground/85 leading-snug">{data.insight}</p>
      </div>
    </motion.section>
  );
}
