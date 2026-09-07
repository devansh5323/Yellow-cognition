"use client";

import { useEffect, useState } from "react";
import { DataReadinessTour, type TourStep } from "@/components/onboarding/DataReadinessTour";
import { SCHOOL_ACTIVATION_TASKS } from "@/components/school/SchoolOnboardingChecklist";
import { QuickInviteTeachersDialog } from "@/components/school/QuickInviteTeachersDialog";
import { ScheduleDigestDialog } from "@/components/school/ScheduleDigestDialog";
import { AlertsThresholdsDialog } from "@/components/school/AlertsThresholdsDialog";
import { ParentCommsDialog } from "@/components/school/ParentCommsDialog";
import { SCHOOL_STAGE_ORDER, type SchoolFtueStage } from "@/lib/schoolOnboarding";

// One tour step per real activation task, reusing the checklist's own
// copy/tone/icon/destination — same "single definition, two surfaces"
// approach as the checklist row it spotlights.
const STEPS: TourStep[] = SCHOOL_ACTIVATION_TASKS.map((t) => ({
  id: t.id,
  target: `school-task-${t.id}`,
  title: t.title,
  description: t.blurb,
  cta: t.cta,
  Icon: t.Icon,
  tone: t.tone,
}));

/** Action-oriented walkthrough for the School admin's 5-task FTUE (invite →
 * digest → thresholds → comms → report) — same DataReadinessTour spotlight
 * the teacher/SEL dashboards use, reused as-is. activeIndex is driven
 * entirely by the real computeSchoolFtueStage(), not internal step state.
 * Each step's target is the exact same checklist row the admin could click
 * directly. Unlike the first version of this tour, the CTA no longer
 * navigates away — it opens the real completion dialog in place (same
 * z-40-tour-under-z-50-dialog layering the teacher/SEL tours already rely
 * on), so the dashboard stays visible underneath and finishing the dialog
 * advances the tour automatically via the dashboard's own
 * ah-school-onboarding-change listener. */
export function SchoolDashboardTour({ stage }: { stage: SchoolFtueStage }) {
  const [dismissedIndex, setDismissedIndex] = useState<number | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [digestOpen, setDigestOpen] = useState(false);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);

  const activeIndex = SCHOOL_STAGE_ORDER.indexOf(stage as (typeof SCHOOL_STAGE_ORDER)[number]);
  const dismissed = dismissedIndex === activeIndex;

  // The spotlighted row only exists in the DOM while the checklist card is
  // expanded — ask it to expand rather than risk targeting nothing.
  useEffect(() => {
    if (activeIndex >= 0) window.dispatchEvent(new CustomEvent("ah-school-checklist-expand"));
  }, [activeIndex]);

  if (activeIndex === -1) return null;

  const handleAction = (id: string) => {
    if (id === "invite-teachers") setInviteOpen(true);
    // review-digest and schedule-report share one dialog — the real
    // reports page already treats "schedule the digest" as satisfying
    // both tasks at once, so there's nothing distinct to open per-step.
    else if (id === "review-digest" || id === "schedule-report") setDigestOpen(true);
    else if (id === "set-thresholds") setThresholdsOpen(true);
    else if (id === "configure-parent-comms") setCommsOpen(true);
  };

  return (
    <>
      <DataReadinessTour
        steps={STEPS}
        activeIndex={activeIndex}
        dismissed={dismissed}
        onAction={handleAction}
        onDismiss={() => setDismissedIndex(activeIndex)}
      />
      <QuickInviteTeachersDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <ScheduleDigestDialog open={digestOpen} onOpenChange={setDigestOpen} />
      <AlertsThresholdsDialog open={thresholdsOpen} onOpenChange={setThresholdsOpen} />
      <ParentCommsDialog open={commsOpen} onOpenChange={setCommsOpen} />
    </>
  );
}
