"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export type MetricTile = {
  key: string;
  label: string;
  /** null = not yet available (no data model backs it yet) — renders as
   * "—" with a "Soon" badge rather than a fabricated number. */
  value: number | null;
  icon: LucideIcon;
  tone: string;
  onClick: () => void;
};

/** A compact strip, not heavy cards — per the spec's own framing. */
export function MetricsRow({ tiles }: { tiles: MetricTile[] }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
    >
      {tiles.map((t) => {
        const Icon = t.icon;
        const available = t.value !== null;
        return (
          <button
            key={t.key}
            type="button"
            onClick={t.onClick}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left transition-all overflow-hidden",
              available
                ? "border-border hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-12px_hsl(230_50%_18%/0.3)]"
                : "border-dashed border-border/70 hover:border-border",
            )}
            style={available ? { borderTopColor: t.tone, borderTopWidth: 2 } : undefined}
          >
            <span
              className={cn(
                "h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 transition-transform",
                available && "group-hover:scale-110",
              )}
              style={{
                background: `color-mix(in srgb, ${t.tone} ${available ? 14 : 8}%, transparent)`,
                color: available ? t.tone : "var(--muted-foreground)",
              }}
            >
              <Icon className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "font-heading font-extrabold text-[17px] tabular-nums leading-none",
                    !available && "text-muted-foreground",
                  )}
                >
                  {available ? t.value : "—"}
                </div>
                {!available && (
                  <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-muted-foreground shrink-0">
                    Soon
                  </span>
                )}
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground leading-snug mt-0.5 truncate">
                {t.label}
              </div>
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
