"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ThumbsUp, Users, type LucideIcon } from "lucide-react";
import {
  BEHAVIOR_STATUS_TONE,
  type BehaviorSnapshotData,
  type BehaviorSupport,
  type DisruptionStat,
} from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: BehaviorSnapshotData;
  breakdown: DisruptionStat[];
  supportRoster: BehaviorSupport[];
  positiveLogs: number;
};

export function BehaviorSnapshot({ snapshot, breakdown, supportRoster, positiveLogs }: Props) {
  const reduce = useReducedMotion();
  const tone = BEHAVIOR_STATUS_TONE[snapshot.status];

  const topFriction = [...breakdown].sort((a, b) => b.severity - a.severity)[0] ?? null;
  const studentsToReview = supportRoster.filter((r) => r.status !== "new").length;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Behavior snapshot"
      className="premium-elevated rounded-[20px] p-5 md:p-6"
    >
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-4">
        Behaviour snapshot
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_1fr] gap-5 lg:gap-6 lg:divide-x divide-border/60">
        <div className="lg:pr-6 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-heading font-black tabular-nums leading-none text-[56px]"
              style={{ color: tone }}
            >
              {snapshot.controlScore}
            </span>
            <span className="text-[14px] font-extrabold text-muted-foreground/80">/100</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
              style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
              {snapshot.healthLabel}
            </span>
            <DeltaTag delta={snapshot.delta} />
          </div>
        </div>

        <div className="lg:pl-6 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <SnapshotTile
              label="Minor behaviours"
              value={snapshot.minorBehaviours}
              delta={snapshot.prevMinorBehaviours - snapshot.minorBehaviours}
              tone="hsl(38 92% 48%)"
              Icon={AlertTriangle}
            />
            <SnapshotTile
              label="Major behaviours"
              value={snapshot.majorBehaviours}
              delta={snapshot.prevMajorBehaviours - snapshot.majorBehaviours}
              tone="hsl(0 78% 56%)"
              Icon={AlertTriangle}
            />
            <SnapshotTile
              label="Positive behaviours"
              value={positiveLogs}
              tone="hsl(142 55% 42%)"
              Icon={ThumbsUp}
            />
            <SnapshotTile
              label="Students to review"
              value={studentsToReview}
              tone="hsl(262 60% 58%)"
              Icon={Users}
            />
            <div className="rounded-xl border border-border/60 bg-background/40 p-3 min-w-0 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1">
                Top friction area
              </div>
              {topFriction ? (
                <>
                  <div
                    className="font-heading font-extrabold text-[12.5px] leading-tight"
                    style={{ color: topFriction.hue }}
                  >
                    {topFriction.label}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground mt-0.5">
                    {topFriction.studentCount} student{topFriction.studentCount === 1 ? "" : "s"} affected
                  </div>
                </>
              ) : (
                <div className="text-[11.5px] text-muted-foreground">None flagged</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SnapshotTile({
  label,
  value,
  delta,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  delta?: number;
  tone: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3 min-w-0">
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground leading-tight mt-1.5 min-h-[2lh]">
        {label}
      </div>
      <div className="font-heading font-extrabold tabular-nums leading-none text-[22px] mt-1" style={{ color: tone }}>
        {value}
      </div>
      {delta !== undefined && delta !== 0 && (
        <div
          className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums"
          style={{ color: delta > 0 ? "hsl(142 55% 42%)" : "hsl(0 70% 50%)" }}
        >
          {delta > 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          {Math.abs(delta)}
          <span className="text-muted-foreground font-semibold ml-0.5">vs last</span>
        </div>
      )}
      {delta === 0 && <div className="mt-1 text-[10.5px] font-semibold text-muted-foreground">No change</div>}
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
      {delta} vs last week
    </span>
  );
}
