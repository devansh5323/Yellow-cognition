"use client";

import Link from "next/link";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { TASK_STATUS_TONE, demoTaskSupportDetail, type TaskSupport } from "@/lib/classTask";

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
            Ranked by real task engagement score, lowest first. Major area / suggested focus per student is a demo estimate.
          </p>
        </div>
        <DemoDataBadge label="Per-area detail is demo" />
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
          <table className="w-full text-[13px] min-w-[860px]">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Student</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[100px]">Score</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[170px]">
                  Major Area Needing Support
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[200px]">
                  What This Looks Like
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[200px]">
                  Suggested Focus
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tone = TASK_STATUS_TONE[item.status];
                const detail = demoTaskSupportDetail(item.student.id);
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
                        {item.score}
                      </span>
                    </td>

                    <td className="p-3 align-middle text-[12px] font-semibold text-foreground/85">{detail.majorAreaLabel}</td>
                    <td className="p-3 align-middle text-[11.5px] text-muted-foreground leading-snug">{detail.whatThisLooksLike}</td>
                    <td className="p-3 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {detail.suggestedFocus.map((skill) => (
                          <span key={skill} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
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
