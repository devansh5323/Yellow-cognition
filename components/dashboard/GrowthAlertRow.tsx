"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, AlertTriangle, Eye, Shield, ArrowRight, Calendar, ChevronDown } from "lucide-react";
import { visibleGrowth, priorityAlert, newWatchArea, maintainedStrength } from "@/lib/classHealth";
import { wavePoints, Sparkline, BarSparkline } from "@/components/dashboard/Sparkline";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const POSITIVE = "hsl(142 55% 45%)";
const NEGATIVE = "hsl(0 78% 58%)";
const WATCH = "hsl(38 92% 50%)";
const STRENGTH = "hsl(212 90% 58%)";

/** Splits off a trailing "N%" so it can be highlighted in tone while the rest
 * of the headline stays neutral — matches how only the growth-style metric
 * callouts get a two-tone treatment, not count-based headlines. */
function splitTrailingPercent(headline: string): { prefix: string; highlight: string | null } {
  const match = headline.match(/^(.*\D)(\d+%)$/);
  if (!match) return { prefix: headline, highlight: null };
  return { prefix: match[1], highlight: match[2] };
}

export function GrowthAlertRow() {
  const reduce = useReducedMotion();
  const growth = useMemo(() => visibleGrowth(), []);
  const alert = useMemo(() => priorityAlert(), []);
  const watch = useMemo(() => newWatchArea(), []);
  const strength = useMemo(() => maintainedStrength(), []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
      aria-label="What changed this week"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>What changed this week</span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug">
            A quick snapshot of what improved, what declined, and what needs your attention.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-[12.5px] font-semibold text-foreground/80 hover:bg-muted/40 transition-colors shrink-0"
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          This week
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Banner
          tone={POSITIVE}
          eyebrow="Visible growth"
          icon={<TrendingUp className="h-4 w-4" />}
          headline={growth?.headline ?? "No clear gains this week"}
          detail={
            growth?.detail ??
            "Keep at the routines you have in place — growth shows up over the next check-in."
          }
          action="See contributors"
          chart={<Sparkline data={wavePoints(80, 1)} tone={POSITIVE} area />}
        />
        <Banner
          tone={NEGATIVE}
          eyebrow="Priority alert"
          severity="HIGH"
          icon={<AlertTriangle className="h-4 w-4" />}
          headline={alert?.headline ?? "Nothing critical this week"}
          detail={alert?.detail ?? "You're in a good window to push on a stretch goal."}
          action="View affected students"
          chart={<BarSparkline data={wavePoints(70, 2)} tone={NEGATIVE} />}
        />
        <Banner
          tone={WATCH}
          eyebrow="New watch area"
          icon={<Eye className="h-4 w-4" />}
          headline={watch?.headline ?? "No new watch areas this week"}
          detail={watch?.detail ?? "Nothing newly concerning beyond your priority alert."}
          action="View transition strategies"
          chart={<Sparkline data={wavePoints(55, 3)} tone={WATCH} area />}
        />
        <Banner
          tone={STRENGTH}
          eyebrow="Maintained strength"
          icon={<Shield className="h-4 w-4" />}
          headline={strength?.headline ?? "Class held steady this week"}
          detail={strength?.detail ?? "No single area stood out, but nothing slipped either."}
          action="Log positive acknowledgments"
          chart={<Sparkline data={wavePoints(85, 4)} tone={STRENGTH} area />}
        />
      </div>
    </motion.section>
  );
}

function Banner({
  tone,
  eyebrow,
  severity,
  icon,
  headline,
  detail,
  action,
  chart,
}: {
  tone: string;
  eyebrow: string;
  severity?: string;
  icon: ReactNode;
  headline: string;
  detail: string;
  action: string;
  chart: ReactNode;
}) {
  const { prefix, highlight } = splitTrailingPercent(headline);

  return (
    <article
      className="relative rounded-2xl border overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
      style={{
        background: `color-mix(in srgb, ${tone} 6%, var(--card))`,
        borderColor: `color-mix(in srgb, ${tone} 24%, transparent)`,
      }}
    >
      <div className="p-5 flex-1">
        <span
          className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 16%, transparent)`,
            color: tone,
          }}
        >
          {icon}
        </span>

        <div className="flex items-center gap-2 flex-wrap mt-3.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: tone }}>
            {eyebrow}
          </span>
          {severity && (
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tone} 18%, transparent)`,
                color: tone,
              }}
            >
              · {severity}
            </span>
          )}
        </div>
        <h3 className="font-heading font-extrabold text-[16px] leading-snug mt-1.5">
          {highlight ? (
            <>
              <span className="text-foreground">{prefix}</span>
              <span style={{ color: tone }}>{highlight}</span>
            </>
          ) : (
            <span style={{ color: tone }}>{headline}</span>
          )}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1.5 leading-snug">{detail}</p>

        <div className="mt-4">{chart}</div>
      </div>

      <div
        className="px-5 py-3.5 border-t"
        style={{ borderColor: `color-mix(in srgb, ${tone} 16%, transparent)` }}
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
          style={{ color: tone }}
        >
          {action}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}
