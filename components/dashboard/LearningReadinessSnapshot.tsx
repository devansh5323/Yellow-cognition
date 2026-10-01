"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Info, Sparkles } from "lucide-react";
import {
  READINESS_STATUS_LABEL,
  READINESS_STATUS_RANGE,
  READINESS_STATUS_TONE,
  readinessStatusFromScore,
  readinessTrendOverTime,
  type ReadinessSnapshot,
  type ReadinessStatus,
} from "@/lib/classLearning";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDecimal1 } from "@/lib/format";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STATUS_ORDER: ReadinessStatus[] = ["strong", "stable", "watch", "support"];

/** Same structure/template as FocusSnapshot.tsx's "Class Attention
 * Overview" — score + status/delta, status thresholds, an AI summary line,
 * distribution + area contribution rows, and a weekly/monthly trend chart. */
export function LearningReadinessSnapshot({ snapshot }: { snapshot: ReadinessSnapshot }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const trendPoints = useMemo(() => readinessTrendOverTime(period), [period]);
  const populatedTrend = trendPoints.filter((p): p is { label: string; score: number } => p.score != null);
  const last = populatedTrend[populatedTrend.length - 1];
  const prev = populatedTrend[populatedTrend.length - 2];
  const scoreDelta = last && prev ? Math.round((last.score - prev.score) * 10) / 10 : 0;

  if (snapshot.score == null || snapshot.status == null) {
    return (
      <NotEnoughDataPanel
        title="Not enough data yet"
        description="We don't have enough real learning-readiness signal yet to show an overall score for this class."
      />
    );
  }

  const tone = READINESS_STATUS_TONE[snapshot.status];

  const insight =
    snapshot.strongestAreas.length > 0
      ? `Stronger in ${snapshot.strongestAreas.map((a) => a.label).join(" and ")}.`
      : "Not enough area-level data yet to compare strengths and support needs.";

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Learning readiness snapshot" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="font-heading font-extrabold text-[17px] inline-flex items-center gap-1.5">
            Learning Readiness Overview
            <InfoDot text="A quick read of how ready the whole class is to learn right now, averaged across every student's readiness areas." />
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 lg:divide-x divide-border/60">
          {/* Left — score, thresholds, AI summary */}
          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Overall Readiness
              </div>
              <div className="flex items-end gap-1 mt-1">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {formatDecimal1(snapshot.score)}
                </span>
                <span className="text-muted-foreground text-xl font-bold mb-1.5">/100</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusPill label={READINESS_STATUS_LABEL[snapshot.status]} tone={tone} />
                <DeltaPill value={scoreDelta} suffix={` vs last ${period === "Weekly" ? "week" : "month"}`} />
              </div>
            </div>

            {snapshot.supportRiskPenalty > 0 && (
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                {formatDecimal1(snapshot.rawScore)} weighted average − {formatDecimal1(snapshot.supportRiskPenalty)} support-risk
                adjustment (foundational area{snapshot.supportRiskPenalty > 3 ? "s are" : " is"} weak)
              </div>
            )}

            <p className="text-[12.5px] leading-snug text-muted-foreground">
              Generated from Attention Hero gameplay signals to guide classroom support, not to measure academic achievement.
            </p>

            <div className="rounded-xl border border-border/60 p-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                Status thresholds
              </div>
              <div className="space-y-2">
                {STATUS_ORDER.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: READINESS_STATUS_TONE[s] }} />
                      <span className="text-[12.5px] font-bold">{READINESS_STATUS_LABEL[s]}</span>
                    </span>
                    <span className="text-[12px] text-muted-foreground">{READINESS_STATUS_RANGE[s]}</span>
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

          {/* Right — student distribution + area contribution + trend */}
          <div className="flex flex-col gap-5 min-w-0 lg:pl-8">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-extrabold">Student distribution</span>
                <span className="text-[11.5px] text-muted-foreground">{snapshot.total} students</span>
              </div>
              <StudentDistributionBar statusDistribution={snapshot.statusDistribution} total={snapshot.total} />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-extrabold">Area contribution</span>
              </div>
              <AreaContributionBars areas={snapshot.areas.filter((a) => a.score != null)} reduce={!!reduce} />
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
              <TrendChart points={trendPoints} tone={tone} reduce={!!reduce} />
            </div>
          </div>
        </div>
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

/** Segmented status-distribution bar — how many real-scored students fall
 * into each readiness band — same pattern as the Task Engagement overview's
 * status distribution bar, built from snapshot.statusDistribution. */
function StudentDistributionBar({
  statusDistribution,
  total,
}: {
  statusDistribution: Record<ReadinessStatus, number>;
  total: number;
}) {
  return (
    <div>
      <div className="flex rounded-xl overflow-hidden h-2.5">
        {STATUS_ORDER.map((s) => {
          const count = statusDistribution[s];
          const pct = (count / Math.max(1, total)) * 100;
          if (pct <= 0) return null;
          return <span key={s} style={{ width: `${pct}%`, background: READINESS_STATUS_TONE[s] }} />;
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
        {STATUS_ORDER.map((s) => {
          const count = statusDistribution[s];
          if (count <= 0) return null;
          return (
            <span key={s} className="inline-flex items-center gap-1.5 text-[11.5px]">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: READINESS_STATUS_TONE[s] }} aria-hidden />
              <span className="font-semibold text-foreground/85">{READINESS_STATUS_LABEL[s]}</span>
              <span className="text-muted-foreground">
                {count} student{count === 1 ? "" : "s"}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Per-area vertical "fill level" bars: a dashed pill track per area, a
 * solid pill rising to the area's score out of 100, and a badge at the
 * fill's edge carrying the number. */
function AreaContributionBars({
  areas,
  reduce,
}: {
  areas: ReadinessSnapshot["areas"];
  reduce: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      {areas.map((a, i) => {
        const hasScore = a.score != null;
        const pct = hasScore ? Math.max(5, a.score as number) : 0;
        const status = hasScore ? readinessStatusFromScore(a.score as number) : null;
        const tone = status ? READINESS_STATUS_TONE[status] : a.hue;
        return (
          <div key={a.key} className="flex flex-col items-center min-w-0 flex-1">
            <div
              className="relative w-14 h-[120px] rounded-full border overflow-visible"
              style={{
                borderStyle: "dashed",
                borderColor: hasScore ? `color-mix(in srgb, ${tone} 45%, transparent)` : "color-mix(in srgb, var(--border) 70%, transparent)",
              }}
            >
              {hasScore && (
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
              {hasScore && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-background inline-flex items-center justify-center text-[13px] font-black tabular-nums shadow-[0_2px_8px_-2px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]"
                  style={{ bottom: `calc(${pct}% - 18px)`, color: tone }}
                >
                  {a.score}
                </span>
              )}
            </div>
            <span
              className="mt-3 text-[12px] font-bold text-center leading-tight text-foreground/90"
              style={!hasScore ? { color: "var(--muted-foreground)" } : undefined}
            >
              {a.label}
            </span>
            <span
              className="text-[10.5px] font-medium mt-0.5 tracking-wide"
              style={{ color: status ? READINESS_STATUS_TONE[status] : "var(--muted-foreground)" }}
            >
              {status ? READINESS_STATUS_LABEL[status] : "No data"}
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
  const gradId = "readiness-trend";

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
