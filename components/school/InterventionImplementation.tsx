"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertOctagon,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Layers,
  ListChecks,
  MinusCircle,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  interventionImplementationSummary,
  bestRespondingGrades,
  schoolCapacityIndicators,
} from "@/lib/schoolData";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type RateTile = { label: string; value: number; Icon: LucideIcon; tone: string; description: string };

export function InterventionImplementation() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const summary = useMemo(() => interventionImplementationSummary(), []);
  const capacity = useMemo(() => schoolCapacityIndicators(), []);
  const bestGrades = useMemo(() => bestRespondingGrades().slice(0, 3), []);

  const rateTiles: RateTile[] = [
    {
      label: "Implementation rate",
      value: summary.implementationRate,
      Icon: ListChecks,
      tone: "hsl(212 90% 58%)",
      description: "Share of this period's due follow-ups actually completed.",
    },
    {
      label: "Follow-up completion rate",
      value: summary.followUpCompletionRate,
      Icon: CheckCircle2,
      tone: "hsl(142 55% 45%)",
      description: "Classrooms with at-risk students whose teacher has checked in.",
    },
    {
      label: "Response-to-intervention rate",
      value: summary.responseToInterventionRate,
      Icon: TrendingUp,
      tone: "hsl(262 60% 62%)",
      description: "Of students actively followed up on, share showing improvement.",
    },
  ];

  const l1Tiles: { label: string; value: number | string; Icon: LucideIcon; tone: string }[] = [
    { label: "Active interventions", value: summary.activeInterventions, Icon: ClipboardList, tone: "hsl(212 90% 58%)" },
    { label: "Follow-ups due", value: summary.followUpsDueStudents, Icon: CalendarClock, tone: "hsl(38 92% 48%)" },
    { label: "Overdue follow-ups", value: summary.overdueFollowUps, Icon: AlertOctagon, tone: "hsl(0 78% 58%)" },
    { label: "Showing improvement", value: summary.showingImprovement, Icon: TrendingUp, tone: "hsl(142 55% 42%)" },
    { label: "Showing no change", value: summary.showingNoChange, Icon: MinusCircle, tone: "hsl(28 88% 54%)" },
    { label: "Escalated cases", value: summary.escalatedCases, Icon: AlertOctagon, tone: "hsl(0 78% 58%)" },
    { label: "Support-team involvement", value: `${summary.supportTeamInvolvement} teachers`, Icon: UserCog, tone: "hsl(262 60% 62%)" },
    { label: "Tier 2 / Tier 3 caseload", value: `${capacity.tier2Used} / ${capacity.tier3Used}`, Icon: Layers, tone: "hsl(38 92% 48%)" },
  ];

  const tierTiles: { label: string; rate: number; used: number; overdue: number; tone: string }[] = [
    {
      label: "Tier 2 · Targeted Support",
      rate: capacity.tier2ImplementationRate,
      used: capacity.tier2Used,
      overdue: capacity.reviewsOverdueTier2,
      tone: "hsl(38 92% 48%)",
    },
    {
      label: "Tier 3 · Intensive Support",
      rate: capacity.tier3ImplementationRate,
      used: capacity.tier3Used,
      overdue: capacity.reviewsOverdueTier3,
      tone: "hsl(0 78% 55%)",
    },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="Intervention Implementation"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Accountability</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Intervention Implementation
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Whether school supports are being implemented and reviewed.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
          />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rateTiles.map((tile) => (
                  <div key={tile.label} className="rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
                        style={{ background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`, color: tile.tone }}
                      >
                        <tile.Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="text-[11px] font-bold text-foreground/80 leading-tight">{tile.label}</div>
                    </div>
                    <div className="font-heading font-black text-[28px] tabular-nums leading-none" style={{ color: tile.tone }}>
                      {tile.value}%
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted/60 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, tile.value)}%`, background: tile.tone }}
                      />
                    </div>
                    <p className="text-[10.5px] text-muted-foreground leading-snug mt-2">{tile.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
                    <BarChart3 className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <h3 className="font-heading font-bold text-[13px]">Implementation at a glance</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {l1Tiles.map((tile) => (
                    <div key={tile.label} className="rounded-lg border border-border/60 p-3">
                      <span
                        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 mb-2"
                        style={{ background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`, color: tile.tone }}
                      >
                        <tile.Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </span>
                      <div className="font-heading font-extrabold text-[16px] tabular-nums leading-none">
                        {tile.value}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground leading-snug mt-1">{tile.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
                    <Layers className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <h3 className="font-heading font-bold text-[13px]">Implementation by tier</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tierTiles.map((tile) => (
                    <div key={tile.label} className="rounded-lg border border-border/60 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-foreground/80">{tile.label}</span>
                        <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: tile.tone }}>
                          {tile.rate}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, tile.rate)}%`, background: tile.tone }}
                        />
                      </div>
                      <p className="text-[10.5px] text-muted-foreground leading-snug mt-1.5">
                        {tile.overdue} of {tile.used} students overdue for review
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-heading font-bold text-[13px]">Most commonly used interventions</h3>
                  </div>
                  <button type="button" onClick={() => comingSoon("Intervention-type tracking")} className="w-full text-left">
                    <div className="font-heading font-extrabold text-[15px] text-muted-foreground">Coming soon</div>
                    <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
                      Requires a per-intervention-type log at school scale, which isn&apos;t tracked yet.
                    </p>
                  </button>

                  <div className="pt-3 border-t border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="font-heading font-bold text-[13px]">Average days to review</h3>
                    </div>
                    <button type="button" onClick={() => comingSoon("Review-date tracking")} className="w-full text-left">
                      <div className="font-heading font-extrabold text-[15px] text-muted-foreground">Coming soon</div>
                      <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
                        Requires referral and review timestamps, which aren&apos;t logged at school scale yet.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Trophy className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-heading font-bold text-[13px]">Best-responding grades</h3>
                  </div>
                  {bestGrades.length === 0 ? (
                    <p className="text-[11.5px] text-muted-foreground">Not enough followed-up cases yet to rank.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {bestGrades.map((g, i) => (
                        <li key={g.grade} className="flex items-center justify-between gap-2 text-[12px]">
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <span className="h-5 w-5 rounded-full inline-flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="font-semibold truncate">{g.gradeLabel}</span>
                          </span>
                          <span className="tabular-nums font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                            {g.responseRate}%{" "}
                            <span className="text-muted-foreground font-medium">
                              ({g.respondingCount}/{g.totalFollowedUp})
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2.5 pt-2 border-t border-emerald-500/20">
                    Ranked by real response rate among followed-up cases — the closest honest measure
                    available without per-intervention-type logging.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug">
                Focused on operational accountability — implementation and follow-up rates, not
                individual case details.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
