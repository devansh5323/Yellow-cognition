"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Rocket,
  Send,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReturningActionHub } from "@/components/dashboard/ReturningActionHub";
import { getStats, getRoster, type InviteStats, type RosterStudent } from "@/lib/roster";
import { listCheckInsForTeacher } from "@/lib/checkIn";
import { getOnboarding, setOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const TEACHER_NAME = "Maya Khan";
const EASE = [0.2, 0.7, 0.2, 1] as const;

// Same tone palette used across the rest of the dashboard (ClassroomHealthScore,
// WeeklyFocus, TeacherCheckInTools) — keeps this card's colors on-theme instead
// of introducing a separate Tailwind palette.
const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const VIOLET = "hsl(260 55% 60%)";
const AMBER = "hsl(38 92% 55%)";

// Static design placeholder — not wired to real roster/Fumi data yet. The
// hero bar reads as "how many students have actually connected via Fumi,"
// not step completion, so it only ever shows 100% once every student has.
const FUMI_CONNECTED_STUDENTS = 20;
const FUMI_TOTAL_STUDENTS = 24;

type StartStepId = "classroom" | "focus" | "fumi";

type StartStep = {
  id: StartStepId;
  title: string;
  description: string;
  Icon: typeof Target;
  done: boolean;
  /** Once done, the action is no longer meaningful to repeat (e.g. "Activated"). */
  lockedWhenDone: boolean;
  status: string;
  cta: string;
  tone: string;
};

// The 7 driver cards from components/dashboard/DriverCards.tsx (4 Cognitive
// Performance + 3 Student Wellbeing) — same ids, so a picked focus area maps
// straight onto one of those driver keys.
const FOCUS_OPTIONS: { id: OnboardingGoal; label: string }[] = [
  { id: "focus", label: "Attention and focus" },
  { id: "academic", label: "Learning readiness" },
  { id: "task", label: "Task engagement" },
  { id: "behavior", label: "Behavior and discipline" },
  { id: "anxiety", label: "Anxiety and Coping Index" },
  { id: "peer-safety", label: "Peer Safety and Belonging" },
  { id: "frustration", label: "Anger and Emotional Regulation" },
];

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function relativeDaysAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - +new Date(dateStr)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function buildStartSteps(): StartStep[] {
  const onboarding = getOnboarding();
  const classroomCount = onboarding.classrooms.length;
  const hasClassroom = classroomCount > 0;
  // A classroom object exists the moment it's created, but it starts with a
  // default "sample" placeholder and rosterReady: false — this step should
  // only tick once every classroom has an actual student list, not just
  // filled-in grade/section/subjects. Requiring ALL (not just one) classroom
  // to be roster-ready means adding a new classroom later makes this step
  // reappear until that new classroom gets a student list too.
  const rosterReady = hasClassroom && onboarding.classrooms.every((c) => c.rosterReady);
  const classroomsDone = hasClassroom && rosterReady;
  const focusOption = FOCUS_OPTIONS.find((f) => f.id === onboarding.focusArea);
  const fumiDone = !!onboarding.fumiActivated;

  return [
    {
      id: "classroom",
      title: "Set up your classroom",
      description: "Add your grade, section, subjects, and student list.",
      Icon: GraduationCap,
      done: classroomsDone,
      lockedWhenDone: false,
      status: !hasClassroom
        ? "Not started"
        : rosterReady
          ? `${classroomCount} classroom${classroomCount > 1 ? "s" : ""} ready`
          : "Add your student list",
      cta: !hasClassroom ? "Set up classroom" : rosterReady ? "Manage classrooms" : "Add student list",
      tone: BLUE,
    },
    {
      id: "focus",
      title: "Select focus area",
      description: "Tell us what matters most for your class this term.",
      Icon: Target,
      done: !!focusOption,
      lockedWhenDone: false,
      status: focusOption ? focusOption.label : "Not started",
      cta: focusOption ? "Change focus area" : "Choose focus area",
      tone: VIOLET,
    },
    {
      id: "fumi",
      title: "Activate Fumi",
      description: "Turn on Fumi to start supporting your classroom.",
      Icon: Rocket,
      done: fumiDone,
      lockedWhenDone: true,
      status: fumiDone ? "Activated" : "Not started",
      cta: fumiDone ? "Activated" : "Activate Fumi",
      tone: AMBER,
    },
  ];
}

export function DataReadinessCard() {
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [focusPromptOpen, setFocusPromptOpen] = useState(false);
  const [fumiPromptOpen, setFumiPromptOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStats(getStats());
      setRoster(getRoster());
    };
    refresh();
    window.addEventListener("ah-roster-change", refresh);
    window.addEventListener("ah-checkin-change", refresh);
    window.addEventListener("ah-onboarding-change", refresh);
    return () => {
      window.removeEventListener("ah-roster-change", refresh);
      window.removeEventListener("ah-checkin-change", refresh);
      window.removeEventListener("ah-onboarding-change", refresh);
    };
  }, []);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  const steps = useMemo(() => (stats ? buildStartSteps() : []), [stats]);

  if (!stats) {
    return null;
  }

  const total = Math.max(0, stats.total);
  const linked = Math.min(stats.active, total);

  const doneCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const stepsAllDone = doneCount === totalSteps;
  // Before the 3 cards are done, the hero bar tracks step completion — once
  // they're all done, that number stops being interesting (permanently
  // 100%), so it switches to the next thing worth watching: how many
  // students have actually connected via Fumi.
  const readinessPct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;
  const fumiConnectedPct = Math.round((FUMI_CONNECTED_STUDENTS / FUMI_TOTAL_STUDENTS) * 100);
  const heroPct = stepsAllDone ? fumiConnectedPct : readinessPct;
  const heroTone = heroPct === 100 ? GREEN : heroPct === 0 ? AMBER : BLUE;

  // Steps are worked through in order: everything before the first
  // not-done step reads as complete, that first not-done step is the one
  // that glows (it's what the teacher should do next), and everything
  // after it stays blurred/locked until its turn comes.
  const activeIndex = steps.findIndex((s) => !s.done);
  // Full sentence shown when a teacher taps a step before its turn — named
  // after the step currently blocking everything after it.
  const blockingMessage = activeIndex !== -1 ? `${steps[activeIndex].title} first.` : "";

  // The classroom step has two not-done sub-states — no classroom yet
  // (header's "+ Add classroom" pill glows instead, this card stays grey)
  // vs. classroom exists but its student list isn't set up yet (THIS card
  // should glow so "Add your student list" is reachable). Using `!s.done`
  // alone for "upcoming" would keep it greyed through both sub-states,
  // stranding the teacher with no visible way to finish the roster step.
  const hasClassroom = getOnboarding().classrooms.length > 0;

  const lastCheckin = listCheckInsForTeacher(TEACHER_NAME)[0];
  const firstName = TEACHER_NAME.split(" ")[0];

  // Finishing the 3 steps only unlocks the next segment's CTA (Class Health
  // Score's "Start check-in") — it does NOT swap this card over to the
  // returning-user hub. Gating on a real check-in doesn't work either: this
  // app ships with seeded demo check-ins (SEED_CHECKINS in lib/checkIn.ts),
  // so lastCheckin is already truthy before the teacher does anything. The
  // returning-hub trigger is deferred — for now this always shows the 3
  // steps (all checked off once done), never auto-switching.
  const isReturning = false;

  const handleStepAction = (id: StartStepId) => {
    if (id === "classroom") {
      const hasClassroom = getOnboarding().classrooms.length > 0;
      const rosterReady = hasClassroom && getOnboarding().classrooms.every((c) => c.rosterReady);
      // A classroom that already exists but has no student list yet should
      // open straight to the roster picker — not the grade/section/subjects
      // form the teacher already filled in.
      const mode = hasClassroom && !rosterReady ? "roster" : "classroom";
      window.dispatchEvent(new CustomEvent("ah-open-classroom-setup", { detail: { mode } }));
    } else if (id === "focus") {
      setFocusPromptOpen(true);
    } else if (id === "fumi") {
      setFumiPromptOpen(true);
    }
  };

  const fumiActivated = !!getOnboarding().fumiActivated;

  // Sends the Fumi companion link to every parent already linked in the
  // roster, in one shot — this dialog stays open afterward (not a one-step
  // close-and-toast like the other two steps) so the teacher can see who
  // it went to.
  const sendFumiInvite = () => {
    setOnboarding({ fumiActivated: true });
    toast.success(
      roster.length > 0
        ? `Fumi invite sent to ${roster.length} parent${roster.length === 1 ? "" : "s"}.`
        : "Fumi activated! Your classroom companion is now on.",
    );
  };

  return (
    <>
      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="space-y-1"
        aria-label="Data readiness"
        data-tour-target="data-readiness"
      >
        {/* Header — clickable to expand/collapse the body */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="data-readiness-steps"
          className="group w-full text-left flex items-center justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="min-w-0">
            {isReturning ? (
              <>
                <div className="premium-eyebrow">
                  <span>{`${timeOfDayGreeting()}, ${firstName} 👋`}</span>
                </div>
                <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-2">
                  Data Readiness & Action Hub
                </h2>
              </>
            ) : (
              <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight">
                Three steps to get started
              </h2>
            )}
            <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug">
              {isReturning
                ? "Here's what needs your attention today to keep your class insights accurate and up to date."
                : collapsed
                  ? "Click to view the steps that unlock the full picture."
                  : "Complete the steps below to unlock the full picture across the dashboard."}
            </p>
            {isReturning && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground mt-3">
                {lastCheckin ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: GREEN }} />
                    Last check-in: {relativeDaysAgo(lastCheckin.createdAt)}
                  </>
                ) : (
                  "No check-ins logged yet"
                )}
              </p>
            )}
          </div>

          {isReturning ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className="premium-eyebrow">
                  <span>Class data overview</span>
                </div>
                <div className="font-heading font-extrabold text-[22px] tabular-nums leading-none mt-1.5">
                  {linked}
                  <span className="text-muted-foreground/70 text-[14px] font-bold"> of {total} connected</span>
                </div>
              </div>
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200", collapsed && "-rotate-90")}
                />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span
                    className="font-heading font-extrabold text-[28px] tabular-nums leading-none"
                    style={{ color: heroTone }}
                  >
                    {heroPct}%
                  </span>
                  <span
                    className="text-[10.5px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `color-mix(in srgb, ${heroTone} 14%, transparent)`, color: heroTone }}
                  >
                    {stepsAllDone ? "Students connected" : "Class setup completed"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-32 rounded-full bg-muted/40 overflow-hidden ml-auto">
                  <motion.span
                    initial={reduce ? undefined : { scaleX: 0 }}
                    animate={{ scaleX: heroPct / 100 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="block h-full w-full origin-left rounded-full"
                    style={{ background: heroTone }}
                  />
                </div>
                {stepsAllDone ? (
                  fumiConnectedPct < 100 && (
                    <div className="mt-1.5 text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                      {FUMI_CONNECTED_STUDENTS} of {FUMI_TOTAL_STUDENTS} students connected via Fumi
                    </div>
                  )
                ) : (
                  <div className="mt-1.5 text-[11px] font-bold tabular-nums text-muted-foreground whitespace-nowrap">
                    {doneCount} / {totalSteps} steps
                  </div>
                )}
              </div>
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200", collapsed && "-rotate-90")}
                />
              </span>
            </div>
          )}
        </button>

        {/* Body — collapsible */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="steps"
              id="data-readiness-steps"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              {isReturning ? (
                <ReturningActionHub stats={stats} />
              ) : (
                <div className="mt-4">
                  <div className="flex flex-col md:flex-row items-stretch gap-2.5">
                    {steps.map((step, i) => (
                      <Fragment key={step.id}>
                        <StartStepCard
                          step={step}
                          index={i}
                          reduce={!!reduce}
                          onAction={handleStepAction}
                          // "Set up your classroom" only stays grey while no
                          // classroom exists at all — that's when the header's
                          // "+ Add classroom" pill glows instead. The moment a
                          // classroom exists but its student list isn't set
                          // up yet, this card takes over the glow so "Add
                          // your student list" stays reachable.
                          active={
                            step.id === "classroom"
                              ? hasClassroom && !step.done
                              : i === activeIndex
                          }
                          upcoming={
                            step.id === "classroom"
                              ? !hasClassroom
                              : activeIndex !== -1 && i > activeIndex
                          }
                          blockingMessage={
                            step.id === "classroom"
                              ? "Add a classroom using the '+ Add classroom' button above."
                              : blockingMessage
                          }
                        />
                        {i < steps.length - 1 && (
                          <div className="hidden md:flex items-center justify-center shrink-0 text-muted-foreground/40">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <Dialog open={focusPromptOpen} onOpenChange={setFocusPromptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select your focus area</DialogTitle>
            <DialogDescription>
              What matters most for your class this term? You can change this anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 pt-1">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setOnboarding({ focusArea: opt.id });
                  setFocusPromptOpen(false);
                  toast.success(`Focus area set to ${opt.label}`);
                }}
                className="premium-pill !h-9 !px-3.5 !text-[12.5px]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={fumiPromptOpen} onOpenChange={setFumiPromptOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Activate Fumi
            </DialogTitle>
            <DialogDescription>
              Send every parent linked to your roster a link to Fumi, your class&apos;s companion
              experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="premium-eyebrow">
                <span>Your roster</span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {roster.length} {roster.length === 1 ? "student" : "students"}
              </span>
            </div>

            {roster.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">
                No students linked yet — add your roster first, then come back to invite parents to
                Fumi.
              </p>
            ) : (
              <ul className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60 max-h-[280px] overflow-y-auto">
                {roster.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-3.5 py-2.5">
                    <span className="h-8 w-8 rounded-lg bg-muted/70 text-muted-foreground inline-flex items-center justify-center text-[11px] font-bold shrink-0">
                      {s.childName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold truncate">{s.childName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {s.parentName ?? s.parentEmail ?? s.parentPhone ?? "No parent contact"}
                      </div>
                    </div>
                    {fumiActivated && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        Sent
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={sendFumiInvite}
              disabled={roster.length === 0}
              className={cn(
                "w-full h-11 rounded-xl font-heading font-bold text-[13.5px] flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed",
                fumiActivated
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:brightness-95 disabled:opacity-50",
              )}
            >
              {fumiActivated ? (
                <>
                  <Check className="h-4 w-4" />
                  Invite sent — send again
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send invite
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StartStepCard({
  step,
  index,
  reduce,
  onAction,
  active = false,
  upcoming = false,
  blockingMessage = "",
}: {
  step: StartStep;
  index: number;
  reduce: boolean;
  onAction: (id: StartStepId) => void;
  /** This is the next thing the teacher should do — glows via the same
   * tone-colored border flicker used before, no separate alert color. */
  active?: boolean;
  /** Hasn't been reached yet (an earlier step still isn't done) — card stays
   * fully visible (never blurred/dimmed), only its CTA is disabled until its
   * turn comes. */
  upcoming?: boolean;
  /** What to tell the teacher when they tap this step's CTA before its turn. */
  blockingMessage?: string;
}) {
  const Icon = step.Icon;
  // Only a completed one-time action (lockedWhenDone) is a *true* disabled
  // button — an upcoming step stays clickable so tapping it can explain why
  // it's not available yet, instead of silently doing nothing.
  const doneLocked = step.done && step.lockedWhenDone;
  const disabled = doneLocked || upcoming;
  // Uses the step's own tone for the glow — no separate "alert" color — via
  // the --attn custom property so it doesn't bleed into descendant text.
  const attnStyle = active ? ({ "--attn": step.tone } as React.CSSProperties) : undefined;
  const iconTone = step.done ? GREEN : step.tone;

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3, ease: EASE }}
      className={cn(
        "flex-1 min-w-0 rounded-2xl border bg-background p-4 flex flex-col gap-3 transition-colors duration-300",
        active ? "border-flicker" : "border-border",
      )}
      style={{
        ...attnStyle,
        ...(step.done
          ? { borderColor: `color-mix(in srgb, ${GREEN} 30%, transparent)`, background: `color-mix(in srgb, ${GREEN} 5%, transparent)` }
          : undefined),
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="relative h-11 w-11 rounded-xl inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${iconTone} 14%, transparent)`, color: iconTone }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-card border border-border inline-flex items-center justify-center text-[10px] font-bold",
              step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
            )}
            style={step.done ? { color: GREEN } : undefined}
            aria-hidden
          >
            {step.done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-heading font-extrabold text-[13.5px] leading-tight",
              step.done && "line-through decoration-2 text-muted-foreground",
            )}
            style={step.done ? { textDecorationColor: `color-mix(in srgb, ${GREEN} 60%, transparent)` } : undefined}
          >
            {step.title}
          </h4>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{step.description}</p>
        </div>
      </div>

      <span
        className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full w-fit"
        style={{ background: `color-mix(in srgb, ${iconTone} 10%, transparent)`, color: iconTone }}
      >
        {step.done && <Check className="h-3 w-3" strokeWidth={3} />}
        {step.status}
      </span>

      <button
        type="button"
        onClick={() => {
          if (upcoming) {
            toast.info(blockingMessage);
            return;
          }
          onAction(step.id);
        }}
        disabled={doneLocked}
        className={cn(
          "mt-auto flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-colors",
          disabled && "cursor-default",
          step.done && !disabled && "border border-border bg-transparent",
        )}
        style={
          disabled
            ? { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
            : step.done
              ? { color: "hsl(var(--foreground))" }
              : { background: `color-mix(in srgb, ${step.tone} 12%, transparent)`, color: step.tone }
        }
      >
        {step.cta}
        {step.done && step.lockedWhenDone ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5" />
        )}
      </button>
    </motion.article>
  );
}
