"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel, OptionChip } from "@/components/dashboard/behaviorFormShared";
import { STUDENTS, type Student } from "@/data/mockData";
import { SEL_COMPETENCIES, type SelCompetency } from "@/lib/selPulse";
import { needsTeacherOptions } from "@/lib/selNeeds";
import { createGroup, GROUP_FREQUENCIES, type GroupFrequency } from "@/lib/selGroups";

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysFromNowInputValue(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Extracted from app/sel/groups/page.tsx so it can also be mounted
 * directly on the SEL dashboard (SelDashboardTour's "Track targeted
 * support" step) without navigating away from the dashboard first. */
export function CreateGroupDialog({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefill: { targetSkill: SelCompetency; studentIds: string[] } | null;
}) {
  const teacherOptions = useMemo(() => needsTeacherOptions(), []);
  const [name, setName] = useState("");
  const [targetSkill, setTargetSkill] = useState<SelCompetency>(prefill?.targetSkill ?? SEL_COMPETENCIES[0]);
  const [facilitator, setFacilitator] = useState(teacherOptions[0] ?? "");
  const [frequency, setFrequency] = useState<GroupFrequency>("Weekly");
  const [sessionsPlanned, setSessionsPlanned] = useState(6);
  const [studentIds, setStudentIds] = useState<string[]>(prefill?.studentIds ?? []);
  const [startDate, setStartDate] = useState(todayDateInputValue());
  const [reviewDate, setReviewDate] = useState(daysFromNowInputValue(14));

  const toggleStudent = (id: string) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canSubmit =
    name.trim().length > 0 &&
    studentIds.length > 0 &&
    facilitator.length > 0 &&
    startDate.length > 0 &&
    reviewDate.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    createGroup({
      name: name.trim(),
      targetSkill,
      facilitator,
      studentIds,
      sessionsPlanned,
      frequency,
      startDate: new Date(startDate).toISOString(),
      reviewDate: new Date(reviewDate).toISOString(),
    });
    toast.success("Group created", { description: `${name.trim()} is now an active Tier 2 group.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Tier 2 group</DialogTitle>
          <DialogDescription>Name it, pick a target skill and facilitator, then choose students.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <FieldLabel required>Group name</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emotional Regulation Circle" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Target skill</FieldLabel>
              <Select value={targetSkill} onValueChange={(v) => setTargetSkill(v as SelCompetency)}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEL_COMPETENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>Facilitator</FieldLabel>
              <Select value={facilitator} onValueChange={setFacilitator}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue placeholder="Select facilitator" />
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Frequency</FieldLabel>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as GroupFrequency)}>
                <SelectTrigger className="h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>Sessions planned</FieldLabel>
              <Input
                type="number"
                min={1}
                value={sessionsPlanned}
                onChange={(e) => setSessionsPlanned(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Start date</FieldLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > reviewDate) setReviewDate(e.target.value);
                }}
              />
            </div>
            <div>
              <FieldLabel required>Review date</FieldLabel>
              <Input type="date" value={reviewDate} min={startDate} onChange={(e) => setReviewDate(e.target.value)} />
            </div>
          </div>

          <div>
            <FieldLabel required>Students ({studentIds.length} selected)</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1 max-h-40 overflow-y-auto">
              {STUDENTS.map((s: Student) => (
                <OptionChip
                  key={s.id}
                  label={s.name}
                  Icon={studentIds.includes(s.id) ? CheckCircle2 : undefined}
                  selected={studentIds.includes(s.id)}
                  onClick={() => toggleStudent(s.id)}
                />
              ))}
            </div>
          </div>

          <Button className="w-full" disabled={!canSubmit} onClick={submit}>
            Create group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
