"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, Copy } from "lucide-react";
import { logContact, getOverrides, useStudentOverrides } from "@/lib/studentMutations";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Real students only carry a `parentName` string — no email/phone channel
 * exists to actually place a call or open an email/WhatsApp draft, so this
 * dialog no longer offers "Call"/"WhatsApp"/"Email" launch actions. It still
 * lets a teacher log that a conversation happened (and copy a suggested
 * script), since that's independent of having a stored contact address. */
export function ContactParentDialog({ student, open, onOpenChange }: Props) {
  // Subscribe so the contact log refreshes after a new entry.
  useStudentOverrides(student?.id);

  if (!student) return null;

  const firstName = student.name.split(" ")[0];
  const templates = [
    `Strong month — ${firstName} improved focus in this month's check-in. Great work at home!`,
    `Would love a quick chat about ${firstName}'s progress. When works for you?`,
    `Checking in: ${firstName}'s recent check-in showed a dip. Let's talk.`,
  ];
  const log = getOverrides(student.id).contacts;

  function track(channel: "call" | "whatsapp" | "email") {
    if (!student) return;
    logContact(student.id, { channel });
    toast.success(`Logged a ${channel === "call" ? "call" : channel === "whatsapp" ? "message" : "email"} with ${student.parentName}`);
  }

  function copyTemplate(t: string) {
    navigator.clipboard?.writeText(t).catch(() => {});
    if (!student) return;
    logContact(student.id, { channel: "whatsapp", template: t });
    toast.success("Template copied & logged");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Contact parent of {student.name}</DialogTitle>
          <div>
            <h3 className="font-heading font-bold text-base">{student.parentName}</h3>
            <p className="text-xs text-muted-foreground">{firstName}&apos;s parent</p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Log a conversation
            </div>
            <p className="text-[11.5px] text-muted-foreground mb-2">
              No email or phone number is on file for {student.parentName} yet — these just record
              that an outreach happened.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ChannelButton icon={<Phone className="h-5 w-5" />} label="Call" onClick={() => track("call")} />
              <ChannelButton icon={<MessageCircle className="h-5 w-5" />} label="Message" onClick={() => track("whatsapp")} />
              <ChannelButton icon={<Mail className="h-5 w-5" />} label="Email" onClick={() => track("email")} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Quick templates</div>
            <ul className="space-y-1.5">
              {templates.map((t) => (
                <li key={t} className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <span className="flex-1">{t}</span>
                  <button onClick={() => copyTemplate(t)} className="text-xs font-semibold text-primary inline-flex items-center gap-1 shrink-0">
                    <Copy className="h-3 w-3"/> Copy
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Recent contact</div>
            {log.length === 0 ? (
              <p className="text-xs text-muted-foreground">No contacts logged yet.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {log.slice(0, 3).map((c) => (
                  <li key={c.id} className="flex items-center justify-between border-b border-border/60 pb-1 last:border-0">
                    <span className="capitalize font-medium">{c.channel}</span>
                    <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChannelButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
    >
      {icon}
      <div className="font-semibold text-sm">{label}</div>
    </button>
  );
}
