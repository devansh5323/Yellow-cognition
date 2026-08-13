"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Plus, X } from "lucide-react";
import { Field, Eyebrow } from "@/components/onboarding/formPrimitives";
import { getBoardTaxonomy } from "@/lib/boardTaxonomy";
import type { OnboardingClassroom } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const GRADES = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export const PERIOD_PRESETS = [
  "Morning · 8:30–9:20",
  "Morning · 9:30–10:20",
  "Late morning · 10:30–11:20",
  "Afternoon · 12:30–1:20",
  "Afternoon · 1:30–2:20",
  "Evening · 2:30–3:20",
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export type NewClassroomInput = { grade: string; section: string; subjects: string[]; size: number; period: string };

/** Add-a-classroom form + list of already-added classrooms with remove —
 * shared between the (now-trimmed) onboarding wizard's preview and the
 * dashboard's ClassroomSetupPrompt, so a teacher can create more than one
 * classroom, each with its own grade/section/subjects. */
export function ClassroomForm({
  board,
  classrooms,
  onAdd,
  onRemove,
}: {
  board: string;
  classrooms: OnboardingClassroom[];
  onAdd: (input: NewClassroomInput) => void;
  onRemove: (id: string) => void;
}) {
  const taxonomy = useMemo(() => getBoardTaxonomy(board), [board]);

  const [draftGrade, setDraftGrade] = useState("3");
  const [draftSection, setDraftSection] = useState("");
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [draftSize, setDraftSize] = useState(24);
  const [draftPeriod, setDraftPeriod] = useState(PERIOD_PRESETS[0]);

  const canAddDraft = draftSubjects.length > 0;

  const handleAdd = () => {
    if (!canAddDraft) {
      toast("Select at least one subject", { description: "Pick what this classroom is taught before adding it." });
      return;
    }
    onAdd({ grade: draftGrade, section: draftSection, subjects: draftSubjects, size: draftSize, period: draftPeriod });
    toast.success(`Grade ${draftGrade}${draftSection ? ` — Section ${draftSection}` : ""} added`);
    setDraftSection("");
    setDraftSubjects([]);
  };

  return (
    <div className="space-y-5">
      {classrooms.length > 0 && (
        <div>
          <Eyebrow>Your classrooms ({classrooms.length})</Eyebrow>
          <div className="space-y-2">
            {classrooms.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[13px]">
                    Grade {c.grade} · Section {c.section}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground truncate">
                    {c.subjects.join(", ")} · {c.size} students
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  aria-label={`Remove Grade ${c.grade} Section ${c.section}`}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-border p-4 sm:p-5 space-y-5">
        <div className="text-[12.5px] font-bold text-foreground/80">Add a classroom</div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Eyebrow>Grade</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setDraftGrade(g)}
                  data-active={draftGrade === g}
                  className="premium-pill !px-3 !h-9 !text-[12.5px]"
                  aria-pressed={draftGrade === g}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <Field label="Section (optional)">
            <input value={draftSection} onChange={(e) => setDraftSection(e.target.value)} placeholder="A" />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground">Subjects</div>
            {board.trim().length > 0 && (
              <span className="text-[10.5px] text-muted-foreground">
                Grading: <span className="font-semibold text-foreground/80">{taxonomy.creditLabel}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {taxonomy.subjects.map((s) => {
              const active = draftSubjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraftSubjects(toggle(draftSubjects, s))}
                  data-active={active}
                  className="premium-pill !px-3 !h-9 !text-[12.5px]"
                  aria-pressed={active}
                >
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Eyebrow>When does this class meet?</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDraftPeriod(p)}
                data-active={draftPeriod === p}
                className="premium-pill !px-3 !h-9 !text-[12px]"
                aria-pressed={draftPeriod === p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow>How many students?</Eyebrow>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={4}
              max={45}
              value={draftSize}
              onChange={(e) => setDraftSize(parseInt(e.target.value, 10))}
              className="ah-range flex-1 accent-primary"
            />
            <div className="font-heading font-extrabold text-[20px] tabular-nums w-16 text-right">
              {draftSize}
              <span className="text-[12px] text-muted-foreground font-bold ml-0.5">kids</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "w-full h-11 rounded-xl font-heading font-bold text-[13.5px] flex items-center justify-center gap-2 transition-colors",
            canAddDraft
              ? "bg-primary text-primary-foreground hover:brightness-95"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Plus className="h-4 w-4" />
          Add classroom
        </button>
      </div>
    </div>
  );
}
