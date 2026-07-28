"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Heart,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStats, type InviteStats } from "@/lib/roster";
import { listCheckInsForTeacher } from "@/lib/checkIn";
import { getOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const TEACHER_NAME = "Maya Khan";
const EASE = [0.2, 0.7, 0.2, 1] as const;

type StepStatus = "done" | "in-progress" | "todo";

type StepAction =
  | { kind: "link"; to: string; search?: Record<string, string> }
  | { kind: "event"; event: string };

type StepDef = {
  id: "walkthrough" | "connect" | "invite" | "checkin" | "behavior-log" | "positive-log" | "review";
  title: string;
  description: string;
  Icon: typeof Send;
  cta: string;
  action: StepAction;
  status: StepStatus;
  /** Optional inline progress text e.g. "2 of 24" */
  progress?: string;
};

function checkinThisMonth(): boolean {
  const list = listCheckInsForTeacher(TEACHER_NAME);
  if (list.length === 0) return false;
  const d = new Date(list[0].createdAt);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function buildSteps(stats: InviteStats): StepDef[] {
  const total = Math.max(0, stats.total);
  const allConnected = total > 0 && stats.active === total;
  const someInvited = stats.invited > 0;

  const connectStatus: StepStatus = allConnected ? "done" : someInvited ? "in-progress" : "todo";
  const inviteStatus: StepStatus =
    stats.pending === 0 && total > 0 ? "done" : someInvited ? "in-progress" : "todo";

  const checkinDone = checkinThisMonth();
  const tourDone = !!getOnboarding().tourCompleted;

  return [
    {
      id: "walkthrough",
      title: "Take the dashboard walkthrough",
      description: "A quick 2-min tour to help you get familiar.",
      Icon: Compass,
      cta: tourDone ? "Completed" : "Start tour",
      action: { kind: "event", event: "ah-start-tour" },
      status: tourDone ? "done" : "todo",
    },
    {
      id: "connect",
      title: "Connect every student",
      description: "Link all your students to start seeing their insights.",
      Icon: Users,
      cta: connectStatus === "done" ? "View roster" : `${stats.active} / ${total} connected`,
      action: { kind: "link", to: "/settings", search: { tab: "roster" } },
      status: connectStatus,
      progress: total > 0 ? `${stats.active} of ${total} linked` : undefined,
    },
    {
      id: "invite",
      title: "Send parent invites",
      description: "Invite parents to provide valuable input.",
      Icon: Send,
      cta: inviteStatus === "done" ? "View roster" : "Send invites",
      action: { kind: "link", to: "/settings", search: { tab: "roster" } },
      status: inviteStatus,
    },
    {
      id: "checkin",
      title: "Run your first class check-in",
      description: "Capture how your class is doing this week.",
      Icon: ClipboardCheck,
      cta: checkinDone ? "View check-in" : "Start check-in",
      action: { kind: "link", to: "/check-in" },
      status: checkinDone ? "done" : "todo",
    },
    {
      id: "behavior-log",
      title: "Record your first behavior observation",
      description: "Log a student behavior to track patterns.",
      Icon: MessageCircle,
      cta: "Log behavior",
      action: { kind: "link", to: "/behavior" },
      status: "todo",
    },
    {
      id: "positive-log",
      title: "Record a positive behavior",
      description: "Celebrate a strength you noticed in your class.",
      Icon: Heart,
      cta: "Log positive",
      action: { kind: "link", to: "/behavior" },
      status: "todo",
    },
    {
      id: "review",
      title: "Review your classroom health",
      description: "See your class health score and key insights.",
      Icon: BarChart3,
      cta: "View dashboard",
      action: { kind: "link", to: "/dashboard" },
      status: "todo",
    },
  ];
}

export function DataReadinessCard() {
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);

  useEffect(() => {
    const refresh = () => setStats(getStats());
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

  const steps = useMemo(() => (stats ? buildSteps(stats) : []), [stats]);

  if (!stats) {
    return null;
  }

  const total = Math.max(0, stats.total);
  const linked = Math.min(stats.active, total);
  const coverage = total > 0 ? Math.round((linked / total) * 100) : 0;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const totalSteps = steps.length;
  const primarySteps = steps.slice(0, 3);
  const moreSteps = steps.slice(3);

  // Once all steps are complete and coverage is full, hide the card entirely.
  if (doneCount === totalSteps && coverage === 100) {
    return null;
  }

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
      aria-label="Data readiness"
    >
      {/* Header — clickable to expand/collapse the steps */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls="data-readiness-steps"
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Data readiness</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1.5">
            {total === 0
              ? "Add your roster to start seeing data"
              : `Seeing data from ${linked} of ${total} students`}
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            {total === 0
              ? "Once your roster is in, the dashboard fills in as parents link their child and you log the first check-in."
              : collapsed
                ? "Click to view the steps that unlock the full picture."
                : "Complete the steps below to unlock the full picture across the dashboard."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="font-heading font-extrabold text-[22px] tabular-nums leading-none">
              {doneCount}
              <span className="text-muted-foreground/70 text-[14px] font-bold">/{totalSteps}</span>
            </div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mt-1">
              steps complete
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
      </button>

      {/* Roster coverage bar — always visible so the headline isn't orphaned */}
      <div className="pt-4">
        <CoverageBar stats={stats} />
      </div>

      {/* Steps list — collapsible */}
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
            <ul className="mt-4 space-y-2">
              {primarySteps.map((s, i) => (
                <StepRow key={s.id} step={s} index={i} reduce={!!reduce} />
              ))}
              <AnimatePresence initial={false}>
                {stepsExpanded &&
                  moreSteps.map((s, i) => (
                    <StepRow key={s.id} step={s} index={i} reduce={!!reduce} dropdown />
                  ))}
              </AnimatePresence>
            </ul>

            {moreSteps.length > 0 && (
              <button
                type="button"
                onClick={() => setStepsExpanded((v) => !v)}
                aria-expanded={stepsExpanded}
                className="mt-2 w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-bold text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span>
                  {stepsExpanded ? "Show fewer steps" : `Show ${moreSteps.length} more steps`}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    stepsExpanded && "rotate-180",
                  )}
                />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function CoverageBar({ stats }: { stats: InviteStats }) {
  const total = Math.max(1, stats.total);
  const segments = [
    { label: "Linked", value: stats.active, tone: "hsl(142 55% 46%)" },
    {
      label: "Invited",
      value: Math.max(0, stats.invited - stats.active),
      tone: "hsl(38 92% 55%)",
    },
    { label: "Not invited", value: stats.pending, tone: "hsl(240 10% 80%)" },
  ];

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/50">
        {segments.map((s) => {
          if (s.value <= 0) return null;
          return (
            <span
              key={s.label}
              className="h-full"
              style={{
                flex: `${(s.value / total) * 100} 1 0`,
                background: s.tone,
              }}
              title={`${s.label}: ${s.value}`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.tone }} aria-hidden />
            <span className="font-semibold text-foreground/80">{s.label}</span>
            <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StepRow({
  step,
  index,
  reduce,
  dropdown = false,
}: {
  step: StepDef;
  index: number;
  reduce: boolean;
  dropdown?: boolean;
}) {
  const Icon = step.Icon;
  const done = step.status === "done";

  const triggerEvent = () => {
    if (step.action.kind !== "event") return;
    window.dispatchEvent(new CustomEvent(step.action.event));
  };

  return (
    <motion.li
      initial={
        reduce ? undefined : dropdown ? { height: 0, opacity: 0, marginTop: 0 } : { opacity: 0, y: 4 }
      }
      animate={
        dropdown ? { height: "auto", opacity: 1, marginTop: 8 } : { opacity: 1, y: 0 }
      }
      exit={dropdown ? (reduce ? { opacity: 0 } : { height: 0, opacity: 0, marginTop: 0 }) : undefined}
      transition={
        dropdown
          ? { duration: 0.32, ease: EASE }
          : { delay: 0.04 * index, duration: 0.3, ease: EASE }
      }
      className={cn(
        "rounded-xl border bg-background px-3.5 py-3 flex items-center gap-3 transition-colors",
        dropdown && "overflow-hidden",
        done ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-border",
      )}
    >
      <span
        className={cn(
          "h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0",
          done
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : step.status === "in-progress"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : "bg-muted/70 text-muted-foreground",
        )}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />
        ) : (
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        )}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "font-heading font-bold text-[13.5px] leading-tight",
              done && "text-muted-foreground",
            )}
          >
            {step.title}
          </span>
          {step.progress && (
            <span className="text-[10.5px] font-bold tabular-nums text-muted-foreground rounded-full border border-border px-1.5 py-0.5">
              {step.progress}
            </span>
          )}
        </div>
        <div className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">
          {step.description}
        </div>
      </div>

      {step.action.kind === "link" ? (
        <Button
          asChild
          size="sm"
          variant={done ? "outline" : "default"}
          className="h-8 rounded-lg px-3 text-[12px] font-bold gap-1 shrink-0"
        >
          <Link href={step.action.to}>
            {step.cta}
            {!done && <ArrowRight className="h-3.5 w-3.5" />}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant={done ? "outline" : "default"}
          onClick={triggerEvent}
          className="h-8 rounded-lg px-3 text-[12px] font-bold gap-1 shrink-0"
        >
          {step.cta}
          {!done && <ArrowRight className="h-3.5 w-3.5" />}
        </Button>
      )}
    </motion.li>
  );
}
