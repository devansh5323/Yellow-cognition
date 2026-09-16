"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
  type TaskSnapshotData,
  type TaskStatus,
} from "@/lib/classTask";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { cn } from "@/lib/utils";

const STATUS_ORDER: TaskStatus[] = ["strong", "stable", "reinforcement", "support"];

const STATUS_SUMMARY: Record<TaskStatus, string> = {
  strong: "The class is starting and sticking with work consistently. Keep current routines.",
  stable: "Most students are engaging well, with a few drifting — light scaffolding will help.",
  reinforcement: "Engagement is uneven — checkpoints and shorter task windows should help.",
  support: "Engagement is below where we'd like — start with shorter task bundles and visible checkpoints.",
};

type Props = {
  snapshot: TaskSnapshotData;
};

export function TaskEngagementSnapshot({ snapshot }: Props) {
  const reduce = useReducedMotion();

  if (snapshot.engagementScore == null || snapshot.status == null) {
    return (
      <section aria-label="Task engagement snapshot" className="premium-elevated rounded-[20px] p-6 md:p-7">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-4">
          Task engagement snapshot
        </div>
        <NotEnoughDataPanel
          title="Not enough data yet"
          description="We don't have real task engagement scores for this roster yet."
        />
      </section>
    );
  }

  const { engagementScore, status, total, statusDistribution } = snapshot;
  const tone = TASK_STATUS_TONE[status];

  return (
    <SnapshotBody
      reduce={!!reduce}
      engagementScore={engagementScore}
      status={status}
      total={total}
      statusDistribution={statusDistribution}
      tone={tone}
    />
  );
}

function SnapshotBody({
  reduce,
  engagementScore,
  status,
  total,
  statusDistribution,
  tone,
}: {
  reduce: boolean;
  engagementScore: number;
  status: TaskStatus;
  total: number;
  statusDistribution: Record<TaskStatus, number>;
  tone: string;
}) {
  const summary = useMemo(() => STATUS_SUMMARY[status], [status]);

  return (
    <section
      aria-label="Task engagement snapshot"
      className="premium-elevated h-full rounded-[20px] p-6 md:p-7 relative overflow-hidden flex flex-col"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, hsl(38 92% 80% / 0.18), transparent 65%), radial-gradient(55% 45% at 100% 100%, hsl(142 60% 80% / 0.12), transparent 65%)",
        }}
      />

      <div className="relative flex-1 flex flex-col">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Task engagement snapshot
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
            <Users className="h-3.5 w-3.5" />
            {total} students
          </span>
        </header>

        <div className="mt-5 flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-0 lg:divide-x divide-border/60">
          {/* Score block */}
          <div className="lg:pr-8 flex flex-col gap-4 min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Engagement score
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {engagementScore}
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
                  {TASK_STATUS_LABEL[status]}
                </span>
              </div>
            </div>

            <p className="text-[12.5px] text-muted-foreground leading-snug">{summary}</p>
          </div>

          {/* Status distribution */}
          <div className="lg:pl-8 min-w-0 flex flex-col gap-3">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Status distribution
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {STATUS_ORDER.map((s) => {
                const t = TASK_STATUS_TONE[s];
                const active = status === s;
                return (
                  <li
                    key={s}
                    className={cn(
                      "rounded-xl border p-3.5 flex items-center justify-between gap-2",
                      active ? "border-border" : "border-border/60",
                    )}
                    style={active ? { background: `color-mix(in srgb, ${t} 6%, transparent)` } : undefined}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: t }} />
                      <span className="text-[12px] font-semibold truncate">{TASK_STATUS_LABEL[s]}</span>
                    </div>
                    <motion.span
                      initial={reduce ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="font-heading font-extrabold tabular-nums text-[18px]"
                      style={{ color: t }}
                    >
                      {statusDistribution[s]}
                    </motion.span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
