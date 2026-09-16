"use client";

import { CalendarRange, Info, Users } from "lucide-react";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BehaviorSnapshotData } from "@/lib/classBehavior";

/** Component 1 of the Classroom Behaviour & Regulation page: a quick,
 * single-glance read of overall discipline health. No real per-student
 * behaviour signal exists yet for this roster (controlScore/status are
 * always null), so this shows an honest empty state instead of a
 * fabricated score ring or "Strong"/"Stable" headline — while still
 * surfacing the one real number available, the roster size. */
export function BehaviorSnapshot({ snapshot }: { snapshot: BehaviorSnapshotData }) {
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

        <NotEnoughDataPanel
          title="Not enough data yet"
          description="We don't have real behaviour signal for this roster yet — check back once it's available."
        />

        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {snapshot.total} student{snapshot.total === 1 ? "" : "s"} in this class
        </div>
      </section>
    </TooltipProvider>
  );
}
