"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  ChevronDown,
  Compass,
  Info,
  Puzzle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { classSkillSignals, type SkillSignal, type SkillStatus } from "@/lib/learningOutcomes";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICONS = {
  puzzle: Puzzle,
  brain: Brain,
  sparkles: Sparkles,
  "book-open": BookOpen,
  "rotate-ccw": RotateCcw,
  compass: Compass,
} as const;

const STATUS_LABEL: Record<SkillStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  watch: "Watch",
  "needs-support": "Needs Support",
};

const STATUS_TONE: Record<SkillStatus, string> = {
  strong: "hsl(142 55% 42%)",
  stable: "hsl(212 55% 45%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(0 78% 52%)",
};

/**
 * Tracks the grid's column count so we can group cards by row and toggle
 * an entire row's expanded state in lockstep. Mirrors the Tailwind
 * `grid-cols-2 lg:grid-cols-3` breakpoint at 1024px.
 */
function useColumnCount(): number {
  const [cols, setCols] = useState<number>(() => {
    if (typeof window === "undefined") return 3;
    return window.matchMedia("(min-width: 1024px)").matches ? 3 : 2;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setCols(e.matches ? 3 : 2);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return cols;
}

export function LearningSkillSignals({ signals }: { signals?: SkillSignal[] }) {
  const data = signals ?? classSkillSignals();
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
      aria-label="Learning Skill Signals"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Gameplay-derived</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Learning Skill Signals
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Gameplay shows which skills contribute to each signal.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {data.map((s, i) => {
          const Icon = ICONS[s.iconKey];
          const rowIdx = Math.floor(i / cols);
          const open = openRows.has(rowIdx);
          return (
            <motion.div
              key={s.key}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35, ease: EASE }}
              className="rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-foreground/15"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span
                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${s.hue} 10%, transparent)`,
                      color: s.hue,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <span className="text-[12px] font-bold text-foreground/90 truncate">
                    {s.label}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: STATUS_TONE[s.status] }}
                >
                  {STATUS_LABEL[s.status]}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span
                  className="font-heading font-extrabold text-[26px] tabular-nums leading-none"
                  style={{ color: s.hue }}
                >
                  {s.score}
                </span>
                <DeltaPill prev={s.prevScore} curr={s.score} />
              </div>

              <div className="mt-2.5 h-1 rounded-full bg-muted/50 overflow-hidden">
                <motion.span
                  initial={reduce ? undefined : { scaleX: 0 }}
                  animate={{ scaleX: s.score / 100 }}
                  transition={{ delay: 0.08 + 0.03 * i, duration: 0.6, ease: EASE }}
                  className="block h-full origin-left rounded-full"
                  style={{ background: s.hue, width: "100%" }}
                />
              </div>

              <SkillDetails signal={s} open={open} onToggle={() => toggleRow(rowIdx)} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function SkillDetails({
  signal,
  open,
  onToggle,
}: {
  signal: SkillSignal;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const panelId = `skill-details-${signal.key}`;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group w-full -mx-1 px-1 py-1 inline-flex items-center justify-between gap-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="inline-flex items-center gap-1">
          <Info className="h-3 w-3" strokeWidth={2.4} />
          {signal.impactingSkills.length} impacting skills
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
              {/* What it means */}
              <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                What it means
              </div>
              <p className="mt-1 text-[11.5px] leading-snug text-foreground/85">
                {signal.description}
              </p>

              {/* Impacting skills with their scores */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-2">
                  <span>Impacting skills</span>
                  <span className="tabular-nums">avg {signal.score}</span>
                </div>
                <ul className="space-y-2">
                  {signal.impactingSkills.map((skill) => (
                    <li key={skill.name}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] font-semibold text-foreground/85 truncate">
                          {skill.name}
                        </span>
                        <span
                          className="font-heading font-extrabold tabular-nums text-[11.5px] leading-none shrink-0"
                          style={{ color: signal.hue }}
                        >
                          {skill.score}
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${skill.score}%`, background: signal.hue }}
                          aria-label={`${skill.name} score ${skill.score}`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                  Signal score = average of the {signal.impactingSkills.length} skills above.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeltaPill({ prev, curr }: { prev: number; curr: number }) {
  const d = curr - prev;
  if (d === 0) {
    return <span className="text-[10.5px] tabular-nums text-muted-foreground">no change</span>;
  }
  const positive = d > 0;
  return (
    <span
      className="text-[10.5px] tabular-nums font-bold"
      style={{ color: positive ? "hsl(142 55% 40%)" : "hsl(0 70% 50%)" }}
    >
      {positive ? "+" : ""}
      {d}
    </span>
  );
}
