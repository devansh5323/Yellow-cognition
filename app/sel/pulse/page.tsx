"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, HeartPulse, Plus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel, OptionChip } from "@/components/dashboard/behaviorFormShared";
import { type Grade } from "@/data/mockData";
import {
  assignPulse,
  sendPulse,
  getPulses,
  pulseGradeOptions,
  resultsForPulse,
  compareGrades,
  emergingPatternFor,
  RECOMMENDED_PULSE_AREAS,
  suggestedPulseCompetencies,
  PULSE_FORMATS,
  BAND_LABEL,
  BAND_TONE,
  type Pulse,
  type SelCompetency,
  type PulseFormat,
} from "@/lib/selPulse";
import { classroomImplementationRows, type ClassroomImplementation } from "@/lib/selImplementation";
import { getSelOnboarding } from "@/lib/selOnboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <SelAppShell>
      <Suspense fallback={null}>
        <PulsePage />
      </Suspense>
    </SelAppShell>
  );
}

function PulsePage() {
  const reduce = useReducedMotion();
  const searchParams = useSearchParams();
  const gradeParam = searchParams.get("grade") as Grade | null;

  const [pulses, setPulses] = useState<Pulse[]>([]);
  useEffect(() => {
    const refresh = () => setPulses(getPulses());
    refresh();
    window.addEventListener("ah-sel-pulse-change", refresh);
    return () => window.removeEventListener("ah-sel-pulse-change", refresh);
  }, []);

  const activeGrades = useMemo(
    () => Array.from(new Set(pulses.filter((p) => p.status === "active").map((p) => p.grade))).sort(),
    [pulses],
  );

  // No default-selection effect — an explicit click sets `selectedPulseId`;
  // until then this falls back to the grade passed in via `?grade=` (from
  // an Action Hub link) or the first active pulse, computed directly
  // during render rather than synced into state.
  const [selectedPulseId, setSelectedPulseId] = useState<string | null>(null);
  const selectedPulse =
    pulses.find((p) => p.id === selectedPulseId) ??
    (gradeParam ? pulses.find((p) => p.grade === gradeParam) : null) ??
    pulses.find((p) => p.status === "active") ??
    pulses[0] ??
    null;
  const results = useMemo(() => (selectedPulse ? resultsForPulse(selectedPulse) : []), [selectedPulse]);

  // Same reasoning — falls back to the selected pulse's first competency
  // whenever the override isn't valid for it, no effect required.
  const [compareCompetencyOverride, setCompareCompetencyOverride] = useState<SelCompetency | null>(null);
  const compareCompetency =
    compareCompetencyOverride && selectedPulse?.competencies.includes(compareCompetencyOverride)
      ? compareCompetencyOverride
      : selectedPulse?.competencies[0] ?? null;
  const comparison = useMemo(
    () => (compareCompetency ? compareGrades(compareCompetency, activeGrades) : []),
    [compareCompetency, activeGrades],
  );

  const patterns = useMemo(
    () => activeGrades.map((g) => emergingPatternFor(g)).filter((p): p is NonNullable<typeof p> => p !== null),
    [activeGrades],
  );

  // Dashboard entry points (School Snapshot, the setup queue, Action Hub's
  // "Take me there") link here with ?create=1 to drop the coordinator
  // straight into pulse creation instead of the list — read directly from
  // the already-Suspense-protected searchParams, same as gradeParam above,
  // rather than syncing it in via an effect.
  const [createOpen, setCreateOpen] = useState(() => searchParams.get("create") === "1");
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
            <HeartPulse className="h-3 w-3" />
            <span>SEL Pulse &amp; Check-in</span>
          </div>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            How are students feeling?
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
            Create a pulse, assign it to a grade, then watch results and emerging patterns over time.
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
          Create pulse
        </Button>
      </div>

      {/* Pulses list */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Pulses</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Created &amp; assigned</h3>
        </header>

        {pulses.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No pulses yet — create one to start collecting signals.</p>
        ) : (
          <ul className="space-y-2">
            {pulses.map((p) => {
              const active = p.id === selectedPulse?.id;
              return (
                <li
                  key={p.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    active ? "border-primary/50 bg-primary/[0.04]" : "border-border bg-background"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[13px]">{p.grade}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] ${
                          p.status === "active"
                            ? "bg-[hsl(142_55%_45%/0.12)] text-[hsl(142_55%_38%)]"
                            : p.status === "scheduled"
                              ? "bg-[hsl(38_92%_48%/0.12)] text-[hsl(38_92%_38%)]"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.status === "active" ? "Active" : p.status === "scheduled" ? "Scheduled" : "Draft"}
                      </span>
                      {p.status === "scheduled" && p.scheduledFor && (
                        <span className="text-[10.5px] text-muted-foreground">
                          for {new Date(p.scheduledFor).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                      {p.title} · {p.day} · {p.frequency} · {PULSE_FORMATS.find((f) => f.key === p.format)?.label}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground/80 mt-1">
                      {p.competencies.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          assignPulse(p.id);
                          toast.success("Pulse assigned", { description: `${p.grade} will be asked this ${p.day}.` });
                        }}
                      >
                        Assign
                      </Button>
                    )}
                    <Button size="sm" variant={active ? "default" : "outline"} onClick={() => setSelectedPulseId(p.id)}>
                      View results
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Results */}
      {selectedPulse && (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-4">
            <div className="premium-eyebrow">
              <span>Results — {selectedPulse.grade}</span>
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Latest week, by competency</h3>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {results.map((r) => (
              <div key={r.competency} className="rounded-xl border border-border bg-background p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground leading-snug">
                  {r.competency}
                </div>
                {r.score === null ? (
                  <div className="text-[13px] text-muted-foreground mt-1">No data yet</div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-heading font-extrabold text-[20px] tabular-nums">{r.score}</span>
                    {r.delta !== null && r.delta !== 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10.5px] font-bold"
                        style={{ color: r.delta > 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 56%)" }}
                      >
                        {r.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(r.delta)}
                      </span>
                    )}
                    {r.band && (
                      <span
                        className="ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{ background: `color-mix(in srgb, ${BAND_TONE[r.band]} 14%, transparent)`, color: BAND_TONE[r.band] }}
                      >
                        {BAND_LABEL[r.band]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compare grades */}
          {activeGrades.length > 1 && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h4 className="font-heading font-bold text-[12.5px]">Compare grades</h4>
                <Select
                  value={compareCompetency ?? undefined}
                  onValueChange={(v) => setCompareCompetencyOverride(v as SelCompetency)}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[150px] rounded-lg text-[12px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPulse.competencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                {comparison.map((row) => (
                  <div key={row.grade} className="flex items-center gap-2.5">
                    <span className="text-[11.5px] font-semibold w-16 shrink-0">{row.grade}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      {row.score !== null && (
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.score}%`, background: row.band ? BAND_TONE[row.band] : "hsl(220 12% 55%)" }}
                        />
                      )}
                    </div>
                    <span className="text-[11.5px] font-bold tabular-nums w-8 text-right shrink-0">
                      {row.score ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Emerging patterns */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <Sparkles className="h-3 w-3" />
            <span>Emerging Patterns</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Across active pulses</h3>
        </header>
        {patterns.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            Nothing trending yet — every tracked competency is holding steady across active grades.
          </p>
        ) : (
          <ul className="space-y-2">
            {patterns.map((p) => (
              <li
                key={`${p.grade}-${p.concernCompetency}`}
                className="flex items-start gap-2.5 rounded-xl border border-[hsl(0_78%_56%/0.25)] bg-[hsl(0_78%_56%/0.05)] p-3"
              >
                <TrendingUp className="h-4 w-4 text-[hsl(0_78%_56%)] shrink-0 mt-0.5" />
                <p className="text-[12.5px] leading-snug">{p.sentence}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreatePulseDialog key={createKey} open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}

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
 * ultimately becomes one real pulse per grade touched). */
function CreatePulseDialog({
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
