"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";
import {
  FOCUS_DOMAIN_HUE,
  FOCUS_DOMAIN_LABEL,
  attentionDropCurve,
  classFocusDomains,
  type AttentionDropPoint,
  type FocusSnapshot as FocusSnapshotData,
  type MonthTrendPoint,
  type WeekTrendPoint,
} from "@/lib/classFocus";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const FOCUSED_TONE = "hsl(142 55% 46%)";
const FLUCTUATING_TONE = "hsl(38 92% 55%)";
const DISTRACTED_TONE = "hsl(0 78% 58%)";

type TrendPoint = WeekTrendPoint | MonthTrendPoint;

/** Component 7: 4 required charts, each answering one plain question about
 * whether the class is genuinely improving — reuses the same
 * weekly/monthly series Focus Snapshot already computes, plus the
 * sub-domain deltas from the heatmap, instead of a new data model. */
export function FocusTrendsSection({ snapshot }: { snapshot: FocusSnapshotData }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const points = period === "Weekly" ? snapshot.weekly : snapshot.monthly;
  const domains = classFocusDomains();
  const dropCurve = attentionDropCurve();

  const first = points[0];
  const last = points[points.length - 1];
  const scoreChange = first && last ? last.score - first.score : 0;

  const zonePct = (p: TrendPoint | undefined) => {
    if (!p) return 0;
    const total = Math.max(1, p.focused + p.fluctuating + p.distracted);
    return Math.round((p.focused / total) * 100);
  };
  const zoneChange = zonePct(last) - zonePct(first);

  const sortedDomains = [...domains].sort(
    (a, b) => b.score - b.prevScore - (a.score - a.prevScore),
  );
  const improvingCount = sortedDomains.filter((d) => d.score > d.prevScore).length;

  return (
    <section
      aria-label="Focus trends"
      className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
    >
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-[17px]">7. Trends</h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Track progress and focus trends over time.
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-background p-0.5">
          {(["Weekly", "Monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 h-8 rounded-full text-[12px] font-bold transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard
          title="Focus Score Trend"
          question="Is class improving?"
          verdict={`${scoreChange >= 0 ? "+" : ""}${scoreChange} pts`}
          direction={scoreChange > 0 ? "up" : scoreChange < 0 ? "down" : "flat"}
        >
          <ScoreLineChart points={points} reduce={!!reduce} />
        </TrendCard>

        <TrendCard
          title="Attention Zone Trend"
          question="Are more students focused?"
          verdict={`${zoneChange >= 0 ? "+" : ""}${zoneChange}% focused`}
          direction={zoneChange > 0 ? "up" : zoneChange < 0 ? "down" : "flat"}
        >
          <ZoneStackedChart points={points} reduce={!!reduce} />
        </TrendCard>

        <TrendCard
          title="Time-Based Attention Drop"
          question="When does attention fall?"
          verdict={`Drops after ~${dropCurve.dropAtMinute} min`}
          direction={dropCurve.dropAtMinute >= 18 ? "up" : "down"}
        >
          <DropCurveChart points={dropCurve.points} dropAtMinute={dropCurve.dropAtMinute} reduce={!!reduce} />
        </TrendCard>

        <TrendCard
          title="Component Trend"
          question="Which areas are improving?"
          verdict={`${improvingCount}/${sortedDomains.length} improving`}
          direction={improvingCount >= sortedDomains.length / 2 ? "up" : "down"}
        >
          <DomainDeltaChart domains={sortedDomains} reduce={!!reduce} />
        </TrendCard>
      </div>
    </section>
  );
}

function TrendCard({
  title,
  question,
  verdict,
  direction,
  children,
}: {
  title: string;
  question: string;
  verdict: string;
  direction: "up" | "down" | "flat";
  children: ReactNode;
}) {
  const tone =
    direction === "up" ? "hsl(142 55% 40%)" : direction === "down" ? "hsl(0 78% 50%)" : "var(--muted-foreground)";
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[13px] font-bold text-foreground/90">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{question}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-3 w-3" />
          {verdict}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ScoreLineChart({ points, reduce }: { points: TrendPoint[]; reduce: boolean }) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(2, Math.round((max - min) * 0.25));
  const yMin = Math.max(0, min - padding);
  const yMax = Math.min(100, max + padding);
  const range = Math.max(1, yMax - yMin);
  const W = 280;
  const H = 100;
  const stepX = W / Math.max(1, points.length - 1);
  const project = (v: number) => H - ((v - yMin) / range) * H;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${project(p.score).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${(points.length - 1) * stepX} ${H} L 0 ${H} Z`;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trend-score" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={FOCUSED_TONE} stopOpacity="0.3" />
            <stop offset="100%" stopColor={FOCUSED_TONE} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#trend-score)"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={FOCUSED_TONE}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </svg>
      <div className="mt-1 flex items-center justify-between">
        {points.map((p) => (
          <span key={p.label} className="text-[9.5px] font-semibold text-muted-foreground">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ZoneStackedChart({ points, reduce }: { points: TrendPoint[]; reduce: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-2 h-[100px]">
        {points.map((p, i) => {
          const total = Math.max(1, p.focused + p.fluctuating + p.distracted);
          const segments = [
            { tone: FOCUSED_TONE, v: p.focused },
            { tone: FLUCTUATING_TONE, v: p.fluctuating },
            { tone: DISTRACTED_TONE, v: p.distracted },
          ];
          return (
            <div key={p.label + i} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full">
              <div className="w-full flex-1 rounded-md overflow-hidden flex flex-col-reverse bg-muted/30">
                {segments.map((seg) => {
                  const pct = (seg.v / total) * 100;
                  return (
                    <motion.span
                      key={seg.tone}
                      initial={reduce ? undefined : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="block origin-bottom w-full"
                      style={{ height: `${pct}%`, background: seg.tone }}
                    />
                  );
                })}
              </div>
              <span className="text-[9.5px] font-semibold text-muted-foreground shrink-0">{p.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 flex-wrap">
        {[
          { tone: FOCUSED_TONE, label: "Focused" },
          { tone: FLUCTUATING_TONE, label: "Fluctuating" },
          { tone: DISTRACTED_TONE, label: "Distracted" },
        ].map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1 text-[10px] font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: s.tone }} aria-hidden />
            <span className="text-foreground/80">{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DropCurveChart({
  points,
  dropAtMinute,
  reduce,
}: {
  points: AttentionDropPoint[];
  dropAtMinute: number;
  reduce: boolean;
}) {
  const W = 280;
  const H = 100;
  const maxMinute = points[points.length - 1]?.minute ?? 60;
  const project = (p: AttentionDropPoint) => ({
    x: (p.minute / maxMinute) * W,
    y: H - (p.level / 100) * H,
  });
  const path = points
    .map((p, i) => {
      const { x, y } = project(p);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const dropX = (dropAtMinute / maxMinute) * W;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line
          x1={dropX}
          x2={dropX}
          y1={0}
          y2={H}
          stroke="hsl(258 70% 60%)"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.5"
        />
        <motion.path
          d={path}
          fill="none"
          stroke="hsl(258 70% 60%)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </svg>
      <div className="mt-1 flex items-center justify-between">
        {points.map((p) => (
          <span key={p.minute} className="text-[9.5px] font-semibold text-muted-foreground">
            {p.minute}m
          </span>
        ))}
      </div>
    </div>
  );
}

function DomainDeltaChart({
  domains,
  reduce,
}: {
  domains: { key: string; label: string; hue: string; score: number; prevScore: number }[];
  reduce: boolean;
}) {
  const maxAbs = Math.max(1, ...domains.map((d) => Math.abs(d.score - d.prevScore)));
  return (
    <ul className="space-y-2">
      {domains.map((d) => {
        const delta = d.score - d.prevScore;
        const pct = (Math.abs(delta) / maxAbs) * 100;
        return (
          <li key={d.key} className="flex items-center gap-2.5">
            <span className="w-[92px] shrink-0 text-[11px] font-semibold text-muted-foreground truncate">
              {FOCUS_DOMAIN_LABEL[d.key as keyof typeof FOCUS_DOMAIN_LABEL] ?? d.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
              <motion.span
                initial={reduce ? undefined : { scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="block h-full origin-left rounded-full"
                style={{ background: FOCUS_DOMAIN_HUE[d.key as keyof typeof FOCUS_DOMAIN_HUE] ?? d.hue }}
              />
            </div>
            <span
              className="w-10 shrink-0 text-[11px] font-bold tabular-nums text-right"
              style={{ color: delta >= 0 ? "hsl(142 55% 40%)" : "hsl(0 78% 50%)" }}
            >
              {delta >= 0 ? "+" : ""}
              {delta}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
