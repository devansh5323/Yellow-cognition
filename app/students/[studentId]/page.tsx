"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  ChevronLeft,
  Mail,
  MessageSquarePlus,
  Tag,
  Plus,
  X,
  History,
  Brain,
  HeartPulse,
  BookOpen,
  Cloud,
  Frown,
  HeartHandshake,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getStudent, type Student } from "@/data/mockData";
import { scoreBand } from "@/lib/classHealth";
import { DRIVER_META } from "@/lib/driverMeta";
import {
  WELLBEING_LABEL,
  WELLBEING_HUE,
  wellbeingStatusFromScore,
  WELLBEING_STATUS_TONE,
} from "@/lib/classWellbeing";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge, SCORE_BAND_TONE } from "@/components/dashboard/RiskBadge";
import { NotEnoughData, NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import {
  useStudentOverrides,
  addTag,
  removeTag,
  removeNote,
  PRESET_TAGS,
} from "@/lib/studentMutations";
import {
  getBehaviorLogEntriesForStudent,
  getBehaviorLogCountThisWeekForStudent,
  getPositiveLogCountThisWeekForStudent,
} from "@/lib/checkInTools";
import { getFollowUpRecordsForStudent, type FollowUpRecord } from "@/lib/interventionFollowUps";
import { NoteDialog } from "@/components/dashboard/NoteDialog";
import { ContactParentDialog } from "@/components/dashboard/ContactParentDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STUDENT_TABS = ["profile", "overview", "journey"] as const;

type StudentTab = (typeof STUDENT_TABS)[number];

function parseStudentTab(value: unknown): StudentTab {
  return typeof value === "string" && STUDENT_TABS.includes(value as StudentTab)
    ? (value as StudentTab)
    : "profile";
}

function StudentNotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="font-heading font-bold text-xl">Student not found</h2>
      <Link href="/students" className="text-primary text-sm mt-2 inline-block">
        ← Back to roster
      </Link>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ studentId: string }>();
  const student = params?.studentId ? getStudent(params.studentId) : null;

  return (
    <AppShell>
      {student ? (
        <Suspense fallback={null}>
          <StudentPage student={student} />
        </Suspense>
      ) : (
        <StudentNotFound />
      )}
    </AppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function StudentPage({ student }: { student: Student }) {
  const searchParams = useSearchParams();
  const tab = parseStudentTab(searchParams?.get("tab"));
  const router = useRouter();
  const overrides = useStudentOverrides(student.id);
  const tags = overrides.tags;
  const notes = overrides.notes;
  const contacts = overrides.contacts;
  const reduce = useReducedMotion();

  const band = scoreBand(student.studentHealthScore);

  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Behaviour logs and intervention follow-ups live in their own
  // localStorage stores (not the studentMutations overrides useStudentOverrides
  // already subscribes to), so refresh them off their own change events —
  // same pattern TeacherCheckInTools.tsx uses.
  const [behaviorLogs, setBehaviorLogs] = useState(() => getBehaviorLogEntriesForStudent(student.id));
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(() => getFollowUpRecordsForStudent(student.id));
  const [, setPositiveThisWeek] = useState(() => getPositiveLogCountThisWeekForStudent(student.id));
  const [, setBehaviorThisWeek] = useState(() => getBehaviorLogCountThisWeekForStudent(student.id));
  useEffect(() => {
    const refresh = () => {
      setBehaviorLogs(getBehaviorLogEntriesForStudent(student.id));
      setFollowUps(getFollowUpRecordsForStudent(student.id));
      setPositiveThisWeek(getPositiveLogCountThisWeekForStudent(student.id));
      setBehaviorThisWeek(getBehaviorLogCountThisWeekForStudent(student.id));
    };
    refresh();
    window.addEventListener("ah-behavior-log-change", refresh);
    window.addEventListener("ah-followup-change", refresh);
    window.addEventListener("ah-positive-log-change", refresh);
    return () => {
      window.removeEventListener("ah-behavior-log-change", refresh);
      window.removeEventListener("ah-followup-change", refresh);
      window.removeEventListener("ah-positive-log-change", refresh);
    };
  }, [student.id]);

  function handleAddTag(label: string) {
    addTag(student.id, label);
    toast.success(`Added tag “${label}”`);
    setTagPopoverOpen(false);
    setCustomTag("");
  }

  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-5"
    >
      {/* ───── Breadcrumb ───── */}
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="flex items-center gap-2 text-[12.5px] text-muted-foreground"
      >
        <Link
          href="/students"
          className="group inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Students
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{student.name}</span>
      </motion.div>

      {/* ───── Hero ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="relative premium-surface rounded-[22px] p-6 overflow-hidden"
      >
        {/* Branded wash */}
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 50% at 0% 0%, hsl(142 60% 82% / 0.35), transparent 65%), radial-gradient(55% 50% at 100% 0%, hsl(260 70% 84% / 0.30), transparent 65%)",
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <motion.div
            initial={reduce ? undefined : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.08 }}
          >
            <StudentAvatar student={student} size="xl" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading font-extrabold text-[26px] md:text-[32px] leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
                  {student.name}
                </span>
              </h1>
              <RiskBadge band={band} />
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              {student.ageGroup} · Parent {student.parentName}
            </p>

            {/* Tag chips row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
              {tags.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold pl-2.5 pr-1 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70"
                >
                  {t.label}
                  <button
                    onClick={() => {
                      removeTag(student.id, t.label);
                      toast(`Removed “${t.label}”`);
                    }}
                    className="ml-0.5 h-4 w-4 rounded-full hover:bg-background/60 flex items-center justify-center"
                    aria-label={`Remove ${t.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full border border-dashed border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                    <Tag className="h-3 w-3" /> Add tag
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 rounded-xl premium-glass" align="start">
                  <div className="premium-eyebrow mb-2"><span>Intervention tags</span></div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PRESET_TAGS.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleAddTag(t)}
                        className="premium-pill text-[11.5px] hover:cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="premium-search h-8 flex-1 px-2.5">
                      <input
                        placeholder="Custom tag…"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customTag.trim()) handleAddTag(customTag);
                        }}
                        className="text-[13px]"
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={!customTag.trim()}
                      onClick={() => handleAddTag(customTag)}
                      className="h-8 px-2 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-lg bg-card/70 backdrop-blur"
                onClick={() => setNoteOpen(true)}
              >
                <MessageSquarePlus className="h-4 w-4" /> Add note
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-lg bg-card/70 backdrop-blur"
                onClick={() => setContactOpen(true)}
              >
                <Mail className="h-4 w-4" /> Contact parent
              </Button>
            </div>
          </div>

          {/* Student Health Score tile */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <HealthScoreRing score={student.studentHealthScore} tone={SCORE_BAND_TONE[band]} />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Health score
            </span>
          </div>
        </div>
      </motion.section>

      {/* ───── Tabs ───── */}
      <Tabs
        value={tab}
        onValueChange={(next) => {
          router.replace(`/students/${student.id}?tab=${parseStudentTab(next)}`);
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 backdrop-blur p-1 h-auto flex-wrap rounded-full border border-border/70">
          <StudentTabTrigger value="profile">Profile</StudentTabTrigger>
          <StudentTabTrigger value="overview">Overview</StudentTabTrigger>
          <StudentTabTrigger value="journey">Hero Journey</StudentTabTrigger>
        </TabsList>

        {/* ───── PROFILE ───── */}
        <TabsContent value="profile">
          <div className="grid md:grid-cols-2 gap-4">
            <PanelCard title="Parent contact">
              <Row k="Name" v={student.parentName} />
              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setContactOpen(true)}>
                  <Mail className="h-3.5 w-3.5" />
                  Contact
                </Button>
              </div>
            </PanelCard>

            <PanelCard
              title="Intervention tags"
              headerRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 rounded-lg"
                  onClick={() => setTagPopoverOpen(true)}
                >
                  <Tag className="h-3.5 w-3.5" />
                  Add
                </Button>
              }
            >
              {tags.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No intervention tags yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {tags.map((t) => (
                    <li key={t.label} className="text-[13px] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {t.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(t.addedAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard
              title="Notes"
              headerRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 rounded-lg"
                  onClick={() => setNoteOpen(true)}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Add
                </Button>
              }
            >
              {notes.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl border border-border/70 bg-card/70 backdrop-blur p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                            {n.category}
                          </span>
                          {n.sharedWithParent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70">
                              Shared
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeNote(student.id, n.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete note"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[13px] mt-1.5 leading-relaxed">{n.body}</p>
                      <div className="text-[10.5px] text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard
              title="Contact log"
              headerRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 rounded-lg"
                  onClick={() => setContactOpen(true)}
                >
                  <Mail className="h-3.5 w-3.5" />
                  New
                </Button>
              }
            >
              {contacts.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No contact history yet.</p>
              ) : (
                <ul className="space-y-1.5 text-[13px]">
                  {contacts.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0"
                    >
                      <span className="capitalize font-medium flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {c.channel}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard
              title="Behaviour log history"
              subtitle={`${behaviorLogs.length} logged all-time`}
            >
              {behaviorLogs.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No behaviour logs yet.</p>
              ) : (
                <ul className="space-y-1.5 text-[13px] max-h-64 overflow-y-auto pr-1">
                  {behaviorLogs.map((e, i) => (
                    <li
                      key={`${e.at}-${i}`}
                      className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 last:border-0"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <History className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{e.antecedent ?? "Behaviour note logged"}</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {new Date(e.at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard
              title="Intervention follow-ups"
              subtitle={`${followUps.length} logged all-time`}
              className="md:col-span-2"
            >
              {followUps.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No follow-ups logged yet.</p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {followUps.map((f) => (
                    <li key={f.id} className="rounded-xl border border-border/70 bg-card/70 backdrop-blur p-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                          {f.reason}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            f.outcome === "Improved"
                              ? "bg-primary/12 text-primary border-primary/25"
                              : f.outcome === "Got worse"
                              ? "bg-destructive/12 text-destructive border-destructive/25"
                              : "bg-warning/20 text-warning-foreground dark:text-warning border-warning/40",
                          )}
                        >
                          {f.outcome}
                        </span>
                      </div>
                      <p className="text-[13px] mt-1.5 leading-relaxed">{f.support}</p>
                      <p className="text-[11.5px] text-muted-foreground mt-1">
                        {f.implementation} · Next: {f.nextStep}
                      </p>
                      <div className="text-[10.5px] text-muted-foreground mt-1">
                        {new Date(f.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          </div>
        </TabsContent>

        {/* ───── OVERVIEW ───── */}
        <TabsContent value="overview">
          <StudentMetricsOverview student={student} />
        </TabsContent>

        {/* ───── JOURNEY ───── */}
        <TabsContent value="journey">
          <NotEnoughDataPanel
            title="No game/session history yet"
            description={`${student.name.split(" ")[0]}'s Neuroplay session history isn't available in the real dataset yet — this will populate once game/session data comes in.`}
          />
        </TabsContent>
      </Tabs>

      <NoteDialog student={student} open={noteOpen} onOpenChange={setNoteOpen} />
      <ContactParentDialog student={student} open={contactOpen} onOpenChange={setContactOpen} />
    </motion.div>
  );
}

/* ──────────────── Overview tab — real metrics breakdown ──────────────── */

function StudentMetricsOverview({ student }: { student: Student }) {
  const cp = student.cognitivePerformance;
  const lr = cp.learningReadiness;
  const wb = student.studentWellbeing;

  const cognitiveRows: { key: string; label: string; Icon: LucideIcon; tone: string; value: number | null }[] = [
    { key: "focus", label: DRIVER_META.focus.title, Icon: DRIVER_META.focus.Icon, tone: DRIVER_META.focus.tone, value: cp.attentionAndFocus },
    { key: "task", label: DRIVER_META.task.title, Icon: DRIVER_META.task.Icon, tone: DRIVER_META.task.tone, value: cp.taskEngagement },
    { key: "behavior", label: DRIVER_META.behavior.title, Icon: DRIVER_META.behavior.Icon, tone: DRIVER_META.behavior.tone, value: cp.behaviourAndDiscipline },
    { key: "friction", label: "Instructional friction", Icon: Gauge, tone: "hsl(28 88% 54%)", value: cp.instructionalFriction },
  ];

  const learningRows: { key: string; label: string; value: number | null }[] = [
    { key: "reading", label: "Reading comprehension", value: lr.readingComprehension },
    { key: "recall", label: "Recall & retention", value: lr.recallRetention },
    { key: "problem", label: "Problem solving", value: lr.problemSolving },
    { key: "reasoning", label: "Reasoning", value: lr.reasoning },
    { key: "creative", label: "Creative expression", value: lr.creativeExpression },
  ];

  const wellbeingRows: { key: string; label: string; hue: string; value: number | null }[] = [
    { key: "anxiety", label: WELLBEING_LABEL.anxiety, hue: WELLBEING_HUE.anxiety, value: wb.anxietyAndCopingIndex },
    { key: "peer-safety", label: WELLBEING_LABEL["peer-safety"], hue: WELLBEING_HUE["peer-safety"], value: wb.peerSafetyAndBelonging },
    { key: "frustration", label: WELLBEING_LABEL.frustration, hue: WELLBEING_HUE.frustration, value: wb.angerAndEmotionalRegulation },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Cognitive performance */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 bg-[hsl(212_90%_58%/0.14)] text-[hsl(212_90%_58%)]">
              <Brain className="h-5 w-5" />
            </span>
            <h3 className="font-heading font-extrabold text-[16px] leading-tight">Cognitive Performance</h3>
          </div>
          <span className="font-heading font-extrabold text-[22px] tabular-nums" style={{ color: "hsl(212 90% 58%)" }}>
            {cp.score}
            <span className="text-muted-foreground text-[12px] font-bold">/100</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {cognitiveRows.map((row) => (
            <MetricRow key={row.key} label={row.label} Icon={row.Icon} tone={row.tone} value={row.value} />
          ))}
        </div>

        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-[12px] font-bold">
              <BookOpen className="h-3.5 w-3.5" style={{ color: DRIVER_META.academic.tone }} />
              {DRIVER_META.academic.title}
            </span>
            {lr.score != null ? (
              <span className="font-heading font-extrabold text-[13px] tabular-nums" style={{ color: DRIVER_META.academic.tone }}>
                {lr.score}/100
              </span>
            ) : (
              <NotEnoughData />
            )}
          </div>
          <div className="flex flex-col gap-2 pl-1">
            {learningRows.map((row) => (
              <MetricSubRow key={row.key} label={row.label} value={row.value} tone={DRIVER_META.academic.tone} />
            ))}
          </div>
        </div>
      </div>

      {/* Student wellbeing */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 bg-[hsl(243_75%_65%/0.14)] text-[hsl(243_75%_65%)]">
              <HeartPulse className="h-5 w-5" />
            </span>
            <h3 className="font-heading font-extrabold text-[16px] leading-tight">Student Wellbeing</h3>
          </div>
          {wb.score != null ? (
            <span className="font-heading font-extrabold text-[22px] tabular-nums" style={{ color: WELLBEING_STATUS_TONE[wellbeingStatusFromScore(wb.score)] }}>
              {wb.score}
              <span className="text-muted-foreground text-[12px] font-bold">/100</span>
            </span>
          ) : (
            <NotEnoughData label="Not enough data" />
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {wellbeingRows.map((row) => {
            const Icon = row.key === "anxiety" ? Cloud : row.key === "peer-safety" ? HeartHandshake : Frown;
            return <MetricRow key={row.key} label={row.label} Icon={Icon} tone={row.hue} value={row.value} />;
          })}
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  Icon,
  tone,
  value,
}: {
  label: string;
  Icon: LucideIcon;
  tone: string;
  value: number | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60 pl-4 pr-3.5 py-3 flex items-center gap-3">
      <span className="absolute inset-y-0 left-0 w-[3px]" aria-hidden style={{ background: tone }} />
      <span
        className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[12.5px] leading-tight truncate">{label}</div>
        {value != null ? (
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }}
            />
          </div>
        ) : null}
      </div>
      {value != null ? (
        <span className="font-heading font-extrabold tabular-nums text-[13px] shrink-0" style={{ color: tone }}>
          {value}
        </span>
      ) : (
        <NotEnoughData />
      )}
    </div>
  );
}

function MetricSubRow({ label, value, tone }: { label: string; value: number | null; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground truncate">{label}</span>
      {value != null ? (
        <span className="font-semibold tabular-nums shrink-0" style={{ color: tone }}>
          {value}
        </span>
      ) : (
        <NotEnoughData />
      )}
    </div>
  );
}

/* ──────────────── Hero score ring ──────────────── */

function HealthScoreRing({ score, tone, size = 108 }: { score: number; tone: string; size?: number }) {
  const STROKE = Math.round(size / 12);
  const R = (size - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.max(0, Math.min(100, score)) / 100) * C;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke="hsl(240 15% 90%)"
          strokeWidth={STROKE}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          style={{ strokeDasharray: C, strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading font-extrabold leading-none tabular-nums"
          style={{ color: tone, fontSize: Math.round(size * 0.28) }}
        >
          {Math.round(score)}
        </span>
        <span
          className="text-muted-foreground font-bold mt-0.5"
          style={{ fontSize: Math.max(9, Math.round(size * 0.09)) }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

/* ──────────────── Local UI helpers ──────────────── */

function StudentTabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "rounded-full px-4 text-[12.5px] font-bold",
        "data-[state=active]:bg-card data-[state=active]:shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)]",
        "data-[state=active]:text-foreground",
        "data-[state=inactive]:text-muted-foreground",
      )}
    >
      {children}
    </TabsTrigger>
  );
}

function PanelCard({
  title,
  subtitle,
  headerRight,
  children,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("premium-surface rounded-[18px] p-5", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-heading font-extrabold text-[14px] leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerRight}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ k, v, icon }: { k: string; v: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px] border-b border-border/50 pb-2 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium flex items-center gap-1.5">
        {icon}
        {v}
      </span>
    </div>
  );
}
