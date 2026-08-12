"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Search,
  Target,
} from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { MetricsRow, type MetricTile } from "@/components/specialist/MetricsRow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession } from "@/lib/auth";
import { getCaseloadEntries } from "@/lib/specialEdCaseload";
import { buildPlaceholderAssignments } from "@/lib/specialEdPlaceholderData";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type ReviewStatus = "overdue" | "due-30" | "on-track";

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  overdue: "Overdue",
  "due-30": "Due within 30 days",
  "on-track": "On track",
};

function reviewStatusFor(nextReviewIso: string | undefined, nowMs: number): ReviewStatus {
  if (!nextReviewIso) return "on-track";
  const diff = +new Date(nextReviewIso) - nowMs;
  if (diff < 0) return "overdue";
  if (diff <= THIRTY_DAYS_MS) return "due-30";
  return "on-track";
}

export default function Page() {
  return (
    <SpecialistAppShell>
      <SpecialEducationPage />
    </SpecialistAppShell>
  );
}

function SpecialEducationPage() {
  const reduce = useReducedMotion();
  const router = useRouter();

  // Read the impure Date.now() once per mount rather than on every render —
  // same pattern used elsewhere across the specialist dashboard.
  const [nowMs] = useState(() => Date.now());
  const caseOwner = getSession()?.name ?? "Unassigned";

  const fullEntries = useMemo(() => getCaseloadEntries(), []);
  const assignments = useMemo(() => buildPlaceholderAssignments(fullEntries), [fullEntries]);

  // This page is scoped to the IEP pathway — opened from "Active IEP Plans"
  // or the dashboard's Special Education view.
  const iepEntries = useMemo(
    () => fullEntries.filter((e) => assignments.get(e.student.id)?.pathway === "IEP"),
    [fullEntries, assignments],
  );

  const gradeOptions = useMemo(() => Array.from(new Set(iepEntries.map((e) => e.student.grade))).sort(), [iepEntries]);
  const classroomOptions = useMemo(
    () =>
      Array.from(
        new Set(iepEntries.map((e) => `${e.student.grade.replace(/\D/g, "")}${e.student.section}`)),
      ).sort(),
    [iepEntries],
  );

  const [grade, setGrade] = useState<string>("all");
  const [classroom, setClassroom] = useState<string>("all");
  const [reviewStatus, setReviewStatus] = useState<string>("all");
  const [goalStatus, setGoalStatus] = useState<string>("all");

  const entries = useMemo(() => {
    let result = iepEntries;
    if (grade !== "all") result = result.filter((e) => e.student.grade === grade);
    if (classroom !== "all") {
      result = result.filter((e) => `${e.student.grade.replace(/\D/g, "")}${e.student.section}` === classroom);
    }
    if (reviewStatus !== "all") {
      result = result.filter(
        (e) => reviewStatusFor(assignments.get(e.student.id)?.nextReview, nowMs) === reviewStatus,
      );
    }
    if (goalStatus !== "all") {
      result = result.filter((e) => assignments.get(e.student.id)?.goalStatus === goalStatus);
    }
    return result;
  }, [iepEntries, grade, classroom, reviewStatus, goalStatus, assignments, nowMs]);

  const reviewsDueIn30 = entries.filter(
    (e) => reviewStatusFor(assignments.get(e.student.id)?.nextReview, nowMs) === "due-30",
  ).length;
  const annualReviewsOverdue = entries.filter(
    (e) => reviewStatusFor(assignments.get(e.student.id)?.nextReview, nowMs) === "overdue",
  ).length;
  const goalsNeedingAttention = entries.filter(
    (e) => assignments.get(e.student.id)?.goalStatus === "Needs Attention",
  ).length;
  const servicesAwaitingConfirmation = entries.filter(
    (e) => assignments.get(e.student.id)?.servicesAwaitingConfirmation,
  ).length;

  const metricTiles: MetricTile[] = [
    {
      key: "active-ieps",
      label: "Active IEPs",
      value: entries.length,
      icon: FileText,
      tone: "hsl(258 55% 60%)",
      onClick: () => {},
    },
    {
      key: "reviews-due-30",
      label: "Reviews Due in 30 Days",
      value: reviewsDueIn30,
      icon: CalendarClock,
      tone: "hsl(38 92% 48%)",
      onClick: () => setReviewStatus("due-30"),
    },
    {
      key: "annual-reviews-overdue",
      label: "Annual Reviews Overdue",
      value: annualReviewsOverdue,
      icon: AlertTriangle,
      tone: "hsl(0 78% 56%)",
      onClick: () => setReviewStatus("overdue"),
    },
    {
      key: "goals-needing-attention",
      label: "Goals Needing Attention",
      value: goalsNeedingAttention,
      icon: Target,
      tone: "hsl(0 78% 56%)",
      onClick: () => setGoalStatus("Needs Attention"),
    },
    {
      key: "services-awaiting-confirmation",
      label: "Services Awaiting Confirmation",
      value: servicesAwaitingConfirmation,
      icon: ClipboardCheck,
      tone: "hsl(196 75% 50%)",
      onClick: () => {},
    },
    {
      key: "evaluations-in-progress",
      label: "Evaluations in Progress",
      value: null,
      icon: Search,
      tone: "hsl(212 55% 50%)",
      onClick: () => {},
    },
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
          <span className="text-foreground">Special Education</span>
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

      <header className="min-w-0">
        <div className="premium-eyebrow">
          <GraduationCap className="h-3 w-3" />
          <span>IEP Management</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">Special Education</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Caseload, reviews, and goal progress for students on an IEP.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Grade"
          value={grade}
          onChange={setGrade}
          options={["all", ...gradeOptions]}
          display={(v) => (v === "all" ? "All Grades" : v)}
        />
        <FilterSelect
          label="Classroom"
          value={classroom}
          onChange={setClassroom}
          options={["all", ...classroomOptions]}
          display={(v) => (v === "all" ? "All Classrooms" : v)}
        />
        <FilterSelect label="Case Owner" value={caseOwner} options={[caseOwner]} onChange={() => {}} disabled />
        <FilterSelect label="IEP Status" value="Active" options={["Active"]} onChange={() => {}} disabled />
        <FilterSelect
          label="Review Status"
          value={reviewStatus}
          onChange={setReviewStatus}
          options={["all", "overdue", "due-30", "on-track"]}
          display={(v) => (v === "all" ? "All" : REVIEW_STATUS_LABEL[v as ReviewStatus])}
        />
        <FilterSelect
          label="Goal Status"
          value={goalStatus}
          onChange={setGoalStatus}
          options={["all", "On Track", "Needs Attention", "Not Started"]}
          display={(v) => (v === "all" ? "All" : v)}
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>IEP Caseload Summary</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where the caseload stands today
          </h3>
        </header>
        <MetricsRow tiles={metricTiles} />
      </section>

      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-[12.5px] text-muted-foreground">
        The caseload list, goal detail, and services table for this page haven&apos;t been designed yet.
      </div>
    </motion.div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  display,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  display?: (v: string) => string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto min-w-[150px] rounded-xl bg-card/70 border-border/80 backdrop-blur text-[12.5px] font-semibold gap-2",
          disabled && "opacity-70",
        )}
      >
        <span className="text-muted-foreground shrink-0 text-[10px] font-bold uppercase tracking-[0.06em]">
          {label}
        </span>
        <SelectValue>{display ? display(value) : value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {display ? display(o) : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
