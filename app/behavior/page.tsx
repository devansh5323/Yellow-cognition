"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange, ChevronRight, Users } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSourcesConfidence } from "@/components/dashboard/DataSourcesConfidence";
import { BehaviorSnapshot } from "@/components/dashboard/BehaviorSnapshot";
import { BehaviorClassroomStrategies } from "@/components/dashboard/BehaviorClassroomStrategies";
import { BehaviorDriverCards } from "@/components/dashboard/BehaviorDriverCards";
import { ProblemAreasToSkills } from "@/components/dashboard/ProblemAreasToSkills";
import { BehaviorTrendTracking } from "@/components/dashboard/BehaviorTrendTracking";
import { BehaviorPatternInsights } from "@/components/dashboard/BehaviorPatternInsights";
import { BehaviorPriorityActions } from "@/components/dashboard/BehaviorPriorityActions";
import { BehaviorActivityContext } from "@/components/dashboard/BehaviorActivityContext";
import { BehaviorTimeOfDay } from "@/components/dashboard/BehaviorTimeOfDay";
import { BehaviorWatchlistRail } from "@/components/dashboard/BehaviorWatchlistRail";
import { BehaviorSupportTable } from "@/components/dashboard/BehaviorSupportTable";
import { PbisProgressLog } from "@/components/dashboard/PbisProgressLog";
import { MonthlyBehaviorCheckIn } from "@/components/dashboard/MonthlyBehaviorCheckIn";
import { BehaviorTriggersActions } from "@/components/dashboard/BehaviorTriggersActions";
import {
  behaviorActivityContextPatterns,
  behaviorPatternInsights,
  behaviorPriorityActions,
  behaviorTimeOfDayPattern,
  behaviorTriggerPatterns,
  classBehaviorSnapshot,
  classDisruptionBreakdown,
  pickStrategiesForTriggers,
  studentsNeedingBehaviorSupport,
} from "@/lib/classBehavior";
import {
  getBehaviorLogAntecedentsThisWeek,
  getBehaviorLogTimestampsThisWeek,
  getPositiveLogCountThisWeek,
} from "@/lib/checkInTools";
import { getAllFollowUpRecords } from "@/lib/interventionFollowUps";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <BehaviorRoute />;
}

const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;
const PERIODS = ["This Month", "Last Month", "This Term"] as const;

function BehaviorRoute() {
  const [classroom, setClassroom] = useState<(typeof CLASSES)[number]>("Class 5B");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("This Month");

  const topbarFilters = (
    <>
      <TopbarSelect
        icon={<Users className="h-3.5 w-3.5" />}
        value={classroom}
        onChange={(v) => setClassroom(v as (typeof CLASSES)[number])}
        options={CLASSES}
      />
      <TopbarSelect
        icon={<CalendarRange className="h-3.5 w-3.5" />}
        value={period}
        onChange={(v) => setPeriod(v as (typeof PERIODS)[number])}
        options={PERIODS}
      />
    </>
  );

  return (
    <AppShell topbarFilters={topbarFilters}>
      <BehaviorPage classroom={classroom} />
    </AppShell>
  );
}

function BehaviorPage({ classroom }: { classroom: string }) {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => classBehaviorSnapshot(), []);
  const breakdown = useMemo(() => classDisruptionBreakdown(), []);
  const supportRoster = useMemo(() => studentsNeedingBehaviorSupport(), []);
  // Real, but localStorage-backed — fetched client-side only to avoid an
  // SSR/hydration mismatch, same pattern as DataSourcesConfidence.
  const [positiveLogs, setPositiveLogs] = useState(0);
  useEffect(() => {
    const refresh = () => setPositiveLogs(getPositiveLogCountThisWeek());
    refresh();
    window.addEventListener("ah-positive-log-change", refresh);
    return () => window.removeEventListener("ah-positive-log-change", refresh);
  }, []);

  const [followUps, setFollowUps] = useState<ReturnType<typeof getAllFollowUpRecords>>([]);
  useEffect(() => {
    const refresh = () => setFollowUps(getAllFollowUpRecords());
    refresh();
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, []);

  const patternInsights = useMemo(
    () => behaviorPatternInsights(breakdown, followUps),
    [breakdown, followUps],
  );

  const priorityActions = useMemo(
    () => behaviorPriorityActions(breakdown, supportRoster, positiveLogs),
    [breakdown, supportRoster, positiveLogs],
  );

  const activityContextRows = useMemo(() => behaviorActivityContextPatterns(breakdown), [breakdown]);

  const [behaviorTimestamps, setBehaviorTimestamps] = useState<string[]>([]);
  const [behaviorAntecedents, setBehaviorAntecedents] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      setBehaviorTimestamps(getBehaviorLogTimestampsThisWeek());
      setBehaviorAntecedents(getBehaviorLogAntecedentsThisWeek());
    };
    refresh();
    window.addEventListener("ah-behavior-log-change", refresh);
    return () => window.removeEventListener("ah-behavior-log-change", refresh);
  }, []);

  const timeOfDayPattern = useMemo(
    () => behaviorTimeOfDayPattern(behaviorTimestamps, breakdown),
    [behaviorTimestamps, breakdown],
  );

  const triggerRows = useMemo(
    () => behaviorTriggerPatterns(behaviorAntecedents),
    [behaviorAntecedents],
  );

  const recommendedStrategies = useMemo(
    () => pickStrategiesForTriggers(behaviorAntecedents),
    [behaviorAntecedents],
  );

  const triggerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const trigger of behaviorAntecedents) counts[trigger] = (counts[trigger] ?? 0) + 1;
    return counts;
  }, [behaviorAntecedents]);

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        {/* Page header */}
        <header className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
          >
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">Behaviour & Discipline</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Classroom behaviour & discipline
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            How {classroom} is regulating itself — disruptions, time gained, triggers, and what to
            try next.
          </p>
        </header>

        {/* 1. Data sources & confidence */}
        <DataSourcesConfidence />

        {/* 9. Students Watchlist + Quick Actions — sticky right rail on
            desktop, so it's always the teacher's action console alongside
            whatever section they're reading. */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            {/* 2. Behaviour snapshot */}
            <BehaviorSnapshot snapshot={snapshot} />

            {/* Priority actions — right after the snapshot, above the rest of the journey. */}
            <BehaviorPriorityActions actions={priorityActions} supportRoster={supportRoster} />

            {/* 4 + 5. Where friction is coming from — collapsible driver cards + impacting skills */}
            <BehaviorDriverCards stats={breakdown} />

            {/* 3. Problem Areas to Skills — static reference table */}
            <ProblemAreasToSkills />

            {/* 6. Cross-pattern insights across all logs and check-ins */}
            <BehaviorPatternInsights insights={patternInsights} />

            {/* 10. Activity / context pattern — where the behaviour is happening */}
            <BehaviorActivityContext rows={activityContextRows} />

            {/* 11. Time-of-day pattern — compact */}
            <BehaviorTimeOfDay pattern={timeOfDayPattern} />

            {/* PBIS progress monitoring — log of every strategy tried */}
            <PbisProgressLog />

            {/* Monthly check-in */}
            <MonthlyBehaviorCheckIn />

            {/* 5. Behavior Triggers & Actions — why is this happening */}
            <BehaviorTriggersActions rows={triggerRows} />

            {/* 6. Classroom Management Strategies — connects triggers to strategies */}
            <BehaviorClassroomStrategies strategies={recommendedStrategies} triggerCounts={triggerCounts} />

            {/* 7. Behavior Trend Tracking — is behaviour improving? */}
            <BehaviorTrendTracking />

            {/* 8. Students Needing Behavior Support — individual layer */}
            <BehaviorSupportTable items={supportRoster} />
          </div>

          <div className="xl:sticky xl:top-[84px]">
            <BehaviorWatchlistRail supportRoster={supportRoster} />
          </div>
        </div>
      </motion.div>
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
