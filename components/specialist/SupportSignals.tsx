"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, AlertTriangle, Target, TrendingUp } from "lucide-react";
import type { ConcernBreakdownEntry } from "@/lib/specialEdCaseload";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function MiniBar({ label, pct, tone }: { label: string; pct: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9.5px] text-muted-foreground w-[92px] truncate shrink-0">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted/50 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
      <span className="text-[9.5px] font-bold tabular-nums w-7 text-right shrink-0">{pct}%</span>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  tone,
  label,
  children,
}: {
  icon: typeof Target;
  tone: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-xl border border-border/80 bg-background p-3.5 flex flex-col gap-2 min-h-[118px]">
      <div className="flex items-center gap-2">
        <span
          className="h-6 w-6 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <span className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground leading-tight">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function SupportSignals({
  concernRows,
  studentsImproving,
  tier3Count,
  tier2Count,
  overallTrend,
}: {
  concernRows: ConcernBreakdownEntry[];
  studentsImproving: number;
  tier3Count: number;
  tier2Count: number;
  /** Static placeholder (e.g. "+6%") until week-over-week history is
   * actually persisted — see specialEdPlaceholderData.ts. */
  overallTrend?: string;
}) {
  const reduce = useReducedMotion();
  const top = concernRows[0];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Support Signals & Patterns"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Support Signals &amp; Patterns</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          What Yellow is noticing across your caseload
        </h3>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        <SignalCard icon={Target} tone="hsl(258 55% 60%)" label="Top Support Reason">
          {top ? (
            <>
              <div>
                <div className="font-heading font-extrabold text-[18px] leading-none">{top.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {top.pct}% of caseload &middot; {top.count} student{top.count === 1 ? "" : "s"}
                </div>
              </div>
              {concernRows.length > 1 && (
                <div className="space-y-1.5 mt-auto pt-1">
                  {concernRows.slice(1, 3).map((row) => (
                    <MiniBar key={row.label} label={row.label} pct={row.pct} tone="hsl(258 55% 60%)" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-[11.5px] text-muted-foreground">No caseload data yet.</p>
          )}
        </SignalCard>

        <SignalCard icon={TrendingUp} tone="hsl(142 55% 42%)" label="Students Improving">
          <div className="font-heading font-extrabold text-[26px] leading-none">{studentsImproving}</div>
          <p className="text-[10.5px] text-muted-foreground leading-snug mt-auto">
            Full roster &middot; current snapshot, not a trend.
          </p>
        </SignalCard>

        <SignalCard icon={AlertTriangle} tone="hsl(0 78% 56%)" label="Needing Escalation">
          <div className="font-heading font-extrabold text-[26px] leading-none">{tier3Count}</div>
          <div className="space-y-1.5 mt-auto pt-1">
            <MiniBar label="Tier 3" pct={tier3Count + tier2Count > 0 ? Math.round((tier3Count / (tier3Count + tier2Count)) * 100) : 0} tone="hsl(0 78% 56%)" />
            <MiniBar label="Tier 2" pct={tier3Count + tier2Count > 0 ? Math.round((tier2Count / (tier3Count + tier2Count)) * 100) : 0} tone="hsl(38 92% 48%)" />
          </div>
        </SignalCard>

        <SignalCard icon={Activity} tone="hsl(212 55% 50%)" label="Overall Support Trend">
          {overallTrend ? (
            <>
              <div className="font-heading font-extrabold text-[26px] leading-none" style={{ color: "hsl(142 55% 42%)" }}>
                {overallTrend}
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug mt-auto">This month, across caseload.</p>
            </>
          ) : (
            <>
              <div className="font-heading font-extrabold text-[18px] leading-none text-muted-foreground">—</div>
              <p className="text-[10.5px] text-muted-foreground leading-snug mt-auto">Not enough history yet.</p>
            </>
          )}
        </SignalCard>
      </div>
    </motion.section>
  );
}
