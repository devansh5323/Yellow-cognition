"use client";

import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  Gamepad2,
  Sparkle,
  Sparkles,
  User,
  Users,
  Users2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { BehaviorStrategy, StrategyKind } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const KIND_ICON: Record<StrategyKind, LucideIcon> = {
  "Whole Class": Users,
  "Small Group": Users2,
  Individual: User,
  Routine: Wand2,
  Game: Gamepad2,
};

const KIND_TONE: Record<StrategyKind, string> = {
  "Whole Class": "hsl(258 55% 60%)",
  "Small Group": "hsl(196 75% 50%)",
  Individual: "hsl(38 92% 48%)",
  Routine: "hsl(142 55% 42%)",
  Game: "hsl(340 75% 55%)",
};

function tryStrategy(strategy: BehaviorStrategy) {
  toast(strategy.title, { description: strategy.rationale });
}

export function BehaviorClassroomStrategies({
  strategies,
  triggerCounts,
}: {
  strategies: BehaviorStrategy[];
  triggerCounts: Record<string, number>;
}) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Classroom management strategies"
      className="premium-elevated rounded-[20px] p-5 md:p-6 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 100% 0%, hsl(38 92% 80% / 0.22), transparent 65%), radial-gradient(55% 45% at 0% 100%, hsl(258 70% 80% / 0.16), transparent 65%)",
        }}
      />

      <div className="relative">
        <header className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              aria-hidden
              className="relative h-8 w-8 rounded-xl inline-flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 22%, transparent), color-mix(in srgb, hsl(258 70% 70%) 18%, transparent))",
                boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.5), 0 6px 16px -10px hsl(38 92% 50% / 0.45)",
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-[16px] leading-tight">Yellow Recommends</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Classroom management strategies, connected to this week&apos;s real triggers.
              </p>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] shrink-0 mt-0.5"
            style={{
              color: "hsl(38 92% 38%)",
              background: "color-mix(in srgb, hsl(38 92% 60%) 14%, transparent)",
              border: "1px solid color-mix(in srgb, hsl(38 92% 55%) 28%, transparent)",
            }}
          >
            <Sparkle className="h-2.5 w-2.5" strokeWidth={2.4} />
            AI
          </span>
        </header>

        {strategies.length === 0 ? (
          <p className="text-[12px] text-muted-foreground mt-4">No strategies to suggest right now.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {strategies.map((strategy, i) => {
              const Icon = KIND_ICON[strategy.kind];
              const tone = KIND_TONE[strategy.kind];
              const matchedTrigger = strategy.triggers?.find((t) => triggerCounts[t] > 0);
              return (
                <motion.div
                  key={strategy.id}
                  initial={reduce ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.32, ease: EASE }}
                  className="rounded-xl border bg-background p-3.5 flex flex-col"
                  style={{ borderColor: `color-mix(in srgb, ${tone} 22%, var(--border))` }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 w-fit rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2.4} />
                    {strategy.kind}
                  </span>
                  <p className="mt-2 text-[12.5px] font-semibold leading-snug text-foreground/90">
                    {strategy.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{strategy.rationale}</p>

                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    {matchedTrigger ? (
                      <span className="text-[10px] font-bold text-primary">
                        Matches: {matchedTrigger} ({triggerCounts[matchedTrigger]}x this week)
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => tryStrategy(strategy)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 h-7 text-[10.5px] font-bold transition-colors shrink-0"
                      style={{ color: tone, background: `color-mix(in srgb, ${tone} 10%, transparent)` }}
                    >
                      <Wand2 className="h-3 w-3" />
                      Try strategy
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
