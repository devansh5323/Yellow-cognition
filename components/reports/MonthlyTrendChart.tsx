"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
  ReferenceArea,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CalendarRange } from "lucide-react";
import { classMonthlyAttention, type Student } from "@/data/mockData";
import { cn } from "@/lib/utils";

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid hsl(240 15% 90%)",
  background: "hsl(0 0% 100% / 0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
  fontSize: 12,
};

type Submitted = { month: string; attention: number };

export function MonthlyTrendChart({ students }: { students: Student[] }) {
  const raw = classMonthlyAttention(students);
  const submitted: Submitted[] = raw.filter((d): d is Submitted => d.attention != null);

  if (submitted.length === 0) {
    return (
      <div className="premium-elevated rounded-[18px] p-6 text-center text-[13px] text-muted-foreground">
        No monthly check-ins submitted yet.
      </div>
    );
  }

  const peak = submitted.reduce((a, b) => (b.attention > a.attention ? b : a));
  const dip = submitted.reduce((a, b) => (b.attention < a.attention ? b : a));
  const classAvg = Math.round(
    submitted.reduce((a, b) => a + b.attention, 0) / submitted.length,
  );
  const belowAvg = submitted.filter((d) => d.attention < classAvg);

  return (
    <div className="space-y-4">
      {/* Peak + Dip stat cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        <HeroStatCard
          tone="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          eyebrow="Best month"
          primary={peak.month}
          secondary={`${peak.attention}%`}
          caption="Strongest class focus this window"
        />
        <HeroStatCard
          tone="negative"
          icon={<TrendingDown className="h-5 w-5" />}
          eyebrow="Lowest month"
          primary={dip.month}
          secondary={`${dip.attention}%`}
          caption="Worth a closer look at what changed"
        />
      </div>

      {/* Monthly trend chart */}
      <section className="relative premium-elevated rounded-[18px] p-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(65% 55% at 0% 0%, hsl(200 65% 80% / 0.16), transparent 65%), radial-gradient(55% 55% at 100% 100%, hsl(142 55% 80% / 0.14), transparent 65%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <CalendarRange className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
                  Trend
                </div>
                <h3 className="font-heading font-extrabold text-[15px] leading-tight mt-0.5">
                  Class focus across recent monthly check-ins
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] rounded-full px-2 py-0.5 bg-primary/10 text-primary border border-primary/25">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Peak {peak.month}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={raw} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mtc-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(200 70% 55%)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="hsl(200 70% 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mtc-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(142 55% 48%)" />
                    <stop offset="50%" stopColor="hsl(200 65% 52%)" />
                    <stop offset="100%" stopColor="hsl(260 55% 62%)" />
                  </linearGradient>
                  <radialGradient id="mtc-peak-glow">
                    <stop offset="0%" stopColor="hsl(142 55% 48%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(142 55% 48%)" stopOpacity={0} />
                  </radialGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{
                    stroke: "hsl(200 65% 50%)",
                    strokeOpacity: 0.35,
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  formatter={(value) =>
                    value == null ? ["No check-in", ""] : [`${value}%`, "Class avg"]
                  }
                />
                <ReferenceArea
                  x1={peak.month}
                  x2={peak.month}
                  strokeOpacity={0}
                  fill="hsl(142 55% 48%)"
                  fillOpacity={0.06}
                />
                <Area
                  type="monotone"
                  dataKey="attention"
                  stroke="url(#mtc-line)"
                  strokeWidth={2.8}
                  fill="url(#mtc-fill)"
                  connectNulls
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    stroke: "white",
                    fill: "hsl(200 65% 50%)",
                  }}
                />
                <ReferenceDot
                  x={peak.month}
                  y={peak.attention}
                  r={12}
                  fill="url(#mtc-peak-glow)"
                  stroke="transparent"
                />
                <ReferenceDot
                  x={peak.month}
                  y={peak.attention}
                  r={6}
                  fill="hsl(142 55% 48%)"
                  stroke="white"
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={dip.month}
                  y={dip.attention}
                  r={6}
                  fill="hsl(0 70% 60%)"
                  stroke="white"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Months below avg ({classAvg}%)
            </span>
            {belowAvg.length === 0 ? (
              <span className="text-[11.5px] text-muted-foreground">None — class held steady all window.</span>
            ) : (
              belowAvg.map((b) => (
                <span
                  key={b.month}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 tabular-nums"
                >
                  {b.month}
                  <span className="text-[10px] text-muted-foreground">· {b.attention}%</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStatCard({
  tone,
  icon,
  eyebrow,
  primary,
  secondary,
  caption,
}: {
  tone: "positive" | "negative";
  icon: React.ReactNode;
  eyebrow: string;
  primary: string;
  secondary: string;
  caption: string;
}) {
  const positive = tone === "positive";
  return (
    <div className="relative premium-elevated rounded-[16px] p-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: positive
            ? "radial-gradient(70% 100% at 100% 0%, hsl(142 60% 75% / 0.22), transparent 65%)"
            : "radial-gradient(70% 100% at 100% 0%, hsl(0 70% 78% / 0.22), transparent 65%)",
        }}
      />
      <div className="relative z-10 flex items-center gap-3">
        <div
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
            positive
              ? "bg-primary/12 text-primary border border-primary/20"
              : "bg-destructive/12 text-destructive border border-destructive/20",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
            {eyebrow}
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="font-heading font-extrabold text-[20px] leading-none tabular-nums">
              {primary}
            </span>
            <span
              className={cn(
                "text-[14px] font-heading font-extrabold tabular-nums",
                positive ? "text-primary" : "text-destructive",
              )}
            >
              {secondary}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">{caption}</div>
        </div>
      </div>
    </div>
  );
}
