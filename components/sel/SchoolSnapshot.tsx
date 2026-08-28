"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Cloud,
  HeartHandshake,
  Layers,
  Sparkles,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelFtueStage } from "@/lib/selOnboarding";
import {
  overallWellbeingScore,
  pulseResponseProgress,
  allEmergingPatterns,
  PULSE_EARLY_INSIGHT_THRESHOLD_PCT,
  PULSE_FULL_SCORE_THRESHOLD_PCT,
  type Pulse,
} from "@/lib/selPulse";
import { overallClimateScore, strongestArea, topNeed } from "@/lib/selClimate";
import { studentParticipationSummary, type SelProgram } from "@/lib/selProgram";
import { type ImplementationSummary } from "@/lib/selImplementation";
import { activeGroupsSummary, responseToSupportCounts, type SelGroup } from "@/lib/selGroups";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Real, derived — the first grade/competency pair with an actual 3-week
 * worsening trend (see allEmergingPatterns), phrased as the qualitative
 * "early insight" sentence rather than that function's own longer-form
 * Action Hub wording. Honest fallback when nothing has emerged yet. */
function wellbeingEarlyInsight(pulses: Pulse[]): string {
  const [pattern] = allEmergingPatterns(pulses);
  if (!pattern) {
    return "Most students report coping well — no concerning patterns have emerged yet.";
  }
  return `Most students report coping well, while ${pattern.concernCompetency.toLowerCase()} concerns are emerging in ${pattern.grade}.`;
}

/** Real, derived from lib/selClimate.ts's own strongestArea()/topNeed() —
 * recomposed into the shorter "X is stable. Y needs attention" voice this
 * card wants, rather than reusing their longer built-in .sentence copy. */
function climateEarlyInsight(): string {
  const strongest = strongestArea();
  const need = topNeed();
  if (!strongest && !need) return "Climate signals are still developing across tracked areas.";
  const parts: string[] = [];
  if (strongest) parts.push(`${strongest.competency} is generally stable.`);
  if (need) {
    const gradeCount = need.decliningGrades.length;
    parts.push(
      `${need.competency} needs closer attention${gradeCount > 0 ? ` in ${gradeCount} grade${gradeCount === 1 ? "" : "s"}` : ""}.`,
    );
  }
  return parts.join(" ");
}

/** The Main Dashboard's "School Snapshot" — 6 tiles that show a real score
 * once the coordinator has taken the real action behind it, and an honest
 * setup state before that (per the FTUE spec). Mirrors the teacher
 * dashboard's progressive-unlock pattern: one shared stage gates each
 * tile, each locked tile's copy says exactly what to do next. */
export function SchoolSnapshot({
  stage,
  pulses,
  programs,
  groups,
  implementation,
}: {
  stage: SelFtueStage;
  pulses: Pulse[];
  programs: SelProgram[];
  groups: SelGroup[];
  implementation: ImplementationSummary;
}) {
  const reduce = useReducedMotion();

  const pulseDone = stage === "program" || stage === "group" || stage === "done";
  const programDone = stage === "group" || stage === "done";
  const groupDone = stage === "done";

  const pulseProgress = pulseDone ? pulseResponseProgress(pulses) : null;
  const hasEarlyInsight =
    pulseProgress !== null && pulseProgress.coveragePct >= PULSE_EARLY_INSIGHT_THRESHOLD_PCT;
  const hasFullScore =
    pulseProgress !== null && pulseProgress.coveragePct >= PULSE_FULL_SCORE_THRESHOLD_PCT;
  const wellbeing = hasFullScore ? overallWellbeingScore(pulses) : null;
  const climate = hasFullScore ? overallClimateScore() : null;
  const reach = studentParticipationSummary(programs);
  const activeGroups = groupDone ? activeGroupsSummary(groups) : null;
  const responses = groupDone ? responseToSupportCounts(groups) : null;
  const improving = responses ? responses["Improving"] + responses["Early Improvement"] : 0;
  const responseTotal = responses ? Object.values(responses).reduce((a, b) => a + b, 0) : 0;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="School Snapshot"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <Tile
        icon={HeartHandshake}
        tone="hsl(258 55% 60%)"
        label="Student Well-Being"
        highlighted={stage === "pulse"}
      >
        {hasFullScore && wellbeing !== null ? (
          <>
            <Stat value={wellbeing} />
            <Sub>Real-time score from active SEL pulses.</Sub>
          </>
        ) : hasEarlyInsight && pulseProgress ? (
          <EarlyInsight sentence={wellbeingEarlyInsight(pulses)} coveragePct={pulseProgress.coveragePct} />
        ) : pulseDone && pulseProgress ? (
          <div className="flex-1 flex flex-col">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-muted text-muted-foreground w-fit">
              Collecting responses
            </span>
            <p className="mt-1.5 text-[12px] font-semibold text-foreground/90">
              {pulseProgress.responsesReceived} of {pulseProgress.totalPossible} responses received
            </p>
            <p className="mt-1 text-[10.5px] text-muted-foreground leading-snug">
              Insights will begin appearing as response coverage increases.
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pulseProgress.coveragePct}%`, background: "hsl(258 55% 60%)" }}
              />
            </div>
            <div className="mt-1 text-[10px] font-semibold text-muted-foreground">
              {pulseProgress.coveragePct}% response coverage
            </div>
            <Link
              href="/sel/pulse"
              className="mt-auto pt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary"
            >
              View responses
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : pulseDone ? (
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            Your first pulse is scheduled — responses will start once it&apos;s sent.
          </p>
        ) : (
          <Setup
            text="Launch your first SEL Pulse to begin understanding student well-being."
            ctaLabel="Create SEL Pulse"
            href="/sel/pulse?create=1"
          />
        )}
      </Tile>

      <Tile icon={Cloud} tone="hsl(196 75% 50%)" label="School Climate" highlighted={stage === "pulse"}>
        {hasFullScore && climate !== null ? (
          <>
            <Stat value={climate} />
            <Sub>Aggregated across tracked SEL areas.</Sub>
          </>
        ) : hasEarlyInsight && pulseProgress ? (
          <EarlyInsight sentence={climateEarlyInsight()} coveragePct={pulseProgress.coveragePct} />
        ) : (
          <>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-muted text-muted-foreground w-fit">
              Building
            </span>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground leading-snug">
              School climate insights will appear as student responses and teacher observations
              come in.
            </p>
          </>
        )}
      </Tile>

      <Tile icon={Users2} tone="hsl(142 55% 45%)" label="SEL Reach">
        <Stat value={reach.participating} suffix=" students connected" small />
        <Sub>{reach.pct}% of school population</Sub>
      </Tile>

      <Tile
        icon={Sparkles}
        tone="hsl(38 92% 48%)"
        label="SEL Implementation"
        highlighted={stage === "program"}
      >
        {programDone ? (
          <>
            <Stat value={implementation.completionPct} suffix="%" />
            <Sub>
              {implementation.classesParticipating} of {implementation.totalClasses} classrooms
              active.
            </Sub>
          </>
        ) : (
          <Setup text="" ctaLabel="Set up your first SEL program" href="/sel/planner" />
        )}
      </Tile>

      <Tile icon={Layers} tone="hsl(0 78% 56%)" label="Targeted Support" highlighted={stage === "group"}>
        {groupDone && activeGroups ? (
          <>
            <Stat value={activeGroups.activeGroups} suffix=" active groups" small />
            <Sub>{activeGroups.dueForReview} due for review this week</Sub>
          </>
        ) : (
          <Setup text="" ctaLabel="Import groups from other classrooms" href="/sel/groups" />
        )}
      </Tile>

      <Tile icon={Layers} tone="hsl(262 60% 62%)" label="Response to Support">
        {groupDone && responses ? (
          <>
            <Stat value={improving} suffix={` of ${responseTotal} improving`} small />
            <Sub>Tracked across active targeted-support groups.</Sub>
          </>
        ) : (
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            Available once targeted support is being tracked.
          </p>
        )}
      </Tile>
    </motion.section>
  );
}

/** The "better than immediately presenting a precise score" tier — a real,
 * derived qualitative sentence labeled with the actual participation %
 * behind it, rather than a bare number. */
function EarlyInsight({ sentence, coveragePct }: { sentence: string; coveragePct: number }) {
  return (
    <div className="flex-1 flex flex-col">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit">
        Early insight available
      </span>
      <p className="mt-1.5 text-[12px] text-foreground/90 leading-snug">{sentence}</p>
      <p className="mt-auto pt-2 text-[10px] font-semibold text-muted-foreground">
        Based on {coveragePct}% student participation
      </p>
    </div>
  );
}

function Setup({
  text,
  ctaLabel,
  href,
}: {
  text: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {text && <p className="text-[11.5px] text-muted-foreground leading-snug">{text}</p>}
      <Link
        href={href}
        className="mt-auto pt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary"
      >
        {ctaLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function Tile({
  icon: Icon,
  tone,
  label,
  highlighted = false,
  children,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 flex flex-col min-h-[128px]",
        highlighted ? "border-flicker" : "border-border",
      )}
      style={{
        borderTopColor: tone,
        borderTopWidth: 2,
        ...(highlighted ? ({ "--attn": tone } as React.CSSProperties) : undefined),
      }}
    >
      <span
        className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 mb-2"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-1">{label}</div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function Stat({ value, suffix, small }: { value: number; suffix?: string; small?: boolean }) {
  return (
    <div
      className={
        small
          ? "font-heading font-extrabold text-[15px] tabular-nums leading-tight"
          : "font-heading font-extrabold text-[19px] tabular-nums leading-tight"
      }
    >
      {value}
      {suffix && <span className="text-[11px] font-semibold text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{children}</div>;
}
