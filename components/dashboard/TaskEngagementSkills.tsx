"use client";

import { Info } from "lucide-react";
import { TASK_AREA_ORDER, TASK_AREA_LABEL, TASK_AREA_DESCRIPTION, TASK_AREA_SKILLS } from "@/lib/classTask";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Component 3 of the Task Engagement page: a static reference table tying
 * each task-engagement area to the underlying cognitive skills it draws on
 * — real (a naming/taxonomy reference, not a derived score). */
export function TaskEngagementSkills() {
  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Task engagement to skills" className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="flex items-center gap-1.5 mb-1">
          <h2 className="font-heading font-extrabold text-[17px]">Task Engagement → Skills</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
              The underlying cognitive skills each task-engagement area draws on.
            </TooltipContent>
          </Tooltip>
        </header>
        <p className="text-[12px] text-muted-foreground mb-3">What&apos;s driving these areas</p>

        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-xl border border-border/60 min-w-[560px]">
            <div className="grid grid-cols-[1.1fr_1.6fr_2fr] bg-muted/40 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <div className="px-4 py-2.5">Task Engagement Area</div>
              <div className="px-4 py-2.5 border-l border-border/60">Description</div>
              <div className="px-4 py-2.5 border-l border-border/60">Key Skills Involved</div>
            </div>
            <div className="divide-y divide-border/60">
              {TASK_AREA_ORDER.map((key) => (
                <div key={key} className="grid grid-cols-[1.1fr_1.6fr_2fr]">
                  <div className="px-4 py-3 text-[12.5px] font-semibold leading-snug">{TASK_AREA_LABEL[key]}</div>
                  <div className="px-4 py-3 border-l border-border/60 text-[12px] text-foreground/80 leading-snug">
                    {TASK_AREA_DESCRIPTION[key]}
                  </div>
                  <div className="px-4 py-3 border-l border-border/60">
                    <div className="flex flex-wrap gap-1.5">
                      {TASK_AREA_SKILLS[key].map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10.5px] font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
