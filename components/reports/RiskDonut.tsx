"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ShieldAlert, Layers } from "lucide-react";
import type { Student, RiskLevel } from "@/data/mockData";
import { STUDENTS } from "@/data/mockData";
import { StudentDrillDialog } from "./StudentDrillDialog";
import { cn } from "@/lib/utils";

const RISK_META: Record<
  RiskLevel,
  { label: string; color: string; text: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    color: "hsl(142 55% 48%)",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/25",
  },
  medium: {
    label: "Medium",
    color: "hsl(38 92% 55%)",
    text: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  high: {
    label: "High",
    color: "hsl(20 85% 58%)",
    text: "text-orange-600 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
  },
  "at-risk": {
    label: "At-risk",
    color: "hsl(0 75% 60%)",
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/25",
  },
};

const ORDER: RiskLevel[] = ["low", "medium", "high", "at-risk"];

type Drill = { title: string; students: Student[] } | null;
type RiskView = "distribution" | "cohort";

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid hsl(240 15% 90%)",
  background: "hsl(0 0% 100% / 0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
  fontSize: 12,
};

export function RiskDonut({ students }: { students: Student[] }) {
  const [view, setView] = useState<RiskView>("distribution");
  const [drill, setDrill] = useState<Drill>(null);
  const [hovered, setHovered] = useState<RiskLevel | null>(null);

  const bands = ORDER.map((b) => ({
    name: b,
    value: students.filter((s) => s.risk === b).length,
  }));
  const total = students.length || 1;
  const needAttention = bands[2].value + bands[3].value; // high + at-risk
  const needAttentionPct = Math.round((needAttention / total) * 100);

  const cohorts = ["3-A", "3-B", "4-A", "4-B"].map((key) => {
    const [g, sec] = key.split("-");
    const list = STUDENTS.filter((s) => s.grade === `Grade ${g}` && s.section === sec);
    return {
      cohort: key,
      total: list.length,
      low: list.filter((s) => s.risk === "low").length,
      medium: list.filter((s) => s.risk === "medium").length,
      high: list.filter((s) => s.risk === "high").length,
      "at-risk": list.filter((s) => s.risk === "at-risk").length,
    };
  });

  const openBand = (band: RiskLevel) => {
    setDrill({
      title: `${RISK_META[band].label} risk students`,
      students: students.filter((s) => s.risk === band),
    });
  };

  const openCohortBand = (cohort: string, band: RiskLevel) => {
    const [g, sec] = cohort.split("-");
    setDrill({
      title: `Grade ${g}-${sec} · ${RISK_META[band].label} risk`,
      students: STUDENTS.filter(
        (s) => s.grade === `Grade ${g}` && s.section === sec && s.risk === band,
      ),
    });
  };

  const isDistribution = view === "distribution";

  return (
    <>
      <section className="relative premium-elevated rounded-[18px] overflow-hidden h-full flex flex-col">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: isDistribution
              ? "radial-gradient(70% 55% at 0% 0%, hsl(142 55% 80% / 0.18), transparent 65%), radial-gradient(60% 55% at 100% 100%, hsl(0 70% 80% / 0.14), transparent 65%)"
              : "radial-gradient(60% 55% at 100% 0%, hsl(260 55% 80% / 0.18), transparent 65%), radial-gradient(55% 55% at 0% 100%, hsl(200 70% 80% / 0.14), transparent 65%)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 p-5 pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  isDistribution
                    ? "bg-primary/15 text-primary"
                    : "bg-[hsl(260_55%_70%)]/15 text-[hsl(260_55%_50%)] dark:text-[hsl(260_55%_75%)]",
                )}
              >
                {isDistribution ? <ShieldAlert className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
                  {isDistribution ? "Distribution" : "By cohort"}
                </div>
                <h3 className="font-heading font-extrabold text-[15.5px] leading-tight mt-0.5">
                  {isDistribution ? "Risk distribution" : "Risk by cohort"}
                </h3>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Risk view"
              className="inline-flex rounded-lg border border-border bg-card/60 p-0.5 text-[11.5px]"
            >
              <ViewTab active={isDistribution} onClick={() => setView("distribution")}>
                Distribution
              </ViewTab>
              <ViewTab active={!isDistribution} onClick={() => setView("cohort")}>
                By cohort
              </ViewTab>
            </div>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-2">
            {isDistribution
              ? "Click a slice or legend row to view students."
              : "Click a bar segment to drill into that cohort."}
          </p>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col px-5 pb-5 min-h-[340px]">
          {isDistribution ? (
            <div className="flex-1 flex items-center gap-5 flex-wrap">
              <div className="relative min-h-[260px] flex-1 min-w-[200px]">
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      {ORDER.map((b) => (
                        <linearGradient
                          key={`rd-grad-${b}`}
                          id={`rd-grad-${b}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={RISK_META[b].color} stopOpacity={1} />
                          <stop offset="100%" stopColor={RISK_META[b].color} stopOpacity={0.72} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={bands}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={64}
                      outerRadius={100}
                      paddingAngle={3}
                      cornerRadius={6}
                      onClick={(d: { name?: string }) =>
                        d?.name && openBand(d.name as RiskLevel)
                      }
                      onMouseEnter={(d: { name?: string }) =>
                        d?.name && setHovered(d.name as RiskLevel)
                      }
                      onMouseLeave={() => setHovered(null)}
                      className="cursor-pointer outline-none"
                    >
                      {bands.map((b) => (
                        <Cell
                          key={b.name}
                          fill={`url(#rd-grad-${b.name})`}
                          stroke="hsl(0 0% 100%)"
                          strokeWidth={hovered === b.name ? 3 : 1.5}
                          style={{
                            filter:
                              hovered && hovered !== b.name
                                ? "grayscale(0.4) opacity(0.55)"
                                : undefined,
                            transition: "filter 180ms",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value: number, name: string) => [
                        `${value} students · ${Math.round((value / total) * 100)}%`,
                        RISK_META[name as RiskLevel]?.label ?? name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="font-heading font-extrabold text-[28px] tabular-nums leading-none bg-gradient-to-r from-[hsl(0_75%_55%)] to-[hsl(20_85%_55%)] bg-clip-text text-transparent">
                      {needAttention}
                    </div>
                    <div className="text-[9.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground mt-1.5">
                      Need attention
                    </div>
                    <div className="text-[10.5px] text-muted-foreground mt-0.5 tabular-nums">
                      {needAttentionPct}% of class
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-1.5 min-w-[160px]">
                {bands.map((b) => {
                  const meta = RISK_META[b.name];
                  const pct = Math.round((b.value / total) * 100);
                  const active = hovered === b.name;
                  return (
                    <li key={b.name}>
                      <button
                        onClick={() => openBand(b.name)}
                        onMouseEnter={() => setHovered(b.name)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 pl-2 pr-2.5 h-9 rounded-lg border transition-colors",
                          active
                            ? cn(meta.bg, meta.border)
                            : "border-transparent hover:bg-muted/50",
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ background: meta.color }}
                          />
                          <span
                            className={cn(
                              "text-[12.5px] font-semibold truncate",
                              active ? meta.text : "text-foreground",
                            )}
                          >
                            {meta.label}
                          </span>
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="font-heading font-extrabold text-[14.5px] tabular-nums">
                            {b.value}
                          </span>
                          <span className="text-[10.5px] text-muted-foreground tabular-nums">
                            {pct}%
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer>
                  <BarChart
                    data={cohorts}
                    layout="vertical"
                    margin={{ top: 2, right: 10, bottom: 0, left: 2 }}
                  >
                    <defs>
                      {ORDER.map((b) => (
                        <linearGradient
                          key={`rc-grad-${b}`}
                          id={`rc-grad-${b}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor={RISK_META[b].color} stopOpacity={0.95} />
                          <stop offset="100%" stopColor={RISK_META[b].color} stopOpacity={0.75} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(240 15% 90%)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      fontSize={10.5}
                      stroke="hsl(230 15% 55%)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="cohort"
                      type="category"
                      fontSize={11.5}
                      stroke="hsl(230 15% 40%)"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ fill: "hsl(142 52% 48% / 0.04)" }}
                      formatter={(value: number, name: string) => [
                        value,
                        RISK_META[name as RiskLevel]?.label ?? name,
                      ]}
                    />
                    {ORDER.map((band, i) => (
                      <Bar
                        key={band}
                        dataKey={band}
                        stackId="a"
                        fill={`url(#rc-grad-${band})`}
                        radius={
                          i === 0
                            ? [6, 0, 0, 6]
                            : i === ORDER.length - 1
                              ? [0, 6, 6, 0]
                              : 0
                        }
                        className="cursor-pointer"
                        onClick={(d: { cohort?: string }) =>
                          d?.cohort && openCohortBand(d.cohort, band)
                        }
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Legend chip row (always visible) */}
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center flex-wrap gap-1.5">
            {ORDER.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => openBand(b)}
                onMouseEnter={() => setHovered(b)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "inline-flex items-center gap-1.5 pl-1.5 pr-2.5 h-6 rounded-full border text-[10.5px] font-semibold transition-transform hover:-translate-y-0.5",
                  RISK_META[b].bg,
                  RISK_META[b].border,
                  RISK_META[b].text,
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: RISK_META[b].color }}
                />
                {RISK_META[b].label}
                <span className="tabular-nums font-bold">{bands.find((x) => x.name === b)?.value ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <StudentDrillDialog
        open={!!drill}
        onOpenChange={(o) => !o && setDrill(null)}
        title={drill?.title ?? ""}
        students={drill?.students ?? []}
      />
    </>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
