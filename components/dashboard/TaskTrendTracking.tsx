"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { TASK_TREND_LABEL, TASK_TREND_TONE, taskTrendChangeSummary, taskTrendOverTime, type TaskTrendSeriesKey } from "@/lib/classTask";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const SERIES: TaskTrendSeriesKey[] = ["completion", "initiation", "persistence"];

/** Component 6 of the Task Engagement page: is engagement improving? Real —
 * 3 series with a direct CSV field (Task Completion %, Initiation Score,
 * Persistence Score), sourced from data/studentHealthScore.ts's
 * weekly/monthly series (see lib/classTask.ts). */
export function TaskTrendTracking() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");

  const points = useMemo(() => taskTrendOverTime(period), [period]);
  const changes = useMemo(() => taskTrendChangeSummary(points), [points]);
  const hasData = points.some((p) => p.completion != null);

  return (
    <section aria-label="Task trend tracking" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-[17px]">Task Trend Tracking</h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">Is engagement improving?</p>
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
        <>
          <div className="flex flex-wrap gap-3">
            {SERIES.map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: TASK_TREND_TONE[key] }}>
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: TASK_TREND_TONE[key] }} aria-hidden />
                {TASK_TREND_LABEL[key]}
              </span>
            ))}
          </div>

          <TrendChart points={points} reduce={!!reduce} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {changes.map((c) => (
              <div key={c.key} className="rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: c.improving ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}>
                  {c.improving ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {c.deltaPct >= 0 ? "+" : ""}
                  {c.deltaPct}% vs last {period === "Weekly" ? "8 weeks" : "6 months"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{c.label} is {c.improving ? "improving" : "declining"}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function TrendChart({ points, reduce }: { points: ReturnType<typeof taskTrendOverTime>; reduce: boolean }) {
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
          // Skip null points entirely rather than drawing through a gap.
          const path = points.reduce((acc, p, i) => {
            const v = p[key];
            if (v == null) return acc;
            const y = project(v);
            return `${acc}${acc ? " L" : "M"} ${(i * stepX).toFixed(1)} ${y.toFixed(1)}`;
          }, "");
          return (
            <motion.path
              key={key}
              d={path}
              fill="none"
              stroke={TASK_TREND_TONE[key]}
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
