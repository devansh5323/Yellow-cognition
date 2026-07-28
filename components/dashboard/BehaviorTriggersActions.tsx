"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  Info,
  Shuffle,
  Sparkles,
  Sun,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { BEHAVIOR_TRIGGERS, type BehaviorTrigger, type TriggerSeverity } from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICONS: Record<BehaviorTrigger["iconKey"], LucideIcon> = {
  clock: Clock,
  users: Users,
  volume: Volume2,
  shuffle: Shuffle,
  sun: Sun,
};

const SEVERITY_TONE: Record<TriggerSeverity, { hue: string; label: string }> = {
  high: { hue: "hsl(0 78% 56%)", label: "High" },
  medium: { hue: "hsl(38 92% 48%)", label: "Medium" },
  low: { hue: "hsl(212 55% 45%)", label: "Low" },
};

/**
 * Tracks the grid's column count so we can group cards by row and toggle
 * an entire row's expanded state in lockstep — same pattern as the
 * Learning tab's skill-signal grid. Mirrors the Tailwind
 * `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` breakpoints.
 */
function useColumnCount(): number {
  const get = () => {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 768px)").matches) return 2;
    return 1;
  };
  const [cols, setCols] = useState<number>(get);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqMd = window.matchMedia("(min-width: 768px)");
    const handler = () => setCols(get());
    mqLg.addEventListener("change", handler);
    mqMd.addEventListener("change", handler);
    return () => {
      mqLg.removeEventListener("change", handler);
      mqMd.removeEventListener("change", handler);
    };
  }, []);
  return cols;
}

export function BehaviorTriggersActions({
  triggers = BEHAVIOR_TRIGGERS,
}: {
  triggers?: BehaviorTrigger[];
}) {
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
      aria-label="Behavior triggers, actions and underlying skills"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Triggers · actions · skills</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            What's setting off behaviour — and what it's really training
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Each trigger pairs with a low-effort action. Expand a card to see the underlying
            cognitive and social-emotional skills it taxes.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {triggers.map((trigger, i) => {
          const Icon = ICONS[trigger.iconKey];
          const sev = SEVERITY_TONE[trigger.severity];
          const rowIdx = Math.floor(i / cols);
          const open = openRows.has(rowIdx);
          const panelId = `trigger-skills-${trigger.id}`;
          return (
            <motion.div
              key={trigger.id}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.32, ease: EASE }}
              className="h-full flex flex-col rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-foreground/15"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${sev.hue} 12%, transparent)`,
                    color: sev.hue,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${sev.hue} 22%, transparent)`,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-foreground/90">
                      {trigger.label}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.10em]"
                      style={{
                        color: sev.hue,
                        background: `color-mix(in srgb, ${sev.hue} 12%, transparent)`,
                      }}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                    {trigger.detail}
                  </p>
                </div>
              </div>

              {/* AI insight — neutral, lightly-bordered "How to help" block
               * with a barely-there amber sheen so it reads as AI-sourced
               * without any loud color. `mt-auto` aligns the row across cards. */}
              <div className="mt-auto pt-2.5">
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
                    {trigger.action}
                  </p>
                </div>
              </div>

              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => toggleRow(rowIdx)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="group w-full -mx-1 px-1 py-1 inline-flex items-center justify-between gap-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-3 w-3" strokeWidth={2.4} />
                    {trigger.skills.length} impacting skills
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
                          {trigger.skills.map((skill) => (
                            <li key={skill.name}>
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[11.5px] font-semibold text-foreground/85 truncate">
                                  {skill.name}
                                </span>
                                <span
                                  className="font-heading font-extrabold tabular-nums text-[11.5px] leading-none shrink-0"
                                  style={{ color: sev.hue }}
                                >
                                  {skill.score}
                                </span>
                              </div>
                              <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                                <span
                                  className="block h-full rounded-full"
                                  style={{ width: `${skill.score}%`, background: sev.hue }}
                                  aria-label={`${skill.name} score ${skill.score}`}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                          Train these directly and the trigger loses its grip over time.
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
