"use client";

import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { LEARNING_AREA_LABEL, type LearningAreaKey } from "@/lib/classLearning";
import {
  BAND_LABEL,
  BAND_ORDER,
  BAND_TONE,
  confirmAllOutcomes,
  effectiveBand,
  setOutcomeConfirmation,
  type OutcomeBand,
  type OutcomeConfirmationState,
  type StudentOutcome,
} from "@/lib/learningOutcomes";

const SUPPORT_NEED_OPTIONS: LearningAreaKey[] = [
  "problemSolving",
  "reasoning",
  "readingComprehension",
  "recallRetention",
  "creativeExpression",
  "curiosityExploration",
];

export function ReviewLearningOutcomePlacementsModal({
  open,
  onOpenChange,
  classroom,
  subject,
  period,
  outcomes,
  confirmations,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom: string;
  subject: string;
  period: string;
  outcomes: StudentOutcome[];
  confirmations: OutcomeConfirmationState;
  onSaved: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="font-heading font-extrabold text-[17px]">Review Learning Outcome Placements</SheetTitle>
            <DemoDataBadge />
          </div>
          <SheetDescription className="text-[12.5px]">
            {classroom} · {subject} · {period}
            <br />
            Yellow has suggested outcome bands using a class-wide signal blend. Confirm or adjust placements for this month.
          </SheetDescription>
        </SheetHeader>

        {/* Mounted fresh each time the sheet opens (conditional render, not
            an effect) so drafts/confirmations/support-needs re-seed from
            current data without a setState-in-effect. */}
        {open && (
          <ReviewForm
            outcomes={outcomes}
            confirmations={confirmations}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReviewForm({
  outcomes,
  confirmations,
  onOpenChange,
  onSaved,
}: {
  outcomes: StudentOutcome[];
  confirmations: OutcomeConfirmationState;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const toReview = useMemo(() => outcomes.filter((o) => o.movement !== "stable"), [outcomes]);

  const [drafts, setDrafts] = useState<Record<string, OutcomeBand>>(() => {
    const initial: Record<string, OutcomeBand> = {};
    for (const o of toReview) initial[o.student.id] = effectiveBand(o, confirmations);
    return initial;
  });
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => new Set());
  const [supportNeeds, setSupportNeeds] = useState<Set<LearningAreaKey>>(() => {
    const freq = new Map<LearningAreaKey, number>();
    for (const o of toReview) for (const a of o.relatedAreas) freq.set(a, (freq.get(a) ?? 0) + 1);
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    return new Set(top);
  });

  const summary = useMemo(() => {
    const dist: Record<OutcomeBand, number> = { advanced: 0, secure: 0, developing: 0, building: 0, "needs-support": 0 };
    for (const o of outcomes) dist[drafts[o.student.id] ?? effectiveBand(o, confirmations)] += 1;
    return dist;
  }, [outcomes, drafts, confirmations]);

  const meetingCount = summary.advanced + summary.secure;
  const adjustedCount = toReview.filter((o) => drafts[o.student.id] && drafts[o.student.id] !== o.band).length;

  const toggleSupportNeed = (key: LearningAreaKey) => {
    setSupportNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const confirmRow = (studentId: string) => {
    setConfirmedIds((prev) => new Set(prev).add(studentId));
  };

  const saveAsDraft = () => {
    for (const [studentId, band] of Object.entries(drafts)) {
      setOutcomeConfirmation(studentId, band, "pending");
    }
    onOpenChange(false);
    onSaved();
  };

  const confirmAndUpdate = () => {
    for (const [studentId, band] of Object.entries(drafts)) {
      setOutcomeConfirmation(studentId, band, "confirmed");
    }
    confirmAllOutcomes(outcomes);
    onOpenChange(false);
    onSaved();
  };

  return (
    <div className="p-5 space-y-5">
      {/* Placement summary */}
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">This Month&apos;s Placement Summary</div>
        <div className="grid grid-cols-5 gap-2">
          {BAND_ORDER.map((band) => (
            <div
              key={band}
              className="rounded-xl p-2.5 text-center"
              style={{ background: `color-mix(in srgb, ${BAND_TONE[band]} 10%, transparent)` }}
            >
              <div className="text-[9.5px] font-bold uppercase tracking-[0.04em]" style={{ color: BAND_TONE[band] }}>
                {BAND_LABEL[band]}
              </div>
              <div className="font-heading font-black text-[20px] leading-none mt-1" style={{ color: BAND_TONE[band] }}>
                {summary[band]}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-[hsl(142_55%_40%)] font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          {meetingCount} of {outcomes.length} students are Secure or Advanced.
        </div>
      </div>

      {/* Placements to review */}
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">Placements to Review</div>
        {toReview.length === 0 ? (
          <p className="text-[12.5px] text-muted-foreground">No placements need review this period — everyone is stable.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="grid grid-cols-[1.4fr_1fr_1.6fr_1.1fr] bg-muted/40 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <div className="px-3 py-2">Student</div>
              <div className="px-3 py-2">System Placement</div>
              <div className="px-3 py-2">Reason Flagged</div>
              <div className="px-3 py-2">Teacher Action</div>
            </div>
            <div className="divide-y divide-border/60">
              {toReview.map((o) => {
                const draftBand = drafts[o.student.id] ?? o.band;
                const confirmed = confirmedIds.has(o.student.id);
                return (
                  <div key={o.student.id} className="grid grid-cols-[1.4fr_1fr_1.6fr_1.1fr] items-center">
                    <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                      <StudentAvatar student={o.student} size="sm" />
                      <span className="text-[12.5px] font-semibold truncate">{o.student.name}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                        style={{ background: `color-mix(in srgb, ${BAND_TONE[o.band]} 14%, transparent)`, color: BAND_TONE[o.band] }}
                      >
                        {BAND_LABEL[o.band]}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 text-[11px] text-muted-foreground leading-snug">{o.reasonFlagged}</div>
                    <div className="px-3 py-2.5 flex items-center gap-1.5">
                      {confirmed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(142_55%_40%)]">
                          <Check className="h-3.5 w-3.5" />
                          Confirmed
                        </span>
                      ) : (
                        <button type="button" onClick={() => confirmRow(o.student.id)} className="text-[11px] font-bold text-primary hover:underline">
                          Confirm
                        </button>
                      )}
                      <Select value={draftBand} onValueChange={(v) => setDrafts((prev) => ({ ...prev, [o.student.id]: v as OutcomeBand }))}>
                        <SelectTrigger className="h-7 w-[118px] text-[10.5px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BAND_ORDER.map((b) => (
                            <SelectItem key={b} value={b} className="text-[11.5px]">
                              {BAND_LABEL[b]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main learning support need */}
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
          Main Learning Support Need <span className="normal-case font-semibold text-muted-foreground/80">(Select all that apply)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_NEED_OPTIONS.map((key) => {
            const active = supportNeeds.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSupportNeed(key)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-[11.5px] font-bold transition-colors " +
                  (active ? "border-primary/60 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-foreground/20")
                }
              >
                {active && <Check className="h-3 w-3" />}
                {LEARNING_AREA_LABEL[key]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3.5 text-[11.5px] text-foreground/80">
        You confirmed {confirmedIds.size} placement{confirmedIds.size === 1 ? "" : "s"} and adjusted {adjustedCount} placement{adjustedCount === 1 ? "" : "s"}.
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button type="button" onClick={saveAsDraft} className="h-10 px-4 rounded-xl border border-border/60 text-[12.5px] font-bold hover:bg-muted/50 transition-colors">
          Save as Draft
        </button>
        <button type="button" onClick={confirmAndUpdate} className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-bold hover:opacity-90 transition-opacity">
          Confirm & Update Dashboard
        </button>
      </div>
    </div>
  );
}
