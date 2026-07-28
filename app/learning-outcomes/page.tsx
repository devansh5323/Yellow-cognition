"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  ChevronRight,
  Sigma,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OutcomeBandPie } from "@/components/dashboard/OutcomeBandPie";
import { LearningSkillSignals } from "@/components/dashboard/LearningSkillSignals";
import { OutcomeSupportTable } from "@/components/dashboard/OutcomeSupportTable";
import { OutcomeRecommendsStrip } from "@/components/dashboard/OutcomeRecommendsStrip";
import { learningOutcomeSnapshot } from "@/lib/learningOutcomes";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return <LearningOutcomesRoute />;
}

const SUBJECTS = ["Mathematics", "English", "Science", "Hindi", "Social Studies"] as const;
const PERIODS = ["This Month", "Last Month", "This Term"] as const;
const CLASSES = ["Class 5B", "Class 5A", "Class 4A", "Class 3A"] as const;

function LearningOutcomesRoute() {
  const [classroom, setClassroom] = useState<(typeof CLASSES)[number]>("Class 5B");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Mathematics");
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
        icon={<Sigma className="h-3.5 w-3.5" />}
        value={subject}
        onChange={(v) => setSubject(v as (typeof SUBJECTS)[number])}
        options={SUBJECTS}
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
      <LearningOutcomesPage classroom={classroom} subject={subject} period={period} />
    </AppShell>
  );
}

function LearningOutcomesPage({
  classroom,
  subject,
  period,
}: {
  classroom: string;
  subject: (typeof SUBJECTS)[number];
  period: string;
}) {
  const reduce = useReducedMotion();

  const snapshot = useMemo(() => learningOutcomeSnapshot(subject), [subject]);
  const { summary, outcomes, recommendations, signals } = snapshot;

  // Overall readiness score is the average of the skill-signal scores —
  // explicitly so the card matches the "avg of signals" mental model.
  const overallScore = useMemo(
    () =>
      signals.length === 0
        ? 0
        : Math.round(signals.reduce((sum, s) => sum + s.score, 0) / signals.length),
    [signals],
  );
  const prevOverallScore = useMemo(
    () =>
      signals.length === 0
        ? 0
        : Math.round(signals.reduce((sum, s) => sum + s.prevScore, 0) / signals.length),
    [signals],
  );
  const overallDelta = overallScore - prevOverallScore;
  const readiness = readinessTier(overallScore);

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
            <span className="text-foreground">Learning</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Learning Readiness status
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            How {classroom} is progressing across current {subject} outcomes.
          </p>
        </header>

        {/* Top row · Readiness summary (left) + Yellow Recommends (right) */}
        <div className="grid grid-cols-12 gap-5">
          <section
            aria-label="Readiness summary"
            className="col-span-12 xl:col-span-8 premium-elevated rounded-[20px] p-6 md:p-7 relative overflow-hidden"
          >
            {/* Calm primary-tinted backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 50% at 0% 0%, hsl(142 60% 82% / 0.16), transparent 65%), radial-gradient(55% 45% at 100% 100%, hsl(200 70% 80% / 0.10), transparent 65%)",
              }}
            />

            <div className="relative">
              {/* Header bar */}
              <header className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Readiness summary
                </div>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
                  {period}
                </span>
              </header>

              {/* Score (left) + Spread (right) — divided cleanly */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-0 lg:divide-x divide-border/60">
                <div className="lg:pr-8">
                  <ScoreBlock
                    score={overallScore}
                    delta={overallDelta}
                    tier={readiness}
                    summary={summary}
                  />
                </div>
                <div className="lg:pl-8">
                  <SpreadBlock summary={summary} />
                </div>
              </div>
            </div>
          </section>

          <div className="col-span-12 xl:col-span-4">
            <OutcomeRecommendsStrip recommendations={recommendations} />
          </div>
        </div>

        {/* Skill signals — full width */}
        <LearningSkillSignals signals={snapshot.signals} />

        {/* Students needing learning support — full width.
            Per-student review (band, support need, confirm) happens inline via expandable rows. */}
        <OutcomeSupportTable outcomes={outcomes} signals={signals} />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Subcomponents
 * ───────────────────────────────────────────────────────── */

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

type ReadinessTier = { label: string; tone: string };

function readinessTier(score: number): ReadinessTier {
  if (score >= 85) return { label: "Stretching", tone: "hsl(168 62% 38%)" };
  if (score >= 70) return { label: "Mostly Secure", tone: "hsl(142 55% 46%)" };
  if (score >= 55) return { label: "Building", tone: "hsl(38 92% 50%)" };
  return { label: "Needs Support", tone: "hsl(0 78% 58%)" };
}

function ScoreBlock({
  score,
  delta,
  tier,
  summary,
}: {
  score: number;
  delta: number;
  tier: ReadinessTier;
  summary: ReturnType<typeof learningOutcomeSnapshot>["summary"];
}) {
  return (
    <div className="flex flex-col gap-4 min-w-0 h-full">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Overall readiness
      </div>

      {/* Score + tier/delta — stacked compactly */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
            style={{ color: tier.tone }}
          >
            {score}
          </span>
          <span className="text-[15px] md:text-[16px] font-extrabold text-muted-foreground/80">
            /100
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap pb-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{
              background: `color-mix(in srgb, ${tier.tone} 12%, transparent)`,
              color: `color-mix(in srgb, ${tier.tone} 80%, black 12%)`,
              border: `1px solid color-mix(in srgb, ${tier.tone} 25%, transparent)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tier.tone }} />
            {tier.label}
          </span>
          <DeltaTag delta={delta} />
        </div>
      </div>

      <div
        className="mt-auto relative overflow-hidden rounded-2xl border p-3"
        style={{
          background:
            "radial-gradient(80% 100% at 0% 0%, color-mix(in srgb, hsl(38 92% 60%) 10%, transparent), transparent 70%), color-mix(in srgb, var(--card) 92%, transparent)",
          borderColor: "color-mix(in srgb, hsl(38 92% 55%) 22%, transparent)",
        }}
      >
        <div className="flex items-start gap-2">
          <span
            aria-hidden
            className="h-6 w-6 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 20%, transparent), color-mix(in srgb, hsl(258 70% 70%) 16%, transparent))",
              boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.5)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-700/80 dark:text-amber-300/80">
              AI summary
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-foreground/85">
              {readinessNarrative(score, delta, tier, summary)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function readinessNarrative(
  score: number,
  delta: number,
  tier: ReadinessTier,
  summary: ReturnType<typeof learningOutcomeSnapshot>["summary"],
): string {
  const support = summary.distribution["needs-support"];
  const building = summary.distribution.building;
  const meetingPct = summary.meetingPct;
  const movingUp = summary.movingUp;

  const trendBit =
    delta > 0
      ? `up ${delta} from last month`
      : delta < 0
        ? `down ${Math.abs(delta)} from last month`
        : `holding steady`;

  if (support > 0) {
    return `Class is ${tier.label.toLowerCase()} at ${score}/100, ${trendBit}. ${support} student${support === 1 ? " needs" : "s need"} foundational support — start there this week.`;
  }
  if (building >= 4) {
    return `Class is ${tier.label.toLowerCase()} at ${score}/100, ${trendBit}. ${building} Building-band students are close to Secure — push them this week to consolidate gains.`;
  }
  if (movingUp >= 3) {
    return `Class is ${tier.label.toLowerCase()} at ${score}/100, ${trendBit}. ${meetingPct}% are meeting outcomes and ${movingUp} students are trending up — keep current routines.`;
  }
  return `Class is ${tier.label.toLowerCase()} at ${score}/100, ${trendBit}. ${meetingPct}% are meeting outcomes — stretch the top with extension tasks while the rest catches up.`;
}

function SpreadBlock({
  summary,
}: {
  summary: ReturnType<typeof learningOutcomeSnapshot>["summary"];
}) {
  return (
    <div className="min-w-0 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Class distribution
        </span>
        <span className="text-[10.5px] font-bold tabular-nums text-muted-foreground/80">
          {summary.total} students
        </span>
      </div>
      <div className="mt-3">
        <OutcomeBandPie distribution={summary.distribution} total={summary.total} />
      </div>
    </div>
  );
}

function DeltaTag({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold text-muted-foreground bg-muted/60">
        Holding
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums",
        positive
          ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
          : "text-rose-700 bg-rose-500/10 dark:text-rose-300",
      )}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {positive ? "+" : ""}
      {delta} vs last month
    </span>
  );
}
