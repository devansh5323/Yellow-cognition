"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

/** Sub-metric trend chart — a sparkline with a dashed baseline reference
 *  and a single caption row beneath (term-start · baseline · this-week).
 *  Kept deliberately minimal so a principal can read it at a glance. */
export function SubMetricTrendChart({
  data,
  baseline,
  color = "hsl(142 55% 45%)",
  height = 48,
  xStartLabel = "Term start",
  xEndLabel = "This week",
}: {
  data: number[];
  /** Reference value rendered as a dashed horizontal line. */
  baseline: number;
  color?: string;
  height?: number;
  xStartLabel?: string;
  xEndLabel?: string;
}) {
  const reduce = useReducedMotion();
  const gradId = useId();
  if (!data || data.length < 2) return null;

  // Include the baseline in the Y range so the dashed reference always sits inside the plot.
  const yMin = Math.min(...data, baseline);
  const yMax = Math.max(...data, baseline);
  const pad = Math.max(0.3, (yMax - yMin) * 0.12);
  const lo = yMin - pad;
  const hi = yMax + pad;
  const span = Math.max(0.001, hi - lo);

  const W = 100;
  const H = height;
  const yFor = (v: number) => H - ((v - lo) / span) * H;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    return [x, yFor(v)] as const;
  });
  const baselineY = yFor(baseline);

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");
  const area = `${linePath} L ${W},${H} L 0,${H} Z`;

  const fmt = (v: number) => {
    const r = Math.round(v * 10) / 10;
    return Number.isInteger(r) ? r.toString() : r.toFixed(1);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full block overflow-visible"
        style={{ height: H }}
        role="img"
        aria-label={`Trend from ${fmt(data[0])} to ${fmt(data[data.length - 1])} against a baseline of ${fmt(baseline)}`}
      >
        <defs>
          <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <line
          x1={0}
          y1={baselineY}
          x2={W}
          y2={baselineY}
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          className="stroke-muted-foreground/40"
        />

        <motion.path
          d={area}
          fill={`url(#${gradId}-fill)`}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
        />
        <motion.path
          d={`M ${points[points.length - 1][0]},${points[points.length - 1][1]}`}
          stroke={color}
          strokeWidth={4.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>

      <div className="flex items-center justify-between text-[10.5px] text-muted-foreground/80 leading-none">
        <span>{xStartLabel}</span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <span
            className="inline-block w-3 border-t border-dashed border-muted-foreground/60"
            aria-hidden
          />
          baseline {fmt(baseline)}
        </span>
        <span>{xEndLabel}</span>
      </div>
    </div>
  );
}
