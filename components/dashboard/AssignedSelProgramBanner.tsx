"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { getPrograms, currentWeekFor, type SelProgram } from "@/lib/selProgram";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Closes the "Coordinator plans → Teacher implements" loop for real:
 * this reads the exact same localStorage the SEL Coordinator's Program
 * Planner writes to (single-browser app, no backend, so that's the
 * honest extent of "assign" here). Shown school-wide rather than scoped
 * to "your" class — there's no real teacher-to-grade link in this app
 * (see lib/selNeeds.ts's `coach` note), so claiming personalization would
 * be dishonest; this is a real assigned program, just not provably *this*
 * teacher's. */
export function AssignedSelProgramBanner() {
  const reduce = useReducedMotion();
  const [programs, setPrograms] = useState<SelProgram[]>([]);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setPrograms(getPrograms());
    refresh();
    window.addEventListener("ah-sel-program-change", refresh);
    return () => window.removeEventListener("ah-sel-program-change", refresh);
  }, []);

  const active = programs
    .filter((p) => p.status === "assigned")
    .map((p) => ({ program: p, week: currentWeekFor(p, nowMs) }))
    .filter((row): row is { program: SelProgram; week: NonNullable<ReturnType<typeof currentWeekFor>> } => row.week !== null);

  if (active.length === 0) return null;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Assigned SEL program"
      className="rounded-2xl border border-primary/25 bg-primary/[0.05] p-4 md:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
          <BookOpen className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary">SEL Program This Week</div>
          {active.map(({ program, week }) => (
            <p key={program.id} className="text-[12.5px] leading-snug">
              <span className="font-bold">{program.grade}</span> is running a {program.duration}-week{" "}
              <span className="font-semibold">{program.focus}</span> program — Week {week.week}:{" "}
              <span className="font-semibold">{week.title}</span>.
            </p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
