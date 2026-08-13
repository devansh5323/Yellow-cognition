"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/dashboard/AppShell";
import { AssignedSelProgramBanner } from "@/components/dashboard/AssignedSelProgramBanner";
import { ClassroomSetupPrompt } from "@/components/onboarding/ClassroomSetupPrompt";
import { DataReadinessCard } from "@/components/dashboard/DataReadinessCard";
import { ClassroomHealthScore } from "@/components/dashboard/ClassroomHealthScore";
import { PillarHealthRow } from "@/components/dashboard/PillarHealthRow";
import { StudentWellbeingRow } from "@/components/dashboard/StudentWellbeingRow";
import { GrowthAlertRow } from "@/components/dashboard/GrowthAlertRow";
import { TeacherCheckInTools } from "@/components/dashboard/TeacherCheckInTools";
import { WeeklyFocus } from "@/components/dashboard/WeeklyFocus";
import { ProgressOverTime } from "@/components/dashboard/ProgressOverTime";
import { DriverCards } from "@/components/dashboard/DriverCards";
import { BehaviorPatternInsightsSection } from "@/components/dashboard/BehaviorPatternInsightsSection";
import { StudentDrilldownRow } from "@/components/dashboard/StudentDrilldownRow";
import { CoachmarkTour } from "@/components/onboarding/CoachmarkTour";
import { LockedSection } from "@/components/dashboard/LockedSection";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function DashboardPage() {
  const reduce = useReducedMotion();

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
        <ClassroomSetupPrompt />
        <AssignedSelProgramBanner />
        <DataReadinessCard />
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <ClassroomHealthScore locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <TeacherCheckInTools />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <DriverCards locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <BehaviorPatternInsightsSection locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <StudentDrilldownRow locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <PillarHealthRow locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <StudentWellbeingRow locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <GrowthAlertRow locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <WeeklyFocus locked />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup">
          <ProgressOverTime locked />
        </LockedSection>
      </motion.div>

      <CoachmarkTour />
    </div>
  );
}

export default function Page() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}
