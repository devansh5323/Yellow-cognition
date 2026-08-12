"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  ExternalLink,
  HelpCircle,
  PauseCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Section, FieldLabel, OptionChip } from "@/components/dashboard/behaviorFormShared";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { addNote } from "@/lib/studentMutations";
import {
  getPendingFollowUps,
  getSupportOptions,
  logFollowUp,
  IMPLEMENTATION_OPTIONS,
  OUTCOME_OPTIONS,
  NEXT_STEP_OPTIONS,
  type ImplementationStatus,
  type OutcomeStatus,
  type NextStep,
  type PendingFollowUp,
} from "@/lib/interventionFollowUps";
import { STUDENTS, type RiskReason } from "@/data/mockData";

type OpenDetail = { studentId?: string; reason?: RiskReason };

const OUTCOME_ICONS: Record<OutcomeStatus, LucideIcon> = {
  Improved: TrendingUp,
  "No change": Circle,
  "Got worse": TrendingDown,
  "Too early to tell": HelpCircle,
};

const NEXT_STEP_ICONS: Record<NextStep, LucideIcon> = {
  Continue: CheckCircle2,
  "Adjust strategy": Wrench,
  "Escalate to Tier 2": ArrowUpCircle,
  "Escalate to Tier 3": ArrowUpCircle,
  "Involve special educator": Users,
  "Close support": PauseCircle,
};

export function InterventionFollowUpForm() {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [initial, setInitial] = useState<OpenDetail>({});

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenDetail>).detail ?? {};
      setInitial(detail);
      setSessionKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener("ah-open-followup-form", onOpen);
    return () => window.removeEventListener("ah-open-followup-form", onOpen);
  }, []);

  return (
    <InterventionFollowUpDialog key={sessionKey} open={open} onOpenChange={setOpen} initial={initial} />
  );
}

function InterventionFollowUpDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OpenDetail;
}) {
  const router = useRouter();
  // Remounted via the sessionKey on every open, so this always reflects the
  // latest pending queue without needing to re-derive on other renders.
  const pending = useMemo(() => getPendingFollowUps(), []);

  const initialSelected = useMemo(() => {
    if (!initial.studentId) return null;
    const student = STUDENTS.find((s) => s.id === initial.studentId);
    if (!student) return null;
    const reason = initial.reason ?? pending.find((p) => p.student.id === student.id)?.reason;
    return reason ? { student, reason } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.studentId, initial.reason]);

  const [selected, setSelected] = useState<PendingFollowUp | null>(initialSelected);
  const [support, setSupport] = useState<string | null>(null);
  const [implementation, setImplementation] = useState<ImplementationStatus | null>(null);
  const [teacherResponse, setTeacherResponse] = useState("");
  const [outcome, setOutcome] = useState<OutcomeStatus | null>(null);
  const [evidence, setEvidence] = useState("");
  const [note, setNote] = useState("");
  const [nextStep, setNextStep] = useState<NextStep | null>(null);
  const [saved, setSaved] = useState(false);

  const supportOptions = selected ? getSupportOptions(selected.reason) : [];

  function handleSave() {
    if (!selected) return;
    if (!support) {
      toast.error("Select which support you're following up on.");
      return;
    }
    if (!implementation) {
      toast.error("Record whether it was implemented.");
      return;
    }
    if (!teacherResponse.trim()) {
      toast.error("Record how you responded.");
      return;
    }
    if (!outcome) {
      toast.error("Record the outcome.");
      return;
    }
    if (!evidence.trim()) {
      toast.error("Add the evidence you noticed.");
      return;
    }
    if (!nextStep) {
      toast.error("Choose a next step.");
      return;
    }

    logFollowUp({
      studentId: selected.student.id,
      reason: selected.reason,
      support,
      implementation,
      teacherResponse: teacherResponse.trim(),
      outcome,
      evidence: evidence.trim(),
      note: note.trim() || undefined,
      nextStep,
    });

    addNote(selected.student.id, {
      category: "Behavior",
      body: [
        `Follow-up on: ${support}`,
        `Implementation: ${implementation}`,
        `Teacher response: ${teacherResponse.trim()}`,
        `Outcome: ${outcome}`,
        `Evidence: ${evidence.trim()}`,
        note.trim() ? `Note: ${note.trim()}` : null,
        `Next step: ${nextStep}`,
      ]
        .filter(Boolean)
        .join(" · "),
      tag: nextStep,
      sharedWithParent: false,
    });

    setSaved(true);
    toast.success(`Follow-up logged for ${selected.student.name}`, {
      description: `Next step: ${nextStep}`,
    });
  }

  function handleOpenProfile() {
    if (!selected) return;
    onOpenChange(false);
    router.push(`/students/${selected.student.id}`);
  }

  function handleLogAnother() {
    setSelected(null);
    setSupport(null);
    setImplementation(null);
    setTeacherResponse("");
    setOutcome(null);
    setEvidence("");
    setNote("");
    setNextStep(null);
    setSaved(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 gap-0">
        <div className="flex flex-col max-h-[85vh]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="font-heading text-[18px] font-extrabold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Intervention Follow-Up
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Review a recommended support, record what happened, and choose the next step.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {!selected ? (
              <PendingList pending={pending} onSelect={setSelected} />
            ) : saved ? (
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 text-center space-y-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div>
                  <div className="font-heading font-bold text-[14px]">
                    Follow-up logged for {selected.student.name}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1">
                    Next step: {nextStep} — driver cards and pattern insights will reflect this.
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleOpenProfile} className="gap-1.5">
                    View profile
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" onClick={handleLogAnother} className="gap-1.5">
                    Log another follow-up
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StudentAvatar student={selected.student} size="sm" />
                    <div className="min-w-0 leading-tight">
                      <div className="text-[13px] font-semibold truncate">{selected.student.name}</div>
                      <div className="text-[10.5px] text-muted-foreground truncate">
                        Flagged for {selected.reason}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Change
                  </button>
                </div>

                <Section step={1} title="Select an active support" required>
                  <div className="flex flex-wrap gap-2">
                    {supportOptions.map((s) => (
                      <OptionChip
                        key={s}
                        label={s}
                        selected={support === s}
                        onClick={() => setSupport(s)}
                      />
                    ))}
                  </div>
                </Section>

                <Section step={2} title="Was it implemented?" required>
                  <div className="flex flex-wrap gap-2">
                    {IMPLEMENTATION_OPTIONS.map((i) => (
                      <OptionChip
                        key={i}
                        label={i}
                        selected={implementation === i}
                        onClick={() => setImplementation(i)}
                      />
                    ))}
                  </div>
                </Section>

                <Section step={3} title="How did you respond?" required>
                  <Textarea
                    value={teacherResponse}
                    onChange={(e) => setTeacherResponse(e.target.value.slice(0, 250))}
                    placeholder="What did you say or do when this came up? e.g. Reminded him to use his noise-cancelling headphones."
                    rows={2}
                    className="text-[12.5px]"
                  />
                  <div className="text-right text-[10.5px] text-muted-foreground mt-1">
                    {teacherResponse.length}/250
                  </div>
                </Section>

                <Section step={4} title="What was the outcome?" required>
                  <div className="flex flex-wrap gap-2">
                    {OUTCOME_OPTIONS.map((o) => (
                      <OptionChip
                        key={o}
                        label={o}
                        Icon={OUTCOME_ICONS[o]}
                        selected={outcome === o}
                        onClick={() => setOutcome(o)}
                      />
                    ))}
                  </div>
                </Section>

                <Section step={5} title="Evidence noticed" required>
                  <Textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value.slice(0, 250))}
                    placeholder="What did you observe that shows improvement or no improvement?"
                    rows={2}
                    className="text-[12.5px]"
                  />
                  <div className="text-right text-[10.5px] text-muted-foreground mt-1">
                    {evidence.length}/250
                  </div>
                </Section>

                <Section step={6} title="Next step" required>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {NEXT_STEP_OPTIONS.map((n) => {
                      const Icon = NEXT_STEP_ICONS[n];
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNextStep(n)}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11.5px] font-semibold transition-colors ${
                            nextStep === n
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <div className="rounded-2xl border border-border bg-background p-3.5">
                  <div className="text-[12.5px] font-bold mb-1.5">Add a note (optional)</div>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 250))}
                    placeholder="Anything else worth recording about this follow-up…"
                    rows={2}
                    className="text-[12.5px]"
                  />
                  <div className="text-right text-[10.5px] text-muted-foreground mt-1">
                    {note.length}/250
                  </div>
                </div>
              </>
            )}
          </div>

          {selected && !saved && (
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                Log follow-up
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PendingList({
  pending,
  onSelect,
}: {
  pending: PendingFollowUp[];
  onSelect: (item: PendingFollowUp) => void;
}) {
  if (pending.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 text-center">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <p className="text-[12.5px] font-semibold mt-2">No pending follow-ups right now.</p>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel>Pending follow-ups</FieldLabel>
      <ul className="space-y-2">
        {pending.map((p) => (
          <li key={`${p.student.id}:${p.reason}`}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <StudentAvatar student={p.student} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{p.student.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">Flagged for {p.reason}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
