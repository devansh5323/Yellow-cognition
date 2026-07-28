"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BAND_HUE, BAND_LABEL, BAND_ORDER, type OutcomeBand } from "@/lib/learningOutcomes";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Props = {
  distribution: Record<OutcomeBand, number>;
  total: number;
  /** When true, the count + label sit above each segment. */
  showLabels?: boolean;
  className?: string;
};

/**
 * Calm horizontal band rail. Single row of flat segments separated by hairlines,
 * with optional count + label rows above. Segments draw on with staggered scaleX.
 */
export function OutcomeBandRail({ distribution, total, showLabels = true, className }: Props) {
  const reduce = useReducedMotion();
  const safeTotal = Math.max(1, total);
  const segments = BAND_ORDER.map((band) => ({
    band,
    count: distribution[band] ?? 0,
    pct: ((distribution[band] ?? 0) / safeTotal) * 100,
  }));

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabels && (
        <div className="grid w-full" style={{ gridTemplateColumns: gridTemplate(segments) }}>
          {segments.map((s) => (
            <div key={`top-${s.band}`} className="px-1 min-w-0">
              <div
                className="font-heading font-extrabold text-[15px] leading-none tabular-nums"
                style={{ color: s.count === 0 ? "var(--muted-foreground)" : BAND_HUE[s.band] }}
              >
                {s.count}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <motion.span
            key={s.band}
            initial={reduce ? undefined : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
            className="origin-left h-full"
            style={{
              flex: `${Math.max(0.6, s.pct)} 1 0`,
              background:
                s.count === 0
                  ? "color-mix(in srgb, var(--muted) 60%, transparent)"
                  : BAND_HUE[s.band],
              boxShadow: s.count === 0 ? "none" : "inset 0 0 0 1px hsl(0 0% 100% / 0.08)",
            }}
            aria-label={`${BAND_LABEL[s.band]}: ${s.count}`}
            title={`${BAND_LABEL[s.band]}: ${s.count}`}
          />
        ))}
      </div>

      {showLabels && (
        <div className="grid w-full" style={{ gridTemplateColumns: gridTemplate(segments) }}>
          {segments.map((s) => (
            <div key={`btm-${s.band}`} className="px-1 min-w-0">
              <div
                className="text-[10.5px] font-bold uppercase tracking-[0.10em] leading-tight"
                style={{
                  color: s.count === 0 ? "var(--muted-foreground)" : "var(--foreground)",
                  opacity: s.count === 0 ? 0.6 : 0.85,
                }}
              >
                {BAND_LABEL[s.band]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function gridTemplate(segments: { count: number; pct: number }[]): string {
  return segments.map((s) => `${Math.max(0.6, s.pct)}fr`).join(" ");
}
