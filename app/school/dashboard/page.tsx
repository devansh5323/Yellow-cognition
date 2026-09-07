"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { LockedSection } from "@/components/dashboard/LockedSection";
import { getSchoolTeachers } from "@/lib/schoolData";
import { DEFAULT_FILTERS, SCHOOL_CONTEXT, type FilterKey } from "@/lib/schoolKpis";
import { SchoolOnboardingChecklist, SCHOOL_ACTIVATION_TASKS } from "@/components/school/SchoolOnboardingChecklist";
import { SchoolDashboardTour } from "@/components/school/SchoolDashboardTour";
import { SchoolLeadershipActionHub } from "@/components/school/SchoolLeadershipActionHub";
import { SchoolHealthScoreCard } from "@/components/school/SchoolHealthScoreCard";
import { SchoolHealthDriverCards } from "@/components/school/SchoolHealthDriverCards";
import { GradeClassroomOverview } from "@/components/school/GradeClassroomOverview";
import { TierSupportDistribution } from "@/components/school/TierSupportDistribution";
import { InterventionImplementation } from "@/components/school/InterventionImplementation";
import { TeacherClassroomSupportNeeds } from "@/components/school/TeacherClassroomSupportNeeds";
import { PositiveBehaviourCulture } from "@/components/school/PositiveBehaviourCulture";
import { SchoolContextHeader } from "@/components/school/SchoolContextHeader";
import { SchoolMilestoneDialog } from "@/components/school/SchoolMilestoneDialog";
import {
  computeSchoolFtueStage,
  getSchoolOnboarding,
  markSchoolMilestoneSeen,
  markSchoolTaskDone,
  SCHOOL_STAGE_TASK,
  type SchoolFtueStage,
} from "@/lib/schoolOnboarding";

// How far into the 5-task activation sequence a stage sits — used to decide
// which dashboard sections are still locked. Deliberately a plain rank
// rather than reusing SCHOOL_STAGE_ORDER's indexOf everywhere: "done"
// needs to rank past every real stage, which indexOf (built for the
// 5-element array alone) can't express.
const STAGE_RANK: Record<SchoolFtueStage, number> = {
  invite: 0,
  digest: 1,
  thresholds: 2,
  comms: 3,
  report: 4,
  done: 5,
};

export default function Page() {
  return (
    <SchoolAppShell>
      <SchoolDashboard />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function SchoolDashboard() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const teachers = getSchoolTeachers();

  const [filters, setFilters] =
    useState<Record<FilterKey, string>>(DEFAULT_FILTERS);

  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const dormantTeachers = teachers.filter((t) => t.status === "dormant").length;

  // Starts at the SSR-safe default and hydrates to the real stage below —
  // same pattern the SEL dashboard uses. Mounting the tour before the real
  // stage is known would let the SSR default read as "the previous stage"
  // the instant hydration jumps forward, firing a false "step complete"
  // toast (a real bug caught and fixed there) — stageHydrated gates that.
  const [stage, setStage] = useState<SchoolFtueStage>("invite");
  const [stageHydrated, setStageHydrated] = useState(false);
  // Shows the "You're all set" milestone once, the first time this
  // session's *real* activation (not the checklist-dismissed shortcut
  // below) reaches "done" — dismissing the checklist without actually
  // finishing the 5 tasks shouldn't falsely celebrate completion.
  const [showMilestone, setShowMilestone] = useState(false);
  useEffect(() => {
    const refresh = () => {
      const state = getSchoolOnboarding();
      const realStage = computeSchoolFtueStage();
      // An admin who's explicitly dismissed the checklist has opted out of
      // this guidance — treat that the same as "done" so the dashboard
      // doesn't stay fogged and the tour doesn't try to spotlight a row
      // that's no longer in the DOM.
      setStage(state.checklistDismissed ? "done" : realStage);
      setStageHydrated(true);
      setShowMilestone(realStage === "done" && !state.milestoneSeen);
    };
    refresh();
    window.addEventListener("ah-school-onboarding-change", refresh);
    return () => window.removeEventListener("ah-school-onboarding-change", refresh);
  }, []);

  const dismissMilestone = () => {
    markSchoolMilestoneSeen();
    setShowMilestone(false);
  };

  const handleTakeMeThere = () => {
    if (stage === "done") return;
    const task = SCHOOL_ACTIVATION_TASKS.find((t) => t.id === SCHOOL_STAGE_TASK[stage]);
    if (!task) return;
    markSchoolTaskDone(task.id);
    router.push(task.to);
  };

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] premium-dotgrid opacity-70"
        aria-hidden
      />

      <motion.div
        initial={reduce ? undefined : "hidden"}
        animate="show"
        variants={fadeIn}
        className="relative space-y-6"
      >
        {/* School performance overview · context + filters */}
        <SchoolContextHeader
          context={SCHOOL_CONTEXT}
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((p) => ({ ...p, [key]: value }))
          }
        />

        {/* Tier 0 · Activation */}
        <SchoolOnboardingChecklist />

        {/* Segment 1 · School Data Readiness & Leadership Action Hub */}
        <SchoolLeadershipActionHub />

        {/* Segment 2 · School Health Score */}
        <SchoolHealthScoreCard />

        {/* Segment 3 · School Health Driver Cards — unlocks once teachers are invited. */}
        <LockedSection
          label="Health Driver Cards locked"
          hint="Unlocks once your first teachers are invited."
          locked={STAGE_RANK[stage] < 1}
          onAction={handleTakeMeThere}
        >
          <SchoolHealthDriverCards />
        </LockedSection>

        {/* Segment 4 · Grade & Classroom Overview — unlocks once the monthly digest is reviewed. */}
        <LockedSection
          label="Grade & Classroom Overview locked"
          hint="Unlocks once you've previewed the monthly digest."
          locked={STAGE_RANK[stage] < 2}
          onAction={handleTakeMeThere}
        >
          <GradeClassroomOverview />
        </LockedSection>

        {/* Segment 5 · Tier Support Distribution — unlocks once alert thresholds are set. */}
        <LockedSection
          label="Tier Support Distribution locked"
          hint="Unlocks once school-wide alert thresholds are set."
          locked={STAGE_RANK[stage] < 3}
          onAction={handleTakeMeThere}
        >
          <TierSupportDistribution />
        </LockedSection>

        {/* Segment 5.1 · Intervention Implementation — same real gate as tier support. */}
        <LockedSection
          label="Intervention Implementation locked"
          hint="Unlocks once school-wide alert thresholds are set."
          locked={STAGE_RANK[stage] < 3}
          onAction={handleTakeMeThere}
        >
          <InterventionImplementation />
        </LockedSection>

        {/* Segment 6 · Teacher & Classroom Support Needs — final gate, unlocks once activation is fully done. */}
        <LockedSection
          label="Teacher & Classroom Support Needs locked"
          hint="Unlocks once the first all-staff report is scheduled."
          locked={STAGE_RANK[stage] < 5}
          onAction={handleTakeMeThere}
        >
          <TeacherClassroomSupportNeeds />
        </LockedSection>

        {/* Segment 7 · Positive Behaviour Culture — unlocks once parent comms are configured. */}
        <LockedSection
          label="Positive Behaviour Culture locked"
          hint="Unlocks once parent communications are configured."
          locked={STAGE_RANK[stage] < 4}
          onAction={handleTakeMeThere}
        >
          <PositiveBehaviourCulture />
        </LockedSection>

        {/* Footer entry points to detail pages */}
        <CohortFooter
          activeTeachers={activeTeachers}
          dormantTeachers={dormantTeachers}
        />
      </motion.div>

      {stageHydrated && <SchoolDashboardTour stage={stage} />}
      <SchoolMilestoneDialog open={showMilestone} onDismiss={dismissMilestone} />
    </div>
  );
}

function CohortFooter({
  activeTeachers,
  dormantTeachers,
}: {
  activeTeachers: number;
  dormantTeachers: number;
}) {
  return (
    <FooterLink
      to="/school/teachers"
      label="Teacher cohort"
      detail={`${activeTeachers} active · ${dormantTeachers} dormant — manage cohort`}
      icon={<Users className="h-4 w-4" />}
    />
  );
}

function FooterLink({
  to,
  label,
  detail,
  icon,
}: {
  to: "/school/teachers";
  label: string;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      {icon && (
        <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[13px] leading-tight">
          {label}
        </div>
        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
          {detail}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
