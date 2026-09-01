"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { TASK_CATEGORY_HUE, taskProblemAreaToSkills } from "@/lib/classTask";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Component 3 of the Task Engagement page — a static reference table tying
 * each task-engagement problem area to the underlying cognitive skills it
 * draws on. Mirrors ProblemAreasToSkills.tsx (the Behaviour page's Component 3). */
export function TaskProblemAreasToSkills() {
  const rows = useMemo(() => taskProblemAreaToSkills(), []);

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Problem areas to skills"
        className="rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        <header className="flex items-center gap-1.5 mb-4">
          <h2 className="font-heading font-extrabold text-[17px] uppercase tracking-wide">
            Problem Areas to Skills
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
            <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
              The underlying cognitive skills each task-engagement problem area draws on.
            </TooltipContent>
          </Tooltip>
        </header>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="grid grid-cols-[1fr_1.4fr] bg-muted/40 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <div className="px-4 py-2.5">Problem Area</div>
            <div className="px-4 py-2.5 border-l border-border/60">Skills</div>
          </div>
          <div className="divide-y divide-border/60">
            {rows.map((row) => (
              <div key={row.key} className="grid grid-cols-[1fr_1.4fr]">
                <div className="px-4 py-3 flex items-start gap-2">
                  <span
                    className="mt-1 h-2 w-2 rounded-full shrink-0"
                    style={{ background: TASK_CATEGORY_HUE[row.key] }}
                    aria-hidden
                  />
                  <span className="text-[13px] font-semibold leading-snug">{row.label}</span>
                </div>
                <div className="px-4 py-3 border-l border-border/60 text-[12.5px] text-foreground/80 leading-snug">
                  {row.skills.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
