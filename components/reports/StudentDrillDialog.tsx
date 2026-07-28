"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import type { Student } from "@/data/mockData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  students: Student[];
  metricLabel?: string;
  metricValue?: (s: Student) => string | number;
  footer?: React.ReactNode;
}

export function StudentDrillDialog({
  open, onOpenChange, title, description, students, metricLabel, metricValue, footer,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>
            {description ?? `${students.length} student${students.length === 1 ? "" : "s"} contributing to this metric.`}
          </DialogDescription>
        </DialogHeader>
        {students.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No students match this segment.</div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <ul className="space-y-1.5">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/students/${s.id}?tab=overview`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <StudentAvatar student={s} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.grade} · {s.section}</div>
                    </div>
                    {metricLabel && metricValue ? (
                      <div className="text-right">
                        <div className="font-heading font-bold text-sm tabular-nums">{metricValue(s)}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{metricLabel}</div>
                      </div>
                    ) : (
                      <RiskBadge risk={s.risk} />
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
        {footer && <div className="mt-3 pt-3 border-t border-border/60">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
