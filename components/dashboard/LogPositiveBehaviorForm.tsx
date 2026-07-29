"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Award,
  Backpack,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Handshake,
  HandHeart,
  HeartHandshake,
  Heart,
  Lightbulb,
  Mail,
  MessageCircleHeart,
  Mountain,
  PartyPopper,
  PersonStanding,
  Rocket,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
  Volume2,
  Wind,
  X,
  type LucideIcon,
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
import {
  Section,
  FieldLabel,
  OptionChip,
  OptionCard,
  RadioRow,
  StudentPickerField,
  formatDateTimeLocal,
} from "@/components/dashboard/behaviorFormShared";
import { addNote } from "@/lib/studentMutations";
import {
  logPositiveEvent,
  getPositiveLogCountThisWeekForStudent,
  getPositiveLogDailyCountsForStudent,
} from "@/lib/checkInTools";
import { SUBJECTS, STUDENTS, type Student } from "@/data/mockData";
import {
  STRENGTH_OPTIONS,
  PBIS_EXPECTATIONS,
  CONTEXT_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  RECOGNITION_OPTIONS,
  POINTS_OPTIONS,
  SHARE_OPTIONS,
  GROWTH_OPTIONS,
  RECOGNITION_TARGETS,
  getPositiveSuggestion,
  type StrengthTag,
  type PbisExpectation,
  type RecognitionOption,
  type ShareOption,
  type RecognitionTarget,
} from "@/lib/positiveBehaviorForm";
import { cn } from "@/lib/utils";

type OpenDetail = { studentId?: string; initialNote?: string };

const STRENGTH_ICONS: Record<StrengthTag, LucideIcon> = {
  "Followed instructions": CheckSquare,
  "Stayed focused": Target,
  "Completed task": CheckCircle2,
  "Started task independently": Rocket,
  "Helped a peer": HeartHandshake,
  "Waited turn": Smile,
  "Used kind words": MessageCircleHeart,
  "Managed frustration": Wind,
  "Returned to task": RotateCcw,
  "Transitioned smoothly": ThumbsUp,
  "Participated positively": PartyPopper,
  "Showed responsibility": ShieldCheck,
  "Used a strategy": Lightbulb,
  "Persisted through challenge": Mountain,
  "Included others": UsersRound,
  "Resolved conflict calmly": Handshake,
  "Came prepared": Backpack,
  "Improved from last time": TrendingUp,
  Other: Star,
};

const PBIS_ICONS: Record<PbisExpectation, LucideIcon> = {
  "Be Ready to Learn": PersonStanding,
  "Be Responsible": CheckCircle2,
  "Be Respectful": Heart,
  "Be Safe": Shield,
  "Be Kind": HandHeart,
  "Be Prepared": Backpack,
};

const RECOGNITION_ICONS: Record<RecognitionOption, LucideIcon> = {
  "Verbal praise": Volume2,
  "Private praise": MessageCircleHeart,
  "Class shoutout": PartyPopper,
  "Point / token awarded": Award,
  "Badge awarded": Trophy,
  "Parent share": Send,
  "Peer recognition": Users,
  "Responsibility given": ClipboardCheck,
  "Note home": Mail,
  "No recognition yet": X,
  Other: Star,
};

const SHARE_ICONS: Record<ShareOption, LucideIcon> = {
  "Add to student profile only": ClipboardCheck,
  "Share with parent": Send,
  "Share with special educator / support team": Users,
  "Add to class celebration": PartyPopper,
  "Use as strength in next report": TrendingUp,
  "No sharing needed": X,
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function LogPositiveBehaviorForm() {
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
    window.addEventListener("ah-open-positive-form", onOpen);
    return () => window.removeEventListener("ah-open-positive-form", onOpen);
  }, []);

  return (
    <LogPositiveBehaviorDialog key={sessionKey} open={open} onOpenChange={setOpen} initial={initial} />
  );
}

function LogPositiveBehaviorDialog({
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

  const [recognitionTarget, setRecognitionTarget] = useState<RecognitionTarget>("individual");
  const [student, setStudent] = useState<Student | null>(initialStudent);
  const [dateTime, setDateTime] = useState(() => new Date());
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);

  const [primaryTag, setPrimaryTag] = useState<StrengthTag | null>(null);
  const [alsoNoticed, setAlsoNoticed] = useState<StrengthTag[]>([]);
  const [expectation, setExpectation] = useState<PbisExpectation | null>(null);
  const [context, setContext] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  const [recognitionOptions, setRecognitionOptions] = useState<RecognitionOption[]>([]);
  const [points, setPoints] = useState<string | null>(null);
  const [shareOptions, setShareOptions] = useState<ShareOption[]>([]);
  const [growth, setGrowth] = useState<string | null>(null);
  const [note, setNote] = useState(initial.initialNote ?? "");
  const [saveAnother, setSaveAnother] = useState(false);

  const suggestion = getPositiveSuggestion(primaryTag);
  const dailyCounts = student ? getPositiveLogDailyCountsForStudent(student.id) : [0, 0, 0, 0, 0];
  const weeklyCount = student ? getPositiveLogCountThisWeekForStudent(student.id) : 0;

  function toggleStrength(tag: StrengthTag) {
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

  function removeAlsoNoticed(tag: StrengthTag) {
    setAlsoNoticed((prev) => prev.filter((t) => t !== tag));
  }

  function toggleRecognition(option: RecognitionOption) {
    setRecognitionOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  function toggleShare(option: ShareOption) {
    setShareOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  function handleSave() {
    if (recognitionTarget === "individual" && !student) {
      toast.error("Choose a student before saving.");
      return;
    }
    if (!primaryTag) {
      toast.error("Select what strength you noticed before saving.");
      return;
    }

    const who =
      recognitionTarget === "individual"
        ? student!.name
        : recognitionTarget === "small-group"
          ? "a small group"
          : "the whole class";

    const parts = [
      `${primaryTag}${alsoNoticed.length ? ` (also: ${alsoNoticed.join(", ")})` : ""}`,
      expectation ? `Expectation demonstrated: ${expectation}` : null,
      context || timeOfDay ? `Context: ${[context, timeOfDay].filter(Boolean).join(", ")}` : null,
      recognitionOptions.length ? `Recognition: ${recognitionOptions.join(", ")}` : null,
      points ? `Points awarded: ${points}` : null,
      shareOptions.length ? `Shared: ${shareOptions.join(", ")}` : null,
      growth ? `Growth: ${growth}` : null,
      note.trim() ? `Note: ${note.trim()}` : null,
    ].filter(Boolean);

    if (recognitionTarget === "individual" && student) {
      addNote(student.id, {
        category: "Behavior",
        body: parts.join(" · "),
        tag: "Positive",
        sharedWithParent: shareOptions.includes("Share with parent"),
      });
      logPositiveEvent(student.id);
    } else {
      logPositiveEvent();
    }

    toast.success(`Positive behaviour saved for ${who}`, {
      description: recognitionOptions.length ? recognitionOptions.join(" · ") : "Added to their profile.",
    });

    if (saveAnother) {
      setPrimaryTag(null);
      setAlsoNoticed([]);
      setExpectation(null);
      setContext(null);
      setTimeOfDay(null);
      setRecognitionOptions([]);
      setPoints(null);
      setShareOptions([]);
      setGrowth(null);
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
            <DialogTitle className="font-heading text-[19px] font-extrabold flex items-center gap-2">
              <Star className="h-4 w-4 text-emerald-500" />
              Log Positive Behaviour
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Capture praise, strengths, and expected behaviours noticed in class.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
              {/* Main form */}
              <div className="space-y-4">
                <Section step={1} title="Who & when?">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <FieldLabel required>Recognize</FieldLabel>
                      <select
                        value={recognitionTarget}
                        onChange={(e) => setRecognitionTarget(e.target.value as RecognitionTarget)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {RECOGNITION_TARGETS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel required={recognitionTarget === "individual"}>Student</FieldLabel>
                      {recognitionTarget === "individual" ? (
                        <StudentPickerField student={student} onChange={setStudent} />
                      ) : (
                        <div className="flex items-center rounded-xl border border-dashed border-border px-3 py-2 text-[12.5px] text-muted-foreground h-[38px]">
                          Not needed for group recognition
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
                  <Section step={2} title="What strength did you notice?" required>
                    <div className="flex flex-wrap gap-2">
                      {STRENGTH_OPTIONS.map((tag) => (
                        <OptionChip
                          key={tag}
                          label={tag}
                          Icon={STRENGTH_ICONS[tag]}
                          selected={primaryTag === tag || alsoNoticed.includes(tag)}
                          onClick={() => toggleStrength(tag)}
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

                  <Section step={3} title="Which expectation was demonstrated?" required>
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

                <Section step={4} title="Where / when did it happen?" required>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {CONTEXT_OPTIONS.map((c) => (
                        <OptionChip
                          key={c}
                          label={c}
                          selected={context === c}
                          onClick={() => setContext(c)}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TIME_OF_DAY_OPTIONS.map((t) => (
                        <OptionChip
                          key={t}
                          label={t}
                          selected={timeOfDay === t}
                          onClick={() => setTimeOfDay(t)}
                        />
                      ))}
                    </div>
                  </div>
                </Section>

                <Section step={5} title="How was it recognized?" required>
                  <div className="flex flex-wrap gap-2">
                    {RECOGNITION_OPTIONS.map((r) => (
                      <OptionChip
                        key={r}
                        label={r}
                        Icon={RECOGNITION_ICONS[r]}
                        selected={recognitionOptions.includes(r)}
                        onClick={() => toggleRecognition(r)}
                      />
                    ))}
                  </div>
                  {recognitionOptions.includes("Point / token awarded") && (
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                        Points awarded (optional)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POINTS_OPTIONS.map((p) => (
                          <OptionChip
                            key={p}
                            label={p}
                            selected={points === p}
                            onClick={() => setPoints(points === p ? null : p)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                <Section step={6} title="Should this be shared?" required>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {SHARE_OPTIONS.map((s) => (
                      <OptionCard
                        key={s}
                        label={s}
                        Icon={SHARE_ICONS[s]}
                        selected={shareOptions.includes(s)}
                        onClick={() => toggleShare(s)}
                        compact
                      />
                    ))}
                  </div>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
                  <Section step={7} title="Is this showing growth?">
                    <div className="space-y-1.5">
                      {GROWTH_OPTIONS.map((g) => (
                        <RadioRow key={g} label={g} selected={growth === g} onClick={() => setGrowth(g)} />
                      ))}
                    </div>
                  </Section>

                  <div className="rounded-2xl border border-border bg-background p-3.5">
                    <div className="text-[12.5px] font-bold mb-1.5">Add a quick note (optional)</div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 250))}
                      placeholder="Example: Arjun waited patiently during group work and helped a peer understand the worksheet."
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
                    This strength maps to
                  </div>
                  <div className="space-y-1">
                    {suggestion.mapsTo.map((m) => (
                      <div key={m} className="flex items-center gap-2 text-[12.5px] font-semibold">
                        <span className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
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

                {student && recognitionTarget === "individual" && (
                  <div>
                    <div className="text-[11.5px] font-bold text-muted-foreground mb-1.5">
                      Positive pattern insight
                    </div>
                    <p className="text-[12px] leading-snug">
                      {weeklyCount > 0
                        ? `Similar positive behaviour logged ${weeklyCount} time${weeklyCount === 1 ? "" : "s"} this week for ${student.name.split(" ")[0]}.`
                        : `No prior positive logs this week for ${student.name.split(" ")[0]} yet.`}
                    </p>
                    <div className="flex items-end gap-2 mt-2 h-14">
                      {dailyCounts.map((count, i) => {
                        const max = Math.max(1, ...dailyCounts);
                        return (
                          <div key={DAY_LABELS[i]} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-full rounded-sm",
                                count > 0 ? "bg-emerald-500" : "bg-muted",
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
                    Suggested reinforcement
                  </div>
                  <ul className="space-y-1.5 text-[12px]">
                    {suggestion.reinforcement.map((step) => (
                      <li key={step} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-amber-500/10 p-3 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-snug text-muted-foreground">
                    <span className="font-bold text-foreground">Tip:</span> Positive logs help Yellow
                    identify student strengths and reinforce what is working.
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
              <Button size="sm" onClick={handleSave} className="gap-1.5 bg-emerald-600 hover:bg-emerald-600/90">
                <Save className="h-3.5 w-3.5" />
                Save positive behaviour
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
