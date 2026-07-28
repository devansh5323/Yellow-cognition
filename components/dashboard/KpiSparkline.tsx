"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

/** Tiny inline sparkline — no axes, no legend, just a line + soft area fill.
 *  Designed to live at the bottom of a KPI card. */
export function KpiSparkline({
  data,
  color = "hsl(142 55% 45%)",
  height = 26,
  smooth = false,
}: {
  data: number[];
  color?: string;
  height?: number;
  /** Render a smooth bezier curve instead of straight segments. */
  smooth?: boolean;
}) {
  const reduce = useReducedMotion();
  const gradId = useId();
  if (!data || data.length < 2) return null;

  const W = 100;
  const H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1, max - min);

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / span) * (H - 4) - 2;
    return [x, y] as const;
  });

  const d = smooth ? buildSmoothPath(points) : buildLinearPath(points);
  const area = `${d} L ${W},${H} L 0,${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full block overflow-visible"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradId}-fill)`}
        initial={reduce ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
      />
      <motion.path
        d={d}
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
      {/* End-point dot — drawn as a thick round-cap stroke so it stays
          circular under non-uniform scaling. */}
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
  );
}

type Pt = readonly [number, number];

function buildLinearPath(points: Pt[]): string {
  return points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");
}

/** Catmull-Rom → cubic bezier conversion for a soft, premium-looking curve. */
function buildSmoothPath(points: Pt[]): string {
  if (points.length < 3) return buildLinearPath(points);
  const tension = 0.5;
  const segs: string[] = [`M ${points[0][0]},${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    segs.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  return segs.join(" ");
}
