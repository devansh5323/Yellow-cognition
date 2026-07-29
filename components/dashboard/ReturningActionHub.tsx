"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Eye,
  Heart,
  Info,
  Lightbulb,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { studentComposites } from "@/lib/classHealth";
import { classRiskRadar, type Student } from "@/data/mockData";
import { listCheckInsForTeacher } from "@/lib/checkIn";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";
import { getPendingFollowUps, getPendingFollowUpCount } from "@/lib/interventionFollowUps";
import { type InviteStats } from "@/lib/roster";
import { cn } from "@/lib/utils";

type ActionPriority = "high" | "medium" | "low";

type PriorityAction = {
  id: string;
  priority: ActionPriority;
  Icon: typeof Send;
  title: string;
  description: string;
  meta: ReactNode;
  cta: string;
  href?: string;
  onOpenTool?: () => void;
};

const PRIORITY_LABEL: Record<ActionPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_TONE: Record<ActionPriority, string> = {
  high: "hsl(0 78% 58%)",
  medium: "hsl(212 90% 58%)",
  low: "hsl(142 55% 45%)",
};

const PRIORITY_RANK: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function checkedInThisWeek(): boolean {
  const list = listCheckInsForTeacher(TEACHER_NAME);
  if (list.length === 0) return false;
  return Date.now() - +new Date(list[0].createdAt) <= WEEK_MS;
}

/** Tiers are derived from the existing StudentStatus classification — there's
 * no dedicated Tier system in the data model, so Watch -> Tier 2 and
 * Needs-support -> Tier 3 is the closest real mapping available. */
function getTierGroups() {
  const composites = studentComposites();
  return {
    tier2: composites.filter((c) => c.status === "watch").map((c) => c.student),
    tier3: composites.filter((c) => c.status === "needs-support").map((c) => c.student),
  };
}

function buildPriorityActions(stats: InviteStats): PriorityAction[] {
  const { tier2, tier3 } = getTierGroups();

  const total = Math.max(0, stats.total);
  const notYetActive = Math.max(0, total - stats.active);

  const flagged = classRiskRadar().flatMap((group) =>
    group.students.map((student) => ({ student, reason: group.reason })),
  );
  const pendingFollowUps = getPendingFollowUps();
  const followUp = pendingFollowUps[0];
  const interventionFollowUp = pendingFollowUps[1] ?? pendingFollowUps[0];
  const conferenceTarget = tier3[0];

  const actions: PriorityAction[] = [];

  if (!checkedInThisWeek()) {
    actions.push({
      id: "checkin",
      priority: "high",
      Icon: ClipboardCheck,
      title: "Run this week's class check-in",
      description: "Capture focus, behaviour and friction signals.",
      meta: "Due today",
      cta: "Start check-in",
      href: "/check-in",
    });
  }

  if (tier2.length > 0) {
    actions.push({
      id: "tier2",
      priority: "high",
      Icon: Eye,
      title: `Review ${tier2.length} Tier 2 student${tier2.length === 1 ? "" : "s"}`,
      description: "These students show repeated patterns this week.",
      meta: <AvatarStack students={tier2} />,
      cta: "View students",
      href: "/students",
    });
  }

  if (tier3.length > 0) {
    actions.push({
      id: "tier3",
      priority: "high",
      Icon: Eye,
      title: `Review ${tier3.length} Tier 3 student${tier3.length === 1 ? "" : "s"}`,
      description: "These students need focused, individualised support.",
      meta: <AvatarStack students={tier3} />,
      cta: "View students",
      href: "/students",
    });
  }

  if (notYetActive > 0) {
    actions.push({
      id: "nudge",
      priority: "medium",
      Icon: Send,
      title: `Send ${notYetActive} parent nudge${notYetActive === 1 ? "" : "s"}`,
      description: "Send a friendly nudge to get their weekly input.",
      meta: `${notYetActive} pending`,
      cta: "Send nudges",
      href: "/settings?tab=roster",
    });
  }

  if (followUp) {
    actions.push({
      id: "followup",
      priority: "medium",
      Icon: ClipboardCheck,
      title: `Log follow-up for ${followUp.student.name.split(" ")[0]}`,
      description: `Flagged for ${followUp.reason} — action note pending.`,
      meta: "1 pending",
      cta: "Log follow-up",
      onOpenTool: () =>
        window.dispatchEvent(
          new CustomEvent("ah-open-followup-form", {
            detail: { studentId: followUp.student.id, reason: followUp.reason },
          }),
        ),
    });
  }

  if (conferenceTarget) {
    actions.push({
      id: "conference",
      priority: "medium",
      Icon: CalendarClock,
      title: `Schedule 1:1 Tier 3 conference — ${conferenceTarget.name.split(" ")[0]}`,
      description: "Transition and support challenges continue.",
      meta: "Suggested",
      cta: "Schedule now",
      href: `/students/${conferenceTarget.id}`,
    });
  }

  if (interventionFollowUp) {
    actions.push({
      id: "intervention",
      priority: "low",
      Icon: CheckCircle2,
      title: `Complete intervention follow-up — ${interventionFollowUp.student.name.split(" ")[0]}`,
      description: `Wrap up the suggested plan for ${interventionFollowUp.reason.toLowerCase()}.`,
      meta: "1 pending",
      cta: "Log follow-up",
      onOpenTool: () =>
        window.dispatchEvent(
          new CustomEvent("ah-open-followup-form", {
            detail: { studentId: interventionFollowUp.student.id, reason: interventionFollowUp.reason },
          }),
        ),
    });
  }

  if (flagged.length > 0) {
    const target = flagged[0].student;
    actions.push({
      id: "share-summary",
      priority: "low",
      Icon: Share2,
      title: `Share ${target.name.split(" ")[0]}'s summary with the special educator`,
      description: "Keep the support team aligned on this student's progress.",
      meta: "Suggested",
      cta: "Open profile",
      href: `/students/${target.id}`,
    });
  }

  return actions;
}

function buildQuickActions(
  followUp: { student: Student; reason: string } | null,
  conferenceTarget: Student | undefined,
) {
  return [
    {
      key: "record-behavior",
      label: "Record behavior",
      Icon: MessageCircle,
      tone: "hsl(212 90% 58%)",
      href: "/behavior",
    },
    {
      key: "log-positive",
      label: "Log positive behavior",
      Icon: Heart,
      tone: "hsl(0 78% 58%)",
      href: "/behavior",
    },
    {
      key: "start-checkin",
      label: "Start class check-in",
      Icon: ClipboardCheck,
      tone: "hsl(38 92% 50%)",
      href: "/check-in",
    },
    {
      key: "view-profiles",
      label: "View cognitive and behavioral profiles",
      Icon: Users,
      tone: "hsl(142 55% 45%)",
      href: "/students",
    },
    {
      key: "parent-letter",
      label: "Generate parent nudge letters",
      Icon: Mail,
      tone: "hsl(142 55% 45%)",
    },
    {
      key: "task-ideas",
      label: "Generate task ideas",
      Icon: Lightbulb,
      tone: "hsl(260 55% 60%)",
    },
    {
      key: "workouts",
      label: "Generate Yellow/Fumi workouts",
      Icon: Dumbbell,
      tone: "hsl(38 92% 50%)",
    },
    {
      key: "log-followup",
      label: "Log follow-up",
      Icon: ClipboardCheck,
      tone: "hsl(212 90% 58%)",
      onOpenTool: () =>
        window.dispatchEvent(
          new CustomEvent("ah-open-followup-form", {
            detail: followUp ? { studentId: followUp.student.id, reason: followUp.reason } : {},
          }),
        ),
    },
    {
      key: "schedule-conference",
      label: "Schedule Tier 3 conference",
      Icon: CalendarClock,
      tone: "hsl(142 55% 45%)",
      href: conferenceTarget ? `/students/${conferenceTarget.id}` : undefined,
    },
  ] as const;
}

export function ReturningActionHub({ stats }: { stats: InviteStats }) {
  const [sortBy, setSortBy] = useState<"priority" | "az">("priority");
  const [refreshKey, setRefreshKey] = useState(0);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  // Captured once at mount via the lazy initializer — the sanctioned way to
  // read an impure value (Date.now()) without re-reading it on every render.
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, []);

  // refreshKey isn't read inside these — it exists purely to force a
  // recompute when a follow-up is logged elsewhere (e.g. via the dialog).
  /* eslint-disable react-hooks/exhaustive-deps */
  const actions = useMemo(() => buildPriorityActions(stats), [stats, refreshKey]);
  const pendingFollowUps = useMemo(() => getPendingFollowUps(), [refreshKey]);
  const followUpsPending = useMemo(() => getPendingFollowUpCount(), [refreshKey]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const followUp = pendingFollowUps[0] ?? null;
  const conferenceTarget = useMemo(() => getTierGroups().tier3[0], []);
  const quickActions = useMemo(
    () => buildQuickActions(followUp, conferenceTarget),
    [followUp, conferenceTarget],
  );

  const watchlist = useMemo(() => {
    const { tier2, tier3 } = getTierGroups();
    return [
      ...tier3.map((student) => ({ student, tier: "Tier 3" as const })),
      ...tier2.map((student) => ({ student, tier: "Tier 2" as const })),
    ].slice(0, 4);
  }, []);

  const upcoming = useMemo(() => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const items: { title: string; date: Date; href: string }[] = [];
    pendingFollowUps.slice(0, 2).forEach((p, i) => {
      items.push({
        title: `Intervention review: ${p.student.name}`,
        date: new Date(nowMs + (i + 1) * 3 * DAY_MS),
        href: `/students/${p.student.id}`,
      });
    });
    if (conferenceTarget) {
      items.push({
        title: `Tier 3 conference: ${conferenceTarget.name}`,
        date: new Date(nowMs + 5 * DAY_MS),
        href: `/students/${conferenceTarget.id}`,
      });
    }
    return items.slice(0, 3);
  }, [pendingFollowUps, conferenceTarget, nowMs]);

  const sortedActions = useMemo(() => {
    const arr = [...actions];
    if (sortBy === "priority") {
      arr.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    } else {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [actions, sortBy]);

  const total = Math.max(0, stats.total);
  const notConnected = stats.pending;
  const inviteSent = Math.max(0, stats.invited - stats.active);
  const checkedIn = checkedInThisWeek();
  const upToDate = checkedIn && notConnected === 0 && inviteSent === 0 && total > 0;

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Priority actions */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-[14.5px]">Today&apos;s priority actions</h3>
            {sortedActions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground rounded-full border border-border px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                {sortedActions.length} item{sortedActions.length === 1 ? "" : "s"} need your attention
              </span>
            )}
          </div>

          {sortedActions.length > 1 && (
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "priority" | "az")}>
              <SelectTrigger className="h-8 w-[130px] text-[11.5px] font-semibold" aria-label="Sort actions">
                <span className="text-muted-foreground mr-1">Sort:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="az">A–Z</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {sortedActions.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] px-4 py-6 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-[12.5px] font-semibold mt-2">You&apos;re all caught up for today.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedActions.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setWatchlistOpen((v) => !v)}
          aria-expanded={watchlistOpen}
          className="mt-6 w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2 min-w-0">
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                watchlistOpen && "rotate-90",
              )}
            />
            <span className="text-[12.5px] font-bold">Watchlist &amp; upcoming</span>
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {watchlist.length} student{watchlist.length === 1 ? "" : "s"} · {upcoming.length} event
            {upcoming.length === 1 ? "" : "s"}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {watchlistOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="font-heading font-bold text-[13.5px] flex items-center gap-1.5">
                      Student watchlist
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </h3>
                    {watchlist.length > 0 && (
                      <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold shrink-0">
                        {watchlist.length}
                      </span>
                    )}
                  </div>

                  {watchlist.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">
                      No students on the watchlist right now.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {watchlist.map(({ student, tier }) => {
                        const tierTone = tier === "Tier 3" ? "hsl(0 78% 58%)" : "hsl(38 92% 50%)";
                        return (
                          <li key={student.id}>
                            <Link
                              href={`/students/${student.id}`}
                              className="flex items-center gap-3 -mx-1 px-1 py-0.5 rounded-lg transition-colors hover:bg-muted/40"
                            >
                              <StudentAvatar student={student} size="sm" />
                              <span className="flex-1 min-w-0 text-[12.5px] font-semibold truncate">
                                {student.name}
                              </span>
                              <span
                                className="text-[10.5px] font-bold px-2 py-1 rounded-full shrink-0"
                                style={{
                                  background: `color-mix(in srgb, ${tierTone} 14%, transparent)`,
                                  color: tierTone,
                                }}
                              >
                                {tier}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-border text-center">
                    <Link
                      href="/students"
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                    >
                      View all students
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-5">
                  <h3 className="font-heading font-bold text-[13.5px] flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Upcoming
                  </h3>

                  {upcoming.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">Nothing scheduled right now.</p>
                  ) : (
                    <ul className="space-y-3.5">
                      {upcoming.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="flex items-start gap-3 -mx-1 px-1 py-0.5 rounded-lg transition-colors hover:bg-muted/40"
                          >
                            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0 mt-0.5">
                              <CalendarCheck className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[12.5px] font-semibold leading-snug">{item.title}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {item.date.toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-border text-center">
                    <button
                      type="button"
                      onClick={() =>
                        toast("Coming soon", { description: "A dedicated calendar view isn't available yet." })
                      }
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                    >
                      View calendar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-background p-5">
          <h3 className="font-heading font-bold text-[13.5px] mb-4">Data health at a glance</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span
                className={cn(
                  "h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0",
                  upToDate
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                )}
              >
                {upToDate ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                )}
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-bold leading-snug">
                  {upToDate
                    ? "Great! You're up to date."
                    : `${sortedActions.length} item${sortedActions.length === 1 ? "" : "s"} need attention.`}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Keep capturing data to maintain accurate insights.
                </div>
              </div>
            </li>

            <HealthLine
              Icon={ClipboardCheck}
              tone={checkedIn ? "hsl(142 55% 46%)" : "hsl(38 92% 50%)"}
              title={checkedIn ? "Checked in this week" : "Check-in due this week"}
              detail={checkedIn ? "You're on top of this week's pulse." : "Capture how the class is doing."}
              href="/check-in"
            />

            {followUpsPending > 0 && (
              <HealthLine
                Icon={ClipboardCheck}
                tone="hsl(0 78% 58%)"
                title={`${followUpsPending} follow-up${followUpsPending === 1 ? "" : "s"} pending`}
                detail="Flagged students awaiting an action note."
                href="/students"
              />
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <h3 className="font-heading font-bold text-[13.5px] mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <ul className="space-y-0.5">
              {quickActions.slice(0, Math.ceil(quickActions.length / 2)).map((qa) => (
                <QuickActionRow key={qa.key} action={qa} />
              ))}
            </ul>
            <ul className="space-y-0.5">
              {quickActions.slice(Math.ceil(quickActions.length / 2)).map((qa) => (
                <QuickActionRow key={qa.key} action={qa} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: PriorityAction }) {
  const Icon = action.Icon;
  const tone = PRIORITY_TONE[action.priority];
  return (
    <li className="flex items-stretch gap-0 rounded-2xl border border-border bg-background overflow-hidden">
      <span className="w-1 shrink-0" style={{ background: tone }} aria-hidden />
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-4 px-5 py-4">
        <span
          className="h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </span>

        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tone} 12%, transparent)`,
                color: tone,
              }}
            >
              {PRIORITY_LABEL[action.priority]}
            </span>
            <span className="font-heading font-bold text-[13.5px] leading-tight">{action.title}</span>
          </div>
          <div className="text-[11.5px] text-muted-foreground leading-snug mt-1">
            {action.description}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="text-[11.5px] font-semibold text-muted-foreground">{action.meta}</div>
          {action.onOpenTool ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={action.onOpenTool}
              className="h-9 rounded-lg px-4 text-[12px] font-bold gap-1 shrink-0"
              style={{ borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`, color: tone }}
            >
              {action.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 rounded-lg px-4 text-[12px] font-bold gap-1 shrink-0"
              style={{ borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`, color: tone }}
            >
              <Link href={action.href ?? "#"}>
                {action.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function AvatarStack({ students }: { students: Student[] }) {
  const shown = students.slice(0, 3);
  const overflow = students.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((s) => (
        <StudentAvatar key={s.id} student={s} size="sm" className="ring-2 ring-background" />
      ))}
      {overflow > 0 && (
        <span className="h-8 w-8 rounded-full ring-2 ring-background bg-muted text-[10.5px] font-bold text-muted-foreground flex items-center justify-center">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function HealthLine({
  Icon,
  tone,
  title,
  detail,
  href,
}: {
  Icon: typeof Send;
  tone: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group -m-1.5 flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted/40"
      >
        <span
          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-bold leading-snug">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{detail}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </li>
  );
}

function QuickActionRow({
  action,
}: {
  action: {
    key: string;
    label: string;
    Icon: typeof Send;
    tone: string;
    href?: string;
    onOpenTool?: () => void;
  };
}) {
  const Icon = action.Icon;
  const row = (
    <span className="group -mx-1.5 flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted/40">
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in srgb, ${action.tone} 12%, transparent)`,
          color: action.tone,
        }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <span className="text-[11.5px] font-semibold leading-snug text-foreground/80">
        {action.label}
      </span>
    </span>
  );

  if (action.onOpenTool) {
    return (
      <li>
        <button
          type="button"
          onClick={action.onOpenTool}
          className="w-full text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {row}
        </button>
      </li>
    );
  }

  if (action.href) {
    return (
      <li>
        <Link
          href={action.href}
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {row}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => toast("Coming soon", { description: `${action.label} isn't available yet.` })}
        className="w-full text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {row}
      </button>
    </li>
  );
}
