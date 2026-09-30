"use client";

import { CalendarRange, Info, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import {
  BEHAVIOR_STATUS_LABEL,
  BEHAVIOR_STATUS_TONE,
  type BehaviorSnapshotData,
  type BehaviorStatus,
} from "@/lib/classBehavior";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDecimal1 } from "@/lib/format";

const DISTRIBUTION_ORDER: BehaviorStatus[] = ["strong", "stable", "reinforcement", "support"];
const DISTRIBUTION_LABEL: Record<BehaviorStatus, string> = {
  strong: "Strong Regulation",
  stable: "Stable Behaviour",
  reinforcement: "Watch",
  support: "Needs Support",
};

/** Component 1 of the Classroom Behaviour & Regulation page: a quick,
 * single-glance read of overall discipline health. Real, sourced from each
 * student's cognitivePerformance.behaviourAndDiscipline score
 * (data/studentHealthScore.ts) and the latest weekly driver series — see
 * lib/classBehavior.ts's header for exactly what's real vs demo on this page. */
export function BehaviorSnapshot({ snapshot }: { snapshot: BehaviorSnapshotData }) {
  const hasData = snapshot.controlScore != null && snapshot.status != null && snapshot.distribution != null;

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Classroom behavior snapshot" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-extrabold text-[17px] uppercase tracking-wide">Classroom Behavior Snapshot</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                  A composite read of how well the class is regulating itself this period.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">Quick overview of your class discipline health</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 h-10 text-[12.5px] font-bold shrink-0">
            <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
            This Week
          </span>
        </header>

        {!hasData ? (
          <>
            <NotEnoughDataPanel title="Not enough data yet" description="We don't have real behaviour signal for this roster yet — check back once it's available." />
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {snapshot.total} student{snapshot.total === 1 ? "" : "s"} in this class
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-[52px] leading-none tabular-nums" style={{ color: BEHAVIOR_STATUS_TONE[snapshot.status!] }}>
                    {formatDecimal1(snapshot.controlScore!)}
                  </span>
                  <span className="text-[15px] text-muted-foreground font-bold">/100</span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shrink-0"
                  style={{ background: `color-mix(in srgb, ${BEHAVIOR_STATUS_TONE[snapshot.status!]} 14%, transparent)`, color: BEHAVIOR_STATUS_TONE[snapshot.status!] }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {BEHAVIOR_STATUS_LABEL[snapshot.status!]}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {snapshot.strongestDriver && (
                  <div className="flex items-center gap-2 rounded-xl bg-[hsl(142_55%_45%)]/10 px-3.5 py-2.5 flex-1 min-w-0">
                    <span className="h-8 w-8 rounded-full bg-[hsl(142_55%_45%)]/15 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] inline-flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Strongest Area</div>
                      <div className="text-[13px] font-bold text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)] truncate">{snapshot.strongestDriver.label}</div>
                    </div>
                  </div>
                )}
                {snapshot.weakestDriver && (
                  <div className="flex items-center gap-2 rounded-xl bg-[hsl(38_92%_50%)]/10 px-3.5 py-2.5 flex-1 min-w-0">
                    <span className="h-8 w-8 rounded-full bg-[hsl(38_92%_50%)]/15 text-[hsl(30_80%_38%)] dark:text-[hsl(38_92%_65%)] inline-flex items-center justify-center shrink-0">
                      <TriangleAlert className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Areas Needing Support</div>
                      <div className="text-[13px] font-bold text-[hsl(30_80%_38%)] dark:text-[hsl(38_92%_65%)] truncate">{snapshot.weakestDriver.label}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student distribution */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2">Student Distribution</div>
              <div className="flex rounded-xl overflow-hidden h-2.5">
                {DISTRIBUTION_ORDER.map((band) => {
                  const count = snapshot.distribution![band];
                  const pct = (count / Math.max(1, snapshot.total)) * 100;
                  if (pct <= 0) return null;
                  return <span key={band} style={{ width: `${pct}%`, background: BEHAVIOR_STATUS_TONE[band] }} />;
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                {DISTRIBUTION_ORDER.map((band) => {
                  const count = snapshot.distribution![band];
                  if (count <= 0) return null;
                  return (
                    <span key={band} className="inline-flex items-center gap-1.5 text-[11.5px]">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BEHAVIOR_STATUS_TONE[band] }} aria-hidden />
                      <span className="font-semibold text-foreground/85">{DISTRIBUTION_LABEL[band]}</span>
                      <span className="text-muted-foreground">{count} student{count === 1 ? "" : "s"}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </TooltipProvider>
  );
}
