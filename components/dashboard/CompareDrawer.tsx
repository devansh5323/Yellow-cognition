"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StudentAvatar } from "./StudentAvatar";
import { RiskBadge } from "./RiskBadge";
import { NotEnoughData, NotEnoughDataPanel } from "./NotEnoughData";
import { scoreBand } from "@/lib/classHealth";
import type { Student } from "@/data/mockData";
import { X, Trophy, AlertTriangle } from "lucide-react";

export function CompareDrawer({
  open,
  onOpenChange,
  students,
  onRemove,
  onClear,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  students: Student[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const PALETTE = [
    "hsl(142 52% 48%)",
    "hsl(260 50% 60%)",
    "hsl(38 92% 55%)",
    "hsl(200 70% 55%)",
    "hsl(340 70% 60%)",
    "hsl(170 60% 45%)",
  ];

  const top = students.length
    ? [...students].sort((a, b) => b.studentHealthScore - a.studentHealthScore)[0]
    : null;
  const lowest = students.length
    ? [...students].sort((a, b) => a.studentHealthScore - b.studentHealthScore)[0]
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="font-heading font-extrabold text-xl">
                Compare students
              </SheetTitle>
              <SheetDescription>
                Side-by-side scores for {students.length} student{students.length !== 1 ? "s" : ""}.
              </SheetDescription>
            </div>
            {students.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
                Clear all
              </Button>
            )}
          </div>
          {/* Selection chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border bg-card"
                style={{ borderLeftColor: PALETTE[i % PALETTE.length], borderLeftWidth: 4 }}
              >
                <StudentAvatar student={s} size="sm" className="!h-6 !w-6 text-[10px]" />
                <span className="text-xs font-semibold">{s.name}</span>
                <button onClick={() => onRemove(s.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </SheetHeader>

        {students.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Select students using the checkboxes to compare.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* KPI grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-2 font-semibold">Student</th>
                    <th className="p-2 font-semibold">Health score</th>
                    <th className="p-2 font-semibold">Cognitive</th>
                    <th className="p-2 font-semibold">Wellbeing</th>
                    <th className="p-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className="bg-muted/40">
                      <td className="p-2 rounded-l-lg">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-sm shrink-0"
                            style={{ background: PALETTE[i % PALETTE.length] }}
                          />
                          <StudentAvatar student={s} size="sm" className="!h-7 !w-7 text-[10px]" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground">{s.ageGroup}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center font-heading font-bold tabular-nums">
                        {s.studentHealthScore}
                      </td>
                      <td className="p-2 text-center font-semibold tabular-nums">
                        {s.cognitivePerformance.score}
                      </td>
                      <td className="p-2 text-center">
                        {s.studentWellbeing.score != null ? (
                          <span className="font-semibold tabular-nums">{s.studentWellbeing.score}</span>
                        ) : (
                          <NotEnoughData label="No data" />
                        )}
                      </td>
                      <td className="p-2 rounded-r-lg">
                        <RiskBadge band={scoreBand(s.studentHealthScore)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Highlights */}
            {students.length > 1 && top && lowest && top.id !== lowest.id && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Highest health score</div>
                    <div className="font-semibold text-sm truncate">{top.name} · {top.studentHealthScore}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Needs closest attention</div>
                    <div className="font-semibold text-sm truncate">{lowest.name} · {lowest.studentHealthScore}</div>
                  </div>
                </div>
              </div>
            )}

            {/* No real week-over-week or sub-domain history exists for this
                roster yet — shown honestly instead of the old fabricated
                monthly/weekly trend charts and sub-domain radar. */}
            <NotEnoughDataPanel
              title="No trend history yet"
              description="Monthly check-in trends and sub-domain breakdowns will appear here once this roster has more than one snapshot of data."
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
