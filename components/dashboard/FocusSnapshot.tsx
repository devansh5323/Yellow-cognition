"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Info, Sparkles } from "lucide-react";
import {
  classAttentionHeatmap,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDecimal1 } from "@/lib/format";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STAMINA_ORDER: StaminaBand[] = ["focused", "fluctuating", "distracted"];
const STATUS_ORDER: FocusStatus[] = ["strong", "fluctuating", "at-risk"];

type Props = {
  snapshot: FocusSnapshotData;
};

/** Component 1 of the Attention & Focus detail page's 5-part structure
 * (Snapshot → Patterns → Priority → Actions → Trends): an immediate,
 * overall read of the class's attention state — class focus score with
 * status/delta, a status-thresholds reference, an AI summary line,
 * per-band attention stamina bars, and a weekly/monthly trend chart. */
export function FocusSnapshot({ snapshot }: Props) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const total = Math.max(1, snapshot.total);
  const tone = FOCUS_STATUS_TONE[snapshot.status];

  const points = period === "Weekly" ? snapshot.weekly : snapshot.monthly;
  const populatedPoints = points.filter((point): point is typeof point & { score: number } => point.score != null);
  const last = populatedPoints[populatedPoints.length - 1];
  const prev = populatedPoints[populatedPoints.length - 2];
  const scoreDelta = last && prev ? Math.round((last.score - prev.score) * 10) / 10 : snapshot.delta;

  const focusedPct = Math.round((snapshot.distribution.focused / total) * 100);
  const statusClause =
    snapshot.status === "strong"
      ? "Class is sustaining attention well"
      : snapshot.status === "fluctuating"
        ? "Class attention is fluctuating"
        : "Class attention needs support";
  const trendClause =
    scoreDelta > 0
      ? `up ${formatDecimal1(Math.abs(scoreDelta))} pts`
      : scoreDelta < 0
        ? `down ${formatDecimal1(Math.abs(scoreDelta))} pts`
        : "flat";

  const heatmap = useMemo(() => classAttentionHeatmap(), []);
  const weakestDomain = [...heatmap].sort((a, b) => a.score - b.score)[0];

  const advice =
    snapshot.status === "strong"
      ? "Keep current routines."
      : weakestDomain
        ? `${weakestDomain.label} is the softest area (avg ${formatDecimal1(weakestDomain.score)}) — a short reset there could help.`
        : snapshot.status === "fluctuating"
          ? "A short reset activity could help."
          : "Consider immediate support strategies.";

  const aiSummary =
    snapshot.status === "strong"
      ? `${statusClause} (${trendClause}). ${advice}`
      : `${statusClause} (${trendClause}), ${focusedPct}% focused. ${advice}`;

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Class attention overview" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="font-heading font-extrabold text-[17px] inline-flex items-center gap-1.5">
            Class Attention Overview
            <InfoDot text="A quick read of how the whole class is attending right now, averaged across every student's attention sub-domains." />
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 lg:divide-x divide-border/60">
          {/* Left — score, thresholds, AI summary */}
          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Class focus score
              </div>
              <div className="flex items-end gap-1 mt-1">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {formatDecimal1(snapshot.classScore)}
                </span>
                <span className="text-muted-foreground text-xl font-bold mb-1.5">/100</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusPill status={snapshot.status} />
                <DeltaPill value={scoreDelta} suffix={` vs last ${period === "Weekly" ? "check-in" : "period"}`} />
              </div>
            </div>

            <p className="text-[12.5px] leading-snug text-muted-foreground">
              {statusClause}. Overall score of your class&apos;s engagement during learning.
            </p>

            <div className="rounded-xl border border-border/60 p-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
                Status thresholds
              </div>
              <div className="space-y-2">
                {STATUS_ORDER.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: FOCUS_STATUS_TONE[s] }} />
                      <span className="text-[12.5px] font-bold">{FOCUS_STATUS_LABEL[s]}</span>
                    </span>
                    <span className="text-[12px] text-muted-foreground">{FOCUS_STATUS_RANGE[s]}</span>
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
                <p className="text-[12.5px] leading-snug mt-0.5">{aiSummary}</p>
              </div>
            </div>
          </div>

          {/* Right — attention stamina + weekly trend */}
          <div className="flex flex-col gap-5 min-w-0 lg:pl-8">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-extrabold">Attention stamina</span>
                <span className="text-[11.5px] text-muted-foreground">{snapshot.total} students</span>
              </div>
              <AttentionStaminaRows distribution={snapshot.distribution} total={total} reduce={!!reduce} />
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
              <TrendChart points={points} tone={tone} reduce={!!reduce} />
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

function StatusPill({ status }: { status: FocusStatus }) {
  const tone = FOCUS_STATUS_TONE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-[11.5px] font-bold"
      style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {FOCUS_STATUS_LABEL[status]}
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

/** Per-band horizontal "fill level" rows — dot + label + description on
 * one line, real count/share right-aligned, a filled progress track below. */
function AttentionStaminaRows({
  distribution,
  total,
  reduce,
}: {
  distribution: Record<StaminaBand, number>;
  total: number;
  reduce: boolean;
}) {
  return (
    <div className="space-y-3.5">
      {STAMINA_ORDER.map((band, i) => {
        const count = distribution[band];
        const pct = Math.round((count / total) * 100);
        const tone = STAMINA_TONE[band];
        return (
          <div key={band}>
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-start gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0 mt-1" style={{ background: tone }} />
                <span className="min-w-0">
                  <span className="text-[12.5px] font-bold">{STAMINA_LABEL[band]}</span>{" "}
                  <span className="text-[11px] text-muted-foreground">{STAMINA_DESCRIPTION[band]}</span>
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-black tabular-nums" style={{ color: tone }}>
                {count}
                <span className="ml-1 text-[11px] font-semibold text-muted-foreground">{pct}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden mt-1.5">
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
  const gradId = "focus-trend";

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
