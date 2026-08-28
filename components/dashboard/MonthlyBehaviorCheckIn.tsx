"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  Bell,
  Check,
  CalendarCheck2,
  ClipboardList,
  Clock,
  Eye,
  Footprints,
  Info,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { BEHAVIOR_CHECKIN_QUESTIONS, QUICK_PULSE_OPTIONS, type QuickPulseRating } from "@/lib/classBehavior";
import { getTodayPulse, logTodayPulse } from "@/lib/dailyClassPulse";
import {
  getLatestBehaviorCheckIn,
  saveBehaviorCheckIn,
  thisMonthLabel,
} from "@/lib/behaviorCheckInStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const QUESTION_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "mgmt-time": { icon: Clock, tone: "hsl(210 80% 55%)" },
  transitions: { icon: ArrowLeftRight, tone: "hsl(142 55% 42%)" },
  disruptions: { icon: Bell, tone: "hsl(340 75% 55%)" },
  repetitions: { icon: RefreshCw, tone: "hsl(190 70% 42%)" },
  challenge: { icon: Users, tone: "hsl(258 60% 55%)" },
};

const CHALLENGE_OPTION_ICON: Record<string, LucideIcon> = {
  talking: MessageSquare,
  restlessness: Footprints,
  "not-following": ClipboardList,
  "losing-focus": Eye,
  transitions: ArrowLeftRight,
};

function QuickPulsePanel() {
  const [rating, setRating] = useState<QuickPulseRating | undefined>(() => getTodayPulse()?.rating);

  const select = (r: QuickPulseRating) => {
    logTodayPulse(r);
    setRating(r);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col h-full">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-full bg-primary/12 text-primary inline-flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.06em]">Quick Pulse</div>
          <div className="text-[10px] text-muted-foreground">(Optional daily check-in)</div>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] font-semibold text-foreground/85 leading-snug">
        &ldquo;How manageable was the class today?&rdquo;
      </p>

      <div className="mt-3 space-y-2">
        {QUICK_PULSE_OPTIONS.map((opt) => {
          const active = rating === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt.id)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active ? "border-transparent" : "border-border/60 hover:bg-muted/40",
              )}
              style={
                active
                  ? { background: `color-mix(in srgb, ${opt.tone} 12%, transparent)`, borderColor: opt.tone }
                  : undefined
              }
            >
              <span
                className="h-7 w-7 rounded-full inline-flex items-center justify-center text-[14px] shrink-0"
                style={{ background: `color-mix(in srgb, ${opt.tone} 16%, transparent)` }}
              >
                {opt.id === "smooth" ? "🙂" : opt.id === "manageable" ? "😐" : "🙁"}
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold text-foreground">{opt.label}</span>
                <span className="block text-[11px] text-muted-foreground leading-snug">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex items-start gap-2 text-[11px] text-muted-foreground leading-snug">
        <CalendarCheck2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Your daily pulse helps us track trends and provide better insights.
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  value,
  onSelect,
}: {
  question: (typeof BEHAVIOR_CHECKIN_QUESTIONS)[number];
  value?: string;
  onSelect: (optionId: string) => void;
}) {
  const meta = QUESTION_META[question.id];
  const Icon = meta?.icon ?? Info;

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold leading-snug">{question.prompt}</p>
        <span
          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${meta?.tone ?? "hsl(210 15% 60%)"} 14%, transparent)`,
            color: meta?.tone,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {question.options.map((opt) => {
          const active = value === opt.id;
          const OptIcon = question.id === "challenge" ? CHALLENGE_OPTION_ICON[opt.id] : undefined;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] font-semibold transition-colors",
                active ? "text-foreground" : "text-foreground/80 hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                  active ? "border-primary bg-primary" : "border-border",
                )}
              >
                {active && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
              </span>
              {OptIcon && <OptIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {question.helper && (
        <div
          className="mt-3 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[11px] leading-snug text-foreground/70"
          style={{ background: `color-mix(in srgb, ${meta?.tone ?? "hsl(210 15% 60%)"} 8%, transparent)` }}
        >
          <Info className="h-3 w-3 shrink-0 mt-0.5" style={{ color: meta?.tone }} />
          {question.helper}
        </div>
      )}
    </div>
  );
}

export function MonthlyBehaviorCheckIn() {
  const reduce = useReducedMotion();
  const [{ answers, submittedMonth }, setState] = useState(() => {
    const latest = getLatestBehaviorCheckIn();
    const isCurrent = !!latest && latest.month === thisMonthLabel();
    return {
      answers: isCurrent ? latest!.answers : ({} as Record<string, string>),
      submittedMonth: isCurrent ? latest!.month : (null as string | null),
    };
  });

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === BEHAVIOR_CHECKIN_QUESTIONS.length;

  const select = (questionId: string, optionId: string) => {
    setState((prev) => ({ answers: { ...prev.answers, [questionId]: optionId }, submittedMonth: null }));
  };

  const submit = () => {
    const record = saveBehaviorCheckIn(answers);
    setState({ answers, submittedMonth: record.month });
    toast("Check-in saved", { description: `Thanks — your read for ${record.month} is saved.` });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        aria-label="Monthly check-in: behaviour friction"
        className="rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        <header>
          <div className="flex items-center gap-1.5">
            <h2 className="font-heading font-extrabold text-[18px] uppercase tracking-wide">
              Monthly Check-in: Behavior Friction
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="More info"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
                Collected monthly to power the behaviour trends and recommendations on this page.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Track instructional time, transition efficiency, and disruptions to understand behavior friction.
          </p>
        </header>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-4">
          <QuickPulsePanel />

          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-2">
                <CalendarCheck2 className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold">Monthly Check-in</div>
                  <p className="text-[11.5px] text-muted-foreground">
                    Please reflect on your typical class over the past month.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 h-8 text-[11px] font-bold text-muted-foreground shrink-0">
                <CalendarCheck2 className="h-3.5 w-3.5" />
                Due: End of Month
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {BEHAVIOR_CHECKIN_QUESTIONS.map((q) => (
                <QuestionCard key={q.id} question={q} value={answers[q.id]} onSelect={(id) => select(q.id, id)} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {answeredCount} / {BEHAVIOR_CHECKIN_QUESTIONS.length} answered
              </span>
              {submittedMonth ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary">
                  <Check className="h-3.5 w-3.5" />
                  Saved for {submittedMonth}
                </span>
              ) : (
                <Button size="sm" onClick={submit} disabled={!allAnswered}>
                  <Check className="h-4 w-4 mr-1" /> Submit check-in
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/60 bg-primary/5 p-4 flex items-start gap-3">
          <span className="h-8 w-8 rounded-full bg-primary/12 text-primary inline-flex items-center justify-center shrink-0">
            <Star className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-bold text-foreground">Why this matters</div>
            <p className="text-[12px] text-muted-foreground leading-snug">
              Your inputs help us identify patterns, reduce friction, and share practical strategies that save
              time and improve classroom experience.
            </p>
          </div>
        </div>
      </motion.section>
    </TooltipProvider>
  );
}
