"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange, ChevronRight, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LearningReadinessSnapshot } from "@/components/dashboard/LearningReadinessSnapshot";
import { LearningReadinessAreas } from "@/components/dashboard/LearningReadinessAreas";
import { LearningSkillComposition } from "@/components/dashboard/LearningSkillComposition";
import { LearningAreasToSkills } from "@/components/dashboard/LearningAreasToSkills";
import { classReadinessSnapshot } from "@/lib/classLearning";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <LearningReadinessRoute />;
}

const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;
const PERIODS = ["This Month", "Last Month", "This Term"] as const;

function LearningReadinessRoute() {
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
      <LearningReadinessPage classroom={classroom} />
    </AppShell>
  );
}

function LearningReadinessPage({ classroom }: { classroom: string }) {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => classReadinessSnapshot(), []);

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
            <span className="text-foreground">Learning Readiness</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Class Learning Readiness
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            A class-level view of skill development patterns from {classroom}&apos;s Attention Hero
            gameplay.
          </p>
        </header>

        <LearningReadinessSnapshot snapshot={snapshot} />

        <LearningReadinessAreas areas={snapshot.areas} />

        <LearningSkillComposition />

        <LearningAreasToSkills />

        <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={2.2} />
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            Learning readiness insights are generated from Attention Hero gameplay and are intended
            to guide support, not to replace classroom observation or academic assessment.
          </p>
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
