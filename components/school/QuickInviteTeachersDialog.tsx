"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Phone, User, BookOpen, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { addInvitedTeacher } from "@/lib/teacherInvites";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";

/** A trimmed version of TeacherCohortManager's ManualForm — just enough to
 * invite the first few teachers without navigating to the full /school/
 * teachers page (roster table, bulk/CSV/Google methods, stats strip all
 * stay on that page; this dialog is only the fastest path to a real
 * invite). Opened by SchoolDashboardTour's "invite-teachers" step. Stays
 * open after each send (rather than closing immediately) since the task
 * is literally "invite your first 3 teachers" — one at a time is the
 * expected flow — and marks the real task done on the first successful
 * send rather than just on opening this dialog. */
export function QuickInviteTeachersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [sentCount, setSentCount] = useState(0);

  const canSubmit = fullName.trim().length >= 2 && (email.trim() || phone.trim());

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setSubject("");
  };

  const submit = () => {
    if (!canSubmit) return;
    addInvitedTeacher({ fullName, email, phone, subject, source: "manual" }, { sendInvite: true });
    markSchoolTaskDone("invite-teachers");
    setSentCount((n) => n + 1);
    toast.success(`Invite sent to ${fullName.trim()}`);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setSentCount(0);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite your first teachers</DialogTitle>
          <DialogDescription>
            Add one at a time — each gets a sign-in link by email or phone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldInput icon={<User className="h-3.5 w-3.5" />} label="Full name" value={fullName} onChange={setFullName} placeholder="Maya Khan" required />
            <FieldInput icon={<BookOpen className="h-3.5 w-3.5" />} label="Subject" value={subject} onChange={setSubject} placeholder="Math, ELA, …" />
            <FieldInput icon={<Mail className="h-3.5 w-3.5" />} label="School email" value={email} onChange={setEmail} placeholder="maya.khan@school.edu" type="email" />
            <FieldInput icon={<Phone className="h-3.5 w-3.5" />} label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+91 98xxx xxxxx" type="tel" />
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              {sentCount > 0 ? `${sentCount} invited so far` : "Add at least an email or phone to send."}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px] disabled:opacity-50"
            >
              <span className="sheen" aria-hidden />
              <span className="inline-flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> Add & send invite
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
        {required && <span className="text-destructive">*</span>}
      </div>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-xl border border-border/80 bg-card/70 backdrop-blur px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 transition-[border-color,box-shadow]"
      />
    </label>
  );
}
