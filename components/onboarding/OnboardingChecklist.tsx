"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  X,
  ClipboardCheck,
  Sparkles,
  Command,
  MessageCircle,
  FileBarChart,
  ArrowRight,
  Rocket,
} from "lucide-react";
import {
  dismissChecklist,
  getOnboarding,
  markTaskDone,
  tasksCompletedCount,
  type ActivationTaskId,
  type OnboardingState,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type TaskDef = {
  id: ActivationTaskId;
  title: string;
  blurb: string;
  Icon: typeof Sparkles;
  tone: string;
  cta: string;
  action: { kind: "link"; to: string } | { kind: "event"; event: string } | { kind: "scroll"; target: string };
};

const TASKS: TaskDef[] = [
  {
    id: "first-checkin",
    title: "Run your first check-in",
    blurb: "60-second pulse on how the class feels right now.",
    Icon: ClipboardCheck,
    tone: "hsl(142 55% 45%)",
    cta: "Start check-in",
    action: { kind: "link", to: "/check-in" },
  },
  {
    id: "read-insight",
    title: "Read your first Yellow Insight",
    blurb: "We've already drafted one tuned to your goals.",
    Icon: Sparkles,
    tone: "hsl(260 55% 60%)",
    cta: "Show me",
    action: { kind: "scroll", target: "[data-tour-target='ai-suggestions']" },
  },
  {
    id: "command-palette",
    title: "Try the command palette",
    blurb: "Press ⌘K to jump anywhere in two keys.",
    Icon: Command,
    tone: "hsl(200 60% 50%)",
    cta: "Open ⌘K",
    action: { kind: "event", event: "ah-open-command-palette" },
  },
  {
    id: "parent-message",
    title: "Send a parent message",
    blurb: "One-tap update with growth highlights.",
    Icon: MessageCircle,
    tone: "hsl(38 92% 50%)",
    cta: "Pick a student",
    action: { kind: "link", to: "/students" },
  },
  {
    id: "first-report",
    title: "Preview a monthly report",
    blurb: "See what families and admins receive.",
    Icon: FileBarChart,
    tone: "hsl(0 78% 58%)",
    cta: "Open reports",
    action: { kind: "link", to: "/reports" },
  },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function OnboardingChecklist() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => setState(getOnboarding());
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

  const stats = useMemo(() => (state ? tasksCompletedCount(state) : { done: 0, total: 5 }), [state]);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const allDone = stats.done >= stats.total && stats.total > 0;

  if (!state) return null;
  if (state.checklistDismissed) return null;
  if (allDone) return <AllDoneToast />;

  const handleAction = (t: TaskDef) => {
    markTaskDone(t.id);
    if (t.action.kind === "event") {
      // Command palette listens for cmd-k key event
      if (t.action.event === "ah-open-command-palette") {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      } else {
        window.dispatchEvent(new CustomEvent(t.action.event));
      }
    } else if (t.action.kind === "scroll") {
      const el = document.querySelector(t.action.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-pulse");
        window.setTimeout(() => el.classList.remove("ring-pulse"), 2400);
      }
    }
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative premium-elevated rounded-[22px] overflow-hidden"
      aria-label="First-week checklist"
    >
      {/* Decorative gradient strip */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(142_55%_45%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_60%)] opacity-90"
      />
      {/* Decorative corner glow */}
      <div
        aria-hidden
        className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[hsl(142_60%_70%)]/30 blur-3xl pointer-events-none"
      />

      <header className="relative flex items-start gap-4 p-5 sm:p-6">
        <ProgressRing pct={pct} done={stats.done} total={stats.total} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] uppercase text-primary">
            <Rocket className="h-3 w-3" />
            First week with Yellow
          </div>
          <h2 className="mt-1.5 font-heading font-extrabold text-[19px] sm:text-[21px] leading-tight tracking-tight">
            {stats.done === 0
              ? "5 quick wins to make your classroom feel real"
              : `${stats.total - stats.done} more to unlock the full picture`}
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            Each step takes under a minute. They unlock dashboards, reports, and parent flows.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="premium-icon-btn !h-8 !w-8"
            aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
            aria-expanded={!collapsed}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", collapsed && "-rotate-90")}
            />
          </button>
          <button
            onClick={() => {
              dismissChecklist();
              setState((s) => (s ? { ...s, checklistDismissed: true } : s));
            }}
            className="premium-icon-btn !h-8 !w-8"
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
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
                      <TaskRow task={t} done={done} onAction={() => handleAction(t)} />
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex items-center justify-between text-[11.5px] text-muted-foreground">
                <span>You can come back to this anytime — it lives here until done.</span>
                <button
                  onClick={() => {
                    dismissChecklist();
                    setState((s) => (s ? { ...s, checklistDismissed: true } : s));
                  }}
                  className="font-semibold text-foreground/70 hover:text-foreground"
                >
                  Hide for now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function TaskRow({
  task,
  done,
  onAction,
}: {
  task: TaskDef;
  done: boolean;
  onAction: () => void;
}) {
  const Icon = task.Icon;
  const inner = (
    <div
      className={cn(
        "group relative w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-all",
        done
          ? "border-primary/30 bg-primary/[0.05]"
          : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80",
      )}
    >
      <span
        className={cn(
          "relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          done ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground",
        )}
        style={done ? undefined : { color: task.tone, background: `color-mix(in srgb, ${task.tone} 12%, transparent)` }}
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
          {done && (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          )}
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
      {!done && (
        <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:hidden" />
      )}
    </div>
  );

  if (task.action.kind === "link") {
    return (
      <Link
        href={task.action.to}
        onClick={onAction}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
        aria-label={`${task.title}${done ? " · completed" : ""}`}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onAction}
      className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
      aria-label={`${task.title}${done ? " · completed" : ""}`}
    >
      {inner}
    </button>
  );
}

function ProgressRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const SIZE = 64;
  const STROKE = 5;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      aria-label={`${done} of ${total} steps complete`}
      role="img"
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="hsl(240 15% 90%)"
          strokeWidth={STROKE}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(142 55% 45%)" />
            <stop offset="60%" stopColor="hsl(200 60% 50%)" />
            <stop offset="100%" stopColor="hsl(260 55% 60%)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#ring-grad)"
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
          {done}
          <span className="text-muted-foreground font-bold text-[11px]">/{total}</span>
        </span>
        <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">
          done
        </span>
      </div>
    </div>
  );
}

function AllDoneToast() {
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
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[hsl(142_55%_45%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_60%)]"
      />
      <span className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.6)]">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-extrabold text-[15.5px]">You've finished onboarding 🎉</div>
        <div className="text-[12.5px] text-muted-foreground mt-0.5">
          Yellow is fully active. We'll fade this away.
        </div>
      </div>
      <button
        onClick={() => {
          dismissChecklist();
          setHidden(true);
        }}
        className="text-[12px] font-semibold text-primary hover:text-primary/80"
      >
        Got it
      </button>
    </motion.div>
  );
}
