"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Info,
  Lightbulb,
  Rocket,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReturningActionHub } from "@/components/dashboard/ReturningActionHub";
import { DataReadinessTour } from "@/components/onboarding/DataReadinessTour";
import {
  getStats,
  getRoster,
  sendReminders,
  getRemindersCooldownUntil,
  type InviteStats,
  type RosterStudent,
} from "@/lib/roster";
import { getOnboarding, setOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { DRIVER_META } from "@/lib/driverMeta";
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
// straight onto one of those driver keys. Titles/descriptions/icons/tones
// all come from lib/driverMeta.ts's DRIVER_META so this stays in sync with
// DriverCards.tsx and ClassroomHealthScore rather than duplicating copy.
const FOCUS_ORDER: OnboardingGoal[] = [
  "focus",
  "academic",
  "task",
  "behavior",
  "anxiety",
  "peer-safety",
  "frustration",
];

/** "Yellow recommends" — always "Attention and focus", the area most
 * teachers should prioritize first regardless of this class's specific
 * pillar scores. */
function recommendedFocusArea(): OnboardingGoal {
  return "focus";
}

export function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
  const focusMeta = onboarding.focusArea ? DRIVER_META[onboarding.focusArea] : undefined;
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
      done: !!focusMeta,
      lockedWhenDone: false,
      status: focusMeta ? focusMeta.title : "Not started",
      cta: focusMeta ? "Change focus area" : "Choose focus area",
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
  const [remindersCooldownUntil, setRemindersCooldownUntil] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [focusPromptOpen, setFocusPromptOpen] = useState(false);
  const [fumiPromptOpen, setFumiPromptOpen] = useState(false);
  // Session-local only — dismissing the guided walkthrough never fakes step
  // completion, it just hides this visual guide; the plain step cards
  // underneath stay fully usable either way.
  const [tourDismissed, setTourDismissed] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStats(getStats());
      setRoster(getRoster());
      setRemindersCooldownUntil(getRemindersCooldownUntil());
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
  const fumiConnectedStudents = linked;
  const fumiTotalStudents = total;
  const fumiConnectedPct =
    fumiTotalStudents > 0 ? Math.round((fumiConnectedStudents / fumiTotalStudents) * 100) : 0;
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

  const firstName = TEACHER_NAME.split(" ")[0];

  // Mirrors Class Health Score's own unlock condition: once the 3 setup
  // steps are done, this card swaps over to the returning-user hub — it no
  // longer additionally waits on every student connecting via Fumi first,
  // since that's out of the teacher's control (same gate removed from
  // showScore there).
  const isReturning = stepsAllDone;

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

  const handleResendInvites = () => {
    const count = sendReminders();
    toast.success(
      count > 0
        ? `Reminder sent to ${count} parent${count === 1 ? "" : "s"}.`
        : "Everyone's already connected.",
    );
  };

  // Sends the Fumi companion link to every parent already linked in the
  // roster. Closes this dialog once activation completes — previously it
  // stayed open so the teacher could see the updated invite status, but
  // that's now superseded by app/dashboard/page.tsx's own "your first
  // class is set up" celebration screen, which is what should be on top
  // once this, the 3rd and final setup step, is done — not this dialog
  // and that one stacked on top of each other.
  const sendFumiInvite = () => {
    setOnboarding({ fumiActivated: true });
    toast.success(
      roster.length > 0
        ? `Fumi invite sent to ${roster.length} parent${roster.length === 1 ? "" : "s"}.`
        : "Fumi activated! Your classroom companion is now on.",
    );
    setFumiPromptOpen(false);
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
        {/* Header — title/chevron are clickable to expand/collapse the body */}
        <div className="group w-full flex items-center justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="data-readiness-steps"
            className="min-w-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {isReturning ? (
              <>
                <div className="premium-eyebrow">
                  <span>{`${timeOfDayGreeting()}, ${firstName} 👋`}</span>
                </div>
                <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-2">
                  Today&apos;s Priority Actions
                </h2>
              </>
            ) : (
              <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight">
                Three steps to get started
              </h2>
            )}
            {!isReturning && (
              <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug">
                {collapsed
                  ? "Click to view the steps that unlock the full picture."
                  : "Complete the steps below to unlock the full picture across the dashboard."}
              </p>
            )}
          </button>

          {isReturning ? (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="premium-eyebrow">
                  <span>Class data overview</span>
                </div>
                <div className="font-heading font-extrabold text-[22px] tabular-nums leading-none mt-1.5">
                  {linked}
                  <span className="text-muted-foreground/70 text-[14px] font-bold"> of {total} connected</span>
                </div>
              </div>
              {linked < total && (
                <button
                  type="button"
                  onClick={handleResendInvites}
                  disabled={!!remindersCooldownUntil}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors shrink-0",
                    remindersCooldownUntil
                      ? "text-muted-foreground border-border/70 bg-muted/40 cursor-not-allowed"
                      : "text-primary border-primary/25 bg-primary/5 hover:bg-primary/10",
                  )}
                >
                  <Send className="h-3 w-3" />
                  {remindersCooldownUntil ? "Invites sent" : "Resend invites"}
                </button>
              )}
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-expanded={!collapsed}
                aria-controls="data-readiness-steps"
                aria-label={collapsed ? "Expand priority actions" : "Collapse priority actions"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground shrink-0"
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200", collapsed && "-rotate-90")}
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-controls="data-readiness-steps"
              className="flex items-center gap-3 shrink-0"
            >
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
                    {stepsAllDone ? "Students connected" : "Setup progress"}
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
                      {fumiConnectedStudents} of {fumiTotalStudents} students connected via Fumi
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
            </button>
          )}
        </div>

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
              // Not applied while returning: an `overflow-hidden` ancestor
              // becomes the containing block for `position: sticky`
              // descendants, which would trap ReturningActionHub's sticky
              // sidebar inside this collapse wrapper instead of letting it
              // stick against the real page scroll. The 3-steps checklist
              // has no sticky content, so it keeps the clean clip during
              // its collapse/expand animation.
              className={cn(!isReturning && "overflow-hidden")}
            >
              {isReturning ? (
                <ReturningActionHub stats={stats} />
              ) : (
                <div className="mt-4">
                  <div className="flex flex-col md:flex-row items-stretch gap-4">
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

      {!isReturning && (
        <DataReadinessTour
          steps={steps.map((s) => ({
            ...s,
            // Before any classroom exists, the real "next action" lives in
            // the topbar's "+ Add classroom" pill, not this (still-greyed)
            // card — same sub-state the static row's own glow already
            // distinguishes. Once a classroom exists (even roster-pending),
            // this card is the right target for "Add student list".
            target: s.id === "classroom" && !hasClassroom ? "add-classroom-header" : `step-${s.id}`,
          }))}
          activeIndex={activeIndex}
          dismissed={tourDismissed}
          onAction={(id) => handleStepAction(id as StartStepId)}
          onDismiss={() => setTourDismissed(true)}
        />
      )}

      <FocusAreaDialog open={focusPromptOpen} onOpenChange={setFocusPromptOpen} />

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
      data-tour-target={`step-${step.id}`}
      className={cn(
        "flex-1 min-w-0 rounded-[22px] border bg-background p-6 flex flex-col gap-4 transition-colors duration-300",
        active ? "border-flicker" : "border-border",
      )}
      style={{
        ...attnStyle,
        ...(step.done
          ? { borderColor: `color-mix(in srgb, ${GREEN} 30%, transparent)`, background: `color-mix(in srgb, ${GREEN} 5%, transparent)` }
          : undefined),
      }}
    >
      <div className="flex items-start gap-3.5">
        <span
          className="relative h-14 w-14 rounded-2xl inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${iconTone} 14%, transparent)`, color: iconTone }}
        >
          <Icon className="h-6 w-6" strokeWidth={2.2} />
          <span
            className={cn(
              "absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border inline-flex items-center justify-center text-[11.5px] font-bold",
              step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
            )}
            style={step.done ? { color: GREEN } : undefined}
            aria-hidden
          >
            {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-heading font-extrabold text-[16.5px] leading-tight inline-flex items-center gap-1.5",
              step.done && "line-through decoration-2 text-muted-foreground",
            )}
            style={step.done ? { textDecorationColor: `color-mix(in srgb, ${GREEN} 60%, transparent)` } : undefined}
          >
            {step.id === "fumi" && (
              // Placeholder for a future link to the Fumi info/marketing
              // page — no href yet, just the affordance.
              <Info className="h-4 w-4 text-muted-foreground shrink-0" aria-label="Learn more about Fumi" />
            )}
            {step.title}
          </h4>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">{step.description}</p>
        </div>
      </div>

      <span
        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1.5 rounded-full w-fit"
        style={{ background: `color-mix(in srgb, ${iconTone} 10%, transparent)`, color: iconTone }}
      >
        {step.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
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
          "mt-auto flex items-center justify-center gap-1.5 rounded-xl h-12 px-4 text-[14px] font-bold transition-colors",
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
          <Check className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </button>
    </motion.article>
  );
}

export function FocusAreaDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const recommended = recommendedFocusArea();
  const recommendedMeta = DRIVER_META[recommended];

  const selectFocus = (id: OnboardingGoal) => {
    setOnboarding({ focusArea: id });
    onOpenChange(false);
    toast.success(`Focus area set to ${DRIVER_META[id].title}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-8">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center mb-1">
            <Target className="h-5.5 w-5.5" />
          </div>
          <div className="premium-eyebrow">
            <span>Let&apos;s get started</span>
          </div>
          <DialogTitle className="font-heading text-[24px] mt-1">Select your focus area</DialogTitle>
          <DialogDescription className="text-[13.5px]">
            What matters most for your class this term? You can change this anytime.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex items-center gap-3.5 rounded-2xl border p-4"
          style={{
            borderColor: `color-mix(in srgb, ${recommendedMeta.tone} 30%, transparent)`,
            background: `color-mix(in srgb, ${recommendedMeta.tone} 6%, transparent)`,
          }}
        >
          <span
            className="h-11 w-11 rounded-xl inline-flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${recommendedMeta.tone} 16%, transparent)`, color: recommendedMeta.tone }}
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div
              className="text-[10.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: recommendedMeta.tone }}
            >
              Yellow recommends
            </div>
            <div className="font-heading font-extrabold text-[14px] leading-tight mt-0.5">
              {recommendedMeta.title}
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              The best place for most teachers to start.
            </p>
          </div>
          <button
            type="button"
            onClick={() => selectFocus(recommended)}
            className="shrink-0 h-9 px-3.5 rounded-lg text-[12.5px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: recommendedMeta.tone }}
          >
            Select this
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FOCUS_ORDER.map((id) => {
            const meta = DRIVER_META[id];
            const isRecommended = id === recommended;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectFocus(id)}
                className={cn(
                  "relative text-left rounded-2xl border bg-background p-5 min-h-[168px] flex flex-col gap-3 transition-colors hover:border-foreground/20 hover:bg-muted/20",
                  isRecommended ? "border-primary/40" : "border-border",
                )}
              >
                {isRecommended && (
                  <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Recommended
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <span
                    className="h-11 w-11 rounded-xl inline-flex items-center justify-center"
                    style={{ background: `color-mix(in srgb, ${meta.tone} 14%, transparent)`, color: meta.tone }}
                  >
                    <meta.Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-[14.5px] leading-tight">{meta.title}</h4>
                  <p className="text-[12px] text-muted-foreground mt-1.5 leading-snug">{meta.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-muted/30 p-4">
          <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-bold">Not sure yet?</div>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              You can always explore other areas and adjust your focus later.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
