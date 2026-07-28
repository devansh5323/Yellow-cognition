"use client";

import { useState } from "react";

import Link from "next/link";
import { ATTENTION_DOMAINS, studentAttentionDomains, studentMonitorRow, type Student } from "@/data/mockData";
import { StudentAvatar } from "./StudentAvatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, StickyNote, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

function barColor(v: number) {
  if (v >= 75) return "hsl(142 55% 45%)";
  if (v >= 60) return "hsl(38 92% 50%)";
  return "hsl(0 78% 58%)";
}

const COMPLIANCE_TONE = {
  HIGH: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  LOW: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
} as const;

function riskRail(risk: Student["risk"]): string {
  switch (risk) {
    case "at-risk":
      return "linear-gradient(90deg, transparent, hsl(0 78% 58% / 0.95), transparent)";
    case "high":
      return "linear-gradient(90deg, transparent, hsl(0 70% 62% / 0.8), transparent)";
    case "medium":
      return "linear-gradient(90deg, transparent, hsl(38 92% 55% / 0.85), transparent)";
    default:
      return "linear-gradient(90deg, transparent, hsl(142 55% 50% / 0.8), transparent)";
  }
}

export function StudentAttentionProfileCard({
  student,
  defaultOpen = true,
  onNote,
  onContact,
}: {
  student: Student;
  defaultOpen?: boolean;
  onNote?: (s: Student) => void;
  onContact?: (s: Student) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const domains = studentAttentionDomains(student);
  const row = studentMonitorRow(student);

  return (
    <div className="relative premium-elevated rounded-[18px] p-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[3px]" aria-hidden style={{ background: riskRail(student.risk) }} />
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 text-left">
        <StudentAvatar student={student} />
        <div className="flex-1 min-w-0">
          <div className="font-heading font-extrabold text-[14px] truncate">{student.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {student.grade} · CSI {row.csi} · {row.status}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <div className="mt-3 flex items-end gap-1.5 h-12">
        {ATTENTION_DOMAINS.map((d) => (
          <div key={d.key} className="flex-1 h-full flex flex-col items-center justify-end">
            <div
              className="w-full rounded-t-sm min-h-[2px]"
              style={{ height: `${domains[d.key]}%`, background: barColor(domains[d.key]) }}
              title={`${d.label}: ${Math.round(domains[d.key])}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {ATTENTION_DOMAINS.map((d) => (
          <div key={d.key} className="flex-1 text-center text-[8.5px] font-bold tracking-wider text-muted-foreground/80">
            {d.short}
          </div>
        ))}
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
          <div>
            <div className="text-[10.5px] font-bold tracking-wide uppercase text-muted-foreground mb-1">Core issues</div>
            <ul className="text-[12px] space-y-0.5 list-disc list-inside text-foreground/90">
              {row.coreIssues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10.5px] font-bold tracking-wide uppercase text-muted-foreground mb-1.5">Recommended games</div>
            <div className="flex flex-wrap gap-1.5">
              {row.recommendedGames.map((g) => (
                <span key={g} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted/50 border border-border/60 p-2.5">
              <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">Compliance</div>
              <span className={cn("inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border", COMPLIANCE_TONE[row.compliance])}>
                {row.compliance}
              </span>
            </div>
            <div className="rounded-xl bg-muted/50 border border-border/60 p-2.5">
              <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">Self-Reg</div>
              <div className="font-heading font-extrabold text-[16px] tabular-nums mt-0.5">{row.selfReg}%</div>
            </div>
          </div>

          {(onNote || onContact) && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2 gap-1 rounded-lg"
                onClick={() => onNote?.(student)}
                disabled={!onNote}
              >
                <StickyNote className="h-3 w-3" />
                Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2 gap-1 rounded-lg"
                onClick={() => onContact?.(student)}
                disabled={!onContact}
              >
                <Phone className="h-3 w-3" />
                Call
              </Button>
              <Link href={`/students/${student.id}?tab=profile`}>
                <Button size="sm" className="h-8 text-xs w-full px-2 rounded-lg shadow-[0_6px_14px_-6px_hsl(142_55%_35%/0.55)]">
                  View
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
