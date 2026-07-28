"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Send,
  UserPlus,
  Upload,
  School,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  X,
  RefreshCw,
  Trash2,
  PlayCircle,
  Users,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  addInvitedTeacher,
  bulkAddInvitedTeachers,
  clearTeacherInvites,
  getInvitedTeachers,
  getTeacherInviteStats,
  removeInvitedTeacher,
  sendAllPendingTeacherInvites,
  sendTeacherInvite,
  simulateTeacherJoin,
  type InvitedTeacher,
  type TeacherInviteMethod,
  type TeacherInviteStatus,
} from "@/lib/teacherInvites";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function TeacherCohortManager({
  method,
  showStats = true,
}: {
  method: TeacherInviteMethod | null;
  showStats?: boolean;
}) {
  const [list, setList] = useState<InvitedTeacher[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => setList(getInvitedTeachers());
    refresh();
    window.addEventListener("ah-teacher-invites-change", refresh);
    return () => window.removeEventListener("ah-teacher-invites-change", refresh);
  }, []);

  const stats = useMemo(() => getTeacherInviteStats(list), [list]);

  return (
    <div className="space-y-5">
      {showStats && stats.total > 0 && <TeacherStatsStrip stats={stats} reduce={!!reduce} />}
      <MethodEntry method={method} />
      {list.length > 0 && <TeacherTable list={list} />}
      {list.length === 0 && method && <EmptyHint method={method} />}
    </div>
  );
}

function TeacherStatsStrip({
  stats,
  reduce,
}: {
  stats: ReturnType<typeof getTeacherInviteStats>;
  reduce: boolean;
}) {
  const activationPct = stats.invited > 0 ? Math.round((stats.active / stats.invited) * 100) : 0;
  const tiles = [
    { label: "Invites sent", value: stats.invited, tone: "hsl(200 60% 50%)", Icon: Send, sub: stats.pending > 0 ? `${stats.pending} pending` : "all sent" },
    { label: "Teachers active", value: stats.active, tone: "hsl(142 55% 45%)", Icon: CheckCircle2, sub: `${activationPct}% activated` },
    { label: "Pending invite", value: stats.pending, tone: "hsl(38 92% 50%)", Icon: Clock, sub: stats.pending > 0 ? "send when ready" : "you're caught up" },
  ];
  return (
    <div data-tour-target="school-teacher-stats">
      <div className="premium-eyebrow mb-2.5">
        <Users className="h-3 w-3" />
        <span>Teacher activation · {stats.total}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => {
          const Icon = t.Icon;
          return (
            <motion.div
              key={t.label}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5 overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${t.tone}, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground">{t.label}</span>
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${t.tone} 12%, transparent)`, color: t.tone }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 font-heading font-extrabold text-[26px] tabular-nums leading-none">{t.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{t.sub}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 rounded-full bg-muted/60 h-1.5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${activationPct}%` }}
          transition={{ duration: 0.7, ease: EASE }}
          className="h-full rounded-full bg-gradient-to-r from-[hsl(142_55%_45%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_60%)]"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-semibold text-muted-foreground">
        <span>{stats.active} of {stats.invited} invited teachers have signed in</span>
        <span className="tabular-nums">{activationPct}%</span>
      </div>
    </div>
  );
}

function MethodEntry({ method }: { method: TeacherInviteMethod | null }) {
  if (method === "manual") return <ManualForm />;
  if (method === "invite") return <BulkInviteForm />;
  if (method === "csv") return <CsvCard />;
  if (method === "google") return <GoogleSyncCard />;
  return null;
}

function ManualForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");

  const canSubmit = fullName.trim().length >= 2;
  const hasContact = email.trim() || phone.trim();

  const reset = () => {
    setFullName(""); setEmail(""); setPhone(""); setSubject("");
  };
  const submit = (sendNow: boolean) => {
    if (!canSubmit) return;
    if (sendNow && !hasContact) {
      toast.error("Add an email or phone to send the invite");
      return;
    }
    addInvitedTeacher(
      { fullName, email, phone, subject, source: "manual" },
      { sendInvite: sendNow },
    );
    toast.success(
      sendNow
        ? `Added ${fullName.trim()} · invite sent`
        : `Added ${fullName.trim()} — send invite when ready`,
    );
    reset();
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <UserPlus className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <div className="font-heading font-bold text-[13.5px]">Add a teacher</div>
          <div className="text-[11.5px] text-muted-foreground">
            Enter the basics. Send invite now or queue it.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <FieldInput icon={<User className="h-3.5 w-3.5" />} label="Full name" value={fullName} onChange={setFullName} placeholder="Maya Khan" required />
        <FieldInput icon={<BookOpen className="h-3.5 w-3.5" />} label="Subject" value={subject} onChange={setSubject} placeholder="Math, ELA, …" />
        <FieldInput icon={<Mail className="h-3.5 w-3.5" />} label="School email" value={email} onChange={setEmail} placeholder="maya.khan@school.edu" type="email" />
        <FieldInput icon={<Phone className="h-3.5 w-3.5" />} label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+91 98xxx xxxxx" type="tel" />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          {hasContact ? "Contact present — invite can go now." : "Add at least one contact to enable invite-on-add."}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!canSubmit}
            className="h-9 px-3 rounded-lg text-[12.5px] font-bold border border-border bg-card/70 hover:bg-muted/60 transition-colors disabled:opacity-50"
          >
            Add without invite
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!canSubmit || !hasContact}
            className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px] disabled:opacity-50"
          >
            <span className="sheen" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" /> Add & send invite
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkInviteForm() {
  const [text, setText] = useState("");
  const parsed = useMemo(() => parseBulk(text), [text]);
  const validCount = parsed.filter((p) => p.valid).length;

  const sendAll = () => {
    const valid = parsed.filter((p) => p.valid);
    if (valid.length === 0) {
      toast.error("Add at least one valid email or phone");
      return;
    }
    bulkAddInvitedTeachers(
      valid.map((p) => ({
        fullName: p.fullName || "Unnamed teacher",
        email: p.email,
        phone: p.phone,
        source: "invite" as TeacherInviteMethod,
      })),
      { sendInvite: true },
    );
    toast.success(`Sent ${valid.length} teacher ${valid.length === 1 ? "invite" : "invites"}`);
    setText("");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Send className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <div className="font-heading font-bold text-[13.5px]">Send teacher app invites</div>
          <div className="text-[11.5px] text-muted-foreground">
            Each teacher gets a sign-in link they activate from their email or phone.
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Paste contacts
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={
            "One per line — any of these formats:\n" +
            "Maya Khan, maya.khan@school.edu\n" +
            "Arjun Reddy, +91 98765 43210\n" +
            "priya.iyer@school.edu, +91 90000 11111"
          }
          className="mt-1.5 w-full rounded-xl border border-border/80 bg-card/70 backdrop-blur px-3.5 py-2.5 text-[13px] font-mono leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 transition-[border-color,box-shadow]"
        />
        <div className="mt-2 flex items-center justify-between text-[11.5px]">
          <span className="text-muted-foreground inline-flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            We'll detect emails and phones automatically.
          </span>
          <span className="font-semibold tabular-nums">
            {validCount > 0 ? (
              <span className="text-primary">{validCount} ready · {parsed.length - validCount} skipped</span>
            ) : parsed.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">{parsed.length} entries · none have contact</span>
            ) : (
              <span className="text-muted-foreground">0 entries</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setText("")}
          disabled={text.length === 0}
          className="h-9 px-3 rounded-lg text-[12.5px] font-bold border border-border bg-card/70 hover:bg-muted/60 transition-colors disabled:opacity-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={sendAll}
          disabled={validCount === 0}
          className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px] disabled:opacity-50"
        >
          <span className="sheen" aria-hidden />
          <span className="inline-flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send {validCount > 0 ? `${validCount} ` : ""}invite{validCount === 1 ? "" : "s"}
          </span>
        </button>
      </div>
    </div>
  );
}

function CsvCard() {
  const [parsing, setParsing] = useState(false);
  const fakeImport = () => {
    setParsing(true);
    window.setTimeout(() => {
      bulkAddInvitedTeachers(
        [
          { fullName: "Aarav Bose", email: "aarav.bose@school.edu", subject: "Science", source: "csv" },
          { fullName: "Meera Joshi", email: "meera.joshi@school.edu", subject: "Math", source: "csv" },
          { fullName: "Sahil Verma", email: "sahil.verma@school.edu", subject: "ELA", source: "csv" },
          { fullName: "Naina Das", email: "naina.das@school.edu", subject: "Art", source: "csv" },
          { fullName: "Aryan Singh", email: "aryan.singh@school.edu", subject: "PE", source: "csv" },
        ],
        { sendInvite: false },
      );
      setParsing(false);
      toast.success("Imported 5 teachers from CSV — invites are queued");
    }, 700);
  };
  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.04] p-6 text-center">
      <Upload className="h-5 w-5 mx-auto text-primary" />
      <div className="mt-2 font-heading font-bold text-[13.5px]">Drop your teacher CSV</div>
      <div className="text-[11.5px] text-muted-foreground mt-0.5">
        Columns: <code className="font-mono">name, email, subject</code>
      </div>
      <button
        onClick={fakeImport}
        disabled={parsing}
        className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-bold border border-border bg-card/70 hover:bg-muted/60 transition-colors disabled:opacity-60"
      >
        {parsing ? (
          <>
            <span className="ring-spin !h-3 !w-3 !border-primary !border-t-transparent" /> Parsing…
          </>
        ) : (
          <>
            <Upload className="h-3 w-3" /> Pick a file (demo)
          </>
        )}
      </button>
    </div>
  );
}

function GoogleSyncCard() {
  const sync = () => {
    bulkAddInvitedTeachers(
      [
        { fullName: "Riya Kapoor", email: "riya.kapoor@school.edu", subject: "Science", source: "google" },
        { fullName: "Devansh Rao", email: "devansh.rao@school.edu", subject: "Math", source: "google" },
        { fullName: "Tara Mehta", email: "tara.mehta@school.edu", subject: "Music", source: "google" },
      ],
      { sendInvite: true },
    );
    toast.success("Synced 3 teachers from Google Workspace · invites sent");
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 flex items-center gap-4">
      <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <School className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[13.5px]">Connect Google Workspace</div>
        <div className="text-[11.5px] text-muted-foreground">
          We'll pull staff from your domain group and email each teacher their invite.
        </div>
      </div>
      <button onClick={sync} className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]">
        <span className="sheen" aria-hidden />
        <span className="inline-flex items-center gap-1.5">
          <School className="h-3.5 w-3.5" /> Connect (demo)
        </span>
      </button>
    </div>
  );
}

function EmptyHint({ method }: { method: TeacherInviteMethod }) {
  const text =
    method === "csv" ? "Drop a CSV above to populate your cohort." :
    method === "google" ? "Connect Workspace to pull your staff list." :
    method === "invite" ? "Paste contacts above and send the first invites." :
    method === "manual" ? "Add your first teacher using the form above." : "";
  if (!text) return null;
  return <div className="text-center text-[12.5px] text-muted-foreground py-2">{text}</div>;
}

function TeacherTable({ list }: { list: InvitedTeacher[] }) {
  const [filter, setFilter] = useState<"all" | TeacherInviteStatus>("all");
  const counts = {
    all: list.length,
    "pending-invite": list.filter((s) => s.status === "pending-invite").length,
    invited: list.filter((s) => s.status === "invited").length,
    active: list.filter((s) => s.status === "active").length,
  };
  const filtered = filter === "all" ? list : list.filter((s) => s.status === filter);

  const sendPending = () => {
    const n = sendAllPendingTeacherInvites();
    if (n === 0) {
      toast("Nothing pending to invite");
      return;
    }
    toast.success(`Sent ${n} ${n === 1 ? "invite" : "invites"}`);
  };
  const reset = () => {
    if (!window.confirm("Clear all teachers from your cohort? This is a demo reset.")) return;
    clearTeacherInvites();
    toast("Cohort cleared");
  };

  return (
    <div data-tour-target="school-teacher-table">
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="premium-eyebrow">
          <Users className="h-3 w-3" />
          <span>Your teachers · {list.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {counts["pending-invite"] > 0 && (
            <button
              onClick={sendPending}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11.5px] font-bold border border-primary/40 bg-primary/[0.06] text-primary hover:bg-primary/10 transition-colors"
            >
              <Send className="h-3 w-3" />
              Send all {counts["pending-invite"]} pending
            </button>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Clear all (demo)"
          >
            <Trash2 className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="inline-flex rounded-full border border-border/60 bg-card/70 p-0.5 mb-2.5">
        {(["all", "active", "invited", "pending-invite"] as const).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "All" : f === "active" ? "Active" : f === "invited" ? "Invited" : "Pending";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors inline-flex items-center gap-1",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span className={cn("tabular-nums text-[10px] px-1 rounded-full", active ? "bg-white/20" : "bg-muted/70 text-muted-foreground")}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
        <AnimatePresence initial={false}>
          {filtered.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <Row teacher={t} />
            </motion.li>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">
            No teachers in this view.
          </li>
        )}
      </ul>
    </div>
  );
}

function Row({ teacher: t }: { teacher: InvitedTeacher }) {
  const initials = t.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue = Math.abs(hash(t.id)) % 360;

  const onSend = () => {
    if (!t.email && !t.phone) {
      toast.error("Add a contact to send the invite");
      return;
    }
    sendTeacherInvite(t.id);
    toast.success(`Invite sent to ${t.fullName}`);
  };
  const onResend = () => {
    sendTeacherInvite(t.id);
    toast.success(`Resent invite for ${t.fullName}`);
  };
  const onSimulate = () => {
    simulateTeacherJoin(t.id);
    toast.success(`${t.fullName} signed in (demo)`);
  };
  const onRemove = () => {
    removeInvitedTeacher(t.id);
    toast(`Removed ${t.fullName}`);
  };
  const canInvite = !!(t.email || t.phone);

  return (
    <div className="flex items-center gap-3 p-3 sm:p-3.5 hover:bg-muted/30 transition-colors">
      <div
        className="h-10 w-10 rounded-xl text-white font-heading font-extrabold text-[12px] flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 70%), hsl(${(hue + 60) % 360} 55% 55%))` }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-heading font-bold text-[13.5px] truncate">{t.fullName}</span>
          <StatusBadge status={t.status} />
          {t.subject && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1 py-0.5 rounded bg-muted/60">
              {t.subject}
            </span>
          )}
        </div>
        <div className="text-[11.5px] text-muted-foreground truncate flex items-center gap-2">
          {t.email && (
            <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {t.email}</span>
          )}
          {t.phone && (
            <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {t.phone}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {t.status === "pending-invite" && (
          <button
            onClick={onSend}
            disabled={!canInvite}
            title={canInvite ? "Send invite" : "Add a contact first"}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11.5px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3 w-3" /> Send invite
          </button>
        )}
        {t.status === "invited" && (
          <>
            <button onClick={onResend} title="Resend invite" className="premium-icon-btn !h-8 !w-8" aria-label="Resend invite">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={onSimulate} title="Demo: simulate sign-in" className="premium-icon-btn !h-8 !w-8 !text-[hsl(142_55%_45%)] hover:!bg-primary/10" aria-label="Demo: simulate sign-in">
              <PlayCircle className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <button onClick={onRemove} title="Remove" className="premium-icon-btn !h-8 !w-8 hover:!text-destructive hover:!bg-destructive/10" aria-label="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TeacherInviteStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25">
        <CheckCircle2 className="h-2.5 w-2.5" /> Active
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-[hsl(200_60%_50%)]/15 text-[hsl(200_60%_45%)] dark:text-[hsl(200_70%_70%)] border border-[hsl(200_60%_50%)]/25">
        <Send className="h-2.5 w-2.5" /> Invited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
      <Clock className="h-2.5 w-2.5" /> Pending
    </span>
  );
}

function FieldInput({
  icon, label, value, onChange, placeholder, type, required,
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
        {icon}{label}{required && <span className="text-destructive">*</span>}
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

const EMAIL_RE = /\S+@\S+\.\S+/;
const PHONE_RE = /[+\d][\d\s\-()]{6,}/;

function parseBulk(text: string) {
  return text
    .split(/[\n;]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      const emailMatch = raw.match(EMAIL_RE);
      const email = emailMatch?.[0];
      const remainder = email ? raw.replace(email, "") : raw;
      const phoneMatch = remainder.match(PHONE_RE);
      const phone = phoneMatch?.[0]?.trim();
      const tokens = raw.split(/[,|]/).map((t) => t.trim()).filter(Boolean);
      const nameToken = tokens.find((t) => !EMAIL_RE.test(t) && !PHONE_RE.test(t.replace(EMAIL_RE, "")));
      return { fullName: nameToken, email, phone, raw, valid: !!(email || phone) };
    });
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
