"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { BAND_LABEL, BAND_ORDER, BAND_TONE, type OutcomeSummary } from "@/lib/learningOutcomes";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Component 2: "Outcome Band Distribution" — a full donut ring across the
 * 5 bands, a legend with real counts/percentages (real arithmetic over the
 * demo band placements — see lib/learningOutcomes.ts), and a callout for
 * the % meeting expected outcomes. */
export function OutcomeBandDistribution({ summary }: { summary: OutcomeSummary }) {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Outcome band distribution" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="font-heading font-extrabold text-[15px]">Outcome Band Distribution</h2>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Donut summary={summary} reduce={!!reduce} />

        <ul className="space-y-2">
          {BAND_ORDER.map((band) => {
            const count = summary.distribution[band];
            const pct = Math.round((count / Math.max(1, summary.total)) * 100);
            return (
              <li key={band} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: BAND_TONE[band] }} aria-hidden />
                <span className="text-[12.5px] font-semibold text-foreground/85 flex-1">{BAND_LABEL[band]}</span>
                <span className="text-[12px] font-bold tabular-nums" style={{ color: BAND_TONE[band] }}>
                  {count}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">{pct}%</span>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl bg-[hsl(142_55%_45%)]/10 p-4 text-center min-w-[140px]">
          <span className="h-9 w-9 rounded-full bg-[hsl(142_55%_45%)]/15 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] inline-flex items-center justify-center mx-auto">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div className="mt-2 font-heading font-black text-[26px] leading-none text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)]">
            {summary.meetingPct}%
          </div>
          <p className="mt-1.5 text-[11px] text-foreground/75 leading-snug">of students are Secure or Advanced.</p>
        </div>
      </div>
    </section>
  );
}

function Donut({ summary, reduce }: { summary: OutcomeSummary; reduce: boolean }) {
  const SIZE = 150;
  const STROKE = 16;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  const arcs = BAND_ORDER.reduce<{ band: (typeof BAND_ORDER)[number]; dash: number; offset: number }[]>((acc, band) => {
    const pct = summary.distribution[band] / Math.max(1, summary.total);
    const dash = pct * C;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ band, dash, offset });
    return acc;
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} role="img" aria-label={`${summary.total} students`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="hsl(240 15% 92%)" strokeWidth={STROKE} fill="none" className="dark:stroke-[hsl(230_20%_25%)]" />
        {arcs.map(({ band, dash, offset }) => (
          <motion.circle
            key={band}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={BAND_TONE[band]}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${dash} ${C - dash}`}
            initial={reduce ? undefined : { strokeDashoffset: -offset, opacity: 0 }}
            animate={{ strokeDashoffset: -offset, opacity: dash > 0 ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-black text-[26px] leading-none tabular-nums">{summary.total}</span>
        <span className="text-[10.5px] text-muted-foreground font-bold mt-0.5">Students</span>
      </div>
    </div>
  );
}
