"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Armchair,
  Backpack,
  Ban,
  Bell,
  BellRing,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ClipboardPlus,
  Clock,
  DoorOpen,
  FileCheck,
  HandHeart,
  Heart,
  Hourglass,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  PersonStanding,
  RotateCw,
  Save,
  Search,
  Shield,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Target,
  Trees,
  User,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { addNote } from "@/lib/studentMutations";
import {
  logBehaviorEvent,
  getBehaviorLogCountThisWeekForStudent,
  getBehaviorLogDailyCountsForStudent,
} from "@/lib/checkInTools";
import { searchStudents } from "@/lib/yellowAi";
import { SUBJECTS, STUDENTS, type Student } from "@/data/mockData";
import {
  WHAT_HAPPENED_OPTIONS,
  PBIS_EXPECTATIONS,
  ACTIVITY_OPTIONS,
  LOCATION_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  ANTECEDENT_OPTIONS,
  RESPONSE_OPTIONS,
  RECOVERY_OPTIONS,
  FOLLOWUP_OPTIONS,
  getBehaviorSuggestion,
  type WhatHappenedTag,
  type PbisExpectation,
  type Severity,
  type FollowUpOption,
} from "@/lib/behaviorForm";
import { cn } from "@/lib/utils";

type OpenDetail = { studentId?: string; initialNote?: string };

const WHAT_HAPPENED_ICONS: Record<WhatHappenedTag, typeof Target> = {
  "Off-task": Target,
  Disruption: Megaphone,
  "Task refusal": Ban,
  "Missed work": FileCheck,
  "Delayed work": Clock,
  "Repeated reminders": RotateCw,
  "Peer conflict": Users,
  "Difficulty waiting": Hourglass,
  "Transition difficulty": ArrowRightLeft,
  Other: MoreHorizontal,
};

const PBIS_ICONS: Record<PbisExpectation, typeof Target> = {
  "Be Ready to Learn": PersonStanding,
  "Be Responsible": CheckCircle2,
  "Be Respectful": Heart,
  "Be Safe": Shield,
  "Be Kind": HandHeart,
  "Be Prepared": Backpack,
};

const ACTIVITY_ICONS: Record<string, typeof Target> = {
  "Independent work": Armchair,
  "Group work": Users,
  Instruction: PersonStanding,
  Transition: ArrowRightLeft,
  Other: MoreHorizontal,
};

const LOCATION_ICONS: Record<string, typeof Target> = {
  Classroom: DoorOpen,
  Hallway: DoorOpen,
  Playground: Trees,
  Cafeteria: UtensilsCrossed,
};

const TIME_ICONS: Record<string, typeof Target> = {
  Morning: Sunrise,
  Midday: Sun,
  Afternoon: Sunset,
  "End of day": Moon,
};

const FOLLOWUP_ICONS: Record<FollowUpOption, typeof Target> = {
  "No follow-up": CheckCircle2,
  "Add to profile": UserPlus,
  "Parent nudge": Mail,
  "Tier 2 review": Users,
  "1:1 check-in": MessageCircle,
  "Special educator": User,
  "Create follow-up": ClipboardPlus,
  "Urgent support": BellRing,
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function formatDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RecordBehaviorForm() {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [initial, setInitial] = useState<OpenDetail>({});

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenDetail>).detail ?? {};
      setInitial(detail);
      setSessionKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener("ah-open-behavior-form", onOpen);
    return () => window.removeEventListener("ah-open-behavior-form", onOpen);
  }, []);

  return (
    <RecordBehaviorDialog key={sessionKey} open={open} onOpenChange={setOpen} initial={initial} />
  );
}

function RecordBehaviorDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OpenDetail;
}) {
  const initialStudent = useMemo(
    () => STUDENTS.find((s) => s.id === initial.studentId) ?? null,
    [initial.studentId],
  );

  const [student, setStudent] = useState<Student | null>(initialStudent);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [dateTime, setDateTime] = useState(() => new Date());
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);

  const [primaryTag, setPrimaryTag] = useState<WhatHappenedTag | null>(null);
  const [alsoNoticed, setAlsoNoticed] = useState<WhatHappenedTag[]>([]);
  const [expectation, setExpectation] = useState<PbisExpectation | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  const [antecedent, setAntecedent] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState<FollowUpOption | null>(null);
  const [note, setNote] = useState(initial.initialNote ?? "");
  const [saveAnother, setSaveAnother] = useState(false);

  const studentResults = useMemo(() => searchStudents(pickerQuery, 6), [pickerQuery]);
  const suggestion = getBehaviorSuggestion(primaryTag);
  const dailyCounts = student ? getBehaviorLogDailyCountsForStudent(student.id) : [0, 0, 0, 0, 0];
  const weeklyCount = student ? getBehaviorLogCountThisWeekForStudent(student.id) : 0;

  function toggleWhatHappened(tag: WhatHappenedTag) {
    if (primaryTag === tag) {
      setPrimaryTag(alsoNoticed[0] ?? null);
      setAlsoNoticed((prev) => prev.filter((t) => t !== tag).slice(1));
      return;
    }
    if (!primaryTag) {
      setPrimaryTag(tag);
      return;
    }
    setAlsoNoticed((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function removeAlsoNoticed(tag: WhatHappenedTag) {
    setAlsoNoticed((prev) => prev.filter((t) => t !== tag));
  }

  function handleSave() {
    if (!student) {
      toast.error("Choose a student before saving.");
      return;
    }
    if (!primaryTag) {
      toast.error("Select what happened before saving.");
      return;
    }

    const parts = [
      `${primaryTag}${alsoNoticed.length ? ` (also: ${alsoNoticed.join(", ")})` : ""}`,
      expectation ? `Expectation affected: ${expectation}` : null,
      severity ? `Severity: ${severity}` : null,
      activity || location || timeOfDay
        ? `Context: ${[activity, location, timeOfDay].filter(Boolean).join(", ")}`
        : null,
      antecedent ? `Before: ${antecedent}` : null,
      response ? `Response: ${response}` : null,
      recovery ? `Recovery: ${recovery}` : null,
      note.trim() ? `Note: ${note.trim()}` : null,
    ].filter(Boolean);

    addNote(student.id, {
      category: "Behavior",
      body: parts.join(" · "),
      tag: followUp && followUp !== "No follow-up" ? followUp : undefined,
      sharedWithParent: followUp === "Parent nudge",
    });
    logBehaviorEvent(student.id);

    toast.success(`Behaviour saved for ${student.name}`, {
      description: followUp && followUp !== "No follow-up" ? `Follow-up: ${followUp}` : "Added to their profile.",
    });

    if (saveAnother) {
      setPrimaryTag(null);
      setAlsoNoticed([]);
      setExpectation(null);
      setSeverity(null);
      setActivity(null);
      setLocation(null);
      setTimeOfDay(null);
      setAntecedent(null);
      setResponse(null);
      setRecovery(null);
      setFollowUp(null);
      setNote("");
    } else {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="font-heading text-[19px] font-extrabold">
              Record Behaviour
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Log what happened, where it happened, and what support may be needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
              {/* Main form */}
              <div className="space-y-4">
                <Section step={1} title="Who & when?">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <FieldLabel required>Student</FieldLabel>
                      {student ? (
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <StudentAvatar student={student} size="sm" />
                            <span className="text-[13px] font-semibold truncate">{student.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStudent(null)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setPickerOpen((v) => !v)}
                            className="w-full flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12.5px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                          >
                            <Search className="h-3.5 w-3.5" />
                            Choose a student
                          </button>
                          {pickerOpen && (
                            <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border bg-card shadow-lg p-2">
                              <input
                                autoFocus
                                value={pickerQuery}
                                onChange={(e) => setPickerQuery(e.target.value)}
                                placeholder="Search students…"
                                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/40"
                              />
                              <div className="mt-1.5 max-h-48 overflow-auto space-y-0.5">
                                {studentResults.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                      setStudent(s);
                                      setPickerOpen(false);
                                      setPickerQuery("");
                                    }}
                                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted/60 transition-colors"
                                  >
                                    <StudentAvatar student={s} size="sm" />
                                    <span className="text-[12.5px] font-medium truncate">{s.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <FieldLabel required>Date & time</FieldLabel>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <input
                          type="datetime-local"
                          value={formatDateTimeLocal(dateTime)}
                          onChange={(e) => {
                            const v = e.target.value ? new Date(e.target.value) : new Date();
                            setDateTime(v);
                          }}
                          className="w-full bg-transparent text-[12.5px] outline-none [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel required>Class / Subject</FieldLabel>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Section step={2} title="What happened?" info>
                    <div className="flex flex-wrap gap-2">
                      {WHAT_HAPPENED_OPTIONS.map((tag) => (
                        <OptionChip
                          key={tag}
                          label={tag}
                          Icon={WHAT_HAPPENED_ICONS[tag]}
                          selected={primaryTag === tag || alsoNoticed.includes(tag)}
                          onClick={() => toggleWhatHappened(tag)}
                        />
                      ))}
                    </div>
                    {alsoNoticed.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-primary mb-1.5">
                          Also noticed (optional)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {alsoNoticed.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1"
                            >
                              {tag}
                              <button type="button" onClick={() => removeAlsoNoticed(tag)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Section>

                  <Section step={3} title="Which expectation was affected?" required>
                    <div className="grid grid-cols-3 gap-2">
                      {PBIS_EXPECTATIONS.map((exp) => (
                        <OptionCard
                          key={exp}
                          label={exp}
                          Icon={PBIS_ICONS[exp]}
                          selected={expectation === exp}
                          onClick={() => setExpectation(exp)}
                        />
                      ))}
                    </div>
                  </Section>
                </div>

                <Section step={4} title="How serious was it?" required>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SeverityCard
                      severity="Minor"
                      title="Minor"
                      subtitle="Handled in class"
                      detail="Calling out, off-task, mild disruption, etc."
                      selected={severity === "Minor"}
                      onClick={() => setSeverity("Minor")}
                      tone="hsl(142 55% 45%)"
                    />
                    <SeverityCard
                      severity="Major"
                      title="Major"
                      subtitle="Needs support follow-up"
                      detail="Aggression, unsafe behavior, severe disruption, etc."
                      selected={severity === "Major"}
                      onClick={() => setSeverity("Major")}
                      tone="hsl(0 78% 58%)"
                    />
                  </div>
                </Section>

                <Section step={5} title="Where / when did it happen?" required>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_OPTIONS.map((a) => (
                        <OptionChip
                          key={a}
                          label={a}
                          Icon={ACTIVITY_ICONS[a]}
                          selected={activity === a}
                          onClick={() => setActivity(a)}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {LOCATION_OPTIONS.map((l) => (
                        <OptionChip
                          key={l}
                          label={l}
                          Icon={LOCATION_ICONS[l]}
                          selected={location === l}
                          onClick={() => setLocation(l)}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TIME_OF_DAY_OPTIONS.map((t) => (
                        <OptionChip
                          key={t}
                          label={t}
                          Icon={TIME_ICONS[t]}
                          selected={timeOfDay === t}
                          onClick={() => setTimeOfDay(t)}
                        />
                      ))}
                    </div>
                  </div>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Section step={6} title="What seemed to happen before it?">
                    <div className="flex flex-wrap gap-2">
                      {ANTECEDENT_OPTIONS.map((a) => (
                        <OptionChip
                          key={a}
                          label={a}
                          selected={antecedent === a}
                          onClick={() => setAntecedent(a)}
                        />
                      ))}
                    </div>
                  </Section>

                  <Section step={7} title="What did you do?">
                    <div className="flex flex-wrap gap-2">
                      {RESPONSE_OPTIONS.map((r) => (
                        <OptionChip
                          key={r}
                          label={r}
                          selected={response === r}
                          onClick={() => setResponse(r)}
                        />
                      ))}
                    </div>
                  </Section>
                </div>

                <Section step={8} title="Did the student recover?">
                  <div className="space-y-1.5">
                    {RECOVERY_OPTIONS.map((r) => (
                      <RadioRow
                        key={r}
                        label={r}
                        selected={recovery === r}
                        onClick={() => setRecovery(r)}
                      />
                    ))}
                  </div>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
                  <Section step={9} title="Follow-up needed?">
                    <div className="grid grid-cols-4 gap-2">
                      {FOLLOWUP_OPTIONS.map((f) => (
                        <OptionCard
                          key={f}
                          label={f}
                          Icon={FOLLOWUP_ICONS[f]}
                          selected={followUp === f}
                          onClick={() => setFollowUp(f)}
                          compact
                        />
                      ))}
                    </div>
                  </Section>

                  <div className="rounded-2xl border border-border bg-background p-3.5">
                    <div className="text-[12.5px] font-bold mb-1.5">Add a quick note (optional)</div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 250))}
                      placeholder="Add any important details about the incident, student response, or next steps…"
                      rows={4}
                      className="text-[12.5px]"
                    />
                    <div className="text-right text-[10.5px] text-muted-foreground mt-1">
                      {note.length}/250
                    </div>
                  </div>
                </div>
              </div>

              {/* Yellow suggests sidebar */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4 self-start">
                <div className="flex items-center gap-1.5 text-[13px] font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Yellow suggests
                </div>

                <div>
                  <div className="text-[11.5px] font-bold text-muted-foreground mb-1.5">
                    This behaviour maps to
                  </div>
                  <div className="space-y-1">
                    {suggestion.mapsTo.map((m) => (
                      <div key={m} className="flex items-center gap-2 text-[12.5px] font-semibold">
                        <span className="h-6 w-6 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                          <Target className="h-3 w-3" />
                        </span>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11.5px] font-bold text-muted-foreground mb-1.5">
                    Related skills
                  </div>
                  <ul className="space-y-1 text-[12.5px]">
                    {suggestion.relatedSkills.map((s) => (
                      <li key={s} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-foreground/60 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {student && (
                  <div>
                    <div className="text-[11.5px] font-bold text-muted-foreground mb-1.5">
                      Pattern insight
                    </div>
                    <p className="text-[12px] leading-snug">
                      {weeklyCount > 0
                        ? `Similar behaviour logged ${weeklyCount} time${weeklyCount === 1 ? "" : "s"} this week for ${student.name.split(" ")[0]}.`
                        : `No prior logs this week for ${student.name.split(" ")[0]} yet.`}
                    </p>
                    <div className="flex items-end gap-2 mt-2 h-14">
                      {dailyCounts.map((count, i) => {
                        const max = Math.max(1, ...dailyCounts);
                        return (
                          <div key={DAY_LABELS[i]} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-full rounded-sm",
                                count > 0 ? "bg-primary" : "bg-muted",
                              )}
                              style={{ height: `${Math.max(6, (count / max) * 40)}px` }}
                            />
                            <span className="text-[9.5px] text-muted-foreground">{DAY_LABELS[i]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11.5px] font-bold text-muted-foreground mb-1.5">
                    Suggested next steps
                  </div>
                  <ul className="space-y-1.5 text-[12px]">
                    {suggestion.nextSteps.map((step) => (
                      <li key={step} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-amber-500/10 p-3 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-snug text-muted-foreground">
                    <span className="font-bold text-foreground">Tip:</span> Consistent logging helps
                    Yellow identify patterns and recommend the right support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0">
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={saveAnother}
                onChange={(e) => setSaveAnother(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-primary"
              />
              Save & log another
            </label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Save behaviour
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  step,
  title,
  required,
  info,
  children,
}: {
  step: number;
  title: string;
  required?: boolean;
  info?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10.5px] font-bold inline-flex items-center justify-center shrink-0">
          {step}
        </span>
        <h3 className="text-[13.5px] font-bold">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        {info && <Bell className="h-3 w-3 text-muted-foreground" aria-hidden />}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="text-[11.5px] font-semibold text-muted-foreground mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </div>
  );
}

function OptionChip({
  label,
  Icon,
  selected,
  onClick,
}: {
  label: string;
  Icon?: typeof Target;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function OptionCard({
  label,
  Icon,
  selected,
  onClick,
  compact,
}: {
  label: string;
  Icon: typeof Target;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border text-center transition-colors",
        compact ? "px-1.5 py-2.5" : "px-2 py-4",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      <span className={cn("font-semibold leading-tight", compact ? "text-[10px]" : "text-[12px]")}>
        {label}
      </span>
    </button>
  );
}

function SeverityCard({
  title,
  subtitle,
  detail,
  selected,
  onClick,
  tone,
}: {
  severity: Severity;
  title: string;
  subtitle: string;
  detail: string;
  selected: boolean;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border p-3.5 text-left transition-colors"
      style={{
        borderColor: selected ? tone : "var(--border)",
        background: selected ? `color-mix(in srgb, ${tone} 6%, var(--card))` : "var(--card)",
      }}
    >
      <div className="flex items-center gap-1.5">
        {selected ? (
          <CheckCircle2 className="h-4 w-4" style={{ color: tone }} />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-[13px] font-bold" style={{ color: selected ? tone : undefined }}>
          {title}
        </span>
      </div>
      <div className="text-[11px] font-semibold text-muted-foreground mt-1">{subtitle}</div>
      <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{detail}</div>
    </button>
  );
}

function RadioRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-muted/40 transition-colors"
    >
      {selected ? (
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className={cn("text-[12.5px]", selected ? "font-semibold" : "text-muted-foreground")}>
        {label}
      </span>
    </button>
  );
}
