"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FieldLabel, OptionChip } from "@/components/dashboard/behaviorFormShared";
import { type Grade } from "@/data/mockData";
import {
  sendPulse,
  pulseGradeOptions,
  RECOMMENDED_PULSE_AREAS,
  suggestedPulseCompetencies,
  type SelCompetency,
  type PulseFormat,
} from "@/lib/selPulse";
import { classroomImplementationRows, type ClassroomImplementation } from "@/lib/selImplementation";
import { getSelOnboarding } from "@/lib/selOnboarding";

type PulseAudience = "school" | "grades" | "classrooms";

function formatForCompetencyCount(n: number): PulseFormat {
  if (n <= 4) return "4-question";
  if (n <= 6) return "6-question";
  return "8-question";
}

function tomorrowDateInputValue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** The simplified "first meaningful product action" flow: what to check in
 * on (pre-filled from Action 1's monitor-focus picks), who receives it,
 * and when — Yellow fills in the day/frequency/question-format details so
 * the coordinator never has to author a pulse from scratch. Sends one real
 * Pulse per resolved grade, since every downstream score in this app is
 * grade-keyed (a "whole school" or "selected classrooms" pulse still
 * ultimately becomes one real pulse per grade touched).
 *
 * Extracted from app/sel/pulse/page.tsx so it can also be mounted directly
 * on the SEL dashboard (SelDashboardTour's "Launch your first SEL Pulse"
 * step) without navigating away from the dashboard first. */
export function CreatePulseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  // Remounted fresh each time it opens (parent bumps a `key`), same pattern
  // as InterventionFollowUpForm's sessionKey — so plain initial state here
  // is enough; no reset-on-open effect needed.
  const gradeOptions = useMemo(() => pulseGradeOptions(), []);
  const classroomRows = useMemo(() => classroomImplementationRows(), []);
  const monitorFocus = useMemo(() => getSelOnboarding().monitorFocus ?? [], []);

  const [title, setTitle] = useState("Weekly Student Well-Being Pulse");
  const [competencies, setCompetencies] = useState<SelCompetency[]>(() =>
    suggestedPulseCompetencies(monitorFocus),
  );

  const [audience, setAudience] = useState<PulseAudience>("school");
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);

  const [timing, setTiming] = useState<"now" | "schedule">("now");
  const [scheduledFor, setScheduledFor] = useState(tomorrowDateInputValue());

  const toggleCompetency = (c: SelCompetency) => {
    setCompetencies((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleGrade = (g: Grade) => {
    setSelectedGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };
  const toggleClassroom = (c: string) => {
    setSelectedClassrooms((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const resolvedGrades = useMemo<Grade[]>(() => {
    if (audience === "school") return gradeOptions;
    if (audience === "grades") return selectedGrades;
    const grades = new Set(
      classroomRows.filter((r) => selectedClassrooms.includes(r.classroom)).map((r) => r.grade),
    );
    return Array.from(grades);
  }, [audience, gradeOptions, selectedGrades, selectedClassrooms, classroomRows]);

  const canSubmit =
    title.trim().length > 0 &&
    competencies.length > 0 &&
    resolvedGrades.length > 0 &&
    (timing === "now" || scheduledFor.length > 0);

  const submit = () => {
    if (!canSubmit) return;
    const format = formatForCompetencyCount(competencies.length);
    for (const grade of resolvedGrades) {
      sendPulse(
        { title, grade, day: "Friday", frequency: "Weekly", format, competencies },
        { scheduledFor: timing === "schedule" ? scheduledFor : undefined },
      );
    }
    const gradeCount = resolvedGrades.length;
    toast.success(timing === "now" ? "Pulse sent" : "Pulse scheduled", {
      description:
        timing === "now"
          ? `${gradeCount} grade${gradeCount === 1 ? "" : "s"} will start receiving this pulse.`
          : `Scheduled for ${new Date(scheduledFor).toLocaleDateString()}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create SEL Pulse</DialogTitle>
          <DialogDescription>
            Yellow pre-builds the questions — just tell it who and when.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <FieldLabel required>What do you want to check in on?</FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {RECOMMENDED_PULSE_AREAS.map((c) => (
                <OptionChip
                  key={c}
                  label={c}
                  Icon={competencies.includes(c) ? CheckCircle2 : undefined}
                  selected={competencies.includes(c)}
                  onClick={() => toggleCompetency(c)}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel required>Who should receive it?</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(
                [
                  { key: "school", label: "Whole school" },
                  { key: "grades", label: "Selected grades" },
                  { key: "classrooms", label: "Selected classrooms" },
                ] as { key: PulseAudience; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAudience(opt.key)}
                  data-active={audience === opt.key}
                  className="premium-pill !h-8 !px-3 !text-[12px]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {audience === "grades" && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {gradeOptions.map((g) => (
                  <OptionChip key={g} label={g} selected={selectedGrades.includes(g)} onClick={() => toggleGrade(g)} />
                ))}
              </div>
            )}
            {audience === "classrooms" && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {classroomRows.map((r: ClassroomImplementation) => (
                  <OptionChip
                    key={r.classroom}
                    label={`${r.classroom} · ${r.teacher}`}
                    selected={selectedClassrooms.includes(r.classroom)}
                    onClick={() => toggleClassroom(r.classroom)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <FieldLabel required>When?</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setTiming("now")}
                data-active={timing === "now"}
                className="premium-pill !h-8 !px-3 !text-[12px]"
              >
                Send now
              </button>
              <button
                type="button"
                onClick={() => setTiming("schedule")}
                data-active={timing === "schedule"}
                className="premium-pill !h-8 !px-3 !text-[12px]"
              >
                Schedule
              </button>
            </div>
            {timing === "schedule" && (
              <Input
                type="date"
                value={scheduledFor}
                min={tomorrowDateInputValue()}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="mt-2 h-9 w-auto"
              />
            )}
          </div>

          <Button className="w-full" disabled={!canSubmit} onClick={submit}>
            Send pulse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
