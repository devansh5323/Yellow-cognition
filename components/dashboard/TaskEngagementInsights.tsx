"use client";

import { Lightbulb } from "lucide-react";
import { taskEngagementInsights, type TaskAreaStat } from "@/lib/classTask";

/** Component 4 of the Task Engagement page: why engagement may be breaking
 * — real, generated from which real task areas are below a healthy bar or
 * declining week over week (see lib/classTask.ts). */
export function TaskEngagementInsights({ breakdown }: { breakdown: TaskAreaStat[] }) {
  const insights = taskEngagementInsights(breakdown);

  return (
    <section aria-label="Task engagement insights" className="rounded-2xl border border-border bg-card p-5 md:p-6 h-full flex flex-col">
      <h2 className="font-heading font-extrabold text-[15px]">Task Engagement Insights</h2>
      <p className="text-[12px] text-muted-foreground mt-0.5 mb-3">Why engagement may be breaking</p>

      <ul className="space-y-2 flex-1">
        {insights.map((text, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-foreground/85">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-end">
        <Lightbulb className="h-6 w-6 text-amber-400/60" />
      </div>
    </section>
  );
}
