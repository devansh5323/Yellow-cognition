"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  HeartPulse,
  Info,
  LineChart as LineChartIcon,
  PieChart,
} from "lucide-react";
import {
  FOCUS_STATUS_LABEL,
  FOCUS_STATUS_RANGE,
  FOCUS_STATUS_TONE,
  STAMINA_LABEL,
  STAMINA_TONE,
  type FocusSnapshot as FocusSnapshotData,
  type StaminaBand,
} from "@/lib/classFocus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STAMINA_ORDER: StaminaBand[] = ["focused", "fluctuating", "distracted"];
const STAMINA_EMOJI: Record<StaminaBand, string> = {
  focused: "🙂",
  fluctuating: "😐",
  distracted: "😟",
};
const STAMINA_RANGE: Record<StaminaBand, string> = {
  focused: "PFI score > 70",
  fluctuating: "PFI score 40 – 70",
  distracted: "PFI score < 40",
};

type Props = {
  snapshot: FocusSnapshotData;
};

/** Component 1 of the Attention & Focus detail page's 5-part structure
 * (Snapshot → Patterns → Priority → Actions → Trends): class focus score
 * gauge, attention stamina distribution, and a 7-day trend indicator. */
export function FocusSnapshot({ snapshot }: Props) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const total = Math.max(1, snapshot.total);
  const tone = FOCUS_STATUS_TONE[snapshot.status];

  const points = period === "Weekly" ? snapshot.weekly : snapshot.monthly;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const scoreDelta = last && prev ? last.score - prev.score : snapshot.delta;

  const zoneDeltas = useMemo(() => {
    if (!last || !prev) return { focused: 0, fluctuating: 0, distracted: 0 };
    const pct = (v: number, p: typeof last) =>
      Math.round((v / Math.max(1, p.focused + p.fluctuating + p.distracted)) * 100);
    return {
      focused: pct(last.focused, last) - pct(prev.focused, prev),
      fluctuating: pct(last.fluctuating, last) - pct(prev.fluctuating, prev),
      distracted: pct(last.distracted, last) - pct(prev.distracted, prev),
    };
  }, [last, prev]);

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Focus snapshot"
        className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5"
      >
        <header className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <LineChartIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-[17px] inline-flex items-center gap-1">
              1. Focus Snapshot
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
              Immediate overview of your class state
              <InfoDot text="A quick read of how the whole class is attending right now." />
            </p>
          </div>
        </header>

        {/* Class focus score */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-foreground/90 mb-3.5">
            Class Focus Score
            <InfoDot text="Average of every student's PFI (attention) score." />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <FocusGauge score={snapshot.classScore} tone={tone} reduce={!!reduce} />
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <p className="text-[13px] text-muted-foreground leading-snug max-w-[220px] text-center sm:text-left">
                The overall score of your class&apos;s engagement during learning
              </p>
              <span
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 shrink-0"
                style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)` }}
              >
                <HeartPulse className="h-4 w-4" style={{ color: tone }} />
                <span className="flex flex-col leading-tight">
                  <span className="font-heading font-extrabold text-[14px]" style={{ color: tone }}>
                    {FOCUS_STATUS_LABEL[snapshot.status]}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground font-semibold">
                    {FOCUS_STATUS_RANGE[snapshot.status]}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Attention stamina distribution */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-foreground/90">
            Attention Stamina Distribution
            <InfoDot text="Share of children in each attention stamina zone right now." />
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            Percentage of children in each attention stamina zone
          </p>

          <div className="mt-3.5 flex rounded-xl overflow-hidden">
            {STAMINA_ORDER.map((band) => {
              const count = snapshot.distribution[band];
              const pct = Math.round((count / total) * 100);
              if (pct <= 0) return null;
              return (
                <div
                  key={band}
                  className="flex flex-col items-center justify-center gap-1 py-3.5 min-w-0"
                  style={{
                    flex: `${pct} 1 0`,
                    background: `color-mix(in srgb, ${STAMINA_TONE[band]} 16%, transparent)`,
                  }}
                >
                  <span className="text-[20px] leading-none" aria-hidden>
                    {STAMINA_EMOJI[band]}
                  </span>
                  <span className="text-[11.5px] font-bold" style={{ color: STAMINA_TONE[band] }}>
                    {STAMINA_LABEL[band]}
                  </span>
                  <span
                    className="font-heading font-extrabold text-[20px] leading-none"
                    style={{ color: STAMINA_TONE[band] }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {STAMINA_ORDER.map((band) => (
              <span key={band} className="inline-flex items-center gap-1.5 text-[11px]">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: STAMINA_TONE[band] }}
                  aria-hidden
                />
                <span className="font-semibold text-foreground/85">{STAMINA_LABEL[band]}</span>
                <span className="text-muted-foreground">{STAMINA_RANGE[band]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Trend indicator */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[12.5px] font-bold text-foreground/90">Trend Indicator</div>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Change over the past {period === "Weekly" ? "7 days" : "4 weeks"}
              </p>
            </div>
            <div className="inline-flex rounded-full border border-border/60 bg-card p-0.5">
              {(["Weekly", "Monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors",
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                <LineChartIcon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold">Overall Focus Score</span>
              <DeltaBadge value={scoreDelta} suffix=" points" />
              <MiniSparkline points={points} reduce={!!reduce} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                <PieChart className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold">Zone Distribution</span>
              <div className="flex items-center gap-3 ml-auto flex-wrap">
                <DeltaBadge value={zoneDeltas.focused} label="Focused" suffix="%" />
                <DeltaBadge value={zoneDeltas.fluctuating} label="Fluctuating" suffix="%" />
                <DeltaBadge value={zoneDeltas.distracted} label="Distracted" suffix="%" />
              </div>
            </div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Trends compare the current {period === "Weekly" ? "week" : "month"} with the previous{" "}
          {period === "Weekly" ? "week" : "month"}.
        </p>
      </section>
    </TooltipProvider>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="More info"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

/** Semi-circle (speedometer-style) progress gauge. */
function FocusGauge({ score, tone, reduce }: { score: number; tone: string; reduce: boolean }) {
  const SIZE = 176;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const HALF_C = Math.PI * R;
  const offset = HALF_C - (Math.max(0, Math.min(100, score)) / 100) * HALF_C;
  const height = SIZE / 2 + STROKE;

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height }} role="img" aria-label={`${score} out of 100`}>
      <svg width={SIZE} height={height} viewBox={`0 0 ${SIZE} ${height}`}>
        <path
          d={`M ${STROKE / 2} ${SIZE / 2} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
          stroke="hsl(240 15% 92%)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <motion.path
          d={`M ${STROKE / 2} ${SIZE / 2} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={HALF_C}
          initial={reduce ? undefined : { strokeDashoffset: HALF_C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="font-heading font-black text-[32px] leading-none tabular-nums">
          {score}
          <span className="text-[14px] text-muted-foreground font-bold">/100</span>
        </span>
      </div>
    </div>
  );
}

function MiniSparkline({ points, reduce }: { points: { score: number }[]; reduce: boolean }) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const W = 84;
  const H = 28;
  const stepX = W / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${(H - ((p.score - min) / range) * H).toFixed(1)}`)
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 ml-auto">
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(258 70% 60%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </svg>
  );
}

function DeltaBadge({ value, suffix = "", label }: { value: number; suffix?: string; label?: string }) {
  const zero = value === 0;
  const positive = value > 0;
  const color = zero ? undefined : positive ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)";
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={color ? { color } : undefined}>
      {!zero && (positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      {positive ? "+" : ""}
      {value}
      {suffix}
      {label && <span className="text-muted-foreground font-semibold ml-0.5">{label}</span>}
    </span>
  );
}
