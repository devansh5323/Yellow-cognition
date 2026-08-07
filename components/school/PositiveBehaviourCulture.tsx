"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  Mail,
  Megaphone,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  gradesWithStrongRecognition,
  schoolCelebrationOpportunities,
  schoolHealthOverview,
} from "@/lib/schoolData";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const RECOGNITION_LIMIT = 3;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type QuickAction = { key: string; label: string; Icon: LucideIcon; tone: string };

const QUICK_ACTIONS: QuickAction[] = [
  { key: "celebrate", label: "Celebrate a grade or class", Icon: PartyPopper, tone: "hsl(142 55% 42%)" },
  { key: "staff-update", label: "Share a positive staff update", Icon: Megaphone, tone: "hsl(212 90% 58%)" },
  { key: "parent-comm", label: "Generate parent communication", Icon: Mail, tone: "hsl(262 60% 62%)" },
  { key: "campaign", label: "Launch an expectation-focused campaign", Icon: Sparkles, tone: "hsl(38 92% 48%)" },
];

export function PositiveBehaviourCulture() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const positiveBehaviorDriver = useMemo(
    () => schoolHealthOverview().drivers.find((d) => d.key === "positiveBehavior") ?? null,
    [],
  );
  const strongGrades = useMemo(() => gradesWithStrongRecognition(), []);
  const celebrations = useMemo(() => schoolCelebrationOpportunities(), []);
  const topGrades = strongGrades.slice(0, RECOGNITION_LIMIT);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="Positive Behaviour Culture"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Positive Behaviour</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Positive Behaviour Culture
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Monitor how consistently positive behaviour is being recognised across the school.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-4 border-t border-border/60 space-y-4">
              {/* Total positive acknowledgements — no acknowledgement log exists yet;
                  the Positive Behaviour driver score is the closest real signal available. */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                    <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <h3 className="font-heading font-bold text-[13px]">Total positive acknowledgements</h3>
                </div>
                <button type="button" onClick={() => comingSoon("Acknowledgement tracking")} className="w-full text-left">
                  <div className="font-heading font-extrabold text-[15px] text-muted-foreground">Coming soon</div>
                  <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
                    Requires a PBIS acknowledgement log at school scale, which isn&apos;t tracked yet.
                    {positiveBehaviorDriver && (
                      <>
                        {" "}
                        The closest available signal is the school&apos;s Positive Behaviour driver score:{" "}
                        <span className="font-bold text-foreground/80">
                          {positiveBehaviorDriver.score}%
                        </span>{" "}
                        ({positiveBehaviorDriver.delta >= 0 ? "+" : ""}
                        {positiveBehaviorDriver.delta} this week).
                      </>
                    )}
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-heading font-bold text-[13px]">
                      Most frequently demonstrated PBIS expectations
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => comingSoon("PBIS expectation tracking")}
                    className="w-full text-left"
                  >
                    <div className="font-heading font-extrabold text-[15px] text-muted-foreground">Coming soon</div>
                    <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
                      Requires expectations tagged on each acknowledgement, which isn&apos;t tracked yet.
                    </p>
                  </button>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Trophy className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-heading font-bold text-[13px]">Grades with strong recognition</h3>
                  </div>
                  {topGrades.length === 0 ? (
                    <p className="text-[11.5px] text-muted-foreground">
                      No grade&apos;s behaviour driver is currently in the healthy range.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {topGrades.map((g, i) => (
                        <li key={g.grade} className="flex items-center justify-between gap-2 text-[12px]">
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <span className="h-5 w-5 rounded-full inline-flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="font-semibold truncate">{g.gradeLabel}</span>
                          </span>
                          <span className="tabular-nums font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                            {g.behaviorScore}%{" "}
                            <span className="text-muted-foreground font-medium">
                              ({g.delta >= 0 ? "↑" : "↓"} {Math.abs(g.delta)} this week)
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2.5 pt-2 border-t border-emerald-500/20">
                    Ranked by real Behaviour &amp; Discipline driver score — the closest honest measure
                    available without a per-acknowledgement log.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-amber-500/12 text-amber-600 dark:text-amber-400">
                    <PartyPopper className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <h3 className="font-heading font-bold text-[13px]">School celebration opportunities</h3>
                </div>
                {celebrations.length === 0 ? (
                  <p className="text-[11.5px] text-muted-foreground">No celebration-worthy events this period.</p>
                ) : (
                  <ul className="space-y-2">
                    {celebrations.map((event) => (
                      <li key={event.id} className="rounded-lg border border-border/60 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-heading font-bold text-[12.5px] leading-tight">{event.title}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{event.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{event.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="text-[11.5px] font-bold text-muted-foreground mb-2.5">Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => comingSoon(action.label)}
                      className="rounded-xl border border-border/60 bg-background/50 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/30"
                    >
                      <span
                        className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 mb-2"
                        style={{ background: `color-mix(in srgb, ${action.tone} 14%, transparent)`, color: action.tone }}
                      >
                        <action.Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="text-[11.5px] font-bold leading-snug">{action.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
