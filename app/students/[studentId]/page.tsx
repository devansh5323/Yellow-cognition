"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceDot,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChevronLeft,
  Mail,
  Phone,
  FileText,
  Award,
  Sparkles,
  Clock,
  AlertTriangle,
  MessageSquarePlus,
  Tag,
  Plus,
  X,
  ShieldCheck,
  Share2,
  Globe2,
  GraduationCap,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Calculator,
  BookOpen,
  FlaskConical,
  Languages,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getStudent, MONTH_LABELS, SUBJECT_DETAILS, type Student } from "@/data/mockData";

const SUBJECT_ICONS = {
  "calculator": Calculator,
  "book-open": BookOpen,
  "flask-conical": FlaskConical,
  "languages": Languages,
  "globe-2": Globe2,
} as const;
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import {
  useStudentOverrides,
  addTag,
  removeTag,
  setRisk,
  removeNote,
  PRESET_TAGS,
} from "@/lib/studentMutations";
import { NoteDialog } from "@/components/dashboard/NoteDialog";
import { ContactParentDialog } from "@/components/dashboard/ContactParentDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STUDENT_TABS = ["profile", "overview", "journey", "reports"] as const;

type StudentTab = (typeof STUDENT_TABS)[number];

function parseStudentTab(value: unknown): StudentTab {
  return typeof value === "string" && STUDENT_TABS.includes(value as StudentTab)
    ? (value as StudentTab)
    : "profile";
}

function StudentNotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="font-heading font-bold text-xl">Student not found</h2>
      <Link href="/students" className="text-primary text-sm mt-2 inline-block">
        ← Back to roster
      </Link>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ studentId: string }>();
  const student = params?.studentId ? getStudent(params.studentId) : null;

  return (
    <AppShell>
      {student ? (
        <Suspense fallback={null}>
          <StudentPage student={student} />
        </Suspense>
      ) : (
        <StudentNotFound />
      )}
    </AppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid hsl(240 15% 90%)",
  background: "hsl(0 0% 100% / 0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
  fontSize: 12,
};

function StudentPage({ student }: { student: Student }) {
  const searchParams = useSearchParams();
  const tab = parseStudentTab(searchParams?.get("tab"));
  const router = useRouter();
  const overrides = useStudentOverrides(student.id);
  const effectiveRisk = overrides.riskOverride ?? student.risk;
  const tags = overrides.tags;
  const notes = overrides.notes;
  const contacts = overrides.contacts;
  const reduce = useReducedMotion();

  const delta = student.pfi - student.pfiPrevCheckIn;
  const radar = student.subDomains.map((d: any) => ({
    domain: d.name.split(" ")[0],
    score: d.score,
    classAvg: d.classAvg,
  }));

  const monthlyAttention = student.monthly.map((v, i) => ({ month: MONTH_LABELS[i], attention: v }));
  const submittedMonths = monthlyAttention.filter((d): d is { month: string; attention: number } => d.attention != null);
  const bestMonth = submittedMonths.length
    ? submittedMonths.reduce((a, b) => (b.attention > a.attention ? b : a))
    : null;

  const weakest = [...student.subDomains].sort(
    (a, b) => a.score - a.classAvg - (b.score - b.classAvg),
  )[0];
  const weakestDelta = weakest.score - weakest.classAvg;

  const topDomain = [...student.subDomains].sort((a, b) => b.score - a.score)[0];
  const learningStyle = topDomain.name.includes("Visual")
    ? "Visual"
    : topDomain.name.includes("Memory")
    ? "Reflective"
    : topDomain.name.includes("Speed")
    ? "Kinesthetic"
    : "Auditory";

  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const idx = parseInt(student.id.replace(/\D/g, ""), 10) || 1;
  const studentCode = `AH-2026-${String(idx).padStart(3, "0")}`;
  const dob = new Date(2026 - student.age, (idx * 7) % 12, ((idx * 13) % 27) + 1).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const gender = idx % 2 === 0 ? "Female" : "Male";
  const cities = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai"];
  const city = cities[idx % cities.length];
  const board = ["CBSE", "ICSE", "IB", "State"][idx % 4];
  const interests = [
    ["Robotics", "Drawing", "Football"],
    ["Reading", "Music", "Chess"],
    ["Coding", "Dance", "Cricket"],
    ["Painting", "Swimming", "Puzzles"],
  ][idx % 4];
  const sortedDomains = [...student.subDomains].sort((a, b) => b.score - a.score);
  const strengths = sortedDomains.slice(0, 2);
  const growthAreas = sortedDomains.slice(-2);

  function handleAddTag(label: string) {
    addTag(student.id, label);
    toast.success(`Added tag “${label}”`);
    setTagPopoverOpen(false);
    setCustomTag("");
  }

  function handleMarkNeedsHelp() {
    if (effectiveRisk === "high") {
      setRisk(student.id, undefined);
      toast.success("Cleared Needs help flag");
    } else {
      setRisk(student.id, "high");
      toast.success("Marked as Needs help");
    }
  }

  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-5"
    >
      {/* ───── Breadcrumb ───── */}
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="flex items-center gap-2 text-[12.5px] text-muted-foreground"
      >
        <Link
          href="/students"
          className="group inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Students
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{student.name}</span>
      </motion.div>

      {/* ───── Hero ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="relative premium-surface rounded-[22px] p-6 overflow-hidden"
      >
        {/* Branded wash */}
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 50% at 0% 0%, hsl(142 60% 82% / 0.35), transparent 65%), radial-gradient(55% 50% at 100% 0%, hsl(260 70% 84% / 0.30), transparent 65%)",
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          <motion.div
            initial={reduce ? undefined : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.08 }}
          >
            <StudentAvatar student={student} size="xl" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading font-extrabold text-[26px] md:text-[32px] leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
                  {student.name}
                </span>
              </h1>
              <RiskBadge risk={effectiveRisk} />
              {student.lastActiveDays >= 3 && (
                <Badge
                  variant="outline"
                  className="bg-warning/20 text-warning-foreground border-warning/40 dark:text-warning gap-1 rounded-full font-semibold"
                >
                  <AlertTriangle className="h-3 w-3" /> Inactive {student.lastActiveDays}d
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              Age {student.age} · {student.grade} Section {student.section} · Coach {student.coach}
              {" · "}
              Last active {student.lastActiveDays === 0 ? "today" : `${student.lastActiveDays}d ago`}
            </p>

            {/* Tag chips row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
              {tags.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold pl-2.5 pr-1 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70"
                >
                  {t.label}
                  <button
                    onClick={() => {
                      removeTag(student.id, t.label);
                      toast(`Removed “${t.label}”`);
                    }}
                    className="ml-0.5 h-4 w-4 rounded-full hover:bg-background/60 flex items-center justify-center"
                    aria-label={`Remove ${t.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full border border-dashed border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                    <Tag className="h-3 w-3" /> Add tag
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 rounded-xl premium-glass" align="start">
                  <div className="premium-eyebrow mb-2"><span>Intervention tags</span></div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PRESET_TAGS.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleAddTag(t)}
                        className="premium-pill text-[11.5px] hover:cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="premium-search h-8 flex-1 px-2.5">
                      <input
                        placeholder="Custom tag…"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customTag.trim()) handleAddTag(customTag);
                        }}
                        className="text-[13px]"
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={!customTag.trim()}
                      onClick={() => handleAddTag(customTag)}
                      className="h-8 px-2 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <Stat label="Current PFI" value={student.pfi} delta={delta} />
              <Stat label="CSI" value={student.csi} />
              <Stat label="Games" value={`${student.gamesPlayed}/${student.gamesAssigned}`} />
              <Stat label="Days active" value={`${student.daysActive}/28`} />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-lg bg-card/70 backdrop-blur"
                onClick={() => setNoteOpen(true)}
              >
                <MessageSquarePlus className="h-4 w-4" /> Add note
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-lg bg-card/70 backdrop-blur"
                onClick={() => setContactOpen(true)}
              >
                <Mail className="h-4 w-4" /> Contact parent
              </Button>
              <Button
                size="sm"
                variant={effectiveRisk === "high" ? "secondary" : "outline"}
                className="gap-1.5 rounded-lg"
                onClick={handleMarkNeedsHelp}
              >
                {effectiveRisk === "high" ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-primary" /> Clear flag
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Mark as Needs help
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ───── Tabs ───── */}
      <Tabs
        value={tab}
        onValueChange={(next) => {
          router.replace(`/students/${student.id}?tab=${parseStudentTab(next)}`);
        }}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 backdrop-blur p-1 h-auto flex-wrap rounded-full border border-border/70">
          <StudentTab value="profile">Profile</StudentTab>
          <StudentTab value="overview">Overview</StudentTab>
          <StudentTab value="journey">Hero Journey</StudentTab>
          <StudentTab value="reports">Reports</StudentTab>
        </TabsList>

        {/* ───── PROFILE ───── */}
        <TabsContent value="profile">
          <div className="grid md:grid-cols-2 gap-4">
            <PanelCard title="Demographics">
              <Row k="Full name" v={student.name} />
              <Row k="Student ID" v={studentCode} />
              <Row k="Date of birth" v={dob} />
              <Row k="Age" v={`${student.age} years`} />
              <Row k="Gender" v={gender} />
              <Row k="City" v={city} />
              <Row k="Mother tongue" v={idx % 3 === 0 ? "Hindi" : idx % 3 === 1 ? "Marathi" : "Tamil"} />
              <Row k="Languages" v="English, Hindi" icon={<Globe2 className="h-3.5 w-3.5" />} />
              <Row k="Allergies / medical" v="None reported" />
              <Row k="Emergency contact" v={student.parent.phone} icon={<Phone className="h-3.5 w-3.5" />} />
            </PanelCard>

            <PanelCard title="Parent contact">
              <Row k="Name" v={student.parent.name} />
              <Row k="Email" v={student.parent.email} icon={<Mail className="h-3.5 w-3.5" />} />
              <Row k="Phone" v={student.parent.phone} icon={<Phone className="h-3.5 w-3.5" />} />
              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setContactOpen(true)}>
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setContactOpen(true)}>
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </Button>
              </div>
            </PanelCard>

            <PanelCard title="School & cohort">
              <Row k="School" v="Lovable Academy" icon={<GraduationCap className="h-3.5 w-3.5" />} />
              <Row k="Board" v={board} />
              <Row k="Class teacher" v={student.coach} />
              <Row k="Assigned coach" v={student.coach} />
              <Row k="Joined" v="Aug 12, 2024" icon={<CalendarDays className="h-3.5 w-3.5" />} />
              <Row k="Cohort size" v="24 students" />
              <Row k="Learning track" v="Core Attention" />
            </PanelCard>

            <PanelCard title="Learner profile">
              <Row k="Learning style" v={learningStyle} />
              <div>
                <div className="premium-eyebrow mb-1.5"><span>Strengths</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((d) => (
                    <span
                      key={d.name}
                      className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/12 text-primary border border-primary/25"
                    >
                      {d.name} · {d.score}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="premium-eyebrow mb-1.5"><span>Growth areas</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {growthAreas.map((d) => (
                    <span
                      key={d.name}
                      className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-warning/20 text-warning-foreground dark:text-warning border border-warning/40"
                    >
                      {d.name} · {d.score}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="premium-eyebrow mb-1.5"><span>Interests</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span
                      key={i}
                      className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </PanelCard>

            <PanelCard title="Flags & history">
              {student.flags && student.flags.length > 0 ? (
                <ul className="space-y-1.5">
                  {student.flags.map((f: string) => (
                    <li key={f} className="text-[13px] flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">No active flags.</p>
              )}
              {tags.length > 0 && (
                <>
                  <div className="premium-eyebrow pt-2"><span>Intervention tags</span></div>
                  <ul className="space-y-1.5">
                    {tags.map((t) => (
                      <li key={t.label} className="text-[13px] flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-primary" />
                          {t.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.addedAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </PanelCard>

            <PanelCard
              title="Notes"
              headerRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 rounded-lg"
                  onClick={() => setNoteOpen(true)}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Add
                </Button>
              }
            >
              {notes.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl border border-border/70 bg-card/70 backdrop-blur p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                            {n.category}
                          </span>
                          {n.sharedWithParent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70">
                              Shared
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeNote(student.id, n.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete note"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[13px] mt-1.5 leading-relaxed">{n.body}</p>
                      <div className="text-[10.5px] text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard
              title="Contact log"
              headerRight={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 rounded-lg"
                  onClick={() => setContactOpen(true)}
                >
                  <Phone className="h-3.5 w-3.5" />
                  New
                </Button>
              }
            >
              {contacts.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No contact history yet.</p>
              ) : (
                <ul className="space-y-1.5 text-[13px]">
                  {contacts.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0"
                    >
                      <span className="capitalize font-medium flex items-center gap-1.5">
                        {c.channel === "call" ? (
                          <Phone className="h-3.5 w-3.5" />
                        ) : c.channel === "email" ? (
                          <Mail className="h-3.5 w-3.5" />
                        ) : (
                          <Tag className="h-3.5 w-3.5" />
                        )}
                        {c.channel}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <div className="md:col-span-2 premium-surface sheen-hover rounded-[18px] p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[hsl(260_55%_72%)] to-[hsl(200_60%_60%)] text-white flex items-center justify-center shadow-[0_8px_20px_-10px_hsl(260_50%_45%/0.55)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-[14.5px]">Neuroplay report</div>
                  <div className="text-[11.5px] text-muted-foreground">Latest assessment · 12 pages · PDF</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1.5 rounded-lg" onClick={() => toast.success("Shared with parent")}>
                  <Share2 className="h-4 w-4" /> Share with parent
                </Button>
                <Button variant="outline" className="rounded-lg">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ───── OVERVIEW ───── */}
        <TabsContent value="overview" className="grid md:grid-cols-3 gap-4">
          <PanelCard title="Attention sub-domains" subtitle="Student vs class average" className="md:col-span-2">
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke="hsl(240 15% 88%)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(230 15% 40%)" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(240 15% 80%)" />
                  <Radar dataKey="classAvg" stroke="hsl(260 50% 60%)" fill="hsl(260 50% 60%)" fillOpacity={0.15} />
                  <Radar dataKey="score" stroke="hsl(142 52% 48%)" fill="hsl(142 52% 48%)" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          <PanelCard
            title={
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Yellow Recommends
              </span>
            }
          >
            <p className="text-[13px] leading-relaxed">
              <span className="font-semibold">{weakest.name}</span> is{" "}
              <span
                className={cn(
                  "font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11.5px] align-baseline",
                  weakestDelta < 0
                    ? "bg-destructive/12 text-destructive border border-destructive/25"
                    : "bg-primary/12 text-primary border border-primary/25",
                )}
              >
                {weakestDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {weakestDelta >= 0 ? "+" : ""}
                {weakestDelta}
              </span>{" "}
              pts vs class avg. Try a focused intervention 3×/week.
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Focus Maze · Sustained Attention",
                "Memory Match · Working Memory",
                "Stop Signal · Inhibitory Control",
              ].map((g) => (
                <li
                  key={g}
                  className="rounded-xl border border-border/70 bg-card/70 backdrop-blur p-3 text-[13px] hover:border-primary/40 hover:bg-card transition-colors cursor-pointer"
                >
                  <div className="font-heading font-extrabold">{g.split(" · ")[0]}</div>
                  <div className="text-[11.5px] text-muted-foreground">{g.split(" · ")[1]}</div>
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard
            title="Monthly check-in trend"
            subtitle={
              bestMonth ? (
                <>
                  Best month:{" "}
                  <span className="font-semibold text-primary">{bestMonth.month}</span>{" "}
                  ({bestMonth.attention}% attention) ·{" "}
                  {submittedMonths.length}/{MONTH_LABELS.length} check-ins submitted
                </>
              ) : (
                <>No monthly check-ins submitted yet.</>
              )
            }
            className="md:col-span-2"
          >
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={monthlyAttention} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sd-monthly-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(260 55% 60%)" />
                      <stop offset="100%" stopColor="hsl(200 60% 55%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "hsl(260 55% 60%)", strokeOpacity: 0.3, strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Line
                    type="monotone"
                    dataKey="attention"
                    stroke="url(#sd-monthly-line)"
                    strokeWidth={2.6}
                    dot={{ r: 3, strokeWidth: 2, stroke: "white", fill: "hsl(230 55% 55%)" }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "white", fill: "hsl(230 55% 55%)" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>

          <PanelCard title="Recent sessions">
            <ul className="space-y-2">
              {student.sessions.slice(0, 3).map((s: any, i: number) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/70 bg-card/70 backdrop-blur p-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-heading font-extrabold text-[13px]">{s.title}</div>
                    <span className="text-[12px] font-extrabold">{s.score}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{s.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.duration}m
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard title="PFI growth · 4 weeks" className="md:col-span-3">
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={student.history} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sd-pfi-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(142 55% 45%)" />
                      <stop offset="100%" stopColor="hsl(200 60% 55%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                  <XAxis dataKey="week" stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="pfi"
                    stroke="url(#sd-pfi-line)"
                    strokeWidth={2.6}
                    dot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(142 55% 45%)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(260 55% 60%)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, stroke: "white", fill: "hsl(260 55% 60%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </TabsContent>

        {/* ───── JOURNEY ───── */}
        <TabsContent value="journey">
          <div className="premium-surface rounded-[18px] p-5 grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <Stat
              label="Total neuro time"
              value={`${student.sessions.reduce((a: number, s: any) => a + s.duration, 0)}m`}
            />
            <Stat
              label="Avg session"
              value={`${Math.round(
                student.sessions.reduce((a: number, s: any) => a + s.duration, 0) /
                  student.sessions.length,
              )}m`}
            />
            <Stat
              label="Completion"
              value={`${Math.round(
                student.sessions.reduce((a: number, s: any) => a + s.completion, 0) /
                  student.sessions.length,
              )}%`}
            />
            <Stat
              label="Avg score"
              value={Math.round(
                student.sessions.reduce((a: number, s: any) => a + s.score, 0) /
                  student.sessions.length,
              )}
            />
          </div>
          <Tabs defaultValue="all">
            <TabsList className="bg-muted/60 backdrop-blur rounded-full border border-border/70 p-1 h-auto">
              <StudentTab value="all">All</StudentTab>
              <StudentTab value="Neurogame">Neurogame</StudentTab>
              <StudentTab value="Sessions">Sessions</StudentTab>
              <StudentTab value="Project">Project</StudentTab>
            </TabsList>
            {["all", "Neurogame", "Sessions", "Project"].map((t) => (
              <TabsContent key={t} value={t} className="space-y-2 mt-3">
                {student.sessions
                  .filter((s: any) => t === "all" || s.type === t)
                  .map((s: any, i: number) => (
                    <div key={i} className="premium-surface rounded-[16px] p-4 flex items-center gap-4">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                          s.type === "Neurogame" && "bg-primary/15 text-primary",
                          s.type === "Sessions" && "bg-accent text-accent-foreground",
                          s.type === "Project" && "bg-warning/20 text-warning",
                        )}
                      >
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-heading font-extrabold text-[13.5px]">{s.title}</div>
                          <Badge variant="outline" className="text-[10px] rounded-full">
                            {s.type}
                          </Badge>
                        </div>
                        <div className="text-[11.5px] text-muted-foreground flex items-center gap-3 mt-0.5">
                          <span>{s.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {s.duration}m
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-extrabold text-[18px] leading-none tabular-nums">
                          {s.score}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.completion}% done</div>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* ───── REPORTS ───── */}
        <TabsContent value="reports">
          <Tabs defaultValue="subdomain">
            <TabsList className="bg-muted/60 backdrop-blur flex-wrap h-auto rounded-full border border-border/70 p-1">
              <StudentTab value="subdomain">Sub-Domain</StudentTab>
              <StudentTab value="skills">Skills</StudentTab>
              <StudentTab value="indicators">Indicators</StudentTab>
              <StudentTab value="subjects">Subjects</StudentTab>
              <StudentTab value="growth">Growth Timeline</StudentTab>
            </TabsList>

            <TabsContent value="subdomain" className="mt-3">
              <div className="grid md:grid-cols-2 gap-4">
                {student.subDomains.map((d: any, sIdx: number) => {
                  const dlt = d.score - d.classAvg;
                  const isWeak = dlt < -5;
                  // Per-card distinct trend shape — both series start from the same baseline at W1
                  // and diverge through W4. Tells the "started equal, pulled ahead/behind" story.
                  const wiggle = (k: number, salt: number) => {
                    const x = Math.sin((sIdx + 1) * salt + k * 11.7) * 10000;
                    return (x - Math.floor(x) - 0.5) * 6;
                  };
                  const clamp01 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
                  const chartData = ["W1", "W2", "W3", "W4"].map((week, i) => {
                    if (i === 0) {
                      return { week, student: d.classAvg, class: d.classAvg };
                    }
                    const t = i / 3;
                    return {
                      week,
                      student: clamp01(d.classAvg + (d.score - d.classAvg) * t + wiggle(i, 7.3)),
                      class: clamp01(d.classAvg + wiggle(i, 5.1) * 0.6),
                    };
                  });
                  const gradId = `sd-area-${sIdx}`;
                  return (
                    <div
                      key={d.name}
                      className="premium-surface rounded-[20px] p-5 transition-all duration-200 hover:shadow-[0_14px_36px_-20px_hsl(230_50%_18%/0.22)] hover:-translate-y-px"
                    >
                      {/* Header — name & description on the left, hero metric on the right */}
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-extrabold text-[14px] tracking-tight leading-tight">
                            {d.name}
                          </h4>
                          {d.description && (
                            <p className="text-[11.5px] leading-snug text-muted-foreground mt-1 line-clamp-2">
                              {d.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end shrink-0 leading-none">
                          <span className="font-heading font-extrabold text-[28px] tabular-nums">
                            {d.score}
                          </span>
                          <span
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold tabular-nums whitespace-nowrap",
                              dlt >= 0 ? "text-primary" : "text-destructive",
                            )}
                          >
                            {dlt >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {dlt >= 0 ? "+" : ""}{dlt}
                            <span className="text-muted-foreground font-normal">
                              vs class avg {d.classAvg}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Trend chart — both series begin at the class-avg baseline at W1 and diverge */}
                      <div className="h-[120px] mt-5 -mx-1">
                        <ResponsiveContainer>
                          <AreaChart
                            data={chartData}
                            margin={{ top: 14, right: 18, left: 8, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(142 55% 45%)" stopOpacity={0.4} />
                                <stop offset="55%" stopColor="hsl(142 55% 45%)" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="hsl(142 55% 45%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <YAxis domain={[0, 100]} hide />
                            <XAxis
                              dataKey="week"
                              fontSize={10}
                              stroke="hsl(230 15% 60%)"
                              tickLine={false}
                              axisLine={false}
                              dy={6}
                              padding={{ left: 8, right: 8 }}
                            />
                            <Tooltip
                              contentStyle={TOOLTIP_STYLE}
                              cursor={{ stroke: "hsl(142 52% 48%)", strokeOpacity: 0.3, strokeWidth: 1, strokeDasharray: "3 3" }}
                              labelStyle={{ fontSize: 11, fontWeight: 600 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="class"
                              name="Class avg"
                              stroke="hsl(230 12% 65%)"
                              strokeWidth={1.5}
                              strokeDasharray="4 3"
                              fill="none"
                              dot={false}
                              activeDot={false}
                              isAnimationActive={!reduce}
                            />
                            <Area
                              type="monotone"
                              dataKey="student"
                              name="This student"
                              stroke="hsl(142 55% 45%)"
                              strokeWidth={2.6}
                              fill={`url(#${gradId})`}
                              dot={false}
                              activeDot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(142 55% 45%)" }}
                              isAnimationActive={!reduce}
                            />
                            {/* W1 anchor — small dot where both series meet */}
                            <ReferenceDot
                              x="W1"
                              y={d.classAvg}
                              r={3}
                              fill="hsl(230 12% 65%)"
                              stroke="white"
                              strokeWidth={1.5}
                              ifOverflow="extendDomain"
                            />
                            {/* W4 student endpoint — halo + crisp dot */}
                            <ReferenceDot
                              x="W4"
                              y={d.score}
                              r={9}
                              fill="hsl(142 55% 45%)"
                              fillOpacity={0.15}
                              stroke="none"
                              ifOverflow="extendDomain"
                            />
                            <ReferenceDot
                              x="W4"
                              y={d.score}
                              r={4}
                              fill="hsl(142 55% 45%)"
                              stroke="white"
                              strokeWidth={2}
                              ifOverflow="extendDomain"
                            />
                            {/* W4 class endpoint */}
                            <ReferenceDot
                              x="W4"
                              y={d.classAvg}
                              r={3}
                              fill="hsl(230 12% 65%)"
                              stroke="white"
                              strokeWidth={1.5}
                              ifOverflow="extendDomain"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {isWeak && (
                        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-[11.5px]">
                          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Try:</span>{" "}
                            Focus Maze · Memory Match · Stop Signal
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-3">
              <div className="space-y-3">
                <PanelCard title="KSA Breakdown">
                  <div className="space-y-3.5">
                    {student.ksa.map((k: any) => (
                      <div key={k.name} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-extrabold text-[13px] leading-tight">{k.name}</div>
                            {k.description && (
                              <p className="text-[11px] leading-snug text-muted-foreground mt-0.5">
                                {k.description}
                              </p>
                            )}
                          </div>
                          <span className="font-heading font-extrabold tabular-nums text-[13px] shrink-0 mt-0.5">
                            {k.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[hsl(142_60%_50%)] to-[hsl(142_52%_40%)]"
                            initial={reduce ? undefined : { width: 0 }}
                            animate={{ width: `${k.score}%` }}
                            transition={{ duration: 0.9, ease: EASE }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelCard>
              </div>
            </TabsContent>

            <TabsContent value="indicators" className="mt-3">
              <PanelCard title="Behavioral indicators">
                <div className="-mt-1 mb-3 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[11.5px] text-muted-foreground">
                    Behaviours you can observe in class, with the cognitive skills behind each one.
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-card/70 text-[10.5px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                  >
                    Age group · {student.age}–{student.age + 1} years
                  </Badge>
                </div>
                <div className="space-y-3.5">
                  {student.indicators.map((ind: any) => (
                    <div key={ind.name} className="space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-heading font-extrabold text-[13px] leading-tight">{ind.name}</div>
                          <p className="text-[11px] leading-snug text-muted-foreground mt-0.5">
                            <span className="font-semibold text-foreground/70">Cognitive skills behind this:</span>{" "}
                            {ind.ksas.map((k: { name: string; weight: number }) => k.name).join(" · ")}
                          </p>
                        </div>
                        <span className="font-heading font-extrabold tabular-nums text-[13px] shrink-0 mt-0.5">
                          {ind.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(260_55%_65%)] via-[hsl(230_55%_60%)] to-[hsl(200_60%_55%)]"
                          initial={reduce ? undefined : { width: 0 }}
                          animate={{ width: `${ind.score}%` }}
                          transition={{ duration: 0.9, ease: EASE }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PanelCard>
            </TabsContent>

            <TabsContent value="subjects" className="mt-3">
              <p className="text-[12px] text-muted-foreground mb-3 px-1">
                How {student.name.split(" ")[0]}'s cognitive skills shape{" "}
                {student.grade.toLowerCase()} subjects — and which games will lift the
                skills behind each one.
              </p>
              <div className="space-y-3">
                {SUBJECT_DETAILS.map((sub, sIdx) => {
                  const subjectData = student.subjects[sIdx];
                  const SubjectIcon = SUBJECT_ICONS[sub.iconKey];
                  const accentSolid = `hsl(${sub.hue} 65% 48%)`;
                  const accentDeep = `hsl(${sub.hue} 60% 38%)`;
                  const accentSoft = `hsl(${sub.hue} 70% 95%)`;
                  const accentText = `hsl(${sub.hue} 55% 36%)`;
                  return (
                    <div
                      key={sub.name}
                      className="premium-surface rounded-[20px] p-5 transition-all duration-200 hover:shadow-[0_14px_36px_-20px_hsl(230_50%_18%/0.22)] hover:-translate-y-px relative overflow-hidden"
                    >
                      {/* Subtle accent rail on the left edge */}
                      <div
                        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                        style={{
                          background: `linear-gradient(180deg, ${accentSolid} 0%, ${accentDeep} 100%)`,
                        }}
                        aria-hidden
                      />

                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-[0_6px_16px_-8px_hsl(230_50%_18%/0.22)]"
                            style={{
                              background: `linear-gradient(135deg, ${accentSolid} 0%, ${accentDeep} 100%)`,
                            }}
                          >
                            <SubjectIcon className="h-5 w-5 text-white" strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-[10px] uppercase tracking-[0.2em] font-bold"
                              style={{ color: accentText }}
                            >
                              {sub.short}
                            </div>
                            <h3 className="font-heading font-extrabold text-[16px] mt-0.5 leading-tight tracking-tight">
                              {sub.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 leading-none">
                          <span className="font-heading font-extrabold text-[26px] tabular-nums">
                            {subjectData.score}
                            <span className="text-[12px] text-muted-foreground font-normal ml-0.5">
                              /100
                            </span>
                          </span>
                          <span
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold tabular-nums whitespace-nowrap",
                              subjectData.trend >= 0 ? "text-primary" : "text-destructive",
                            )}
                          >
                            {subjectData.trend >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {subjectData.trend >= 0 ? "+" : ""}
                            {subjectData.trend}
                            <span className="text-muted-foreground font-normal">this term</span>
                          </span>
                        </div>
                      </div>

                      {/* Two-column body */}
                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Skills */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-foreground/80">
                              Skills behind this subject
                            </h4>
                          </div>
                          <div className="space-y-2.5">
                            {sub.skills.map((skillName) => {
                              const ksaEntry = student.ksa.find(
                                (k: any) => k.name === skillName,
                              );
                              const score = ksaEntry?.score ?? 0;
                              const isStrong = score >= 75;
                              return (
                                <div key={skillName} className="space-y-1">
                                  <div className="flex items-center justify-between text-[12px]">
                                    <span className="font-semibold truncate">{skillName}</span>
                                    <span className="font-heading font-extrabold tabular-nums shrink-0 ml-2 text-[11.5px]">
                                      {score}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{
                                        background: isStrong
                                          ? `linear-gradient(90deg, ${accentSolid} 0%, ${accentDeep} 100%)`
                                          : `linear-gradient(90deg, ${accentSolid} 0%, ${accentSolid} 100%)`,
                                        opacity: isStrong ? 1 : 0.55,
                                      }}
                                      initial={reduce ? undefined : { width: 0 }}
                                      animate={{ width: `${score}%` }}
                                      transition={{ duration: 0.85, ease: EASE }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Games */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-foreground/80">
                              Games to boost these skills
                            </h4>
                          </div>
                          <div className="space-y-1.5">
                            {sub.games.map((game) => (
                              <button
                                key={game.title}
                                type="button"
                                className="group/game w-full text-left rounded-xl p-2.5 border border-border/60 transition-all hover:border-transparent hover:shadow-[0_8px_22px_-14px_hsl(230_50%_18%/0.22)]"
                                style={{
                                  // soft tinted hover background via inline custom prop
                                  // (Tailwind can't compose dynamic hex from sub.hue)
                                  ["--game-hover" as any]: accentSoft,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = accentSoft;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "";
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: accentSoft }}
                                  >
                                    <Gamepad2
                                      className="h-4 w-4"
                                      style={{ color: accentText }}
                                      strokeWidth={2.2}
                                    />
                                  </div>
                                  <div className="font-heading font-extrabold text-[12.5px] flex-1 min-w-0 truncate">
                                    {game.title}
                                  </div>
                                  <ArrowRight
                                    className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-hover/game:translate-x-0.5"
                                    style={{ color: accentText }}
                                  />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5 ml-[42px]">
                                  {game.targets.map((target) => (
                                    <span
                                      key={target}
                                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold"
                                    >
                                      {target}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="growth" className="mt-3">
              <PanelCard title="Growth Timeline">
                <ol className="relative border-l-2 border-primary/30 ml-3 space-y-4">
                  {student.history.map((h: any, i: number) => {
                    const isLatest = i === student.history.length - 1;
                    return (
                      <li key={i} className="ml-4">
                        <div className="absolute -left-2 h-4 w-4 rounded-full bg-primary border-2 border-card shadow-[0_0_0_3px_hsl(142_55%_45%/0.15)]" />
                        <div className="font-heading font-extrabold text-[13px]">
                          {h.week} · PFI {h.pfi}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground">
                          Engagement {h.engagement}% · Sessions {2 + i}
                        </div>
                        {isLatest && tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {tags.map((t) => (
                              <span
                                key={t.label}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70"
                              >
                                ★ {t.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </PanelCard>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <NoteDialog student={student} open={noteOpen} onOpenChange={setNoteOpen} />
      <ContactParentDialog student={student} open={contactOpen} onOpenChange={setContactOpen} />
    </motion.div>
  );
}

/* ──────────────── Local UI helpers ──────────────── */

function StudentTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "rounded-full px-4 text-[12.5px] font-bold",
        "data-[state=active]:bg-card data-[state=active]:shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)]",
        "data-[state=active]:text-foreground",
        "data-[state=inactive]:text-muted-foreground",
      )}
    >
      {children}
    </TabsTrigger>
  );
}

function PanelCard({
  title,
  subtitle,
  headerRight,
  children,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("premium-surface rounded-[18px] p-5", className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-heading font-extrabold text-[14px] leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerRight}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta?: number;
}) {
  return (
    <div className="bg-card/80 backdrop-blur rounded-xl p-3 border border-border/60">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="font-heading font-extrabold text-[22px] mt-0.5 tabular-nums leading-none">
        {value}
        {delta !== undefined && (
          <span
            className={cn(
              "ml-1.5 text-[11.5px] font-bold inline-flex items-center gap-0.5 align-middle",
              delta >= 0 ? "text-primary" : "text-destructive",
            )}
          >
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}
          </span>
        )}
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  icon,
}: {
  k: string;
  v: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-[13px] border-b border-border/50 pb-2 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium flex items-center gap-1.5">
        {icon}
        {v}
      </span>
    </div>
  );
}
