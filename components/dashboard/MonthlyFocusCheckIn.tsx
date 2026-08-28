"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  Clock,
  FileText,
  Info,
  Lightbulb,
  Megaphone,
  Presentation,
  TrendingUp,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  TEACHING_MIN_BUCKETS,
  LOST_MIN_BUCKETS,
  COUNT_BUCKETS,
  type TeachingMinBucket,
  type LostMinBucket,
  type CountBucket,
} from "@/data/mockData";
import {
  getLatestMonthlyCheckIn,
  hasSubmittedThisMonth,
  saveMonthlyCheckIn,
  thisMonthLabel,
} from "@/lib/monthlyClassroomCheckIn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 42%)";
const RED = "hsl(8 78% 56%)";
const BLUE = "hsl(212 90% 55%)";
const PURPLE = "hsl(258 60% 58%)";
const AMBER = "hsl(38 92% 50%)";

type QuestionId = "teachingMins" | "behaviourMins" | "transitionMins" | "disruptions" | "repetitions";

type Question<TBucket extends string> = {
  id: QuestionId;
  Icon: LucideIcon;
  tone: string;
  prompt: string;
  helper?: string;
  options: readonly TBucket[];
};

const QUESTIONS: [
  Question<TeachingMinBucket>,
  Question<LostMinBucket>,
  Question<LostMinBucket>,
  Question<CountBucket>,
  Question<CountBucket>,
] = [
  {
    id: "teachingMins",
    Icon: Presentation,
    tone: GREEN,
    prompt: "How many minutes are effectively spent in teaching per class?",
    options: TEACHING_MIN_BUCKETS,
  },
  {
    id: "behaviourMins",
    Icon: UserX,
    tone: RED,
    prompt: "How many minutes are lost in managing behavioural issues per class?",
    options: LOST_MIN_BUCKETS,
  },
  {
    id: "transitionMins",
    Icon: Clock,
    tone: BLUE,
    prompt: "How many minutes are lost in transitioning between activities?",
    options: LOST_MIN_BUCKETS,
  },
  {
    id: "disruptions",
    Icon: Megaphone,
    tone: PURPLE,
    prompt: "Number of disruptive incidents occurring per class",
    helper: "e.g., talking out of turn, moving around, engaging in a different task etc.",
    options: COUNT_BUCKETS,
  },
  {
    id: "repetitions",
    Icon: FileText,
    tone: AMBER,
    prompt: "Number of times instructions have to be repeated in class",
    options: COUNT_BUCKETS,
  },
];

type Answers = Partial<Record<QuestionId, string>>;

/** Component 3 of the Attention & Focus detail page's 5-part structure —
 * a monthly, MCQ-only pulse of aggregate classroom friction (not per-student
 * ratings), feeding the same teachingMins/behaviourMins/transitionMins/
 * disruptions/repetitions signals the rest of the app already models. */
export function MonthlyFocusCheckIn() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(() => hasSubmittedThisMonth());

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const latest = getLatestMonthlyCheckIn();

  const select = (id: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const save = () => {
    if (!allAnswered) return;
    saveMonthlyCheckIn({
      teachingMins: answers.teachingMins as TeachingMinBucket,
      behaviourMins: answers.behaviourMins as LostMinBucket,
      transitionMins: answers.transitionMins as LostMinBucket,
      disruptions: answers.disruptions as CountBucket,
      repetitions: answers.repetitions as CountBucket,
    });
    setSubmitted(true);
    toast.success(`Check-in saved for ${thisMonthLabel()}.`);
  };

  const editAnswers = () => {
    setAnswers(
      latest
        ? {
            teachingMins: latest.teachingMins,
            behaviourMins: latest.behaviourMins,
            transitionMins: latest.transitionMins,
            disruptions: latest.disruptions,
            repetitions: latest.repetitions,
          }
        : {},
    );
    setSubmitted(false);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Monthly check-in"
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="relative overflow-hidden px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 flex-wrap">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "color-mix(in srgb, hsl(38 92% 60%) 8%, transparent)" }}
          />
          <div className="relative flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-extrabold text-[17px]">3. Monthly Check-In</h2>
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
                  <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                    A short monthly pulse on classroom friction — separate from your per-student
                    check-ins.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Help us understand your classroom better. Takes 2–3 minutes.
              </p>
            </div>
          </div>

          <div className="relative flex items-start gap-2.5 rounded-xl bg-background/60 border border-border/60 px-3.5 py-2.5 max-w-sm">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-muted-foreground leading-snug">
              Your input helps us provide better insights and recommendations.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="submitted"
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="px-5 pb-5 md:px-6 md:pb-6"
            >
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold">
                      Thanks — {thisMonthLabel()} check-in saved
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      Your monthly read powers the insights above. Come back next month to refresh.
                    </p>
                  </div>
                </div>
                <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {QUESTIONS.map((q) => (
                    <li key={q.id} className="flex items-start gap-2 text-[12px] leading-snug">
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: q.tone }} />
                      <div className="min-w-0">
                        <span className="text-muted-foreground">{q.prompt.split("?")[0]}: </span>
                        <span className="font-semibold text-foreground/90">{latest?.[q.id]}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={editAnswers}
                    className="text-[12px] font-bold text-primary hover:underline"
                  >
                    Edit answers
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="px-5 pb-5 md:px-6 md:pb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[13.5px] font-bold leading-tight">
                    Classroom Overview – This Month
                  </div>
                  <div className="text-[11.5px] text-muted-foreground leading-snug">
                    Please answer based on your typical class.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {QUESTIONS.map((q, i) => (
                  <QuestionRow
                    key={q.id}
                    index={i + 1}
                    question={q}
                    value={answers[q.id]}
                    onSelect={(v) => select(q.id, v)}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-[11.5px] text-muted-foreground leading-snug">
                    This check-in helps us track changes over time and tailor support for your class.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSubmitted(true)}
                    className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!allAnswered}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 h-10 text-[13px] font-bold disabled:opacity-45 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Save Check-In
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </TooltipProvider>
  );
}

function QuestionRow<TBucket extends string>({
  index,
  question,
  value,
  onSelect,
}: {
  index: number;
  question: Question<TBucket>;
  value: string | undefined;
  onSelect: (v: TBucket) => void;
}) {
  const { Icon, tone } = question;
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4">
      <div className="flex items-start gap-3 md:w-[300px] shrink-0">
        <span
          className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-snug">
            {index}. {question.prompt}
          </p>
          {question.helper && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              ({question.helper})
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        {question.options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 h-9 text-[12.5px] font-bold transition-colors",
                active ? "bg-background" : "border-border text-foreground hover:bg-muted/50",
              )}
              style={
                active
                  ? { borderColor: tone, color: tone, background: `color-mix(in srgb, ${tone} 8%, transparent)` }
                  : undefined
              }
            >
              {opt}
              <span
                className="h-4 w-4 rounded-full border inline-flex items-center justify-center shrink-0"
                style={
                  active
                    ? { background: tone, borderColor: tone }
                    : { borderColor: "var(--border)" }
                }
              >
                {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
