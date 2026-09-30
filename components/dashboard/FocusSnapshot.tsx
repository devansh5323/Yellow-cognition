"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Info, PartyPopper } from "lucide-react";
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
import { formatDecimal1 } from "@/lib/format";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STAMINA_ORDER: StaminaBand[] = ["focused", "fluctuating", "distracted"];

type Props = {
  snapshot: FocusSnapshotData;
};

/** Component 1 of the Attention & Focus detail page's 5-part structure
 * (Snapshot → Patterns → Priority → Actions → Trends): an immediate,
 * overall read of the class's attention state — donut ring for the class
 * focus score, a focused/fluctuating/distracted legend with real counts,
 * and a weekly/monthly trend delta from the supplied L2 dataset. */
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

  const zoneDeltas = useMemo(() => {
    const currentTotal = Math.max(1, Object.values(snapshot.distribution).reduce((sum, count) => sum + count, 0));
    const previousTotal = Math.max(1, Object.values(snapshot.previousDistribution).reduce((sum, count) => sum + count, 0));
    return {
      focused: Math.round(((snapshot.distribution.focused / currentTotal) * 100 - (snapshot.previousDistribution.focused / previousTotal) * 100) * 10) / 10,
      fluctuating: Math.round(((snapshot.distribution.fluctuating / currentTotal) * 100 - (snapshot.previousDistribution.fluctuating / previousTotal) * 100) * 10) / 10,
      distracted: Math.round(((snapshot.distribution.distracted / currentTotal) * 100 - (snapshot.previousDistribution.distracted / previousTotal) * 100) * 10) / 10,
    };
  }, [snapshot.distribution, snapshot.previousDistribution]);

  const message =
    scoreDelta > 0
      ? { text: `Great! Your class focus improved this ${period === "Weekly" ? "week" : "month"}.`, positive: true }
      : scoreDelta < 0
        ? { text: `Class focus dipped this ${period === "Weekly" ? "week" : "month"} — might be worth a check-in.`, positive: false }
        : { text: `Class focus is holding steady this ${period === "Weekly" ? "week" : "month"}.`, positive: true };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Focus snapshot" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-[17px] inline-flex items-center gap-1.5">
              Class Attention Overview
              <InfoDot text="A quick read of how the whole class is attending right now, averaged across every student's attention sub-domains." />
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-full border border-border/60 bg-background p-0.5">
              {(["Weekly", "Monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors",
                    period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <FocusDonut
            distribution={snapshot.distribution}
            total={total}
            score={snapshot.classScore}
            delta={scoreDelta}
            reduce={!!reduce}
          />

          <div className="flex-1 min-w-0 w-full space-y-2.5">
            {STAMINA_ORDER.map((band) => {
              const count = snapshot.distribution[band];
              const pct = (count / total) * 100;
              const delta = zoneDeltas[band];
              return (
                <div
                  key={band}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5"
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: STAMINA_TONE[band] }} aria-hidden />
                  <span className="text-[13px] font-bold text-foreground/90 flex-1">{STAMINA_LABEL[band]}</span>
                  <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
                    {count} student{count === 1 ? "" : "s"}
                  </span>
                  <span className="text-[13px] font-extrabold tabular-nums w-10 text-right" style={{ color: STAMINA_TONE[band] }}>
                    {formatDecimal1(pct)}%
                  </span>
                  <DeltaBadge value={delta} className="w-14 justify-end" />
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold",
            message.positive ? "bg-[hsl(142_55%_45%)]/10 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)]" : "bg-[hsl(38_92%_50%)]/10 text-[hsl(30_80%_38%)] dark:text-[hsl(38_92%_65%)]",
          )}
        >
          {message.positive ? <PartyPopper className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Trend compares the current {period === "Weekly" ? "week" : "month"} with the previous {period === "Weekly" ? "week" : "month"}.
          Status: <span className="font-bold" style={{ color: tone }}>{FOCUS_STATUS_LABEL[snapshot.status]}</span> ({FOCUS_STATUS_RANGE[snapshot.status]}).
        </p>
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

/** Full donut ring, 3 stacked arcs (focused/fluctuating/distracted, in that
 * order) with the class focus score centered — matches the reference
 * "Class Attention Overview" design (a full ring, not a semi-circle gauge). */
function FocusDonut({
  distribution,
  total,
  score,
  delta,
  reduce,
}: {
  distribution: Record<StaminaBand, number>;
  total: number;
  score: number;
  delta: number;
  reduce: boolean;
}) {
  const SIZE = 176;
  const STROKE = 16;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  const arcs = STAMINA_ORDER.reduce<{ band: StaminaBand; dash: number; offset: number }[]>((acc, band) => {
    const pct = distribution[band] / total;
    const dash = pct * C;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ band, dash, offset });
    return acc;
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} role="img" aria-label={`${score} out of 100 focus score`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="hsl(240 15% 92%)" strokeWidth={STROKE} fill="none" className="dark:stroke-[hsl(230_20%_25%)]" />
        {arcs.map(({ band, dash, offset }) => (
          <motion.circle
            key={band}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={STAMINA_TONE[band]}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            fill="none"
            strokeDasharray={`${dash} ${C - dash}`}
            initial={reduce ? undefined : { strokeDashoffset: -offset, opacity: 0 }}
            animate={{ strokeDashoffset: -offset, opacity: dash > 0 ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-black text-[34px] leading-none tabular-nums">{formatDecimal1(score)}%</span>
        <span className="text-[11px] text-muted-foreground font-bold mt-1">Focus Score</span>
        <DeltaBadge value={delta} suffix="%" className="mt-1.5" />
      </div>
    </div>
  );
}

function DeltaBadge({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const zero = value === 0;
  const positive = value > 0;
  const color = zero ? undefined : positive ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold", className)} style={color ? { color } : undefined}>
      {!zero && (positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      {positive ? "+" : ""}
      {formatDecimal1(value)}
      {suffix}
    </span>
  );
}
