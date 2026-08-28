"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Ear, Info, Timer, Volume2 } from "lucide-react";
import type { AttentionInsight } from "@/lib/classFocus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const PURPLE = "hsl(258 70% 60%)";
const AMBER = "hsl(28 88% 54%)";
const GREEN = "hsl(142 55% 45%)";

/** Component 2: translates the underlying attention data into plain-language
 * classroom patterns, each paired with a small illustrative visual specific
 * to what it's describing (a decline chart, a waveform, a headcount) rather
 * than a generic icon — makes the pattern legible at a glance instead of
 * needing the detail text to carry all the meaning. */
export function AttentionPatternInsights({ insights }: { insights: AttentionInsight[] }) {
  const reduce = useReducedMotion();
  // Only the first 3 — the ones with a bespoke visual — are featured here;
  // the rest of attentionPatternInsights()'s output belongs to whichever
  // future component ends up covering deeper per-domain analysis.
  const featured = insights.slice(0, 3);

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Attention pattern insights"
        className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
      >
        <header className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 inline-flex items-center justify-center shrink-0">
            <Ear className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-extrabold text-[17px]">2. Attention Pattern Insights</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="More info"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                  Translates the class&apos;s attention data into plain-language patterns.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Key patterns observed in your class
            </p>
          </div>
        </header>

        <ul className="space-y-3">
          {featured.map((insight, i) => (
            <InsightRow key={insight.id} insight={insight} index={i} reduce={!!reduce} />
          ))}
        </ul>

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          These patterns are based on class data from games, assessments and observations over the
          past 7 days.
        </p>
      </section>
    </TooltipProvider>
  );
}

function InsightRow({
  insight,
  index,
  reduce,
}: {
  insight: AttentionInsight;
  index: number;
  reduce: boolean;
}) {
  const { tone, bg, Icon } = ROW_STYLE[insight.iconKey] ?? ROW_STYLE.default;

  return (
    <motion.li
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.32, ease: EASE }}
      className="rounded-xl border border-border/60 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4"
      style={{ background: bg }}
    >
      <span
        className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-heading font-extrabold text-[14.5px] leading-snug">{insight.title}</p>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug max-w-md">
          {insight.detail}
        </p>
        <Link
          href={`/students?ids=${insight.studentIds.join(",")}`}
          className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
          style={{ color: tone }}
        >
          View students
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="w-full md:w-auto shrink-0">
        {insight.iconKey === "clock" && <FocusDropChart tone={tone} reduce={reduce} />}
        {insight.iconKey === "ear" && <AuditoryWaveform tone={tone} />}
        {insight.iconKey === "timer" && (
          <DelayedStartVisual title={insight.title} tone={tone} reduce={reduce} />
        )}
      </div>
    </motion.li>
  );
}

const ROW_STYLE: Record<string, { tone: string; bg: string; Icon: typeof Clock }> = {
  clock: {
    tone: PURPLE,
    bg: `color-mix(in srgb, ${PURPLE} 6%, transparent)`,
    Icon: Clock,
  },
  ear: {
    tone: AMBER,
    bg: `color-mix(in srgb, ${AMBER} 7%, transparent)`,
    Icon: Ear,
  },
  timer: {
    tone: GREEN,
    bg: `color-mix(in srgb, ${GREEN} 7%, transparent)`,
    Icon: Timer,
  },
  default: {
    tone: "hsl(212 55% 50%)",
    bg: "transparent",
    Icon: Info,
  },
};

/** Mini declining line chart with a callout marking where focus drops off. */
function FocusDropChart({ tone, reduce }: { tone: string; reduce: boolean }) {
  const W = 220;
  const H = 70;
  const points = [
    [0, 10],
    [55, 16],
    [90, 20],
    [110, 40],
    [150, 52],
    [220, 62],
  ];
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const dropX = 90;

  return (
    <div className="rounded-lg bg-background/60 border border-border/50 px-3 pt-2.5 pb-1.5 w-full md:w-[240px]">
      <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-[0.06em]">
        <span>Focus level</span>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1">
        <line
          x1={dropX}
          x2={dropX}
          y1={0}
          y2={H}
          stroke={tone}
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.5"
        />
        <motion.path
          d={path}
          fill="none"
          stroke={tone}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7 }}
        />
      </svg>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] font-semibold text-muted-foreground">0</span>
        <span className="text-[9px] font-semibold" style={{ color: tone }}>
          Sharp drop after 15 mins
        </span>
        <span className="text-[9px] font-semibold text-muted-foreground">60m</span>
      </div>
    </div>
  );
}

/** Decorative waveform standing in for "auditory sensitivity" — no real
 * audio in this demo, so the speaker icon is illustrative only. */
function AuditoryWaveform({ tone }: { tone: string }) {
  const bars = [4, 8, 14, 20, 12, 18, 24, 14, 9, 16, 22, 11, 6, 13, 8];
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/60 border border-border/50 px-3 py-3 w-full md:w-[220px]">
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        <Volume2 className="h-3.5 w-3.5" />
      </span>
      <div className="flex items-center gap-[3px] flex-1 h-8">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full shrink-0"
            style={{ height: `${h * 3}px`, background: tone, opacity: 0.55 + (i % 3) * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Row of student silhouettes, the affected fraction tinted in. */
function DelayedStartVisual({
  title,
  tone,
  reduce,
}: {
  title: string;
  tone: string;
  reduce: boolean;
}) {
  const match = title.match(/(\d+)%/);
  const pct = match ? Number(match[1]) : 0;
  const TOTAL_ICONS = 9;
  const filled = Math.round((pct / 100) * TOTAL_ICONS);

  return (
    <div className="flex items-center gap-4 rounded-lg bg-background/60 border border-border/50 px-3 py-3 w-full md:w-[220px]">
      <div className="flex items-center gap-1 flex-wrap flex-1">
        {Array.from({ length: TOTAL_ICONS }).map((_, i) => (
          <motion.svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            initial={reduce ? undefined : { opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * i, duration: 0.25 }}
          >
            <circle cx="12" cy="7" r="4" fill={i < filled ? tone : "currentColor"} opacity={i < filled ? 1 : 0.2} />
            <path
              d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
              fill="none"
              stroke={i < filled ? tone : "currentColor"}
              strokeOpacity={i < filled ? 1 : 0.2}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </motion.svg>
        ))}
      </div>
      <div className="text-center shrink-0">
        <div className="font-heading font-black text-[22px] leading-none" style={{ color: tone }}>
          {pct}%
        </div>
        <div className="text-[9.5px] font-semibold text-muted-foreground mt-0.5">of the class</div>
      </div>
    </div>
  );
}
