"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Eye,
  Plus,
  X,
  Users2,
  ClipboardCheck,
  GraduationCap,
  Layers,
} from "lucide-react";
import { getSession, type TeacherSession } from "@/lib/auth";
import { getSchoolKpis, getSchoolClasses } from "@/lib/schoolData";
import {
  getSelOnboarding,
  setSelOnboarding,
  completeSelOnboarding,
  SEL_POSITION_LABEL,
  type SelPosition,
} from "@/lib/selOnboarding";
import { Switch } from "@/components/ui/switch";
import { Field, Eyebrow } from "@/components/onboarding/formPrimitives";
import { cn } from "@/lib/utils";

export default function Page() {
  return <SelWelcomePage />;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Single real school in this app's data model (see SelAppShell.tsx) —
// "pre-fill from the school system" means this, not a free-text guess.
const SCHOOL_NAME = "Bishop Cottons Girls School";

const POSITIONS: SelPosition[] = ["selCoordinator", "counsellor", "specialEducator"];

function gradeSortKey(g: string): number {
  return g === "K" ? -1 : parseInt(g, 10);
}

const ALL_GRADES = Array.from(new Set(getSchoolClasses().map((c) => c.grade))).sort(
  (a, b) => gradeSortKey(a) - gradeSortKey(b),
);

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Set up your dashboard" },
  { id: "connect", label: "Connect the school" },
] as const;

function SelWelcomePage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [session, setSessionState] = useState<TeacherSession | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const initial = useMemo(() => getSelOnboarding(), []);
  const [fullName, setFullName] = useState(initial.profile?.fullName ?? "");
  const [position, setPosition] = useState<SelPosition>(initial.profile?.position ?? "selCoordinator");
  const [supportsMultipleSchools, setSupportsMultipleSchools] = useState(
    initial.profile?.supportsMultipleSchools ?? false,
  );
  const [additionalSchools, setAdditionalSchools] = useState<string[]>(
    initial.profile?.additionalSchools ?? [],
  );
  const [additionalSchoolInput, setAdditionalSchoolInput] = useState("");
  const [grades, setGrades] = useState<string[]>(initial.profile?.grades ?? ALL_GRADES);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "selCoordinator") {
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

  const toggleGrade = (g: string) => {
    setGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const addSchool = () => {
    const name = additionalSchoolInput.trim();
    if (!name || additionalSchools.includes(name)) return;
    setAdditionalSchools((prev) => [...prev, name]);
    setAdditionalSchoolInput("");
  };
  const removeSchool = (name: string) => {
    setAdditionalSchools((prev) => prev.filter((s) => s !== name));
  };

  const finish = () => {
    setSelOnboarding({
      profile: {
        fullName: fullName.trim() || (session?.name ?? "SEL Coordinator"),
        position,
        primarySchool: SCHOOL_NAME,
        supportsMultipleSchools,
        additionalSchools: supportsMultipleSchools ? additionalSchools : [],
        grades: grades.length > 0 ? grades : ALL_GRADES,
      },
    });
    completeSelOnboarding();
    router.push("/sel/dashboard");
  };

  const canAdvanceProfile = fullName.trim().length >= 2 && grades.length > 0;

  const classroomsInScope = useMemo(
    () => getSchoolClasses().filter((c) => grades.includes(c.grade)).length,
    [grades],
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 auth-aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-grid-mask opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-noise opacity-[0.10] mix-blend-overlay" aria-hidden />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="orb"
          style={{
            width: 540,
            height: 540,
            top: "-12%",
            left: "-8%",
            background: "radial-gradient(circle at 30% 30%, hsl(330 65% 76% / 0.4), transparent 60%)",
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
            background: "radial-gradient(circle at 50% 50%, hsl(142 70% 70% / 0.35), transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-20">
        <header className="flex items-center justify-between px-6 lg:px-10 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(330_60%_68%)] to-[hsl(280_55%_58%)] text-white flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(300_55%_40%/0.6)]">
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[15px] tracking-tight">Yellow</div>
              <div className="font-heading font-extrabold text-[12px] text-muted-foreground -mt-0.5 tracking-tight">
                Cognition
              </div>
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
            {step.id === "welcome" && <StepWelcome onBegin={goNext} />}

            {step.id === "profile" && (
              <StepShell
                title="Set up your dashboard"
                subtitle="Confirm a few details so Yellow knows who and what you support."
                preview={
                  <PreviewCard
                    name={fullName || session?.name || "SEL Coordinator"}
                    position={position}
                    school={SCHOOL_NAME}
                    additionalSchools={supportsMultipleSchools ? additionalSchools : []}
                    grades={grades}
                    classroomCount={classroomsInScope}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvanceProfile}
                nextLabel="Continue"
              >
                <StepProfile
                  fullName={fullName}
                  setFullName={setFullName}
                  position={position}
                  setPosition={setPosition}
                  supportsMultipleSchools={supportsMultipleSchools}
                  setSupportsMultipleSchools={setSupportsMultipleSchools}
                  additionalSchools={additionalSchools}
                  additionalSchoolInput={additionalSchoolInput}
                  setAdditionalSchoolInput={setAdditionalSchoolInput}
                  onAddSchool={addSchool}
                  onRemoveSchool={removeSchool}
                  grades={grades}
                  onToggleGrade={toggleGrade}
                  classroomCount={classroomsInScope}
                />
              </StepShell>
            )}

            {step.id === "connect" && <StepConnect onBack={goBack} onFinish={finish} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Progress track
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
                ? "bg-gradient-to-r from-primary via-[hsl(300_55%_60%)] to-[hsl(260_55%_60%)] w-12"
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
function StepWelcome({ onBegin }: { onBegin: () => void }) {
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
        Welcome to Yellow Cognition
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        className="mt-6 text-[15.5px] sm:text-[16.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        See how students are doing. Know where SEL support is needed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
        className="mt-10 flex items-center justify-center gap-3"
      >
        <button onClick={onBegin} className="cta-premium !h-13 !w-auto px-8">
          <span className="sheen" aria-hidden />
          <span className="inline-flex items-center gap-2">
            Get started
            <ArrowRight className="h-[18px] w-[18px]" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 1 — Set up your dashboard
 * ───────────────────────────────────────────────────────── */
function StepProfile({
  fullName,
  setFullName,
  position,
  setPosition,
  supportsMultipleSchools,
  setSupportsMultipleSchools,
  additionalSchools,
  additionalSchoolInput,
  setAdditionalSchoolInput,
  onAddSchool,
  onRemoveSchool,
  grades,
  onToggleGrade,
  classroomCount,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  position: SelPosition;
  setPosition: (p: SelPosition) => void;
  supportsMultipleSchools: boolean;
  setSupportsMultipleSchools: (v: boolean) => void;
  additionalSchools: string[];
  additionalSchoolInput: string;
  setAdditionalSchoolInput: (v: string) => void;
  onAddSchool: () => void;
  onRemoveSchool: (name: string) => void;
  grades: string[];
  onToggleGrade: (g: string) => void;
  classroomCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jordan Blake"
            autoFocus
          />
        </Field>
        <label className="block">
          <div className="text-[12.5px] font-semibold text-foreground/80 mb-1.5">School</div>
          <div className="auth-field !h-12 !bg-muted/40 [&_input]:!pl-4 [&_input]:!pr-1 flex items-center gap-1.5 pr-3">
            <input value={SCHOOL_NAME} readOnly disabled className="min-w-0" />
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80">
              <Check className="h-3 w-3 text-primary" />
              Synced
            </span>
          </div>
        </label>
      </div>

      <div>
        <Eyebrow>Your role</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPosition(p)}
              data-active={position === p}
              className="premium-pill !h-9 !px-3.5 !text-[12.5px]"
            >
              {SEL_POSITION_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 p-3.5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">I support multiple schools</div>
            <div className="text-[11.5px] text-muted-foreground">
              Turn this on if your role covers more than {SCHOOL_NAME}.
            </div>
          </div>
          <Switch checked={supportsMultipleSchools} onCheckedChange={setSupportsMultipleSchools} />
        </div>

        {supportsMultipleSchools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-3 space-y-2.5 overflow-hidden"
          >
            <div className="flex gap-2">
              <div className="auth-field !h-11 flex-1 [&_input]:!pl-4">
                <input
                  value={additionalSchoolInput}
                  onChange={(e) => setAdditionalSchoolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddSchool();
                    }
                  }}
                  placeholder="Add another school you support"
                />
              </div>
              <button
                type="button"
                onClick={onAddSchool}
                className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
                aria-label="Add school"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {additionalSchools.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {additionalSchools.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11.5px] font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => onRemoveSchool(s)}
                      aria-label={`Remove ${s}`}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              You can fully set these up later — for now we&apos;re just noting them.
            </p>
          </motion.div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Eyebrow>Grades you support</Eyebrow>
          <span className="text-[11px] font-semibold text-muted-foreground -mt-2.5">
            {classroomCount} classroom{classroomCount === 1 ? "" : "s"} in scope
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onToggleGrade(g)}
              data-active={grades.includes(g)}
              className="premium-pill !h-9 !px-3.5 !text-[12.5px]"
            >
              {g === "K" ? "K" : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Live preview tile (right rail on the profile step)
 * ───────────────────────────────────────────────────────── */
function PreviewCard({
  name,
  position,
  school,
  additionalSchools,
  grades,
  classroomCount,
}: {
  name: string;
  position: SelPosition;
  school: string;
  additionalSchools: string[];
  grades: string[];
  classroomCount: number;
}) {
  const initials = (name || "SC")
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
          Your dashboard card
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(330_60%_72%)] to-[hsl(280_55%_60%)] text-white flex items-center justify-center font-heading font-extrabold text-[15px] shadow-[0_8px_20px_-10px_hsl(300_50%_40%/0.5)]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-[16px] truncate">{name || "Your name"}</div>
            <div className="text-[12px] text-muted-foreground truncate">
              {SEL_POSITION_LABEL[position]} · {school}
              {additionalSchools.length > 0 && ` +${additionalSchools.length} more`}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
            <div className="font-heading font-extrabold text-[18px] leading-none">{grades.length}</div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">
              grade{grades.length === 1 ? "" : "s"} supported
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
            <div className="font-heading font-extrabold text-[18px] leading-none">{classroomCount}</div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">
              classroom{classroomCount === 1 ? "" : "s"} in scope
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-border/60 p-4 text-[12px] text-muted-foreground text-center">
          {`Next, we'll connect ${school} and show you what's already available.`}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Step 2 — Connect the school
 * ───────────────────────────────────────────────────────── */
function StepConnect({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const kpis = useMemo(() => getSchoolKpis(), []);
  const grades = useMemo(
    () => Array.from(new Set(getSchoolClasses().map((c) => c.grade))).sort(
      (a, b) => gradeSortKey(a) - gradeSortKey(b),
    ),
    [],
  );

  const stats = [
    {
      Icon: Layers,
      value: `${kpis.classroomsConnected} of ${kpis.totalClassrooms}`,
      label: "Classrooms connected",
      tone: "hsl(212 90% 58%)",
    },
    {
      Icon: Users2,
      value: `${kpis.activeTeachers} of ${kpis.totalTeachers}`,
      label: "Teachers active",
      tone: "hsl(142 55% 45%)",
    },
    {
      Icon: GraduationCap,
      value: `${kpis.totalStudents}`,
      label: "Students available",
      tone: "hsl(262 60% 62%)",
    },
    {
      Icon: ClipboardCheck,
      value: `${grades.length} grades`,
      label: "Grades covered",
      tone: "hsl(38 92% 50%)",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center py-4">
      <div className="relative auth-card rounded-[24px] p-7 sm:p-9">
        <span className="auth-card-ring rounded-[24px]" aria-hidden />
        <div className="relative">
          <div className="premium-eyebrow justify-center">
            <span>{SCHOOL_NAME}</span>
          </div>
          <h1 className="mt-2 font-heading font-extrabold text-[26px] sm:text-[30px] leading-tight tracking-tight">
            Connect the school
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground max-w-md mx-auto leading-relaxed">
            Classrooms and rosters are imported automatically — there&apos;s nothing to set up by
            hand.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 text-center overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10" />
                <span
                  className="mx-auto mb-2 h-9 w-9 rounded-xl inline-flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${s.tone} 14%, transparent)`, color: s.tone }}
                >
                  <s.Icon className="h-4.5 w-4.5" />
                </span>
                <div className="font-heading font-extrabold text-[18px] leading-tight">{s.value}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-muted-foreground/80">
            {`${grades.map((g) => (g === "K" ? "K" : g)).join(", ")} are all represented.`}
          </p>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button type="button" onClick={onFinish} className="cta-premium !h-12 !w-auto px-6">
              <span className="sheen" aria-hidden />
              <span className="inline-flex items-center gap-1.5">
                Review school setup
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
