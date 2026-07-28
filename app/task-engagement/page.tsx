"use client";

import { useMemo, useState } from "react";

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
import { TaskEngagementSnapshot } from "@/components/dashboard/TaskEngagementSnapshot";
import { TaskRecommendsStrip } from "@/components/dashboard/TaskRecommendsStrip";
import { TaskBreakdown } from "@/components/dashboard/TaskBreakdown";
import { TaskInsights } from "@/components/dashboard/TaskInsights";
import { TaskTrendTracking } from "@/components/dashboard/TaskTrendTracking";
import { TaskSupportTable } from "@/components/dashboard/TaskSupportTable";
import { MonthlyTaskCheckIn } from "@/components/dashboard/MonthlyTaskCheckIn";
import {
  classTaskBreakdown,
  classTaskSnapshot,
  pickTaskStrategies,
  studentsNeedingTaskSupport,
  taskEngagementInsights,
} from "@/lib/classTask";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <TaskEngagementRoute />;
}

const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;
const PERIODS = ["This Month", "Last Month", "This Term"] as const;

function TaskEngagementRoute() {
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
      <TaskEngagementPage classroom={classroom} />
    </AppShell>
  );
}

function TaskEngagementPage({ classroom }: { classroom: string }) {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => classTaskSnapshot(), []);
  const breakdown = useMemo(() => classTaskBreakdown(), []);
  const strategies = useMemo(() => pickTaskStrategies(breakdown, 3), [breakdown]);
  const insights = useMemo(() => taskEngagementInsights(), []);
  const supportRoster = useMemo(() => studentsNeedingTaskSupport(), []);

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        <header className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
          >
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">Task engagement</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Task engagement & persistence
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            How {classroom} is starting, sticking with, and finishing assigned work — plus what to
            try next.
          </p>
        </header>

        {/* Snapshot + Recommends */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8">
            <TaskEngagementSnapshot snapshot={snapshot} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <TaskRecommendsStrip strategies={strategies} />
          </div>
        </div>

        {/* 7 categories */}
        <TaskBreakdown stats={breakdown} />

        {/* Engagement patterns · actions · skills — full-width, each card expands to reveal underlying skills */}
        <TaskInsights insights={insights} />

        {/* Trend tracking */}
        <TaskTrendTracking snapshot={snapshot} />

        {/* Support roster */}
        <TaskSupportTable items={supportRoster} />

        {/* Monthly check-in */}
        <MonthlyTaskCheckIn />
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
