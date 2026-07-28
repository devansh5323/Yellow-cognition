"use client";

import Link from "next/link";
import { STUDENTS, studentMonitorRow } from "@/data/mockData";
import { StudentAvatar } from "./StudentAvatar";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONE = {
  Thriving: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  "On Track": "bg-sky-500/15 text-sky-700 border-sky-500/30",
  "Needs Support": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "At Risk": "bg-rose-500/15 text-rose-700 border-rose-500/30",
} as const;

const COMPLIANCE_TONE = {
  HIGH: "text-emerald-700",
  MEDIUM: "text-amber-700",
  LOW: "text-rose-700",
} as const;

export function StudentMonitorTable() {
  const rows = STUDENTS.slice(0, 8).map(studentMonitorRow);
  return (
    <section className="premium-elevated rounded-[22px] p-5 md:p-6">
      <div className="premium-section-header mb-4">
        <div>
          <h2 className="premium-eyebrow">Student attention monitor</h2>
          <h3 className="font-heading font-extrabold text-[18px] mt-1.5">Live class snapshot</h3>
        </div>
        <Link href="/students" className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80">
          Full roster <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              <th className="text-left px-2 py-2">Student</th>
              <th className="text-left px-2 py-2">Status</th>
              <th className="text-right px-2 py-2">CSI</th>
              <th className="text-right px-2 py-2">Trend</th>
              <th className="text-left px-2 py-2">Compliance</th>
              <th className="text-right px-2 py-2">Self-Reg</th>
              <th className="text-right px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar student={r.student} size="sm" />
                    <span className="font-semibold truncate">{r.student.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full border", STATUS_TONE[r.status])}>
                    {r.status}
                  </span>
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold">{r.csi}</td>
                <td className="px-2 py-2 text-right">
                  <span className={cn("inline-flex items-center gap-0.5 font-bold tabular-nums text-[12px]", r.trend >= 0 ? "text-emerald-700" : "text-rose-700")}>
                    {r.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(r.trend)}
                  </span>
                </td>
                <td className={cn("px-2 py-2 font-bold text-[11.5px]", COMPLIANCE_TONE[r.compliance])}>{r.compliance}</td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold">{r.selfReg}%</td>
                <td className="px-2 py-2 text-right">
                  <Link
                    href={`/students/${r.student.id}?tab=profile`}
                    className="text-[12px] font-semibold text-primary hover:text-primary/80"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
