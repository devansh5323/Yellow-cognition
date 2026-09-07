"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel } from "@/components/dashboard/behaviorFormShared";
import { type Grade } from "@/data/mockData";
import {
  createProgram,
  programGradeOptions,
  programTeacherOptions,
  weeksForFocus,
  PROGRAM_DURATIONS,
  PROGRAM_FOCUS_OPTIONS,
  PROGRAM_FREQUENCIES,
  type ProgramFrequency,
} from "@/lib/selProgram";
import { type SelCompetency } from "@/lib/selPulse";

/** Extracted from app/sel/planner/page.tsx so it can also be mounted
 * directly on the SEL dashboard (SelDashboardTour's "Set up SEL
 * implementation" step) without navigating away from the dashboard first. */
export function CreateProgramDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const gradeOptions = useMemo(() => programGradeOptions(), []);
  const teacherOptions = useMemo(() => programTeacherOptions(), []);
  const [grade, setGrade] = useState<Grade | null>(gradeOptions[0] ?? null);
  const [focus, setFocus] = useState<SelCompetency>(PROGRAM_FOCUS_OPTIONS[0]);
  const [frequency, setFrequency] = useState<ProgramFrequency>("Weekly");
  const [assignedTeacher, setAssignedTeacher] = useState<string | null>(teacherOptions[0] ?? null);
  const [duration, setDuration] = useState<number>(6);

  const preview = useMemo(() => weeksForFocus(focus, duration), [focus, duration]);
  const canSubmit = grade !== null && assignedTeacher !== null;

  const submit = () => {
    if (!grade || !assignedTeacher) return;
    createProgram({ grade, focus, frequency, assignedTeacher, duration });
    toast.success("Program created as a draft", { description: "Assign it from the list to notify teachers." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create an SEL program</DialogTitle>
          <DialogDescription>
            Pick a grade, focus, frequency, and teacher — the week-by-week plan builds itself.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Grade</FieldLabel>
              <Select value={grade ?? undefined} onValueChange={(v) => setGrade(v as Grade)}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>SEL focus</FieldLabel>
              <Select value={focus} onValueChange={(v) => setFocus(v as SelCompetency)}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_FOCUS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Frequency</FieldLabel>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as ProgramFrequency)}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>Duration</FieldLabel>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} weeks
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel required>Assigned teacher</FieldLabel>
            <Select value={assignedTeacher ?? undefined} onValueChange={(v) => setAssignedTeacher(v)}>
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teacherOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel>Week-by-week plan</FieldLabel>
            <ol className="mt-1.5 space-y-1 rounded-xl border border-border bg-background p-3">
              {preview.map((w) => (
                <li key={w.week} className="flex items-baseline gap-2 text-[12px]">
                  <span className="font-bold text-muted-foreground shrink-0">Week {w.week}</span>
                  <span>{w.title}</span>
                </li>
              ))}
            </ol>
          </div>

          <Button className="w-full" disabled={!canSubmit} onClick={submit}>
            Create program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
