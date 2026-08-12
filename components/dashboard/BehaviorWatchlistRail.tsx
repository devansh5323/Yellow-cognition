"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardPlus,
  Mail,
  Share2,
  ThumbsUp,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  DISRUPTION_HUE,
  DISRUPTION_LABEL,
  DISRUPTION_SHORT_PATTERN,
  WATCHLIST_TIER_LABEL,
  statusFromScore,
  type BehaviorSupport,
} from "@/lib/classBehavior";

const WATCHLIST_LIMIT = 6;

const TIER_TONE: Record<string, string> = {
  "Tier 3": "hsl(0 78% 56%)",
  "Tier 2": "hsl(38 92% 48%)",
  Watch: "hsl(212 55% 50%)",
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

function openBehaviorForm(studentId?: string) {
  window.dispatchEvent(new CustomEvent("ah-open-behavior-form", { detail: { studentId } }));
}

function openPositiveForm(studentId?: string) {
  window.dispatchEvent(new CustomEvent("ah-open-positive-form", { detail: { studentId } }));
}

type QuickAction = { label: string; Icon: LucideIcon; onClick: () => void };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Record behaviour", Icon: ClipboardPlus, onClick: () => openBehaviorForm() },
  { label: "Log positive", Icon: ThumbsUp, onClick: () => openPositiveForm() },
  { label: "Create group", Icon: Users2, onClick: () => comingSoon("Creating a small group") },
  { label: "Send parent nudge", Icon: Mail, onClick: () => comingSoon("Sending a parent nudge") },
  { label: "Share with special educator", Icon: Share2, onClick: () => comingSoon("Sharing with the special educator") },
  { label: "Schedule 1:1 review", Icon: CalendarClock, onClick: () => comingSoon("Scheduling a 1:1 review") },
];

export function BehaviorWatchlistRail({ supportRoster }: { supportRoster: BehaviorSupport[] }) {
  const rows = supportRoster.slice(0, WATCHLIST_LIMIT);

  return (
    <div className="space-y-5">
      <section aria-label="Students watchlist" className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-heading font-extrabold text-[14px] leading-tight">Students Watchlist</h3>
          {supportRoster.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {supportRoster.length}
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground">No students currently flagged.</p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((r) => {
              const tier = WATCHLIST_TIER_LABEL[statusFromScore(r.score)];
              const tierTone = TIER_TONE[tier];
              const driverTone = DISRUPTION_HUE[r.primary];
              return (
                <li key={r.student.id} className="rounded-xl border border-border/60 p-2.5">
                  <div className="flex items-start gap-2">
                    <StudentAvatar student={r.student} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[12px] font-bold truncate">{r.student.name}</span>
                        <span
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] shrink-0"
                          style={{ color: tierTone, background: `color-mix(in srgb, ${tierTone} 12%, transparent)` }}
                        >
                          {tier}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">
                        {DISRUPTION_SHORT_PATTERN[r.primary]}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mt-1.5">
                        <span
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold truncate max-w-[110px]"
                          style={{ color: driverTone, background: `color-mix(in srgb, ${driverTone} 10%, transparent)` }}
                          title={DISRUPTION_LABEL[r.primary]}
                        >
                          {DISRUPTION_LABEL[r.primary]}
                        </span>
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums shrink-0"
                          style={{ color: r.trend >= 0 ? "hsl(142 55% 42%)" : "hsl(0 70% 50%)" }}
                        >
                          {r.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(r.trend)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/students/${r.student.id}?tab=overview`}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-primary hover:underline"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/students"
          className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-bold text-primary hover:underline"
        >
          View all students →
        </Link>
      </section>

      <section aria-label="Quick actions" className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-heading font-extrabold text-[14px] leading-tight mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="rounded-xl border border-border/60 bg-background/50 p-2.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/30"
            >
              <action.Icon className="h-4 w-4 text-primary mb-1.5" strokeWidth={2.2} />
              <div className="text-[10.5px] font-bold leading-snug">{action.label}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
