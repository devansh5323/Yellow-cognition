"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Users as UsersIcon,
  RotateCcw,
  UserX,
  Sparkles,
  CheckCircle2,
  Pencil,
  Copy,
  Trash2,
  History,
  Info,
  X,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { CheckInStatusBanner } from "@/components/dashboard/CheckInStatusBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  STUDENTS,
  SUBJECTS,
  GRADES,
  CLASS_SIZE_BUCKETS,
  TEACHING_MIN_BUCKETS,
  LOST_MIN_BUCKETS,
  COUNT_BUCKETS,
  BEHAVIOUR_RUBRIC,
  type Subject,
  type Grade,
  type ClassSizeBucket,
  type TeachingMinBucket,
  type LostMinBucket,
  type CountBucket,
  type ClassCheckIn,
  type StudentBehaviourRating,
  type BehaviourKey,
} from "@/data/mockData";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  saveCheckIn,
  newCheckInId,
  getLatestRatingsForTeacher,
  listCheckInsForTeacher,
  getCheckInById,
  deleteCheckIn,
} from "@/lib/checkIn";
import { getOnboarding, markTaskDone } from "@/lib/onboarding";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AppShell>
        <CheckInPage />
      </AppShell>
    </Suspense>
  );
}

const REVERSE_TOOLTIP =
  "Reverse-scored: higher ratings mean more disruption. We invert the score before ranking, so a 5 on 'Interrupts class' counts as worst — not best.";

function ReverseScoreInfo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center text-amber-600 hover:text-amber-700"
          aria-label="Reverse-scored explanation"
        >
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-[11.5px] leading-snug">
        {REVERSE_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}

function timeAgo(iso: string): string {
  const d = Date.now() - +new Date(iso);
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

type Step = 0 | 1 | 2 | 3;

function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = {
    edit: searchParams?.get("edit") ?? undefined,
    duplicate: searchParams?.get("duplicate") ?? undefined,
  };
  const [step, setStep] = useState<Step>(0);

  // Section A
  const [teacher, setTeacher] = useState("Maya Khan");
  const [grade, setGrade] = useState<Grade>("Grade 3");
  const [section, setSection] = useState("A");
  const [subject, setSubject] = useState<Subject>("Math");
  const [classSize, setClassSize] = useState<ClassSizeBucket>(">20");

  // Section B
  const [teachingMins, setTeachingMins] = useState<TeachingMinBucket>("30-35");
  const [behaviourMins, setBehaviourMins] = useState<LostMinBucket>("2-5");
  const [transitionMins, setTransitionMins] = useState<LostMinBucket>("<2");
  const [disruptions, setDisruptions] = useState<CountBucket>("3-5");
  const [repetitions, setRepetitions] = useState<CountBucket>("3-5");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null);
  const [historyTick, setHistoryTick] = useState(0);

  // Section C — pick the roster slice for the chosen grade/section
  const roster = useMemo(() => {
    const matched = STUDENTS.filter((s) => s.grade === grade);
    return matched.length ? matched : STUDENTS.slice(0, 12);
  }, [grade]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [ratings, setRatings] = useState<Record<string, StudentBehaviourRating>>({});

  const loadFromCheckIn = (c: ClassCheckIn, mode: "edit" | "duplicate") => {
    setTeacher(c.teacher);
    setGrade(c.grade);
    setSection(c.section ?? "A");
    setSubject(c.subject);
    setClassSize(c.classSize);
    setTeachingMins(c.teachingMins);
    setBehaviourMins(c.behaviourMins);
    setTransitionMins(c.transitionMins);
    setDisruptions(c.disruptions);
    setRepetitions(c.repetitions);
    const map: Record<string, StudentBehaviourRating> = {};
    for (const s of c.students) map[s.studentId] = s;
    setRatings(map);
    setActiveIdx(0);
    setStep(0);
    if (mode === "edit") {
      setEditingId(c.id);
      setEditingCreatedAt(c.createdAt);
    } else {
      setEditingId(null);
      setEditingCreatedAt(null);
    }
  };

  // Hydrate from ?edit= or ?duplicate= search param on mount.
  useEffect(() => {
    const id = search.edit ?? search.duplicate;
    if (!id) return;
    const c = getCheckInById(id);
    if (!c) return;
    loadFromCheckIn(c, search.edit ? "edit" : "duplicate");
    // strip the param so a refresh doesn't re-hydrate over user edits
    router.replace("/check-in");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ratedCount = Object.values(ratings).filter(
    (r) => r.absent || Object.keys(r.ratings).length === BEHAVIOUR_RUBRIC.length,
  ).length;
  const progress = Math.round((ratedCount / roster.length) * 100);

  const setRating = (sid: string, key: BehaviourKey, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [sid]: {
        studentId: sid,
        ratings: { ...prev[sid]?.ratings, [key]: value },
      },
    }));
  };
  const markAbsent = (sid: string) => {
    setRatings((prev) => ({ ...prev, [sid]: { studentId: sid, absent: true, ratings: {} } }));
  };
  const skip = () => {
    setActiveIdx((i) => Math.min(i + 1, roster.length - 1));
  };
  const advanceWhenComplete = (sid: string) => {
    const r = { ...ratings[sid]?.ratings };
    if (Object.keys(r).length >= BEHAVIOUR_RUBRIC.length - 1) {
      setTimeout(() => setActiveIdx((i) => Math.min(i + 1, roster.length - 1)), 200);
    }
  };

  const copyFromLastCheckIn = () => {
    const prev = getLatestRatingsForTeacher(teacher);
    const seeded: Record<string, StudentBehaviourRating> = {};
    for (const s of roster) {
      if (prev[s.id]) seeded[s.id] = { studentId: s.id, ratings: { ...prev[s.id] } };
    }
    if (Object.keys(seeded).length === 0) {
      toast.info("No previous check-in to copy from yet.");
      return;
    }
    setRatings((cur) => ({ ...seeded, ...cur }));
    toast.success(`Pre-filled ${Object.keys(seeded).length} students from last check-in.`);
  };

  const discardEdit = () => {
    setEditingId(null);
    setEditingCreatedAt(null);
    setRatings({});
    toast.info("Edit discarded.");
  };

  const submit = () => {
    const payload: ClassCheckIn = {
      id: editingId ?? newCheckInId(),
      createdAt: editingId && editingCreatedAt ? editingCreatedAt : new Date().toISOString(),
      teacher,
      grade,
      section,
      subject,
      classSize,
      teachingMins,
      behaviourMins,
      transitionMins,
      disruptions,
      repetitions,
      students: roster.map((s) => ratings[s.id] ?? { studentId: s.id, ratings: {} }),
    };
    // Captured before saveCheckIn/markTaskDone so we know whether THIS
    // submission is the one completing the setup journey's check-in stage —
    // listCheckInsForTeacher() can't be used for that since this app ships
    // with seeded demo check-ins that are already present either way.
    const wasFirstCheckinDone = !!getOnboarding().tasks["first-checkin"];
    saveCheckIn(payload);
    if (!editingId && !wasFirstCheckinDone) {
      markTaskDone("first-checkin");
      toast.success("Check-in saved! Let's log a behaviour observation next.");
      router.push("/dashboard?focus=teacher-tools");
      return;
    }
    toast.success(editingId ? "Check-in updated." : "Check-in saved. Insights updated.");
    router.push("/friction");
  };

  const history = useMemo(
    () => listCheckInsForTeacher(teacher),
    // re-run whenever historyTick changes (delete) or teacher changes
    [teacher, historyTick],
  );

  const handleResume = (c: ClassCheckIn) => {
    loadFromCheckIn(c, "edit");
    toast.success("Loaded for editing.");
  };
  const handleDuplicate = (c: ClassCheckIn) => {
    loadFromCheckIn(c, "duplicate");
    toast.success("Duplicated — submit to save as a new check-in.");
  };
  const handleDelete = (id: string) => {
    if (!confirm("Delete this check-in? This cannot be undone.")) return;
    deleteCheckIn(id);
    if (editingId === id) discardEdit();
    setHistoryTick((t) => t + 1);
    toast.success("Check-in deleted.");
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1) as Step);
  const goNext = () => setStep((s) => Math.min(3, s + 1) as Step);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Cadence banner — surfaces the monthly check-in status */}
        <CheckInStatusBanner />

        {/* Header */}
        <header className="premium-elevated rounded-[22px] p-6 md:p-7 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background: editingId
                ? "radial-gradient(60% 50% at 0% 0%, hsl(38 92% 80% / 0.34), transparent 60%), radial-gradient(60% 50% at 100% 20%, hsl(38 92% 70% / 0.22), transparent 65%)"
                : "radial-gradient(60% 50% at 0% 0%, hsl(200 70% 80% / 0.30), transparent 60%), radial-gradient(60% 50% at 100% 20%, hsl(142 60% 80% / 0.28), transparent 65%)",
            }}
          />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="premium-eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>
                  {editingId
                    ? `Editing check-in from ${editingCreatedAt ? new Date(editingCreatedAt).toLocaleDateString() : "earlier"}`
                    : "Class check-in · ~2 min"}
                </span>
              </div>
              <h1 className="mt-2 font-heading font-extrabold text-[24px] md:text-[30px] leading-tight">
                {editingId ? "Update this check-in" : "How did this class go?"}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground max-w-xl">
                {editingId
                  ? "Changes will overwrite the existing submission."
                  : "Tap-only inputs. Your ratings power the school's instructional friction insights."}
              </p>
              {editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={discardEdit}
                  className="mt-2 -ml-2 text-[12px] text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Discard changes
                </Button>
              )}
            </div>
            <Stepper step={step} />
          </div>
        </header>

        {/* Step body */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <Section key="a" title="Class context">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Teacher name</Label>
                  <Input
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value.slice(0, 80))}
                    placeholder="Your name"
                  />
                </div>
                <ChipField
                  label="Grade"
                  options={GRADES.slice(0, 10)}
                  value={grade}
                  onChange={(v) => setGrade(v as Grade)}
                />
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Section</Label>
                  <div className="flex gap-2">
                    {["A", "B", "C"].map((s) => (
                      <Chip key={s} active={section === s} onClick={() => setSection(s)}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
                <ChipField
                  label="Subject"
                  options={SUBJECTS}
                  value={subject}
                  onChange={(v) => setSubject(v as Subject)}
                />
                <ChipField
                  label="Class size"
                  options={CLASS_SIZE_BUCKETS}
                  value={classSize}
                  onChange={(v) => setClassSize(v as ClassSizeBucket)}
                />
              </div>
            </Section>
          )}

          {step === 1 && (
            <Section key="b" title="Instructional time">
              <div className="space-y-5">
                <ChipField
                  label="Effective teaching minutes per class"
                  options={TEACHING_MIN_BUCKETS}
                  value={teachingMins}
                  onChange={(v) => setTeachingMins(v as TeachingMinBucket)}
                />
                <ChipField
                  label="Minutes lost to behaviour management"
                  options={LOST_MIN_BUCKETS}
                  value={behaviourMins}
                  onChange={(v) => setBehaviourMins(v as LostMinBucket)}
                />
                <ChipField
                  label="Minutes lost to transitions between activities"
                  options={LOST_MIN_BUCKETS}
                  value={transitionMins}
                  onChange={(v) => setTransitionMins(v as LostMinBucket)}
                />
                <ChipField
                  label="Disruptive incidents per class"
                  options={COUNT_BUCKETS}
                  value={disruptions}
                  onChange={(v) => setDisruptions(v as CountBucket)}
                />
                <ChipField
                  label="Times instructions had to be repeated"
                  options={COUNT_BUCKETS}
                  value={repetitions}
                  onChange={(v) => setRepetitions(v as CountBucket)}
                />
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section
              key="c"
              title="Per-student behaviour"
              right={
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={copyFromLastCheckIn}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Same as last check-in
                  </Button>
                  <div className="text-[12px] font-semibold text-muted-foreground tabular-nums">
                    {ratedCount} / {roster.length} rated
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                <Progress value={progress} className="h-1.5" />

                <RubricGrid
                  roster={roster}
                  activeIdx={activeIdx}
                  setActiveIdx={setActiveIdx}
                  ratings={ratings}
                  setRating={(sid, key, val) => {
                    setRating(sid, key, val);
                    advanceWhenComplete(sid);
                  }}
                  markAbsent={markAbsent}
                  skip={skip}
                />
              </div>
            </Section>
          )}

          {step === 3 && (
            <Section key="d" title="Review & submit">
              <ReviewSummary
                teacher={teacher}
                grade={grade}
                section={section}
                subject={subject}
                classSize={classSize}
                teachingMins={teachingMins}
                behaviourMins={behaviourMins}
                transitionMins={transitionMins}
                disruptions={disruptions}
                repetitions={repetitions}
                roster={roster}
                ratings={ratings}
              />
            </Section>
          )}
        </AnimatePresence>

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={goPrev} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {step < 3 ? (
            <Button onClick={goNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} className="bg-primary hover:bg-primary/90">
              <Check className="h-4 w-4 mr-1" /> Submit check-in
            </Button>
          )}
        </div>

        {/* History panel — recent check-ins at the bottom */}
        {history.length > 0 && (
          <HistoryPanel
            history={history}
            editingId={editingId}
            onResume={handleResume}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// ───────────────── helpers ─────────────────

function Stepper({ step }: { step: Step }) {
  const labels = ["Class", "Time", "Students", "Review"];
  return (
    <ol className="flex items-center gap-1.5">
      {labels.map((l, i) => (
        <li key={l} className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-6 min-w-6 px-2 rounded-full text-[11px] font-bold inline-flex items-center justify-center transition-colors",
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < step ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className="text-[11px] font-semibold hidden sm:inline">{l}</span>
          {i < labels.length - 1 && <span className="w-4 h-px bg-border mx-1" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="premium-elevated rounded-[22px] p-6 md:p-7"
    >
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h2 className="font-heading font-extrabold text-[18px]">{title}</h2>
        {right}
      </div>
      {children}
    </motion.section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 min-w-[56px] px-3.5 rounded-xl border text-[13px] font-semibold transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_14px_-6px_hsl(142_55%_35%/0.5)]"
          : "bg-card hover:bg-muted/60 border-border text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ChipField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-semibold">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={o === value} onClick={() => onChange(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function RubricGrid({
  roster,
  activeIdx,
  setActiveIdx,
  ratings,
  setRating,
  markAbsent,
  skip,
}: {
  roster: typeof STUDENTS;
  activeIdx: number;
  setActiveIdx: (n: number) => void;
  ratings: Record<string, StudentBehaviourRating>;
  setRating: (sid: string, key: BehaviourKey, val: number) => void;
  markAbsent: (sid: string) => void;
  skip: () => void;
}) {
  const student = roster[activeIdx];
  if (!student) return null;
  const r = ratings[student.id];

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-5">
      {/* roster sidebar */}
      <ul className="border border-border rounded-xl divide-y divide-border max-h-[420px] overflow-auto">
        {roster.map((s, i) => {
          const rated =
            ratings[s.id]?.absent ||
            (ratings[s.id] &&
              Object.keys(ratings[s.id]!.ratings).length === BEHAVIOUR_RUBRIC.length);
          return (
            <li key={s.id}>
              <button
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors",
                  i === activeIdx ? "bg-primary/10" : "hover:bg-muted/60",
                )}
              >
                <StudentAvatar student={s} size="sm" />
                <span className="flex-1 truncate font-semibold">{s.name}</span>
                {rated && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {ratings[s.id]?.absent && (
                  <Badge variant="outline" className="text-[10px]">
                    Absent
                  </Badge>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* rubric pane */}
      <div className="rounded-xl border border-border p-5 bg-card/50">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <StudentAvatar student={student} size="md" />
            <div>
              <div className="font-heading font-extrabold text-[16px]">{student.name}</div>
              <div className="text-[11.5px] text-muted-foreground">
                {student.grade} · Section {student.section} · {activeIdx + 1} of {roster.length}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAbsent(student.id)}>
              <UserX className="h-3.5 w-3.5 mr-1.5" /> Absent
            </Button>
            <Button variant="ghost" size="sm" onClick={skip}>
              Skip
            </Button>
          </div>
        </div>

        <div className="space-y-3.5">
          {BEHAVIOUR_RUBRIC.map((rule) => {
            const min = rule.min;
            const max = rule.max;
            const opts: number[] = [];
            for (let v = min; v <= max; v++) opts.push(v);
            const cur = r?.ratings[rule.id];
            return (
              <div key={rule.id} className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold flex items-center gap-1.5">
                    {rule.label}
                    {rule.reverse && (
                      <>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          (lower is better)
                        </span>
                        <ReverseScoreInfo />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {opts.map((v) => (
                    <button
                      key={v}
                      onClick={() => setRating(student.id, rule.id, v)}
                      className={cn(
                        "h-10 w-10 rounded-lg text-[14px] font-bold border transition-all",
                        cur === v
                          ? "bg-primary text-primary-foreground border-primary scale-105"
                          : "bg-card hover:bg-muted/70 border-border",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous student
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveIdx(Math.min(roster.length - 1, activeIdx + 1))}
            disabled={activeIdx === roster.length - 1}
          >
            Next student <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewSummary(props: {
  teacher: string;
  grade: Grade;
  section: string;
  subject: Subject;
  classSize: ClassSizeBucket;
  teachingMins: TeachingMinBucket;
  behaviourMins: LostMinBucket;
  transitionMins: LostMinBucket;
  disruptions: CountBucket;
  repetitions: CountBucket;
  roster: typeof STUDENTS;
  ratings: Record<string, StudentBehaviourRating>;
}) {
  const { roster, ratings } = props;
  const ratedCount = Object.values(ratings).filter(
    (r) => r.absent || Object.keys(r.ratings).length > 0,
  ).length;
  const absentCount = Object.values(ratings).filter((r) => r.absent).length;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border p-4 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground">
            Class context
          </span>
        </div>
        <dl className="text-[13px] space-y-1.5">
          <Row k="Teacher" v={props.teacher} />
          <Row k="Class" v={`${props.grade} · Section ${props.section} · ${props.subject}`} />
          <Row k="Class size" v={props.classSize} />
          <Row k="Teaching mins" v={props.teachingMins} />
          <Row k="Behaviour mins lost" v={props.behaviourMins} />
          <Row k="Transition mins lost" v={props.transitionMins} />
          <Row k="Disruptions" v={props.disruptions} />
          <Row k="Instruction repeats" v={props.repetitions} />
        </dl>
      </div>
      <div className="rounded-xl border border-border p-4 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <UsersIcon className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground">
            Students
          </span>
        </div>
        <div className="flex gap-3 text-[13px] mb-3">
          <span className="font-bold tabular-nums">{ratedCount}</span>
          <span className="text-muted-foreground">of {roster.length} captured</span>
          {absentCount > 0 && (
            <Badge variant="outline" className="ml-auto text-[10px]">
              {absentCount} absent
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {roster.map((s) => {
            const r = ratings[s.id];
            const status = r?.absent
              ? "absent"
              : r && Object.keys(r.ratings).length > 0
                ? "rated"
                : "missing";
            return (
              <span
                key={s.id}
                title={`${s.name} · ${status}`}
                className={cn(
                  "h-6 px-2 rounded-md text-[10.5px] font-semibold border",
                  status === "rated" && "bg-primary/10 border-primary/30 text-primary",
                  status === "absent" && "bg-muted text-muted-foreground border-border",
                  status === "missing" &&
                    "bg-destructive/10 border-destructive/25 text-destructive",
                )}
              >
                {s.initials}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}

function HistoryPanel({
  history,
  editingId,
  onResume,
  onDuplicate,
  onDelete,
}: {
  history: ClassCheckIn[];
  editingId: string | null;
  onResume: (c: ClassCheckIn) => void;
  onDuplicate: (c: ClassCheckIn) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="premium-elevated rounded-[22px] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-extrabold text-[15px]">My recent check-ins</h3>
          <Badge variant="outline" className="text-[10.5px]">
            {history.length}
          </Badge>
        </div>
        <ChevronRight
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <ul className="mt-3 divide-y divide-border border border-border rounded-xl overflow-hidden">
          {history.slice(0, 6).map((c) => {
            const totalRoster = c.students.length;
            const rated = c.students.filter(
              (s) => s.absent || Object.keys(s.ratings).length > 0,
            ).length;
            const isEditing = c.id === editingId;
            return (
              <li
                key={c.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[12.5px]",
                  isEditing && "bg-amber-500/10",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {c.grade}
                    {c.section ?? ""} · {c.subject}
                    {isEditing && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]"
                      >
                        editing
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span>{timeAgo(c.createdAt)}</span>
                    <span>{c.classSize} students</span>
                    <span>
                      rated {rated}/{totalRoster}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onResume(c)}
                    title="Resume / edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onDuplicate(c)}
                    title="Duplicate as new check-in"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={() => onDelete(c.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
