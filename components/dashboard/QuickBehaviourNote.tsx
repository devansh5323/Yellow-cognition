"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Mic, Pencil, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { addNote } from "@/lib/studentMutations";
import { logBehaviorEvent } from "@/lib/checkInTools";
import { type Student } from "@/data/mockData";
import {
  extractNote,
  searchStudents,
  NOTE_CATEGORY_OPTIONS,
  type ExtractedNote,
  type NoteCategory,
} from "@/lib/yellowAi";
import { cn } from "@/lib/utils";

export function QuickBehaviourNote() {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    const onOpen = () => {
      setSessionKey((k) => k + 1);
      setOpen(true);
    };
    window.addEventListener("ah-open-behaviour-note", onOpen);
    return () => window.removeEventListener("ah-open-behaviour-note", onOpen);
  }, []);

  // Keying by session forces a full remount on every open, so each session
  // starts from clean state without syncing it via an effect.
  return <QuickBehaviourNoteDialog key={sessionKey} open={open} onOpenChange={setOpen} />;
}

function QuickBehaviourNoteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draft, setDraft] = useState<ExtractedNote | null>(null);
  const [saved, setSaved] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const speech = useSpeechRecognition({
    onFinal: (transcript) => {
      setDraftText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
    },
  });

  const composerValue = useMemo(() => {
    if (speech.isListening && speech.interimTranscript) {
      return draftText ? `${draftText.trim()} ${speech.interimTranscript}` : speech.interimTranscript;
    }
    return draftText;
  }, [draftText, speech.isListening, speech.interimTranscript]);

  useEffect(() => {
    if (!open && speech.isListening) speech.stop();
  }, [open, speech]);

  function handleHoldStart() {
    if (!speech.isSupported) {
      toast.error("Voice dictation not supported in this browser", {
        description: "Type your note instead — Yellow will still draft it.",
      });
      return;
    }
    speech.start();
  }

  function handleHoldEnd() {
    if (speech.isListening) speech.stop();
  }

  function handleGetDraft() {
    const text = composerValue.trim();
    if (!text) return;
    if (speech.isListening) speech.stop();
    const extracted = extractNote(text, selectedStudent);
    if (!selectedStudent && extracted.suggestedStudent) {
      setSelectedStudent(extracted.suggestedStudent);
    }
    setDraft(extracted);
  }

  function handleBackToCompose() {
    setDraft(null);
    setSaved(false);
  }

  function handleSave(finalDraft: ExtractedNote, target: Student) {
    addNote(target.id, {
      category: finalDraft.category,
      body: finalDraft.body,
      sharedWithParent: false,
    });
    logBehaviorEvent();
    setSaved(true);
    toast.success(`Behaviour note saved for ${target.name}`, {
      description: `${finalDraft.category} · added to their profile.`,
    });
  }

  function handleOpenStructuredForm() {
    const text = composerValue.trim();
    const detected = selectedStudent ?? (text ? extractNote(text, null).suggestedStudent : undefined);
    onOpenChange(false);
    window.dispatchEvent(
      new CustomEvent("ah-open-behavior-form", {
        detail: {
          studentId: detected?.id,
          initialNote: text || undefined,
        },
      }),
    );
  }

  function handleOpenProfile(studentId: string) {
    onOpenChange(false);
    router.push(`/students/${studentId}`);
  }

  const studentResults = useMemo(() => searchStudents(pickerQuery, 6), [pickerQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[17px] font-extrabold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Behaviour Note
          </DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Speak or type what happened. Yellow will organize it into a PBIS-ready log.
          </DialogDescription>
        </DialogHeader>

        {!draft ? (
          <div className="space-y-4">
            {/* Student context */}
            <div className="relative">
              {selectedStudent ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StudentAvatar student={selectedStudent} size="sm" />
                    <div className="min-w-0 leading-tight">
                      <div className="text-[13px] font-semibold truncate">{selectedStudent.name}</div>
                      <div className="text-[10.5px] text-muted-foreground truncate">
                        {selectedStudent.grade} · Section {selectedStudent.section}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="w-full flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12.5px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                  Choose a student (optional — Yellow can detect it from your note)
                </button>
              )}

              {pickerOpen && !selectedStudent && (
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
                          setSelectedStudent(s);
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

            {/* Composer */}
            <div className="space-y-2">
              <Textarea
                ref={composerRef}
                value={composerValue}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Describe what happened, or hold the mic and speak…"
                rows={4}
                className="text-[13px] leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onPointerDown={handleHoldStart}
                  onPointerUp={handleHoldEnd}
                  onPointerLeave={handleHoldEnd}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors select-none",
                    speech.isListening
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : "bg-primary/10 text-primary hover:bg-primary/15",
                  )}
                >
                  <Mic className="h-3.5 w-3.5" />
                  {speech.isListening ? "Listening…" : "Hold to speak"}
                </button>
                <button
                  type="button"
                  onClick={() => composerRef.current?.focus()}
                  className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Type instead
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenStructuredForm}
                className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Open structured form
              </button>
              <Button
                size="sm"
                onClick={handleGetDraft}
                disabled={!composerValue.trim()}
                className="h-9 rounded-lg px-3.5 text-[12.5px] font-bold gap-1.5"
              >
                Get draft
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <DraftReview
            draft={draft}
            student={selectedStudent}
            saved={saved}
            onBack={handleBackToCompose}
            onSave={handleSave}
            onOpenProfile={handleOpenProfile}
            onPickStudent={() => {
              setDraft(null);
              setPickerOpen(true);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DraftReview({
  draft,
  student,
  saved,
  onBack,
  onSave,
  onOpenProfile,
  onPickStudent,
}: {
  draft: ExtractedNote;
  student: Student | null;
  saved: boolean;
  onBack: () => void;
  onSave: (draft: ExtractedNote, student: Student) => void;
  onOpenProfile: (studentId: string) => void;
  onPickStudent: () => void;
}) {
  const [body, setBody] = useState(draft.body);
  const [category, setCategory] = useState<NoteCategory>(draft.category);
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
            Draft note
          </span>
          {!saved && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              {editing ? "Done" : "Edit"}
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {NOTE_CATEGORY_OPTIONS.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                disabled={saved}
                onClick={() => !saved && setCategory(c)}
                className={cn(
                  "text-[10.5px] font-bold px-2 py-1 rounded-full border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50",
                  saved && "opacity-70",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="mt-2.5">
          {editing && !saved ? (
            <Textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="text-[13px] leading-relaxed"
            />
          ) : (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
              {body || <span className="italic text-muted-foreground">Draft is empty.</span>}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border/60">
          {saved && student ? (
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Saved to {student.name}
              </span>
              <button
                type="button"
                onClick={() => onOpenProfile(student.id)}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary/80"
              >
                View profile <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          ) : student ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <StudentAvatar student={student} size="sm" />
                <div className="leading-tight min-w-0">
                  <div className="text-[12.5px] font-semibold truncate">{student.name}</div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {student.grade} · Section {student.section}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSave({ ...draft, body: body.trim(), category }, student)}
                disabled={!body.trim()}
                className="h-8 rounded-lg px-3 text-[12px] font-bold gap-1"
              >
                Save note
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11.5px] text-muted-foreground">I couldn&apos;t tell who this is for.</div>
              <button
                type="button"
                onClick={onPickStudent}
                className="text-[11.5px] font-semibold text-primary hover:text-primary/80"
              >
                Choose student
              </button>
            </div>
          )}
        </div>
      </div>

      {!saved && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Back to composer
        </button>
      )}
    </div>
  );
}
