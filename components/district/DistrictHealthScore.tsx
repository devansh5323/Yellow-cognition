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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { districtHealth, SCHOOL_STATUS_META, type SchoolStatus } from "@/lib/districtData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const RED = "hsl(0 78% 58%)";

const STATUS_ORDER: SchoolStatus[] = ["strong", "stable", "monitor", "support-recommended", "immediate-review"];

export function DistrictHealthScore() {
  const reduce = useReducedMotion();
  const health = useMemo(() => districtHealth(), []);
  const [distributionOpen, setDistributionOpen] = useState(false);

  const overallGood = health.status === "strong" || health.status === "stable";
  const totalSchools = health.distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Health Score"
    >
      <div className="premium-eyebrow">
        <span>District Health Score</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_auto_1fr_auto_1fr] gap-5 lg:gap-6">
          {/* Score column */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-extrabold text-[56px] leading-none tabular-nums"
                  style={{ color: health.tone }}
                >
                  {health.score}
                </span>
                <span className="text-muted-foreground text-[19px] font-bold">/100</span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.10em] px-2.5 py-1.5 rounded-full"
                style={{ background: `color-mix(in srgb, ${health.tone} 14%, transparent)`, color: health.tone }}
              >
                {overallGood ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {health.statusLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="inline-flex items-center gap-1 text-[12px] font-bold tabular-nums"
                style={{ color: health.delta >= 0 ? GREEN : RED }}
              >
                {health.delta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {health.delta >= 0 ? "+" : ""}
                {health.delta} this {health.period}
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-1 rounded-full border border-border/70 text-muted-foreground"
                title="Based on schools connected, principal activity and reporting coverage"
              >
                <Sparkles className="h-3 w-3" />
                {health.confidence.label} in data
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-muted/70 text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
              </span>
              <p className="text-[12.5px] text-muted-foreground leading-snug">{health.interpretation}</p>
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
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: GREEN }}>
                Strongest area
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-[16px] leading-tight" style={{ color: GREEN }}>
              {health.strongest.label}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Strongest district-wide contributor.
            </p>
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
              {health.strongest.delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
              ) : (
                <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
              )}
              {health.strongest.delta >= 0 ? "+" : ""}
              {health.strongest.delta} vs last {health.period}
            </span>
          </div>

          <div className="hidden lg:block w-px bg-border/60" aria-hidden />

          {/* Needs attention */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
                style={{
                  background: `color-mix(in srgb, ${SCHOOL_STATUS_META.monitor.tone} 14%, transparent)`,
                  color: SCHOOL_STATUS_META.monitor.tone,
                }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              <span
                className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: SCHOOL_STATUS_META.monitor.tone }}
              >
                Area requiring attention
              </span>
            </div>
            <h3
              className="font-heading font-extrabold text-[16px] leading-tight"
              style={{ color: SCHOOL_STATUS_META.monitor.tone }}
            >
              {health.weakest.label}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Lowest district-wide contributor.
            </p>
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
              {health.weakest.delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
              ) : (
                <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
              )}
              {health.weakest.delta >= 0 ? "+" : ""}
              {health.weakest.delta} vs last {health.period}
            </span>
          </div>
        </div>

        {/* School distribution */}
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
                School distribution
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground normal-case tracking-normal">
                · {totalSchools} schools
              </span>
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground rounded-full p-1 transition-colors hover:text-foreground hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="How district support bands are defined"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[380px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
              >
                <h4 className="font-heading font-extrabold text-[15px]">Support Bands</h4>
                <div className="mt-3 space-y-3.5">
                  {STATUS_ORDER.map((s) => {
                    const meta = SCHOOL_STATUS_META[s];
                    return (
                      <div key={s} className="flex items-start gap-3">
                        <span
                          className="w-[120px] shrink-0 inline-flex items-center justify-center text-[9.5px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full h-fit text-center"
                          style={{ background: `color-mix(in srgb, ${meta.tone} 14%, transparent)`, color: meta.tone }}
                        >
                          {meta.label}
                        </span>
                        <span className="flex-1 text-[12px] text-muted-foreground leading-snug">
                          {meta.meaning}
                        </span>
                      </div>
                    );
                  })}
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
                  {health.distribution.map((d) => {
                    if (d.count <= 0) return null;
                    return (
                      <span
                        key={d.status}
                        className="h-full"
                        style={{ flex: `${(d.count / Math.max(1, totalSchools)) * 100} 1 0`, background: d.tone }}
                        title={`${d.label}: ${d.count}`}
                      />
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap w-full items-start gap-x-3 gap-y-3 text-[12.5px]">
                  {health.distribution.map((d) => (
                    <div
                      key={d.status}
                      className="flex flex-col gap-1 min-w-[112px]"
                      style={{ flex: `${(d.count / Math.max(1, totalSchools)) * 100} 1 0` }}
                    >
                      <span className="inline-flex items-start gap-1.5 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0 mt-1" style={{ background: d.tone }} aria-hidden />
                        <span className="font-semibold text-foreground/90 leading-snug">{d.label}</span>
                      </span>
                      <span className="pl-4 text-muted-foreground tabular-nums whitespace-nowrap">
                        {d.count} school{d.count === 1 ? "" : "s"} (
                        {Math.round((d.count / Math.max(1, totalSchools)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                  >
                    See how district health is calculated
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
