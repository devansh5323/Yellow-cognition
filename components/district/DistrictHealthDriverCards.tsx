"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  LifeBuoy,
  Shield,
  Smile,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { districtDriverCards, type DistrictDriverKey } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const RED = "hsl(0 78% 58%)";
const LINK_BLUE = "hsl(212 90% 62%)";

const DRIVER_ICON: Record<DistrictDriverKey, LucideIcon> = {
  attention: Target,
  readiness: BookOpen,
  behavior: Shield,
  task: ClipboardList,
  "positive-culture": Smile,
  "intervention-response": LifeBuoy,
  "pbis-consistency": ClipboardCheck,
};

const DRIVER_TONE: Record<DistrictDriverKey, string> = {
  attention: "hsl(212 90% 58%)",
  readiness: "hsl(142 55% 45%)",
  behavior: "hsl(262 60% 62%)",
  task: "hsl(28 88% 54%)",
  "positive-culture": "hsl(172 55% 40%)",
  "intervention-response": "hsl(243 75% 65%)",
  "pbis-consistency": "hsl(330 65% 60%)",
};

export function DistrictHealthDriverCards() {
  const reduce = useReducedMotion();
  const drivers = useMemo(() => districtDriverCards(), []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Health Drivers"
    >
      <div className="premium-eyebrow">
        <span>District Health Drivers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {drivers.map((driver, idx) => {
          const Icon = DRIVER_ICON[driver.key];
          const tone = DRIVER_TONE[driver.key];
          const deltaPositive = driver.delta >= 0;
          const trendData = wavePoints(driver.score, idx);

          return (
            <article
              key={driver.key}
              className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-heading font-extrabold text-[14px] leading-tight min-w-0">
                    {driver.label}
                  </span>
                </div>
                <span
                  className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-1 rounded-full shrink-0"
                  style={{ background: `color-mix(in srgb, ${driver.tone} 14%, transparent)`, color: driver.tone }}
                >
                  {driver.statusLabel}
                </span>
              </div>

              {/* Score + change + chart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-heading font-extrabold text-[28px] leading-none tabular-nums"
                      style={{ color: tone }}
                    >
                      {driver.score}
                    </span>
                    <span className="text-muted-foreground text-[12px] font-bold">/100</span>
                  </div>
                  <span
                    className="inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums"
                    style={{ color: deltaPositive ? GREEN : RED }}
                  >
                    {deltaPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {deltaPositive ? "+" : ""}
                    {driver.delta}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Sparkline data={trendData} tone={tone} />
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Stat row */}
              <div className="flex items-start gap-2 min-w-0">
                <Users className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="font-heading font-extrabold text-[13px] leading-tight" style={{ color: tone }}>
                    {driver.schoolsContributing}/{driver.totalSchools}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">
                    schools contributing
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(38 92% 55%)" }} />
                  <span className="truncate">
                    {driver.schoolsNeedingAttention} school{driver.schoolsNeedingAttention === 1 ? "" : "s"} need
                    attention
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline shrink-0"
                  style={{ color: LINK_BLUE }}
                >
                  View driver
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}

/** Deterministic wavy trend line — anchors the last point to the live score. */
function wavePoints(end: number, seed: number, count = 7): number[] {
  const amplitude = 6;
  const raw = Array.from({ length: count }, (_, i) => {
    const wave =
      Math.sin(i * 1.15 + seed * 2.1) * amplitude + Math.sin(i * 0.5 + seed * 0.8) * (amplitude * 0.5);
    return end + wave;
  });
  raw[raw.length - 1] = end;
  return raw.map((v) => Math.max(2, Math.min(98, v)));
}

function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 100;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const points = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="relative w-full h-7">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={tone} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={1.6} fill={tone} />
            <circle
              cx={p.x}
              cy={p.y}
              r={6}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full rounded-md border border-border/70 bg-popover px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-md pointer-events-none"
          style={{
            left: `${points[hover].x}%`,
            top: `${(points[hover].y / h) * 100}%`,
            marginTop: "-4px",
            color: tone,
          }}
        >
          {Math.round(data[hover])}
        </div>
      )}
    </div>
  );
}
