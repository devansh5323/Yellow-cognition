"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/dashboard/AppShell";
import { DataReadinessCard } from "@/components/dashboard/DataReadinessCard";
import { ClassroomHealthScore } from "@/components/dashboard/ClassroomHealthScore";
import { PillarHealthRow } from "@/components/dashboard/PillarHealthRow";
import { StudentWellbeingRow } from "@/components/dashboard/StudentWellbeingRow";
import { GrowthAlertRow } from "@/components/dashboard/GrowthAlertRow";
import { TeacherCheckInTools } from "@/components/dashboard/TeacherCheckInTools";
import { WeeklyFocus } from "@/components/dashboard/WeeklyFocus";
import { ProgressOverTime } from "@/components/dashboard/ProgressOverTime";
import { CoachmarkTour } from "@/components/onboarding/CoachmarkTour";

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
        <DataReadinessCard />
        <ClassroomHealthScore />
        <PillarHealthRow />
        <StudentWellbeingRow />
        <GrowthAlertRow />
        <TeacherCheckInTools />
        <WeeklyFocus />
        <ProgressOverTime />
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
