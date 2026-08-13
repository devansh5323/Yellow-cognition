"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
  Loader2,
  Mic,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { CheckInStatusBanner } from "@/components/dashboard/CheckInStatusBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClassCheckInReport } from "@/components/reports/ClassCheckInReport";
import { cn } from "@/lib/utils";
import {
  STUDENTS,
  SUBJECTS,
  TEACHING_MIN_BUCKETS,
  LOST_MIN_BUCKETS,
  COUNT_BUCKETS,
  BEHAVIOUR_RUBRIC,
  type ClassCheckIn,
  type StudentBehaviourRating,
} from "@/data/mockData";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";
import { saveCheckIn, newCheckInId, listCheckInsForTeacher, deleteCheckIn } from "@/lib/checkIn";
import { getOnboarding, markTaskDone } from "@/lib/onboarding";
import { toast } from "sonner";

export default function Page() {
  return (
    <AppShell>
      <CheckInPage />
    </AppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const VIOLET = "hsl(262 60% 62%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";

// Purely decorative — gives each row in the recordings list a distinct
// color/initial so the list is scannable at a glance, same "small colored
// avatar" convention used for driver cards and student avatars elsewhere.
const SUBJECT_TONE: Record<string, string> = {
  Math: BLUE,
  Science: GREEN,
  English: VIOLET,
  Social: AMBER,
  Hindi: RED,
};

// Fixed to this demo teacher's one classroom (matches the "Grade 3 — Section
// A" pill in the dashboard header) — subject is the only thing that varies
// recording to recording, since the same class gets checked in on across
// different periods/subjects.
const GRADE = "Grade 3" as const;
const SECTION = "A";
const CLASS_SIZE = ">20" as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Simulates "Yellow" turning a recorded session into a class check-in —
 * random-but-plausible instructional-time buckets and per-student rubric
 * scores, same shape a manually-filled check-in would produce, so every
 * downstream metric (Class Health, driver cards, friction insights) keeps
 * working without the teacher entering anything by hand. */
function buildRecordedCheckIn(): ClassCheckIn {
  const roster = STUDENTS.filter((s) => s.grade === GRADE);
  const rosterFinal = roster.length ? roster : STUDENTS.slice(0, 12);

  const students: StudentBehaviourRating[] = rosterFinal.map((s) => {
    if (Math.random() < 0.05) {
      return { studentId: s.id, absent: true, ratings: {} };
    }
    const ratings: StudentBehaviourRating["ratings"] = {};
    for (const rule of BEHAVIOUR_RUBRIC) {
      ratings[rule.id] = rule.min + Math.floor(Math.random() * (rule.max - rule.min + 1));
    }
    return { studentId: s.id, ratings };
  });

  return {
    id: newCheckInId(),
    createdAt: new Date().toISOString(),
    teacher: TEACHER_NAME,
    grade: GRADE,
    section: SECTION,
    subject: pick(SUBJECTS),
    classSize: CLASS_SIZE,
    teachingMins: pick(TEACHING_MIN_BUCKETS),
    behaviourMins: pick(LOST_MIN_BUCKETS),
    transitionMins: pick(LOST_MIN_BUCKETS),
    disruptions: pick(COUNT_BUCKETS),
    repetitions: pick(COUNT_BUCKETS),
    students,
  };
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

type RecordState = "idle" | "recording" | "saving" | "saved" | "insights";

function CheckInPage() {
  const router = useRouter();
  const [historyTick, setHistoryTick] = useState(0);
  const history = useMemo(
    () => listCheckInsForTeacher(TEACHER_NAME),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historyTick],
  );

  const [recState, setRecState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isFirstCheckin, setIsFirstCheckin] = useState(false);
  const [reportCheckIn, setReportCheckIn] = useState<ClassCheckIn | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = () => {
    setElapsed(0);
    setRecState("recording");
    intervalRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRecState("saving");

    const wasFirstCheckinDone = !!getOnboarding().tasks["first-checkin"];
    setIsFirstCheckin(!wasFirstCheckinDone);

    window.setTimeout(() => {
      const payload = buildRecordedCheckIn();
      saveCheckIn(payload);
      if (!wasFirstCheckinDone) markTaskDone("first-checkin");
      setHistoryTick((t) => t + 1);
      setRecState("saved");

      window.setTimeout(() => setRecState("insights"), 1300);
    }, 900);
  };

  useEffect(() => {
    if (recState === "insights" && isFirstCheckin) {
      const t = window.setTimeout(() => {
        toast.success("Let's log a behaviour observation next.");
        router.push("/dashboard?focus=teacher-tools");
      }, 1800);
      return () => window.clearTimeout(t);
    }
  }, [recState, isFirstCheckin, router]);

  const recordAnother = () => {
    setRecState("idle");
    setElapsed(0);
    setIsFirstCheckin(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    deleteCheckIn(id);
    setHistoryTick((t) => t + 1);
    toast.success("Recording deleted.");
  };

  return (
    <TooltipProvider delayDuration={150}>
    <div className="space-y-6 max-w-3xl mx-auto">
      <CheckInStatusBanner hideCta />

      <RecordCard
        recState={recState}
        elapsed={elapsed}
        onStart={startRecording}
        onStop={stopRecording}
        onRecordAnother={recordAnother}
        onViewInsights={() => router.push("/friction")}
        isFirstCheckin={isFirstCheckin}
      />

      {history.length > 0 && (
        <HistoryPanel
          history={history}
          onDelete={handleDelete}
          onViewReport={setReportCheckIn}
        />
      )}
    </div>

    <Dialog open={!!reportCheckIn} onOpenChange={(o) => !o && setReportCheckIn(null)}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {reportCheckIn && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-[18px]">
                {reportCheckIn.grade}
                {reportCheckIn.section} · {reportCheckIn.subject}
              </DialogTitle>
              <DialogDescription>
                {new Date(reportCheckIn.createdAt).toLocaleString()} · {reportCheckIn.classSize}{" "}
                students · {reportCheckIn.students.length} rated
              </DialogDescription>
            </DialogHeader>
            <ClassCheckInReport checkIn={reportCheckIn} />
          </>
        )}
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

// ───────────────── Record card ─────────────────

function RecordCard({
  recState,
  elapsed,
  onStart,
  onStop,
  onRecordAnother,
  onViewInsights,
  isFirstCheckin,
}: {
  recState: RecordState;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRecordAnother: () => void;
  onViewInsights: () => void;
  isFirstCheckin: boolean;
}) {
  return (
    <section className="premium-elevated rounded-[28px] p-8 md:p-14 flex flex-col items-center text-center min-h-[380px] justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, " +
            BLUE +
            " 7%, transparent), color-mix(in srgb, " +
            VIOLET +
            " 9%, transparent))",
        }}
      />
      <div className="relative z-10 flex flex-col items-center w-full">
      <AnimatePresence mode="wait">
        {recState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center"
          >
            <div className="premium-eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Class check-in</span>
            </div>
            <h1 className="mt-2 font-heading font-extrabold text-[24px] md:text-[28px] leading-tight">
              Record today&apos;s class
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground max-w-sm">
              Yellow listens in and turns it into your class check-in automatically — no manual
              entry needed.
            </p>

            <button
              type="button"
              onClick={onStart}
              aria-label="Start recording today's class"
              className="relative h-24 w-24 mt-7 rounded-full inline-flex items-center justify-center transition-colors shadow-lg bg-primary hover:bg-primary/90 shadow-primary/30"
            >
              <Mic className="h-9 w-9 text-primary-foreground" />
            </button>
            <p className="mt-4 text-[14px] font-semibold text-foreground">
              Tap to start recording
            </p>
            <p className="mt-5 text-[11.5px] text-muted-foreground/80 max-w-xs">
              Only classroom patterns are analysed — nothing is stored as raw audio.
            </p>
          </motion.div>
        )}

        {recState === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop recording"
              className="relative h-24 w-24 rounded-full inline-flex items-center justify-center transition-colors shadow-lg bg-red-500 hover:bg-red-600 shadow-red-500/30"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-red-500"
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-red-500"
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              />
              <Square className="h-8 w-8 text-white fill-white" />
            </button>

            <div className="mt-5 font-heading font-extrabold text-[26px] tabular-nums tracking-wide">
              {formatElapsed(elapsed)}
            </div>
            <Waveform />
            <p className="mt-4 text-[13px] font-semibold text-red-500 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Recording — tap to stop
            </p>
          </motion.div>
        )}

        {recState === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[14px] font-semibold text-muted-foreground">
              Saving your recording&hellip;
            </p>
          </motion.div>
        )}

        {recState === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-col items-center gap-3"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="h-14 w-14 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.span>
            <div>
              <p className="font-heading font-extrabold text-[18px]">Recording saved.</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Yellow is reviewing it now&hellip;
              </p>
            </div>
          </motion.div>
        )}

        {recState === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-4"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative h-16 w-16 rounded-2xl bg-primary/15 text-primary inline-flex items-center justify-center"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
              <Sparkles className="h-8 w-8" />
            </motion.span>
            <div className="max-w-sm">
              <p className="font-heading font-extrabold text-[19px] leading-snug">
                Yellow found new insights from this recording
              </p>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
                {isFirstCheckin
                  ? "Taking you to log a behaviour observation next…"
                  : "See what stood out in today's class."}
              </p>
            </div>
            {!isFirstCheckin && (
              <div className="flex items-center gap-2.5 mt-1">
                <Button variant="outline" onClick={onRecordAnother}>
                  Record another
                </Button>
                <Button onClick={onViewInsights} className="gap-1.5">
                  View insights
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}

function Waveform() {
  const bars = 9;
  return (
    <div className="mt-4 flex items-center gap-1 h-8" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-red-500/70"
          style={{ height: "100%" }}
          animate={{ scaleY: [0.25, 1, 0.4, 0.85, 0.25] }}
          transition={{
            duration: 1 + (i % 4) * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
        />
      ))}
    </div>
  );
}

// ───────────────── History panel ─────────────────

function HistoryPanel({
  history,
  onDelete,
  onViewReport,
}: {
  history: ClassCheckIn[];
  onDelete: (id: string) => void;
  onViewReport: (checkIn: ClassCheckIn) => void;
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
          <h3 className="font-heading font-extrabold text-[15px]">My recent recordings</h3>
          <Badge variant="outline" className="text-[10.5px]">
            {history.length}
          </Badge>
        </div>
        <ChevronRight
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-90")}
        />
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {history.slice(0, 6).map((c) => {
            const totalRoster = c.students.length;
            const rated = c.students.filter(
              (s) => s.absent || Object.keys(s.ratings).length > 0,
            ).length;
            const tone = SUBJECT_TONE[c.subject] ?? BLUE;
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-[12.5px] transition-colors hover:border-foreground/15 hover:bg-background/80"
              >
                <span
                  className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0 font-heading font-extrabold text-[13px]"
                  style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                  aria-hidden
                >
                  {c.subject.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {c.grade}
                    {c.section ?? ""} · {c.subject}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span>{timeAgo(c.createdAt)}</span>
                    <span>{c.classSize} students</span>
                    <span>
                      rated {rated}/{totalRoster}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1.5 text-[11.5px] font-semibold"
                    onClick={() => onViewReport(c)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View report
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
