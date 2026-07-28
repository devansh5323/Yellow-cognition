"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  Flag,
  Info,
  ListChecks,
  ListOrdered,
  Scale,
  Sparkle,
  Sparkles,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TaskInsight, TaskInsightTone } from "@/lib/classTask";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICONS: Record<TaskInsight["iconKey"], LucideIcon> = {
  list: ListOrdered,
  timer: Timer,
  flag: Flag,
  scale: Scale,
  users: Users,
  spark: Sparkle,
  checks: ListChecks,
};

const TONE: Record<TaskInsightTone, { hue: string; label: string; bg: string }> = {
  warning: {
    hue: "hsl(0 78% 56%)",
    label: "Action needed",
    bg: "color-mix(in srgb, hsl(0 78% 60%) 8%, transparent)",
  },
  watch: {
    hue: "hsl(38 92% 48%)",
    label: "Watch",
    bg: "color-mix(in srgb, hsl(38 92% 60%) 8%, transparent)",
  },
  info: {
    hue: "hsl(212 55% 50%)",
    label: "Pattern",
    bg: "color-mix(in srgb, hsl(212 60% 60%) 8%, transparent)",
  },
  positive: {
    hue: "hsl(142 55% 42%)",
    label: "Strength",
    bg: "color-mix(in srgb, hsl(142 55% 50%) 8%, transparent)",
  },
};

/**
 * Tracks the grid's column count so we can group cards by row and toggle
 * an entire row's expanded state in lockstep — same pattern as the Behaviour
 * tab. Mirrors the Tailwind `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
 * breakpoints.
 */
function useColumnCount(): number {
  const get = () => {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia("(min-width: 1280px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  };
  const [cols, setCols] = useState<number>(get);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqXl = window.matchMedia("(min-width: 1280px)");
    const mqMd = window.matchMedia("(min-width: 768px)");
    const handler = () => setCols(get());
    mqXl.addEventListener("change", handler);
    mqMd.addEventListener("change", handler);
    return () => {
      mqXl.removeEventListener("change", handler);
      mqMd.removeEventListener("change", handler);
    };
  }, []);
  return cols;
}

export function TaskInsights({ insights }: { insights: TaskInsight[] }) {
  const reduce = useReducedMotion();
  const cols = useColumnCount();
  const [openRows, setOpenRows] = useState<Set<number>>(() => new Set());

  const toggleRow = (rowIdx: number) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIdx)) next.delete(rowIdx);
      else next.add(rowIdx);
      return next;
    });
  };

  return (
    <section
      aria-label="Task engagement insights and underlying skills"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Patterns · actions · skills</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            What's slowing the class on tasks — and what it's really training
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Plain-language reads on engagement, paired with what to try. Expand a card to see the
            underlying cognitive skills it taxes.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map((insight, i) => {
          const Icon = ICONS[insight.iconKey];
          const tone = TONE[insight.tone];
          const rowIdx = Math.floor(i / cols);
          const open = openRows.has(rowIdx);
          const panelId = `task-insight-skills-${insight.id}`;
          return (
            <motion.div
              key={insight.id}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
              className="h-full flex flex-col rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-foreground/15"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
                  style={{
                    background: tone.bg,
                    color: tone.hue,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone.hue} 22%, transparent)`,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.10em]"
                    style={{
                      color: tone.hue,
                      background: `color-mix(in srgb, ${tone.hue} 12%, transparent)`,
                    }}
                  >
                    {tone.label}
                  </span>
                  {/* `min-h-[2lh]` reserves two lines of space so the
                   * "How to help" box below aligns across cards in the same
                   * row regardless of whether the title runs 1 or 2 lines. */}
                  <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground/90 min-h-[2lh]">
                    {insight.title}
                  </p>
                </div>
              </div>

              {/* AI insight — subtle bordered block with a barely-there amber
               * sheen, so the recommendation reads as AI-sourced, not body copy. */}
              <div className="mt-2.5">
                <div
                  className="rounded-lg border border-border/60 px-2.5 py-1.5"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(46 96% 60% / 0.06), transparent 55%), color-mix(in srgb, var(--muted) 22%, transparent)",
                  }}
                >
                  <div className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                    <Sparkles className="h-2.5 w-2.5" strokeWidth={2.4} aria-hidden />
                    How to help
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-foreground/85">
                    {insight.detail}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-2.5">
                <button
                  type="button"
                  onClick={() => toggleRow(rowIdx)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="group w-full -mx-1 px-1 py-1 inline-flex items-center justify-between gap-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-3 w-3" strokeWidth={2.4} />
                    {insight.skills.length} impacting skills
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 opacity-60 transition-transform duration-200",
                      open && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="panel"
                      id={panelId}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-border/70">
                        <ul className="space-y-2">
                          {insight.skills.map((skill) => (
                            <li key={skill.name}>
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[11.5px] font-semibold text-foreground/85 truncate">
                                  {skill.name}
                                </span>
                                <span
                                  className="font-heading font-extrabold tabular-nums text-[11.5px] leading-none shrink-0"
                                  style={{ color: tone.hue }}
                                >
                                  {skill.score}
                                </span>
                              </div>
                              <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                                <span
                                  className="block h-full rounded-full"
                                  style={{ width: `${skill.score}%`, background: tone.hue }}
                                  aria-label={`${skill.name} score ${skill.score}`}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                          Train these directly and the pattern eases over time.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
