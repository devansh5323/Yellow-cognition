"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Mic,
  MicOff,
  Send,
  Search,
  Check,
  Pencil,
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { addNote } from "@/lib/studentMutations";
import { type Student } from "@/data/mockData";
import {
  extractNote,
  searchStudents,
  NOTE_CATEGORY_OPTIONS,
  type ExtractedNote,
  type NoteCategory,
} from "@/lib/yellowAi";

type Message =
  | {
      id: string;
      role: "ai";
      kind: "text";
      text: string;
    }
  | {
      id: string;
      role: "ai";
      kind: "thinking";
    }
  | {
      id: string;
      role: "user";
      text: string;
    }
  | {
      id: string;
      role: "ai";
      kind: "draft";
      draft: ExtractedNote;
      sourceStudentId?: string;
      saved?: { studentId: string; noteId: string };
    };

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREETING =
  "Hi! I'm Yellow AI. Tap the mic or type what you noticed about a student — I'll turn it into a clean note for their profile.";

let messageCounter = 0;
const nextId = () => `m_${Date.now().toString(36)}_${++messageCounter}`;

export function YellowAIWidget() {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [draftText, setDraftText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: "ai", kind: "text", text: GREETING },
  ]);

  const reduce = useReducedMotion();
  const router = useRouter();
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const speech = useSpeechRecognition({
    onFinal: (transcript) => {
      // Drop the live transcript into the composer so the teacher can review
      // and edit before sending. Submission stays an explicit action.
      setDraftText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
    },
  });

  // Show interim transcript live in the composer area.
  const composerValue = useMemo(() => {
    if (speech.isListening && speech.interimTranscript) {
      return draftText
        ? `${draftText.trim()} ${speech.interimTranscript}`
        : speech.interimTranscript;
    }
    return draftText;
  }, [draftText, speech.isListening, speech.interimTranscript]);

  // Auto-scroll to latest message.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current?.querySelector("[data-scroll-anchor]") as HTMLElement | null;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, open, reduce]);

  // Stop listening when panel closes.
  useEffect(() => {
    if (!open && speech.isListening) speech.stop();
  }, [open, speech]);

  // Keyboard: Cmd/Ctrl+Shift+Y toggles the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleMicToggle() {
    if (!speech.isSupported) {
      toast.error("Voice dictation not supported in this browser", {
        description: "Type your note instead — Yellow AI will still draft it.",
      });
      return;
    }
    if (speech.isListening) speech.stop();
    else speech.start();
  }

  function handleSubmit() {
    const text = (
      draftText + (speech.interimTranscript ? " " + speech.interimTranscript : "")
    ).trim();
    if (!text) return;
    if (speech.isListening) speech.stop();

    const userMsg: Message = { id: nextId(), role: "user", text };
    const thinkingMsg: Message = { id: nextId(), role: "ai", kind: "thinking" };
    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setDraftText("");
    speech.reset();

    // Simulated thinking pause — feels considered, not instant.
    const delay = reduce ? 200 : 650 + Math.random() * 350;
    window.setTimeout(() => {
      const draft = extractNote(text, selectedStudent);
      // If AI detected a student and none was preselected, auto-select it.
      if (!selectedStudent && draft.suggestedStudent) {
        setSelectedStudent(draft.suggestedStudent);
      }
      const draftMsg: Message = {
        id: nextId(),
        role: "ai",
        kind: "draft",
        draft,
        sourceStudentId: (selectedStudent ?? draft.suggestedStudent)?.id,
      };
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMsg.id).concat(draftMsg));
    }, delay);
  }

  function handleSaveDraft(messageId: string, finalDraft: ExtractedNote, target: Student) {
    addNote(target.id, {
      category: finalDraft.category,
      body: finalDraft.body,
      sharedWithParent: false,
    });
    const noteId = `n_${Date.now().toString(36)}`;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.role === "ai" && m.kind === "draft"
          ? { ...m, saved: { studentId: target.id, noteId } }
          : m,
      ),
    );
    toast.success(`Note saved for ${target.name}`, {
      description: `${finalDraft.category} · added to their profile.`,
    });
  }

  function openStudentProfile(studentId: string) {
    setOpen(false);
    router.push(`/students/${studentId}?tab=profile`);
  }

  const studentResults = useMemo(() => searchStudents(pickerQuery, 8), [pickerQuery]);

  return (
    <>
      {/* ───────────── Floating launcher ───────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="yai-fab"
            type="button"
            onClick={() => setOpen(true)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
            animate={
              reduce
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.15 },
                  }
            }
            exit={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, transition: { duration: 0.18 } }
            }
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            aria-label="Open Yellow AI assistant"
            className="yai-fab fixed bottom-5 right-5 z-50 group"
          >
            <span className="yai-fab-glow" aria-hidden />
            <span className="yai-fab-inner">
              <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.6} />
            </span>
            <span className="yai-fab-label">
              Yellow AI
              <span className="yai-fab-status" aria-hidden />
            </span>
            {!reduce && (
              <motion.span
                aria-hidden
                className="yai-fab-pulse"
                initial={{ opacity: 0.35, scale: 1 }}
                animate={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ───────────── Drawer panel ───────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="yai-backdrop"
              className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              key="yai-panel"
              role="dialog"
              aria-label="Yellow AI assistant"
              initial={reduce ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : { x: 0, opacity: 1, transition: { duration: 0.32, ease: EASE } }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { x: "100%", opacity: 0, transition: { duration: 0.22, ease: EASE } }
              }
              className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[440px] flex-col yai-panel"
            >
              {/* Header */}
              <header className="relative flex items-center gap-3 px-4 h-[64px] border-b border-border/70 yai-panel-header">
                <span className="yai-brand-mark">
                  <Sparkles className="h-[15px] w-[15px]" strokeWidth={2.6} />
                </span>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-heading font-extrabold text-[14px]">Yellow AI</span>
                  <span className="text-[11px] text-muted-foreground">
                    {speech.isListening
                      ? "Listening…"
                      : selectedStudent
                        ? `Drafting notes for ${selectedStudent.name.split(" ")[0]}`
                        : "Teacher's note assistant"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close Yellow AI"
                    className="premium-icon-btn"
                  >
                    <X className="h-[16px] w-[16px]" />
                  </button>
                </div>
              </header>

              {/* Student selector strip */}
              <div className="px-4 pt-3 pb-2 border-b border-border/60 bg-card/40">
                <button
                  onClick={() => setPickerOpen((v) => !v)}
                  aria-expanded={pickerOpen}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 border transition-colors",
                    selectedStudent
                      ? "bg-card border-border hover:border-primary/40"
                      : "bg-card/70 border-dashed border-border/80 hover:border-primary/40 hover:bg-card",
                  )}
                >
                  {selectedStudent ? (
                    <>
                      <StudentAvatar student={selectedStudent} size="sm" />
                      <div className="flex flex-col items-start min-w-0 flex-1 leading-tight">
                        <span className="font-semibold text-[13px] truncate">
                          {selectedStudent.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {selectedStudent.grade} · Section {selectedStudent.section}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="h-8 w-8 rounded-full grid place-items-center bg-muted/70 text-muted-foreground shrink-0">
                        <Search className="h-[14px] w-[14px]" />
                      </span>
                      <span className="text-[12.5px] text-muted-foreground flex-1 text-left">
                        Pick a student — or just say "Add note for…"
                      </span>
                    </>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-[14px] w-[14px] text-muted-foreground transition-transform",
                      pickerOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {pickerOpen && (
                    <motion.div
                      key="picker"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl border border-border/70 bg-card overflow-hidden">
                        <div className="relative border-b border-border/60">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            autoFocus
                            value={pickerQuery}
                            onChange={(e) => setPickerQuery(e.target.value)}
                            placeholder="Search students…"
                            className="w-full h-9 pl-8 pr-3 text-[12.5px] bg-transparent outline-none"
                          />
                        </div>
                        <ScrollArea className="max-h-56">
                          <ul className="py-1">
                            {studentResults.length === 0 ? (
                              <li className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                                No students match "{pickerQuery}"
                              </li>
                            ) : (
                              studentResults.map((s) => {
                                const active = s.id === selectedStudent?.id;
                                return (
                                  <li key={s.id}>
                                    <button
                                      onClick={() => {
                                        setSelectedStudent(s);
                                        setPickerOpen(false);
                                        setPickerQuery("");
                                        composerRef.current?.focus();
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-muted/60 transition-colors",
                                        active && "bg-primary/8",
                                      )}
                                    >
                                      <StudentAvatar student={s} size="sm" />
                                      <span className="flex-1 min-w-0">
                                        <span className="block text-[12.5px] font-semibold truncate">
                                          {s.name}
                                        </span>
                                        <span className="block text-[10.5px] text-muted-foreground truncate">
                                          {s.grade} · {s.section}
                                        </span>
                                      </span>
                                      {active && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                  </li>
                                );
                              })
                            )}
                          </ul>
                        </ScrollArea>
                        {selectedStudent && (
                          <div className="border-t border-border/60 px-3 py-1.5 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedStudent(null);
                                setPickerQuery("");
                              }}
                              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                            >
                              Clear selection
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Conversation */}
              <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
                <div className="px-4 py-4 space-y-3">
                  {messages.map((m) => (
                    <MessageRow
                      key={m.id}
                      message={m}
                      reduce={!!reduce}
                      onSave={handleSaveDraft}
                      onOpenProfile={openStudentProfile}
                      onRequestPickStudent={() => setPickerOpen(true)}
                      contextStudent={selectedStudent}
                    />
                  ))}
                  <div data-scroll-anchor />
                </div>
              </ScrollArea>

              {/* Composer */}
              <div className="border-t border-border/70 bg-card/60 backdrop-blur px-3 py-3">
                {speech.error === "not-allowed" && (
                  <div className="mb-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[11.5px] text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      Microphone blocked. Allow access in your browser to dictate, or keep typing.
                    </span>
                  </div>
                )}
                <div
                  className={cn("yai-composer", speech.isListening && "yai-composer--listening")}
                >
                  <Textarea
                    ref={composerRef}
                    value={composerValue}
                    readOnly={speech.isListening}
                    onChange={(e) => {
                      setDraftText(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={
                      speech.isListening
                        ? "Listening — speak naturally…"
                        : selectedStudent
                          ? `Note for ${selectedStudent.name.split(" ")[0]}…`
                          : 'Type or dictate a note. Try: "Add note for Aarav…"'
                    }
                    rows={2}
                    className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 py-0 text-[13px] leading-relaxed min-h-[44px] max-h-[140px] read-only:cursor-default"
                  />
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={handleMicToggle}
                      type="button"
                      aria-pressed={speech.isListening}
                      aria-label={speech.isListening ? "Stop dictation" : "Start dictation"}
                      className={cn(
                        "yai-mic-btn",
                        speech.isListening && "yai-mic-btn--active",
                        !speech.isSupported && "yai-mic-btn--disabled",
                      )}
                      title={
                        speech.isSupported
                          ? speech.isListening
                            ? "Stop dictation"
                            : "Start dictation"
                          : "Voice not supported — type instead"
                      }
                    >
                      {speech.isSupported ? (
                        <Mic className="h-[15px] w-[15px]" />
                      ) : (
                        <MicOff className="h-[15px] w-[15px]" />
                      )}
                      {speech.isListening && (
                        <>
                          <span className="yai-mic-pulse" aria-hidden />
                          <span className="yai-mic-pulse yai-mic-pulse--b" aria-hidden />
                        </>
                      )}
                    </button>
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                      {speech.isListening ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-destructive">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                          Recording
                        </span>
                      ) : (
                        <span>Press Enter to send · Shift+Enter for newline</span>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!composerValue.trim()}
                      aria-label="Send to Yellow AI"
                      className="yai-send-btn"
                    >
                      <Send className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────── Message rendering ───────────── */

function MessageRow({
  message,
  reduce,
  onSave,
  onOpenProfile,
  onRequestPickStudent,
  contextStudent,
}: {
  message: Message;
  reduce: boolean;
  onSave: (id: string, draft: ExtractedNote, student: Student) => void;
  onOpenProfile: (studentId: string) => void;
  onRequestPickStudent: () => void;
  contextStudent: Student | null;
}) {
  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
      };

  if (message.role === "user") {
    return (
      <motion.div {...enter} className="flex justify-end">
        <div className="yai-bubble yai-bubble--user max-w-[85%]">{message.text}</div>
      </motion.div>
    );
  }

  if (message.kind === "thinking") {
    return (
      <motion.div {...enter} className="flex items-center gap-2">
        <BrandDot />
        <div className="yai-bubble yai-bubble--ai inline-flex items-center gap-2 py-2 px-3">
          <span className="typing-dots text-primary">
            <span /> <span /> <span />
          </span>
          <span className="text-[11.5px] text-muted-foreground">Yellow AI is drafting…</span>
        </div>
      </motion.div>
    );
  }

  if (message.kind === "text") {
    return (
      <motion.div {...enter} className="flex items-start gap-2">
        <BrandDot />
        <div className="yai-bubble yai-bubble--ai max-w-[88%]">{message.text}</div>
      </motion.div>
    );
  }

  // draft card
  return (
    <motion.div {...enter} className="flex items-start gap-2">
      <BrandDot />
      <div className="flex-1 min-w-0">
        <DraftCard
          draft={message.draft}
          messageId={message.id}
          saved={message.saved}
          contextStudent={contextStudent}
          suggestedStudent={message.draft.suggestedStudent}
          onSave={onSave}
          onOpenProfile={onOpenProfile}
          onRequestPickStudent={onRequestPickStudent}
        />
      </div>
    </motion.div>
  );
}

function BrandDot() {
  return (
    <span className="yai-brand-dot shrink-0 mt-1.5" aria-hidden>
      <Sparkles className="h-[10px] w-[10px]" strokeWidth={2.8} />
    </span>
  );
}

/* ───────────── Editable draft card ───────────── */

function DraftCard({
  draft,
  messageId,
  saved,
  contextStudent,
  suggestedStudent,
  onSave,
  onOpenProfile,
  onRequestPickStudent,
}: {
  draft: ExtractedNote;
  messageId: string;
  saved?: { studentId: string; noteId: string };
  contextStudent: Student | null;
  suggestedStudent?: Student;
  onSave: (id: string, draft: ExtractedNote, student: Student) => void;
  onOpenProfile: (studentId: string) => void;
  onRequestPickStudent: () => void;
}) {
  const [body, setBody] = useState(draft.body);
  const [category, setCategory] = useState<NoteCategory>(draft.category);
  const [editing, setEditing] = useState(false);

  const target = contextStudent ?? suggestedStudent ?? null;
  const isSaved = !!saved;

  function handleSave() {
    if (!target || !body.trim() || isSaved) return;
    onSave(messageId, { ...draft, body: body.trim(), category }, target);
  }

  return (
    <div className="yai-draft-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
          Draft note
        </span>
        {!isSaved && (
          <button
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
            {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="mt-2 flex flex-wrap gap-1">
        {NOTE_CATEGORY_OPTIONS.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              onClick={() => !isSaved && setCategory(c)}
              disabled={isSaved}
              className={cn(
                "yai-chip",
                active && "yai-chip--active",
                isSaved && "opacity-70 cursor-default",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="mt-2.5">
        {editing && !isSaved ? (
          <Textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="text-[13px] leading-relaxed bg-background/60"
          />
        ) : (
          <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
            {body || <span className="italic text-muted-foreground">Draft is empty.</span>}
          </p>
        )}
      </div>

      {/* Footer: target + action */}
      <div className="mt-3 pt-3 border-t border-border/60">
        {isSaved && saved ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[12px] text-foreground">
              <span className="yai-saved-pill">
                <Check className="h-3 w-3" /> Saved to {target?.name ?? "student"}
              </span>
            </div>
            <button
              onClick={() => onOpenProfile(saved.studentId)}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary/80"
            >
              View profile <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        ) : target ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <StudentAvatar student={target} size="sm" />
              <div className="leading-tight min-w-0">
                <div className="text-[12.5px] font-semibold truncate">{target.name}</div>
                <div className="text-[10.5px] text-muted-foreground truncate">
                  {target.grade} · Section {target.section}
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={!body.trim()} className="yai-save-btn">
              Save to student
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11.5px] text-muted-foreground">
              I couldn't tell who this is for.
            </div>
            <button
              onClick={onRequestPickStudent}
              className="text-[11.5px] font-semibold text-primary hover:text-primary/80"
            >
              Choose student
            </button>
          </div>
        )}
      </div>

      {suggestedStudent && target?.id === suggestedStudent.id && !isSaved && (
        <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-[hsl(38_92%_50%)]" />
          Detected from your note · use the picker above to change.
        </div>
      )}
    </div>
  );
}
