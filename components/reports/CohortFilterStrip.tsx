"use client";

import { motion, useReducedMotion } from "framer-motion";
import { STUDENTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

/** "all" or one of the real roster's distinct `ageGroup` values — there's no
 * grade/section data in the real dataset, so cohorts are grouped by age
 * group instead. */
export type CohortKey = "all" | string;

export function CohortFilterStrip({
  active,
  onChange,
}: {
  active: CohortKey;
  onChange: (c: CohortKey) => void;
}) {
  const reduce = useReducedMotion();
  const ageGroups = Array.from(new Set(STUDENTS.map((s) => s.ageGroup))).sort();
  const cohorts: { key: CohortKey; label: string }[] = [
    { key: "all", label: "All age groups" },
    ...ageGroups.map((g) => ({ key: g, label: g })),
  ];

  const stats = ageGroups.map((g) => {
    const list = STUDENTS.filter((s) => s.ageGroup === g);
    const avgScore = list.length
      ? Math.round((list.reduce((a, s) => a + s.studentHealthScore, 0) / list.length) * 10) / 10
      : 0;
    return { key: g, label: g, avgScore, count: list.length };
  });

  return (
    <section className="premium-surface rounded-[16px] p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1 rounded-full bg-muted/60 border border-border/70 p-1 backdrop-blur">
          {cohorts.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onChange(c.key)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={reduce ? undefined : "cohort-pill"}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-card shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)] border border-primary/35"
                    aria-hidden
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 flex-wrap">
          {stats.map((s) => (
            <div key={s.key} className="text-[11.5px] flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">{s.label}</span>
              <span className="font-heading font-extrabold tabular-nums">{s.avgScore}</span>
              <span className="text-muted-foreground">({s.count})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
