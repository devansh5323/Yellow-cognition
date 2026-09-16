"use client";

import { toast } from "sonner";
import {
  CalendarClock,
  ClipboardPlus,
  Mail,
  Share2,
  ThumbsUp,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import type { BehaviorSupport } from "@/lib/classBehavior";

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

/** No real per-student behaviour score exists yet, so studentsNeedingBehaviorSupport()
 * (the source of supportRoster) always returns an empty array — the watchlist
 * honestly says there's nothing to show yet rather than rendering an empty
 * rail. Quick Actions stays live since it's independent of any per-student
 * signal. */
export function BehaviorWatchlistRail({ supportRoster }: { supportRoster: BehaviorSupport[] }) {
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

        <NotEnoughData label="No students on the watchlist yet — needs real behaviour data" />
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
