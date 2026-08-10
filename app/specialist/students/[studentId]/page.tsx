"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { STUDENTS, type Student } from "@/data/mockData";
import { studentComposites } from "@/lib/classHealth";
import { caseloadTierFromStatus, TIER_LABEL } from "@/lib/specialEdCaseload";

export default function Page() {
  return (
    <SpecialistAppShell>
      <StudentProfile />
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function StudentProfile() {
  const params = useParams<{ studentId: string }>();
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;
  const student = useMemo(() => STUDENTS.find((s) => s.id === studentId) ?? null, [studentId]);

  if (!student) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-[14px] font-semibold">Student not found.</p>
        <Link href="/specialist/review-queue" className="mt-2 inline-block text-[12.5px] font-bold text-primary hover:underline">
          Back to Review Queue
        </Link>
      </div>
    );
  }

  return <StudentProfileBody student={student} />;
}

function StudentProfileBody({ student }: { student: Student }) {
  const reduce = useReducedMotion();
  const composite = useMemo(() => studentComposites([student])[0], [student]);
  const tier = caseloadTierFromStatus(composite.status);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
      >
        <Link href="/specialist/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <Link href="/specialist/review-queue" className="hover:text-foreground transition-colors">
          Review Queue
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="text-foreground">{student.name}</span>
      </nav>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <StudentAvatar student={student} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-black text-[22px] md:text-[26px] leading-tight">{student.name}</h1>
              <RiskBadge risk={student.risk} />
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] bg-muted/60 text-muted-foreground">
                {TIER_LABEL[tier]}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              {student.grade} · Section {student.section} · Composite score {composite.score}/100
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-[12.5px] text-muted-foreground">
        The full Student Support Profile (presenting concerns, strengths, accommodations, interventions, notes,
        upcoming reviews) hasn&apos;t been designed yet.
      </div>
    </motion.div>
  );
}
