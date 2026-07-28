"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Sparkles, TimerReset, Zap } from "lucide-react";
import {
  BEHAVIOR_STATUS_DESCRIPTION,
  BEHAVIOR_STATUS_LABEL,
  BEHAVIOR_STATUS_RANGE,
  BEHAVIOR_STATUS_TONE,
  type BehaviorSnapshotData,
  type BehaviorStatus,
} from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STATUS_ORDER: BehaviorStatus[] = ["strong", "stable", "reinforcement", "support"];

type Props = {
  snapshot: BehaviorSnapshotData;
};

export function BehaviorSnapshot({ snapshot }: Props) {
  const reduce = useReducedMotion();
  const [trendMode, setTrendMode] = useState<"score" | "disruptions" | "time">("score");
  const tone = BEHAVIOR_STATUS_TONE[snapshot.status];

  const summary = useMemo(() => {
    if (snapshot.status === "strong") {
      return `Class is regulating itself — ${snapshot.minutesGained} min recovered this month. Keep current routines.`;
    }
    if (snapshot.status === "support") {
      return `Behaviour is eroding learning time — ${snapshot.disruptionsPerClass} disruptions per class, on average. Start with structured supports.`;
    }
    if (snapshot.status === "reinforcement") {
      return `Disruptions are interrupting flow. Tighten transitions and restate expectations to recover ${snapshot.minutesGained}+ min/month.`;
    }
    return `Most students are managing well. Light reinforcement will lift the ${snapshot.statusDistribution.reinforcement + snapshot.statusDistribution.support} students still drifting.`;
  }, [snapshot]);

  return (
    <section
      aria-label="Behavior snapshot"
      className="premium-elevated h-full rounded-[20px] p-6 md:p-7 relative overflow-hidden flex flex-col"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, hsl(212 70% 80% / 0.18), transparent 65%), radial-gradient(55% 45% at 100% 100%, hsl(258 70% 80% / 0.12), transparent 65%)",
        }}
      />

      <div className="relative flex-1 flex flex-col">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Classroom behavior snapshot
          </div>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
            Last 30 days
          </span>
        </header>

        <div className="mt-5 flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-0 lg:divide-x divide-border/60">
          {/* Score block */}
          <div className="lg:pr-8 flex flex-col gap-4 min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Behaviour control score
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {snapshot.controlScore}
                </span>
                <span className="text-[15px] md:text-[16px] font-extrabold text-muted-foreground/80">
                  /100
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap pb-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: `color-mix(in srgb, ${tone} 12%, transparent)`,
                    color: `color-mix(in srgb, ${tone} 80%, black 12%)`,
                    border: `1px solid color-mix(in srgb, ${tone} 25%, transparent)`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
                  {BEHAVIOR_STATUS_LABEL[snapshot.status]}
                </span>
                <DeltaTag delta={snapshot.delta} />
              </div>
            </div>

            <p className="text-[12.5px] text-muted-foreground leading-snug">
              {BEHAVIOR_STATUS_DESCRIPTION[snapshot.status]}
            </p>

            <StatusLegend snapshot={snapshot} />

            <div
              className="mt-auto relative overflow-hidden rounded-2xl border p-3"
              style={{
                background:
                  "radial-gradient(80% 100% at 0% 0%, color-mix(in srgb, hsl(38 92% 60%) 10%, transparent), transparent 70%), color-mix(in srgb, var(--card) 92%, transparent)",
                borderColor: "color-mix(in srgb, hsl(38 92% 55%) 22%, transparent)",
              }}
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="h-6 w-6 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 20%, transparent), color-mix(in srgb, hsl(258 70% 70%) 16%, transparent))",
                    boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.5)",
                  }}
                >
                  <Sparkles
                    className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300"
                    strokeWidth={2.4}
                  />
                </span>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-700/80 dark:text-amber-300/80">
                    AI summary
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-foreground/85">{summary}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs + trend */}
          <div className="lg:pl-8 min-w-0 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                icon={<Zap className="h-3.5 w-3.5" strokeWidth={2.4} />}
                label="Disruptions per class"
                value={snapshot.disruptionsPerClass}
                prev={snapshot.prevDisruptionsPerClass}
                tone="hsl(0 78% 56%)"
                lowerIsBetter
                suffix="/class"
              />
              <KpiCard
                icon={<TimerReset className="h-3.5 w-3.5" strokeWidth={2.4} />}
                label="Time gained"
                value={snapshot.minutesGained}
                prev={snapshot.prevMinutesGained}
                tone="hsl(142 55% 42%)"
                suffix=" min"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  6-month trend
                </span>
                <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
                  {(
                    [
                      { k: "score", l: "Control" },
                      { k: "disruptions", l: "Disruptions" },
                      { k: "time", l: "Time" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.k}
                      onClick={() => setTrendMode(m.k)}
                      className={cn(
                        "px-2.5 h-6 rounded-full text-[10.5px] font-bold transition-colors",
                        trendMode === m.k
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
              <TrendArea snapshot={snapshot} mode={trendMode} reduce={!!reduce} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusLegend({ snapshot }: { snapshot: BehaviorSnapshotData }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">
        Status thresholds
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {STATUS_ORDER.map((s) => {
          const active = snapshot.status === s;
          const t = BEHAVIOR_STATUS_TONE[s];
          return (
            <li key={s} className="flex items-baseline gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0 self-center"
                style={{ background: t }}
              />
              <span
                className={cn(
                  "text-[11px] font-semibold leading-tight min-w-0 flex-1",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {BEHAVIOR_STATUS_LABEL[s]}
              </span>
              <span className="shrink-0 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground">
                {BEHAVIOR_STATUS_RANGE[s]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  prev,
  tone,
  lowerIsBetter,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  prev: number;
  tone: string;
  lowerIsBetter?: boolean;
  suffix?: string;
}) {
  const delta = value - prev;
  const better = lowerIsBetter ? delta < 0 : delta > 0;
  const arrow =
    delta === 0 ? null : better ? (
      <ArrowUpRight className="h-3 w-3" />
    ) : (
      <ArrowDownRight className="h-3 w-3" />
    );
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className="font-heading font-extrabold tabular-nums leading-none text-[26px]"
          style={{ color: tone }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] font-semibold text-muted-foreground">{suffix}</span>
        )}
      </div>
      {delta !== 0 && (
        <div
          className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums"
          style={{ color: better ? "hsl(142 55% 42%)" : "hsl(0 70% 50%)" }}
        >
          {arrow}
          {Math.abs(delta)}
          <span className="text-muted-foreground font-semibold ml-1">vs last</span>
        </div>
      )}
    </div>
  );
}

function TrendArea({
  snapshot,
  mode,
  reduce,
}: {
  snapshot: BehaviorSnapshotData;
  mode: "score" | "disruptions" | "time";
  reduce: boolean;
}) {
  const points = snapshot.trend;
  const values = points.map((p) =>
    mode === "disruptions" ? p.disruptions : mode === "time" ? p.timeGained : p.score,
  );

  const config: {
    value: (p: (typeof points)[number]) => number;
    yMin: number;
    yMax: number;
    tone: string;
    suffix: string;
  } = (() => {
    // Auto-scale the Y axis to the data range with light padding so the line
    // covers most of the chart height — anchored to 0 for non-score modes,
    // and floored just below the data minimum for score mode.
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const padding = Math.max(2, Math.round((dataMax - dataMin) * 0.25));

    if (mode === "disruptions") {
      return {
        value: (p) => p.disruptions,
        yMin: 0,
        yMax: dataMax + padding,
        tone: "hsl(0 78% 56%)",
        suffix: "/class",
      };
    }
    if (mode === "time") {
      return {
        value: (p) => p.timeGained,
        yMin: 0,
        yMax: dataMax + padding,
        tone: "hsl(142 55% 42%)",
        suffix: " min",
      };
    }
    return {
      value: (p) => p.score,
      yMin: Math.max(0, dataMin - padding),
      yMax: Math.min(100, dataMax + padding),
      tone: "hsl(212 55% 45%)",
      suffix: "",
    };
  })();

  const height = 100;
  const width = 360;
  const stepX = width / Math.max(1, points.length - 1);
  const range = Math.max(1, config.yMax - config.yMin);
  const project = (v: number) => height - ((v - config.yMin) / range) * height;
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${project(config.value(p)).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L ${(points.length - 1) * stepX} ${height} L 0 ${height} Z`;

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 pt-3 pb-2 flex-1 flex flex-col min-h-[180px]">
      <svg
        role="img"
        aria-label="Behavior trend"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full flex-1 min-h-[120px]"
      >
        <defs>
          <linearGradient id={`beh-trend-${mode}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.tone} stopOpacity="0.34" />
            <stop offset="100%" stopColor={config.tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={0}
            x2={width}
            y1={height * r}
            y2={height * r}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <motion.path
          d={area}
          fill={`url(#beh-trend-${mode})`}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={config.tone}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        {points.map((p, i) => {
          const x = i * stepX;
          const y = project(config.value(p));
          // Use ellipses sized so the dot reads as a circle once the SVG is
          // stretched into the container's aspect ratio.
          return (
            <g key={p.label + i}>
              <ellipse cx={x} cy={y} rx={3} ry={1.4} fill={config.tone} />
              <ellipse cx={x} cy={y} rx={6} ry={2.6} fill={config.tone} fillOpacity="0.12" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between mt-2 shrink-0">
        {points.map((p) => (
          <span
            key={p.label}
            className="text-[10px] font-semibold tabular-nums text-muted-foreground"
          >
            {p.label}
          </span>
        ))}
      </div>
      <div className="mt-1 text-[10px] tabular-nums text-muted-foreground text-right shrink-0">
        Latest: {config.value(points[points.length - 1])}
        {config.suffix}
      </div>
    </div>
  );
}

function DeltaTag({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold text-muted-foreground bg-muted/60">
        Holding
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums",
        positive
          ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
          : "text-rose-700 bg-rose-500/10 dark:text-rose-300",
      )}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {positive ? "+" : ""}
      {delta} vs last check-in
    </span>
  );
}
