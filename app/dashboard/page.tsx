"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { AssignedSelProgramBanner } from "@/components/dashboard/AssignedSelProgramBanner";
import { ClassroomSetupPrompt } from "@/components/onboarding/ClassroomSetupPrompt";
import { DataReadinessCard } from "@/components/dashboard/DataReadinessCard";
import { ClassroomHealthScore } from "@/components/dashboard/ClassroomHealthScore";
import { DriverCards } from "@/components/dashboard/DriverCards";
import { WeeklyFocus } from "@/components/dashboard/WeeklyFocus";
import { TeacherCheckInTools } from "@/components/dashboard/TeacherCheckInTools";
import { BehaviorPatternInsightsSection } from "@/components/dashboard/BehaviorPatternInsightsSection";
import { StudentDrilldownRow } from "@/components/dashboard/StudentDrilldownRow";
import { LockedSection } from "@/components/dashboard/LockedSection";
import { getOnboarding } from "@/lib/onboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

// The setup journey, end to end: the 3 cards in Data Readiness → Class
// Health Score (do your first check-in) → Teacher Check-In Tools' Record
// Behaviour → its Positive Behaviour Log → everything unlocked. Each stage
// highlights exactly one real dashboard segment instead of a separate
// checklist, and only the next segment in line is ever unlocked/glowing —
// it should read as a guided tour/tutorial, not a free-for-all.
type FtueStage = "cards" | "checkin" | "behavior" | "positive" | "done";

function computeStage(): FtueStage {
  const onboarding = getOnboarding();
  const hasClassroom = onboarding.classrooms.length > 0;
  const rosterReady = hasClassroom && onboarding.classrooms.every((c) => c.rosterReady);
  const cardsDone = hasClassroom && rosterReady && !!onboarding.focusArea && !!onboarding.fumiActivated;
  if (!cardsDone) return "cards";
  if (!onboarding.tasks["first-checkin"]) return "checkin";
  if (!onboarding.tasks["behavior-log"]) return "behavior";
  if (!onboarding.tasks["positive-log"]) return "positive";
  return "done";
}

function scrollToTarget(selector: string, delay = 300) {
  window.setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, delay);
}

// Canonical L1 Teacher Dashboard architecture (2026-08-13 spec) — exactly
// these 9 segments, in this order. FTUE: Data Readiness & Action Hub (with
// its own "Three simple steps"), Class health score, Driver cards. RTUE:
// Yellow Recommendations, Teacher Check-In Tools, Behaviour Pattern
// Insights, Student Drilldown Entry Points, Intervention Follow-Up Entry
// Points (the latter lives as a card inside Teacher Check-In Tools, not a
// separate segment).
function DashboardPage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  // Lazily read once on mount so the ref below starts in sync with reality
  // (not a hardcoded default) — otherwise a plain page reload mid-journey
  // would look like a fake "transition" and re-fire toasts/scrolls.
  const [stage, setStage] = useState<FtueStage>(() =>
    typeof window === "undefined" ? "cards" : computeStage(),
  );
  const prevStageRef = useRef<FtueStage>(stage);

  // Arriving straight from submitting the first check-in (see
  // app/check-in/page.tsx's redirect) — scroll to Teacher Check-In Tools
  // regardless of the live-transition tracking below, since this is a fresh
  // page load, not a state change observed while already mounted here.
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (focus === "teacher-tools") {
      scrollToTarget("[data-tour-target='teacher-checkin-tools']", 400);
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const refresh = () => {
      const next = computeStage();
      const prev = prevStageRef.current;
      if (prev !== next) {
        if (next === "positive") {
          toast.success("Nice work! Now recognise a positive behaviour.");
          scrollToTarget("[data-tour-target='teacher-checkin-tools']");
        } else if (next === "done") {
          toast.success("Your classroom insights are ready!");
          scrollToTarget("[data-tour-target='classroom-health']");
        }
      }
      prevStageRef.current = next;
      setStage(next);
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

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
        <LockedSection label="Locked" hint="Unlocks once you complete setup" locked={stage === "cards"}>
          <ClassroomHealthScore locked={stage !== "done"} highlighted={stage === "checkin"} />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup" locked={stage !== "done"}>
          <DriverCards locked={stage !== "done"} />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup" locked={stage !== "done"}>
          <WeeklyFocus locked={stage !== "done"} />
        </LockedSection>
        <LockedSection
          label="Locked"
          hint="Unlocks once you complete setup"
          locked={stage === "cards" || stage === "checkin"}
        >
          <TeacherCheckInTools
            highlightTool={stage === "behavior" ? "record-behavior" : stage === "positive" ? "positive-log" : undefined}
          />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup" locked={stage !== "done"}>
          <BehaviorPatternInsightsSection locked={stage !== "done"} />
        </LockedSection>
        <LockedSection label="Locked" hint="Unlocks once you complete setup" locked={stage !== "done"}>
          <StudentDrilldownRow locked={stage !== "done"} />
        </LockedSection>
      </motion.div>
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
