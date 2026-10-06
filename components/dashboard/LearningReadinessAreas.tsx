"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  ChevronDown,
  Lightbulb,
  Puzzle,
  Sparkles,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import {
  learningAreaSkillBreakdown,
  type LearningAreaKey,
  type LearningAreaStat,
  READINESS_STATUS_LABEL,
  READINESS_STATUS_TONE,
  readinessStatusFromScore,
  studentsByLearningArea,
} from "@/lib/classLearning";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import { formatDecimal1 } from "@/lib/format";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const AREA_ICON: Record<LearningAreaKey, LucideIcon> = {
  problemSolving: Puzzle,
  reasoning: Brain,
  creativeExpression: Sparkles,
  readingComprehension: BookOpen,
  recallRetention: Lightbulb,
};

export function LearningReadinessAreas({ areas }: { areas: LearningAreaStat[] }) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<LearningAreaKey | null>(null);
  // Shared across all cards (not per-area) so expanding one area's skills
  // expands every card in the same grid row too, instead of leaving
  // siblings collapsed and the row ragged.
  const [skillsExpanded, setSkillsExpanded] = useState(false);

  const { strongest, weakest } = useMemo(() => {
    const scored = areas.filter((a): a is LearningAreaStat & { score: number } => a.score != null);
    if (scored.length === 0) return { strongest: null, weakest: null };
    const sorted = [...scored].sort((a, b) => b.score - a.score);
    return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
  }, [areas]);

  const activeArea = openKey ? areas.find((a) => a.key === openKey) : undefined;
  const activeStudents = openKey ? studentsByLearningArea(openKey) : [];

  return (
    <section
      aria-label="Learning readiness areas"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Learning readiness areas</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where the class is ready — and where it needs support
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            View students needing support, or expand an area to see the skills behind its score.
          </p>
        </div>

        {(strongest || weakest) && (
          <div className="flex items-center gap-2 flex-wrap">
            {strongest && strongest.score > 70 && (
              <Highlight
                tone="hsl(142 55% 42%)"
                icon={<Sparkles className="h-3 w-3" strokeWidth={2.4} />}
                label="Strongest"
                name={strongest.label}
                score={strongest.score}
              />
            )}
            {weakest && (
              <Highlight
                tone="hsl(0 78% 56%)"
                icon={<TrendingDown className="h-3 w-3" strokeWidth={2.4} />}
                label="Needs most support"
                name={weakest.label}
                score={weakest.score}
              />
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {areas.map((a, i) => {
          const status = a.score != null ? readinessStatusFromScore(a.score) : null;
          const statusTone = status ? READINESS_STATUS_TONE[status] : undefined;
          const Icon = AREA_ICON[a.key];
          const skills = learningAreaSkillBreakdown(a);
          const expanded = skillsExpanded;
          return (
            <motion.div
              key={a.key}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-foreground/20 hover:bg-background/90 hover:shadow-sm"
            >
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                aria-hidden
                style={{ background: a.hue }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${a.hue} 14%, transparent)`, color: a.hue }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="font-heading font-bold text-[13px] leading-tight truncate">
                    {a.label}
                  </span>
                </div>
                {status && statusTone && (
                  <span
                    className="shrink-0 inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${statusTone} 12%, transparent)`, color: statusTone }}
                  >
                    {READINESS_STATUS_LABEL[status]}
                  </span>
                )}
              </div>

              <p className="text-[10.5px] text-muted-foreground mt-2 leading-snug">
                {a.description}
              </p>

              {a.score != null ? (
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.span
                      initial={reduce ? undefined : { scaleX: 0 }}
                      animate={{ scaleX: a.score / 100 }}
                      transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                      className="block h-full w-full origin-left rounded-full"
                      style={{ background: a.hue }}
                    />
                  </div>
                  <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: a.hue }}>
                    {formatDecimal1(a.score)}
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <NotEnoughData />
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                {a.studentCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setOpenKey(a.key)}
                    className="text-[10.5px] font-bold tabular-nums text-foreground/70 hover:text-foreground hover:underline transition-colors"
                  >
                    {a.studentCount} student{a.studentCount === 1 ? "" : "s"} need support
                  </button>
                ) : (
                  <span />
                )}
              </div>

              {skills && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setSkillsExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                    className="w-full flex items-center justify-between gap-2 text-[10.5px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>
                      {skills.length} Impacting Skill{skills.length === 1 ? "" : "s"}
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")} />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2.5">
                          {skills.map((s) => (
                            <div key={s.name}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-foreground/80">{s.name}</span>
                                <span className="text-[11px] font-bold tabular-nums" style={{ color: a.hue }}>
                                  {s.score}
                                </span>
                              </div>
                              <div className="mt-1 h-1 rounded-full bg-muted/40 overflow-hidden">
                                <motion.span
                                  initial={reduce ? undefined : { scaleX: 0 }}
                                  animate={{ scaleX: s.score / 100 }}
                                  transition={{ duration: 0.4, ease: EASE }}
                                  className="block h-full w-full origin-left rounded-full"
                                  style={{ background: a.hue }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2.5 text-[9.5px] text-muted-foreground">
                          Signal score = average of the {skills.length} skills above.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <StudentDrillDialog
        open={!!openKey}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={activeArea ? `${activeArea.label} — students needing support` : ""}
        description={
          activeStudents.length === 0
            ? "No students are currently flagged for this area."
            : `${activeStudents.length} student${activeStudents.length === 1 ? "" : "s"} below threshold for ${activeArea?.label.toLowerCase() ?? "this area"}.`
        }
        students={activeStudents}
      />
    </section>
  );
}

function Highlight({
  tone,
  icon,
  label,
  name,
  score,
}: {
  tone: string;
  icon: React.ReactNode;
  label: string;
  name: string;
  score: number;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
        color: `color-mix(in srgb, ${tone} 80%, black 12%)`,
        border: `1px solid color-mix(in srgb, ${tone} 22%, transparent)`,
      }}
    >
      <span style={{ color: tone }}>{icon}</span>
      <span className="text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground/90">
        {label}
      </span>
      <span className="font-heading font-extrabold">{name}</span>
      <span className="tabular-nums opacity-75">{formatDecimal1(score)}</span>
    </div>
  );
}
