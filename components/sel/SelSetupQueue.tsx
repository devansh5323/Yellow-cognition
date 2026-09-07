"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Check, ClipboardCheck, HeartPulse, UserPlus, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelFtueStage } from "@/lib/selOnboarding";
import { pulseResponseProgress, PULSE_FULL_SCORE_THRESHOLD_PCT, type Pulse } from "@/lib/selPulse";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const GREEN = "hsl(142 55% 45%)";
const PRIMARY = "hsl(258 55% 60%)";

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type QueueItem = {
  key: string;
  /** null = no real completion signal exists yet for this action (no
   * fabricated "done" state) — it stays a persistent, always-available
   * action rather than a checklist step. */
  done: boolean | null;
  Icon: typeof HeartPulse;
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
};

/** The Action Hub's initial state — a guided setup queue rather than the
 * priority-ranked "What needs action now" list, which only makes sense
 * once there's real signal to prioritize. Per instruction, nothing here
 * requires finishing all four before the rest of the dashboard shows
 * value — each Snapshot tile/section already unlocks independently off
 * the same stage. */
export function SelSetupQueue({ stage, pulses }: { stage: SelFtueStage; pulses: Pulse[] }) {
  const reduce = useReducedMotion();

  const pulseDone = stage === "program" || stage === "group" || stage === "done";
  const programDone = stage === "group" || stage === "done";

  // Once the pulse is sent but before response coverage is complete, this
  // row shows live participation instead of a plain checkmark — the
  // "done" step stays visibly in-progress through both the "collecting"
  // and "early insight" tiers on School Snapshot, only settling into a
  // plain checkmark once coverage is full.
  const pulseProgress = pulseDone ? pulseResponseProgress(pulses) : null;
  const pulseInProgress = pulseDone && pulseProgress !== null && pulseProgress.coveragePct < PULSE_FULL_SCORE_THRESHOLD_PCT;

  // Once the pulse is running, this becomes the coordinator's next real
  // step — the "Next:" prefix only applies while it's genuinely next
  // (pulse done, program not yet), not before or after.
  const programIsNext = pulseDone && !programDone;

  const items: QueueItem[] = [
    {
      key: "pulse",
      done: pulseInProgress ? false : pulseDone,
      Icon: HeartPulse,
      title: pulseInProgress ? "SEL Pulse in progress" : "Launch your first SEL Pulse",
      description: pulseInProgress
        ? `${pulseProgress!.responsesReceived} responses received · ${pulseProgress!.coveragePct}% coverage`
        : "Collect your first school-wide student signal.",
      cta: pulseInProgress ? "View participation" : "Create pulse",
      href: pulseInProgress ? "/sel/pulse" : "/sel/pulse?create=1",
    },
    {
      key: "program",
      done: programDone,
      Icon: ClipboardCheck,
      title: programIsNext ? "Next: Set up SEL implementation" : "Set up SEL implementation",
      description:
        "Add the current SEL activities so Yellow can compare student needs with what is being delivered.",
      cta: "Set up SEL program",
      href: "/sel/planner",
    },
    {
      key: "referrals",
      done: null,
      Icon: Users2,
      title: "View your referrals",
      description: "Student referral & handoff tracking isn't available yet.",
      cta: "View referrals",
      onClick: () => comingSoon("Student referrals"),
    },
    {
      key: "teachers",
      done: null,
      Icon: UserPlus,
      title: "Invite teachers to participate",
      description: "Ensure teachers can complete implementation updates and observations.",
      cta: "Review teachers",
      href: "/sel/teachers",
    },
  ];

  const trackable = items.filter((i) => i.done !== null);
  const doneCount = trackable.filter((i) => i.done).length;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="SEL Action Hub setup queue"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Action Hub · Getting started</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          Get the most out of Yellow
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1">
          {doneCount} of {trackable.length} done — everything else on this dashboard unlocks as
          you go, no need to finish these in order.
        </p>
      </header>

      <ul className="space-y-2.5">
        {items.map((item, i) => {
          const tone = item.done ? GREEN : PRIMARY;
          return (
            <motion.li
              key={item.key}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
              className="flex items-stretch gap-0 rounded-xl border border-border bg-background overflow-hidden"
              data-tour-target={
                item.key === "pulse" ? "sel-queue-pulse" : item.key === "program" ? "sel-queue-program" : undefined
              }
            >
              <span className="w-1 shrink-0" style={{ background: tone }} aria-hidden />
              <div className="flex-1 min-w-0 flex items-center gap-3 p-3.5">
                <span
                  className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                >
                  {item.done ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <item.Icon className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-heading font-bold text-[13.5px] leading-tight",
                      item.done && "text-muted-foreground line-through decoration-2",
                    )}
                  >
                    {item.title}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">
                    {item.description}
                  </p>
                </div>
                {!item.done &&
                  (item.href ? (
                    <Link
                      href={item.href}
                      className="ml-auto inline-flex items-center gap-1 h-8 rounded-lg px-2.5 text-[11.5px] font-bold shrink-0 transition-colors hover:brightness-95"
                      style={{
                        color: tone,
                        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
                      }}
                    >
                      {item.cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="ml-auto inline-flex items-center gap-1 h-8 rounded-lg px-2.5 text-[11.5px] font-bold shrink-0 transition-colors hover:brightness-95"
                      style={{
                        color: tone,
                        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
                      }}
                    >
                      {item.cta}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
