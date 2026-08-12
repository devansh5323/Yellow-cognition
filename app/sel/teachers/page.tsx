"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, MessageSquareText, Sparkles, Users2 } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { TeacherImplementationCard } from "@/components/sel/TeacherImplementationCard";
import { Button } from "@/components/ui/button";
import {
  getTeacherRequests,
  resolveRequest,
  getStrategyFollowUps,
  markFollowUpComplete,
  requestFollowUp,
  teacherImplementationDistribution,
  teacherDistributionSummary,
  openTeacherRequestsSummary,
  topTeacherSupportNeeds,
  followUpsAwaitingFeedback,
  TEACHER_STATUS_LABEL,
  TEACHER_STATUS_TONE,
  type TeacherRequest,
  type StrategyFollowUp,
} from "@/lib/selTeacherSupport";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export default function Page() {
  return (
    <SelAppShell>
      <TeacherSupport />
    </SelAppShell>
  );
}

function TeacherSupport() {
  const reduce = useReducedMotion();

  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  useEffect(() => {
    const refresh = () => setRequests(getTeacherRequests());
    refresh();
    window.addEventListener("ah-sel-teacher-request-change", refresh);
    return () => window.removeEventListener("ah-sel-teacher-request-change", refresh);
  }, []);

  const [followUps, setFollowUps] = useState<StrategyFollowUp[]>([]);
  useEffect(() => {
    const refresh = () => setFollowUps(getStrategyFollowUps());
    refresh();
    window.addEventListener("ah-sel-followup-change", refresh);
    return () => window.removeEventListener("ah-sel-followup-change", refresh);
  }, []);

  const distribution = useMemo(() => teacherImplementationDistribution(requests), [requests]);
  const summary = useMemo(() => teacherDistributionSummary(distribution), [distribution]);
  const requestsSummary = useMemo(() => openTeacherRequestsSummary(requests), [requests]);
  const supportNeeds = useMemo(() => topTeacherSupportNeeds(requests), [requests]);
  const awaitingFeedback = useMemo(() => followUpsAwaitingFeedback(followUps), [followUps]);

  const openRequests = requests.filter((r) => r.status !== "resolved");

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <Users2 className="h-3 w-3" />
          <span>Teacher Implementation &amp; Support</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          Which teachers need support, and with what?
        </h1>
      </header>

      <TeacherImplementationCard summary={summary} totalTeachers={distribution.length} />

      {/* Per-teacher detail + workflow actions */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>By Teacher</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Status, classrooms, and next actions</h3>
        </header>
        <ul className="space-y-2.5">
          {distribution.map((t) => {
            const tone = TEACHER_STATUS_TONE[t.status];
            return (
              <li key={t.teacher} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[13px]">{t.teacher}</span>
                      <span
                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em]"
                        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                      >
                        {TEACHER_STATUS_LABEL[t.status]}
                      </span>
                      {t.hasOpenRequest && (
                        <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                          Has open request
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                      {t.completionPct}% SEL completion · Grade {t.classrooms.join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => comingSoon("Assign strategy")}>
                      Assign strategy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => comingSoon("Share resource")}>
                      Share resource
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => comingSoon("Schedule coaching")}>
                      Schedule coaching
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => comingSoon("Request observation")}>
                      Request observation
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        requestFollowUp(t.teacher, t.classrooms[0] ?? "—", "SEL implementation check-in");
                        toast.success("Follow-up requested", { description: `${t.teacher} will be asked for feedback.` });
                      }}
                    >
                      Request follow-up
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Open teacher requests */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <MessageSquareText className="h-3 w-3" />
            <span>Open Teacher Requests</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            {requestsSummary.openCount} open request{requestsSummary.openCount === 1 ? "" : "s"} ·{" "}
            {requestsSummary.awaitingCoordinator} awaiting coordinator response
          </h3>
        </header>
        {openRequests.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No open teacher requests right now.</p>
        ) : (
          <ul className="space-y-2">
            {openRequests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-[12.5px]">{r.teacher}</span>
                    <span className="text-[10.5px] text-muted-foreground">{r.category}</span>
                    {r.status === "awaiting-coordinator" && (
                      <span className="inline-flex items-center rounded-full bg-[hsl(38_92%_48%/0.12)] text-[hsl(38_92%_40%)] px-1.5 py-0.5 text-[9px] font-bold uppercase">
                        Awaiting you
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{r.note}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveRequest(r.id)} className="shrink-0">
                  Mark resolved
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Top teacher support needs */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <Sparkles className="h-3 w-3" />
            <span>Top Teacher Support Needs</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Yellow recommends focusing on</h3>
        </header>
        <ul className="space-y-1.5">
          {supportNeeds.map((n) => (
            <li key={n.category} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5">
              <span className="flex-1 min-w-0 font-semibold text-[12.5px]">{n.category}</span>
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {n.count} request{n.count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Strategy follow-ups */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Strategy Follow-Ups</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            {awaitingFeedback.length} strateg{awaitingFeedback.length === 1 ? "y" : "ies"} awaiting teacher feedback
          </h3>
        </header>
        {awaitingFeedback.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Nothing awaiting feedback right now.</p>
        ) : (
          <ul className="space-y-2">
            {awaitingFeedback.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5">
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[12.5px]">{f.strategy}</div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    {f.teacher} · Grade {f.classroom} · Assigned {new Date(f.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markFollowUpComplete(f.id)}
                  className="gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark complete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
