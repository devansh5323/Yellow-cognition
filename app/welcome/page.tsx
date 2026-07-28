"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Users,
  Heart,
  Brain,
  MessageCircle,
  TrendingUp,
  Smile,
  ShieldCheck,
  PartyPopper,
  Zap,
  Eye,
  ChevronRight,
} from "lucide-react";
import { getSession, type TeacherSession } from "@/lib/auth";
import {
  completeOnboarding,
  getOnboarding,
  setOnboarding,
  type OnboardingGoal,
  type RosterMethod,
} from "@/lib/onboarding";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { RosterPicker, rosterMethodLabel } from "@/components/onboarding/RosterPicker";
import { cn } from "@/lib/utils";

export default function Page() {
  return <WelcomePage />;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GRADES = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SUBJECTS = [
  "Math",
  "ELA",
  "Science",
  "Social Studies",
  "Art",
  "Music",
  "PE",
  "Technology",
  "Language",
  "SEL",
];

const GOAL_OPTIONS: { id: OnboardingGoal; label: string; sub: string; Icon: typeof Brain; tone: string }[] = [
  { id: "focus", label: "Improve focus", sub: "Sustain attention through the day", Icon: Brain, tone: "hsl(142 55% 45%)" },
  { id: "at-risk", label: "Catch at-risk early", sub: "Spot dips before they spiral", Icon: ShieldCheck, tone: "hsl(0 78% 58%)" },
  { id: "parents", label: "Loop parents in", sub: "Light, regular communication", Icon: MessageCircle, tone: "hsl(260 55% 60%)" },
  { id: "growth", label: "Track growth", sub: "Celebrate monthly progress", Icon: TrendingUp, tone: "hsl(200 60% 50%)" },
  { id: "behavior", label: "Smoother classroom", sub: "Reduce friction & disruption", Icon: Zap, tone: "hsl(38 92% 50%)" },
  { id: "wellbeing", label: "Student wellbeing", sub: "Notice mood, not just metrics", Icon: Smile, tone: "hsl(340 70% 60%)" },
];

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "About you" },
  { id: "class", label: "Your class" },
  { id: "roster", label: "Students" },
  { id: "goals", label: "Goals" },
  { id: "reveal", label: "First insight" },
  { id: "ready", label: "Ready" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function WelcomePage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [session, setSessionState] = useState<TeacherSession | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Form state — initialized from any partial onboarding progress
  const initial = useMemo(() => getOnboarding(), []);
  const [fullName, setFullName] = useState(initial.profile?.fullName ?? "");
  const [schoolName, setSchoolName] = useState(initial.profile?.schoolName ?? "");
  const [years, setYears] = useState<number>(initial.profile?.yearsTeaching ?? 3);
  const [grades, setGrades] = useState<string[]>(initial.profile?.gradeLevels ?? ["3"]);
  const [subjects, setSubjects] = useState<string[]>(initial.profile?.subjects ?? ["Math", "ELA"]);

  const [className, setClassName] = useState(initial.primaryClass?.name ?? "");
  const [period, setPeriod] = useState(initial.primaryClass?.period ?? "Morning · 8:30–9:20");
  const [classSize, setClassSize] = useState<number>(initial.primaryClass?.size ?? 24);
  const [rosterMethod, setRosterMethod] = useState<RosterMethod | null>(initial.primaryClass?.rosterMethod ?? null);

  const [goals, setGoals] = useState<OnboardingGoal[]>(initial.goals ?? []);

  // Grab session and seed name
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/");
      return;
    }
    setSessionState(s);
    if (!fullName) setFullName(s.name);
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = STEPS[stepIdx];
  const totalSteps = STEPS.length;

  const goNext = () => {
    setDirection(1);
    persistDraft();
    setStepIdx((i) => Math.min(i + 1, totalSteps - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  const persistDraft = () => {
    setOnboarding({
      profile: {
        fullName: fullName.trim() || (session?.name ?? "Teacher"),
        schoolName: schoolName.trim(),
        yearsTeaching: years,
        gradeLevels: grades,
        subjects,
      },
      primaryClass: {
        name: className.trim() || (grades[0] ? `Grade ${grades[0]} · Class A` : "My class"),
        period,
        size: classSize,
        rosterMethod: rosterMethod ?? "sample",
        rosterReady: rosterMethod !== null,
      },
      goals,
    });
  };

  const finish = () => {
    persistDraft();
    completeOnboarding();
    router.push("/dashboard");
  };

  // Validation per step
  const canAdvance = (() => {
    switch (step.id) {
      case "profile":
        return fullName.trim().length >= 2 && grades.length > 0;
      case "class":
        return className.trim().length >= 2;
      case "roster":
        return rosterMethod !== null;
      case "goals":
        return true;
      default:
        return true;
    }
  })();

  const toggle = <T,>(arr: T[], v: T, max?: number): T[] => {
    if (arr.includes(v)) return arr.filter((x) => x !== v);
    if (max && arr.length >= max) return arr;
    return [...arr, v];
  };

  // Auto-advance from cinematic reveal
  useEffect(() => {
    if (step.id !== "reveal") return;
    const t = window.setTimeout(() => {
      setDirection(1);
      setStepIdx((i) => i + 1);
    }, 6800);
    return () => window.clearTimeout(t);
  }, [step.id]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ───── Ambient aurora — continues from /login ───── */}
      <div className="pointer-events-none absolute inset-0 auth-aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-grid-mask opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-noise opacity-[0.10] mix-blend-overlay" aria-hidden />

      {/* Drifting orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="orb"
          style={{
            width: 540,
            height: 540,
            top: "-12%",
            left: "-8%",
            background: "radial-gradient(circle at 30% 30%, hsl(142 70% 70% / 0.45), transparent 60%)",
          }}
        />
        <div
          className="orb orb--b"
          style={{
            width: 480,
            height: 480,
            top: "10%",
            right: "-10%",
            background: "radial-gradient(circle at 60% 40%, hsl(260 80% 78% / 0.45), transparent 60%)",
          }}
        />
        <div
          className="orb orb--c"
          style={{
            width: 560,
            height: 560,
            bottom: "-22%",
            left: "30%",
            background: "radial-gradient(circle at 50% 50%, hsl(200 80% 78% / 0.40), transparent 60%)",
          }}
        />
      </div>

      {/* ───── Top bar ───── */}
      <div className="relative z-20">
        <header className="flex items-center justify-between px-6 lg:px-10 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(142_60%_56%)] to-[hsl(142_55%_40%)] text-white flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.6)]">
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[15px] tracking-tight">Yellow</div>
              <div className="font-heading font-extrabold text-[12px] text-muted-foreground -mt-0.5 tracking-tight">Cognition</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ProgressTrack stepIdx={stepIdx} total={totalSteps} />
            <button
              onClick={finish}
              className="hidden sm:inline-flex text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip setup
            </button>
          </div>
        </header>
      </div>

      {/* ───── Main canvas ───── */}
      <main className="relative z-10 mx-auto w-full max-w-[1180px] px-6 lg:px-10 pt-10 pb-14 min-h-[calc(100vh-90px)] flex items-center">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 40, filter: "blur(8px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -direction * 40, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="w-full"
          >
            {step.id === "welcome" && (
              <StepWelcome session={session} onBegin={goNext} />
            )}
            {step.id === "profile" && (
              <StepShell
                title="Tell us about you"
                subtitle="So we can shape Yellow around your classroom."
                preview={
                  <PreviewCard
                    name={fullName || session?.name || "Teacher"}
                    school={schoolName}
                    grades={grades}
                    subjects={subjects}
                    className=""
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
              >
                <StepProfile
                  fullName={fullName}
                  setFullName={setFullName}
                  schoolName={schoolName}
                  setSchoolName={setSchoolName}
                  years={years}
                  setYears={setYears}
                  grades={grades}
                  setGrades={(g) => setGrades(g)}
                  subjects={subjects}
                  setSubjects={(s) => setSubjects(s)}
                  toggle={toggle}
                />
              </StepShell>
            )}
            {step.id === "class" && (
              <StepShell
                title="Set up your first class"
                subtitle="You can add more classes anytime — we'll start with this one."
                preview={
                  <PreviewCard
                    name={fullName || session?.name || "Teacher"}
                    school={schoolName}
                    grades={grades}
                    subjects={subjects}
                    className={className}
                    period={period}
                    classSize={classSize}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
              >
                <StepClass
                  className={className}
                  setClassName={setClassName}
                  period={period}
                  setPeriod={setPeriod}
                  size={classSize}
                  setSize={setClassSize}
                  defaultGrade={grades[0]}
                />
              </StepShell>
            )}
            {step.id === "roster" && (
              <StepShell
                title="Bring your students in"
                subtitle="Pick whatever's easiest — you can change it later."
                preview={
                  <PreviewCard
                    name={fullName || session?.name || "Teacher"}
                    school={schoolName}
                    grades={grades}
                    subjects={subjects}
                    className={className}
                    period={period}
                    classSize={classSize}
                    rosterMethod={rosterMethod ?? undefined}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
                nextLabel={rosterMethod === "sample" ? "Use sample class" : "Continue"}
              >
                <RosterPicker value={rosterMethod} onChange={setRosterMethod} />
              </StepShell>
            )}
            {step.id === "goals" && (
              <StepShell
                title="What matters most this term?"
                subtitle="Pick up to three. We'll surface insights tuned to these."
                preview={
                  <PreviewCard
                    name={fullName || session?.name || "Teacher"}
                    school={schoolName}
                    grades={grades}
                    subjects={subjects}
                    className={className}
                    period={period}
                    classSize={classSize}
                    rosterMethod={rosterMethod ?? undefined}
                    goals={goals}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
                nextLabel="Show me my classroom"
              >
                <StepGoals goals={goals} setGoals={(g) => setGoals(g)} toggle={toggle} />
              </StepShell>
            )}
            {step.id === "reveal" && (
              <StepReveal
                goals={goals}
                className={className}
                grades={grades}
                onSkip={() => {
                  setDirection(1);
                  setStepIdx((i) => i + 1);
                }}
              />
            )}
            {step.id === "ready" && (
              <StepReady
                fullName={fullName || session?.name || "Teacher"}
                className={className}
                rosterMethod={rosterMethod ?? "sample"}
                size={classSize}
                onFinish={finish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Progress track at the top
 * ───────────────────────────────────────────────────────── */
function ProgressTrack({ stepIdx, total }: { stepIdx: number; total: number }) {
  return (
    <div className="hidden md:flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[5px] rounded-full transition-all duration-500",
            i < stepIdx
              ? "bg-primary w-5"
              : i === stepIdx
              ? "bg-gradient-to-r from-primary via-[hsl(200_60%_50%)] to-[hsl(260_55%_60%)] w-12"
              : "bg-border w-3",
          )}
        />
      ))}
      <span className="ml-3 text-[11px] font-semibold text-muted-foreground tabular-nums">
        {stepIdx + 1} / {total}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Generic split-layout shell for form steps
 * ───────────────────────────────────────────────────────── */
function StepShell({
  title,
  subtitle,
  children,
  preview,
  onBack,
  onNext,
  canAdvance,
  nextLabel,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  preview: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 xl:gap-12 items-stretch">
      {/* Left — content */}
      <div className="relative">
        <div className="relative auth-card rounded-[24px] p-7 sm:p-9">
          <span className="auth-card-ring rounded-[24px]" aria-hidden />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-heading font-extrabold text-[26px] sm:text-[30px] leading-tight tracking-tight">
                  {title}
                </h1>
                <p className="mt-2 text-[14px] text-muted-foreground max-w-md leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="mt-7">{children}</div>

            <div className="mt-9 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canAdvance}
                className="cta-premium !h-12 !w-auto px-6 disabled:cursor-not-allowed"
              >
                <span className="sheen" aria-hidden />
                <span className="inline-flex items-center gap-1.5">
                  {nextLabel ?? "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right — live preview */}
      <div className="relative hidden lg:block">
        <div className="sticky top-24">
          <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-3 ml-1 inline-flex items-center gap-1.5">
            <Eye className="h-3 w-3" /> Live preview
          </div>
          {preview}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 0 — Welcome
 * ───────────────────────────────────────────────────────── */
function StepWelcome({
  session,
  onBegin,
}: {
  session: TeacherSession | null;
  onBegin: () => void;
}) {
  const firstName = (session?.name ?? "Teacher").split(" ")[0];
  return (
    <div className="text-center max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 backdrop-blur px-3 py-1.5 text-[11px] text-muted-foreground"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Welcome to Yellow</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="mt-6 font-heading font-extrabold text-[42px] sm:text-[58px] leading-[1.04] tracking-tight"
      >
        Hello, {firstName}.
        <br />
        <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
          Let's set up your classroom.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        className="mt-6 text-[15.5px] sm:text-[16.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        About 90 seconds of light setup, then a classroom that already understands what
        you care about most.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        className="mt-10 grid grid-cols-3 max-w-md mx-auto gap-3"
      >
        {[
          { k: "90s", v: "Quick setup" },
          { k: "8", v: "Domains tracked" },
          { k: "0", v: "Spreadsheets" },
        ].map((s) => (
          <div
            key={s.v}
            className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5 text-center overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10" />
            <div className="font-heading font-extrabold text-[24px] leading-none">{s.k}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        className="mt-10 flex items-center justify-center gap-3"
      >
        <button onClick={onBegin} className="cta-premium !h-13 !w-auto px-8">
          <span className="sheen" aria-hidden />
          <span className="inline-flex items-center gap-2">
            Begin setup
            <ArrowRight className="h-[18px] w-[18px]" />
          </span>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-6 text-[11.5px] text-muted-foreground/80"
      >
        3,847 teachers got started this month · You can skip anything and come back later.
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 1 — Profile
 * ───────────────────────────────────────────────────────── */
function StepProfile({
  fullName,
  setFullName,
  schoolName,
  setSchoolName,
  years,
  setYears,
  grades,
  setGrades,
  subjects,
  setSubjects,
  toggle,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  schoolName: string;
  setSchoolName: (v: string) => void;
  years: number;
  setYears: (n: number) => void;
  grades: string[];
  setGrades: (v: string[]) => void;
  subjects: string[];
  setSubjects: (v: string[]) => void;
  toggle: <T,>(arr: T[], v: T, max?: number) => T[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maya Khan"
            autoFocus
          />
        </Field>
        <Field label="School">
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Lincoln Elementary"
          />
        </Field>
      </div>

      <div>
        <Eyebrow>Grades you teach</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {GRADES.map((g) => {
            const active = grades.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGrades(toggle(grades, g))}
                data-active={active}
                className="premium-pill !px-3 !h-9 !text-[12.5px]"
                aria-pressed={active}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Eyebrow>Subjects</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS.map((s) => {
            const active = subjects.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubjects(toggle(subjects, s))}
                data-active={active}
                className="premium-pill !px-3 !h-9 !text-[12.5px]"
                aria-pressed={active}
              >
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Eyebrow>Years teaching</Eyebrow>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={30}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value, 10))}
            className="ah-range flex-1 accent-primary"
          />
          <div className="font-heading font-extrabold text-[20px] tabular-nums w-14 text-right">
            {years}
            <span className="text-[12px] text-muted-foreground font-bold ml-0.5">
              {years === 1 ? "yr" : "yrs"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 2 — Class
 * ───────────────────────────────────────────────────────── */
const PERIOD_PRESETS = [
  "Morning · 8:30–9:20",
  "Morning · 9:30–10:20",
  "Late morning · 10:30–11:20",
  "Afternoon · 12:30–1:20",
  "Afternoon · 1:30–2:20",
  "Evening · 2:30–3:20",
];

function StepClass({
  className,
  setClassName,
  period,
  setPeriod,
  size,
  setSize,
  defaultGrade,
}: {
  className: string;
  setClassName: (v: string) => void;
  period: string;
  setPeriod: (v: string) => void;
  size: number;
  setSize: (n: number) => void;
  defaultGrade?: string;
}) {
  const placeholder = defaultGrade ? `Grade ${defaultGrade} · Section A` : "Grade 3 · Section A";
  return (
    <div className="space-y-6">
      <Field label="Class name">
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      </Field>

      <div>
        <Eyebrow>When does this class meet?</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_PRESETS.map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                data-active={active}
                className="premium-pill !px-3 !h-9 !text-[12px]"
                aria-pressed={active}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Eyebrow>How many students?</Eyebrow>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={4}
            max={45}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className="ah-range flex-1 accent-primary"
          />
          <div className="font-heading font-extrabold text-[20px] tabular-nums w-16 text-right">
            {size}
            <span className="text-[12px] text-muted-foreground font-bold ml-0.5">kids</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>Average class size in your district is around 22–28.</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 4 — Goals
 * ───────────────────────────────────────────────────────── */
function StepGoals({
  goals,
  setGoals,
  toggle,
}: {
  goals: OnboardingGoal[];
  setGoals: (g: OnboardingGoal[]) => void;
  toggle: <T,>(arr: T[], v: T, max?: number) => T[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {GOAL_OPTIONS.map((g) => {
        const Icon = g.Icon;
        const active = goals.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => setGoals(toggle(goals, g.id, 3))}
            className={cn(
              "group relative text-left rounded-2xl border p-3.5 flex items-start gap-3 transition-all overflow-hidden",
              active
                ? "border-primary/60 bg-primary/[0.06]"
                : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80",
            )}
            aria-pressed={active}
            disabled={!active && goals.length >= 3}
          >
            {active && (
              <span
                className="absolute inset-x-0 top-0 h-[2px] opacity-80"
                style={{ background: `linear-gradient(90deg, transparent, ${g.tone}, transparent)` }}
                aria-hidden
              />
            )}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${g.tone} 14%, transparent)`,
                color: g.tone,
              }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-[14px] leading-snug">{g.label}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{g.sub}</div>
            </div>
            <span
              className={cn(
                "shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-all mt-0.5",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-transparent",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          </button>
        );
      })}
      <div className="sm:col-span-2 mt-1 text-[11.5px] text-muted-foreground flex items-center gap-1.5">
        <Heart className="h-3 w-3 text-primary" />
        <span>{goals.length}/3 selected · we'll tune your dashboard around these.</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 5 — Cinematic first-insight reveal
 * ───────────────────────────────────────────────────────── */
function StepReveal({
  goals,
  className,
  grades,
  onSkip,
}: {
  goals: OnboardingGoal[];
  className: string;
  grades: string[];
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase(1), 900));
    timers.push(window.setTimeout(() => setPhase(2), 1900));
    timers.push(window.setTimeout(() => setPhase(3), 3000));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const goalLabels = goals
    .map((g) => GOAL_OPTIONS.find((o) => o.id === g)?.label.toLowerCase())
    .filter(Boolean) as string[];

  const insightLine =
    goals.includes("at-risk")
      ? "Two students in the morning block dipped this month — worth a quick chat before lunch."
      : goals.includes("focus")
      ? "Your class focus peaks 10–11 am. That's the right window for new concepts."
      : goals.includes("parents")
      ? "Three parents haven't heard from you yet — a short monthly update would land well."
      : "Your class is settling into a rhythm — the 10 am block is your strongest window.";

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] backdrop-blur px-3 py-1.5 text-[11px] font-bold text-primary"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          Tuning Yellow to your classroom
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mt-5 font-heading font-extrabold text-[34px] sm:text-[44px] leading-[1.05] tracking-tight"
        >
          Here's what we{" "}
          <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
            already see
          </span>{" "}
          in your class.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-[13.5px] text-muted-foreground inline-flex items-center gap-1.5 flex-wrap justify-center"
        >
          <span>Sample insight tuned to:</span>
          {goalLabels.length > 0 ? (
            goalLabels.map((g, i) => (
              <span key={g} className="font-semibold text-foreground">
                {g}
                {i < goalLabels.length - 1 ? "," : ""}
              </span>
            ))
          ) : (
            <span className="font-semibold text-foreground">general focus</span>
          )}
        </motion.div>
      </div>

      {/* Progressive prep lines */}
      <div className="mt-9 max-w-md mx-auto space-y-2.5">
        <PrepLine done={phase >= 1} delay={0}>
          Reading {className || `Grade ${grades[0] ?? "3"} · Class A`}'s structure
        </PrepLine>
        <PrepLine done={phase >= 2} delay={1}>
          Mapping 8 attention sub-domains
        </PrepLine>
        <PrepLine done={phase >= 3} delay={2}>
          Generating your first insight
        </PrepLine>
      </div>

      {/* Reveal — animated insight card */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-10 relative auth-card rounded-[22px] p-6 sm:p-8 text-left"
          >
            <span className="auth-card-ring rounded-[22px]" aria-hidden />
            <div className="relative">
              <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                <span className="h-[2px] w-4 bg-gradient-to-r from-primary to-transparent rounded-full" />
                First insight · preview
              </div>

              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                <MiniMetric label="Avg PFI" value={72} suffix="/100" tone="hsl(142 55% 45%)" />
                <MiniMetric label="Peak window" value={11} suffix=" am" tone="hsl(200 60% 50%)" raw />
                <MiniMetric label="Need attention" value={2} suffix=" kids" tone="hsl(0 78% 58%)" raw />
              </div>

              <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-primary mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Yellow Recommends
                </div>
                <Typewriter text={insightLine} delay={500} />
              </div>

              <button
                onClick={onSkip}
                className="mt-6 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip ahead <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PrepLine({
  done,
  children,
  delay,
}: {
  done: boolean;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.2 + 0.4, duration: 0.4 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
        done
          ? "border-primary/30 bg-primary/[0.06] text-foreground"
          : "border-border/60 bg-card/60 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all",
          done ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : (
          <span className="typing-dots"><span /><span /><span /></span>
        )}
      </span>
      <span className="text-[13px] font-semibold">{children}</span>
    </motion.div>
  );
}

function MiniMetric({
  label,
  value,
  suffix,
  tone,
  raw,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: string;
  raw?: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl border border-border/60 bg-card/70 p-4 overflow-hidden"
      style={{ ["--kpi-tone" as string]: tone }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }}
        aria-hidden
      />
      <div className="text-[10.5px] font-bold tracking-wide uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-heading font-extrabold text-[26px] leading-none tabular-nums">
        {raw ? value : <AnimatedNumber value={value} duration={1.4} />}
        {suffix && (
          <span className="text-[12px] font-bold text-muted-foreground ml-0.5">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text : "");
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const startT = window.setTimeout(() => {
      const id = window.setInterval(() => {
        i += 2;
        setShown(text.slice(0, i));
        if (i >= text.length) window.clearInterval(id);
      }, 22);
      // store on closure so cleanup also stops the interval
      (startT as unknown as { _id?: number })._id = id;
    }, delay);
    return () => {
      window.clearTimeout(startT);
      const inner = (startT as unknown as { _id?: number })._id;
      if (inner) window.clearInterval(inner);
    };
  }, [text, delay, reduce]);
  const done = shown.length >= text.length;
  return (
    <p className="text-[13.5px] leading-relaxed text-foreground">
      {shown}
      {!done && <span className="ml-0.5 inline-block h-[1em] w-[2px] bg-primary align-middle animate-pulse" />}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 6 — Ready
 * ───────────────────────────────────────────────────────── */
function StepReady({
  fullName,
  className,
  rosterMethod,
  size,
  onFinish,
}: {
  fullName: string;
  className: string;
  rosterMethod: RosterMethod;
  size: number;
  onFinish: () => void;
}) {
  const firstName = fullName.split(" ")[0];
  return (
    <div className="max-w-2xl mx-auto py-4 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-[hsl(142_60%_56%)] to-[hsl(142_55%_40%)] text-white flex items-center justify-center shadow-[0_18px_44px_-16px_hsl(142_55%_35%/0.55)] relative"
      >
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/30" />
        <PartyPopper className="h-9 w-9" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        className="mt-7 font-heading font-extrabold text-[36px] sm:text-[44px] leading-[1.04] tracking-tight"
      >
        You're all set, {firstName}.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-3 text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed"
      >
        Your classroom is ready. Step in — we'll guide you through the first
        few moments.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
        className="mt-8 relative auth-card rounded-[20px] p-6 text-left"
      >
        <span className="auth-card-ring rounded-[20px]" aria-hidden />
        <div className="relative grid sm:grid-cols-3 gap-4">
          <SummaryCell label="Class" value={className || "Class A"} />
          <SummaryCell label="Students" value={rosterMethod === "sample" ? `${size} (sample)` : `${size}`} />
          <SummaryCell label="Roster" value={rosterMethodLabel(rosterMethod)} />
        </div>
      </motion.div>

      <motion.button
        onClick={onFinish}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="cta-premium !h-13 !w-auto px-8 mt-8"
      >
        <span className="sheen" aria-hidden />
        <span className="inline-flex items-center gap-2 font-heading font-extrabold">
          Step into your classroom
          <ArrowRight className="h-[18px] w-[18px]" />
        </span>
      </motion.button>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-heading font-extrabold text-[15.5px] truncate">{value}</div>
    </div>
  );
}

function Confetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const pieces = Array.from({ length: 28 });
  const colors = [
    "hsl(142 55% 50%)",
    "hsl(260 55% 65%)",
    "hsl(200 70% 55%)",
    "hsl(38 92% 55%)",
    "hsl(340 70% 60%)",
  ];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] overflow-hidden" aria-hidden>
      {pieces.map((_, i) => {
        const left = (i / pieces.length) * 100 + (Math.sin(i) * 4);
        const delay = (i % 7) * 0.08;
        const dur = 2.6 + ((i * 31) % 100) / 100;
        const c = colors[i % colors.length];
        const rot = (i * 47) % 360;
        return (
          <motion.span
            key={i}
            initial={{ y: -30, opacity: 0, rotate: rot }}
            animate={{ y: 240, opacity: [0, 1, 1, 0], rotate: rot + 240 }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: 8,
              height: 12,
              background: c,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Live preview tile (right rail on form steps)
 * ───────────────────────────────────────────────────────── */
function PreviewCard({
  name,
  school,
  grades,
  subjects,
  className,
  period,
  classSize,
  rosterMethod,
  goals,
}: {
  name: string;
  school: string;
  grades: string[];
  subjects: string[];
  className: string;
  period?: string;
  classSize?: number;
  rosterMethod?: RosterMethod;
  goals?: OnboardingGoal[];
}) {
  const initials = (name || "T")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative auth-card rounded-[22px] p-6 overflow-hidden">
      <span className="auth-card-ring rounded-[22px]" aria-hidden />
      <div className="relative">
        <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
          Your classroom card
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(260_55%_72%)] to-[hsl(200_60%_60%)] text-white flex items-center justify-center font-heading font-extrabold text-[15px] shadow-[0_8px_20px_-10px_hsl(260_50%_40%/0.5)]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-[16px] truncate">{name || "Your name"}</div>
            <div className="text-[12px] text-muted-foreground truncate">
              {school || "Your school"}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground">
                Class
              </div>
              <div className="font-heading font-extrabold text-[15px] mt-0.5">
                {className || (grades[0] ? `Grade ${grades[0]} · Section A` : "Untitled class")}
              </div>
              {period && (
                <div className="text-[11.5px] text-muted-foreground mt-1">{period}</div>
              )}
            </div>
            {classSize !== undefined && (
              <div className="text-right">
                <div className="font-heading font-extrabold text-[22px] tabular-nums leading-none">
                  {classSize}
                </div>
                <div className="text-[10.5px] text-muted-foreground mt-0.5">students</div>
              </div>
            )}
          </div>

          {/* Mini avatar row */}
          {classSize !== undefined && (
            <div className="mt-3 flex -space-x-1.5 items-center">
              {Array.from({ length: Math.min(classSize, 12) }).map((_, i) => (
                <span
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-card text-white text-[9.5px] font-heading font-bold flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 55% 70%), hsl(${(i * 47 + 60) % 360} 55% 55%))`,
                  }}
                >
                  {String.fromCharCode(65 + (i % 26))}
                </span>
              ))}
              {classSize > 12 && (
                <span className="h-6 px-1.5 ml-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center">
                  +{classSize - 12}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Subjects + grades */}
        {(subjects.length > 0 || grades.length > 0) && (
          <div className="mt-4">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2">
              Teaching
            </div>
            <div className="flex flex-wrap gap-1">
              {grades.map((g) => (
                <span key={g} className="premium-pill !h-6 !px-2 !text-[10.5px]">
                  Gr {g}
                </span>
              ))}
              {subjects.map((s) => (
                <span
                  key={s}
                  className="premium-pill !h-6 !px-2 !text-[10.5px]"
                  data-active="true"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roster status */}
        {rosterMethod && (
          <div className="mt-4 flex items-center gap-2 text-[12px]">
            <span
              className={cn(
                "inline-flex h-5 w-5 rounded-full items-center justify-center",
                "bg-primary text-primary-foreground",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-muted-foreground">
              Roster:{" "}
              <span className="text-foreground font-semibold">{rosterMethodLabel(rosterMethod)}</span>
            </span>
          </div>
        )}

        {/* Goals */}
        {goals && goals.length > 0 && (
          <div className="mt-4">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2">
              Tuned for
            </div>
            <div className="flex flex-wrap gap-1.5">
              {goals.map((id) => {
                const g = GOAL_OPTIONS.find((o) => o.id === id);
                if (!g) return null;
                const Icon = g.Icon;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: `color-mix(in srgb, ${g.tone} 14%, transparent)`,
                      color: g.tone,
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {g.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Tiny field primitive
 * ───────────────────────────────────────────────────────── */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[12.5px] font-semibold text-foreground/80 mb-1.5">{label}</div>
      <div className="auth-field !h-12 [&_input]:!pl-4">{children}</div>
    </label>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2.5">
      {children}
    </div>
  );
}
