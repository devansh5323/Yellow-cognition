"use client";

import { toast } from "sonner";
import {
  CalendarClock,
  ClipboardPlus,
  Eye,
  FileText,
  MessageSquareText,
  Users2,
  type LucideIcon,
} from "lucide-react";

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

const ACTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Request observation", icon: Eye },
  { label: "Request teacher input", icon: MessageSquareText },
  { label: "Request parent input", icon: Users2 },
  { label: "Add intervention", icon: ClipboardPlus },
  { label: "Create support plan", icon: FileText },
  { label: "Schedule review", icon: CalendarClock },
];

export function PriorityQuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="font-heading font-extrabold text-[13px] leading-tight mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => comingSoon(action.label)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 h-8 text-[11.5px] font-bold text-foreground/85 hover:border-primary/30 hover:text-primary transition-colors"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
