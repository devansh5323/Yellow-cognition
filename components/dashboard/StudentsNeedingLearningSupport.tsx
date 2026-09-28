"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Equal, CheckCircle2, Clock } from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { LEARNING_AREA_LABEL } from "@/lib/classLearning";
import {
  BAND_LABEL,
  BAND_TONE,
  MOVEMENT_LABEL,
  effectiveBand,
  type OutcomeConfirmationState,
  type StudentOutcome,
} from "@/lib/learningOutcomes";

const PREVIEW_COUNT = 4;

/** Component 4: "Students Needing Learning Support" — ranked, worst-first.
 * Band/movement/support are demo (see lib/learningOutcomes.ts); "Learning
 * gaps" reuses each student's real weakest Learning Readiness areas. */
export function StudentsNeedingLearningSupport({
  outcomes,
  confirmations,
}: {
  outcomes: StudentOutcome[];
  confirmations: OutcomeConfirmationState;
}) {
  const rows = [...outcomes]
    .filter((o) => effectiveBand(o, confirmations) !== "advanced" && effectiveBand(o, confirmations) !== "secure")
    .sort((a, b) => a.subjectScore - b.subjectScore)
    .slice(0, PREVIEW_COUNT);

  return (
    <section aria-label="Students needing learning support" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h2 className="font-heading font-extrabold text-[15px]">Students Needing Learning Support</h2>
        <DemoDataBadge />
      </div>
      <p className="text-[11.5px] text-muted-foreground mb-3">Top {PREVIEW_COUNT} students who may need support with this subject.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] min-w-[640px]">
          <thead className="text-muted-foreground">
            <tr className="text-left border-b border-border/60">
              <th className="py-2 pr-3 font-bold text-[10.5px] uppercase tracking-[0.08em]">Student</th>
              <th className="py-2 px-3 font-bold text-[10.5px] uppercase tracking-[0.08em]">Current Band</th>
              <th className="py-2 px-3 font-bold text-[10.5px] uppercase tracking-[0.08em]">Movement</th>
              <th className="py-2 px-3 font-bold text-[10.5px] uppercase tracking-[0.08em]">Learning Gaps</th>
              <th className="py-2 pl-3 font-bold text-[10.5px] uppercase tracking-[0.08em]">Teacher Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const band = effectiveBand(row, confirmations);
              const confirmed = confirmations[row.student.id]?.status === "confirmed";
              return (
                <tr key={row.student.id} className="border-b border-border/40 last:border-0">
                  <td className="py-2.5 pr-3">
                    <Link href={`/students/${row.student.id}?tab=overview`} className="flex items-center gap-2.5 min-w-0 hover:text-primary transition-colors">
                      <StudentAvatar student={row.student} size="sm" />
                      <span className="font-semibold truncate">{row.student.name}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                      style={{ background: `color-mix(in srgb, ${BAND_TONE[band]} 14%, transparent)`, color: BAND_TONE[band] }}
                    >
                      {BAND_LABEL[band]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <MovementChip movement={row.movement} />
                  </td>
                  <td className="py-2.5 px-3">
                    {row.relatedAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.relatedAreas.map((key) => (
                          <span key={key} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                            {LEARNING_AREA_LABEL[key]}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pl-3">
                    {confirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(142_55%_40%)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link href="/students" className="mt-3 inline-block text-[12px] font-bold text-primary hover:underline">
        View all students →
      </Link>
    </section>
  );
}

function MovementChip({ movement }: { movement: StudentOutcome["movement"] }) {
  if (movement === "moving-up") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(142_55%_40%)]">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {MOVEMENT_LABEL[movement]}
      </span>
    );
  }
  if (movement === "slipping") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(0_78%_50%)]">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {MOVEMENT_LABEL[movement]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
      <Equal className="h-3.5 w-3.5" />
      {MOVEMENT_LABEL[movement]}
    </span>
  );
}
