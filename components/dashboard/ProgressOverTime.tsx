"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Lightbulb } from "lucide-react";
import { classHealth, classHealthTrend, yellowInsight, type PillarKey } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type LineKey = "overall" | PillarKey;

const LINES: { key: LineKey; label: string; tone: string }[] = [
  { key: "overall", label: "Overall", tone: "hsl(142 55% 45%)" },
  { key: "academic", label: "Learning", tone: "hsl(212 90% 58%)" },
  { key: "focus", label: "Focus", tone: "hsl(38 92% 55%)" },
  { key: "behavior", label: "Behavior", tone: "hsl(280 60% 60%)" },
  { key: "task", label: "Tasks", tone: "hsl(0 78% 58%)" },
];

export function ProgressOverTime() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<LineKey>("overall");
  const trend = useMemo(() => classHealthTrend(), []);
  const insight = useMemo(() => yellowInsight(), []);
  const ch = useMemo(() => classHealth(), []);
  const peak = useMemo(
    () => trend.reduce((p, x) => (x.overall > p.overall ? x : p), trend[0]),
    [trend],
  );

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Progress Over Time"
    >
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Monthly trend</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1.5">
            How your class is trending
          </h2>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5 backdrop-blur">
          {LINES.map((l) => {
            const isActive = active === l.key;
            return (
              <button
                key={l.key}
                onClick={() => setActive(l.key)}
                className={cn(
                  "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-3">
        <div className="premium-elevated rounded-[22px] p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {LINES.find((l) => l.key === active)?.label} score
              </div>
              <div className="font-heading font-bold text-[14.5px] mt-0.5">
                Last 5 weeks · best week highlighted
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.10em] px-2 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, hsl(142 55% 45%) 12%, transparent)",
                color: "hsl(142 55% 45%)",
              }}
            >
              <ArrowUpRight className="h-3 w-3" />
              Peak · {peak.week} ({peak.overall})
            </span>
          </div>

          <div className="flex-1 min-h-[260px] mt-3">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="hsl(230 15% 55%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="hsl(230 15% 55%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(240 15% 90%)",
                    backdropFilter: "blur(12px)",
                    background: "hsl(0 0% 100% / 0.92)",
                    boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
                    fontSize: 12,
                  }}
                />
                {LINES.map((l) => {
                  const isPrimary = active === l.key;
                  if (!isPrimary) return null;
                  return (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      name={l.label}
                      stroke={l.tone}
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, stroke: "white", fill: l.tone }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "white", fill: l.tone }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 content-start">
          <SideKpi
            eyebrow="Avg score"
            value={ch.score}
            unit="/100"
            delta={ch.delta}
            tone="hsl(142 55% 45%)"
          />
          <SideKpi
            eyebrow="Improving"
            value={ch.distribution.improving}
            unit=""
            delta={ch.delta}
            hint={`out of ${ch.total}`}
            tone="hsl(212 90% 58%)"
          />
          <SideKpi
            eyebrow="At risk"
            value={ch.distribution["needs-support"]}
            unit=""
            delta={-ch.distribution["needs-support"]}
            invertDelta
            hint="Need attention"
            tone="hsl(0 78% 58%)"
          />
          <SideKpi
            eyebrow="On track"
            value={Math.round((ch.distribution["on-track"] / Math.max(1, ch.total)) * 100)}
            unit="%"
            delta={ch.delta}
            hint="Class engagement"
            tone="hsl(38 92% 55%)"
          />

          <div className="col-span-2 rounded-2xl border border-primary/30 bg-primary/[0.05] p-3.5 flex items-start gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">
                Yellow insight
              </div>
              <p className="text-[12px] text-foreground/85 leading-relaxed mt-1">
                {insight.summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SideKpi({
  eyebrow,
  value,
  unit,
  delta,
  invertDelta,
  hint,
  tone,
}: {
  eyebrow: string;
  value: number;
  unit: string;
  delta: number;
  invertDelta?: boolean;
  hint?: ReactNode;
  tone: string;
}) {
  const positive = invertDelta ? delta <= 0 : delta >= 0;
  const deltaTone = positive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)";
  const showDelta = delta !== 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </span>
        {showDelta && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums"
            style={{ color: deltaTone }}
          >
            {positive ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta)}
          </span>
        )}
      </div>
      <div
        className="font-heading font-extrabold text-[24px] leading-none tabular-nums mt-2"
        style={{ color: tone }}
      >
        {value}
        {unit && (
          <span className="text-[12px] font-bold text-muted-foreground/80 ml-0.5">{unit}</span>
        )}
      </div>
      {hint && <div className="text-[10.5px] text-muted-foreground mt-1.5">{hint}</div>}
    </div>
  );
}
