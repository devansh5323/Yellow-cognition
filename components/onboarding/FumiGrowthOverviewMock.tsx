"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, Smile, Sparkles, Star } from "lucide-react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type GrowthMetric = {
  key: string;
  title: string;
  subtitle: string;
  Icon: typeof Smile;
  tone: string;
  toneSoft: string;
  points: number[];
  changePct: number;
};

// Illustrative (not literal) preview of what a parent sees in the real
// Fumi app — same "no real product screenshot exists yet" convention as
// FumiIntroVisual.tsx's other mocks, mirroring the exact metrics/values the
// product team shared as the reference design.
const METRICS: GrowthMetric[] = [
  {
    key: "social",
    title: "Social Connect",
    subtitle: "Building friendships",
    Icon: Smile,
    tone: "#12B886",
    toneSoft: "#D3F2E7",
    points: [10, 14, 13, 18, 22, 26, 30],
    changePct: 24,
  },
  {
    key: "self-awareness",
    title: "Self Awareness",
    subtitle: "Understanding emotions",
    Icon: Star,
    tone: "#8B5CF6",
    toneSoft: "#E7DFFC",
    points: [12, 12, 15, 16, 18, 20, 22],
    changePct: 18,
  },
  {
    key: "action",
    title: "Action & Growth",
    subtitle: "Building good habits",
    Icon: Flame,
    tone: "#F59E0B",
    toneSoft: "#FCE8CB",
    points: [8, 10, 12, 16, 22, 27, 34],
    changePct: 31,
  },
];

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const w = 140;
  const h = 42;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: i * step,
    y: h - ((p - min) / range) * (h - 8) - 4,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const last = coords[coords.length - 1];
  const gradId = `spark-${tone.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="block" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity={0.3} />
          <stop offset="100%" stopColor={tone} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={tone} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={4.5} fill={tone} />
    </svg>
  );
}

/** No outer header/title here — this mounts directly under
 * FumiIntroVisual's own "Growth looks good on them" heading now, so a
 * second "Growth Overview" title would just repeat it. Each metric sits in
 * its own softly-tinted card (rather than a plain borderless column) to
 * match the reference design's boxed stat-card look. Illustrative preview
 * of what a parent sees in the real Fumi app, same convention as
 * FumiIntroVisual.tsx's other mocks. */
export function FumiGrowthOverviewMock() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.key}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.35, ease: EASE }}
            className="relative rounded-2xl border p-4 flex flex-col gap-3 overflow-hidden"
            style={{
              borderColor: `color-mix(in srgb, ${m.tone} 22%, transparent)`,
              background: `color-mix(in srgb, ${m.tone} 6%, transparent)`,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] opacity-80"
              style={{ background: m.tone }}
            />
            <div className="flex items-center gap-3">
              <span
                className="h-11 w-11 rounded-full inline-flex items-center justify-center shrink-0"
                style={{ background: m.toneSoft, color: m.tone }}
              >
                <m.Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-[15.5px] leading-tight">{m.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{m.subtitle}</div>
              </div>
            </div>

            <Sparkline points={m.points} tone={m.tone} />

            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-[24px] leading-none" style={{ color: m.tone }}>
                +{m.changePct}%
              </span>
              <span className="text-[11.5px] text-muted-foreground">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-primary/8 px-5 py-4 flex items-center justify-center gap-2.5 text-[14px] sm:text-[15px] font-semibold text-foreground/85 text-center">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        Helping your child grow, one small step at a time.
        <span aria-hidden>💜</span>
      </div>
    </motion.div>
  );
}
