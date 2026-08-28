"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { SelActionHub } from "@/components/sel/SelActionHub";
import { SelSetupQueue } from "@/components/sel/SelSetupQueue";
import { SelMonitorFocusCard } from "@/components/sel/SelMonitorFocusCard";
import { SchoolSnapshot } from "@/components/sel/SchoolSnapshot";
import { SchoolClimateCard } from "@/components/sel/SchoolClimateCard";
import { ImplementationRateCard } from "@/components/sel/ImplementationRateCard";
import { TierSupportCard } from "@/components/sel/TierSupportCard";
import { TeacherImplementationCard } from "@/components/sel/TeacherImplementationCard";
import { TeacherConnectionStatus } from "@/components/sel/TeacherConnectionStatus";
import { SelTrendsCard } from "@/components/sel/SelTrendsCard";
import { SelMilestoneDialog } from "@/components/sel/SelMilestoneDialog";
import { LockedSection } from "@/components/dashboard/LockedSection";
import { getPulses, buildSelActionHub, type Pulse, type SelActionPriority } from "@/lib/selPulse";
import {
  classroomImplementationRows,
  buildImplementationActionItems,
  buildNeedVsImplementationActionItems,
  implementationSummary,
} from "@/lib/selImplementation";
import { getPrograms, connectedTeacherSummary, type SelProgram } from "@/lib/selProgram";
import { getGroups, tierDistribution, buildGroupActionItems, type SelGroup } from "@/lib/selGroups";
import {
  getTeacherRequests,
  teacherImplementationDistribution,
  teacherDistributionSummary,
  buildTeacherSupportActionItems,
  type TeacherRequest,
} from "@/lib/selTeacherSupport";
import { computeSelFtueStage, getSelOnboarding, markSelMilestoneSeen, type SelFtueStage } from "@/lib/selOnboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Every locked segment's "Take me there" jumps to whatever the coordinator
// still needs to finish next — same one-stage-machine pattern as the
// teacher dashboard's nextActionTarget.
function nextSelActionTarget(stage: SelFtueStage): { type: "scroll"; selector: string } | { type: "navigate"; href: string } {
  switch (stage) {
    case "pulse":
      return { type: "navigate", href: "/sel/pulse?create=1" };
    case "program":
      return { type: "navigate", href: "/sel/planner" };
    case "group":
      return { type: "navigate", href: "/sel/groups" };
    case "monitor":
    default:
      return { type: "scroll", selector: "[data-tour-target='sel-monitor-focus']" };
  }
}

export default function Page() {
  return (
    <SelAppShell>
      <SelDashboard />
    </SelAppShell>
  );
}

function SelDashboard() {
  const reduce = useReducedMotion();
  const router = useRouter();

  // Starts at the SSR-safe default and hydrates to the real stage in the
  // effect below — same pattern as pulses/programs/groups just below.
  // (Branching this initializer on `typeof window` looks tempting but
  // causes a real hydration mismatch: the server always renders "monitor",
  // so a client whose real stage differs mismatches on first paint.)
  const [stage, setStage] = useState<SelFtueStage>("monitor");
  useEffect(() => {
    const refresh = () => setStage(computeSelFtueStage());
    refresh();
    window.addEventListener("ah-sel-onboarding-change", refresh);
    window.addEventListener("ah-sel-pulse-change", refresh);
    window.addEventListener("ah-sel-program-change", refresh);
    window.addEventListener("ah-sel-group-change", refresh);
    return () => {
      window.removeEventListener("ah-sel-onboarding-change", refresh);
      window.removeEventListener("ah-sel-pulse-change", refresh);
      window.removeEventListener("ah-sel-program-change", refresh);
      window.removeEventListener("ah-sel-group-change", refresh);
    };
  }, []);

  // Shows the "Your SEL dashboard is ready" milestone once, the first time
  // this session's stage reaches "done" — not on every later visit.
  const [showMilestone, setShowMilestone] = useState(false);
  useEffect(() => {
    const refresh = () => setShowMilestone(stage === "done" && !getSelOnboarding().milestoneSeen);
    refresh();
  }, [stage]);
  const dismissMilestone = () => {
    markSelMilestoneSeen();
    setShowMilestone(false);
  };

  const handleTakeMeThere = () => {
    const target = nextSelActionTarget(stage);
    if (target.type === "navigate") {
      router.push(target.href);
    } else {
      window.setTimeout(() => {
        document.querySelector(target.selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
  };

  // Real, but localStorage-backed — fetched client-side only to avoid an
  // SSR/hydration mismatch, same pattern used across the other role shells.
  const [pulses, setPulses] = useState<Pulse[]>([]);
  useEffect(() => {
    const refresh = () => setPulses(getPulses());
    refresh();
    window.addEventListener("ah-sel-pulse-change", refresh);
    return () => window.removeEventListener("ah-sel-pulse-change", refresh);
  }, []);

  const [programs, setPrograms] = useState<SelProgram[]>([]);
  useEffect(() => {
    const refresh = () => setPrograms(getPrograms());
    refresh();
    window.addEventListener("ah-sel-program-change", refresh);
    return () => window.removeEventListener("ah-sel-program-change", refresh);
  }, []);

  const [groups, setGroups] = useState<SelGroup[]>([]);
  useEffect(() => {
    const refresh = () => setGroups(getGroups());
    refresh();
    window.addEventListener("ah-sel-group-change", refresh);
    return () => window.removeEventListener("ah-sel-group-change", refresh);
  }, []);

  const [teacherRequests, setTeacherRequests] = useState<TeacherRequest[]>([]);
  useEffect(() => {
    const refresh = () => setTeacherRequests(getTeacherRequests());
    refresh();
    window.addEventListener("ah-sel-teacher-request-change", refresh);
    return () => window.removeEventListener("ah-sel-teacher-request-change", refresh);
  }, []);

  const tiers = useMemo(() => tierDistribution(programs, groups), [programs, groups]);

  // classroomImplementationRows() is pure/static (no localStorage), so this
  // doesn't need to be in a state-tracked effect like pulses/programs.
  const implementationRows = useMemo(() => classroomImplementationRows(), []);
  const implementationSummaryData = useMemo(() => implementationSummary(implementationRows), [implementationRows]);

  const teacherDistribution = useMemo(
    () => teacherImplementationDistribution(teacherRequests, implementationRows),
    [teacherRequests, implementationRows],
  );
  const teacherSummary = useMemo(() => teacherDistributionSummary(teacherDistribution), [teacherDistribution]);
  const connectedTeacher = useMemo(() => connectedTeacherSummary(programs), [programs]);

  // The Implementation Tracker's classroom rows are real (drawn from the
  // actual roster) even though planned/completed counts are seed data, so
  // its rung is combined with Pulse's real emerging-pattern rungs here.
  const actionItems = useMemo(() => {
    const combined = [
      ...buildSelActionHub(pulses),
      ...buildNeedVsImplementationActionItems(pulses, implementationRows),
      ...buildImplementationActionItems(implementationRows),
      ...buildGroupActionItems(groups),
      ...buildTeacherSupportActionItems(teacherRequests, teacherDistribution),
    ];
    const rank: Record<SelActionPriority, number> = { high: 0, medium: 1, low: 2 };
    return combined.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, [pulses, implementationRows, groups, teacherRequests, teacherDistribution]);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-6"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <HeartHandshake className="h-3 w-3" />
          <span>SEL coordination workspace</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          SEL Coordinator Dashboard
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
          Track social-emotional wellbeing signals and the top actions they surface.
        </p>
      </header>

      {stage === "monitor" && <SelMonitorFocusCard onDone={() => setStage(computeSelFtueStage())} />}

      <SchoolSnapshot
        stage={stage}
        pulses={pulses}
        programs={programs}
        groups={groups}
        implementation={implementationSummaryData}
      />

      {stage === "done" ? (
        <SelActionHub items={actionItems} />
      ) : (
        <SelSetupQueue stage={stage} pulses={pulses} />
      )}

      <LockedSection
        label="School Climate locked"
        hint="Unlocks once your first SEL Pulse is launched."
        locked={stage === "monitor" || stage === "pulse"}
        onAction={handleTakeMeThere}
      >
        <SchoolClimateCard />
      </LockedSection>

      <LockedSection
        label="SEL Implementation locked"
        hint="Unlocks once your first SEL program is set up."
        locked={stage === "monitor" || stage === "pulse" || stage === "program"}
        onAction={handleTakeMeThere}
      >
        <ImplementationRateCard summary={implementationSummaryData} />
      </LockedSection>

      <LockedSection
        label="Tiered Support locked"
        hint="Unlocks once targeted support groups are being tracked."
        locked={stage !== "done"}
        onAction={handleTakeMeThere}
      >
        <TierSupportCard tiers={tiers} />
      </LockedSection>

      {stage === "monitor" || stage === "pulse" || stage === "program" ? (
        <LockedSection
          label="Teacher Implementation locked"
          hint="Unlocks once your SEL program is set up."
          locked
          onAction={handleTakeMeThere}
        >
          <TeacherImplementationCard summary={teacherSummary} totalTeachers={teacherDistribution.length} />
        </LockedSection>
      ) : stage === "group" ? (
        <TeacherConnectionStatus connected={connectedTeacher.connected} total={connectedTeacher.total} />
      ) : (
        <TeacherImplementationCard summary={teacherSummary} totalTeachers={teacherDistribution.length} />
      )}

      <SelTrendsCard pulses={pulses} />

      <SelMilestoneDialog open={showMilestone} onDismiss={dismissMilestone} />
    </motion.div>
  );
}
