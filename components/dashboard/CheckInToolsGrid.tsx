"use client";

import { Fragment, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, ClipboardCheck, Info, Mic, Star, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  getBehaviorLogCountThisWeek,
  getPositiveLogCountThisWeek,
} from "@/lib/checkInTools";
import { getPendingFollowUpCount, getPendingFollowUps } from "@/lib/interventionFollowUps";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ToolStats = {
  behaviorLogsThisWeek: number;
  positiveLogsThisWeek: number;
  followUpsPending: number;
  followUpStudentId?: string;
  followUpReason?: string;
};

function readStats(): ToolStats {
  const followUpTarget = getPendingFollowUps()[0];
  return {
    behaviorLogsThisWeek: getBehaviorLogCountThisWeek(),
    positiveLogsThisWeek: getPositiveLogCountThisWeek(),
    followUpsPending: getPendingFollowUpCount(),
    followUpStudentId: followUpTarget?.student.id,
    followUpReason: followUpTarget?.reason,
  };
}

type QuickTool = {
  key: string;
  step: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
  voiceBased: boolean;
  StatIcon: LucideIcon;
  statLabel: string;
  cta: string;
  CtaIcon: LucideIcon;
  onOpenTool: () => void;
};

/** The 3 check-in tools that otherwise only exist as floating dialogs off
 * the Dashboard tab (see TeacherCheckInTools.tsx, which stays untouched —
 * it's the FTUE tour's anchor). This is a fuller, full-page-sized version
 * of the same 3 tools for the dedicated Check-in tab, wired to the exact
 * same global dialogs via the same custom events. */
export function CheckInToolsGrid() {
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<ToolStats | null>(null);

  useEffect(() => {
    const refresh = () => setStats(readStats());
    refresh();
    window.addEventListener("ah-behavior-log-change", refresh);
    window.addEventListener("ah-positive-log-change", refresh);
    window.addEventListener("ah-followup-change", refresh);
    return () => {
      window.removeEventListener("ah-behavior-log-change", refresh);
      window.removeEventListener("ah-positive-log-change", refresh);
      window.removeEventListener("ah-followup-change", refresh);
    };
  }, []);

  if (!stats) {
    return (
      <section aria-label="More classroom log tools" className="space-y-3">
        <div className="premium-eyebrow">
          <span>Quick actions</span>
        </div>
        <div className="flex flex-col md:flex-row gap-5 md:gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-[22px] border border-border bg-card p-7 h-[240px] animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  const tools: QuickTool[] = [
    {
      key: "record-behavior",
      step: "1. Notice",
      title: "Record Behaviour",
      description: "Voice log problematic or disruptive behaviour and map it to PBIS expectations.",
      Icon: Mic,
      tone: "hsl(260 55% 60%)",
      voiceBased: true,
      StatIcon: ClipboardCheck,
      statLabel: `This week: ${stats.behaviorLogsThisWeek} logged`,
      cta: "Log behaviour",
      CtaIcon: Mic,
      onOpenTool: () => window.dispatchEvent(new CustomEvent("ah-open-yellow-ai-log-behavior")),
    },
    {
      key: "positive-log",
      step: "2. Recognise",
      title: "Positive Behaviour Log",
      description: "Voice log praise, strengths, and expected behaviours noticed in class.",
      Icon: Star,
      tone: "hsl(38 92% 50%)",
      voiceBased: true,
      StatIcon: Star,
      statLabel: `${stats.positiveLogsThisWeek} positives this week`,
      cta: "Log positive",
      CtaIcon: Mic,
      onOpenTool: () => window.dispatchEvent(new CustomEvent("ah-open-yellow-ai-log-positive")),
    },
    {
      key: "intervention-followup",
      step: "3. Follow up",
      title: "Intervention Follow-Up",
      description: "Track whether a strategy was tried, and whether it worked.",
      Icon: ClipboardCheck,
      tone: "hsl(172 55% 40%)",
      voiceBased: false,
      StatIcon: Clock,
      statLabel: `${stats.followUpsPending} pending`,
      cta: "Review follow-ups",
      CtaIcon: ArrowRight,
      onOpenTool: () =>
        window.dispatchEvent(
          new CustomEvent("ah-open-followup-form", {
            detail: stats.followUpStudentId
              ? { studentId: stats.followUpStudentId, reason: stats.followUpReason }
              : {},
          }),
        ),
    },
  ];

  return (
    <section aria-label="More classroom log tools" className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Quick actions</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Capture the moments that shape your classroom insights.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            toast.info("Notice a moment, log it in seconds, then review outcomes in Follow-Up.")
          }
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Info className="h-3.5 w-3.5" />
          How it works
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-stretch gap-5 md:gap-6">
        {tools.map((tool, i) => (
          <Fragment key={tool.key}>
            <motion.article
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4, ease: EASE }}
              data-tour-target={`tool-${tool.key}`}
              className="premium-surface premium-surface-hover group relative flex-1 min-w-0 overflow-hidden rounded-[22px] p-7 flex flex-col gap-5"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-70"
                aria-hidden
                style={{
                  background: `radial-gradient(70% 60% at 18% 0%, color-mix(in srgb, ${tool.tone} 8%, transparent), transparent 70%)`,
                }}
              />
              <div className="relative flex items-start gap-3.5">
                <span
                  className="relative h-14 w-14 rounded-2xl inline-flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${tool.tone} 14%, transparent)`, color: tool.tone }}
                >
                  <span
                    className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{ background: `color-mix(in srgb, ${tool.tone} 30%, transparent)`, filter: "blur(10px)" }}
                    aria-hidden
                  />
                  <tool.Icon className="relative h-6 w-6" strokeWidth={2.2} />
                  {tool.voiceBased && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-card border border-border inline-flex items-center justify-center"
                      style={{ color: tool.tone }}
                      aria-hidden
                    >
                      <Mic className="h-2.5 w-2.5" />
                    </span>
                  )}
                </span>
                <div className="min-w-0 pt-0.5">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: tool.tone }}
                  >
                    {tool.step}
                  </div>
                  <h3 className="font-heading font-extrabold text-[16px] leading-tight mt-0.5">
                    {tool.title}
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="relative flex items-center justify-between gap-2 mt-auto">
                <span
                  className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full"
                  style={{ background: `color-mix(in srgb, ${tool.tone} 10%, transparent)`, color: tool.tone }}
                >
                  <tool.StatIcon className="h-3 w-3" strokeWidth={2.4} />
                  {tool.statLabel}
                </span>
                {tool.voiceBased && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/80 shrink-0">
                    <Mic className="h-2.5 w-2.5" />
                    Voice
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={tool.onOpenTool}
                className="relative flex items-center justify-center gap-1.5 rounded-xl px-4 h-11 text-[13.5px] font-bold text-white shadow-md transition-transform hover:scale-[1.015] active:scale-[0.98]"
                style={{ background: tool.tone, boxShadow: `0 10px 22px -12px color-mix(in srgb, ${tool.tone} 60%, transparent)` }}
              >
                {tool.cta}
                <tool.CtaIcon className="h-3.5 w-3.5" />
              </button>
            </motion.article>
            {i < tools.length - 1 && (
              <div className="hidden md:flex items-center justify-center shrink-0 text-muted-foreground/30">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
