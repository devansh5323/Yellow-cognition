"use client";

import { useState } from "react";
import { HeartPulse, ClipboardCheck, Target, Users2 } from "lucide-react";
import { DataReadinessTour, type TourStep } from "@/components/onboarding/DataReadinessTour";
import { CreatePulseDialog } from "@/components/sel/CreatePulseDialog";
import { CreateProgramDialog } from "@/components/sel/CreateProgramDialog";
import { CreateGroupDialog } from "@/components/sel/CreateGroupDialog";
import type { SelFtueStage } from "@/lib/selOnboarding";

const PRIMARY = "hsl(258 55% 60%)";
const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const AMBER = "hsl(38 92% 50%)";

const STAGE_ORDER: SelFtueStage[] = ["monitor", "pulse", "program", "group"];

const STEPS: TourStep[] = [
  {
    id: "monitor",
    target: "sel-monitor-focus",
    title: "Choose what you want to monitor",
    description:
      "Tell Yellow which SEL signals matter most so pulses and insights stay focused on what your school actually needs.",
    // No cta — this step's real action is a multi-select-then-confirm card,
    // not a single button, so it's directly clickable through the spotlight
    // cutout instead of getting a redundant CTA next to the card's own
    // "Continue" button.
    Icon: Target,
    tone: PRIMARY,
  },
  {
    id: "pulse",
    target: "sel-queue-pulse",
    title: "Launch your first SEL Pulse",
    description: "Send a quick check-in to collect your first school-wide student signal.",
    cta: "Create pulse",
    Icon: HeartPulse,
    tone: BLUE,
  },
  {
    id: "program",
    target: "sel-queue-program",
    title: "Set up SEL implementation",
    description:
      "Add the SEL activities already running so Yellow can compare student needs with what's being delivered.",
    cta: "Set up program",
    Icon: ClipboardCheck,
    tone: GREEN,
  },
  {
    id: "group",
    target: "sel-group-lock",
    title: "Track targeted support",
    description: "Set up tiered support groups so Yellow can monitor students who need more focused help.",
    cta: "Set up groups",
    Icon: Users2,
    tone: AMBER,
  },
];

/** Action-oriented walkthrough for the 4-stage SEL FTUE (monitor → pulse →
 * program → group) — same DataReadinessTour spotlight the teacher dashboard
 * uses, reused as-is since it's already fully generic. activeIndex is
 * driven entirely by the real computeSelFtueStage(), not internal step
 * state. Unlike the teacher tour (whose dismiss is a single session-wide
 * flag, fine since all 3 of its steps open a dialog on top of the guide),
 * dismissing here only hides the *current* step, so the guide still comes
 * back for the next real step if an earlier one gets dismissed.
 *
 * Each of pulse/program/group's CTA opens its real creation dialog directly
 * on top of the dashboard (same z-40-tour-under-z-50-dialog layering the
 * teacher tour's FocusAreaDialog already relies on) instead of navigating
 * away — the dashboard stays visible underneath, and submitting the dialog
 * marks the real FTUE task done, which the dashboard's own
 * ah-sel-*-change listeners pick up to recompute `stage` and advance this
 * tour to the next step automatically, with no extra plumbing needed here. */
export function SelDashboardTour({ stage }: { stage: SelFtueStage }) {
  const [dismissedIndex, setDismissedIndex] = useState<number | null>(null);

  // Each dialog remounts on a bumped `key` every time it opens (same pattern
  // as its own page's "Create ―" button), so a cancelled-then-reopened
  // dialog starts from fresh field values rather than whatever was left
  // half-filled last time.
  const [pulseOpen, setPulseOpen] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [programOpen, setProgramOpen] = useState(false);
  const [programKey, setProgramKey] = useState(0);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupKey, setGroupKey] = useState(0);

  const activeIndex = STAGE_ORDER.indexOf(stage);
  const dismissed = dismissedIndex === activeIndex;

  if (activeIndex === -1) return null;

  const handleAction = (id: string) => {
    if (id === "pulse") {
      setPulseKey((k) => k + 1);
      setPulseOpen(true);
    } else if (id === "program") {
      setProgramKey((k) => k + 1);
      setProgramOpen(true);
    } else if (id === "group") {
      setGroupKey((k) => k + 1);
      setGroupOpen(true);
    }
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
      <CreatePulseDialog key={pulseKey} open={pulseOpen} onOpenChange={setPulseOpen} />
      <CreateProgramDialog key={programKey} open={programOpen} onOpenChange={setProgramOpen} />
      <CreateGroupDialog key={groupKey} open={groupOpen} onOpenChange={setGroupOpen} prefill={null} />
    </>
  );
}
