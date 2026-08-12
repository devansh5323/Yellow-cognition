"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel } from "@/components/dashboard/behaviorFormShared";
import { type Grade } from "@/data/mockData";
import {
  createProgram,
  assignProgram,
  getPrograms,
  programGradeOptions,
  weeksForFocus,
  PROGRAM_DURATIONS,
  PROGRAM_FOCUS_OPTIONS,
  type SelProgram,
} from "@/lib/selProgram";
import { type SelCompetency } from "@/lib/selPulse";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <SelAppShell>
      <ProgramPlanner />
    </SelAppShell>
  );
}

function ProgramPlanner() {
  const reduce = useReducedMotion();

  const [programs, setPrograms] = useState<SelProgram[]>([]);
  useEffect(() => {
    const refresh = () => setPrograms(getPrograms());
    refresh();
    window.addEventListener("ah-sel-program-change", refresh);
    return () => window.removeEventListener("ah-sel-program-change", refresh);
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <BookOpen className="h-3 w-3" />
            <span>SEL Program &amp; Lesson Planner</span>
          </div>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Plan a Tier 1 SEL program
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
            Build a multi-week program, then assign it to a grade — teachers see it on their dashboard once it&apos;s live.
          </p>
        </header>
        <Button
          onClick={() => {
            setCreateKey((k) => k + 1);
            setCreateOpen(true);
          }}
          className="gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create program
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Programs</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Created &amp; assigned</h3>
        </header>

        {programs.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No programs yet — create one to start planning.</p>
        ) : (
          <ul className="space-y-3">
            {programs.map((p) => (
              <li key={p.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[13.5px]">{p.grade}</span>
                      <span className="text-[12px] text-muted-foreground">·</span>
                      <span className="text-[12.5px] font-semibold">{p.focus}</span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]",
                          p.status === "assigned"
                            ? "bg-[hsl(142_55%_45%/0.12)] text-[hsl(142_55%_38%)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.status === "assigned" ? "Assigned" : "Draft"}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">{p.duration}-week program</p>
                  </div>
                  {p.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        assignProgram(p.id);
                        toast.success("Program assigned", {
                          description: `${p.grade} teachers will see this program on their dashboard.`,
                        });
                      }}
                    >
                      Assign to {p.grade}
                    </Button>
                  )}
                </div>

                <ol className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {p.weeks.map((w) => (
                    <li key={w.week} className="flex items-baseline gap-2 text-[12px]">
                      <span className="font-bold text-muted-foreground shrink-0">Week {w.week}</span>
                      <span className="text-foreground/85">{w.title}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreateProgramDialog key={createKey} open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}

function CreateProgramDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const gradeOptions = useMemo(() => programGradeOptions(), []);
  const [grade, setGrade] = useState<Grade | null>(gradeOptions[0] ?? null);
  const [focus, setFocus] = useState<SelCompetency>(PROGRAM_FOCUS_OPTIONS[0]);
  const [duration, setDuration] = useState<number>(6);

  const preview = useMemo(() => weeksForFocus(focus, duration), [focus, duration]);

  const submit = () => {
    if (!grade) return;
    createProgram({ grade, focus, duration });
    toast.success("Program created as a draft", { description: "Assign it from the list to notify teachers." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create an SEL program</DialogTitle>
          <DialogDescription>Pick a grade, focus, and duration — the week-by-week plan builds itself.</DialogDescription>
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
            <FieldLabel required>Focus</FieldLabel>
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

          <Button className="w-full" disabled={!grade} onClick={submit}>
            Create program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
