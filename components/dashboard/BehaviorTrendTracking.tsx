"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";
import {
  behaviorTypeDistributionChange,
  type BehaviorSnapshotData,
  type DisruptionStat,
} from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const DISRUPTIONS_TONE = "hsl(0 78% 56%)";
const TIME_GAINED_TONE = "hsl(142 55% 42%)";

/** Component 7: is behaviour improving? Reuses the 6-month trend
 * classBehaviorSnapshot already computes (disruptions, time gained) plus a
 * real before/after distribution comparison derived from the disruption
 * breakdown's own severity/prevSeverity — no new mock series. */
export function BehaviorTrendTracking({
  snapshot,
  breakdown,
}: {
  snapshot: BehaviorSnapshotData;
  breakdown: DisruptionStat[];
}) {
  const reduce = useReducedMotion();
  const points = snapshot.trend;
  const distribution = useMemo(() => behaviorTypeDistributionChange(breakdown), [breakdown]);
  const improved = distribution.filter((r) => r.pct < r.prevPct).length;

  const first = points[0];
  const last = points[points.length - 1];
  const disruptionsChange = first && last ? last.disruptions - first.disruptions : 0;
  const timeGainedChange = first && last ? last.timeGained - first.timeGained : 0;

  return (
    <section
      aria-label="Behaviour trend tracking"
      className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
    >
      <header className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-[17px]">Behavior Trend Tracking</h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">Is behavior improving?</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard
          title="Disruptions Over Time"
          question="Are disruptions going down?"
          verdict={`${disruptionsChange >= 0 ? "+" : ""}${disruptionsChange}`}
          direction={disruptionsChange < 0 ? "up" : disruptionsChange > 0 ? "down" : "flat"}
        >
          <TrendLineChart points={points} field="disruptions" tone={DISRUPTIONS_TONE} reduce={!!reduce} />
        </TrendCard>

        <TrendCard
          title="Time Gained Over Time"
          question="Is teaching time being recovered?"
          verdict={`${timeGainedChange >= 0 ? "+" : ""}${timeGainedChange} mins`}
          direction={timeGainedChange > 0 ? "up" : timeGainedChange < 0 ? "down" : "flat"}
        >
          <TrendLineChart points={points} field="timeGained" tone={TIME_GAINED_TONE} reduce={!!reduce} />
        </TrendCard>

        <div className="lg:col-span-2">
          <TrendCard
            title="Behavior Type Distribution Change"
            question="Which behaviour types make up a bigger or smaller share this week?"
            verdict={`${improved}/${distribution.length} shrank`}
            direction={improved >= distribution.length / 2 ? "up" : "down"}
          >
            <ul className="space-y-2">
              {distribution.map((r) => {
                const delta = r.pct - r.prevPct;
                return (
                  <li key={r.key} className="flex items-center gap-2.5">
                    <span className="w-[132px] shrink-0 text-[11px] font-semibold text-muted-foreground truncate">
                      {r.label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                      <motion.span
                        initial={reduce ? undefined : { scaleX: 0 }}
                        animate={{ scaleX: r.pct / 100 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="block h-full origin-left rounded-full"
                        style={{ background: r.hue }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-[11px] font-bold tabular-nums text-right">{r.pct}%</span>
                    <span
                      className="w-12 shrink-0 text-[11px] font-bold tabular-nums text-right"
                      style={{ color: delta <= 0 ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)" }}
                    >
                      {delta >= 0 ? "+" : ""}
                      {delta}pp
                    </span>
                  </li>
                );
              })}
            </ul>
          </TrendCard>
        </div>
      </div>
    </section>
  );
}

function TrendCard({
  title,
  question,
  verdict,
  direction,
  children,
}: {
  title: string;
  question: string;
  verdict: string;
  direction: "up" | "down" | "flat";
  children: ReactNode;
}) {
  const tone =
    direction === "up" ? "hsl(142 55% 40%)" : direction === "down" ? "hsl(0 78% 50%)" : "var(--muted-foreground)";
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[13px] font-bold text-foreground/90">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{question}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-3 w-3" />
          {verdict}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TrendLineChart({
  points,
  field,
  tone,
  reduce,
}: {
  points: BehaviorSnapshotData["trend"];
  field: "disruptions" | "timeGained";
  tone: string;
  reduce: boolean;
}) {
  if (points.length < 2) return null;
  const values = points.map((p) => p[field]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(1, Math.round((max - min) * 0.25));
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;
  const range = Math.max(1, yMax - yMin);
  const W = 280;
  const H = 100;
  const stepX = W / Math.max(1, points.length - 1);
  const project = (v: number) => H - ((v - yMin) / range) * H;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${project(p[field]).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${(points.length - 1) * stepX} ${H} L 0 ${H} Z`;
  const gradientId = `trend-${field}`;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.3" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#${gradientId})`}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
          transition={{ duration: 0.7, ease: EASE }}
        />
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
