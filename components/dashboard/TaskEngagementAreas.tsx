"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  ListChecks,
  Mountain,
  Repeat,
  Rocket,
  TrendingDown,
  UserCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  TASK_AREA_DESCRIPTION,
  TASK_AREA_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_TONE,
  studentsByTaskArea,
  type TaskAreaKey,
  type TaskAreaStat,
  type TaskStatus,
} from "@/lib/classTask";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Worst-first severity so the areas most in need of attention lead the
// grid, matching the page's "where it needs support" framing.
const STATUS_SEVERITY: Record<TaskStatus, number> = { support: 0, reinforcement: 1, stable: 2, strong: 3 };

const AREA_ICON: Record<TaskAreaKey, LucideIcon> = {
  initiation: Rocket,
  persistence: Flame,
  completion: CheckCircle2,
  consistency: Repeat,
  planning: ListChecks,
  "independent-execution": UserCheck,
  "response-to-challenge": Mountain,
};

/** Replaces the old Task Trend Tracking line chart: the same 7 task-
 * engagement areas classTaskBreakdown() already computes (real, class-
 * level weekly CSV data), shown as clickable cards instead of a chart —
 * each opens a drill-down of the students whose (demo) weakest area
 * matches, same pattern as LearningReadinessAreas.tsx. */
export function TaskEngagementAreas({ breakdown }: { breakdown: TaskAreaStat[] }) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<TaskAreaKey | null>(null);

  const { strongest, weakest } = useMemo(() => {
    const scored = breakdown.filter((a): a is TaskAreaStat & { score: number } => a.score != null);
    if (scored.length === 0) return { strongest: null, weakest: null };
    const sorted = [...scored].sort((a, b) => b.score - a.score);
    return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
  }, [breakdown]);

  const sortedBreakdown = useMemo(() => {
    return [...breakdown].sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
      if (!a.hasData || !b.hasData || a.score == null || b.score == null) return 0;
      const sa = a.status ? STATUS_SEVERITY[a.status] : 4;
      const sb = b.status ? STATUS_SEVERITY[b.status] : 4;
      if (sa !== sb) return sa - sb;
      return a.score - b.score;
    });
  }, [breakdown]);

  const activeArea = openKey ? breakdown.find((a) => a.key === openKey) : undefined;
  const activeStudents = openKey ? studentsByTaskArea(openKey) : [];

  return (
    <section aria-label="Task engagement areas" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Task engagement areas</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where the class is on track — and where it needs support
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            View students needing support in an area.
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
        {sortedBreakdown.map((a, i) => {
          const tone = a.status ? TASK_STATUS_TONE[a.status] : undefined;
          const Icon = AREA_ICON[a.key];
          const students = a.hasData ? studentsByTaskArea(a.key) : [];
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
              <span className="absolute inset-y-0 left-0 w-[3px]" aria-hidden style={{ background: tone ?? "var(--border)" }} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${tone ?? "var(--muted-foreground)"} 14%, transparent)`, color: tone ?? "var(--muted-foreground)" }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="font-heading font-bold text-[13px] leading-tight">{TASK_AREA_LABEL[a.key]}</span>
                </div>
                {a.status && tone && (
                  <span
                    className="shrink-0 inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                  >
                    {TASK_STATUS_LABEL[a.status]}
                  </span>
                )}
              </div>

              <p className="text-[10.5px] text-muted-foreground mt-2 leading-snug">{TASK_AREA_DESCRIPTION[a.key]}</p>

              {a.hasData && a.score != null ? (
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.span
                      initial={reduce ? undefined : { scaleX: 0 }}
                      animate={{ scaleX: a.score / 100 }}
                      transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                      className="block h-full w-full origin-left rounded-full"
                      style={{ background: tone }}
                    />
                  </div>
                  <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: tone }}>
                    {a.score}
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <NotEnoughData />
                </div>
              )}

              {students.length > 0 ? (
                <div
                  className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-bold tabular-nums"
                  style={{ color: tone ?? "var(--muted-foreground)" }}
                >
                  {students.length} student{students.length === 1 ? "" : "s"} need support
                  <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              ) : (
                <div className="mt-2.5 text-[10.5px] text-muted-foreground">No students flagged</div>
              )}
            </motion.button>
          );
        })}
      </div>

      <StudentDrillDialog
        open={!!openKey}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={activeArea ? `${TASK_AREA_LABEL[activeArea.key]} — students needing support` : ""}
        description={
          activeStudents.length === 0
            ? "No students are currently flagged for this area."
            : `${activeStudents.length} student${activeStudents.length === 1 ? "" : "s"} whose biggest task-engagement gap is ${activeArea ? TASK_AREA_LABEL[activeArea.key].toLowerCase() : "this area"}.`
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
      <span className="text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground/90">{label}</span>
      <span className="font-heading font-extrabold">{name}</span>
      <span className="tabular-nums opacity-75">{score}</span>
    </div>
  );
}
