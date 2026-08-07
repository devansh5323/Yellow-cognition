"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getSchoolClasses,
  schoolDriverCards,
  type SchoolDriverCard,
} from "@/lib/schoolData";
import { SCORE_BANDS, type PillarKey, type ScoreBand } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DRIVER_ICON: Record<PillarKey, LucideIcon> = {
  focus: Target,
  academic: BookOpen,
  behavior: Shield,
  task: BarChart3,
};

// Same tones as the teacher dashboard's pillar cards, so a driver reads as
// the same color everywhere in the app.
const DRIVER_TONE: Record<PillarKey, string> = {
  focus: "hsl(212 90% 58%)",
  academic: "hsl(142 55% 45%)",
  behavior: "hsl(262 60% 62%)",
  task: "hsl(28 88% 54%)",
};

const STATUS_TONE: Record<ScoreBand, string> = {
  excellent: "hsl(212 90% 58%)",
  stable: "hsl(142 55% 45%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(0 78% 58%)",
};

const STATUS_LABEL: Record<ScoreBand, string> = {
  excellent: "Excellent",
  stable: "Stable",
  watch: "Watch",
  "needs-support": "Needs Support",
};

const COVERAGE_TONE: Record<string, string> = {
  "High coverage": "hsl(142 55% 42%)",
  "Moderate coverage": "hsl(38 92% 45%)",
  "Low coverage": "hsl(0 78% 55%)",
};

export function SchoolHealthDriverCards() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  const cards = useMemo(() => schoolDriverCards(), []);
  const [activeKey, setActiveKey] = useState<PillarKey | null>(null);
  const active = cards.find((c) => c.key === activeKey) ?? null;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="School Health Driver Cards"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Drivers</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            School Health Driver Cards
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            These cards explain what is shaping overall School Health.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
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
            <div className="pt-5 mt-4 border-t border-border/60">
              <div className="flex items-center justify-end mb-4">
                <Link
                  href="/school/classes"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 backdrop-blur px-3.5 h-8 text-[11.5px] font-bold text-foreground/80 hover:text-foreground hover:border-foreground/20 transition-colors shrink-0"
                >
                  View all driver details
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((card) => (
                  <DriverCard key={card.key} card={card} onViewDetails={() => setActiveKey(card.key)} />
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-3.5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-foreground/85 leading-snug">
                    <span className="font-bold">Tip:</span> Focus first on Watch and Needs Support areas.
                    Small, targeted actions create the biggest impact.
                  </p>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-primary hover:underline shrink-0"
                    >
                      How scores are calculated
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={8}
                    className="w-[300px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
                  >
                    <h4 className="font-heading font-extrabold text-[14px]">Status bands</h4>
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-snug">
                      Each driver score is a class-size-weighted average across every connected
                      classroom.
                    </p>
                    <ul className="mt-2.5 space-y-1.5">
                      {SCORE_BANDS.map((b) => (
                        <li key={b.band} className="flex items-center justify-between text-[11.5px]">
                          <span className="text-muted-foreground">{b.tag}</span>
                          <span className="tabular-nums text-foreground/80">{b.range}</span>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DriverDetailDrawer card={active} onOpenChange={(o) => !o && setActiveKey(null)} />
    </motion.section>
  );
}

function DriverCard({
  card,
  onViewDetails,
}: {
  card: SchoolDriverCard;
  onViewDetails: () => void;
}) {
  const Icon = DRIVER_ICON[card.key];
  const tone = DRIVER_TONE[card.key];
  const statusTone = STATUS_TONE[card.status];

  return (
    <div
      className="group relative rounded-2xl border bg-background p-4 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.04] overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${tone} 22%, var(--border))` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: tone }}
        aria-hidden
      />

      <div className="flex items-center gap-2.5">
        <span
          className="h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <h3 className="font-heading font-bold text-[13.5px] leading-tight">{card.label}</h3>
      </div>

      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
        <span className="font-heading font-extrabold text-[28px] tabular-nums leading-none" style={{ color: tone }}>
          {card.score}
          <span className="text-[13px] font-bold text-muted-foreground/70">/100</span>
        </span>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: `color-mix(in srgb, ${statusTone} 14%, transparent)`, color: statusTone }}
        >
          {STATUS_LABEL[card.status]}
        </span>
      </div>
      <div
        className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums mt-1"
        style={{ color: card.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
      >
        {card.delta >= 0 ? "↑" : "↓"} {Math.abs(card.delta)}% from last week
      </div>

      <div className="mt-3.5 pt-3.5 border-t border-border/60">
        <div className="text-[11px] text-foreground/80">
          Coverage: {card.coverageUsed}/{card.coverageTotal} classrooms
        </div>
        <div className="text-[10.5px] text-muted-foreground mt-1">{card.coveragePct}% coverage</div>
        <div
          className="inline-flex items-center gap-1 text-[10px] font-bold mt-0.5"
          style={{ color: COVERAGE_TONE[card.coverageLabel] }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: COVERAGE_TONE[card.coverageLabel] }} />
          {card.coverageLabel}
        </div>
      </div>

      <button
        type="button"
        onClick={onViewDetails}
        className="mt-3.5 pt-3 border-t border-border/60 inline-flex items-center justify-center gap-1 text-[12px] font-bold rounded-lg py-1.5 transition-colors hover:bg-muted/50"
        style={{ color: tone }}
      >
        View details
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function classroomInitials(name: string): string {
  const match = name.match(/Grade\s+([^\s]+)\s*·\s*([A-Za-z])/);
  return match ? `${match[1]}${match[2]}`.toUpperCase().slice(0, 3) : name.slice(0, 2).toUpperCase();
}

function DriverDetailDrawer({
  card,
  onOpenChange,
}: {
  card: SchoolDriverCard | null;
  onOpenChange: (open: boolean) => void;
}) {
  const classes = useMemo(() => getSchoolClasses(), []);
  const tone = card ? DRIVER_TONE[card.key] : "";
  const affected = card ? classes.filter((c) => card.affectedClassIds.includes(c.id)) : [];

  return (
    <Sheet open={!!card} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {card && (
          <>
            <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
              <SheetTitle className="font-heading font-extrabold text-[16px]">
                {card.label} — classrooms needing attention
              </SheetTitle>
              <SheetDescription className="text-[12px]">
                {affected.length === 0
                  ? "No classrooms are currently below the healthy threshold for this driver."
                  : `${affected.length} classroom${affected.length === 1 ? "" : "s"} scoring below 65 on ${card.label}.`}
              </SheetDescription>
            </SheetHeader>

            <div className="p-5 space-y-4">
              <p className="text-[12.5px] leading-snug text-foreground/85">{card.pattern}</p>

              {affected.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">No classrooms match this segment.</p>
              ) : (
                <ul className="space-y-1">
                  {affected.map((c) => (
                    <li key={c.id}>
                      <Link
                        href="/school/classes"
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
                      >
                        <span
                          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 text-[11px] font-bold"
                          style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
                        >
                          {classroomInitials(c.name)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{c.teacherName}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-heading font-bold text-[13px] tabular-nums" style={{ color: tone }}>
                            {c.drivers[card.key]}
                          </div>
                          <div className="text-[9.5px] text-muted-foreground uppercase tracking-wide">score</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
