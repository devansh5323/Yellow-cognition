"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Check, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClassroomForm, type NewClassroomInput } from "@/components/onboarding/ClassroomForm";
import { RosterPicker, rosterMethodLabel } from "@/components/onboarding/RosterPicker";
import { getOnboarding, setOnboarding, type OnboardingClassroom, type RosterMethod } from "@/lib/onboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Classroom setup now happens here instead of in the onboarding wizard —
 * a teacher lands on their dashboard right after "Tell us about you," and
 * this banner is what actually asks them to create a classroom, any time
 * after that (not gating access to the dashboard itself). Disappears once
 * at least one classroom exists; the "add another" dialog stays open
 * (controlled independently) so a teacher can add several in one sitting
 * without it vanishing after the first. */
export function ClassroomSetupPrompt() {
  const [classrooms, setClassroomsState] = useState<OnboardingClassroom[] | null>(null);
  const [board, setBoardState] = useState("");
  const [rosterMethod, setRosterMethodState] = useState<RosterMethod | null>(null);
  // "classroom" shows the grade/section/subjects form; "roster" shows only
  // the student-list method picker — kept as separate dialog modes so
  // clicking "Add student list" doesn't also surface the classroom form.
  const [mode, setMode] = useState<"classroom" | "roster">("classroom");
  // Computed once at mount, synchronously — a brand-new teacher shouldn't
  // have to find and click a button to discover this. `classroomPromptShown`
  // is flipped right after, so this only ever auto-opens the first time.
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const state = getOnboarding();
    return state.classrooms.length === 0 && !state.classroomPromptShown;
  });
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => {
      const state = getOnboarding();
      setClassroomsState(state.classrooms);
      setBoardState(state.profile?.board ?? "");
      setRosterMethodState(state.classrooms[0]?.rosterMethod ?? null);
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

  // Lets the header's "+ Add classroom" pill (AppShell.tsx) and the FTUE
  // checklist's classroom step (DataReadinessCard.tsx) open this same dialog
  // — the checklist passes detail.mode: "roster" when a classroom already
  // exists but still needs a student list, so it opens straight to the
  // picker instead of the grade/section/subjects form.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: "classroom" | "roster" }>).detail;
      setMode(detail?.mode ?? "classroom");
      setOpen(true);
    };
    window.addEventListener("ah-open-classroom-setup", onOpen);
    return () => window.removeEventListener("ah-open-classroom-setup", onOpen);
  }, []);

  // Marking "shown" only happens when the dialog actually closes — not on
  // mount. Writing it on mount raced with React Strict Mode's dev-only
  // double-invoke (mount → unmount → remount): the first mount's write
  // would already be visible to the *second* (real, rendered) mount's
  // lazy `open` initializer above, making it compute false and silently
  // cancel the auto-open. Closing only ever happens once for real.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setOnboarding({ classroomPromptShown: true });
  };

  if (classrooms === null) return null;

  // Persist via setOnboarding directly (not from inside a setClassroomsState
  // updater) — setOnboarding synchronously dispatches "ah-onboarding-change",
  // which this component's own refresh() listener above picks up to sync
  // `classrooms`. Nesting that dispatch inside a functional setState updater
  // let React's Strict Mode double-invoke of that updater observe its own
  // side effect on the second pass (current.length off by one), which is
  // what turned a single "add classroom" click into two classrooms on the
  // very first add. Reading `classrooms` directly and calling setOnboarding
  // once removes that reentrancy; the change-listener round trip already
  // keeps local state in sync, so no manual setClassroomsState is needed here.
  const addClassroom = (input: NewClassroomInput) => {
    const current = classrooms ?? [];
    const classroom: OnboardingClassroom = {
      id: `classroom-${Date.now()}-${current.length}`,
      grade: input.grade,
      section: input.section.trim() || String.fromCharCode(65 + current.length),
      subjects: input.subjects,
      size: input.size,
      period: input.period,
      rosterMethod: "sample",
      rosterReady: false,
    };
    setOnboarding({ classrooms: [...current, classroom] });
  };

  const removeClassroom = (id: string) => {
    const next = (classrooms ?? []).filter((c) => c.id !== id);
    setOnboarding({ classrooms: next });
  };

  // Picking a method here is the "student list" half of setup — a classroom
  // isn't actually ready until this runs, so the FTUE checklist's "Set up
  // your classroom" step only ticks once rosterReady flips true (not just
  // because a classroom object exists with its default sample placeholder).
  const chooseRoster = (method: RosterMethod) => {
    setOnboarding({
      classrooms: (classrooms ?? []).map((c) => ({ ...c, rosterMethod: method, rosterReady: true })),
    });
    toast.success(`Roster set to ${rosterMethodLabel(method)}`);
  };

  return (
    <>
      {classrooms.length === 0 && (
        <motion.section
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="premium-elevated rounded-[22px] p-5 md:p-6 flex flex-wrap items-center gap-4"
        >
          <span className="h-11 w-11 rounded-2xl bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-extrabold text-[16px] leading-tight">Set up your first classroom</h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Add your grade, section, and subjects so Yellow can personalize your dashboard.
            </p>
          </div>
          <Button
            onClick={() => {
              setMode("classroom");
              setOpen(true);
            }}
            className="gap-1.5 shrink-0"
          >
            Set up classroom
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.section>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {mode === "roster" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Add your student list
                </DialogTitle>
                <DialogDescription>
                  Choose how students get added to{" "}
                  {classrooms.length > 1 ? "your classrooms" : "your classroom"}.
                </DialogDescription>
              </DialogHeader>

              <RosterPicker value={rosterMethod} onChange={chooseRoster} />

              <Button
                variant="secondary"
                className="w-full h-11 gap-1.5 font-heading font-bold text-[13.5px]"
                onClick={() => handleOpenChange(false)}
              >
                <Check className="h-4 w-4" />
                Done
              </Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create your classroom</DialogTitle>
                <DialogDescription>
                  Add every classroom you teach — you can always add more later.
                </DialogDescription>
              </DialogHeader>

              <ClassroomForm board={board} classrooms={classrooms} onAdd={addClassroom} onRemove={removeClassroom} />

              {classrooms.length > 0 && (
                <Button
                  variant="secondary"
                  className="w-full h-11 gap-1.5 font-heading font-bold text-[13.5px]"
                  onClick={() => handleOpenChange(false)}
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
