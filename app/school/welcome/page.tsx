"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  School,
  MapPin,
  Globe,
  Users,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Smile,
  GraduationCap,
  PartyPopper,
  ChevronRight,
  Eye,
  CalendarCheck,
  Layers,
} from "lucide-react";
import { getSession, type TeacherSession } from "@/lib/auth";
import {
  completeSchoolOnboarding,
  getSchoolOnboarding,
  setSchoolOnboarding,
  type SchoolPriority,
  type SchoolType,
} from "@/lib/schoolOnboarding";
import { TeacherInvitePicker, teacherInviteMethodLabel } from "@/components/school/TeacherInvitePicker";
import type { TeacherInviteMethod } from "@/lib/teacherInvites";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { cn } from "@/lib/utils";

export default function Page() {
  return <SchoolWelcomePage />;
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const SCHOOL_TYPES: { id: SchoolType; label: string }[] = [
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
  { id: "charter", label: "Charter" },
  { id: "international", label: "International" },
  { id: "religious", label: "Faith-based" },
  { id: "other", label: "Other" },
];

const ALL_GRADES = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const PRIORITY_OPTIONS: {
  id: SchoolPriority;
  label: string;
  sub: string;
  Icon: typeof Users;
  tone: string;
}[] = [
  { id: "at-risk", label: "Catch at-risk early", sub: "Spot dips before they spiral", Icon: ShieldCheck, tone: "hsl(0 78% 58%)" },
  { id: "attendance", label: "Improve attendance", sub: "Reduce absences across grades", Icon: CalendarCheck, tone: "hsl(38 92% 50%)" },
  { id: "parent-engagement", label: "Parent engagement", sub: "Activate families in the app", Icon: HeartHandshake, tone: "hsl(142 55% 45%)" },
  { id: "teacher-pd", label: "Teacher development", sub: "Coaching insights from real data", Icon: GraduationCap, tone: "hsl(260 55% 60%)" },
  { id: "wellbeing", label: "Student wellbeing", sub: "Mood, behavior, and SEL signals", Icon: Smile, tone: "hsl(340 70% 60%)" },
  { id: "academic-growth", label: "Academic growth", sub: "Track and celebrate progress", Icon: TrendingUp, tone: "hsl(200 60% 50%)" },
];

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "school", label: "Your school" },
  { id: "structure", label: "Grades" },
  { id: "teachers", label: "Teachers" },
  { id: "priorities", label: "Priorities" },
  { id: "reveal", label: "First insight" },
  { id: "ready", label: "Ready" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function SchoolWelcomePage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [session, setSession] = useState<TeacherSession | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const initial = useMemo(() => getSchoolOnboarding(), []);
  const [schoolName, setSchoolName] = useState(initial.profile?.schoolName ?? "");
  const [schoolType, setSchoolType] = useState<SchoolType>(initial.profile?.schoolType ?? "private");
  const [city, setCity] = useState(initial.profile?.city ?? "");
  const [country, setCountry] = useState(initial.profile?.country ?? "India");
  const [totalStudents, setTotalStudents] = useState<number>(initial.profile?.totalStudents ?? 320);
  const [totalTeachers, setTotalTeachers] = useState<number>(initial.profile?.totalTeachers ?? 24);

  const [grades, setGrades] = useState<string[]>(initial.structure?.gradeLevels ?? ["1", "2", "3", "4", "5"]);
  const [sectionsPerGrade, setSectionsPerGrade] = useState<number>(initial.structure?.sectionsPerGrade ?? 2);
  const [hasMultipleCampuses, setHasMultipleCampuses] = useState<boolean>(
    initial.structure?.hasMultipleCampuses ?? false,
  );

  const [inviteMethod, setInviteMethod] = useState<TeacherInviteMethod | null>(null);
  const [priorities, setPriorities] = useState<SchoolPriority[]>(initial.priorities ?? []);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/");
      return;
    }
    if (s.role !== "admin") {
      router.push("/");
      return;
    }
    setSession(s);
  }, [router]);

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
    setSchoolOnboarding({
      profile: {
        schoolName: schoolName.trim() || "Your School",
        schoolType,
        city: city.trim(),
        country: country.trim(),
        totalStudents,
        totalTeachers,
      },
      structure: {
        gradeLevels: grades,
        sectionsPerGrade,
        hasMultipleCampuses,
      },
      priorities,
    });
  };

  const finish = () => {
    persistDraft();
    completeSchoolOnboarding();
    router.push("/school/dashboard");
  };

  const canAdvance = (() => {
    switch (step.id) {
      case "school":
        return schoolName.trim().length >= 2;
      case "structure":
        return grades.length > 0;
      case "teachers":
        return inviteMethod !== null;
      default:
        return true;
    }
  })();

  const toggle = <T,>(arr: T[], v: T, max?: number): T[] => {
    if (arr.includes(v)) return arr.filter((x) => x !== v);
    if (max && arr.length >= max) return arr;
    return [...arr, v];
  };

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
      <div className="pointer-events-none absolute inset-0 auth-aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-grid-mask opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-noise opacity-[0.10] mix-blend-overlay" aria-hidden />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="orb"
          style={{
            width: 540, height: 540, top: "-12%", left: "-8%",
            background: "radial-gradient(circle at 30% 30%, hsl(260 70% 76% / 0.45), transparent 60%)",
          }}
        />
        <div
          className="orb orb--b"
          style={{
            width: 480, height: 480, top: "10%", right: "-10%",
            background: "radial-gradient(circle at 60% 40%, hsl(200 80% 78% / 0.45), transparent 60%)",
          }}
        />
        <div
          className="orb orb--c"
          style={{
            width: 560, height: 560, bottom: "-22%", left: "30%",
            background: "radial-gradient(circle at 50% 50%, hsl(142 70% 78% / 0.40), transparent 60%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-20">
        <header className="flex items-center justify-between px-6 lg:px-10 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(260_55%_60%)] to-[hsl(260_55%_42%)] text-white flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(260_55%_35%/0.6)]">
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
              <Building2 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[15px] tracking-tight">Yellow</div>
              <div className="text-[10.5px] text-muted-foreground -mt-0.5">School admin setup</div>
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
            {step.id === "welcome" && <StepWelcome session={session} onBegin={goNext} />}

            {step.id === "school" && (
              <StepShell
                title="Tell us about your school"
                subtitle="So your dashboards, reports, and parent comms are tuned to the right context."
                preview={
                  <SchoolPreview
                    schoolName={schoolName}
                    schoolType={schoolType}
                    city={city}
                    country={country}
                    totalStudents={totalStudents}
                    totalTeachers={totalTeachers}
                    grades={grades}
                    sectionsPerGrade={sectionsPerGrade}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
              >
                <StepSchool
                  schoolName={schoolName}
                  setSchoolName={setSchoolName}
                  schoolType={schoolType}
                  setSchoolType={setSchoolType}
                  city={city}
                  setCity={setCity}
                  country={country}
                  setCountry={setCountry}
                  totalStudents={totalStudents}
                  setTotalStudents={setTotalStudents}
                  totalTeachers={totalTeachers}
                  setTotalTeachers={setTotalTeachers}
                />
              </StepShell>
            )}

            {step.id === "structure" && (
              <StepShell
                title="What does your school structure look like?"
                subtitle="Pick the grade levels you teach and how many sections per grade."
                preview={
                  <SchoolPreview
                    schoolName={schoolName}
                    schoolType={schoolType}
                    city={city}
                    country={country}
                    totalStudents={totalStudents}
                    totalTeachers={totalTeachers}
                    grades={grades}
                    sectionsPerGrade={sectionsPerGrade}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
              >
                <StepStructure
                  grades={grades}
                  setGrades={setGrades}
                  sectionsPerGrade={sectionsPerGrade}
                  setSectionsPerGrade={setSectionsPerGrade}
                  hasMultipleCampuses={hasMultipleCampuses}
                  setHasMultipleCampuses={setHasMultipleCampuses}
                  toggle={toggle}
                />
              </StepShell>
            )}

            {step.id === "teachers" && (
              <StepShell
                title="How would you like to invite teachers?"
                subtitle="Pick whatever fits your school's IT setup. You can mix-and-match later."
                preview={
                  <SchoolPreview
                    schoolName={schoolName}
                    schoolType={schoolType}
                    city={city}
                    country={country}
                    totalStudents={totalStudents}
                    totalTeachers={totalTeachers}
                    grades={grades}
                    sectionsPerGrade={sectionsPerGrade}
                    inviteMethod={inviteMethod ?? undefined}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance={canAdvance}
                nextLabel="Continue"
              >
                <TeacherInvitePicker value={inviteMethod} onChange={setInviteMethod} />
              </StepShell>
            )}

            {step.id === "priorities" && (
              <StepShell
                title="What does your school care about most this term?"
                subtitle="Pick up to three. We'll tune insights, alerts, and reports around these."
                preview={
                  <SchoolPreview
                    schoolName={schoolName}
                    schoolType={schoolType}
                    city={city}
                    country={country}
                    totalStudents={totalStudents}
                    totalTeachers={totalTeachers}
                    grades={grades}
                    sectionsPerGrade={sectionsPerGrade}
                    inviteMethod={inviteMethod ?? undefined}
                    priorities={priorities}
                  />
                }
                onBack={goBack}
                onNext={goNext}
                canAdvance
                nextLabel="Show me my school"
              >
                <StepPriorities priorities={priorities} setPriorities={setPriorities} toggle={toggle} />
              </StepShell>
            )}

            {step.id === "reveal" && (
              <StepReveal
                priorities={priorities}
                schoolName={schoolName || "Your school"}
                onSkip={() => {
                  setDirection(1);
                  setStepIdx((i) => i + 1);
                }}
              />
            )}

            {step.id === "ready" && (
              <StepReady
                schoolName={schoolName || "Your school"}
                totalStudents={totalStudents}
                totalTeachers={totalTeachers}
                inviteMethod={inviteMethod}
                onFinish={finish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─── Reusable shell parts ─── */

function ProgressTrack({ stepIdx, total }: { stepIdx: number; total: number }) {
  return (
    <div className="hidden md:flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[5px] rounded-full transition-all duration-500",
            i < stepIdx
              ? "bg-[hsl(260_55%_60%)] w-5"
              : i === stepIdx
              ? "bg-gradient-to-r from-[hsl(260_55%_60%)] via-[hsl(200_60%_50%)] to-[hsl(142_55%_45%)] w-12"
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

/* ─── Step 0 — Welcome ─── */

function StepWelcome({
  session,
  onBegin,
}: {
  session: TeacherSession | null;
  onBegin: () => void;
}) {
  const firstName = (session?.name ?? "Admin").split(" ")[0];
  return (
    <div className="text-center max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 backdrop-blur px-3 py-1.5 text-[11px] text-muted-foreground"
      >
        <Sparkles className="h-3.5 w-3.5 text-[hsl(260_55%_60%)]" />
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
        <span className="bg-gradient-to-r from-[hsl(260_55%_60%)] via-[hsl(200_60%_50%)] to-[hsl(142_55%_45%)] bg-clip-text text-transparent">
          Let's bring your school online.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        className="mt-6 text-[15.5px] sm:text-[16.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed"
      >
        About 3 minutes of light setup, then a school dashboard that already understands your priorities,
        teachers, and parents.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
        className="mt-10 grid grid-cols-3 max-w-md mx-auto gap-3"
      >
        {[
          { k: "3m", v: "Quick setup" },
          { k: "1", v: "Source of truth" },
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
        className="mt-10 flex items-center justify-center"
      >
        <button onClick={onBegin} className="cta-premium !h-13 !w-auto px-8">
          <span className="sheen" aria-hidden />
          <span className="inline-flex items-center gap-2">
            Begin setup
            <ArrowRight className="h-[18px] w-[18px]" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Step 1 — School profile ─── */

function StepSchool({
  schoolName,
  setSchoolName,
  schoolType,
  setSchoolType,
  city,
  setCity,
  country,
  setCountry,
  totalStudents,
  setTotalStudents,
  totalTeachers,
  setTotalTeachers,
}: {
  schoolName: string;
  setSchoolName: (v: string) => void;
  schoolType: SchoolType;
  setSchoolType: (v: SchoolType) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  totalStudents: number;
  setTotalStudents: (n: number) => void;
  totalTeachers: number;
  setTotalTeachers: (n: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="School name">
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Riverside Academy" autoFocus />
        </Field>
        <div>
          <div className="text-[12.5px] font-semibold text-foreground/80 mb-1.5">School type</div>
          <div className="flex flex-wrap gap-1.5">
            {SCHOOL_TYPES.map((t) => {
              const active = schoolType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSchoolType(t.id)}
                  data-active={active}
                  className="premium-pill !px-3 !h-9 !text-[12.5px]"
                  aria-pressed={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="City">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
        </Field>
        <Field label="Country">
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" />
        </Field>
      </div>

      <div>
        <Eyebrow>Roughly how many students?</Eyebrow>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={20}
            max={2000}
            step={10}
            value={totalStudents}
            onChange={(e) => setTotalStudents(parseInt(e.target.value, 10))}
            className="flex-1 accent-primary"
          />
          <div className="font-heading font-extrabold text-[20px] tabular-nums w-20 text-right">
            {totalStudents}
            <span className="text-[12px] text-muted-foreground font-bold ml-0.5">kids</span>
          </div>
        </div>
      </div>

      <div>
        <Eyebrow>Roughly how many teachers?</Eyebrow>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={2}
            max={200}
            value={totalTeachers}
            onChange={(e) => setTotalTeachers(parseInt(e.target.value, 10))}
            className="flex-1 accent-primary"
          />
          <div className="font-heading font-extrabold text-[20px] tabular-nums w-16 text-right">
            {totalTeachers}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 — Structure ─── */

function StepStructure({
  grades,
  setGrades,
  sectionsPerGrade,
  setSectionsPerGrade,
  hasMultipleCampuses,
  setHasMultipleCampuses,
  toggle,
}: {
  grades: string[];
  setGrades: (v: string[]) => void;
  sectionsPerGrade: number;
  setSectionsPerGrade: (n: number) => void;
  hasMultipleCampuses: boolean;
  setHasMultipleCampuses: (b: boolean) => void;
  toggle: <T,>(arr: T[], v: T, max?: number) => T[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Grade levels at your school</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GRADES.map((g) => {
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
        <Eyebrow>Sections per grade (typical)</Eyebrow>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={8}
            value={sectionsPerGrade}
            onChange={(e) => setSectionsPerGrade(parseInt(e.target.value, 10))}
            className="flex-1 accent-primary"
          />
          <div className="font-heading font-extrabold text-[20px] tabular-nums w-14 text-right">
            {sectionsPerGrade}
          </div>
        </div>
        <div className="mt-2 text-[11.5px] text-muted-foreground">
          That's roughly {grades.length * sectionsPerGrade} classes total.
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 flex items-start gap-3">
        <span
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            hasMultipleCampuses ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground",
          )}
        >
          <Layers className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-[13.5px]">Multiple campuses?</div>
          <div className="text-[11.5px] text-muted-foreground">
            We'll keep classes grouped by campus and let you filter accordingly.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHasMultipleCampuses(!hasMultipleCampuses)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors shrink-0",
            hasMultipleCampuses ? "bg-primary" : "bg-muted",
          )}
          aria-pressed={hasMultipleCampuses}
          aria-label="Multiple campuses"
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all",
              hasMultipleCampuses ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4 — Priorities ─── */

function StepPriorities({
  priorities,
  setPriorities,
  toggle,
}: {
  priorities: SchoolPriority[];
  setPriorities: (v: SchoolPriority[]) => void;
  toggle: <T,>(arr: T[], v: T, max?: number) => T[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {PRIORITY_OPTIONS.map((p) => {
        const Icon = p.Icon;
        const active = priorities.includes(p.id);
        const disabled = !active && priorities.length >= 3;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPriorities(toggle(priorities, p.id, 3))}
            disabled={disabled}
            className={cn(
              "group relative text-left rounded-2xl border p-3.5 flex items-start gap-3 transition-all overflow-hidden",
              active ? "border-primary/60 bg-primary/[0.06]" : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            aria-pressed={active}
          >
            {active && (
              <span
                className="absolute inset-x-0 top-0 h-[2px] opacity-80"
                style={{ background: `linear-gradient(90deg, transparent, ${p.tone}, transparent)` }}
                aria-hidden
              />
            )}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${p.tone} 14%, transparent)`, color: p.tone }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-[14px] leading-snug">{p.label}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{p.sub}</div>
            </div>
            <span
              className={cn(
                "shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-all mt-0.5",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          </button>
        );
      })}
      <div className="sm:col-span-2 mt-1 text-[11.5px] text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>{priorities.length}/3 selected · we'll tune your dashboard around these.</span>
      </div>
    </div>
  );
}

/* ─── Step 5 — Reveal ─── */

function StepReveal({
  priorities,
  schoolName,
  onSkip,
}: {
  priorities: SchoolPriority[];
  schoolName: string;
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

  const labels = priorities
    .map((p) => PRIORITY_OPTIONS.find((o) => o.id === p)?.label.toLowerCase())
    .filter(Boolean) as string[];

  const insightLine = priorities.includes("at-risk")
    ? "3 classes haven't run this month's check-in — Grades 6B, 7A, 8C are most at-risk. Auto-nudge ready."
    : priorities.includes("parent-engagement")
    ? "Parent activation is at 62% across the school — an end-of-month invite nudge would lift that next cycle."
    : priorities.includes("attendance")
    ? "Attendance dips 18% on Wednesdays after lunch — worth a school-wide energizer."
    : priorities.includes("teacher-pd")
    ? "5 teachers haven't reviewed this month's insight yet — a one-click PD digest can land at month-end."
    : "Your school is settling into a rhythm — the 10–11 am block is the strongest focus window across grades.";

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(260_55%_60%)]/30 bg-[hsl(260_55%_60%)]/[0.08] backdrop-blur px-3 py-1.5 text-[11px] font-bold text-[hsl(260_55%_55%)] dark:text-[hsl(260_70%_75%)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[hsl(260_55%_60%)] animate-ping opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-[hsl(260_55%_60%)]" />
          </span>
          Tuning Yellow to {schoolName}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="mt-5 font-heading font-extrabold text-[34px] sm:text-[44px] leading-[1.05] tracking-tight"
        >
          Here's what we{" "}
          <span className="bg-gradient-to-r from-[hsl(260_55%_60%)] via-[hsl(200_60%_50%)] to-[hsl(142_55%_45%)] bg-clip-text text-transparent">
            already see
          </span>{" "}
          across your school.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-[13.5px] text-muted-foreground inline-flex items-center gap-1.5 flex-wrap justify-center"
        >
          <span>Sample insight tuned to:</span>
          {labels.length > 0 ? labels.map((g, i) => (
            <span key={g} className="font-semibold text-foreground">{g}{i < labels.length - 1 ? "," : ""}</span>
          )) : (
            <span className="font-semibold text-foreground">school-wide focus</span>
          )}
        </motion.div>
      </div>

      <div className="mt-9 max-w-md mx-auto space-y-2.5">
        <PrepLine done={phase >= 1} delay={0}>Reading {schoolName}'s structure</PrepLine>
        <PrepLine done={phase >= 2} delay={1}>Cross-referencing 8 attention domains</PrepLine>
        <PrepLine done={phase >= 3} delay={2}>Generating your first school insight</PrepLine>
      </div>

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
                <span className="h-[2px] w-4 bg-gradient-to-r from-[hsl(260_55%_60%)] to-transparent rounded-full" />
                First school insight · preview
              </div>

              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                <Metric label="School avg PFI" value={71} suffix="/100" tone="hsl(142 55% 45%)" />
                <Metric label="Active teachers" value={14} suffix=" / 18" tone="hsl(200 60% 50%)" raw />
                <Metric label="Need attention" value={3} suffix=" classes" tone="hsl(0 78% 58%)" raw />
              </div>

              <div className="mt-6 rounded-2xl border border-[hsl(260_55%_60%)]/25 bg-[hsl(260_55%_60%)]/[0.04] p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[hsl(260_55%_55%)] dark:text-[hsl(260_70%_75%)] mb-2">
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

function PrepLine({ done, children, delay }: { done: boolean; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.2 + 0.4, duration: 0.4 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
        done
          ? "border-[hsl(260_55%_60%)]/30 bg-[hsl(260_55%_60%)]/[0.06] text-foreground"
          : "border-border/60 bg-card/60 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all",
          done ? "bg-[hsl(260_55%_60%)] text-white" : "bg-muted",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="typing-dots"><span /><span /><span /></span>}
      </span>
      <span className="text-[13px] font-semibold">{children}</span>
    </motion.div>
  );
}

function Metric({
  label, value, suffix, tone, raw,
}: { label: string; value: number; suffix?: string; tone: string; raw?: boolean }) {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/70 p-4 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }}
        aria-hidden
      />
      <div className="text-[10.5px] font-bold tracking-wide uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 font-heading font-extrabold text-[26px] leading-none tabular-nums">
        {raw ? value : <AnimatedNumber value={value} duration={1.4} />}
        {suffix && <span className="text-[12px] font-bold text-muted-foreground ml-0.5">{suffix}</span>}
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
      {!done && <span className="ml-0.5 inline-block h-[1em] w-[2px] bg-[hsl(260_55%_60%)] align-middle animate-pulse" />}
    </p>
  );
}

/* ─── Step 6 — Ready ─── */

function StepReady({
  schoolName,
  totalStudents,
  totalTeachers,
  inviteMethod,
  onFinish,
}: {
  schoolName: string;
  totalStudents: number;
  totalTeachers: number;
  inviteMethod: TeacherInviteMethod | null;
  onFinish: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-4 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-[hsl(260_55%_60%)] to-[hsl(260_55%_42%)] text-white flex items-center justify-center shadow-[0_18px_44px_-16px_hsl(260_55%_35%/0.55)] relative"
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
        {schoolName} is set up.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-3 text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed"
      >
        Step into your school dashboard. We'll walk you through the first few moments.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
        className="mt-8 relative auth-card rounded-[20px] p-6 text-left"
      >
        <span className="auth-card-ring rounded-[20px]" aria-hidden />
        <div className="relative grid sm:grid-cols-3 gap-4">
          <SummaryCell label="Students" value={`${totalStudents}`} />
          <SummaryCell label="Teachers" value={`${totalTeachers}`} />
          <SummaryCell label="Invite method" value={teacherInviteMethodLabel(inviteMethod)} />
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
          Step into the dashboard
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
    "hsl(260 55% 60%)",
    "hsl(200 60% 50%)",
    "hsl(142 55% 45%)",
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

/* ─── Live preview tile ─── */

function SchoolPreview({
  schoolName,
  schoolType,
  city,
  country,
  totalStudents,
  totalTeachers,
  grades,
  sectionsPerGrade,
  inviteMethod,
  priorities,
}: {
  schoolName: string;
  schoolType: SchoolType;
  city: string;
  country: string;
  totalStudents: number;
  totalTeachers: number;
  grades: string[];
  sectionsPerGrade: number;
  inviteMethod?: TeacherInviteMethod;
  priorities?: SchoolPriority[];
}) {
  const initials = (schoolName || "School").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const totalClasses = grades.length * sectionsPerGrade;
  const typeLabel = SCHOOL_TYPES.find((t) => t.id === schoolType)?.label ?? "School";
  return (
    <div className="relative auth-card rounded-[22px] p-6 overflow-hidden">
      <span className="auth-card-ring rounded-[22px]" aria-hidden />
      <div className="relative">
        <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
          Your school card
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(260_55%_72%)] to-[hsl(220_60%_55%)] text-white flex items-center justify-center font-heading font-extrabold text-[15px]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-heading font-extrabold text-[16px] truncate">{schoolName || "Your school"}</div>
            <div className="text-[12px] text-muted-foreground truncate inline-flex items-center gap-1.5">
              <School className="h-3 w-3" />
              {typeLabel}
              {(city || country) && (
                <>
                  <span className="opacity-60">·</span>
                  <MapPin className="h-3 w-3" />
                  {[city, country].filter(Boolean).join(", ")}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat label="Students" value={totalStudents} />
          <Stat label="Teachers" value={totalTeachers} />
          <Stat label="Classes" value={totalClasses || 0} />
        </div>

        {/* Grades */}
        {grades.length > 0 && (
          <div className="mt-4">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2">
              Grades
            </div>
            <div className="flex flex-wrap gap-1">
              {grades.map((g) => (
                <span key={g} className="premium-pill !h-6 !px-2 !text-[10.5px]" data-active="true">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Invite method */}
        {inviteMethod && (
          <div className="mt-4 flex items-center gap-2 text-[12px]">
            <span className="inline-flex h-5 w-5 rounded-full items-center justify-center bg-primary text-primary-foreground">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-muted-foreground">
              Invites: <span className="text-foreground font-semibold">{teacherInviteMethodLabel(inviteMethod)}</span>
            </span>
          </div>
        )}

        {/* Priorities */}
        {priorities && priorities.length > 0 && (
          <div className="mt-4">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2">
              Tuned for
            </div>
            <div className="flex flex-wrap gap-1.5">
              {priorities.map((id) => {
                const p = PRIORITY_OPTIONS.find((o) => o.id === id);
                if (!p) return null;
                const Icon = p.Icon;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: `color-mix(in srgb, ${p.tone} 14%, transparent)`, color: p.tone }}
                  >
                    <Icon className="h-3 w-3" />
                    {p.label}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-2.5 text-center">
      <div className="font-heading font-extrabold text-[18px] tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* ─── Tiny primitives ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
