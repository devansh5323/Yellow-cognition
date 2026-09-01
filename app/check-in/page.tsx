"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  History,
  Loader2,
  Mic,
  MoreVertical,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Sun,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { CheckInStatusBanner } from "@/components/dashboard/CheckInStatusBanner";
import { CheckInToolsGrid } from "@/components/dashboard/CheckInToolsGrid";
import { CheckInToolsTour } from "@/components/onboarding/CheckInToolsTour";
import { FtueCompleteDialog } from "@/components/onboarding/FtueCompleteDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClassCheckInReport } from "@/components/reports/ClassCheckInReport";
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
import { TEACHER_NAME, timeOfDayGreeting } from "@/components/dashboard/DataReadinessCard";
import { saveCheckIn, newCheckInId, listCheckInsForTeacher, deleteCheckIn } from "@/lib/checkIn";
import { computeFtueStage, isFtueDone, markTaskDone, type FtueStage } from "@/lib/onboarding";
import { getPositiveLogCountThisWeek } from "@/lib/checkInTools";
import { getPendingFollowUpCount, getPendingFollowUps } from "@/lib/interventionFollowUps";
import { hasRecordingConsent, setRecordingConsent } from "@/lib/recordingConsent";
import { toast } from "sonner";

const CONSENT_POINTS = [
  "Used to generate classroom insights",
  "Focuses on classroom-level patterns, not individual conversations",
  "Not used to evaluate your teaching",
] as const;

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

type RecordState = "idle" | "recording" | "saving" | "generating" | "insights";

function CheckInPage() {
  const router = useRouter();
  const [historyTick, setHistoryTick] = useState(0);
  const history = useMemo(
    () => listCheckInsForTeacher(TEACHER_NAME),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historyTick],
  );

  // Two sections only make sense once a teacher has actually graduated out
  // of first-time setup: the monthly-check-in status banner ("overdue" reads
  // oddly for something a brand-new teacher never started) and Recent
  // recordings (nothing to review yet, and seeded demo history would
  // otherwise leak through for a technically-fresh session). Same "done"
  // gate the dashboard itself uses.
  const [showRtueSections, setShowRtueSections] = useState(false);
  const [ftueStage, setFtueStage] = useState<FtueStage>("cards");
  useEffect(() => {
    const refresh = () => {
      setShowRtueSections(isFtueDone());
      setFtueStage(computeFtueStage());
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

  // The FTUE's final step — a purely explanatory walkthrough of this page's
  // tools. Finishing (or dismissing) it flips the stage to "done" — instead
  // of silently redirecting, show a real "you're done" beat first, and only
  // head back to the (now-unlocked) dashboard once the teacher dismisses it.
  const [showComplete, setShowComplete] = useState(false);
  const finishTour = () => setShowComplete(true);
  const handleCompleteDone = () => {
    setShowComplete(false);
    router.push("/dashboard?focus=classroom-health");
  };

  const [headerStats, setHeaderStats] = useState({
    positivesThisWeek: 0,
    followUpsPending: 0,
    followUpStudentId: undefined as string | undefined,
    followUpReason: undefined as string | undefined,
  });
  useEffect(() => {
    const refresh = () => {
      const followUpTarget = getPendingFollowUps()[0];
      setHeaderStats({
        positivesThisWeek: getPositiveLogCountThisWeek(),
        followUpsPending: getPendingFollowUpCount(),
        followUpStudentId: followUpTarget?.student.id,
        followUpReason: followUpTarget?.reason,
      });
    };
    refresh();
    window.addEventListener("ah-positive-log-change", refresh);
    window.addEventListener("ah-followup-change", refresh);
    return () => {
      window.removeEventListener("ah-positive-log-change", refresh);
      window.removeEventListener("ah-followup-change", refresh);
    };
  }, []);

  const openNextFollowUp = () => {
    window.dispatchEvent(
      new CustomEvent("ah-open-followup-form", {
        detail: headerStats.followUpStudentId
          ? { studentId: headerStats.followUpStudentId, reason: headerStats.followUpReason }
          : {},
      }),
    );
  };

  const [recState, setRecState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [reportCheckIn, setReportCheckIn] = useState<ClassCheckIn | null>(null);
  const intervalRef = useRef<number | null>(null);
  // Bumped whenever the card moves off "generating" early (e.g. the teacher
  // taps "Record another class" instead of waiting) so the still-pending
  // generating→insights timer from the *previous* recording becomes a no-op
  // instead of yanking the card back to "insights" mid-way through the next one.
  const generationTokenRef = useRef(0);

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

  // The browser's own microphone permission prompt handles technical
  // access — separate from the product consent dialog below, which is
  // about what Yellow does with the recording, not device access.
  const beginRecording = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      startRecording();
    } catch {
      toast.error("Microphone access is required to record your classroom.");
    }
  };

  // First-ever recording asks for consent before anything is captured —
  // every recording after that goes straight through. Revoking it from
  // Settings brings this prompt back for the next one.
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const requestStart = () => {
    if (hasRecordingConsent()) {
      beginRecording();
      return;
    }
    setConsentChecked(false);
    setConsentOpen(true);
  };

  const confirmConsentAndContinue = () => {
    setRecordingConsent(true);
    setConsentOpen(false);
    beginRecording();
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRecState("saving");

    window.setTimeout(() => {
      const payload = buildRecordedCheckIn();
      saveCheckIn(payload);
      markTaskDone("first-checkin");
      setHistoryTick((t) => t + 1);
      setRecState("generating");

      // Simulates the backend's real insight-generation turnaround. The
      // "Record another class" CTA on this state means a teacher never has
      // to sit and wait for it — the check-in is already saved above, so
      // insights simply finish in the background and land in Recent
      // recordings whenever this timer (or a future real API) resolves.
      const token = ++generationTokenRef.current;
      window.setTimeout(() => {
        if (generationTokenRef.current === token) setRecState("insights");
      }, 4000);
    }, 900);
  };

  const recordAnother = () => {
    generationTokenRef.current++;
    setRecState("idle");
    setElapsed(0);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    deleteCheckIn(id);
    setHistoryTick((t) => t + 1);
    toast.success("Recording deleted.");
  };

  return (
    <TooltipProvider delayDuration={150}>
    <div className="space-y-9 md:space-y-11 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3.5">
          <span className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 inline-flex items-center justify-center shrink-0">
            <Sun className="h-5.5 w-5.5" />
          </span>
          <div>
            <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight">
              {timeOfDayGreeting()}, {TEACHER_NAME.split(" ")[0]} <span aria-hidden>👋</span>
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Here&apos;s what needs your attention today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-2.5 flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 inline-flex items-center justify-center shrink-0">
              <Star className="h-4 w-4" />
            </span>
            <div>
              <div className="font-heading font-extrabold text-[16px] leading-none">
                {headerStats.positivesThisWeek}
              </div>
              <div className="text-[10.5px] text-muted-foreground mt-1 flex items-center gap-1 whitespace-nowrap">
                Positives logged this week
                <ArrowUp className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openNextFollowUp}
            className="rounded-2xl border border-border bg-card px-4 py-2.5 flex items-center gap-2.5 text-left transition-colors hover:bg-muted/30"
          >
            <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="font-heading font-extrabold text-[16px] leading-none">
                {headerStats.followUpsPending}
              </div>
              <div className="text-[10.5px] text-muted-foreground mt-1 flex items-center gap-1 whitespace-nowrap">
                Follow-ups pending
                <ChevronRight className="h-2.5 w-2.5 shrink-0" />
              </div>
            </div>
          </button>
        </div>
      </header>

      {showRtueSections && <CheckInStatusBanner hideCta />}

      <RecordCard
        recState={recState}
        elapsed={elapsed}
        onStart={requestStart}
        onStop={stopRecording}
        onRecordAnother={recordAnother}
        onViewInsights={() => router.push("/friction")}
      />

      <CheckInToolsGrid />

      {showRtueSections && (
        <HistoryPanel history={history} onDelete={handleDelete} onViewReport={setReportCheckIn} />
      )}
    </div>

    <CheckInToolsTour active={ftueStage === "tour"} onDone={finishTour} />
    <FtueCompleteDialog open={showComplete} onDone={handleCompleteDone} />

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

    <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
      <DialogContent className="max-w-lg p-8 gap-6">
        <DialogHeader>
          <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center mb-1">
            <Mic className="h-5 w-5" />
          </div>
          <DialogTitle className="font-heading text-[19px]">A quick note before you start</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            Yellow listens to your classroom recording to identify patterns in behaviour,
            engagement, and learning readiness.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            What happens to your recording?
          </p>
          <ul className="space-y-2.5">
            {CONSENT_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-[13.5px] text-foreground/90 leading-snug">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-muted-foreground leading-snug">
            Your recording will only be used to power Yellow&apos;s classroom insights.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4 cursor-pointer">
          <Checkbox
            checked={consentChecked}
            onCheckedChange={(v) => setConsentChecked(v === true)}
            className="h-5 w-5 rounded-full"
          />
          <span className="text-[13.5px] font-semibold leading-snug">I understand and agree</span>
        </label>

        <Button
          className="w-full h-12 gap-1.5 text-[14.5px]"
          disabled={!consentChecked}
          onClick={confirmConsentAndContinue}
        >
          Start recording
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-[11.5px] text-muted-foreground text-center -mt-1 inline-flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          You can manage this permission anytime in Settings.
        </p>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

// ───────────────── Record card ─────────────────

const HOW_IT_WORKS = [
  { Icon: Mic, text: "Yellow listens in and captures key signals" },
  { Icon: Sparkles, text: "Patterns are analysed instantly" },
  { Icon: ClipboardCheck, text: "Insights and recommendations are generated" },
] as const;

function RecordCard({
  recState,
  elapsed,
  onStart,
  onStop,
  onRecordAnother,
  onViewInsights,
}: {
  recState: RecordState;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRecordAnother: () => void;
  onViewInsights: () => void;
}) {
  return (
    <section
      data-tour-target="record-card"
      className="premium-elevated rounded-[28px] px-8 py-11 md:px-12 md:py-14 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 65% at 50% 38%, color-mix(in srgb, " +
            GREEN +
            " 10%, transparent), transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full">
      <AnimatePresence mode="wait">
        {recState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-6"
          >
            <div className="flex-1 min-w-0 text-center lg:text-left">
              <div className="premium-eyebrow justify-center lg:justify-start">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Classroom log</span>
              </div>
              <h2 className="mt-2 font-heading font-extrabold text-[24px] md:text-[28px] leading-tight">
                Record today&apos;s class
              </h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground max-w-sm mx-auto lg:mx-0">
                Turn today&apos;s classroom activity into useful insights, automatically.
              </p>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={onStart}
                  className="inline-flex items-center gap-2 rounded-xl px-5 h-11 bg-primary text-primary-foreground font-heading font-bold text-[13.5px] shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mic className="h-4 w-4" />
                  Start recording
                </button>
                <span className="text-[12px] text-muted-foreground">No manual entry needed</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-3 mx-auto lg:mx-6">
              <button
                type="button"
                onClick={onStart}
                aria-label="Start recording today's class"
                className="group relative h-24 w-24 rounded-full inline-flex items-center justify-center transition-transform hover:scale-[1.03] active:scale-[0.97] shadow-lg bg-primary shadow-primary/30"
              >
                <span
                  className="absolute -inset-3 rounded-full opacity-40 transition-opacity group-hover:opacity-60"
                  style={{ background: `color-mix(in srgb, ${GREEN} 22%, transparent)`, filter: "blur(10px)" }}
                  aria-hidden
                />
                <Mic className="relative h-9 w-9 text-primary-foreground" />
              </button>
              <p className="text-[13px] font-semibold text-foreground">Tap to start recording</p>
              <p className="text-[11px] text-muted-foreground/80 max-w-[200px] text-center">
                Only classroom patterns are analysed — nothing is stored as raw audio.
              </p>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-3.5 max-w-xs mx-auto lg:mx-0">
              {HOW_IT_WORKS.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[12.5px] text-muted-foreground leading-snug text-left">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {recState === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="w-full flex flex-col items-center text-center"
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
            className="w-full flex flex-col items-center gap-3 text-center"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[14px] font-semibold text-muted-foreground">
              Saving your recording&hellip;
            </p>
          </motion.div>
        )}

        {recState === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="w-full flex flex-col items-center gap-4 text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11.5px] font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Recording saved
            </span>

            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative h-14 w-14 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center"
            >
              <Loader2 className="h-7 w-7 animate-spin" />
            </motion.span>

            <div className="max-w-sm">
              <p className="font-heading font-extrabold text-[18px] leading-snug">
                Yellow is generating insights
              </p>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
                We&apos;re analysing this recording and will have insights ready shortly. Feel free
                to carry on — this will be waiting in your recent recordings.
              </p>
            </div>

            <Button variant="outline" onClick={onRecordAnother} className="mt-1">
              Record another class
            </Button>
          </motion.div>
        )}

        {recState === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-full flex flex-col items-center gap-4 text-center"
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
                See what stood out in today&apos;s class.
              </p>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <Button variant="outline" onClick={onRecordAnother}>
                Record another
              </Button>
              <Button onClick={onViewInsights} className="gap-1.5">
                View insights
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
  const [showAll, setShowAll] = useState(false);

  if (history.length === 0) {
    return (
      <section className="rounded-2xl border border-border border-dashed bg-card/50 p-6 text-center">
        <History className="h-5 w-5 text-muted-foreground mx-auto" />
        <p className="mt-2 text-[13px] font-semibold text-foreground/80">No recordings yet</p>
        <p className="mt-1 text-[12px] text-muted-foreground max-w-xs mx-auto">
          Your recorded class check-ins will show up here, with a full report for each one.
        </p>
      </section>
    );
  }

  const visible = showAll ? history : history.slice(0, 6);

  return (
    <section className="premium-surface rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <History className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-[16px] leading-tight">Recent activity</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Your latest recordings and logs.</p>
          </div>
        </div>
        {history.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[12px] font-semibold text-primary hover:underline shrink-0"
          >
            {showAll ? "Show less" : `View all (${history.length})`}
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {visible.map((c) => {
          const totalRoster = c.students.length;
          const rated = c.students.filter(
            (s) => s.absent || Object.keys(s.ratings).length > 0,
          ).length;
          const tone = SUBJECT_TONE[c.subject] ?? BLUE;
          return (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-3.5 py-3 text-[12.5px] transition-colors hover:border-foreground/15 hover:bg-background/80"
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
                <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(c.createdAt)}</div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[10.5px] font-bold px-2 py-1 rounded-full"
                  style={{ background: `color-mix(in srgb, ${tone} 10%, transparent)`, color: tone }}
                >
                  Recording
                </span>
                <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {c.classSize} students
                </span>
                <span className="text-[10.5px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  rated {rated}/{totalRoster}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1.5 text-[11.5px] font-semibold text-primary hover:text-primary"
                  onClick={() => onViewReport(c)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  View report
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More actions">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] rounded-xl text-[12.5px]">
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onSelect={() => onDelete(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete recording
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
