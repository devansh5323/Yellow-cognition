"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { studentAttentionDomains, type Student, type AttentionDomainKey } from "@/data/mockData";
import type { FocusDomainStat } from "@/lib/classFocus";

export function AttentionSubDomainDrawer({
  open,
  onOpenChange,
  domain,
  domainKey,
  students,
  interventions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: FocusDomainStat | null;
  domainKey: AttentionDomainKey | null;
  students: Student[];
  interventions: string[];
}) {
  const delta = domain ? domain.score - domain.prevScore : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
          <SheetTitle className="font-heading font-extrabold text-[17px]">
            {domain ? `${domain.label} — affected students` : ""}
          </SheetTitle>
          <SheetDescription className="text-[12.5px]">
            {domain
              ? students.length === 0
                ? "No students are currently below threshold for this sub-domain."
                : `${students.length} student${students.length === 1 ? "" : "s"} scoring below 55 on ${domain.label}.`
              : ""}
          </SheetDescription>
        </SheetHeader>

        {domain && (
          <div className="p-5 space-y-5">
            {/* Evidence */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                Evidence
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-[12.5px] leading-snug">
                  <span
                    className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: domain.hue }}
                  />
                  <span>
                    Class average is{" "}
                    <span className="font-bold" style={{ color: domain.hue }}>
                      {domain.score}
                    </span>{" "}
                    ({delta >= 0 ? "+" : ""}
                    {delta} vs last check-in).
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[12.5px] leading-snug">
                  <span
                    className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: domain.hue }}
                  />
                  <span>
                    <span className="font-bold" style={{ color: domain.hue }}>
                      {domain.atRiskCount}
                    </span>{" "}
                    student{domain.atRiskCount === 1 ? "" : "s"} ({domain.atRiskPct}% of class) score
                    below the 55 at-risk threshold.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[12.5px] leading-snug text-muted-foreground">
                  <span
                    className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: domain.hue }}
                  />
                  <span>{domain.description}</span>
                </li>
              </ul>
            </div>

            {/* Affected students */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                Affected students
              </div>
              {students.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">
                  No students match this segment.
                </p>
              ) : (
                <ScrollArea className="max-h-[320px] pr-2">
                  <ul className="space-y-1">
                    {students.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/students/${s.id}?tab=overview`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
                        >
                          <StudentAvatar student={s} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-semibold truncate">{s.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {s.grade} · {s.section}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className="font-heading font-bold text-[13px] tabular-nums"
                              style={{ color: domain.hue }}
                            >
                              {domainKey ? Math.round(studentAttentionDomains(s)[domainKey]) : ""}
                            </div>
                            <div className="text-[9.5px] text-muted-foreground uppercase tracking-wide">
                              score
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>

            {/* Recommended interventions */}
            {interventions.length > 0 && (
              <div className="pt-3 border-t border-border/60">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Recommended interventions
                </div>
                <ul className="space-y-1.5">
                  {interventions.map((i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-foreground/90"
                    >
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 mt-0.5"
                        style={{ color: domain.hue }}
                      />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
