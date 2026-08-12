"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Shield,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  classHealth,
  scoreBand,
  SCORE_BANDS,
  studentComposites,
  type PillarKey,
  type ScoreBand,
} from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";
const LINK_BLUE = "hsl(212 90% 62%)";

const SCORE_BAND_TONE: Record<ScoreBand, string> = {
  excellent: GREEN,
  stable: BLUE,
  watch: AMBER,
  "needs-support": RED,
};

type PillarMeta = {
  key: PillarKey;
  label: string;
  Icon: LucideIcon;
  tone: string;
  href: string;
  impact: number;
  contextHeading: string;
  contextTags: string[];
  goodLine: string;
  watchLine: string;
};

const PILLARS: PillarMeta[] = [
  {
    key: "focus",
    label: "Attention & Focus",
    Icon: Target,
    tone: BLUE,
    href: "/focus",
    impact: 30,
    contextHeading: "Most Visible",
    contextTags: ["Independent Work"],
    goodLine: "staying focused during work",
    watchLine: "showing distraction patterns",
  },
  {
    key: "academic",
    label: "Learning Readiness",
    Icon: BookOpen,
    tone: GREEN,
    href: "/learning-outcomes",
    impact: 30,
    contextHeading: "Main Challenge",
    contextTags: ["Starting Multi-step Tasks"],
    goodLine: "ready for most classroom routines",
    watchLine: "slipping below grade level",
  },
  {
    key: "behavior",
    label: "Behaviour & Discipline",
    Icon: Shield,
    tone: PURPLE,
    href: "/behavior",
    impact: 20,
    contextHeading: "Needs Support",
    contextTags: ["Waiting & Turn-taking"],
    goodLine: "follow expectations consistently",
    watchLine: "disrupted lessons this week",
  },
  {
    key: "task",
    label: "Task Engagement",
    Icon: ClipboardList,
    tone: ORANGE,
    href: "/task-engagement",
    impact: 20,
    contextHeading: "Most Visible",
    contextTags: ["Independent Work", "Homework"],
    goodLine: "are completing their work on time",
    watchLine: "missed or delayed work this week",
  },
];

export function PillarHealthRow() {
  const reduce = useReducedMotion();
  const ch = useMemo(() => classHealth(), []);
  const composites = useMemo(() => studentComposites(), []);

  const ranked = [...PILLARS].sort((a, b) => ch.pillars[a.key] - ch.pillars[b.key]);
  const weakest = ranked[0];
  const weakestTwo = ranked.slice(0, 2);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="How each area is doing"
    >
      <div className="premium-eyebrow">
        <span>How each area is doing</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PILLARS.map((p, idx) => {
          const score = ch.pillars[p.key];
          const delta = ch.pillarDelta[p.key];
          const band = scoreBand(score);
          const bandInfo = SCORE_BANDS.find((b) => b.band === band)!;
          const statusTone = SCORE_BAND_TONE[band];
          const deltaPositive = delta >= 0;
          const good = band === "excellent" || band === "stable";

          const strugglingCount = composites.filter((c) => c.pillars[p.key] < 60).length;
          const onTrackCount = composites.filter((c) => c.pillars[p.key] >= 75).length;
          const statCount = good ? onTrackCount : strugglingCount;
          const statLine = good ? p.goodLine : p.watchLine;

          const trendData = wavePoints(score, idx);

          return (
            <article
              key={p.key}
              className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${p.tone} 16%, transparent)`, color: p.tone }}
                  >
                    <p.Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-heading font-extrabold text-[15px] leading-tight min-w-0">
                    {p.label}
                  </span>
                </div>
                <div className="rounded-lg border border-border/60 px-2 py-1 text-center shrink-0">
                  <div className="font-heading font-semibold text-[10.5px] leading-none tabular-nums text-foreground/85">
                    {p.impact}%
                  </div>
                  <div className="font-semibold text-[10.5px] leading-none text-muted-foreground/80 uppercase tracking-[0.06em] mt-1">
                    Impact
                  </div>
                </div>
              </div>

              {/* Score + status + chart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-heading font-extrabold text-[30px] leading-none tabular-nums"
                      style={{ color: p.tone }}
                    >
                      {score}
                    </span>
                    <span className="text-muted-foreground text-[13px] font-bold">/100</span>
                  </div>
                  <span
                    className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${statusTone} 14%, transparent)`,
                      color: statusTone,
                    }}
                  >
                    {bandInfo.tag}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Sparkline data={trendData} tone={p.tone} />
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Stat row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <Users className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div
                      className="font-heading font-extrabold text-[13px] leading-tight"
                      style={{ color: p.tone }}
                    >
                      {statCount} students
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {statLine}
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {p.contextHeading}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.contextTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg leading-tight"
                        style={{
                          background: `color-mix(in srgb, ${p.tone} 14%, transparent)`,
                          color: p.tone,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Trend row */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div
                    className="inline-flex items-center gap-1 font-bold text-[13px] tabular-nums"
                    style={{ color: deltaPositive ? GREEN : RED }}
                  >
                    {deltaPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {deltaPositive ? "+" : ""}
                    {delta}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground mt-0.5">from last week</div>
                </div>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline shrink-0"
                  style={{ color: LINK_BLUE }}
                >
                  View driver
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Insight footer */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_auto_1fr_auto] gap-4 lg:items-center">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-[13.5px]">Teacher Insight</div>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                {weakestTwo.map((p) => p.label).join(" and ")} are contributing most to your
                Classroom Health score.
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-10 bg-border/60" aria-hidden />

          <div className="min-w-0">
            <div className="font-heading font-extrabold text-[13.5px]" style={{ color: GREEN }}>
              Suggested Next Step
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              Review students struggling during {weakest.contextTags[0]}.
            </p>
          </div>

          <Link
            href={weakest.href}
            className="cta-premium !h-10 !w-auto px-4 !text-[12.5px] shrink-0 justify-self-start lg:justify-self-end"
          >
            <span className="sheen" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              Review {weakest.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
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
