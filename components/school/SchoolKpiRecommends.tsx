"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertOctagon,
  ArrowUpRight,
  Eye,
  Lightbulb,
  PartyPopper,
  Sparkle,
  Sparkles,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import type { SchoolKpi, SchoolKpiRosterRow, SubMetric } from "@/lib/schoolKpis";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Recommend = {
  id: string;
  kind: "Celebrate" | "Investigate" | "Act now" | "Try this" | "Watch";
  Icon: LucideIcon;
  tone: string;
  title: string;
  meta: string;
};

type Props = {
  kpi: SchoolKpi;
  roster: SchoolKpiRosterRow[];
};

/**
 * AI-styled recommends strip for the school KPI detail page.
 * Derives five concrete moves from the KPI + roster so a school leader
 * doesn't have to read every metric to know what to do next:
 *   1. Celebrate — top performing class
 *   2. Investigate — the sub-metric dragging the score down the most
 *   3. Act now — the class most urgently needing support
 *   4. Try this — a tactical move borrowed from the top performer
 *   5. Watch — the next sub-metric to keep an eye on
 */
export function SchoolKpiRecommends({ kpi, roster }: Props) {
  const reduce = useReducedMotion();
  const recommends = useMemo(() => buildRecommends(kpi, roster), [kpi, roster]);

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

              <ArrowUpRight
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5 mt-1 shrink-0 text-muted-foreground/70",
                  "opacity-0 -translate-x-1 transition-all duration-200",
                  "group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100",
                )}
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Derivations
 * ───────────────────────────────────────────────────────────── */

const CELEBRATE_TONE = "hsl(142 55% 45%)";
const INVESTIGATE_TONE = "hsl(38 92% 55%)";
const ACT_TONE = "hsl(0 78% 58%)";
const TRY_TONE = "hsl(260 55% 60%)";
const WATCH_TONE = "hsl(200 60% 50%)";

function buildRecommends(kpi: SchoolKpi, roster: SchoolKpiRosterRow[]): Recommend[] {
  const top = roster[0];
  const bottom = roster[roster.length - 1];

  const worstSm = pickWorstSubMetric(kpi.subMetrics);
  const secondWorst = pickSecondWorstSubMetric(kpi.subMetrics);
  const worstSubject =
    worstSm?.breakdown?.subject.worst.name ??
    kpi.subMetrics[0]?.breakdown?.subject.worst.name ??
    "Science";

  // Score format: RIT sub-metrics are "/100"; others vary but for the
  // recommends meta line we always show the raw number.
  const fmtScore = (n: number) => `${n}`;

  const coachCue = COACH_CUES[worstSm?.label ?? ""] ?? "Pair a coach with the section this week";

  return [
    {
      id: "celebrate",
      kind: "Celebrate",
      Icon: PartyPopper,
      tone: CELEBRATE_TONE,
      title: `${top.className} leads on ${kpi.title.toLowerCase()}`,
      meta: subMetricSummary(kpi.subMetrics, top.subMetricValues),
    },
    {
      id: "investigate",
      kind: "Investigate",
      Icon: Telescope,
      tone: INVESTIGATE_TONE,
      title: `${worstSm?.label ?? "Friction"} is the biggest drag`,
      meta: `Lowest score (${fmtScore(worstSm?.value ?? 0)}) · highest in ${worstSubject} classes`,
    },
    {
      id: "act",
      kind: "Act now",
      Icon: AlertOctagon,
      tone: ACT_TONE,
      title: `${bottom.className} needs urgent support`,
      meta: `Trending ${bottom.trend === "declining" ? "down" : bottom.trend} · ${subMetricSummary(kpi.subMetrics, bottom.subMetricValues)}`,
    },
    {
      id: "try",
      kind: "Try this",
      Icon: Lightbulb,
      tone: TRY_TONE,
      title: coachCue,
      meta: `Borrow what's working in ${top.className} for ${bottom.className}`,
    },
    {
      id: "watch",
      kind: "Watch",
      Icon: Eye,
      tone: WATCH_TONE,
      title: `${secondWorst?.label ?? "Next concern"} is the next drag`,
      meta: `Score ${fmtScore(secondWorst?.value ?? 0)} · rising in ${secondWorst?.breakdown?.subject.worst.name ?? worstSubject} sections`,
    },
  ];
}

/**
 * Tactical coaching cues mapped to the worst sub-metric. Keeps the
 * recommendation specific instead of "do better" hand-waving.
 */
const COACH_CUES: Record<string, string> = {
  "Instructional Friction Index": "Run a 60-sec settle-in routine each lesson",
  "Transition Efficiency": "Cue activity changes with a visible timer",
  "Disruption Reduction Index": "Reset behavior norms in week one",
  "Instructional Delivery Time": "Protect a 10-min uninterrupted teach block",
  "Teacher Cognitive Load": "Co-plan one lesson with a lead teacher",
  "Classroom Stability": "Lock seating + opening routine for two weeks",
  "Learning Skill Score": "Add twice-weekly focus drills before core blocks",
  "Learning Readiness Score": "Add twice-weekly focus drills before core blocks",
  Focus: "Start each class with a 3-min focus warm-up",
  "Task Engagement": "Open with a single clear task-start cue",
};

/** Returns the sub-metric most dragging the KPI down, accounting for direction. */
function pickWorstSubMetric(subMetrics: SubMetric[]): SubMetric | null {
  if (subMetrics.length === 0) return null;
  return subMetrics.reduce((worst, sm) => {
    const normSm = sm.negativeIsGood ? 100 - sm.value : sm.value;
    const normWorst = worst.negativeIsGood ? 100 - worst.value : worst.value;
    return normSm < normWorst ? sm : worst;
  }, subMetrics[0]);
}

/** Returns the second-worst sub-metric. */
function pickSecondWorstSubMetric(subMetrics: SubMetric[]): SubMetric | null {
  if (subMetrics.length < 2) return null;
  const sorted = [...subMetrics].sort((a, b) => {
    const normA = a.negativeIsGood ? 100 - a.value : a.value;
    const normB = b.negativeIsGood ? 100 - b.value : b.value;
    return normA - normB;
  });
  return sorted[1];
}

/** Compact line like "Friction 33 · Transitions 94 · Disruption 88". */
function subMetricSummary(subMetrics: SubMetric[], values: number[]): string {
  return subMetrics.map((sm, i) => `${shortLabel(sm.label)} ${values[i] ?? "—"}`).join(" · ");
}

function shortLabel(label: string): string {
  switch (label) {
    case "Instructional Friction Index":
      return "Friction";
    case "Transition Efficiency":
      return "Transitions";
    case "Disruption Reduction Index":
      return "Disruption";
    case "Instructional Delivery Time":
      return "Delivery";
    case "Teacher Cognitive Load":
      return "Cog. Load";
    case "Classroom Stability":
      return "Stability";
    case "Learning Skill Score":
    case "Learning Readiness Score":
      return "Readiness";
    case "Focus":
      return "Focus";
    case "Task Engagement":
      return "Engagement";
    default:
      return label;
  }
}
