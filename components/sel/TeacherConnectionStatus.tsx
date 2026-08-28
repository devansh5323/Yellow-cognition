"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users2 } from "lucide-react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** The partial state shown between "SEL program set up" and "full FTUE
 * done" — connecting a teacher to an SEL program is real and worth
 * surfacing immediately, but the deeper on-track/needs-support/low
 * implementation distribution needs targeted-group data too, so it stays
 * behind the full TeacherImplementationCard until then. */
export function TeacherConnectionStatus({ connected, total }: { connected: number; total: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Teacher connection status"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <Users2 className="h-3 w-3" />
            <span>Teacher Implementation &amp; Support</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            {connected} of {total} teachers connected
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-1 max-w-md">
            Deeper implementation metrics unlock once your SEL setup is complete.
          </p>
        </header>
        <Link
          href="/sel/teachers"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary shrink-0"
        >
          Review teachers
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.section>
  );
}
