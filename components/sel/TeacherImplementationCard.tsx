"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users2 } from "lucide-react";
import { TEACHER_STATUS_LABEL, TEACHER_STATUS_TONE, type TeacherDistributionSummary } from "@/lib/selTeacherSupport";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function TeacherImplementationCard({
  summary,
  totalTeachers,
}: {
  summary: TeacherDistributionSummary;
  totalTeachers: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Teacher Implementation & Support"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <Users2 className="h-3 w-3" />
            <span>Teacher Implementation &amp; Support</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Teacher Implementation Distribution
          </h3>
        </header>
        <Link href="/sel/teachers" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary shrink-0">
          Support teachers
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(["on-track", "needs-support", "low-implementation"] as const).map((status) => {
          const tone = TEACHER_STATUS_TONE[status];
          const count = summary[status];
          const pct = totalTeachers === 0 ? 0 : Math.round((count / totalTeachers) * 100);
          return (
            <div
              key={status}
              className="rounded-xl border border-border bg-background p-3.5"
              style={{ borderTopColor: tone, borderTopWidth: 2 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                {TEACHER_STATUS_LABEL[status]}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-heading font-extrabold text-[17px] tabular-nums leading-none" style={{ color: tone }}>
                  {count} teacher{count === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">· {pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
