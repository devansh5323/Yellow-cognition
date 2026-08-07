"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import { TIME_OF_DAY_LABEL, type TimeOfDayKey, type TimeOfDayPattern } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TIME_ORDER: TimeOfDayKey[] = ["morning", "midday", "afternoon", "endOfDay"];

const TIME_ICON: Record<TimeOfDayKey, LucideIcon> = {
  morning: Sunrise,
  midday: Sun,
  afternoon: Sunset,
  endOfDay: Moon,
};

const TIME_TONE: Record<TimeOfDayKey, string> = {
  morning: "hsl(38 92% 55%)",
  midday: "hsl(212 90% 58%)",
  afternoon: "hsl(28 88% 54%)",
  endOfDay: "hsl(258 55% 60%)",
};

export function BehaviorTimeOfDay({ pattern }: { pattern: TimeOfDayPattern }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...TIME_ORDER.map((k) => pattern.counts[k]));

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Time of day pattern"
      className="rounded-2xl border border-border bg-card p-4 md:p-5"
    >
      <header className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-heading font-extrabold text-[14px] leading-tight">Time-of-Day Pattern</h3>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {TIME_ORDER.map((key) => {
          const Icon = TIME_ICON[key];
          const tone = TIME_TONE[key];
          const count = pattern.counts[key];
          const isPeak = pattern.peak === key;
          return (
            <div
              key={key}
              className="rounded-xl border p-2.5 text-center"
              style={{
                borderColor: isPeak ? `color-mix(in srgb, ${tone} 45%, var(--border))` : undefined,
                background: isPeak ? `color-mix(in srgb, ${tone} 6%, transparent)` : undefined,
              }}
            >
              <Icon className="h-3.5 w-3.5 mx-auto" style={{ color: tone }} strokeWidth={2.2} />
              <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground mt-1">
                {TIME_OF_DAY_LABEL[key]}
              </div>
              <div className="font-heading font-extrabold text-[16px] tabular-nums leading-none mt-1" style={{ color: tone }}>
                {count}
              </div>
              <div className="h-1 w-full rounded-full bg-muted/50 mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, background: tone }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground leading-snug">
        {pattern.peak ? (
          <>
            Highest logging period: <span className="font-bold text-foreground/85">{TIME_OF_DAY_LABEL[pattern.peak]}</span>.
            {pattern.topDriverLabel && (
              <> Most common driver overall this week: <span className="font-bold text-foreground/85">{pattern.topDriverLabel}</span>.</>
            )}
          </>
        ) : (
          "Not enough behaviour logs this week to surface a time-of-day pattern yet."
        )}
      </p>
    </motion.section>
  );
}
