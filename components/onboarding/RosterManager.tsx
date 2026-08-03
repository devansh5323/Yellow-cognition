"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Send,
  UserPlus,
  Upload,
  School,
  Sparkles,
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
} from "lucide-react";
import { toast } from "sonner";
import type { RosterMethod } from "@/lib/onboarding";
import {
  addStudent,
  bulkAdd,
  clearRoster,
  getRoster,
  getStats,
  removeStudent,
  sendAllPendingInvites,
  sendInvite,
  simulateLogin,
  type RosterStudent,
  type StudentStatus,
} from "@/lib/roster";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function RosterManager({ method }: { method: RosterMethod | null }) {
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => setRoster(getRoster());
    refresh();
    window.addEventListener("ah-roster-change", refresh);
    return () => window.removeEventListener("ah-roster-change", refresh);
  }, []);

  const stats = useMemo(() => getStats(roster), [roster]);

  return (
    <div className="space-y-5">
      {/* Stats strip — always visible if any students exist */}
      {stats.total > 0 && <InviteStatsStrip stats={stats} reduce={!!reduce} />}

      {/* Method-specific entry */}
      <MethodEntry method={method} />

      {/* Roster table */}
      {roster.length > 0 && <RosterTable roster={roster} />}

      {/* Empty state when nothing yet */}
      {roster.length === 0 && method !== "sample" && method && (
        <EmptyRosterHint method={method} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Stats strip
 * ───────────────────────────────────────────────────────── */
function InviteStatsStrip({
  stats,
  reduce,
}: {
  stats: ReturnType<typeof getStats>;
  reduce: boolean;
}) {
  const activationPct =
    stats.invited > 0 ? Math.round((stats.active / stats.invited) * 100) : 0;
  const tiles = [
    {
      label: "Invites sent",
      value: stats.invited,
      tone: "hsl(200 60% 50%)",
      Icon: Send,
      sub: stats.pending > 0 ? `${stats.pending} pending` : "all sent",
    },
    {
      label: "Students logged in",
      value: stats.active,
      tone: "hsl(142 55% 45%)",
      Icon: CheckCircle2,
      sub: `${activationPct}% activated`,
    },
    {
      label: "Pending invite",
      value: stats.pending,
      tone: "hsl(38 92% 50%)",
      Icon: Clock,
      sub: stats.pending > 0 ? "send when ready" : "you're caught up",
    },
  ];

  return (
    <div>
      <div className="premium-eyebrow mb-2.5">
        <Users className="h-3 w-3" />
        <span>Activation · {stats.total} {stats.total === 1 ? "child" : "children"}</span>
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
              style={{ ["--kpi-tone" as string]: t.tone }}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${t.tone}, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                  {t.label}
                </span>
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${t.tone} 12%, transparent)`, color: t.tone }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 font-heading font-extrabold text-[26px] tabular-nums leading-none">
                {t.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{t.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Activation progress bar */}
      <div className="mt-3 rounded-full bg-muted/60 h-1.5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${activationPct}%` }}
          transition={{ duration: 0.7, ease: EASE }}
          className="h-full rounded-full bg-gradient-to-r from-[hsl(142_55%_45%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_60%)]"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-semibold text-muted-foreground">
        <span>{stats.active} of {stats.invited} invited families have activated</span>
        <span className="tabular-nums">{activationPct}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Method-specific entry
 * ───────────────────────────────────────────────────────── */
function MethodEntry({ method }: { method: RosterMethod | null }) {
  if (method === "manual") return <ManualEntryForm />;
  if (method === "invite") return <InviteForm />;
  if (method === "csv") return <CsvUploadCard />;
  if (method === "google") return <GoogleConnectCard />;
  if (method === "sample") return <SampleNotice />;
  return null;
}

/* Manual one-at-a-time form */
function ManualEntryForm() {
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const canSubmit = childName.trim().length >= 2;
  const hasContact = parentEmail.trim() || parentPhone.trim();

  const reset = () => {
    setChildName("");
    setParentName("");
    setParentEmail("");
    setParentPhone("");
  };

  const submit = (sendNow: boolean) => {
    if (!canSubmit) return;
    if (sendNow && !hasContact) {
      toast.error("Add an email or phone number to send the invite");
      return;
    }
    addStudent(
      {
        childName,
        parentName,
        parentEmail,
        parentPhone,
        source: "manual",
      },
      { sendInvite: sendNow },
    );
    toast.success(
      sendNow
        ? `Added ${childName.trim()} · invite sent to parent`
        : `Added ${childName.trim()} — send the invite when ready`,
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
          <div className="font-heading font-bold text-[13.5px]">Add a student</div>
          <div className="text-[11.5px] text-muted-foreground">
            Enter the child's details + parent contact. Send invite now or later.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <FieldInput
          icon={<User className="h-3.5 w-3.5" />}
          label="Child name"
          value={childName}
          onChange={setChildName}
          placeholder="Ananya Rao"
          required
        />
        <FieldInput
          icon={<User className="h-3.5 w-3.5" />}
          label="Parent name"
          value={parentName}
          onChange={setParentName}
          placeholder="Ravi Rao"
        />
        <FieldInput
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Parent email"
          value={parentEmail}
          onChange={setParentEmail}
          placeholder="ravi.rao@example.com"
          type="email"
        />
        <FieldInput
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Parent phone"
          value={parentPhone}
          onChange={setParentPhone}
          placeholder="+91 98xxx xxxxx"
          type="tel"
        />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          {hasContact
            ? "Email or phone present — invite can be sent now."
            : "Add at least one contact to enable invite-on-add."}
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
              <Send className="h-3.5 w-3.5" />
              Add & send invite
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Bulk parent-app invite form */
function InviteForm() {
  const [bulkText, setBulkText] = useState("");

  const parsed = useMemo(() => parseBulkContacts(bulkText), [bulkText]);
  const validCount = parsed.filter((p) => p.valid).length;

  const sendAll = () => {
    const valid = parsed.filter((p) => p.valid);
    if (valid.length === 0) {
      toast.error("Add at least one valid email or phone");
      return;
    }
    bulkAdd(
      valid.map((p) => ({
        childName: p.childName || "Unnamed child",
        parentEmail: p.email,
        parentPhone: p.phone,
        source: "invite" as RosterMethod,
      })),
      { sendInvite: true },
    );
    toast.success(`Sent ${valid.length} parent ${valid.length === 1 ? "invite" : "invites"}`);
    setBulkText("");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Send className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <div className="font-heading font-bold text-[13.5px]">Send parent app invites</div>
          <div className="text-[11.5px] text-muted-foreground">
            Each parent gets a link to download the Yellow app and create their child's profile.
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Paste contacts
        </label>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          rows={6}
          placeholder={
            "One per line — any of these formats:\n" +
            "Aarav Sharma, ravi.sharma@example.com\n" +
            "Maya Iyer, +91 98765 43210\n" +
            "rohan.patel, kavita.patel@parents.com, +91 90000 11111"
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
          onClick={() => setBulkText("")}
          disabled={bulkText.length === 0}
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

/* CSV drop zone */
function CsvUploadCard() {
  const [parsing, setParsing] = useState(false);

  // Demo-only: pretend to import 8 students when "file" dropped/clicked
  const fakeImport = () => {
    setParsing(true);
    window.setTimeout(() => {
      bulkAdd(
        [
          { childName: "Liam Chen", parentEmail: "lin.chen@parents.example", source: "csv" },
          { childName: "Sofia Reyes", parentEmail: "ana.reyes@parents.example", source: "csv" },
          { childName: "Ethan Patel", parentEmail: "amit.patel@parents.example", source: "csv" },
          { childName: "Aisha Ng", parentEmail: "wei.ng@parents.example", source: "csv" },
          { childName: "Noah Singh", parentEmail: "jas.singh@parents.example", source: "csv" },
          { childName: "Mia Khan", parentEmail: "saira.khan@parents.example", source: "csv" },
          { childName: "Kai Park", parentEmail: "minho.park@parents.example", source: "csv" },
          { childName: "Olivia Das", parentEmail: "subhra.das@parents.example", source: "csv" },
        ],
        { sendInvite: false },
      );
      setParsing(false);
      toast.success("Imported 8 students from CSV — invites are queued");
    }, 700);
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.04] p-6 text-center">
      <Upload className="h-5 w-5 mx-auto text-primary" />
      <div className="mt-2 font-heading font-bold text-[13.5px]">Drop your roster CSV here</div>
      <div className="text-[11.5px] text-muted-foreground mt-0.5">
        Columns: <code className="font-mono">name, parent_email, parent_phone</code>
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

/* Google Classroom mock */
function GoogleConnectCard() {
  const sync = () => {
    bulkAdd(
      [
        { childName: "Avery Stone", parentEmail: "avery.stone@gmail.example", source: "google" },
        { childName: "Jordan Lee", parentEmail: "jordan.lee@gmail.example", source: "google" },
        { childName: "Riley Cohen", parentEmail: "riley.cohen@gmail.example", source: "google" },
        { childName: "Sam Hayes", parentEmail: "sam.hayes@gmail.example", source: "google" },
        { childName: "Casey Bloom", parentEmail: "casey.bloom@gmail.example", source: "google" },
      ],
      { sendInvite: true },
    );
    toast.success("Synced 5 students from Google Classroom · invites sent");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5 flex items-center gap-4">
      <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <School className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[13.5px]">Connect Google Classroom</div>
        <div className="text-[11.5px] text-muted-foreground">
          We'll pull your roster and email each parent the Yellow invite.
        </div>
      </div>
      <button
        onClick={sync}
        className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]"
      >
        <span className="sheen" aria-hidden />
        <span className="inline-flex items-center gap-1.5">
          <School className="h-3.5 w-3.5" />
          Connect (demo)
        </span>
      </button>
    </div>
  );
}

/* Sample method explainer */
function SampleNotice() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 flex items-center gap-3">
      <span className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="flex-1 text-[12.5px] text-muted-foreground">
        You're using a <span className="text-foreground font-semibold">sample class of 24 demo students</span>.
        Switch to any other method to start adding your real students.
      </div>
    </div>
  );
}

/* Empty state when method picked but no students yet */
function EmptyRosterHint({ method }: { method: RosterMethod }) {
  const text =
    method === "csv"
      ? "Drop a CSV above to populate your roster."
      : method === "google"
      ? "Connect Google Classroom to pull your students."
      : method === "invite"
      ? "Add parent contacts above and send the first invites."
      : method === "manual"
      ? "Add your first student using the form above."
      : "";
  if (!text) return null;
  return (
    <div className="text-center text-[12.5px] text-muted-foreground py-2">{text}</div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Roster table
 * ───────────────────────────────────────────────────────── */
function RosterTable({ roster }: { roster: RosterStudent[] }) {
  const [filter, setFilter] = useState<"all" | StudentStatus>("all");

  const counts = {
    all: roster.length,
    "pending-invite": roster.filter((s) => s.status === "pending-invite").length,
    invited: roster.filter((s) => s.status === "invited").length,
    active: roster.filter((s) => s.status === "active").length,
  };

  const filtered = filter === "all" ? roster : roster.filter((s) => s.status === filter);

  const sendAllPending = () => {
    const n = sendAllPendingInvites();
    if (n === 0) {
      toast("Nothing pending to invite");
      return;
    }
    toast.success(`Sent ${n} ${n === 1 ? "invite" : "invites"}`);
  };

  const reset = () => {
    if (!window.confirm("Clear all students from the roster? This is a demo reset.")) return;
    clearRoster();
    toast("Roster cleared");
  };

  return (
    <div data-tour-target="invite-all">
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="premium-eyebrow">
          <Users className="h-3 w-3" />
          <span>Your roster · {roster.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {counts["pending-invite"] > 0 && (
            <button
              onClick={sendAllPending}
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
          const count = counts[f];
          const label =
            f === "all" ? "All" : f === "active" ? "Active" : f === "invited" ? "Invited" : "Pending";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors inline-flex items-center gap-1",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span
                className={cn(
                  "tabular-nums text-[10px] px-1 rounded-full",
                  active ? "bg-white/20" : "bg-muted/70 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
        <AnimatePresence initial={false}>
          {filtered.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <RosterRow student={s} />
            </motion.li>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">
            No students in this view.
          </li>
        )}
      </ul>
    </div>
  );
}

function RosterRow({ student: s }: { student: RosterStudent }) {
  const initials = s.childName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = Math.abs(hashCode(s.id)) % 360;

  return (
    <div className="flex items-center gap-3 p-3 sm:p-3.5 hover:bg-muted/30 transition-colors">
      <div
        className="h-10 w-10 rounded-xl text-white font-heading font-extrabold text-[12px] flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 55% 70%), hsl(${(hue + 60) % 360} 55% 55%))`,
        }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-heading font-bold text-[13.5px] truncate">{s.childName}</span>
          <StatusBadge status={s.status} />
          <SourceTag source={s.source} />
        </div>
        <div className="text-[11.5px] text-muted-foreground truncate flex items-center gap-2">
          {s.parentName && <span>{s.parentName}</span>}
          {s.parentEmail && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {s.parentEmail}
            </span>
          )}
          {s.parentPhone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> {s.parentPhone}
            </span>
          )}
        </div>
      </div>
      <RowActions student={s} />
    </div>
  );
}

function RowActions({ student: s }: { student: RosterStudent }) {
  const canInvite = !!(s.parentEmail || s.parentPhone);

  const onSend = () => {
    if (!canInvite) {
      toast.error("Add an email or phone to send an invite");
      return;
    }
    sendInvite(s.id);
    toast.success(`Invite sent to ${s.parentName ?? s.parentEmail ?? s.parentPhone}`);
  };
  const onResend = () => {
    sendInvite(s.id);
    toast.success(`Resent invite for ${s.childName}`);
  };
  const onSimulate = () => {
    simulateLogin(s.id);
    toast.success(`${s.childName}'s parent logged in (demo)`);
  };
  const onRemove = () => {
    removeStudent(s.id);
    toast(`Removed ${s.childName}`);
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {s.status === "pending-invite" && (
        <button
          onClick={onSend}
          disabled={!canInvite}
          title={canInvite ? "Send parent app invite" : "Add a contact first"}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11.5px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3 w-3" />
          Send invite
        </button>
      )}
      {s.status === "invited" && (
        <>
          <button
            onClick={onResend}
            title="Resend invite"
            className="premium-icon-btn !h-8 !w-8"
            aria-label="Resend invite"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onSimulate}
            title="Demo: simulate parent login"
            className="premium-icon-btn !h-8 !w-8 !text-[hsl(142_55%_45%)] hover:!bg-primary/10"
            aria-label="Demo: simulate parent login"
          >
            <PlayCircle className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      <button
        onClick={onRemove}
        title="Remove from roster"
        className="premium-icon-btn !h-8 !w-8 hover:!text-destructive hover:!bg-destructive/10"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Logged in
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-[hsl(200_60%_50%)]/15 text-[hsl(200_60%_45%)] dark:text-[hsl(200_70%_70%)] border border-[hsl(200_60%_50%)]/25">
        <Send className="h-2.5 w-2.5" />
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
      <Clock className="h-2.5 w-2.5" />
      Pending invite
    </span>
  );
}

function SourceTag({ source }: { source: RosterMethod }) {
  const text =
    source === "invite"
      ? "Invite"
      : source === "csv"
      ? "CSV"
      : source === "google"
      ? "Google"
      : source === "manual"
      ? "Manual"
      : "Sample";
  return (
    <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1 py-0.5 rounded bg-muted/60">
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
 * Tiny helpers
 * ───────────────────────────────────────────────────────── */
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

const EMAIL_RE = /\S+@\S+\.\S+/;
const PHONE_RE = /[+\d][\d\s\-()]{6,}/;

type ParsedContact = {
  childName?: string;
  email?: string;
  phone?: string;
  raw: string;
  valid: boolean;
};

function parseBulkContacts(text: string): ParsedContact[] {
  return text
    .split(/[\n;]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      // Try to find an email and a phone in the line
      const emailMatch = raw.match(EMAIL_RE);
      const email = emailMatch?.[0];
      // Strip the email out before phone-matching to avoid digit overlap
      const remainder = email ? raw.replace(email, "") : raw;
      const phoneMatch = remainder.match(PHONE_RE);
      const phone = phoneMatch?.[0]?.trim();

      // Split tokens by comma; the first non-email/non-phone token is treated as the child name
      const tokens = raw.split(/[,|]/).map((t) => t.trim()).filter(Boolean);
      const nameToken = tokens.find(
        (t) => !EMAIL_RE.test(t) && !PHONE_RE.test(t.replace(EMAIL_RE, "")),
      );

      return {
        childName: nameToken,
        email,
        phone,
        raw,
        valid: !!(email || phone),
      };
    });
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
