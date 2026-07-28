"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck2, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BEHAVIOR_CHECKIN_QUESTIONS, behaviorCheckInScore } from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function thisMonthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function MonthlyBehaviorCheckIn() {
  const reduce = useReducedMotion();
  const total = BEHAVIOR_CHECKIN_QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);
  const current = BEHAVIOR_CHECKIN_QUESTIONS[step];
  const allAnswered = answeredCount === total;

  const result = useMemo(() => behaviorCheckInScore(answers), [answers]);

  const select = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (step < total - 1) {
      setTimeout(() => setStep((s) => Math.min(total - 1, s + 1)), 180);
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setSubmitted(false);
  };

  const submit = () => setSubmitted(true);

  return (
    <section
      aria-label="Monthly behaviour check-in"
      className="premium-elevated rounded-[22px] p-6 md:p-7 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: submitted
            ? "radial-gradient(60% 50% at 0% 0%, hsl(142 60% 82% / 0.32), transparent 65%), radial-gradient(60% 50% at 100% 20%, hsl(196 70% 80% / 0.18), transparent 70%)"
            : "radial-gradient(60% 50% at 0% 0%, hsl(212 70% 80% / 0.30), transparent 65%), radial-gradient(60% 50% at 100% 20%, hsl(258 70% 80% / 0.20), transparent 70%)",
        }}
      />

      <div className="relative">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className={cn(
                "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border",
                submitted
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-600",
              )}
            >
              {submitted ? (
                <CalendarCheck2 className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="premium-eyebrow">
                <span>Monthly check-in · {thisMonthLabel()}</span>
              </div>
              <h2 className="mt-1 font-heading font-extrabold text-[20px] md:text-[22px] leading-tight">
                {submitted
                  ? "Thanks — submission saved for this month"
                  : "Capture this month's behaviour friction"}
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground max-w-xl">
                {submitted
                  ? "Your monthly read powers the trends and recommendations above. Come back next month to refresh."
                  : "6 quick MCQs — under a minute. Captures classroom-management friction that gameplay alone can't see."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
              {answeredCount} / {total} answered
            </span>
            <div className="h-1.5 w-32 rounded-full bg-muted/40 overflow-hidden">
              <motion.span
                initial={reduce ? undefined : { scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="block h-full origin-left rounded-full bg-primary"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="result"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="mt-6 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5"
            >
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4 flex flex-col justify-center">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Manageability score
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-heading font-black tabular-nums leading-none text-[44px] text-primary">
                    {result.pct}
                  </span>
                  <span className="text-[12px] font-bold text-muted-foreground/80">/100</span>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground leading-snug">
                  Higher means smoother classroom flow. We blend this with disruption signals to set
                  the behaviour control score.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Your answers
                </div>
                <ul className="mt-2 space-y-1.5">
                  {BEHAVIOR_CHECKIN_QUESTIONS.map((q) => {
                    const optId = answers[q.id];
                    const opt = q.options.find((o) => o.id === optId);
                    return (
                      <li key={q.id} className="flex items-start gap-2 text-[12px] leading-snug">
                        <Check className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <div className="text-muted-foreground">{q.prompt}</div>
                          <div className="font-semibold text-foreground/90">
                            {opt?.label ?? "—"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Edit answers
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`q-${current.id}`}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <span>
                  Question {step + 1} of {total}
                </span>
                <span className="opacity-50">·</span>
                <span>Single select</span>
              </div>
              <h3 className="mt-1.5 font-heading font-extrabold text-[16px] md:text-[18px] leading-snug">
                {current.prompt}
              </h3>
              {current.helper && (
                <p className="mt-1 text-[12px] text-muted-foreground">{current.helper}</p>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.options.map((opt) => {
                  const active = answers[current.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => select(current.id, opt.id)}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-[13px] font-semibold transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_14px_-6px_hsl(142_55%_35%/0.5)]"
                          : "bg-background hover:bg-muted/60 border-border text-foreground",
                      )}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={cn(
                          "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                          active
                            ? "border-primary-foreground/60 bg-primary-foreground/20"
                            : "border-border",
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>

                {step < total - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                    disabled={!answers[current.id]}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={submit}
                    disabled={!allAnswered}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Check className="h-4 w-4 mr-1" /> Submit check-in
                  </Button>
                )}
              </div>

              <ol className="mt-5 flex items-center gap-1.5 flex-wrap">
                {BEHAVIOR_CHECKIN_QUESTIONS.map((q, i) => {
                  const answered = !!answers[q.id];
                  const active = i === step;
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => setStep(i)}
                        aria-label={`Go to question ${i + 1}`}
                        className={cn(
                          "h-6 min-w-6 px-2 rounded-full text-[10.5px] font-bold inline-flex items-center justify-center transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : answered
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {answered && !active ? <Check className="h-3 w-3" /> : i + 1}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
