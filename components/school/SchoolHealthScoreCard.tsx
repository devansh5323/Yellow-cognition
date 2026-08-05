"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  HeartHandshake,
  Info,
  School,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { schoolHealthOverview, type SchoolDriverKey } from "@/lib/schoolData";
import { SCORE_BANDS, type ScoreBand } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STATUS_TONE: Record<ScoreBand, string> = {
  excellent: "hsl(142 55% 45%)",
  stable: "hsl(38 92% 48%)",
  watch: "hsl(28 88% 54%)",
  "needs-support": "hsl(0 78% 58%)",
};

const STATUS_LABEL: Record<ScoreBand, string> = {
  excellent: "Excellent",
  stable: "Stable",
  watch: "Watch",
  "needs-support": "Needs Support",
};

const DRIVER_ICON: Record<SchoolDriverKey, LucideIcon> = {
  focus: Target,
  academic: BookOpen,
  behavior: ShieldCheck,
  task: BarChart3,
  positiveBehavior: HeartHandshake,
  interventionResponse: Users,
};

const DRIVER_TONE: Record<SchoolDriverKey, string> = {
  focus: "hsl(212 90% 58%)",
  academic: "hsl(142 55% 45%)",
  behavior: "hsl(262 55% 55%)",
  task: "hsl(28 88% 54%)",
  positiveBehavior: "hsl(340 70% 58%)",
  interventionResponse: "hsl(190 65% 45%)",
};

const TIER_TONE: Record<string, string> = {
  strong: "hsl(142 55% 42%)",
  solid: "hsl(142 45% 55%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(28 88% 54%)",
  intensive: "hsl(0 78% 55%)",
};

export function SchoolHealthScoreCard() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  const overview = useMemo(() => schoolHealthOverview(), []);
  const totalClassrooms = useMemo(
    () => overview.distribution.reduce((acc, d) => acc + d.count, 0),
    [overview],
  );
  const statusTone = STATUS_TONE[overview.status];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="School Health Score"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>School health</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            School Health Score
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Provides the principal&apos;s north-star measure of overall school functioning.
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
            <div className="pt-5 mt-4 border-t border-border/60 space-y-5">
              {/* Score + drivers */}
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 xl:gap-0 xl:divide-x divide-border/60">
                <div className="xl:pr-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-heading font-black tabular-nums leading-none text-[68px]"
                        style={{ color: statusTone }}
                      >
                        {overview.score}
                      </span>
                      <span className="text-[18px] font-extrabold text-muted-foreground/80">/100</span>
                    </div>
                    <div className="flex flex-col gap-1.5 items-start">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{
                          background: `color-mix(in srgb, ${statusTone} 14%, transparent)`,
                          color: statusTone,
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {STATUS_LABEL[overview.status]}
                      </span>
                      <div
                        className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums"
                        style={{ color: overview.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
                      >
                        {overview.delta >= 0 ? "↑" : "↓"} {overview.delta >= 0 ? "+" : ""}
                        {overview.delta} from last week
                      </div>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-foreground/80 leading-snug mt-4 max-w-[42ch]">
                    {overview.interpretation}
                  </p>
                </div>

                <div className="xl:pl-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-3">
                    Score summarises 6 key drivers
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {overview.drivers.map((d) => {
                      const Icon = DRIVER_ICON[d.key];
                      const tone = DRIVER_TONE[d.key];
                      return (
                        <div
                          key={d.key}
                          className="rounded-xl border p-2.5 flex items-center gap-2"
                          style={{
                            borderColor: `color-mix(in srgb, ${tone} 20%, transparent)`,
                            background: `color-mix(in srgb, ${tone} 5%, transparent)`,
                          }}
                        >
                          <span
                            className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
                            style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10.5px] font-semibold text-foreground/80 leading-snug line-clamp-2">
                              {d.label}
                            </div>
                            <div
                              className="font-heading font-extrabold text-[15px] tabular-nums leading-tight"
                              style={{ color: tone }}
                            >
                              {d.score}
                              <span className="text-[10px] text-muted-foreground font-bold"> /100</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Strongest / needs attention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4 flex items-start gap-3">
                  <span className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
                    <Star className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                      Strongest school-wide area
                    </div>
                    <div className="font-heading font-extrabold text-[15px] text-emerald-700 dark:text-emerald-400 mt-1">
                      {overview.strongest.label}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">
                      Consistently strong across most grades.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4 flex items-start gap-3">
                  <span className="h-10 w-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                      Area needing attention
                    </div>
                    <div className="font-heading font-extrabold text-[15px] text-amber-700 dark:text-amber-400 mt-1">
                      {overview.weakest.label}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">
                      {overview.interpretation.split(". ").slice(1).join(". ") || "Lower scores observed this period."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Classroom distribution */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-3.5">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-heading font-bold text-[13.5px]">Classroom distribution</h3>
                  <span className="text-[11px] text-muted-foreground">{totalClassrooms} classrooms</span>
                </div>

                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/50">
                  {overview.distribution.map((d) => {
                    if (d.count <= 0) return null;
                    return (
                      <span
                        key={d.tier}
                        className="h-full"
                        style={{ flex: `${d.pct} 1 0`, background: TIER_TONE[d.tier] }}
                        title={`${d.label}: ${d.count}`}
                      />
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {overview.distribution.map((d) => (
                    <div key={d.tier} className="min-w-0">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: TIER_TONE[d.tier] }}
                          aria-hidden
                        />
                        <span className="text-[11.5px] font-bold text-foreground/90">{d.label}</span>
                      </span>
                      <div className="text-[13px] font-heading font-extrabold tabular-nums mt-1" style={{ color: TIER_TONE[d.tier] }}>
                        {d.count} <span className="text-[10.5px] text-muted-foreground font-bold">({d.pct}%)</span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{d.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-primary hover:underline"
                  >
                    <Info className="h-3.5 w-3.5" />
                    How School Health is calculated
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-[320px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    School Health Score
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-2 leading-snug">
                    The average of 6 drivers, each rolled up from every classroom&apos;s real check-in and
                    follow-up data:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {overview.drivers.map((d) => (
                      <li key={d.key} className="flex items-center justify-between text-[11.5px]">
                        <span className="text-foreground/85">{d.label}</span>
                        <span className="font-bold tabular-nums" style={{ color: DRIVER_TONE[d.key] }}>
                          {d.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                      Status bands
                    </div>
                    <ul className="space-y-1">
                      {SCORE_BANDS.map((b) => (
                        <li key={b.band} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{b.tag}</span>
                          <span className="tabular-nums text-foreground/80">{b.range}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
