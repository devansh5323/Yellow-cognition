"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BAND_HUE, BAND_LABEL, BAND_ORDER, type OutcomeBand } from "@/lib/learningOutcomes";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Props = {
  distribution: Record<OutcomeBand, number>;
  total: number;
};

/**
 * Class spread visualisation — vertical band bars with a floating count pill
 * above each bar, sat inside a dashed "headroom" frame to hint at potential.
 * Bare HTML + framer-motion so it renders identically in light + dark.
 */
export function OutcomeBandPie({ distribution, total }: Props) {
  const reduce = useReducedMotion();
  const safeTotal = Math.max(1, total);
  const chartHeight = 168;

  return (
    <div className="flex items-end gap-2.5 sm:gap-3">
      {BAND_ORDER.map((band, i) => {
        const v = distribution[band] ?? 0;
        const pct = Math.round((v / safeTotal) * 100);
        const ratio = v / safeTotal;
        const tone = BAND_HUE[band];
        const isEmpty = v === 0;
        const fillHeight = Math.max(isEmpty ? 0 : 6, ratio * chartHeight);

        return (
          <div key={band} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="relative w-full rounded-2xl border border-dashed"
              style={{
                height: chartHeight,
                borderColor: isEmpty
                  ? "color-mix(in srgb, var(--muted-foreground) 22%, transparent)"
                  : `color-mix(in srgb, ${tone} 35%, transparent)`,
              }}
              role="img"
              aria-label={`${BAND_LABEL[band]}: ${v} students (${pct}%)`}
            >
              {!isEmpty && (
                <motion.span
                  initial={reduce ? undefined : { opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.32, duration: 0.3, ease: EASE }}
                  className="absolute left-1/2 -translate-x-1/2 z-10 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums shadow-sm"
                  style={{
                    bottom: `calc(${(fillHeight / chartHeight) * 100}% - 11px)`,
                    color: tone,
                    background: "var(--card)",
                    border: `1px solid color-mix(in srgb, ${tone} 28%, transparent)`,
                  }}
                >
                  {v}
                </motion.span>
              )}

              <motion.div
                initial={reduce ? undefined : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.55, ease: EASE }}
                className="absolute inset-x-1.5 bottom-1.5 origin-bottom rounded-xl"
                style={{
                  height: fillHeight,
                  background: isEmpty
                    ? "color-mix(in srgb, var(--muted) 70%, transparent)"
                    : `linear-gradient(180deg, color-mix(in srgb, ${tone} 92%, white 8%), ${tone})`,
                  boxShadow: isEmpty
                    ? undefined
                    : `inset 0 1px 0 0 color-mix(in srgb, white 18%, transparent)`,
                }}
              />
            </div>

            <div className="mt-2 text-center min-w-0 w-full">
              <p
                className={`text-[11px] font-semibold leading-tight truncate ${
                  isEmpty ? "text-muted-foreground/70" : "text-foreground/85"
                }`}
                title={BAND_LABEL[band]}
              >
                {BAND_LABEL[band]}
              </p>
              <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                {pct}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
