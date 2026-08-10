"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardPlus,
  FileBarChart,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaceholderMeeting } from "@/lib/specialEdPlaceholderData";

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type QuickAction = { label: string; icon: LucideIcon; onClick?: () => void; href?: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Review referral", icon: ListChecks, href: "/specialist/review-queue" },
  { label: "Create support plan", icon: ClipboardPlus, onClick: () => comingSoon("Creating a support plan") },
  { label: "Confirm accommodation", icon: ShieldCheck, onClick: () => comingSoon("Confirming an accommodation") },
  { label: "Schedule meeting", icon: CalendarPlus, onClick: () => comingSoon("Scheduling a meeting") },
  { label: "Generate report", icon: FileBarChart, onClick: () => comingSoon("Generating a report") },
];

export function TodayAndUpcomingRail({
  overdueFollowUpsCount,
  meetings = [],
}: {
  overdueFollowUpsCount: number;
  meetings?: PlaceholderMeeting[];
}) {
  const hasOverdue = overdueFollowUpsCount > 0;

  return (
    <div className="space-y-4">
      <section aria-label="Today and upcoming" className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading font-extrabold text-[14px] leading-tight">Today &amp; Upcoming</h3>
        </div>
        {meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 py-5 px-3 text-center">
            <CalendarClock className="h-4 w-4 text-muted-foreground/60 mx-auto mb-1.5" />
            <p className="text-[11px] text-muted-foreground leading-snug">
              No meetings scheduled — calendar prep hasn&apos;t been designed yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {meetings.map((m) => (
              <li key={`${m.time}-${m.studentName}`} className="rounded-xl border border-border/60 bg-background/50 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-foreground/90">
                      {m.time} &middot; {m.type} &middot; {m.studentName}
                    </div>
                    <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{m.note}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => comingSoon(m.ctaLabel)}
                  className="mt-2 inline-flex items-center h-6 rounded-lg px-2 text-[10px] font-bold border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  {m.ctaLabel}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Overdue" className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-heading font-extrabold text-[14px] leading-tight">Overdue</h3>
          {hasOverdue && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {overdueFollowUpsCount}
            </span>
          )}
        </div>
        {!hasOverdue ? (
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            Nothing overdue right now.
          </div>
        ) : (
          <Link
            href="/specialist/support-plans"
            className="flex items-center gap-2.5 rounded-xl border border-destructive/25 bg-destructive/[0.06] px-3 py-2.5 transition-colors hover:bg-destructive/10"
          >
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-[11.5px] font-semibold text-destructive leading-snug">
              {overdueFollowUpsCount} follow-up{overdueFollowUpsCount === 1 ? "" : "s"} past due
            </span>
          </Link>
        )}
      </section>

      <section aria-label="Quick actions" className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-heading font-extrabold text-[14px] leading-tight mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const isReal = Boolean(action.href);
            const content = (
              <>
                <action.icon
                  className={cn("h-4 w-4 mb-1.5", isReal ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={2.2}
                />
                <div className="flex items-center gap-1">
                  <div className="text-[10.5px] font-bold leading-snug">{action.label}</div>
                </div>
                {!isReal && (
                  <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-muted-foreground/70">
                    Soon
                  </span>
                )}
              </>
            );
            const className = cn(
              "rounded-xl p-2.5 text-left transition-colors",
              isReal
                ? "border border-primary/25 bg-primary/[0.05] hover:bg-primary/10"
                : "border border-dashed border-border/60 bg-background/50 hover:border-border",
            );
            return action.href ? (
              <Link key={action.label} href={action.href} className={className}>
                {content}
              </Link>
            ) : (
              <button key={action.label} type="button" onClick={action.onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
