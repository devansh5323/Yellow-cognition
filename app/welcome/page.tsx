"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GraduationCap, ArrowRight, ArrowLeft, Check, Sparkles, Eye } from "lucide-react";
import { getSession, type TeacherSession } from "@/lib/auth";
import { completeOnboarding, getOnboarding, setOnboarding } from "@/lib/onboarding";
import { BOARDS } from "@/lib/boardTaxonomy";
import { Field, Eyebrow } from "@/components/onboarding/formPrimitives";
import { cn } from "@/lib/utils";

export default function Page() {
  return <WelcomePage />;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Just two steps — "tell us about you," then straight into the dashboard.
// Classroom setup used to live here as its own multi-step chunk of the
// wizard; it's now a prompt on the dashboard itself (see
// components/onboarding/ClassroomSetupPrompt.tsx) since it doesn't need to
// block getting into the product.
const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "About you" },
] as const;

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
  const [board, setBoard] = useState(initial.profile?.board ?? "");
  const [years, setYears] = useState<number>(initial.profile?.yearsTeaching ?? 3);

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
    setStepIdx((i) => Math.min(i + 1, totalSteps - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  const finish = () => {
    setOnboarding({
      profile: {
        fullName: fullName.trim() || (session?.name ?? "Teacher"),
        schoolName: schoolName.trim(),
        yearsTeaching: years,
        board: board.trim() || undefined,
      },
    });
    completeOnboarding();
    router.push("/dashboard");
  };

  const canAdvance = fullName.trim().length >= 2;

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
            {step.id === "welcome" && <StepWelcome session={session} onBegin={goNext} />}
            {step.id === "profile" && (
              <StepShell
                title="Tell us about you"
                subtitle="So we can shape Yellow around your classroom."
                preview={
                  <PreviewCard name={fullName || session?.name || "Teacher"} school={schoolName} board={board} />
                }
                onBack={goBack}
                onNext={finish}
                canAdvance={canAdvance}
                nextLabel="Go to my dashboard"
              >
                <StepProfile
                  fullName={fullName}
                  setFullName={setFullName}
                  schoolName={schoolName}
                  setSchoolName={setSchoolName}
                  board={board}
                  setBoard={setBoard}
                  years={years}
                  setYears={setYears}
                />
              </StepShell>
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
function StepWelcome({ session, onBegin }: { session: TeacherSession | null; onBegin: () => void }) {
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
          Let&apos;s get you started.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        className="mt-6 text-[15.5px] sm:text-[16.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        Just a few quick details, then straight into your dashboard — you can set up your
        classroom whenever you&apos;re ready.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        className="mt-10 grid grid-cols-3 max-w-md mx-auto gap-3"
      >
        {[
          { k: "30s", v: "Quick setup" },
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

/** Searchable board/curriculum field — a plain text input underneath, so
 * typing a board that isn't in the list still works as manual entry; the
 * dropdown is just an assistive autocomplete over BOARDS, not a hard
 * constraint. */
function BoardField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return BOARDS;
    return BOARDS.filter((b) => b.toLowerCase().includes(q));
  }, [value]);

  const isCustom = value.trim().length > 0 && !BOARDS.some((b) => b.toLowerCase() === value.trim().toLowerCase());

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block">
        <div className="text-[12.5px] font-semibold text-foreground/80 mb-1.5">Board / curriculum</div>
        <div className="auth-field !h-12 [&_input]:!pl-4">
          <input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search or type your board — IB, CBSE, Cambridge…"
          />
        </div>
      </label>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1.5 w-full max-h-56 overflow-auto rounded-2xl border border-border bg-card shadow-lg p-1.5"
          >
            {suggestions.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  onChange(b);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium hover:bg-muted/60 transition-colors"
              >
                {b}
                {value.trim().toLowerCase() === b.toLowerCase() && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isCustom && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Using custom board: <span className="font-semibold text-foreground/80">{value.trim()}</span>
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 1 — Profile. The wizard's last step — "Continue" here finishes
 * onboarding outright. Classroom setup lives on the dashboard now (see
 * components/onboarding/ClassroomSetupPrompt.tsx).
 * ───────────────────────────────────────────────────────── */
function StepProfile({
  fullName,
  setFullName,
  schoolName,
  setSchoolName,
  board,
  setBoard,
  years,
  setYears,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  schoolName: string;
  setSchoolName: (v: string) => void;
  board: string;
  setBoard: (v: string) => void;
  years: number;
  setYears: (n: number) => void;
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

      <BoardField value={board} onChange={setBoard} />

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
 * Live preview tile (right rail on the profile step)
 * ───────────────────────────────────────────────────────── */
function PreviewCard({ name, school, board }: { name: string; school: string; board?: string }) {
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
            {board && (
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold truncate max-w-full">
                {board}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-border/60 p-4 text-[12px] text-muted-foreground text-center">
          You&apos;ll set up your classroom from the dashboard, right after this.
        </div>
      </div>
    </div>
  );
}
