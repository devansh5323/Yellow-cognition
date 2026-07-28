"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { STUDENTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export type CohortKey = "all" | "3-A" | "3-B" | "4-A" | "4-B";

export function CohortFilterStrip({
  active,
  onChange,
}: {
  active: CohortKey;
  onChange: (c: CohortKey) => void;
}) {
  const reduce = useReducedMotion();
  const cohorts: { key: CohortKey; label: string }[] = [
    { key: "all", label: "All cohorts" },
    { key: "3-A", label: "Grade 3-A" },
    { key: "3-B", label: "Grade 3-B" },
    { key: "4-A", label: "Grade 4-A" },
    { key: "4-B", label: "Grade 4-B" },
  ];

  const stats = cohorts.slice(1).map((c) => {
    const [g, sec] = c.key.split("-");
    const list = STUDENTS.filter((s) => s.grade === `Grade ${g}` && s.section === sec);
    const avgPfi = list.length
      ? Math.round(list.reduce((a, s) => a + s.pfi, 0) / list.length)
      : 0;
    const avgPrev = list.length
      ? Math.round(list.reduce((a, s) => a + s.pfiPrevCheckIn, 0) / list.length)
      : 0;
    return { ...c, avgPfi, delta: avgPfi - avgPrev, count: list.length };
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
          {stats.map((s) => {
            const Icon = s.delta > 0 ? TrendingUp : s.delta < 0 ? TrendingDown : Minus;
            const tone = s.delta > 0 ? "text-primary" : s.delta < 0 ? "text-destructive" : "text-muted-foreground";
            return (
              <div key={s.key} className="text-[11.5px] flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">{s.label.replace("Grade ", "")}</span>
                <span className="font-heading font-extrabold tabular-nums">{s.avgPfi}</span>
                <span className={cn("flex items-center gap-0.5 font-bold", tone)}>
                  <Icon className="h-3 w-3" />
                  {s.delta > 0 ? "+" : ""}
                  {s.delta}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
