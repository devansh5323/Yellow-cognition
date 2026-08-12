"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import type { ReviewQueueRow } from "@/lib/specialEdCaseload";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function ReviewQueueTable({
  rows,
  title = "Review Queue",
  subtitle = "Students needing review, sorted by urgency.",
  viewAllHref,
}: {
  rows: ReviewQueueRow[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label={title}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-start gap-2">
        <div className="flex-1">
          <div className="premium-eyebrow">
            <span>{title}</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">{subtitle}</h3>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[11.5px] font-bold text-primary hover:underline shrink-0 mt-1">
            View all →
          </Link>
        )}
      </header>

      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No students currently in the review queue.</p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[820px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 px-1 font-bold text-[10px] uppercase tracking-[0.10em]">Student</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[110px]">Pathway</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Main concern</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Evidence source</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[110px]">Status</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[90px]">Next review</th>
                <th className="py-2 w-[132px]" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.studentId}
                  initial={reduce ? undefined : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                  onClick={() => router.push(`/specialist/students/${row.studentId}`)}
                  className={cn(
                    "border-t border-border/50 cursor-pointer hover:bg-muted/40 transition-colors",
                    i % 2 === 1 && "bg-muted/[0.15]",
                  )}
                >
                  <td
                    className="py-2.5 pr-3 px-1 align-middle"
                    style={{ boxShadow: `inset 2.5px 0 0 0 color-mix(in srgb, ${row.statusTone} 70%, transparent)` }}
                  >
                    <div className="flex items-center gap-2.5 pl-1.5">
                      <StudentAvatar student={row.student} size="sm" />
                      <div className="min-w-0">
                        <div className="font-bold truncate">{row.student.name}</div>
                        <div className="text-[10.5px] text-muted-foreground">
                          {row.student.grade} · {row.student.section}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 align-middle text-muted-foreground italic">{row.pathway}</td>
                  <td className="py-2.5 pr-3 align-middle text-foreground/85">{row.concern}</td>
                  <td className="py-2.5 pr-3 align-middle text-muted-foreground">{row.evidenceSource}</td>
                  <td className="py-2.5 pr-3 align-middle">
                    <span
                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold whitespace-nowrap"
                      style={{ color: row.statusTone, background: `color-mix(in srgb, ${row.statusTone} 12%, transparent)` }}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 align-middle text-muted-foreground whitespace-nowrap">
                    {row.nextReview
                      ? new Date(row.nextReview).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td className="py-2.5 align-middle">
                    <Link
                      href={`/specialist/students/${row.studentId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 justify-center h-7 rounded-lg px-2.5 text-[11px] font-bold border shrink-0 whitespace-nowrap"
                      style={{ borderColor: `color-mix(in srgb, ${row.statusTone} 40%, transparent)`, color: row.statusTone }}
                    >
                      {row.actionLabel}
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
