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
import { FocusSnapshot } from "@/components/dashboard/FocusSnapshot";
import { AttentionPatternInsights } from "@/components/dashboard/AttentionPatternInsights";
import { ClassAttentionProfile } from "@/components/dashboard/ClassAttentionProfile";
import { FocusRecommendsStrip } from "@/components/dashboard/FocusRecommendsStrip";
import { MonthlyFocusCheckIn } from "@/components/dashboard/MonthlyFocusCheckIn";
import {
  attentionPatternInsights,
  classFocusDomains,
  classFocusSnapshot,
  pickFocusRecommendations,
} from "@/lib/classFocus";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <FocusRoute />;
}

const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;
const PERIODS = ["Weekly", "Monthly"] as const;

function FocusRoute() {
  const [classroom, setClassroom] = useState<(typeof CLASSES)[number]>("Class 5B");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Weekly");

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
      <FocusPage classroom={classroom} period={period} />
    </AppShell>
  );
}

function FocusPage({ classroom, period }: { classroom: string; period: (typeof PERIODS)[number] }) {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => classFocusSnapshot(), []);
  const insights = useMemo(() => attentionPatternInsights(), []);
  const domains = useMemo(() => classFocusDomains(), []);
  const recommendations = useMemo(() => pickFocusRecommendations(domains, 3), [domains]);

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
            <span className="text-foreground">Focus</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Class focus & attention
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            How {classroom} is paying attention during learning — stamina, sub-domains, and what to
            try next.
          </p>
        </header>

        {/* Top row · Snapshot (left) + Yellow Recommends (right) */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8">
            <FocusSnapshot snapshot={snapshot} period={period} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <FocusRecommendsStrip recommendations={recommendations} />
          </div>
        </div>

        {/* Pattern insights — full width */}
        <AttentionPatternInsights insights={insights} />

        {/* Class attention profile — full width */}
        <ClassAttentionProfile domains={domains} />

        {/* Monthly check-in — full width */}
        <MonthlyFocusCheckIn />
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
