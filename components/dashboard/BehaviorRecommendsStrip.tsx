"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ListChecks,
  Sparkle,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  DISRUPTION_HUE,
  DISRUPTION_LABEL,
  type BehaviorStrategy,
  type StrategyKind,
} from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const KIND_TONE: Record<StrategyKind, string> = {
  "Whole Class": "hsl(258 55% 60%)",
  "Small Group": "hsl(196 75% 50%)",
  Individual: "hsl(38 92% 52%)",
  Routine: "hsl(142 55% 46%)",
};

const KIND_ICON: Record<StrategyKind, LucideIcon> = {
  "Whole Class": Users,
  "Small Group": ListChecks,
  Individual: User,
  Routine: Sparkles,
};

export function BehaviorRecommendsStrip({ strategies }: { strategies: BehaviorStrategy[] }) {
  const reduce = useReducedMotion();
  const relevance = useMemo(() => Math.min(96, 82 + strategies.length * 3), [strategies.length]);

  return (
    <section
      aria-label="Yellow Recommends — Behavior"
      className="premium-elevated h-full rounded-[20px] p-5 md:p-6 relative overflow-hidden flex flex-col"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 100% 0%, hsl(38 92% 80% / 0.22), transparent 65%), radial-gradient(55% 45% at 0% 100%, hsl(258 70% 80% / 0.16), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col flex-1">
        <header className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              aria-hidden
              className="relative h-8 w-8 rounded-xl inline-flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 22%, transparent), color-mix(in srgb, hsl(258 70% 70%) 18%, transparent))",
                boxShadow:
                  "inset 0 1px 0 0 hsl(0 0% 100% / 0.5), 0 6px 16px -10px hsl(38 92% 50% / 0.45)",
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-[16px] leading-tight">
                Yellow Recommends
              </h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Classroom-management strategies
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

        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span>Relevance</span>
            <span className="tabular-nums">{relevance}%</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.span
              initial={reduce ? undefined : { scaleX: 0 }}
              animate={{ scaleX: relevance / 100 }}
              transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
              className="block h-full origin-left rounded-full"
              style={{
                width: "100%",
                background:
                  "linear-gradient(90deg, hsl(38 92% 55%), hsl(38 92% 50%) 60%, hsl(142 55% 46%))",
              }}
              aria-label={`Relevance ${relevance}%`}
            />
          </div>
        </div>

        <ul className="mt-4 -mx-2 flex-1 space-y-0.5">
          {strategies.map((s, i) => {
            const tone = KIND_TONE[s.kind];
            const Icon = KIND_ICON[s.kind];
            return (
              <motion.li
                key={s.id}
                initial={reduce ? undefined : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1, duration: 0.32, ease: EASE }}
                className="group rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/35 flex items-start gap-2.5"
              >
                <span
                  aria-hidden
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                    color: tone,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 22%, transparent)`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.10em]"
                      style={{
                        color: tone,
                        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
                      }}
                    >
                      {s.kind}
                    </span>
                    {s.durationMins > 0 && (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {s.durationMins} min
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12.5px] font-semibold leading-snug text-foreground/90">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {s.rationale}
                  </p>
                  {s.targets.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.targets.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold"
                          style={{
                            color: DISRUPTION_HUE[t],
                            background: `color-mix(in srgb, ${DISRUPTION_HUE[t]} 10%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${DISRUPTION_HUE[t]} 22%, transparent)`,
                          }}
                        >
                          {DISRUPTION_LABEL[t]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ArrowUpRight
                  aria-hidden
                  className={cn(
                    "h-3.5 w-3.5 mt-1 shrink-0 text-muted-foreground/70",
                    "opacity-0 -translate-x-1 transition-all duration-200",
                    "group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100",
                  )}
                />
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
