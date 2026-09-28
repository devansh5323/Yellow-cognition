"use client";

import { BookOpen, Brain, Info, Lightbulb, Puzzle, Search, Sparkles, type LucideIcon } from "lucide-react";
import {
  READINESS_STATUS_LABEL,
  READINESS_STATUS_TONE,
  readinessStatusFromScore,
  type LearningAreaKey,
  type LearningAreaStat,
} from "@/lib/classLearning";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";

const AREA_ICON: Record<LearningAreaKey, LucideIcon> = {
  problemSolving: Puzzle,
  reasoning: Brain,
  creativeExpression: Sparkles,
  readingComprehension: BookOpen,
  recallRetention: Lightbulb,
  curiosityExploration: Search,
};

/** Component 3: "Learning Skill Signals" — real, compact reuse of
 * lib/classLearning.ts's classLearningAreas() (the same data the existing
 * /learning-readiness page shows), just a smaller row layout for this page. */
export function LearningSkillSignalsRow({ areas }: { areas: LearningAreaStat[] }) {
  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Learning skill signals" className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="font-heading font-extrabold text-[15px]">Learning Skill Signals</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
              Real-time insights from learning-readiness signals supported by gameplay data.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-[11.5px] text-muted-foreground mb-3">Real-time insights from learning areas supported by gameplay data.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {areas.map((area) => {
            const Icon = AREA_ICON[area.key];
            const status = area.score != null ? readinessStatusFromScore(area.score) : null;
            const tone = status ? READINESS_STATUS_TONE[status] : "var(--muted-foreground)";
            return (
              <div key={area.key} className="rounded-xl border border-border/60 bg-background/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-bold text-foreground/85 leading-tight">{area.label}</span>
                </div>
                <div className="mt-2">
                  {area.score != null ? (
                    <>
                      <span className="font-heading font-extrabold text-[22px] tabular-nums leading-none" style={{ color: tone }}>
                        {area.score}
                      </span>
                      {status && (
                        <span
                          className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                        >
                          {READINESS_STATUS_LABEL[status]}
                        </span>
                      )}
                    </>
                  ) : (
                    <NotEnoughData />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}
