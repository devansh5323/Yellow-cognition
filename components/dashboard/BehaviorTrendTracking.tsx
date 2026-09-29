"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Lightbulb, TrendingUp, Users2 } from "lucide-react";
import {
  BEHAVIOR_TREND_LABEL,
  BEHAVIOR_TREND_TONE,
  behaviorTrendOverTime,
  behaviorTrendSummary,
  type BehaviorSnapshotData,
  type BehaviorTrendSeriesKey,
} from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const SERIES: BehaviorTrendSeriesKey[] = ["overall", "non-compliance", "impulse", "peer"];

/** Component 6 of the Classroom Behaviour & Regulation page: is behaviour
 * improving over time? Real — 4 series with a direct CSV field (overall
 * composite, non-compliance, impulse control, peer interaction), sourced
 * from data/studentHealthScore.ts's weekly/monthly series. See
 * lib/classBehavior.ts's header for the full real-vs-demo breakdown of
 * this page. */
export function BehaviorTrendTracking({ snapshot }: { snapshot: BehaviorSnapshotData }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");

  const points = useMemo(() => behaviorTrendOverTime(period), [period]);
  const summary = useMemo(() => behaviorTrendSummary(points, snapshot), [points, snapshot]);

  const hasData = points.some((p) => p.overall != null);

  return (
    <section aria-label="Behaviour trend tracking" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-[17px]">Behavior Trend Tracking</h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">Is behavior improving over time?</p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-background p-0.5">
          {(["Weekly", "Monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 h-8 rounded-full text-[12px] font-bold transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {!hasData ? (
        <p className="text-[12.5px] text-muted-foreground">Not enough weekly history yet — check back once more data has been collected.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4">
            <div className="flex flex-wrap gap-3 mb-3">
              {SERIES.map((key) => (
                <span key={key} className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: BEHAVIOR_TREND_TONE[key] }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BEHAVIOR_TREND_TONE[key] }} aria-hidden />
                  {BEHAVIOR_TREND_LABEL[key]}
                </span>
              ))}
            </div>
            <TrendChart points={points} reduce={!!reduce} />
          </div>

          <div className="space-y-2.5">
            {summary.mostImproved && (
              <SummaryTile
                icon={ArrowUpRight}
                tone="hsl(142 55% 42%)"
                label="Most Improved"
                value={summary.mostImproved.label}
                delta={summary.mostImproved.delta}
              />
            )}
            {summary.watchArea && (
              <SummaryTile icon={ArrowDownRight} tone="hsl(38 92% 48%)" label="Watch Area" value={summary.watchArea.label} delta={summary.watchArea.delta} />
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile icon={Users2} tone="hsl(212 90% 58%)" label="Students Improving" value={summary.studentsImproving} />
              <StatTile icon={Users2} tone="hsl(0 78% 55%)" label="Students Needing Support" value={summary.studentsNeedingSupport} />
            </div>
            <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1">
                <Lightbulb className="h-3.5 w-3.5" />
                Yellow Insight
              </div>
              <p className="text-[11.5px] text-foreground/80 leading-snug">{summary.insight}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TrendChart({ points, reduce }: { points: ReturnType<typeof behaviorTrendOverTime>; reduce: boolean }) {
  const W = 560;
  const H = 160;
  const allValues = points.flatMap((p) => SERIES.map((k) => p[k])).filter((v): v is number => v != null);
  const min = Math.min(0, ...allValues);
  const max = Math.max(100, ...allValues);
  const range = Math.max(1, max - min);
  const stepX = W / Math.max(1, points.length - 1);
  const project = (v: number) => H - ((v - min) / range) * H;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {SERIES.map((key) => {
          const path = points.reduce(
            (state, p, i) => {
              const value = p[key];
              if (value == null) return { path: state.path, segmentOpen: false };
              const command = state.segmentOpen ? "L" : "M";
              const next = `${command} ${(i * stepX).toFixed(1)} ${project(value).toFixed(1)}`;
              return { path: `${state.path}${state.path ? " " : ""}${next}`, segmentOpen: true };
            },
            { path: "", segmentOpen: false },
          ).path;
          return (
            <motion.path
              key={key}
              d={path}
              fill="none"
              stroke={BEHAVIOR_TREND_TONE[key]}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? undefined : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex items-center justify-between">
        {points.map((p) => (
          <span key={p.label} className="text-[9.5px] font-semibold text-muted-foreground">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, tone, label, value, delta }: { icon: typeof ArrowUpRight; tone: string; label: string; value: string; delta: number }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: `color-mix(in srgb, ${tone} 10%, transparent)` }}>
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em]" style={{ color: tone }}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[14px] font-bold text-foreground/90">{value}</span>
        <span className="text-[13px] font-extrabold tabular-nums" style={{ color: tone }}>
          {delta >= 0 ? "+" : ""}
          {delta}
        </span>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, tone, label, value }: { icon: typeof Users2; tone: string; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <Icon className="h-4 w-4" style={{ color: tone }} />
      <div className="mt-1.5 font-heading font-extrabold text-[18px] leading-none" style={{ color: tone }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{label}</div>
    </div>
  );
}
