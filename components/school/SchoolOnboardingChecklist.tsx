"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  X,
  Users,
  ClipboardCheck,
  Bell,
  MessageCircle,
  CalendarClock,
  ArrowRight,
  Rocket,
} from "lucide-react";
import {
  dismissSchoolChecklist,
  getSchoolOnboarding,
  markSchoolTaskDone,
  schoolTasksCompletedCount,
  type SchoolActivationTaskId,
  type SchoolOnboardingState,
} from "@/lib/schoolOnboarding";
import { cn } from "@/lib/utils";

type TaskDef = {
  id: SchoolActivationTaskId;
  title: string;
  blurb: string;
  Icon: typeof Users;
  tone: string;
  cta: string;
  to: "/school/teachers" | "/school/reports" | "/school/settings";
};

const TASKS: TaskDef[] = [
  {
    id: "invite-teachers",
    title: "Invite your first 3 teachers",
    blurb: "Get them signed in and seeing their classrooms.",
    Icon: Users,
    tone: "hsl(260 55% 60%)",
    cta: "Open cohort",
    to: "/school/teachers",
  },
  {
    id: "review-digest",
    title: "Preview the monthly digest",
    blurb: "What you and staff get after each check-in cycle.",
    Icon: ClipboardCheck,
    tone: "hsl(200 60% 50%)",
    cta: "Open reports",
    to: "/school/reports",
  },
  {
    id: "set-thresholds",
    title: "Set school-wide alert thresholds",
    blurb: "When we should flag a student or class.",
    Icon: Bell,
    tone: "hsl(38 92% 50%)",
    cta: "Tune alerts",
    to: "/school/settings",
  },
  {
    id: "configure-parent-comms",
    title: "Configure parent communications",
    blurb: "Branding, cadence, opt-outs.",
    Icon: MessageCircle,
    tone: "hsl(142 55% 45%)",
    cta: "Configure",
    to: "/school/settings",
  },
  {
    id: "schedule-report",
    title: "Schedule the first all-staff report",
    blurb: "End-of-month PDF + Slack/email pulse.",
    Icon: CalendarClock,
    tone: "hsl(0 78% 58%)",
    cta: "Schedule",
    to: "/school/reports",
  },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function SchoolOnboardingChecklist() {
  const [state, setState] = useState<SchoolOnboardingState | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => setState(getSchoolOnboarding());
    refresh();
    window.addEventListener("ah-school-onboarding-change", refresh);
    return () => window.removeEventListener("ah-school-onboarding-change", refresh);
  }, []);

  const stats = useMemo(
    () => (state ? schoolTasksCompletedCount(state) : { done: 0, total: 5 }),
    [state],
  );
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const allDone = stats.done >= stats.total && stats.total > 0;

  if (!state) return null;
  if (state.checklistDismissed) return null;
  if (allDone) return <AllDone />;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative premium-elevated rounded-[22px] overflow-hidden"
      aria-label="Admin first-week checklist"
      data-tour-target="school-checklist"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(260_55%_60%)] via-[hsl(200_60%_50%)] to-[hsl(142_55%_45%)] opacity-90"
      />
      <div
        aria-hidden
        className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[hsl(260_55%_72%)]/30 blur-3xl pointer-events-none"
      />

      <header className="relative flex items-start gap-4 p-5 sm:p-6">
        <Ring pct={pct} done={stats.done} total={stats.total} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] uppercase text-[hsl(260_55%_60%)]">
            <Rocket className="h-3 w-3" />
            First week as admin
          </div>
          <h2 className="mt-1.5 font-heading font-extrabold text-[19px] sm:text-[21px] leading-tight tracking-tight">
            {stats.done === 0
              ? "5 quick wins to bring your school live"
              : `${stats.total - stats.done} more to fully activate the school`}
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            Each step takes under a minute. They unlock dashboards, reports, and parent flows for your staff.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="premium-icon-btn !h-8 !w-8"
            aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")} />
          </button>
          <button
            onClick={() => {
              dismissSchoolChecklist();
              setState((s) => (s ? { ...s, checklistDismissed: true } : s));
            }}
            className="premium-icon-btn !h-8 !w-8"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <ul className="grid gap-2 sm:grid-cols-2">
                {TASKS.map((t) => {
                  const done = !!state.tasks[t.id];
                  return (
                    <li key={t.id}>
                      <Link
                        href={t.to}
                        onClick={() => markSchoolTaskDone(t.id)}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                      >
                        <Task task={t} done={done} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Task({ task, done }: { task: TaskDef; done: boolean }) {
  const Icon = task.Icon;
  return (
    <div
      className={cn(
        "group relative w-full rounded-2xl border p-3.5 flex items-center gap-3 transition-all",
        done ? "border-primary/30 bg-primary/[0.05]" : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80",
      )}
    >
      <span
        className="relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={
          done
            ? undefined
            : { color: task.tone, background: `color-mix(in srgb, ${task.tone} 12%, transparent)` }
        }
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-heading font-bold text-[13.5px] truncate",
              done && "text-muted-foreground line-through decoration-2 decoration-primary/40",
            )}
          >
            {task.title}
          </span>
          {done && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
        </div>
        {!done && (
          <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">
            {task.blurb}
          </div>
        )}
      </div>
      {!done && (
        <span className="shrink-0 inline-flex items-center gap-1 text-[11.5px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          {task.cta}
          <ArrowRight className="h-3 w-3" />
        </span>
      )}
      {!done && <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:hidden" />}
    </div>
  );
}

function Ring({ pct, done, total }: { pct: number; done: number; total: number }) {
  const SIZE = 64;
  const STROKE = 5;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} role="img" aria-label={`${done} of ${total} done`}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="hsl(240 15% 90%)" strokeWidth={STROKE} fill="none" className="dark:stroke-[hsl(230_20%_25%)]" />
        <defs>
          <linearGradient id="school-cl-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(260 55% 60%)" />
            <stop offset="100%" stopColor="hsl(142 55% 45%)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#school-cl-ring)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ strokeDasharray: C }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading font-extrabold text-[15px] tabular-nums">
          {done}<span className="text-muted-foreground font-bold text-[11px]">/{total}</span>
        </span>
        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">done</span>
      </div>
    </div>
  );
}

function AllDone() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative premium-surface rounded-[22px] p-5 flex items-center gap-4 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(260_55%_60%)] via-[hsl(200_60%_50%)] to-[hsl(142_55%_45%)]"
      />
      <span className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.6)]">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-extrabold text-[15.5px]">School onboarding complete 🎉</div>
        <div className="text-[12.5px] text-muted-foreground mt-0.5">
          You're fully set up. We'll fade this away.
        </div>
      </div>
      <button
        onClick={() => {
          dismissSchoolChecklist();
          setHidden(true);
        }}
        className="text-[12px] font-semibold text-primary hover:text-primary/80"
      >
        Got it
      </button>
    </motion.div>
  );
}
