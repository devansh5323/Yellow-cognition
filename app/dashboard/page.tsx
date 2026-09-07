"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/dashboard/AppShell";
import { AssignedSelProgramBanner } from "@/components/dashboard/AssignedSelProgramBanner";
import { ClassroomSetupPrompt } from "@/components/onboarding/ClassroomSetupPrompt";
import { ClassroomReadyDialog } from "@/components/onboarding/ClassroomReadyDialog";
import { DataReadinessCard } from "@/components/dashboard/DataReadinessCard";
import { ClassroomHealthScore } from "@/components/dashboard/ClassroomHealthScore";
import { DriverCards } from "@/components/dashboard/DriverCards";
import { WeeklyFocus } from "@/components/dashboard/WeeklyFocus";
import { TeacherCheckInTools } from "@/components/dashboard/TeacherCheckInTools";
import { BehaviorPatternInsightsSection } from "@/components/dashboard/BehaviorPatternInsightsSection";
import { StudentDrilldownRow } from "@/components/dashboard/StudentDrilldownRow";
import { LockedSection } from "@/components/dashboard/LockedSection";
import { computeFtueStage, type FtueStage } from "@/lib/onboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function scrollToTarget(selector: string, delay = 300) {
  window.setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, delay);
}

// Every locked segment's "Take me there" jumps to whatever the teacher
// still needs to finish next — the same underlying gate, regardless of
// which segment they clicked from, since they all unlock off this one
// stage machine.
function nextActionTarget(stage: FtueStage): { type: "scroll"; selector: string } | { type: "navigate"; href: string } {
  switch (stage) {
    case "tour":
      return { type: "navigate", href: "/check-in" };
    case "cards":
    default:
      return { type: "scroll", selector: "[data-tour-target='data-readiness']" };
  }
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
    typeof window === "undefined" ? "cards" : computeFtueStage(),
  );

  // Arriving straight from finishing the Classroom Log walkthrough (see
  // app/check-in/page.tsx's redirect) — scroll to Class Health Score
  // regardless of the live-transition tracking below, since this is a fresh
  // page load, not a state change observed while already mounted here.
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (focus === "classroom-health") {
      scrollToTarget("[data-tour-target='classroom-health']", 400);
      router.replace("/dashboard");
    }
  }, [router]);

  // Both refs (not state) since they're read/written from inside an effect
  // closure that only ever runs once (deps: [router]) and would otherwise
  // see a stale snapshot of any state variable it captured.
  const stageRef = useRef<FtueStage>(stage);
  const celebratingRef = useRef(false);
  const [showClassroomReady, setShowClassroomReady] = useState(false);

  // Redirect into the Classroom Log walkthrough whenever this page is
  // showing while stage is "tour". Two cases, handled differently:
  //  - A LIVE transition (finishing the 3rd setup card while already here)
  //    — show a "your first class is set up" beat first (ClassroomReadyDialog)
  //    rather than yanking the teacher straight out of the still-open
  //    "Send invite" dialog into a whole new page.
  //  - A fresh landing that's already mid-tour (e.g. a reload, or coming
  //    back before finishing it) — no live moment to celebrate, so redirect
  //    immediately, same as before.
  // The "tour" → "done" transition only ever happens on /check-in, handled
  // by the redirect above instead. celebratingRef guards against a second
  // ah-onboarding-change firing (from some unrelated setOnboarding call)
  // while the celebration dialog is still up from the first one.
  useEffect(() => {
    const refresh = () => {
      const next = computeFtueStage();
      if (next === "tour" && !celebratingRef.current) {
        if (stageRef.current !== "tour") {
          celebratingRef.current = true;
          setShowClassroomReady(true);
        } else {
          router.push("/check-in");
        }
      }
      stageRef.current = next;
      setStage(next);
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, [router]);

  const goToClassroomLog = () => {
    setShowClassroomReady(false);
    router.push("/check-in");
  };

  const handleTakeMeThere = () => {
    const target = nextActionTarget(stage);
    if (target.type === "navigate") {
      router.push(target.href);
    } else {
      scrollToTarget(target.selector, 0);
    }
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
        <ClassroomSetupPrompt />
        <AssignedSelProgramBanner />
        <DataReadinessCard />
        {/* No outer LockedSection here — ClassroomHealthScore already renders
            its own locked-state UI ("Almost ready" / "Start check-in"), which
            the generic blur-fog treatment would otherwise obscure and make
            unclickable on top of. */}
        <ClassroomHealthScore locked={stage !== "done"} />
        <LockedSection
          label="Driver cards locked"
          hint="See what's driving your Class Health Score once setup is done."
          locked={stage !== "done"}
          onAction={handleTakeMeThere}
        >
          <DriverCards locked={stage !== "done"} />
        </LockedSection>
        <LockedSection
          label="Recommendations locked"
          hint="Yellow's tiered support suggestions unlock once setup is done."
          locked={stage !== "done"}
          onAction={handleTakeMeThere}
        >
          <WeeklyFocus locked={stage !== "done"} />
        </LockedSection>
        <LockedSection
          label="Check-in tools locked"
          hint="Record behaviour and positive logs once setup is done."
          locked={stage !== "done"}
          onAction={handleTakeMeThere}
        >
          <TeacherCheckInTools />
        </LockedSection>
        <LockedSection
          label="Pattern insights locked"
          hint="Spot recurring behaviour patterns once setup is done."
          locked={stage !== "done"}
          onAction={handleTakeMeThere}
        >
          <BehaviorPatternInsightsSection locked={stage !== "done"} />
        </LockedSection>
        <LockedSection
          label="Student drilldown locked"
          hint="Jump into individual student profiles once setup is done."
          locked={stage !== "done"}
          onAction={handleTakeMeThere}
        >
          <StudentDrilldownRow locked={stage !== "done"} />
        </LockedSection>
      </motion.div>

      <ClassroomReadyDialog open={showClassroomReady} onContinue={goToClassroomLog} />
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
