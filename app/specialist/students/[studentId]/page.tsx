"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  ClipboardPlus,
  FileText,
  Mail,
  MessageSquarePlus,
  UserCog,
} from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDENTS, type Student } from "@/data/mockData";
import { studentComposites } from "@/lib/classHealth";
import { getSession } from "@/lib/auth";
import { getPendingFollowUps } from "@/lib/interventionFollowUps";
import {
  caseloadTierFromStatus,
  getCaseloadEntries,
  TIER_LABEL,
  type CaseloadTier,
} from "@/lib/specialEdCaseload";
import { buildPlaceholderAssignments } from "@/lib/specialEdPlaceholderData";

export default function Page() {
  return (
    <SpecialistAppShell>
      <StudentProfile />
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

function StudentProfile() {
  const params = useParams<{ studentId: string }>();
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;
  const student = useMemo(() => STUDENTS.find((s) => s.id === studentId) ?? null, [studentId]);

  if (!student) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-[14px] font-semibold">Student not found.</p>
        <Link href="/specialist/review-queue" className="mt-2 inline-block text-[12.5px] font-bold text-primary hover:underline">
          Back to Review Queue
        </Link>
      </div>
    );
  }

  return <StudentProfileBody student={student} />;
}

function StudentProfileBody({ student }: { student: Student }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [dateRange, setDateRange] = useState("this-month");
  // Read the impure Date.now() once per mount rather than on every render —
  // same pattern used by ReturningActionHub.tsx elsewhere in this codebase.
  const [nowMs] = useState(() => Date.now());

  const composite = useMemo(() => studentComposites([student])[0], [student]);
  const caseloadEntries = useMemo(() => getCaseloadEntries(), []);
  const onCaseload = caseloadEntries.some((e) => e.student.id === student.id);
  const tier: CaseloadTier | null = onCaseload ? caseloadTierFromStatus(composite.status) : null;

  const assignments = useMemo(() => buildPlaceholderAssignments(caseloadEntries), [caseloadEntries]);
  const assignment = assignments.get(student.id) ?? null;

  const hasPendingFollowUp = useMemo(
    () => getPendingFollowUps().some((p) => p.student.id === student.id),
    [student.id],
  );

  const caseOwner = getSession()?.name ?? "Unassigned";

  const supportStatus = !onCaseload
    ? "General Support"
    : hasPendingFollowUp
      ? "Follow-up Due"
      : tier === "tier3"
        ? "High Priority"
        : "Monitoring";

  const nextReviewIso = assignment?.nextReview ?? null;
  const nextReviewOverdue = nextReviewIso ? +new Date(nextReviewIso) < nowMs : false;

  const gradeNumber = student.grade.replace(/\D/g, "");

  const QUICK_ACTIONS = [
    { label: "Log observation", icon: FileText },
    { label: "Request update", icon: MessageSquarePlus },
    { label: "Schedule meeting", icon: CalendarClock },
    { label: "Add support", icon: ClipboardPlus },
    { label: "Generate summary", icon: Mail },
  ];

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-2">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          <Link href="/specialist/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link href="/specialist/review-queue" className="hover:text-foreground transition-colors">
            Review Queue
          </Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-foreground">{student.name}</span>
        </nav>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <StudentAvatar student={student} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-black text-[22px] md:text-[26px] leading-tight">{student.name}</h1>
              <RiskBadge risk={student.risk} />
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-1">
              {student.grade} &middot; Classroom {gradeNumber}
              {student.section} &middot; Composite score {composite.score}/100
            </p>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <Badge tone={onCaseload ? PATHWAY_TONE[assignment?.pathway ?? "IEP"] : "hsl(220 12% 55%)"}>
                {onCaseload ? `${assignment?.pathway ?? "IEP"} Active` : "General Support"}
              </Badge>
              {onCaseload && nextReviewIso && (
                <Badge tone={nextReviewOverdue ? "hsl(0 78% 56%)" : "hsl(38 92% 48%)"}>
                  {nextReviewOverdue ? "Review Overdue " : "Review Due "}
                  {new Date(nextReviewIso).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Badge>
              )}
              {tier && (
                <Badge tone={tier === "tier3" ? "hsl(0 78% 56%)" : "hsl(38 92% 48%)"}>
                  Priority: {tier === "tier3" ? "High" : "Medium"}
                </Badge>
              )}
            </div>

            {/* Header meta row */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/60">
              <MetaField icon={UserCog} label="Case owner" value={caseOwner} />
              <MetaField label="Current tier" value={tier ? TIER_LABEL[tier] : "—"} />
              <MetaField label="Support status" value={supportStatus} />
              <MetaField
                label="Next review"
                value={nextReviewIso ? new Date(nextReviewIso).toLocaleDateString() : "—"}
              />
            </dl>
          </div>

          <div className="shrink-0">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9 w-auto min-w-[130px] rounded-xl bg-background border-border/80 text-[12px] font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-term">This Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/60">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => comingSoon(action.label)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 h-8 text-[11.5px] font-bold text-foreground/85 hover:border-primary/30 hover:text-primary transition-colors"
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-[12.5px] text-muted-foreground">
        The rest of the Student Support Profile (presenting concerns, strengths, accommodations, interventions,
        notes, upcoming reviews) hasn&apos;t been designed yet.
      </div>
    </motion.div>
  );
}

const PATHWAY_TONE: Record<"IEP" | "504", string> = {
  IEP: "hsl(258 55% 60%)",
  "504": "hsl(196 75% 50%)",
};

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] whitespace-nowrap"
      style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      {children}
    </span>
  );
}

function MetaField({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof UserCog;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-[12.5px] font-semibold text-foreground/90 mt-0.5">{value}</div>
    </div>
  );
}
