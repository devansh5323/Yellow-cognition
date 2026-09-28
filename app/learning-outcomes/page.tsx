"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CalendarRange, ChevronRight, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LearningOutcomeStatus } from "@/components/dashboard/LearningOutcomeStatus";
import { OutcomeBandDistribution } from "@/components/dashboard/OutcomeBandDistribution";
import { LearningSkillSignalsRow } from "@/components/dashboard/LearningSkillSignalsRow";
import { StudentsNeedingLearningSupport } from "@/components/dashboard/StudentsNeedingLearningSupport";
import { LearningOutcomeRecommends } from "@/components/dashboard/LearningOutcomeRecommends";
import { MonthlyTeacherCheckBanner } from "@/components/dashboard/MonthlyTeacherCheckBanner";
import { ReviewLearningOutcomePlacementsModal } from "@/components/dashboard/ReviewLearningOutcomePlacementsModal";
import { classLearningAreas } from "@/lib/classLearning";
import {
  SUBJECTS,
  computeStudentOutcomes,
  getOutcomeConfirmations,
  pickOutcomeRecommendations,
  summariseOutcomes,
  type Subject,
} from "@/lib/learningOutcomes";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <LearningOutcomeStatusRoute />;
}

const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;
const PERIODS = ["This Month", "Last Month", "This Term"] as const;

function LearningOutcomeStatusRoute() {
  const [classroom, setClassroom] = useState<(typeof CLASSES)[number]>("Class 5B");
  const [subject, setSubject] = useState<Subject>("Math");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("This Month");
  const [reviewOpen, setReviewOpen] = useState(false);

  const topbarFilters = (
    <>
      <TopbarSelect icon={<Users className="h-3.5 w-3.5" />} value={classroom} onChange={(v) => setClassroom(v as (typeof CLASSES)[number])} options={CLASSES} />
      <TopbarSelect icon={<BookOpen className="h-3.5 w-3.5" />} value={subject} onChange={(v) => setSubject(v as Subject)} options={SUBJECTS} />
      <TopbarSelect icon={<CalendarRange className="h-3.5 w-3.5" />} value={period} onChange={(v) => setPeriod(v as (typeof PERIODS)[number])} options={PERIODS} />
    </>
  );

  return (
    <AppShell topbarFilters={topbarFilters}>
      <LearningOutcomeStatusPage
        classroom={classroom}
        subject={subject}
        period={period}
        reviewOpen={reviewOpen}
        onReviewOpenChange={setReviewOpen}
      />
    </AppShell>
  );
}

function LearningOutcomeStatusPage({
  classroom,
  subject,
  period,
  reviewOpen,
  onReviewOpenChange,
}: {
  classroom: string;
  subject: Subject;
  period: string;
  reviewOpen: boolean;
  onReviewOpenChange: (open: boolean) => void;
}) {
  const reduce = useReducedMotion();

  const outcomes = useMemo(() => computeStudentOutcomes(subject), [subject]);
  const areas = useMemo(() => classLearningAreas(), []);
  const recommendations = useMemo(() => pickOutcomeRecommendations(areas), [areas]);

  const [confirmations, setConfirmations] = useState(() => getOutcomeConfirmations());
  useEffect(() => {
    const refresh = () => setConfirmations(getOutcomeConfirmations());
    refresh();
    window.addEventListener("ah-learning-outcome-change", refresh);
    return () => window.removeEventListener("ah-learning-outcome-change", refresh);
  }, []);

  const summary = useMemo(() => summariseOutcomes(outcomes, confirmations), [outcomes, confirmations]);

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        <header className="min-w-0 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3 opacity-60" />
              <span className="text-foreground">Learning Outcome Status</span>
            </nav>
            <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">Learning Outcome Status</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              See how {classroom} is progressing across current {subject} outcomes and where support may be needed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onReviewOpenChange(true)}
            className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-bold hover:opacity-90 transition-opacity"
          >
            Review Learning Status
          </button>
        </header>

        <LearningOutcomeStatus summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <LearningSkillSignalsRow areas={areas} />
          <OutcomeBandDistribution summary={summary} />
        </div>

        <StudentsNeedingLearningSupport outcomes={outcomes} confirmations={confirmations} />

        <LearningOutcomeRecommends recommendations={recommendations} />

        <MonthlyTeacherCheckBanner onReview={() => onReviewOpenChange(true)} />

        <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={2.2} />
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            Placements are based on demo subject scores (no real marks-card data exists yet for this roster), plus real
            gameplay-derived learning-readiness signals where available. Monthly teacher review lets you confirm or adjust
            every placement.
          </p>
        </div>
      </motion.div>

      <ReviewLearningOutcomePlacementsModal
        open={reviewOpen}
        onOpenChange={onReviewOpenChange}
        classroom={classroom}
        subject={subject}
        period={period}
        outcomes={outcomes}
        confirmations={confirmations}
        onSaved={() => setConfirmations(getOutcomeConfirmations())}
      />
    </div>
  );
}

function TopbarSelect({
  icon,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-10 w-auto min-w-[120px] max-w-[180px] rounded-xl bg-card/70 border-border/80 backdrop-blur",
          "hover:border-primary/40 transition-colors font-semibold text-[13px] gap-2",
        )}
      >
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
