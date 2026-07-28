"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import {
  FOCUS_STATUS_DESCRIPTION,
  FOCUS_STATUS_LABEL,
  FOCUS_STATUS_RANGE,
  FOCUS_STATUS_TONE,
  STAMINA_DESCRIPTION,
  STAMINA_LABEL,
  STAMINA_TONE,
  type FocusSnapshot as FocusSnapshotData,
  type FocusStatus,
  type StaminaBand,
} from "@/lib/classFocus";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STAMINA_ORDER: StaminaBand[] = ["focused", "fluctuating", "distracted"];
const STATUS_ORDER: FocusStatus[] = ["strong", "fluctuating", "at-risk"];

type Props = {
  snapshot: FocusSnapshotData;
  period: "Weekly" | "Monthly";
};

export function FocusSnapshot({ snapshot, period }: Props) {
  const reduce = useReducedMotion();
  const [trendMode, setTrendMode] = useState<"score" | "ratio">("score");
  const tone = FOCUS_STATUS_TONE[snapshot.status];
  const total = Math.max(1, snapshot.total);
  const trendData = period === "Weekly" ? snapshot.weekly : snapshot.monthly;

  const summary = useMemo(() => {
    const top = STAMINA_ORDER.reduce<StaminaBand>(
      (acc, k) => (snapshot.distribution[k] > snapshot.distribution[acc] ? k : acc),
      "focused",
    );
    const distractedPct = Math.round((snapshot.distribution.distracted / total) * 100);
    const focusedPct = Math.round((snapshot.distribution.focused / total) * 100);
    if (snapshot.status === "strong") {
      return `Class is sustaining attention well — ${focusedPct}% are in the focused band. Keep current routines.`;
    }
    if (snapshot.status === "at-risk") {
      return `Sustained attention is below benchmark. ${distractedPct}% are distracted — schedule structured breaks and reduce ambient load.`;
    }
    return `Most students are in the ${STAMINA_LABEL[top].toLowerCase()} band. Pacing or short resets will help close the gap.`;
  }, [snapshot, total]);

  return (
    <section
      aria-label="Focus snapshot"
      className="premium-elevated h-full rounded-[20px] p-6 md:p-7 relative overflow-hidden flex flex-col"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, hsl(38 92% 80% / 0.18), transparent 65%), radial-gradient(55% 45% at 100% 100%, hsl(196 70% 80% / 0.12), transparent 65%)",
        }}
      />

      <div className="relative flex-1 flex flex-col">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Focus snapshot
          </div>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
            {period}
          </span>
        </header>

        <div className="mt-5 flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-0 lg:divide-x divide-border/60">
          {/* Score */}
          <div className="lg:pr-8 flex flex-col gap-4 min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Class focus score
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {snapshot.classScore}
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
                  {FOCUS_STATUS_LABEL[snapshot.status]}
                </span>
                <DeltaTag delta={snapshot.delta} />
              </div>
            </div>

            <p className="text-[12.5px] text-muted-foreground leading-snug">
              {FOCUS_STATUS_DESCRIPTION[snapshot.status]} Overall score of your class's engagement
              during learning.
            </p>

            <StatusLegend currentStatus={snapshot.status} />

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

          {/* Stamina + trend */}
          <div className="lg:pl-8 min-w-0 flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Attention stamina
                </span>
                <span className="text-[10.5px] font-bold tabular-nums text-muted-foreground/80">
                  {snapshot.total} students
                </span>
              </div>
              <StaminaBars distribution={snapshot.distribution} total={total} />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {period.toLowerCase()} trend
                </span>
                <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
                  {(["score", "ratio"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTrendMode(m)}
                      className={cn(
                        "px-2.5 h-6 rounded-full text-[10.5px] font-bold capitalize transition-colors",
                        trendMode === m
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "score" ? "Score" : "Ratio"}
                    </button>
                  ))}
                </div>
              </div>
              {trendMode === "score" ? (
                <ScoreTrend points={trendData} reduce={!!reduce} />
              ) : (
                <RatioTrend points={trendData} reduce={!!reduce} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusLegend({ currentStatus }: { currentStatus: FocusStatus }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">
        Status thresholds
      </div>
      <ul className="space-y-1.5">
        {STATUS_ORDER.map((s) => {
          const active = currentStatus === s;
          const t = FOCUS_STATUS_TONE[s];
          return (
            <li key={s} className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: t }} />
              <span
                className={cn(
                  "text-[11.5px] font-semibold truncate",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {FOCUS_STATUS_LABEL[s]}
              </span>
              <span className="ml-auto text-[10.5px] tabular-nums text-muted-foreground">
                {FOCUS_STATUS_RANGE[s]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StaminaBars({
  distribution,
  total,
}: {
  distribution: Record<StaminaBand, number>;
  total: number;
}) {
  return (
    <div className="space-y-2.5">
      {STAMINA_ORDER.map((band) => {
        const v = distribution[band];
        const pct = Math.round((v / total) * 100);
        const tone = STAMINA_TONE[band];
        return (
          <div key={band}>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: tone }} />
                <span className="text-[12.5px] font-semibold text-foreground/90 truncate">
                  {STAMINA_LABEL[band]}
                </span>
                <span className="text-[10.5px] text-muted-foreground/80 truncate">
                  {STAMINA_DESCRIPTION[band]}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                <span className="text-[13px] font-heading font-extrabold" style={{ color: tone }}>
                  {v}
                </span>
                <span className="text-[10px] text-muted-foreground">{pct}%</span>
              </div>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.span
                className="block h-full origin-left rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, ${tone} 90%, white 10%), ${tone})`,
                  width: "100%",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreTrend({
  points,
  reduce,
}: {
  points: { label: string; score: number }[];
  reduce: boolean;
}) {
  if (points.length === 0) return null;
  // Auto-scale Y so the line uses the full chart height — anchored just below
  // the data minimum and just above the data maximum, with light padding.
  const values = points.map((p) => p.score);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = Math.max(2, Math.round((dataMax - dataMin) * 0.25));
  const yMin = Math.max(0, dataMin - padding);
  const yMax = Math.min(100, dataMax + padding);
  const range = Math.max(1, yMax - yMin);

  const height = 100;
  const width = 360;
  const stepX = width / Math.max(1, points.length - 1);
  const project = (v: number) => height - ((v - yMin) / range) * height;
  const path = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${project(p.score).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L ${(points.length - 1) * stepX} ${height} L 0 ${height} Z`;

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 pt-3 pb-2 flex-1 flex flex-col min-h-[180px]">
      <svg
        role="img"
        aria-label="Class focus score trend"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full flex-1 min-h-[120px]"
      >
        <defs>
          <linearGradient id="focus-trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(142 55% 48%)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="hsl(142 55% 48%)" stopOpacity="0" />
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
          fill="url(#focus-trend)"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="hsl(142 55% 42%)"
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
          const y = project(p.score);
          // Use ellipses sized so the dot reads as a circle once the SVG is
          // stretched to its container's aspect ratio.
          return (
            <g key={p.label + i}>
              <ellipse cx={x} cy={y} rx={3} ry={1.4} fill="hsl(142 55% 42%)" />
              <ellipse cx={x} cy={y} rx={6} ry={2.6} fill="hsl(142 55% 42%)" fillOpacity="0.12" />
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
    </div>
  );
}

function RatioTrend({
  points,
  reduce,
}: {
  points: { label: string; focused: number; fluctuating: number; distracted: number }[];
  reduce: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-3">
      <div className="flex items-end gap-2 sm:gap-3">
        {points.map((p, i) => {
          const total = Math.max(1, p.focused + p.fluctuating + p.distracted);
          const segments: { tone: string; label: string; v: number }[] = [
            { tone: STAMINA_TONE.focused, label: "Focused", v: p.focused },
            { tone: STAMINA_TONE.fluctuating, label: "Fluctuating", v: p.fluctuating },
            { tone: STAMINA_TONE.distracted, label: "Distracted", v: p.distracted },
          ];
          return (
            <div key={p.label + i} className="flex-1 min-w-0 flex flex-col items-center gap-1.5">
              <div className="w-full h-[72px] rounded-md overflow-hidden flex flex-col bg-muted/30">
                {segments.map((seg) => {
                  const pct = (seg.v / total) * 100;
                  return (
                    <motion.span
                      key={seg.label}
                      initial={reduce ? undefined : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="block origin-top w-full"
                      style={{
                        height: `${pct}%`,
                        background: seg.tone,
                      }}
                      title={`${seg.label}: ${seg.v}`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 flex-wrap">
        {(["focused", "fluctuating", "distracted"] as StaminaBand[]).map((band) => (
          <span key={band} className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: STAMINA_TONE[band] }}
              aria-hidden
            />
            <span className="text-foreground/80">{STAMINA_LABEL[band]}</span>
          </span>
        ))}
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
