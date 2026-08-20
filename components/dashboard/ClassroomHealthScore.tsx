"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Info,
  Lightbulb,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import {
  classHealth,
  pillarStatus,
  scoreBand,
  SCORE_BANDS,
  type PillarKey,
  type ScoreBand,
} from "@/lib/classHealth";
import { getRoster, getStats, sendReminders, type RosterStudent } from "@/lib/roster";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Fixed demo distribution — mirrors the reference design's student breakdown.
const DISTRIBUTION = [
  { key: "improving", label: "Strong Regulation", tone: GREEN, count: 7 },
  { key: "on-track", label: "Stable Behaviour", tone: BLUE, count: 15 },
  { key: "watch", label: "Watch", tone: AMBER, count: 5 },
  { key: "needs-support", label: "Needs Support", tone: RED, count: 3 },
] as const;

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

  // The Class Health Score itself stays gated behind Fumi activation — even
  // once the rest of the FTUE journey (check-in, behaviour log, positive
  // log) is done, we don't show the real score until every parent has
  // actually connected via Fumi (their child's roster entry is "active").
  const [roster, setRosterState] = useState<RosterStudent[]>([]);
  useEffect(() => {
    const refresh = () => setRosterState(getRoster());
    refresh();
    window.addEventListener("ah-roster-change", refresh);
    return () => window.removeEventListener("ah-roster-change", refresh);
  }, []);
  const rosterStats = getStats(roster);
  const allFumiConnected = roster.length > 0 && rosterStats.active === rosterStats.total;
  const pendingStudents = roster.filter((s) => s.status !== "active");
  const showScore = !locked && allFumiConnected;

  const [pendingOpen, setPendingOpen] = useState(false);
  const handleSendReminders = () => {
    const count = sendReminders();
    if (count > 0) {
      toast.success(`Reminder sent to ${count} parent${count === 1 ? "" : "s"}`);
    } else {
      toast.info("Everyone has already been reminded");
    }
  };

  // The score is the whole point of this segment reappearing after the
  // setup journey — this is the "payoff" moment, so a genuine unlock
  // (showScore: false → true) gets a one-time celebratory reveal (count-up +
  // glow) instead of just materializing as static text.
  const [celebrate, setCelebrate] = useState(false);
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

  const ranked = (Object.entries(ch.pillars) as [PillarKey, number][]).sort((a, b) => b[1] - a[1]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const strongDelta = ch.pillarDelta[strongest[0]];
  const weakDelta = ch.pillarDelta[weakest[0]];

  const areasNeedingSupport = (Object.entries(ch.pillars) as [PillarKey, number][]).filter(
    ([key, score]) => pillarStatus(score, ch.pillarDelta[key]) === "needs-attention",
  ).length;

  const distribution = DISTRIBUTION;
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  const healthy = distribution[0].count + distribution[1].count;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Classroom Health Score"
      data-tour-target="classroom-health"
    >
      <div className="premium-eyebrow">
        <span>Classroom Health</span>
      </div>
      <p className="text-[12.5px] text-muted-foreground -mt-1">
        How your class is functioning across learning, behaviour, and well-being.
      </p>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card p-5 md:p-6",
          highlighted ? "border-flicker" : "border-border",
        )}
        style={highlighted ? ({ "--attn": BLUE } as React.CSSProperties) : undefined}
      >
      {/* The real hero + breakdown always renders — blurred behind the gate
          overlay below instead of being replaced by a bare placeholder, so
          this card still looks alive (like the rest of the dashboard's
          locked segments) rather than empty. */}
      <div className={cn(!showScore && "pointer-events-none select-none blur-[1.5px] opacity-70 saturate-90")}>
        <>
      <div
        className="relative overflow-hidden rounded-[20px] p-5 md:p-7"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, " +
            BLUE +
            " 8%, transparent), color-mix(in srgb, " +
            VIOLET +
            " 10%, transparent))",
        }}
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1.3fr_auto_1fr] gap-6 lg:gap-7 items-center">
          <ScoreRing score={ch.score} tone={tone} celebrate={celebrate} size={168} />

          {/* Headline */}
          <div className="min-w-0 space-y-2">
            <div className="premium-eyebrow" style={{ color: tone }}>
              <span>Classroom Health</span>
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
            <span
              className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full w-fit"
              style={{
                background: `color-mix(in srgb, ${ch.delta >= 0 ? GREEN : RED} 14%, transparent)`,
                color: ch.delta >= 0 ? GREEN : RED,
              }}
            >
              {ch.delta >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {ch.delta >= 0 ? "+" : ""}
              {ch.delta} points this week
            </span>
          </div>

          <div className="hidden lg:block w-px self-stretch bg-border/60" aria-hidden />

          {/* Right-hand stats */}
          <div className="min-w-0 space-y-4">
            <div className="flex items-start gap-3">
              <span
                className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
              >
                <Users className="h-4.5 w-4.5" />
              </span>
              <p className="text-[13.5px] leading-snug min-w-0">
                <span className="block font-heading font-extrabold text-foreground">
                  {healthy} of {total} students
                </span>
                <span className="text-muted-foreground">
                  are showing Stable or Strong classroom health.
                </span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${VIOLET} 14%, transparent)`, color: VIOLET }}
              >
                <Lightbulb className="h-4.5 w-4.5" />
              </span>
              <p className="text-[13.5px] leading-snug min-w-0">
                <span className="block font-heading font-extrabold text-foreground">
                  Most students
                </span>
                <span className="text-muted-foreground">
                  {areasNeedingSupport > 0
                    ? `are meeting expectations, with ${
                        areasNeedingSupport === 1 ? "one area" : `${areasNeedingSupport} areas`
                      } needing support.`
                    : "are meeting expectations across every area."}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strongest area / Needs attention */}
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
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
            {strongDelta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
            ) : (
              <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
            )}
            {strongDelta >= 0 ? "+" : ""}
            {strongDelta} vs last week
          </span>
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
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border border-border/70 text-muted-foreground">
            {weakDelta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
            ) : (
              <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />
            )}
            {weakDelta >= 0 ? "+" : ""}
            {weakDelta} vs last week
          </span>
        </div>
      </div>

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
          {distribution.map((d) => (
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
            {locked ? (
              <>
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
              </>
            ) : (
              <>
                <h3 className="font-heading font-extrabold text-[19px] leading-tight mt-4">Almost there</h3>
                <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
                  Your first check-in is complete! We need a few more parents to activate Fumi to unlock
                  your Class Health Score.
                </p>
                <button
                  type="button"
                  onClick={() => setPendingOpen(true)}
                  className="cta-premium !h-11 !w-auto px-5 !text-[13px] mt-5"
                >
                  <span className="sheen" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    View pending responses
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={pendingOpen} onOpenChange={setPendingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pending Fumi responses</DialogTitle>
            <DialogDescription>
              {pendingStudents.length} of {roster.length} parents haven&apos;t activated Fumi yet.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[45vh] overflow-y-auto -mx-1 px-1 space-y-1.5">
            {pendingStudents.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{s.childName}</p>
                  <p className="text-[11.5px] text-muted-foreground truncate">
                    {s.parentName ?? s.parentEmail ?? s.parentPhone ?? "No contact on file"}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full shrink-0"
                  style={
                    s.status === "invited"
                      ? { background: `color-mix(in srgb, ${AMBER} 14%, transparent)`, color: AMBER }
                      : { background: `color-mix(in srgb, ${RED} 14%, transparent)`, color: RED }
                  }
                >
                  {s.status === "invited" ? "Invited" : "Not invited"}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSendReminders}
            className="cta-premium !h-11 !w-full !text-[13px]"
          >
            <span className="sheen" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Send className="h-4 w-4" />
              Send reminders
            </span>
          </button>
        </DialogContent>
      </Dialog>
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
