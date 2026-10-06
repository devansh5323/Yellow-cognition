"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Info, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import {
  BEHAVIOR_STATUS_LABEL,
  BEHAVIOR_STATUS_RANGE,
  BEHAVIOR_STATUS_TONE,
  behaviorTrendOverTime,
  type BehaviorSnapshotData,
  type BehaviorStatus,
  type DisruptionStat,
} from "@/lib/classBehavior";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDecimal1 } from "@/lib/format";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DISTRIBUTION_ORDER: BehaviorStatus[] = ["strong", "stable", "reinforcement", "support"];
const DISTRIBUTION_LABEL: Record<BehaviorStatus, string> = {
  strong: "Strong Regulation",
  stable: "Stable Behaviour",
  reinforcement: "Watch",
  support: "Needs Support",
};

const STATUS_SUMMARY: Record<BehaviorStatus, string> = {
  strong: "The class is regulating itself well. Keep current routines.",
  stable: "Most students are staying on track, with a few drifting — light scaffolding will help.",
  reinforcement: "Regulation is uneven — reinforce expectations and keep an eye on repeat patterns.",
  support: "Disruptions are above where we'd like — start with the areas below and the priority actions.",
};

/** Component 1 of the Classroom Behaviour & Regulation page: a quick,
 * single-glance read of overall discipline health. Same structure/template
 * as FocusSnapshot.tsx's "Class Attention Overview" — score + status/delta,
 * status thresholds, an AI summary line, distribution rows, and a
 * weekly/monthly trend chart. Real, sourced from each student's
 * cognitivePerformance.behaviourAndDiscipline score
 * (data/realStudents.ts) and the latest weekly driver series — see
 * lib/classBehavior.ts's header for exactly what's real vs demo on this page. */
export function BehaviorSnapshot({ snapshot, breakdown }: { snapshot: BehaviorSnapshotData; breakdown: DisruptionStat[] }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const trendPoints = useMemo(
    () => behaviorTrendOverTime(period).map((p) => ({ label: p.label, score: p.overall })),
    [period],
  );
  const populatedTrend = trendPoints.filter((p): p is { label: string; score: number } => p.score != null);
  const last = populatedTrend[populatedTrend.length - 1];
  const prev = populatedTrend[populatedTrend.length - 2];
  const scoreDelta = last && prev ? Math.round((last.score - prev.score) * 10) / 10 : 0;

  const hasData = snapshot.controlScore != null && snapshot.status != null && snapshot.distribution != null;

  const insight = snapshot.strongestDriver
    ? `Stronger in ${snapshot.strongestDriver.label}.`
    : "Not enough area-level data yet to compare strengths and support needs.";

  const onTrackCount = hasData ? snapshot.distribution!.strong + snapshot.distribution!.stable : 0;
  const distributionSummary = hasData
    ? `${onTrackCount} student${onTrackCount === 1 ? "" : "s"} on track, ${snapshot.distribution!.reinforcement} need${snapshot.distribution!.reinforcement === 1 ? "s" : ""} reinforcement, and ${snapshot.distribution!.support} need${snapshot.distribution!.support === 1 ? "s" : ""} more support.`
    : "";

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Classroom behavior snapshot" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="font-heading font-extrabold text-[17px] inline-flex items-center gap-1.5">
            Classroom Behaviour Overview
            <InfoDot text="A composite read of how well the class is regulating itself this period." />
          </h2>
        </header>

        {!hasData ? (
          <NotEnoughDataPanel
            title="Not enough data yet"
            description="We don't have real behaviour signal for this roster yet — check back once it's available."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 lg:divide-x divide-border/60">
              {/* Left — score, thresholds, AI summary */}
              <div className="flex flex-col gap-4 min-w-0">
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Behaviour score
                  </div>
                  <div className="flex items-end gap-1 mt-1">
                    <span
                      className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                      style={{ color: BEHAVIOR_STATUS_TONE[snapshot.status!] }}
                    >
                      {formatDecimal1(snapshot.controlScore!)}
                    </span>
                    <span className="text-muted-foreground text-xl font-bold mb-1.5">/100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusPill label={BEHAVIOR_STATUS_LABEL[snapshot.status!]} tone={BEHAVIOR_STATUS_TONE[snapshot.status!]} />
                    <DeltaPill value={scoreDelta} suffix={` vs last ${period === "Weekly" ? "week" : "month"}`} />
                  </div>
                </div>

                <p className="text-[12.5px] leading-snug text-muted-foreground">{STATUS_SUMMARY[snapshot.status!]}</p>

                <div className="rounded-xl border border-border/60 p-3.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                    Status thresholds
                  </div>
                  <div className="space-y-2">
                    {DISTRIBUTION_ORDER.map((s) => (
                      <div key={s} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BEHAVIOR_STATUS_TONE[s] }} />
                          <span className="text-[12.5px] font-bold">{BEHAVIOR_STATUS_LABEL[s]}</span>
                        </span>
                        <span className="text-[12px] text-muted-foreground">{BEHAVIOR_STATUS_RANGE[s]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl border p-3.5 flex items-start gap-2.5"
                  style={{
                    background: "color-mix(in srgb, hsl(38 92% 50%) 8%, transparent)",
                    borderColor: "color-mix(in srgb, hsl(38 92% 50%) 25%, transparent)",
                  }}
                >
                  <span className="h-7 w-7 rounded-full bg-[hsl(38_92%_50%)]/15 text-[hsl(30_80%_42%)] dark:text-[hsl(38_92%_65%)] inline-flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[hsl(30_80%_42%)] dark:text-[hsl(38_92%_65%)]">
                      AI summary
                    </div>
                    <p className="text-[12.5px] leading-snug mt-0.5">{insight}</p>
                  </div>
                </div>
              </div>

              {/* Right — student distribution + trend */}
              <div className="flex flex-col gap-5 min-w-0 lg:pl-8">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[13px] font-extrabold">Student distribution</span>
                    <span className="text-[11.5px] text-muted-foreground">{snapshot.total} students</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex rounded-xl overflow-hidden h-2.5">
                      {DISTRIBUTION_ORDER.map((band) => {
                        const count = snapshot.distribution![band];
                        const pct = (count / Math.max(1, snapshot.total)) * 100;
                        if (pct <= 0) return null;
                        return <span key={band} style={{ width: `${pct}%`, background: BEHAVIOR_STATUS_TONE[band] }} />;
                      })}
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {DISTRIBUTION_ORDER.map((band, i) => {
                        const count = snapshot.distribution![band];
                        if (count <= 0) return null;
                        const pct = Math.round((count / Math.max(1, snapshot.total)) * 100);
                        const tone = BEHAVIOR_STATUS_TONE[band];
                        return (
                          <div key={band}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: tone }} aria-hidden />
                                <span className="text-[12px] font-semibold text-foreground/85">{DISTRIBUTION_LABEL[band]}</span>
                              </span>
                              <span className="text-[12px] font-bold tabular-nums" style={{ color: tone }}>
                                {count}
                                <span className="ml-1 text-[11px] font-semibold text-muted-foreground">{pct}%</span>
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mt-1">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: tone }}
                                initial={reduce ? undefined : { width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.05 * i, duration: 0.6, ease: EASE }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[12.5px] text-muted-foreground leading-snug">{distributionSummary}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[13px] font-extrabold">Trend</span>
                    <div className="inline-flex rounded-full border border-border/60 bg-background p-0.5">
                      {(["Weekly", "Monthly"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPeriod(p)}
                          className={cn(
                            "px-3 h-6 rounded-full text-[10.5px] font-bold transition-colors",
                            period === p ? "bg-[hsl(142_55%_42%)] text-white" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <TrendChart points={trendPoints} tone={BEHAVIOR_STATUS_TONE[snapshot.status!]} reduce={!!reduce} />
                </div>
              </div>
            </div>

            <div className="mt-5 mb-6 border-t border-border/60" />

            {/* Behaviour areas breakdown */}
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-extrabold text-[17px]">Behaviour Areas</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                  This week&apos;s class-level score for each behaviour area.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 mb-4">Breakdown of behaviour across key areas</p>

            <BehaviorAreaBars breakdown={breakdown} reduce={!!reduce} />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {snapshot.strongestDriver && (
                <div className="flex items-center gap-2 rounded-xl bg-[hsl(142_55%_45%)]/10 px-3.5 py-2.5">
                  <span className="h-8 w-8 rounded-full bg-[hsl(142_55%_45%)]/15 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] inline-flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Strongest Area</div>
                    <div className="text-[12.5px] font-bold text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] truncate">{snapshot.strongestDriver.label}</div>
                  </div>
                </div>
              )}
              {snapshot.weakestDriver && (
                <div className="flex items-center gap-2 rounded-xl bg-[hsl(0_78%_55%)]/10 px-3.5 py-2.5">
                  <span className="h-8 w-8 rounded-full bg-[hsl(0_78%_55%)]/15 text-[hsl(0_78%_45%)] dark:text-[hsl(0_78%_70%)] inline-flex items-center justify-center shrink-0">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Needs Most Support</div>
                    <div className="text-[12.5px] font-bold text-[hsl(0_78%_45%)] dark:text-[hsl(0_78%_70%)] truncate">{snapshot.weakestDriver.label}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </TooltipProvider>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-[11.5px] font-bold"
      style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

function DeltaPill({ value, suffix = "" }: { value: number; suffix?: string }) {
  const zero = value === 0;
  const positive = value > 0;
  const tone = zero ? "var(--muted-foreground)" : positive ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 h-6 text-[11.5px] font-bold"
      style={{ background: zero ? "color-mix(in srgb, var(--muted-foreground) 12%, transparent)" : `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
    >
      {!zero && (positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      {positive ? "+" : ""}
      {formatDecimal1(value)}
      {suffix}
    </span>
  );
}

/** Per-area vertical "fill level" bars: a dashed pill track per area, a
 * solid pill rising to the area's real score out of 100, and a badge at
 * the fill's edge carrying the number — same pill-chart pattern as
 * TaskEngagementOverview's Task Engagement Breakdown. */
function BehaviorAreaBars({ breakdown, reduce }: { breakdown: DisruptionStat[]; reduce: boolean }) {
  const sorted = useMemo(() => {
    return [...breakdown].sort((a, b) => {
      if (a.score == null && b.score == null) return 0;
      if (a.score == null) return 1;
      if (b.score == null) return -1;
      return a.score - b.score;
    });
  }, [breakdown]);

  return (
    <div className="flex items-start gap-8 overflow-x-auto pb-1 justify-between">
      {sorted.map((d, i) => {
        const tone = d.hasData && d.status ? BEHAVIOR_STATUS_TONE[d.status] : undefined;
        const pct = d.hasData ? Math.max(5, d.score as number) : 0;
        return (
          <div key={d.key} className="flex flex-col items-center shrink-0 w-[100px]">
            <div
              className="relative w-16 h-[140px] rounded-full border overflow-visible"
              style={{
                borderStyle: "dashed",
                borderColor: tone ? `color-mix(in srgb, ${tone} 45%, transparent)` : "color-mix(in srgb, var(--border) 70%, transparent)",
              }}
            >
              {d.hasData && tone && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-x-0 bottom-0"
                    style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 92%, white 8%), ${tone})` }}
                    initial={reduce ? undefined : { height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.05 * i, duration: 0.6, ease: EASE }}
                  />
                </div>
              )}
              {d.hasData && tone && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-background inline-flex items-center justify-center text-[13px] font-black tabular-nums shadow-[0_2px_8px_-2px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]"
                  style={{ bottom: `calc(${pct}% - 18px)`, color: tone }}
                >
                  {d.score}
                </span>
              )}
            </div>
            <span
              className="mt-3 text-[12px] font-bold text-center leading-tight text-foreground/90"
              style={!d.hasData ? { color: "var(--muted-foreground)" } : undefined}
            >
              {d.label}
            </span>
            <span
              className="text-[10.5px] font-medium mt-0.5 tracking-wide"
              style={{ color: tone ?? "var(--muted-foreground)" }}
            >
              {d.hasData && d.status ? BEHAVIOR_STATUS_LABEL[d.status] : "No data"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({
  points,
  tone,
  reduce,
}: {
  points: { label: string; score: number | null }[];
  tone: string;
  reduce: boolean;
}) {
  const populated = points.filter((p): p is { label: string; score: number } => p.score != null);
  if (populated.length < 2) return null;
  const values = populated.map((p) => p.score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(2, Math.round((max - min) * 0.3));
  const yMin = Math.max(0, min - padding);
  const yMax = Math.min(100, max + padding);
  const range = Math.max(1, yMax - yMin);
  const W = 400;
  const H = 140;
  const stepX = W / Math.max(1, populated.length - 1);
  const project = (v: number) => H - ((v - yMin) / range) * H;
  const coords = values.map((v, i) => ({ x: i * stepX, y: project(v) }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const area = `${path} L ${coords[coords.length - 1].x} ${H} L 0 ${H} Z`;
  const gradId = "behavior-trend";

  return (
    <div className="rounded-xl border border-border/60 p-3">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.28" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#${gradId})`}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={tone}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        {coords.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={3.5}
            fill={tone}
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
          />
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-between">
        {populated.map((p) => (
          <span key={p.label} className="text-[10.5px] font-semibold text-muted-foreground">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
