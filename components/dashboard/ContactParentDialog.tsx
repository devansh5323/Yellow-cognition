"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, Copy } from "lucide-react";
import { logContact, getOverrides, useStudentOverrides } from "@/lib/studentMutations";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactParentDialog({ student, open, onOpenChange }: Props) {
  // Subscribe so the contact log refreshes after a new entry.
  useStudentOverrides(student?.id);

  if (!student) return null;

  const firstName = student.name.split(" ")[0];
  const phoneDigits = student.parent.phone.replace(/\D/g, "");
  const templates = [
    `Strong month — ${firstName} improved focus in this month's check-in. Great work at home!`,
    `Would love a quick chat about ${firstName}'s progress. When works for you?`,
    `Heads up: ${firstName}'s focus has dipped since last check-in. Let's talk.`,
  ];
  const log = student ? getOverrides(student.id).contacts : [];

  function track(channel: "call" | "whatsapp" | "email") {
    if (!student) return;
    logContact(student.id, { channel });
    toast.success(`${channel === "call" ? "Call" : channel === "whatsapp" ? "WhatsApp" : "Email"} opened for ${student.parent.name}`);
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
            <h3 className="font-heading font-bold text-base">{student.parent.name}</h3>
            <p className="text-xs text-muted-foreground">Mother / Father · {firstName}'s parent</p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <ChannelCard
              href={`tel:${phoneDigits}`}
              onClick={() => track("call")}
              icon={<Phone className="h-5 w-5"/>}
              label="Call"
              sub={student.parent.phone}
              tone="primary"
            />
            <ChannelCard
              href={`https://wa.me/${phoneDigits}`}
              onClick={() => track("whatsapp")}
              icon={<MessageCircle className="h-5 w-5"/>}
              label="WhatsApp"
              sub="Open chat"
              tone="success"
            />
            <ChannelCard
              href={`mailto:${student.parent.email}?subject=Update on ${student.name}`}
              onClick={() => track("email")}
              icon={<Mail className="h-5 w-5"/>}
              label="Email"
              sub={student.parent.email}
              tone="accent"
            />
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

function ChannelCard({ href, onClick, icon, label, sub, tone }: {
  href: string; onClick: () => void; icon: React.ReactNode; label: string; sub: string;
  tone: "primary" | "success" | "accent";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15",
    success: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15",
    accent: "bg-accent/60 text-accent-foreground border-accent hover:bg-accent",
  }[tone];
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      onClick={onClick}
      className={cn("flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors", toneClasses)}
    >
      {icon}
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-[10px] opacity-80 truncate w-full">{sub}</div>
    </a>
  );
}
