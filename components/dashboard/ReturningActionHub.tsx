"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  Send,
  Share2,
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
import { getPendingFollowUps } from "@/lib/interventionFollowUps";
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

// Only the top 3 show by default — everything past that lives behind the
// "Show more" toggle, keeping this section a compact priority list rather
// than a long scroll of every possible action.
const VISIBLE_COUNT = 3;

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

/** A compact "Today's Priority Actions" list — the top 3 by default, the
 * rest tucked behind a "Show more" toggle instead of the long scroll (and
 * the separate quick-actions/watchlist sidebar) this used to render. Those
 * now live in their own dedicated dashboard segments (Teacher Check-In
 * Tools, Student Drilldown) further down the page, so keeping a second copy
 * here was redundant, not extra coverage. */
export function ReturningActionHub({ stats }: { stats: InviteStats }) {
  const [sortBy, setSortBy] = useState<"priority" | "az">("priority");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, []);

  // refreshKey isn't read inside — it exists purely to force a recompute
  // when a follow-up is logged elsewhere (e.g. via the dialog).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actions = useMemo(() => buildPriorityActions(stats), [stats, refreshKey]);

  const sortedActions = useMemo(() => {
    const arr = [...actions];
    if (sortBy === "priority") {
      arr.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    } else {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [actions, sortBy]);

  const visibleActions = showAll ? sortedActions : sortedActions.slice(0, VISIBLE_COUNT);
  const hiddenCount = sortedActions.length - visibleActions.length;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        {sortedActions.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground rounded-full border border-border px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
            {sortedActions.length} item{sortedActions.length === 1 ? "" : "s"} need your attention
          </span>
        )}

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
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] px-4 py-5 text-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-[12.5px] font-semibold mt-2">You&apos;re all caught up for today.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleActions.map((action) => (
            <ActionRow key={action.id} action={action} />
          ))}
        </ul>
      )}

      {sortedActions.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          {showAll ? "Show less" : `Show ${hiddenCount} more action${hiddenCount === 1 ? "" : "s"}`}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

function ActionRow({ action }: { action: PriorityAction }) {
  const Icon = action.Icon;
  const tone = PRIORITY_TONE[action.priority];
  return (
    <li className="flex items-stretch gap-0 rounded-2xl border border-border bg-background overflow-hidden">
      <span className="w-1 shrink-0" style={{ background: tone }} aria-hidden />
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-4 px-4 py-3">
        <span
          className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="h-[17px] w-[17px]" strokeWidth={2.4} />
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
            <span className="font-heading font-bold text-[13px] leading-tight">{action.title}</span>
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug mt-1">
            {action.description}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="text-[11px] font-semibold text-muted-foreground">{action.meta}</div>
          {action.onOpenTool ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={action.onOpenTool}
              className="h-8 rounded-lg px-3.5 text-[11.5px] font-bold gap-1 shrink-0"
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
              className="h-8 rounded-lg px-3.5 text-[11.5px] font-bold gap-1 shrink-0"
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
