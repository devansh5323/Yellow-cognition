"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Info,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  classHealth,
  pillarStatus,
  scoreBand,
  SCORE_BANDS,
  type PillarKey,
  type ScoreBand,
} from "@/lib/classHealth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";

const PILLAR_DISPLAY: Record<PillarKey, string> = {
  focus: "Focus",
  behavior: "Behaviour and Discipline",
  task: "Task completion",
  academic: "Learning Readiness",
};

const SCORE_BAND_TONE: Record<ScoreBand, string> = {
  excellent: GREEN,
  stable: BLUE,
  watch: AMBER,
  "needs-support": RED,
};

// Fixed demo distribution — mirrors the reference design's student breakdown.
const DISTRIBUTION = [
  { key: "improving", label: "Strong Regulation", tone: GREEN, count: 7 },
  { key: "on-track", label: "Stable Behaviour", tone: BLUE, count: 15 },
  { key: "watch", label: "Watch", tone: AMBER, count: 5 },
  { key: "needs-support", label: "Needs Support", tone: RED, count: 3 },
] as const;

export function ClassroomHealthScore() {
  const reduce = useReducedMotion();
  const ch = useMemo(() => classHealth(), []);
  const [distributionOpen, setDistributionOpen] = useState(false);

  const band = scoreBand(ch.score);
  const bandInfo = SCORE_BANDS.find((b) => b.band === band)!;
  const tone = SCORE_BAND_TONE[band];
  const overallGood = band === "excellent" || band === "stable";

  const ranked = (Object.entries(ch.pillars) as [PillarKey, number][]).sort((a, b) => b[1] - a[1]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const strongDelta = ch.pillarDelta[strongest[0]];
  const weakDelta = ch.pillarDelta[weakest[0]];

  const areasNeedingSupport = (Object.entries(ch.pillars) as [PillarKey, number][]).filter(
    ([key, score]) => pillarStatus(score, ch.pillarDelta[key]) === "needs-attention",
  ).length;

  const distribution = DISTRIBUTION;
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  const healthy = distribution[0].count + distribution[1].count;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Classroom Health Score"
      data-tour-target="classroom-health"
    >
      <div className="premium-eyebrow">
        <span>Classroom Health</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_auto_1fr_auto_1fr] gap-5 lg:gap-6">
        {/* Score column */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-heading font-extrabold text-[56px] leading-none tabular-nums"
                style={{ color: tone }}
              >
                {ch.score}
              </span>
              <span className="text-muted-foreground text-[19px] font-bold">/100</span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.10em] px-2.5 py-1.5 rounded-full"
              style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
            >
              {overallGood ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              {bandInfo.tag}
            </span>
          </div>

          <div
            className="inline-flex items-center gap-1 text-[12px] font-bold tabular-nums"
            style={{ color: ch.delta >= 0 ? GREEN : RED }}
          >
            {ch.delta >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {ch.delta >= 0 ? "+" : ""}
            {ch.delta} this week
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>

          <div className="w-fit max-w-full flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/50 px-3 py-2">
            <span
              className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
            >
              <Users className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] leading-snug whitespace-nowrap">
              <span className="font-heading font-extrabold" style={{ color: GREEN }}>
                {healthy} of {total} students
              </span>{" "}
              <span className="text-muted-foreground">
                are showing Stable or Strong classroom health.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-muted/70 text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
            </span>
            <p className="text-[12.5px] text-muted-foreground leading-snug whitespace-nowrap">
              {areasNeedingSupport > 0
                ? `Most students are meeting expectations, with ${
                    areasNeedingSupport === 1 ? "one area" : `${areasNeedingSupport} areas`
                  } requiring additional support.`
                : "Most students are meeting expectations across every area."}
            </p>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-border/60" aria-hidden />

        {/* Strongest area */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
            >
              <Users className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
              style={{ color: GREEN }}
            >
              Strongest area
            </span>
          </div>
          <h3
            className="font-heading font-extrabold text-[16px] leading-tight"
            style={{ color: GREEN }}
          >
            {PILLAR_DISPLAY[strongest[0]]}
          </h3>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Strongest contributor to classroom health.
          </p>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
            {strongDelta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
            ) : (
              <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
            )}
            {strongDelta >= 0 ? "+" : ""}
            {strongDelta} vs last week
          </span>
        </div>

        <div className="hidden lg:block w-px bg-border/60" aria-hidden />

        {/* Needs attention */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${AMBER} 14%, transparent)`, color: AMBER }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
              style={{ color: AMBER }}
            >
              Needs attention
            </span>
          </div>
          <h3
            className="font-heading font-extrabold text-[16px] leading-tight"
            style={{ color: AMBER }}
          >
            {PILLAR_DISPLAY[weakest[0]]}
          </h3>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Lowest contributor to classroom health.
          </p>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
            {weakDelta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
            ) : (
              <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
            )}
            {weakDelta >= 0 ? "+" : ""}
            {weakDelta} vs last week
          </span>
        </div>
      </div>

      {/* Student distribution */}
      <div className="mt-5 pt-5 border-t border-border/60">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 pl-3 pr-2 py-2.5">
          <button
            type="button"
            onClick={() => setDistributionOpen((v) => !v)}
            aria-expanded={distributionOpen}
            className="flex-1 flex items-center gap-2 text-left rounded-lg transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                distributionOpen && "rotate-90",
              )}
            />
            <span className="text-[12.5px] font-bold uppercase tracking-[0.10em] text-foreground/90">
              Student distribution
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground normal-case tracking-normal">
              · {total} students
            </span>
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground rounded-full p-1 transition-colors hover:text-foreground hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="How score bands are defined"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[380px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
            >
              <h4 className="font-heading font-extrabold text-[15px]">Score Bands</h4>
              <div className="mt-3 space-y-3.5">
                {SCORE_BANDS.map((b) => (
                  <div key={b.band} className="flex items-start gap-3">
                    <span className="w-12 shrink-0 text-[12px] font-bold tabular-nums text-foreground/90">
                      {b.range}
                    </span>
                    <span
                      className="w-[92px] shrink-0 inline-flex items-center justify-center text-[9.5px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full h-fit"
                      style={{
                        background: `color-mix(in srgb, ${SCORE_BAND_TONE[b.band]} 14%, transparent)`,
                        color: SCORE_BAND_TONE[b.band],
                      }}
                    >
                      {b.tag}
                    </span>
                    <span className="flex-1 text-[12px] text-muted-foreground leading-snug">
                      {b.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <AnimatePresence initial={false}>
          {distributionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted/50">
                {distribution.map((d) => {
                  if (d.count <= 0) return null;
                  return (
                    <span
                      key={d.key}
                      className="h-full"
                      style={{ flex: `${(d.count / Math.max(1, total)) * 100} 1 0`, background: d.tone }}
                      title={`${d.label}: ${d.count}`}
                    />
                  );
                })}
              </div>

              <div className="mt-3 flex w-full items-start text-[12.5px]">
                {distribution.map((d) => (
                  <div
                    key={d.key}
                    className="flex flex-col gap-1 min-w-0"
                    style={{ flex: `${(d.count / Math.max(1, total)) * 100} 1 0` }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: d.tone }}
                        aria-hidden
                      />
                      <span className="font-semibold text-foreground/90 whitespace-nowrap">
                        {d.label}
                      </span>
                    </span>
                    <span className="pl-4 text-muted-foreground tabular-nums whitespace-nowrap">
                      {d.count} student{(d.count as number) === 1 ? "" : "s"} (
                      {Math.round((d.count / Math.max(1, total)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                >
                  See how scores are calculated
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </motion.section>
  );
}
