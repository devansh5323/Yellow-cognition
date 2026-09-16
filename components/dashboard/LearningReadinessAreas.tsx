"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Lightbulb,
  Puzzle,
  Search,
  Sparkles,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import {
  type LearningAreaKey,
  type LearningAreaStat,
  READINESS_STATUS_LABEL,
  READINESS_STATUS_TONE,
  readinessStatusFromScore,
  studentsByLearningArea,
} from "@/lib/classLearning";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const AREA_ICON: Record<LearningAreaKey, LucideIcon> = {
  problemSolving: Puzzle,
  reasoning: Brain,
  creativeExpression: Sparkles,
  readingComprehension: BookOpen,
  recallRetention: Lightbulb,
  curiosityExploration: Search,
};

export function LearningReadinessAreas({ areas }: { areas: LearningAreaStat[] }) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<LearningAreaKey | null>(null);

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
            Click any area to see students who need support there.
          </p>
        </div>

        {strongest && weakest && (
          <div className="flex items-center gap-2 flex-wrap">
            <Highlight
              tone="hsl(142 55% 42%)"
              icon={<Sparkles className="h-3 w-3" strokeWidth={2.4} />}
              label="Strongest"
              name={strongest.label}
              score={strongest.score}
            />
            <Highlight
              tone="hsl(0 78% 56%)"
              icon={<TrendingDown className="h-3 w-3" strokeWidth={2.4} />}
              label="Needs most support"
              name={weakest.label}
              score={weakest.score}
            />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {areas.map((a, i) => {
          const status = a.score != null ? readinessStatusFromScore(a.score) : null;
          const statusTone = status ? READINESS_STATUS_TONE[status] : undefined;
          const Icon = AREA_ICON[a.key];
          return (
            <motion.button
              key={a.key}
              type="button"
              onClick={() => setOpenKey(a.key)}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
              className="group relative text-left overflow-hidden rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-foreground/20 hover:bg-background/90 hover:shadow-sm"
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
                    {a.score}
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <NotEnoughData />
                </div>
              )}

              {a.studentCount > 0 && (
                <div className="mt-2 text-[10.5px] tabular-nums text-muted-foreground">
                  {a.studentCount} student{a.studentCount === 1 ? "" : "s"} need support
                </div>
              )}
            </motion.button>
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
      <span className="tabular-nums opacity-75">{score}</span>
    </div>
  );
}
