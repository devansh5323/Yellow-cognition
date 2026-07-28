"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Compass,
  Hand,
  HeartPulse,
  Megaphone,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { studentsByDisruption, type DisruptionKey, type DisruptionStat } from "@/lib/classBehavior";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DISRUPTION_ICON: Record<DisruptionKey, LucideIcon> = {
  "off-task": Compass,
  "non-compliance": Hand,
  peer: Users,
  impulse: Zap,
  emotional: HeartPulse,
  participation: Megaphone,
};

function severityLabel(score: number): { label: string; tone: string } {
  if (score >= 50) return { label: "High impact", tone: "hsl(0 78% 56%)" };
  if (score >= 25) return { label: "Watch", tone: "hsl(38 92% 48%)" };
  return { label: "Low", tone: "hsl(142 55% 42%)" };
}

export function DisruptionBreakdown({ stats }: { stats: DisruptionStat[] }) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<DisruptionKey | null>(null);

  const activeMeta = useMemo(
    () => (openKey ? (stats.find((s) => s.key === openKey) ?? null) : null),
    [openKey, stats],
  );
  const activeStudents = useMemo(() => (openKey ? studentsByDisruption(openKey) : []), [openKey]);

  return (
    <section
      aria-label="Disruption breakdown"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Disruption breakdown</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where the friction is coming from
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Click any category to see affected students.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((s, i) => {
          const sev = severityLabel(s.severity);
          const delta = s.severity - s.prevSeverity;
          const Icon = DISRUPTION_ICON[s.key];
          return (
            <motion.button
              key={s.key}
              type="button"
              onClick={() => setOpenKey(s.key)}
              aria-label={`${s.label} — view affected students`}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35, ease: EASE }}
              className="group h-full flex flex-col text-left rounded-xl border border-border bg-background p-3.5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden
                    className="h-7 w-7 rounded-lg shrink-0 inline-flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${s.hue} 14%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${s.hue} 26%, transparent)`,
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
                  style={{ color: sev.tone }}
                >
                  {sev.label}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span
                  className="font-heading font-extrabold text-[24px] tabular-nums leading-none"
                  style={{ color: s.hue }}
                >
                  {s.studentCount}
                </span>
                <span className="text-[10.5px] font-semibold text-muted-foreground">students</span>
                {delta !== 0 && (
                  <span
                    className="ml-auto text-[10.5px] tabular-nums font-bold"
                    style={{ color: delta < 0 ? "hsl(142 55% 42%)" : "hsl(0 70% 50%)" }}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                )}
              </div>

              <div className="mt-2.5 h-1 rounded-full bg-muted/50 overflow-hidden">
                <motion.span
                  initial={reduce ? undefined : { scaleX: 0 }}
                  animate={{ scaleX: Math.max(0.04, s.severity / 100) }}
                  transition={{ delay: 0.08 + 0.03 * i, duration: 0.6, ease: EASE }}
                  className="block h-full origin-left rounded-full"
                  style={{ background: s.hue, width: "100%" }}
                />
              </div>

              {/* `mt-auto` pins this row to the card bottom so descriptions
               * align across cards in the same row regardless of line count. */}
              <div className="mt-auto pt-2.5 flex items-start justify-between gap-2">
                <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2 min-h-[2lh]">
                  {s.description}
                </p>
                <span
                  aria-hidden
                  className="inline-flex items-center gap-0.5 shrink-0 mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100"
                  style={{ color: s.hue }}
                >
                  View
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <StudentDrillDialog
        open={!!openKey}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={activeMeta ? `${activeMeta.label} — affected students` : ""}
        description={
          activeStudents.length === 0
            ? "No students are currently flagged for this category."
            : `${activeStudents.length} student${activeStudents.length === 1 ? "" : "s"} contributing to ${activeMeta?.label.toLowerCase() ?? "this category"}.`
        }
        students={activeStudents}
      />
    </section>
  );
}
