"use client";

import { Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
  taskBreakdownExtremes,
  type TaskAreaStat,
} from "@/lib/classTask";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Component 2 of the Task Engagement page: breakdown of engagement across
 * the 7 real task areas — real, class-level, from this week's CSV data
 * (see lib/classTask.ts). */
export function TaskEngagementBreakdown({ breakdown }: { breakdown: TaskAreaStat[] }) {
  const reduce = useReducedMotion();
  const { strongest, weakest } = taskBreakdownExtremes(breakdown);

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Task engagement breakdown" className="rounded-2xl border border-border bg-card p-5 md:p-6 h-full flex flex-col">
        <header className="flex items-center gap-1.5 mb-1">
          <h2 className="font-heading font-extrabold text-[17px]">Task Engagement Breakdown</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
              This week&apos;s class-level score for each task-engagement area.
            </TooltipContent>
          </Tooltip>
        </header>
        <p className="text-[12px] text-muted-foreground mb-3">Breakdown of engagement across key areas</p>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="grid grid-cols-[1.4fr_1fr_auto] bg-muted/40 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <div className="px-4 py-2.5">Area</div>
            <div className="px-3 py-2.5">Score (/100)</div>
            <div className="px-3 py-2.5">Status</div>
          </div>
          <div className="divide-y divide-border/60">
            {breakdown.map((row, i) => (
              <motion.div
                key={row.key}
                initial={reduce ? undefined : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                className="grid grid-cols-[1.4fr_1fr_auto] items-center"
              >
                <div className="px-4 py-3 text-[13px] font-semibold truncate">{row.label}</div>
                <div className="px-3 py-3">
                  {row.hasData ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden max-w-[100px]">
                        <motion.span
                          initial={reduce ? undefined : { scaleX: 0 }}
                          animate={{ scaleX: (row.score ?? 0) / 100 }}
                          transition={{ delay: 0.05 + 0.03 * i, duration: 0.5, ease: EASE }}
                          className="block h-full origin-left rounded-full"
                          style={{ background: TASK_STATUS_TONE[row.status!] }}
                        />
                      </div>
                      <span className="text-[12.5px] font-bold tabular-nums" style={{ color: TASK_STATUS_TONE[row.status!] }}>
                        {row.score}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-muted-foreground">—</span>
                  )}
                </div>
                <div className="px-3 py-3">
                  {row.status && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `color-mix(in srgb, ${TASK_STATUS_TONE[row.status]} 14%, transparent)`, color: TASK_STATUS_TONE[row.status] }}
                    >
                      {TASK_STATUS_LABEL[row.status]}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3.5 grid grid-cols-2 gap-2.5">
          {strongest && (
            <div className="flex items-center gap-2 rounded-xl bg-[hsl(142_55%_45%)]/10 px-3.5 py-2.5">
              <span className="h-8 w-8 rounded-full bg-[hsl(142_55%_45%)]/15 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] inline-flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Strongest Area</div>
                <div className="text-[12.5px] font-bold text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] truncate">{strongest.label}</div>
              </div>
            </div>
          )}
          {weakest && (
            <div className="flex items-center gap-2 rounded-xl bg-[hsl(0_78%_55%)]/10 px-3.5 py-2.5">
              <span className="h-8 w-8 rounded-full bg-[hsl(0_78%_55%)]/15 text-[hsl(0_78%_45%)] dark:text-[hsl(0_78%_70%)] inline-flex items-center justify-center shrink-0">
                <TriangleAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Needs Most Support</div>
                <div className="text-[12.5px] font-bold text-[hsl(0_78%_45%)] dark:text-[hsl(0_78%_70%)] truncate">{weakest.label}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}
