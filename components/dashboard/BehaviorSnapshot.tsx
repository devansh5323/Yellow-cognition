"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarRange,
  Clock,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  BEHAVIOR_STATUS_LABEL,
  BEHAVIOR_STATUS_RANGE,
  BEHAVIOR_STATUS_TONE,
  type BehaviorSnapshotData,
  type BehaviorStatus,
} from "@/lib/classBehavior";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STATUS_ORDER: BehaviorStatus[] = ["strong", "stable", "reinforcement", "support"];

/** Component 1 of the Classroom Behaviour & Regulation page: a quick,
 * single-glance read of overall discipline health — score, guide, and the
 * 3 headline metrics (disruptions/class, time gained, trend). */
export function BehaviorSnapshot({ snapshot }: { snapshot: BehaviorSnapshotData }) {
  const reduce = useReducedMotion();
  const tone = BEHAVIOR_STATUS_TONE[snapshot.status];
  const improving = snapshot.delta >= 0;

  const disruptionsDelta =
    Math.round((snapshot.prevDisruptionsPerClass - snapshot.disruptionsPerClass) * 10) / 10;
  const minutesDelta = snapshot.minutesGained - snapshot.prevMinutesGained;

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Classroom behavior snapshot"
        className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
      >
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-extrabold text-[17px] uppercase tracking-wide">
                Classroom Behavior Snapshot
              </h2>
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
                  A composite read of how well the class is regulating itself this period.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Quick overview of your class discipline health
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 h-10 text-[12.5px] font-bold shrink-0">
            <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
            This Week
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Behavior Control Score */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground/80">
              Behavior Control Score
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="mt-3.5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <ScoreRing score={snapshot.controlScore} tone={tone} reduce={!!reduce} />
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[13.5px] leading-snug">
                  <span className="font-heading font-extrabold">of the class</span> was in control
                  — {BEHAVIOR_STATUS_LABEL[snapshot.status].toLowerCase()} control.
                </p>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold mt-2"
                  style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                >
                  {BEHAVIOR_STATUS_LABEL[snapshot.status]}
                </span>
                <div
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold"
                  style={{ color: improving ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)" }}
                >
                  {improving ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {improving ? "+" : ""}
                  {snapshot.delta}% from last week ({snapshot.prevControlScore}%)
                </div>
              </div>
            </div>
          </div>

          {/* Score guide */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground/80 mb-3">
              Behavior Control Score Guide
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-6 text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground pb-1.5 border-b border-border/60">
              <span>Score Range</span>
              <span>Status Label</span>
            </div>
            <ul className="divide-y divide-border/50">
              {STATUS_ORDER.map((s) => (
                <li key={s} className="flex items-center gap-3 py-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: BEHAVIOR_STATUS_TONE[s] }}
                    aria-hidden
                  />
                  <span className="text-[13px] font-semibold w-16 shrink-0">
                    {BEHAVIOR_STATUS_RANGE[s]}
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      background: `color-mix(in srgb, ${BEHAVIOR_STATUS_TONE[s]} 14%, transparent)`,
                      color: BEHAVIOR_STATUS_TONE[s],
                    }}
                  >
                    {BEHAVIOR_STATUS_LABEL[s]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            Icon={Bell}
            tone="hsl(262 60% 58%)"
            label="Average disruptions per class"
            value={`~${snapshot.disruptionsPerClass}`}
            detail={
              disruptionsDelta === 0
                ? "No change vs last week"
                : `${disruptionsDelta > 0 ? "↓" : "↑"} ${Math.abs(disruptionsDelta)} from last week (~${snapshot.prevDisruptionsPerClass})`
            }
            good={disruptionsDelta >= 0}
          />
          <MetricCard
            Icon={Clock}
            tone="hsl(28 88% 54%)"
            label="Time gained to improved behavior"
            value={`${snapshot.minutesGained} mins`}
            detail={
              minutesDelta === 0
                ? "No change vs last week"
                : `${minutesDelta > 0 ? "↑" : "↓"} ${Math.abs(minutesDelta)} mins from last week (${snapshot.prevMinutesGained} mins)`
            }
            good={minutesDelta >= 0}
          />
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex items-start gap-3">
            <span className="h-9 w-9 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 inline-flex items-center justify-center shrink-0">
              {improving ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Trend this week
              </div>
              <div
                className="font-heading font-extrabold text-[17px] leading-tight mt-0.5"
                style={{ color: improving ? "hsl(174 60% 38%)" : "hsl(0 78% 50%)" }}
              >
                {improving ? "Improving" : "Declining"}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {improving
                  ? "Better behavior control compared to last week."
                  : "Behavior control has dipped compared to last week."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}

function MetricCard({
  Icon,
  tone,
  label,
  value,
  detail,
  good,
}: {
  Icon: typeof Bell;
  tone: string;
  label: string;
  value: string;
  detail: string;
  good: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-4">
      <span
        className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mt-2">
        {label}
      </div>
      <div className="font-heading font-extrabold text-[22px] leading-none mt-1" style={{ color: tone }}>
        {value}
      </div>
      <p
        className="text-[11px] font-semibold mt-1"
        style={{ color: good ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)" }}
      >
        {detail}
      </p>
    </div>
  );
}

function ScoreRing({ score, tone, reduce }: { score: number; tone: string; reduce: boolean }) {
  const SIZE = 132;
  const STROKE = 12;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.max(0, Math.min(100, score)) / 100) * C;

  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`${score}% behavior control`}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="hsl(240 15% 92%)"
          strokeWidth={STROKE}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          initial={reduce ? undefined : { strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading font-black text-[32px] leading-none tabular-nums" style={{ color: tone }}>
          {score}%
        </span>
      </div>
    </div>
  );
}
