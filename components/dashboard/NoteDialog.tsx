"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { addNote, NOTE_CATEGORIES, PRESET_TAGS, addTag } from "@/lib/studentMutations";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteDialog({ student, open, onOpenChange }: Props) {
  const [category, setCategory] = useState("Focus");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [share, setShare] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory("Focus");
      setBody("");
      setTag(undefined);
      setShare(false);
    }
  }, [open, student?.id]);

  if (!student) return null;

  function handleSave() {
    if (!body.trim() || !student) return;
    addNote(student.id, { category, body: body.trim(), tag, sharedWithParent: share });
    if (tag) addTag(student.id, tag);
    toast.success(`Note saved for ${student.name}`, share ? { description: "Shared with parent." } : undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Add note for {student.name}</DialogTitle>
          <div className="flex items-center gap-3">
            <StudentAvatar student={student} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-base">{student.name}</h3>
                <RiskBadge risk={student.risk} />
              </div>
              <p className="text-xs text-muted-foreground">{student.grade} · Section {student.section}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Category</div>
            <div className="flex flex-wrap gap-1.5">
              {NOTE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
                    category === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Observation</div>
            <Textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you observe today?"
              rows={4}
            />
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Suggest intervention (optional)</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? undefined : t)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
                    tag === t
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={share} onCheckedChange={(v) => setShare(!!v)} />
            <span>Share with parent</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!body.trim()}>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
