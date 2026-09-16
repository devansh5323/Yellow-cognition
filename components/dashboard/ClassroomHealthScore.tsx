"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Gauge,
  Info,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";
import {
  classHealth,
  scoreBand,
  SCORE_BANDS,
  type PillarKey,
  type ScoreBand,
} from "@/lib/classHealth";
import { getOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { DRIVER_META, driverScore } from "@/lib/driverMeta";
import { WELLBEING_STATUS_TONE, wellbeingStatusFromScore } from "@/lib/classWellbeing";
import { FocusAreaDialog } from "@/components/dashboard/DataReadinessCard";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const VIOLET = "hsl(262 60% 60%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";

const HEADLINE_BY_BAND: Record<ScoreBand, string> = {
  excellent: "Excellent progress!",
  stable: "Stable",
  watch: "Keep an eye on this",
  "needs-support": "Needs attention",
};

const DESCRIPTION_BY_BAND: Record<ScoreBand, string> = {
  excellent: "Your classroom is thriving across every area.",
  stable: "Your classroom is stable and steadily improving.",
  watch: "A few areas need closer attention this week.",
  "needs-support": "Your classroom needs support in key areas.",
};

const PILLAR_DISPLAY: Record<PillarKey, string> = {
  focus: "Focus",
  behavior: "Behaviour and Discipline",
  task: "Task completion",
  academic: "Learning Readiness",
};

const SCORE_BAND_TONE: Record<ScoreBand, string> = {
  excellent: GREEN,
  stable: BLUE,
  watch: AMBER,
  "needs-support": RED,
};

// Real per-band student counts (Excellent/Stable/Watch/Needs Support),
// bucketed from each student's actual studentHealthScore — see
// classHealth()'s distribution field. Tones come from WELLBEING_STATUS_TONE
// (the same Strong/Stable/Watch/Needs Support palette the Student Wellbeing
// driver cards use) rather than this file's own GREEN/BLUE/AMBER/RED, which
// feed the overall score band's color elsewhere on this card and are a
// noticeably different (more saturated) blue in particular.
const DISTRIBUTION_LABEL: Record<ScoreBand, string> = {
  excellent: "Excellent",
  stable: "Stable",
  watch: "Watch",
  "needs-support": "Needs Support",
};

const DISTRIBUTION_TONE: Record<ScoreBand, string> = {
  excellent: WELLBEING_STATUS_TONE.strong,
  stable: WELLBEING_STATUS_TONE.stable,
  watch: WELLBEING_STATUS_TONE.watch,
  "needs-support": WELLBEING_STATUS_TONE.support,
};

/** One honest line about the picked focus area, ranked against every other
 * driver via the same driverScore() pipeline DriverCards uses — no
 * fabricated commentary, just where this area actually sits relative to the
 * other 6 (skipping any that have no real data yet). */
function focusInsight(focusArea: OnboardingGoal, pillars: Record<PillarKey, number | null>): string {
  const scores = (Object.keys(DRIVER_META) as OnboardingGoal[])
    .map((id) => ({ id, score: driverScore(id, pillars) }))
    .filter((s): s is { id: OnboardingGoal; score: number } => s.score != null);
  const focusScore = scores.find((s) => s.id === focusArea)?.score;
  if (focusScore == null) return "Not enough data yet to compare this area against the others.";
  const others = scores.filter((s) => s.id !== focusArea);
  const higherCount = others.filter((s) => s.score > focusScore).length;

  if (focusScore >= 80) return "Already one of your strongest areas — keep reinforcing it.";
  if (others.length > 0 && higherCount === others.length) return "Your class's lowest-scoring area right now — a solid pick to focus on.";
  return `${higherCount} of your other ${others.length} tracked area${others.length === 1 ? "" : "s"} are scoring higher.`;
}

export function ClassroomHealthScore({
  locked = false,
  highlighted = false,
}: {
  locked?: boolean;
  /** Setup-journey glow — this is the segment the teacher should act on
   * next (their first check-in). Same tone-colored border flicker used
   * elsewhere, via the --attn custom property. */
  highlighted?: boolean;
}) {
  const reduce = useReducedMotion();
  // Always the real (mock) class data, even while locked/pending — the gate
  // overlay covers this with its own message, so the blurred preview behind
  // it should look like genuine, alive data instead of a stark all-zero
  // placeholder.
  const ch = useMemo(() => classHealth(), []);

  // The Class Health Score's only gate is the FTUE stage machine itself
  // (locked) — it no longer additionally waits on every parent connecting
  // via Fumi, since that's out of the teacher's control and shouldn't hold
  // up the rest of RTUE once the teacher's own setup is genuinely done.
  const showScore = !locked;

  // The score is the whole point of this segment reappearing after the
  // setup journey — this is the "payoff" moment, so a genuine unlock
  // (showScore: false → true) gets a one-time celebratory reveal (count-up +
  // glow) instead of just materializing as static text.
  const [celebrate, setCelebrate] = useState(false);
  const [focusPromptOpen, setFocusPromptOpen] = useState(false);
  const prevShowScoreRef = useRef(showScore);
  useEffect(() => {
    const wasShowing = prevShowScoreRef.current;
    prevShowScoreRef.current = showScore;
    if (!wasShowing && showScore) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 1600);
      return () => window.clearTimeout(t);
    }
  }, [showScore]);

  const band = scoreBand(ch.score);
  const tone = SCORE_BAND_TONE[band];

  const ranked = (Object.entries(ch.pillars) as [PillarKey, number | null][])
    .filter((e): e is [PillarKey, number] => e[1] != null)
    .sort((a, b) => b[1] - a[1]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  // The driver card the teacher picked in "Select focus area" (Data
  // Readiness's step 2) — surfaced here so the score they said matters most
  // is never buried among the other six.
  const focusArea = getOnboarding().focusArea;
  const focusDriver = focusArea ? DRIVER_META[focusArea] : null;
  const focusScore = focusArea ? driverScore(focusArea, ch.pillars) : null;

  const distribution = (Object.keys(ch.distribution) as ScoreBand[]).map((band) => ({
    key: band,
    label: DISTRIBUTION_LABEL[band],
    tone: DISTRIBUTION_TONE[band],
    count: ch.distribution[band],
  }));
  const total = ch.total;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Classroom Health Score"
      data-tour-target="classroom-health"
    >
      {/* Bigger, bolder than a plain premium-eyebrow — this is the
          dashboard's headline metric, so its label shouldn't read as just
          another section among equals. */}
      <div className="flex items-center gap-2.5">
        <span
          className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${BLUE} 16%, transparent)`, color: BLUE }}
        >
          <Gauge className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <span className="font-heading font-extrabold text-[15px] tracking-tight">Classroom Health</span>
      </div>
      <p className="text-[12.5px] text-muted-foreground -mt-1">
        How your class is functioning across learning, behaviour, and well-being.
      </p>

      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border-2 bg-card p-5 md:p-6",
          highlighted && "border-flicker",
        )}
        style={
          highlighted
            ? ({ "--attn": BLUE } as React.CSSProperties)
            : {
                borderColor: `color-mix(in srgb, ${BLUE} 22%, transparent)`,
                boxShadow: `0 28px 64px -30px color-mix(in srgb, ${BLUE} 45%, transparent), 0 14px 34px -20px color-mix(in srgb, ${VIOLET} 30%, transparent)`,
              }
        }
      >
      {/* The real hero + breakdown always renders — blurred behind the gate
          overlay below instead of being replaced by a bare placeholder, so
          this card still looks alive (like the rest of the dashboard's
          locked segments) rather than empty. */}
      <div className={cn(!showScore && "pointer-events-none select-none blur-[0.75px] opacity-75 saturate-95")}>
        <>
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 items-stretch">
        {/* Card 1 — score + headline */}
        <div
          className="relative overflow-hidden rounded-2xl border border-border/50 p-5 md:p-7 flex flex-col sm:flex-row items-center gap-6"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, " +
              BLUE +
              " 8%, transparent), color-mix(in srgb, " +
              VIOLET +
              " 10%, transparent))",
          }}
        >
          <ScoreRing score={ch.score} tone={tone} celebrate={celebrate} size={152} />

          <div className="min-w-0 space-y-2">
            <div className="premium-eyebrow" style={{ color: tone }}>
              <span>This week&apos;s status</span>
            </div>
            <h3
              className="font-heading font-extrabold text-[24px] md:text-[27px] leading-tight"
              style={{ color: tone }}
            >
              {HEADLINE_BY_BAND[band]}
            </h3>
            <p className="text-[13px] text-muted-foreground max-w-sm leading-snug">
              {DESCRIPTION_BY_BAND[band]}
            </p>
          </div>
        </div>

        {/* Card 2 — the teacher's own selected focus area, as its own
            standalone card so it reads as a distinct, tappable-feeling
            highlight rather than a stat squeezed into the hero. */}
        <div className="flex flex-col gap-2 min-w-0">
          <div
            className="relative overflow-hidden rounded-2xl border p-5 md:p-6 flex flex-col justify-center gap-3"
            style={
              focusDriver
                ? {
                    borderColor: `color-mix(in srgb, ${focusDriver.tone} 35%, transparent)`,
                    background: `color-mix(in srgb, ${focusDriver.tone} 8%, transparent)`,
                  }
                : undefined
            }
          >
            {focusDriver ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${focusDriver.tone} 18%, transparent)`, color: focusDriver.tone }}
                  >
                    <focusDriver.Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: focusDriver.tone }}
                  >
                    Your focus area
                  </span>
                </div>
                <div>
                  <h4
                    className="font-heading font-extrabold text-[18px] leading-tight"
                    style={{ color: focusDriver.tone }}
                  >
                    {focusDriver.title}
                  </h4>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                    {focusDriver.description}
                  </p>
                </div>
                {focusScore != null ? (
                  <div>
                    <div className="flex items-center justify-between text-[10.5px] font-bold text-muted-foreground mb-1">
                      <span>SCORE</span>
                      <span className="tabular-nums">{focusScore}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-background/80 overflow-hidden">
                      <motion.span
                        initial={reduce ? undefined : { scaleX: 0 }}
                        animate={{ scaleX: focusScore / 100 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="block h-full w-full origin-left rounded-full"
                        style={{ background: WELLBEING_STATUS_TONE[wellbeingStatusFromScore(focusScore)] }}
                      />
                    </div>
                  </div>
                ) : (
                  <NotEnoughData />
                )}
                <p
                  className="flex items-start gap-1.5 text-[11px] leading-snug"
                  style={{ color: `color-mix(in srgb, ${focusDriver.tone} 80%, hsl(var(--muted-foreground)))` }}
                >
                  <Sparkles className="h-3 w-3 mt-[1.5px] shrink-0" />
                  {focusInsight(focusArea as OnboardingGoal, ch.pillars)}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground leading-snug">
                Pick a focus area from Today&apos;s Priority Actions to see it highlighted here.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFocusPromptOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/60 hover:border-border transition-colors w-fit self-center"
          >
            <Pencil className="h-3 w-3" />
            {focusDriver ? "Change focus area" : "Choose focus area"}
          </button>
        </div>
      </div>

      <FocusAreaDialog open={focusPromptOpen} onOpenChange={setFocusPromptOpen} />

      {/* Strongest area / Needs attention — focus area now lives in the hero above */}
      {strongest && weakest && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
              >
                <Users className="h-3.5 w-3.5" />
              </span>
              <span
                className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: GREEN }}
              >
                Strongest area
              </span>
            </div>
            <h3
              className="font-heading font-extrabold text-[16px] leading-tight"
              style={{ color: GREEN }}
            >
              {PILLAR_DISPLAY[strongest[0]]}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Strongest contributor to classroom health.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${AMBER} 14%, transparent)`, color: AMBER }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              <span
                className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: AMBER }}
              >
                Needs attention
              </span>
            </div>
            <h3
              className="font-heading font-extrabold text-[16px] leading-tight"
              style={{ color: AMBER }}
            >
              {PILLAR_DISPLAY[weakest[0]]}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Lowest contributor to classroom health.
            </p>
          </div>
        </div>
      )}

      {/* Student distribution */}
      <div className="mt-5 pt-5 border-t border-border/60">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 pl-3 pr-2 py-2.5">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[12.5px] font-bold uppercase tracking-[0.10em] text-foreground/90">
              Student distribution
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground normal-case tracking-normal">
              · {total} students
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground rounded-full p-1 transition-colors hover:text-foreground hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="How score bands are defined"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[380px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
            >
              <h4 className="font-heading font-extrabold text-[15px]">Score Bands</h4>
              <div className="mt-3 space-y-3.5">
                {SCORE_BANDS.map((b) => (
                  <div key={b.band} className="flex items-start gap-3">
                    <span className="w-12 shrink-0 text-[12px] font-bold tabular-nums text-foreground/90">
                      {b.range}
                    </span>
                    <span
                      className="w-[92px] shrink-0 inline-flex items-center justify-center text-[9.5px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full h-fit"
                      style={{
                        background: `color-mix(in srgb, ${SCORE_BAND_TONE[b.band]} 14%, transparent)`,
                        color: SCORE_BAND_TONE[b.band],
                      }}
                    >
                      {b.tag}
                    </span>
                    <span className="flex-1 text-[12px] text-muted-foreground leading-snug">
                      {b.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted/50">
          {distribution.map((d) => {
            if (d.count <= 0) return null;
            return (
              <span
                key={d.key}
                className="h-full"
                style={{ flex: `${(d.count / Math.max(1, total)) * 100} 1 0`, background: d.tone }}
                title={`${d.label}: ${d.count}`}
              />
            );
          })}
        </div>

        <div className="mt-3 flex w-full items-start text-[12.5px]">
          {distribution.filter((d) => d.count > 0).map((d) => (
            <div
              key={d.key}
              className="flex flex-col gap-1 min-w-0"
              style={{ flex: `${(d.count / Math.max(1, total)) * 100} 1 0` }}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: d.tone }}
                  aria-hidden
                />
                <span className="font-semibold text-foreground/90 whitespace-nowrap">
                  {d.label}
                </span>
              </span>
              <span className="pl-4 text-muted-foreground tabular-nums whitespace-nowrap">
                {d.count} student{(d.count as number) === 1 ? "" : "s"} (
                {Math.round((d.count / Math.max(1, total)) * 100)}%)
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
          >
            See how scores are calculated
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
        </>
      </div>

      {!showScore && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative flex flex-col items-center text-center max-w-sm rounded-2xl border border-border/70 bg-card/95 backdrop-blur px-6 py-6 shadow-lg">
            <span className="h-12 w-12 rounded-2xl bg-primary/15 text-primary inline-flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="font-heading font-extrabold text-[19px] leading-tight mt-4">Almost ready</h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
              Complete your first class check-in to begin building your Class Health Score.
            </p>
            <Link href="/check-in" className="cta-premium !h-11 !w-auto px-5 !text-[13px] mt-5">
              <span className="sheen" aria-hidden />
              <span className="inline-flex items-center gap-1.5">
                Start check-in
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      )}
      </div>
    </motion.section>
  );
}

/** The hero of this segment — a big radial score gauge with a count-up
 * reveal, so the number is unmistakably the main focus of the dashboard
 * once it unlocks, not just another stat among many. */
function ScoreRing({
  score,
  tone,
  celebrate,
  size = 132,
}: {
  score: number;
  tone: string;
  celebrate: boolean;
  size?: number;
}) {
  const SIZE = size;
  const STROKE = Math.round(size / 14.7);
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  // Only animates while celebrating — otherwise the ring just reflects
  // `score` directly, no state/effect needed for the steady-state case.
  const [animatedScore, setAnimatedScore] = useState(score);
  useEffect(() => {
    if (!celebrate) return;
    let raf: number;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, celebrate]);

  const displayScore = celebrate ? animatedScore : score;
  const offset = C - (displayScore / 100) * C;

  return (
    <div
      className={cn("relative shrink-0", celebrate && "ring-pulse")}
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`${score} out of 100`}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="hsl(240 15% 90%)"
          strokeWidth={STROKE}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          style={{ strokeDasharray: C, strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading font-extrabold leading-none tabular-nums"
          style={{ color: tone, fontSize: Math.round(size * 0.3) }}
        >
          {displayScore}
        </span>
        <span
          className="text-muted-foreground font-bold mt-0.5"
          style={{ fontSize: Math.max(11, Math.round(size * 0.09)) }}
        >
          /100
        </span>
      </div>
    </div>
  );
}
