"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { TeacherInvitePicker, teacherInviteMethodLabel } from "@/components/school/TeacherInvitePicker";
import { TeacherCohortManager } from "@/components/school/TeacherCohortManager";
import type { TeacherInviteMethod } from "@/lib/teacherInvites";

export default function Page() {
  return (
    <SchoolAppShell>
      <TeachersPage />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function TeachersPage() {
  const reduce = useReducedMotion();
  const [method, setMethod] = useState<TeacherInviteMethod>("invite");

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-6"
    >
      {/* Header */}
      <section className="premium-elevated rounded-[22px] p-5 sm:p-6">
        <div className="premium-eyebrow">
          <Users className="h-3 w-3" /> Teacher cohort
        </div>
        <h1 className="mt-1.5 font-heading font-extrabold text-[24px] sm:text-[28px] leading-tight tracking-tight">
          Bring your staff into Yellow
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
          Pick the method that fits your school's IT setup. You can mix-and-match — Google sync some,
          send manual invites to others, and add latecomers one-by-one anytime.
        </p>
      </section>

      {/* Picker */}
      <section className="premium-surface rounded-[22px] p-5 sm:p-6 space-y-4">
        <div>
          <div className="premium-eyebrow">
            <ArrowRight className="h-3 w-3" />
            <span>Choose a method · currently <span className="text-foreground">{teacherInviteMethodLabel(method)}</span></span>
          </div>
        </div>
        <TeacherInvitePicker value={method} onChange={(m) => setMethod(m)} />
      </section>

      {/* Manager */}
      <section className="premium-surface rounded-[22px] p-5 sm:p-6">
        <TeacherCohortManager method={method} />
      </section>
    </motion.div>
  );
}
