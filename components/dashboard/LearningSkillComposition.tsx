"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Lightbulb,
  Puzzle,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  LEARNING_AREA_HUE,
  LEARNING_AREA_LABEL,
  learningAreaSkillComposition,
  type LearningAreaKey,
} from "@/lib/classLearning";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const AREA_ICON: Record<LearningAreaKey, LucideIcon> = {
  problemSolving: Puzzle,
  reasoning: Brain,
  creativeExpression: Sparkles,
  readingComprehension: BookOpen,
  recallRetention: Lightbulb,
  curiosityExploration: Search,
};

const AREA_ORDER: LearningAreaKey[] = [
  "problemSolving",
  "reasoning",
  "creativeExpression",
  "readingComprehension",
  "recallRetention",
  "curiosityExploration",
];

export function LearningSkillComposition() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Skill composition by area"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Skill composition by area</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          See which underlying skills are stronger or weaker within each area
        </h3>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {AREA_ORDER.map((key, i) => {
          const hue = LEARNING_AREA_HUE[key];
          const Icon = AREA_ICON[key];
          const skills = learningAreaSkillComposition(key);
          return (
            <motion.div
              key={key}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
              className="rounded-xl border border-border/60 bg-background/60 p-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${hue} 14%, transparent)`, color: hue }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span className="font-heading font-bold text-[13.5px] leading-tight">
                  {LEARNING_AREA_LABEL[key]}
                </span>
              </div>

              <ul className="mt-3.5 space-y-2.5">
                {skills.map((skill) => (
                  <li key={skill.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-foreground/85 truncate">
                        {skill.name}
                      </span>
                      <span
                        className="font-heading font-extrabold tabular-nums text-[11.5px] leading-none shrink-0"
                        style={{ color: hue }}
                      >
                        {skill.score}
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${skill.score}%`, background: hue }}
                        aria-label={`${skill.name} score ${skill.score}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
