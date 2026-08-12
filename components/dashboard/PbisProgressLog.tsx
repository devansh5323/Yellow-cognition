"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  ClipboardList,
  HelpCircle,
  PauseCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserSquare2,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { STUDENTS, type Student } from "@/data/mockData";
import { getAllFollowUpRecords, type FollowUpRecord, type OutcomeStatus, type NextStep } from "@/lib/interventionFollowUps";

const OUTCOME_ICONS: Record<OutcomeStatus, LucideIcon> = {
  Improved: TrendingUp,
  "No change": Circle,
  "Got worse": TrendingDown,
  "Too early to tell": HelpCircle,
};

const OUTCOME_TONE: Record<OutcomeStatus, string> = {
  Improved: "hsl(142 55% 42%)",
  "No change": "hsl(212 55% 50%)",
  "Got worse": "hsl(0 78% 52%)",
  "Too early to tell": "hsl(38 92% 48%)",
};

const NEXT_STEP_ICONS: Record<NextStep, LucideIcon> = {
  Continue: CheckCircle2,
  "Adjust strategy": Wrench,
  "Escalate to Tier 2": ArrowUpCircle,
  "Escalate to Tier 3": ArrowUpCircle,
  "Involve special educator": Users,
  "Close support": PauseCircle,
};

const NEXT_STEP_TONE: Record<NextStep, string> = {
  Continue: "hsl(142 55% 42%)",
  "Adjust strategy": "hsl(38 92% 48%)",
  "Escalate to Tier 2": "hsl(0 78% 52%)",
  "Escalate to Tier 3": "hsl(0 78% 42%)",
  "Involve special educator": "hsl(262 55% 55%)",
  "Close support": "hsl(212 15% 55%)",
};

function studentFor(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PbisProgressLog() {
  const [records, setRecords] = useState<FollowUpRecord[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRecords(getAllFollowUpRecords());
    refresh();
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, []);

  if (!records) return null;

  const active = records.find((r) => r.id === openId) ?? null;
  const rows = records.slice(0, 8);

  return (
    <section
      aria-label="PBIS progress monitoring"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="px-5 md:px-6 py-4 border-b border-border/70">
        <div className="premium-eyebrow">
          <span>Intervention history</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          PBIS progress monitoring
        </h3>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">
          Every strategy tried, what happened, and what&apos;s next — click a row for the full record.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="p-8 text-center">
          <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-[12.5px] font-semibold mt-2">No intervention follow-ups logged yet.</p>
          <p className="text-[11.5px] text-muted-foreground mt-1">
            Log one from a flagged student&apos;s priority action to start tracking PBIS progress.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[900px]">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                  Who it was for
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                  Strategy tried
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[150px]">
                  Frequency tried
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[150px]">
                  Outcome
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[170px]">
                  Next step
                </th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[100px]">
                  Logged
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const student = studentFor(r.studentId);
                if (!student) return null;
                const OutcomeIcon = OUTCOME_ICONS[r.outcome];
                const NextIcon = NEXT_STEP_ICONS[r.nextStep];
                return (
                  <tr
                    key={r.id}
                    onClick={() => setOpenId(r.id)}
                    className="border-t border-border/50 hover:bg-primary/[0.035] transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StudentAvatar student={student} size="sm" />
                        <div className="min-w-0">
                          <div className="font-heading font-extrabold text-[13px] truncate leading-tight">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {student.grade} · {student.section}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-middle">
                      <span className="text-[12.5px] text-foreground/90 line-clamp-1 max-w-[26ch]">
                        {r.support}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <span className="text-[12px] font-semibold text-foreground/80">
                        {r.implementation}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold"
                        style={{ color: OUTCOME_TONE[r.outcome] }}
                      >
                        <OutcomeIcon className="h-3.5 w-3.5" />
                        {r.outcome}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold"
                        style={{ color: NEXT_STEP_TONE[r.nextStep] }}
                      >
                        <NextIcon className="h-3.5 w-3.5" />
                        {r.nextStep}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-[11.5px] text-muted-foreground tabular-nums">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PbisRecordDrawer record={active} onOpenChange={(o) => !o && setOpenId(null)} />
    </section>
  );
}

function PbisRecordDrawer({
  record,
  onOpenChange,
}: {
  record: FollowUpRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  const student = record ? studentFor(record.studentId) : undefined;

  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {record && student && (
          <>
            <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
              <div className="flex items-center gap-3">
                <StudentAvatar student={student} size="md" />
                <div className="min-w-0">
                  <SheetTitle className="font-heading font-extrabold text-[16px] truncate">
                    {student.name}
                  </SheetTitle>
                  <SheetDescription className="text-[12px]">
                    {student.grade} · {student.section} — flagged for {record.reason}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="p-5 space-y-4">
              <Field label="Strategy tried" value={record.support} />
              <Field label="Frequency tried" value={record.implementation} />
              <Field label="Teacher response" value={record.teacherResponse} />

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                  Outcome
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold"
                  style={{ color: OUTCOME_TONE[record.outcome] }}
                >
                  {(() => {
                    const Icon = OUTCOME_ICONS[record.outcome];
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {record.outcome}
                </span>
              </div>

              <Field label="Evidence" value={record.evidence} />
              {record.note && <Field label="Note" value={record.note} />}

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                  Next step
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold"
                  style={{ color: NEXT_STEP_TONE[record.nextStep] }}
                >
                  {(() => {
                    const Icon = NEXT_STEP_ICONS[record.nextStep];
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {record.nextStep}
                </span>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground">
                  Logged {formatDate(record.createdAt)}
                </span>
                <Link
                  href={`/students/${student.id}?tab=overview`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"
                >
                  <UserSquare2 className="h-3.5 w-3.5" />
                  View profile
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
        {label}
      </div>
      <p className="text-[12.5px] leading-snug text-foreground/90">{value}</p>
    </div>
  );
}
