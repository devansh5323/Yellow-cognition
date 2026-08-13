"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";
import { studentComposites, type StudentStatus } from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STATUS_TONE: Record<StudentStatus, string> = {
  improving: "hsl(142 55% 45%)",
  "on-track": "hsl(212 90% 58%)",
  watch: "hsl(38 92% 55%)",
  "needs-support": "hsl(0 78% 58%)",
};

const STATUS_LABEL: Record<StudentStatus, string> = {
  improving: "Improving",
  "on-track": "On track",
  watch: "Watch",
  "needs-support": "Needs support",
};

/** Quick jump-off points into a student's full profile — separate from the
 * returning-hub's ad hoc conference/flag links, this is the dashboard's own
 * "browse the roster, click into anyone" entry point. */
export function StudentDrilldownRow({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  // Locked (FTUE) passes an empty roster — no students to drill into yet.
  const composites = useMemo(() => studentComposites(locked ? [] : undefined), [locked]);
  const shown = composites.slice(0, 8);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Student drilldown"
    >
      <div className="premium-eyebrow">
        <span>Student drilldown</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight">
              Jump into a student&apos;s profile
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Quick entry points into full student detail — history, notes, and interventions.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground shrink-0">
            <Users className="h-3.5 w-3.5" />
            {composites.length} student{composites.length === 1 ? "" : "s"}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            No students linked yet — add your roster to enable drilldowns.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {shown.map((c) => {
              const tone = STATUS_TONE[c.status];
              return (
                <Link
                  key={c.student.id}
                  href={`/students/${c.student.id}`}
                  className="rounded-xl border border-border/60 bg-background p-3 flex items-center gap-2.5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
                >
                  <span
                    className="h-8 w-8 rounded-full inline-flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: c.student.avatarColor, color: "white" }}
                  >
                    {c.student.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold truncate">{c.student.name}</div>
                    <div className="text-[10px] font-bold" style={{ color: tone }}>
                      {STATUS_LABEL[c.status]}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
