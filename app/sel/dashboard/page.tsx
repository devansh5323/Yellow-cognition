"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { SelActionHub } from "@/components/sel/SelActionHub";
import { SelSnapshot } from "@/components/sel/SelSnapshot";
import { SchoolClimateCard } from "@/components/sel/SchoolClimateCard";
import { ImplementationRateCard } from "@/components/sel/ImplementationRateCard";
import { TierSupportCard } from "@/components/sel/TierSupportCard";
import { TeacherImplementationCard } from "@/components/sel/TeacherImplementationCard";
import { getPulses, buildSelActionHub, type Pulse, type SelActionPriority } from "@/lib/selPulse";
import {
  classroomImplementationRows,
  buildImplementationActionItems,
  implementationSummary,
} from "@/lib/selImplementation";
import {
  studentParticipationSummary,
  pulseParticipationSummary,
  classroomOverviewSummary,
  groupSupportSummary,
  teacherRequestsSummary,
} from "@/lib/selSnapshot";
import { getPrograms, type SelProgram } from "@/lib/selProgram";
import { getGroups, tierDistribution, buildGroupActionItems, type SelGroup } from "@/lib/selGroups";
import {
  getTeacherRequests,
  teacherImplementationDistribution,
  teacherDistributionSummary,
  buildTeacherSupportActionItems,
  type TeacherRequest,
} from "@/lib/selTeacherSupport";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <SelAppShell>
      <SelDashboard />
    </SelAppShell>
  );
}

function SelDashboard() {
  const reduce = useReducedMotion();

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

  const snapshot = useMemo(
    () => ({
      participation: studentParticipationSummary(programs),
      pulse: pulseParticipationSummary(pulses),
      groups: groupSupportSummary(groups),
      classrooms: classroomOverviewSummary(),
      requests: teacherRequestsSummary(teacherRequests),
    }),
    [pulses, programs, groups, teacherRequests],
  );

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

  // The Implementation Tracker's classroom rows are real (drawn from the
  // actual roster) even though planned/completed counts are seed data, so
  // its rung is combined with Pulse's real emerging-pattern rungs here.
  const actionItems = useMemo(() => {
    const combined = [
      ...buildSelActionHub(pulses),
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

      <SelSnapshot
        participation={snapshot.participation}
        pulse={snapshot.pulse}
        groups={snapshot.groups}
        classrooms={snapshot.classrooms}
        requests={snapshot.requests}
      />

      <SelActionHub items={actionItems} />

      <SchoolClimateCard />

      <ImplementationRateCard summary={implementationSummaryData} />

      <TierSupportCard tiers={tiers} />

      <TeacherImplementationCard summary={teacherSummary} totalTeachers={teacherDistribution.length} />
    </motion.div>
  );
}
