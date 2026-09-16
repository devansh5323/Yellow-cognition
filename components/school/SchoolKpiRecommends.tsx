"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  Lightbulb,
  PartyPopper,
  Sparkle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import type { SchoolKpi, SubMetric } from "@/lib/schoolKpis";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Recommend = {
  id: string;
  kind: "Celebrate" | "Try this" | "Watch";
  Icon: LucideIcon;
  tone: string;
  title: string;
  meta: string;
};

type Props = {
  kpi: SchoolKpi;
};

/**
 * AI-styled recommends strip for the school KPI detail page.
 *
 * There's only one real class and one real teacher, so there's nothing left
 * to compare "best vs. worst" across — every recommendation here is derived
 * directly from this class's own sub-metric values, never a fabricated
 * ranking against invented peers.
 */
export function SchoolKpiRecommends({ kpi }: Props) {
  const reduce = useReducedMotion();
  const recommends = useMemo(() => buildRecommends(kpi), [kpi]);

  if (!kpi.hasData) {
    return (
      <section
        aria-label="Yellow Recommends"
        className="premium-elevated h-full rounded-[20px] p-5 md:p-6 flex flex-col items-center justify-center text-center gap-2"
      >
        <NotEnoughData label="Not enough data yet for recommendations" />
      </section>
    );
  }

  return (
    <section
      aria-label="Yellow Recommends"
      className="premium-elevated h-full rounded-[20px] p-5 md:p-6 relative overflow-hidden flex flex-col"
    >
      {/* Atmospheric amber + lavender backdrop — reads as AI */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 100% 0%, hsl(38 92% 80% / 0.22), transparent 65%), radial-gradient(55% 45% at 0% 100%, hsl(258 70% 80% / 0.16), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              aria-hidden
              className="relative h-8 w-8 rounded-xl inline-flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 22%, transparent), color-mix(in srgb, hsl(258 70% 70%) 18%, transparent))",
                boxShadow:
                  "inset 0 1px 0 0 hsl(0 0% 100% / 0.5), 0 6px 16px -10px hsl(38 92% 50% / 0.45)",
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-[16px] leading-tight">
                Yellow Recommends
              </h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Where to focus this week</p>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] shrink-0 mt-0.5"
            style={{
              color: "hsl(38 92% 38%)",
              background: "color-mix(in srgb, hsl(38 92% 60%) 14%, transparent)",
              border: "1px solid color-mix(in srgb, hsl(38 92% 55%) 28%, transparent)",
            }}
          >
            <Sparkle className="h-2.5 w-2.5" strokeWidth={2.4} />
            AI
          </span>
        </header>

        {/* Recommendation rows */}
        {recommends.length > 0 ? (
          <ul className="mt-6 -mx-2 flex flex-col gap-1.5 flex-1">
            {recommends.map((r, i) => (
              <motion.li
                key={r.id}
                initial={reduce ? undefined : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05 * i + 0.1,
                  duration: 0.32,
                  ease: EASE,
                }}
                className="group rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/35 flex items-start gap-2.5"
              >
                <span
                  aria-hidden
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: `color-mix(in srgb, ${r.tone} 14%, transparent)`,
                    color: r.tone,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${r.tone} 22%, transparent)`,
                  }}
                >
                  <r.Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.10em]"
                      style={{
                        color: r.tone,
                        background: `color-mix(in srgb, ${r.tone} 10%, transparent)`,
                      }}
                    >
                      {r.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] font-semibold leading-snug text-foreground/90">
                    {r.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{r.meta}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-[12px] text-muted-foreground leading-snug flex-1">
            Not enough sub-metric data yet to make a recommendation.
          </p>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Derivations — purely from this KPI's own real sub-metrics, no
 * per-class/subject/teacher comparison.
 * ───────────────────────────────────────────────────────────── */

const CELEBRATE_TONE = "hsl(142 55% 45%)";
const TRY_TONE = "hsl(260 55% 60%)";
const WATCH_TONE = "hsl(200 60% 50%)";

/** Sub-metrics scoring at or above this are called out as strong. */
const STRONG_THRESHOLD = 75;
/** Sub-metrics scoring below this need a closer look. */
const WATCH_THRESHOLD = 60;

/**
 * Tactical coaching cues mapped to a sub-metric that needs support. Generic,
 * real pedagogical suggestions — not tied to any invented per-class number.
 */
const COACH_CUES: Record<string, string> = {
  "Learning Readiness Areas": "Add twice-weekly focus drills before core blocks",
  "Task Engagement": "Open with a single clear task-start cue",
};

function buildRecommends(kpi: SchoolKpi): Recommend[] {
  const withValue = kpi.subMetrics.filter(
    (sm): sm is SubMetric & { value: number } => sm.value != null,
  );
  if (withValue.length === 0) return [];

  const recs: Recommend[] = [];

  for (const sm of withValue) {
    if (sm.value >= STRONG_THRESHOLD) {
      recs.push({
        id: `celebrate-${sm.id}`,
        kind: "Celebrate",
        Icon: PartyPopper,
        tone: CELEBRATE_TONE,
        title: `${sm.label} is strong`,
        meta: `${formatValue(sm)} · ${sm.description}`,
      });
    } else if (sm.value < WATCH_THRESHOLD) {
      recs.push({
        id: `watch-${sm.id}`,
        kind: "Watch",
        Icon: Eye,
        tone: WATCH_TONE,
        title: `${sm.label} needs a closer look`,
        meta: `${formatValue(sm)} · ${sm.description}`,
      });
      const cue = COACH_CUES[sm.label];
      if (cue) {
        recs.push({
          id: `try-${sm.id}`,
          kind: "Try this",
          Icon: Lightbulb,
          tone: TRY_TONE,
          title: cue,
          meta: `To help lift ${sm.label.toLowerCase()}`,
        });
      }
    }
  }

  return recs;
}

function formatValue(sm: SubMetric & { value: number }): string {
  const value = Number.isInteger(sm.value) ? sm.value : sm.value.toFixed(1);
  return sm.unit ? `${value} ${sm.unit}` : `${value}`;
}
