"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Info } from "lucide-react";
import { behaviorInfluencingSkills } from "@/lib/classBehavior";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function toneFor(score: number): string {
  if (score >= 70) return "hsl(142 55% 42%)";
  if (score >= 50) return "hsl(38 92% 48%)";
  return "hsl(0 78% 55%)";
}

/** Component 4 of the Classroom Behaviour & Regulation page: which
 * underlying executive-function/regulation skills may be influencing the
 * disruption patterns above. Demo — seeded off the real driver scores
 * (see lib/classBehavior.ts), not an independently tracked measurement. */
export function BehaviorSkillsInfluencing() {
  const reduce = useReducedMotion();
  const skills = useMemo(() => behaviorInfluencingSkills(), []);
  const left = skills.slice(0, 4);
  const right = skills.slice(4);

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Skills influencing behaviour" className="rounded-2xl border border-border bg-card p-5 md:p-6 h-full flex flex-col">
        <header className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 inline-flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-extrabold text-[17px]">Skills Influencing Behaviour</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
                    These skills may be influencing how students respond, transition, wait, and participate during class.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">Estimated from related disruption patterns.</p>
            </div>
          </div>
          <DemoDataBadge />
        </header>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[left, right].map((col, colIdx) => (
            <ul key={colIdx} className="space-y-3">
              {col.map((skill, i) => (
                <SkillRow key={skill.key} skill={skill} index={colIdx * left.length + i} reduce={!!reduce} />
              ))}
            </ul>
          ))}
        </div>
      </section>
    </TooltipProvider>
  );
}

function SkillRow({ skill, index, reduce }: { skill: { key: string; label: string; score: number }; index: number; reduce: boolean }) {
  const tone = toneFor(skill.score);
  return (
    <li className="flex items-center gap-2.5">
      <span className="w-[128px] shrink-0 text-[12px] font-semibold text-foreground/85 truncate">{skill.label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.span
          initial={reduce ? undefined : { scaleX: 0 }}
          animate={{ scaleX: skill.score / 100 }}
          transition={{ delay: 0.03 * index, duration: 0.5, ease: EASE }}
          className="block h-full origin-left rounded-full"
          style={{ background: tone }}
        />
      </div>
      <span className="w-8 shrink-0 text-[12px] font-bold tabular-nums text-right" style={{ color: tone }}>
        {skill.score}
      </span>
    </li>
  );
}
