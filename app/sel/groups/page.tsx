"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Layers, Plus, Sparkles } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { TierSupportCard } from "@/components/sel/TierSupportCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel, OptionChip } from "@/components/dashboard/behaviorFormShared";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { STUDENTS, type Student } from "@/data/mockData";
import { SEL_COMPETENCIES, type SelCompetency } from "@/lib/selPulse";
import { needsTeacherOptions } from "@/lib/selNeeds";
import { getPrograms, type SelProgram } from "@/lib/selProgram";
import {
  getGroups,
  createGroup,
  applyNextStep,
  tierDistribution,
  activeGroupsSummary,
  responseToSupportCounts,
  studentsRequiringMoreSupport,
  implementationVsResponseInsight,
  recommendGroups,
  RESPONSE_CATEGORIES,
  RESPONSE_TONE,
  type SelGroup,
  type NextStep,
} from "@/lib/selGroups";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export default function Page() {
  return (
    <SelAppShell>
      <TieredSupport />
    </SelAppShell>
  );
}

function TieredSupport() {
  const reduce = useReducedMotion();
  // Read the impure Date.now() once per mount rather than on every render —
  // same pattern used elsewhere across the specialist/SEL dashboards.
  const [nowMs] = useState(() => Date.now());

  const [groups, setGroups] = useState<SelGroup[]>([]);
  useEffect(() => {
    const refresh = () => setGroups(getGroups());
    refresh();
    window.addEventListener("ah-sel-group-change", refresh);
    return () => window.removeEventListener("ah-sel-group-change", refresh);
  }, []);

  const [programs, setPrograms] = useState<SelProgram[]>([]);
  useEffect(() => {
    const refresh = () => setPrograms(getPrograms());
    refresh();
    window.addEventListener("ah-sel-program-change", refresh);
    return () => window.removeEventListener("ah-sel-program-change", refresh);
  }, []);

  const tiers = useMemo(() => tierDistribution(programs, groups), [programs, groups]);
  const activeGroups = groups.filter((g) => g.outcome === "active");
  const summary = useMemo(() => activeGroupsSummary(groups), [groups]);
  const responseCounts = useMemo(() => responseToSupportCounts(groups), [groups]);
  const needMoreSupport = useMemo(() => studentsRequiringMoreSupport(groups), [groups]);
  const insight = useMemo(() => implementationVsResponseInsight(groups), [groups]);
  const recommendations = useMemo(() => recommendGroups(groups), [groups]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [prefill, setPrefill] = useState<{ targetSkill: SelCompetency; studentIds: string[] } | null>(null);

  const openCreate = (pre?: { targetSkill: SelCompetency; studentIds: string[] }) => {
    setPrefill(pre ?? null);
    setCreateKey((k) => k + 1);
    setCreateOpen(true);
  };

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <Layers className="h-3 w-3" />
          <span>Tiered SEL Support &amp; Response</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          Who&apos;s getting additional support, and is it working?
        </h1>
      </header>

      <TierSupportCard tiers={tiers} />

      {/* Active Tier 2 groups */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <header className="min-w-0">
            <div className="premium-eyebrow">
              <span>Active Tier 2 Groups</span>
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
              {summary.activeGroups} active group{summary.activeGroups === 1 ? "" : "s"} · {summary.studentsParticipating}{" "}
              students · {summary.dueForReview} due for review this week
            </h3>
          </header>
          <Button onClick={() => openCreate()} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            Create group
          </Button>
        </div>

        {activeGroups.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No active Tier 2 groups right now.</p>
        ) : (
          <ul className="space-y-2.5">
            {activeGroups.map((g) => {
              const dueSoon = +new Date(g.reviewDate) <= nowMs;
              return (
                <li key={g.id} className="rounded-xl border border-border bg-background p-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-[13px]">{g.name}</span>
                        <span
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]"
                          style={{ background: `color-mix(in srgb, ${RESPONSE_TONE[g.responseCategory]} 14%, transparent)`, color: RESPONSE_TONE[g.responseCategory] }}
                        >
                          {g.responseCategory}
                        </span>
                        {dueSoon && (
                          <span className="inline-flex items-center rounded-full bg-[hsl(38_92%_48%/0.12)] text-[hsl(38_92%_40%)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]">
                            Review due
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">
                        {g.targetSkill} · Facilitator: {g.facilitator} · {g.sessionsHeld} of {g.sessionsPlanned} sessions held
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {g.studentIds.map((id) => {
                          const s = STUDENTS.find((st) => st.id === id);
                          return s ? <StudentAvatar key={id} student={s} size="sm" /> : null;
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {(["continue", "adjust", "close", "refer"] as NextStep[]).map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => {
                            applyNextStep(g.id, step);
                            toast.success(`${g.name}: ${STEP_LABEL[step]}`);
                          }}
                          className="inline-flex items-center rounded-lg border border-border/70 px-2 py-1 text-[10.5px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                        >
                          {STEP_LABEL[step]}
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Response to support */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Response to Support</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Across active groups</h3>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {RESPONSE_CATEGORIES.map((c) => (
            <div key={c} className="rounded-xl border border-border bg-background p-3">
              <div className="font-heading font-extrabold text-[18px] tabular-nums leading-none" style={{ color: RESPONSE_TONE[c] }}>
                {responseCounts[c]}
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground leading-snug mt-1.5">{c}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Students requiring more support */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Students Requiring More Support</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            {needMoreSupport.needReview.length} student{needMoreSupport.needReview.length === 1 ? "" : "s"} need additional
            review · {needMoreSupport.awaitingReferral.length} awaiting referral/handoff
          </h3>
        </header>
        {needMoreSupport.needReview.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No students currently need review beyond Tier 2 support.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {needMoreSupport.needReview.map((s) => (
              <li key={s.id} className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-1.5">
                <StudentAvatar student={s} size="sm" />
                <span className="text-[12px] font-semibold">{s.name}</span>
                {needMoreSupport.awaitingReferral.some((r) => r.id === s.id) && (
                  <span className="inline-flex items-center rounded-full bg-[hsl(0_78%_56%/0.12)] text-[hsl(0_78%_56%)] px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    Referral
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <Button size="sm" variant="outline" className="mt-3" onClick={() => comingSoon("Review students")}>
          Review students
        </Button>
      </section>

      {/* Implementation vs response insight */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <Sparkles className="h-3 w-3" />
            <span>Implementation vs. Response Signal</span>
          </div>
        </header>
        {insight ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-[hsl(38_92%_48%/0.3)] bg-[hsl(38_92%_48%/0.06)] p-3.5">
            <Sparkles className="h-4 w-4 text-[hsl(38_92%_48%)] shrink-0 mt-0.5" />
            <p className="text-[12.5px] leading-snug">{insight.sentence}</p>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">No active group&apos;s response is concerning enough to flag right now.</p>
        )}
      </section>

      {/* Yellow-recommended groups */}
      {recommendations.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-4">
            <div className="premium-eyebrow">
              <Sparkles className="h-3 w-3" />
              <span>Yellow Recommends</span>
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">New groups worth forming</h3>
          </header>
          <ul className="space-y-2">
            {recommendations.map((r) => (
              <li key={r.suggestedName} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[13px]">{r.suggestedName}</div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{r.rationale}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {r.students.map((s) => (
                      <StudentAvatar key={s.id} student={s} size="sm" />
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openCreate({ targetSkill: r.targetSkill, studentIds: r.studentIds })}>
                  Create this group
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CreateGroupDialog key={createKey} open={createOpen} onOpenChange={setCreateOpen} prefill={prefill} />
    </motion.div>
  );
}

const STEP_LABEL: Record<NextStep, string> = {
  continue: "Continue",
  adjust: "Adjust",
  close: "Close / Graduate",
  refer: "Refer",
};

function CreateGroupDialog({
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
  const [sessionsPlanned, setSessionsPlanned] = useState(6);
  const [studentIds, setStudentIds] = useState<string[]>(prefill?.studentIds ?? []);

  const toggleStudent = (id: string) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canSubmit = name.trim().length > 0 && studentIds.length > 0 && facilitator.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    createGroup({ name: name.trim(), targetSkill, facilitator, studentIds, sessionsPlanned });
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

          <div>
            <FieldLabel required>Sessions planned</FieldLabel>
            <Input
              type="number"
              min={1}
              value={sessionsPlanned}
              onChange={(e) => setSessionsPlanned(Math.max(1, Number(e.target.value) || 1))}
            />
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
