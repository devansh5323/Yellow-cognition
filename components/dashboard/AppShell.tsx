"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  School,
  FileBarChart,
  Settings,
  Search,
  Bell,
  LogOut,
  ClipboardCheck,
  Timer,
  AlertTriangle,
  MessageCircle,
  CalendarX,
  Activity as ActivityIcon,
  PartyPopper,
  CheckCircle2,
  BellOff,
  Check,
  Filter,
  Plus,
} from "lucide-react";
import { getTheme, applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSession, signOut, type TeacherSession } from "@/lib/auth";
import { getOnboarding, type OnboardingClassroom } from "@/lib/onboarding";
import { BrandLogo } from "@/components/dashboard/BrandLogo";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { YellowAIWidget } from "@/components/dashboard/YellowAIWidget";
import { QuickBehaviourNote } from "@/components/dashboard/QuickBehaviourNote";
import { RecordBehaviorForm } from "@/components/dashboard/RecordBehaviorForm";
import { LogPositiveBehaviorForm } from "@/components/dashboard/LogPositiveBehaviorForm";
import { InterventionFollowUpForm } from "@/components/dashboard/InterventionFollowUpForm";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { INBOX_ITEMS } from "@/data/mockData";

type NotificationKind =
  | "at-risk"
  | "parent-reply"
  | "missed-session"
  | "anomaly"
  | "celebration"
  | "report"
  | "system";

type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  priority: "high" | "medium" | "low";
  studentId?: string;
};

const KIND_META: Record<
  NotificationKind,
  { Icon: typeof AlertTriangle; tone: "alert" | "info" | "success"; label: string }
> = {
  "at-risk": { Icon: AlertTriangle, tone: "alert", label: "At-risk" },
  "parent-reply": { Icon: MessageCircle, tone: "info", label: "Parent reply" },
  "missed-session": { Icon: CalendarX, tone: "alert", label: "Missed session" },
  anomaly: { Icon: ActivityIcon, tone: "info", label: "Anomaly" },
  celebration: { Icon: PartyPopper, tone: "success", label: "Celebration" },
  report: { Icon: CheckCircle2, tone: "success", label: "Report" },
  system: { Icon: Bell, tone: "info", label: "System" },
};

const SYSTEM_NOTIFICATIONS: Notification[] = [
  {
    id: "n-report-1",
    kind: "report",
    title: "Monthly class report ready",
    body: "Grade 3 — Section A summary is available.",
    time: "2h ago",
    unread: true,
    priority: "low",
  },
  {
    id: "n-system-1",
    kind: "system",
    title: "Monthly summary emailed",
    body: "Sent to maya.khan@school.edu after this month's check-in.",
    time: "Yesterday",
    unread: false,
    priority: "low",
  },
];

function buildNotifications(): Notification[] {
  const fromInbox: Notification[] = INBOX_ITEMS.map((it) => ({
    id: it.id,
    kind: it.kind,
    title: it.title,
    body: it.body,
    time: it.time,
    unread: true,
    priority: it.priority,
    studentId: it.studentId,
  }));
  return [...fromInbox, ...SYSTEM_NOTIFICATIONS];
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/classroom", label: "Classroom", icon: School },
  { to: "/check-in", label: "Check-in", icon: ClipboardCheck },
  { to: "/friction", label: "Friction", icon: Timer },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function AppShell({
  children,
  topbarFilters,
}: {
  children: React.ReactNode;
  /**
   * When provided, replaces the default Class selector + global search
   * in the topbar. Use for page-specific filter contexts (e.g. Learning
   * outcome filters: Class · Subject · Period).
   */
  topbarFilters?: React.ReactNode;
}) {
  const [session, setSession] = useState<TeacherSession | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(() => buildNotifications());
  const [allOpen, setAllOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<OnboardingClassroom[]>([]);
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/");
      return;
    }
    setSession(s);
  }, [router]);

  useEffect(() => {
    applyTheme(getTheme());
    const onChange = () => applyTheme(getTheme());
    window.addEventListener("ah-theme-change", onChange);
    return () => window.removeEventListener("ah-theme-change", onChange);
  }, []);

  // Real classrooms the teacher created during onboarding (or later) —
  // replaces the old hardcoded 4-option dropdown.
  useEffect(() => {
    const refresh = () => {
      const list = getOnboarding().classrooms;
      setClassrooms(list);
      setActiveClassroomId((prev) => (prev && list.some((c) => c.id === prev) ? prev : (list[0]?.id ?? null)));
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  // Keyboard shortcuts: "/" to focus search, "g d" to go to dashboard
  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      if (e.key === "g") lastG = Date.now();
      else if (Date.now() - lastG < 600) {
        if (e.key === "d") router.push("/dashboard");
        if (e.key === "s") router.push("/students");
        if (e.key === "c") router.push("/classroom");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const isActive = (to: string) =>
    pathname === to || (to !== "/dashboard" && pathname.startsWith(to));

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      {/* Ambient atmosphere — calmer than the login page */}
      <div className="premium-ambient" aria-hidden />

      {/* ───────────── Sidebar ───────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 -translate-x-full md:translate-x-0"
        aria-label="Primary navigation"
      >
        <div className="relative flex-1 border-r border-sidebar-border premium-glass flex flex-col overflow-hidden">
          {/* Top accent strip */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10"
            aria-hidden
          />

          {/* Brand */}
          <div className="flex h-[68px] items-center gap-2.5 px-4 border-b border-sidebar-border/70">
            <img
              src="/logo.png"
              alt="Yellow Cognition"
              className="h-7 w-7 shrink-0 select-none"
              draggable={false}
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-heading font-extrabold text-[15px] truncate">Yellow</span>
              <span className="font-heading font-extrabold text-[13px] text-muted-foreground truncate">
                Cognition
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-4 space-y-0.5">
            <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-muted-foreground/80 uppercase">
              Workspace
            </div>
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "text-primary" : "text-sidebar-foreground/90 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-rail"}
                      className="nav-rail-active"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Icon className="h-[16px] w-[16px]" />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-dot"}
                      className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer: unified profile + sign-out button */}
          <div className="p-2.5 border-t border-sidebar-border/70">
            <button
              onClick={handleSignOut}
              aria-label={session ? `Sign out of ${session.name}` : "Sign out"}
              className="group w-full flex items-center gap-2.5 rounded-xl px-2 py-2 bg-card/40 hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(260_55%_72%)] to-[hsl(200_60%_60%)] text-white text-[11px] font-heading font-extrabold">
                    {session?.initials ?? "T"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card group-hover:hidden"
                  aria-hidden
                />
              </div>
              <div className="flex flex-col min-w-0 leading-tight flex-1">
                <span className="text-[13px] font-semibold truncate group-hover:text-destructive transition-colors">
                  {session?.name ?? "Teacher"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate group-hover:text-destructive/80 transition-colors">
                  <span className="group-hover:hidden">{session?.email ?? ""}</span>
                  <span className="hidden group-hover:inline">Click to sign out</span>
                </span>
              </div>
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground group-hover:bg-destructive/15 group-hover:text-destructive transition-colors shrink-0"
                aria-hidden
              >
                <LogOut className="h-[16px] w-[16px]" />
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ───────────── Main column ───────────── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[68px] premium-glass border-b border-border/70 flex items-center gap-3 px-4 md:px-6">

          {topbarFilters ? (
            <div className="hidden sm:flex items-center gap-2 flex-nowrap min-w-0">
              {topbarFilters}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 flex-nowrap flex-1 overflow-x-auto">
              {classrooms.map((c) => {
                const active = c.id === activeClassroomId;
                const label = c.section ? `Grade ${c.grade} — Section ${c.section}` : `Grade ${c.grade}`;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveClassroomId(c.id)}
                    data-active={active}
                    className="premium-pill !h-10 !px-3.5 !text-[13px] shrink-0"
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
              {/* Always present, even once classrooms exist — a teacher can
                  teach more than one, so this shouldn't disappear after
                  the first is added. */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("ah-open-classroom-setup"))}
                  aria-label="Add classroom"
                  className={cn(
                    "premium-pill !h-10 !px-3.5 !text-[13px] border-dashed",
                    classrooms.length === 0 && "border-flicker",
                  )}
                  style={classrooms.length === 0 ? ({ "--attn": "hsl(142 55% 45%)" } as React.CSSProperties) : undefined}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {classrooms.length === 0 && "Add classroom"}
                </button>
                {classrooms.length === 0 && (
                  <div
                    className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2 z-10 w-max max-w-[220px] rounded-xl bg-foreground text-background px-3 py-2 text-[11.5px] font-bold leading-snug shadow-lg pointer-events-none"
                    role="status"
                  >
                    <span
                      className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-foreground"
                      aria-hidden
                    />
                    Add your first classroom
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="premium-icon-btn relative"
                  aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                >
                  <Bell className="h-[17px] w-[17px]" />
                  {unreadCount > 0 && (
                    <>
                      <span
                        className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-[17px] text-center ring-2 ring-background"
                        aria-hidden
                      >
                        {unreadCount}
                      </span>
                      {!reduce && (
                        <motion.span
                          aria-hidden
                          className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-destructive/50"
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: 0, scale: 2 }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[360px] p-0 rounded-2xl premium-glass border-border/80 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-[14px]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ScrollArea className="max-h-80">
                  <ul className="divide-y divide-border/60">
                    {notifications.slice(0, 5).map((n) => {
                      const meta = KIND_META[n.kind];
                      return (
                        <li key={n.id}>
                          <button
                            onClick={() => markRead(n.id)}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex gap-3",
                              n.unread && "bg-primary/[0.04]",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1.5 h-2 w-2 rounded-full shrink-0",
                                meta.tone === "alert" && "bg-destructive",
                                meta.tone === "info" && "bg-primary",
                                meta.tone === "success" && "bg-[hsl(142_55%_50%)]",
                                !n.unread && "opacity-30",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[13px] font-semibold truncate">
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {n.time}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">
                                {n.body}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                    {notifications.length === 0 && (
                      <li className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
                        All caught up.
                      </li>
                    )}
                  </ul>
                </ScrollArea>
                <div className="px-4 py-2.5 border-t border-border/70 flex items-center justify-between gap-2 bg-muted/20">
                  <button
                    onClick={() => setAllOpen(true)}
                    className="text-[11.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    See all notifications
                    {notifications.length > 5 ? ` (${notifications.length})` : ""}
                  </button>
                  <button
                    onClick={() => router.push("/settings")}
                    className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Settings
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <AllNotificationsDialog
              open={allOpen}
              onOpenChange={setAllOpen}
              notifications={notifications}
              onMarkRead={markRead}
              onDismiss={dismiss}
              onMarkAllRead={markAllRead}
            />
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <CommandPalette />
      <YellowAIWidget />
      <QuickBehaviourNote />
      <RecordBehaviorForm />
      <LogPositiveBehaviorForm />
      <InterventionFollowUpForm />
      <Toaster />
    </div>
  );
}

/* ─────────── All notifications dialog (filterable) ─────────── */

type KindFilter = "all" | NotificationKind;
type ReadFilter = "all" | "unread";
type PriorityFilter = "all" | "high" | "medium" | "low";

function AllNotificationsDialog({
  open,
  onOpenChange,
  notifications,
  onMarkRead,
  onDismiss,
  onMarkAllRead,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [read, setRead] = useState<ReadFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = notifications.filter((n) => {
    if (kind !== "all" && n.kind !== kind) return false;
    if (read === "unread" && !n.unread) return false;
    if (priority !== "all" && n.priority !== priority) return false;
    if (q && !(n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;
  const kindOptions: { value: KindFilter; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "at-risk", label: "At-risk" },
    { value: "parent-reply", label: "Parent replies" },
    { value: "missed-session", label: "Missed sessions" },
    { value: "anomaly", label: "Anomalies" },
    { value: "celebration", label: "Celebrations" },
    { value: "report", label: "Reports" },
    { value: "system", label: "System" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="font-heading">Notifications</DialogTitle>
              <DialogDescription>
                {notifications.length} total · {unreadCount} unread
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[12px] font-semibold text-primary hover:text-primary/80"
              >
                Mark all read
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="px-5 py-3 border-b border-border/70 space-y-2.5 bg-muted/20">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
              {(["all", "unread"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRead(r)}
                  className={cn(
                    "px-3 h-7 rounded-full text-[11.5px] font-bold capitalize transition-colors",
                    read === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                  {r === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-3 h-7 rounded-full text-[11.5px] font-bold capitalize transition-colors",
                    priority === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === "all" ? "all priorities" : p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as KindFilter)}
              className="h-8 rounded-full border border-border/60 bg-card/80 px-3 text-[12px] font-semibold outline-none focus:ring-2 focus:ring-primary/40"
            >
              {kindOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 pl-8 pr-3 text-[12px] rounded-full bg-card/80"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <ul className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <li className="px-5 py-12 text-center text-[13px] text-muted-foreground">
                No notifications match these filters.
              </li>
            ) : (
              filtered.map((n) => {
                const meta = KIND_META[n.kind];
                const Icon = meta.Icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "px-5 py-3 flex gap-3 transition-colors",
                      n.unread ? "bg-primary/[0.04]" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                        meta.tone === "alert" && "bg-destructive/15 text-destructive",
                        meta.tone === "info" && "bg-primary/15 text-primary",
                        meta.tone === "success" &&
                          "bg-[hsl(142_55%_50%)]/15 text-[hsl(142_55%_35%)] dark:text-[hsl(142_55%_65%)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold truncate">{n.title}</span>
                        {n.priority === "high" && (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/30 text-[9.5px] px-1.5 py-0 font-semibold"
                          >
                            high
                          </Badge>
                        )}
                        <span className="text-[10.5px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground font-semibold">
                          {meta.label}
                        </span>
                        <span className="ml-auto text-[10.5px] text-muted-foreground shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {n.unread && (
                          <button
                            onClick={() => onMarkRead(n.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 px-2 py-0.5 rounded-md hover:bg-primary/10"
                          >
                            <Check className="h-3 w-3" /> Mark read
                          </button>
                        )}
                        <button
                          onClick={() => onDismiss(n.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md hover:bg-muted"
                        >
                          <BellOff className="h-3 w-3" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
