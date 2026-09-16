"use client";

import Link from "next/link";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE, type TaskSupport } from "@/lib/classTask";

export function TaskSupportTable({ items }: { items: TaskSupport[] }) {
  return (
    <section
      aria-label="Students needing task support"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-border/70 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Per-student review</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
            Students needing task support
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            Ranked by real task engagement score, lowest first.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="p-6">
          <NotEnoughDataPanel
            title="Not enough data yet"
            description="We don't have real task engagement scores for this roster yet."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Student</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[120px]">
                  Score
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[180px]">
                  Status
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[100px] text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tone = TASK_STATUS_TONE[item.status];
                return (
                  <tr
                    key={item.student.id}
                    className="border-t border-border/50 hover:bg-primary/[0.035] transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StudentAvatar student={item.student} size="sm" />
                        <Link
                          href={`/students/${item.student.id}?tab=overview`}
                          className="font-heading font-extrabold text-[13.5px] truncate leading-tight text-left hover:text-primary transition-colors"
                        >
                          {item.student.name}
                        </Link>
                      </div>
                    </td>

                    <td className="p-3 align-middle">
                      <span className="text-[12.5px] font-bold tabular-nums">{item.score}/100</span>
                    </td>

                    <td className="p-3 align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
                        style={{
                          color: tone,
                          background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 18%, transparent), color-mix(in srgb, ${tone} 6%, transparent))`,
                          border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
                          boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.45)",
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
                        {TASK_STATUS_LABEL[item.status]}
                      </span>
                    </td>

                    <td className="p-3 align-middle text-right">
                      <Link
                        href={`/students/${item.student.id}?tab=overview`}
                        className="text-[12px] font-bold text-primary hover:underline"
                      >
                        View student
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
