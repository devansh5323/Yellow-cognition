"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ClipboardList, Sparkles, UserPlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewQueueSummaryStats } from "@/lib/specialEdCaseload";
import type { ReviewQueueFilterKey } from "@/app/specialist/review-queue/filters";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Tile = { key: ReviewQueueFilterKey | "all"; label: string; value: number; icon: LucideIcon; tone: string };

export function ReviewQueueSummary({
  stats,
  activeFilter,
  onFilterChange,
}: {
  stats: ReviewQueueSummaryStats;
  activeFilter: ReviewQueueFilterKey | null;
  onFilterChange: (key: ReviewQueueFilterKey | null) => void;
}) {
  const reduce = useReducedMotion();

  const tiles: Tile[] = [
    { key: "all", label: "Total Awaiting Review", value: stats.totalAwaitingReview, icon: ClipboardList, tone: "hsl(212 55% 50%)" },
    { key: "new-referral", label: "New Referrals", value: stats.newReferrals, icon: UserPlus, tone: "hsl(258 55% 60%)" },
    { key: "yellow-flag", label: "Yellow-Generated Flags", value: stats.yellowGeneratedFlags, icon: Sparkles, tone: "hsl(38 92% 48%)" },
    { key: "overdue", label: "Cases Overdue for Review", value: stats.overdueForReview, icon: AlertCircle, tone: "hsl(0 78% 56%)" },
  ];

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      {tiles.map((t) => {
        const Icon = t.icon;
        const isActive = t.key === "all" ? activeFilter === null : activeFilter === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onFilterChange(t.key === "all" ? null : (t.key as ReviewQueueFilterKey))}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left transition-all",
              isActive ? "border-primary/50 bg-primary/[0.06]" : "border-border hover:border-border/80",
            )}
            style={isActive ? { borderTopColor: t.tone, borderTopWidth: 2 } : undefined}
          >
            <span
              className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${t.tone} 14%, transparent)`, color: t.tone }}
            >
              <Icon className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-[17px] tabular-nums leading-none">{t.value}</div>
              <div className="text-[10px] font-semibold text-muted-foreground leading-snug mt-0.5">{t.label}</div>
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
