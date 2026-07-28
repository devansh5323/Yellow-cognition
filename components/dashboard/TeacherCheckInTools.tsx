"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Mic,
  Star,
  Users,
} from "lucide-react";

import { classRiskRadar, countFollowUpsPending } from "@/data/mockData";
import {
  getBehaviorLogCountThisWeek,
  getClassCheckInsThisWeek,
  getPositiveLogCountThisWeek,
  logPositiveEvent,
} from "@/lib/checkInTools";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ToolStats = {
  checkInsThisWeek: number;
  behaviorLogsThisWeek: number;
  positiveLogsThisWeek: number;
  followUpsPending: number;
  followUpHref: string;
};

function readStats(): ToolStats {
  const followUpTarget = classRiskRadar().find((r) => r.students.length > 0)?.students[0];
  return {
    checkInsThisWeek: getClassCheckInsThisWeek(TEACHER_NAME),
    behaviorLogsThisWeek: getBehaviorLogCountThisWeek(),
    positiveLogsThisWeek: getPositiveLogCountThisWeek(),
    followUpsPending: countFollowUpsPending(),
    followUpHref: followUpTarget ? `/students/${followUpTarget.id}` : "/students",
  };
}

export function TeacherCheckInTools() {
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<ToolStats | null>(null);

  useEffect(() => {
    const refresh = () => setStats(readStats());
    refresh();
    window.addEventListener("ah-checkin-change", refresh);
    window.addEventListener("ah-behavior-log-change", refresh);
    window.addEventListener("ah-positive-log-change", refresh);
    return () => {
      window.removeEventListener("ah-checkin-change", refresh);
      window.removeEventListener("ah-behavior-log-change", refresh);
      window.removeEventListener("ah-positive-log-change", refresh);
    };
  }, []);

  if (!stats) return null;

  const tools = [
    {
      key: "class-checkin",
      title: "Class Check-In",
      description:
        "Voice record a full 30–40 min class period. Yellow analyzes focus, disruption, readiness, and task flow.",
      Icon: Users,
      tone: "hsl(212 90% 58%)",
      voiceBased: true,
      statIcon: ClipboardCheck,
      statLabel: `This week: ${stats.checkInsThisWeek} completed`,
      cta: "Start class recording",
      ctaIcon: ChevronRight,
      href: "/check-in",
      onClick: undefined,
    },
    {
      key: "record-behavior",
      title: "Record Behaviour",
      description:
        "Voice log problematic or disruptive behaviour and map it to PBIS expectations.",
      Icon: Mic,
      tone: "hsl(260 55% 60%)",
      voiceBased: true,
      statIcon: ClipboardCheck,
      statLabel: `This week: ${stats.behaviorLogsThisWeek} logged`,
      cta: "Hold to speak",
      ctaIcon: Mic,
      onOpenTool: () => window.dispatchEvent(new CustomEvent("ah-open-behaviour-note")),
    },
    {
      key: "positive-log",
      title: "Positive Behaviour Log",
      description: "Voice log praise, strengths, and expected behaviours noticed in class.",
      Icon: Star,
      tone: "hsl(38 92% 50%)",
      voiceBased: true,
      statIcon: Star,
      statLabel: `${stats.positiveLogsThisWeek} positives`,
      cta: "Log positive",
      ctaIcon: ChevronRight,
      href: "/behavior",
      onClick: logPositiveEvent,
    },
    {
      key: "intervention-followup",
      title: "Intervention Follow-Up",
      description: "Track whether a strategy was tried, and whether it worked.",
      Icon: ClipboardCheck,
      tone: "hsl(172 55% 40%)",
      voiceBased: false,
      statIcon: Clock,
      statLabel: `${stats.followUpsPending} pending`,
      cta: "Log follow-up",
      ctaIcon: ChevronRight,
      href: stats.followUpHref,
      onClick: undefined,
    },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
      aria-label="Teacher check-in tools"
    >
      <div className="flex items-start gap-3">
        <span className="h-11 w-11 rounded-xl inline-flex items-center justify-center shrink-0 bg-[color-mix(in_srgb,hsl(260_55%_60%)_14%,transparent)] text-[hsl(260_55%_60%)]">
          <Briefcase className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight">
            Teacher Check-In Tools
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Capture the signals that power your class insights and recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {tools.map((tool) => (
          <ToolCard key={tool.key} tool={tool} />
        ))}
      </div>
    </motion.section>
  );
}

type Tool = {
  key: string;
  title: string;
  description: string;
  Icon: typeof Users;
  tone: string;
  voiceBased: boolean;
  statIcon: typeof Users;
  statLabel: string;
  cta: string;
  ctaIcon: typeof Users;
  href?: string;
  onClick?: () => void;
  onOpenTool?: () => void;
};

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.Icon;
  const StatIcon = tool.statIcon;
  const CtaIcon = tool.ctaIcon;

  return (
    <article className="rounded-2xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className="relative h-12 w-12 rounded-xl inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tool.tone} 14%, transparent)`,
            color: tool.tone,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
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
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-extrabold text-[14.5px] leading-tight">{tool.title}</h3>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{tool.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tool.voiceBased && <Tag Icon={Mic} label="Voice-based" tone={tool.tone} />}
        <Tag Icon={StatIcon} label={tool.statLabel} tone={tool.tone} />
      </div>

      {tool.onOpenTool ? (
        <button
          type="button"
          onClick={tool.onOpenTool}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-colors"
          style={{
            background: `color-mix(in srgb, ${tool.tone} 12%, transparent)`,
            color: tool.tone,
          }}
        >
          {tool.cta}
          <CtaIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link
          href={tool.href ?? "#"}
          onClick={tool.onClick}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-colors"
          style={{
            background: `color-mix(in srgb, ${tool.tone} 12%, transparent)`,
            color: tool.tone,
          }}
        >
          {tool.cta}
          <CtaIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </article>
  );
}

function Tag({ Icon, label, tone }: { Icon: typeof Users; label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full"
      style={{
        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
        color: tone,
      }}
    >
      <Icon className="h-3 w-3" strokeWidth={2.4} />
      {label}
    </span>
  );
}
