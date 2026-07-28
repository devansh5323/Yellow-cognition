"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Users, AlertTriangle, Sparkles } from "lucide-react";
import { classStats, type Student, type RiskLevel } from "@/data/mockData";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { cn } from "@/lib/utils";
import { StudentDrillDialog } from "./StudentDrillDialog";

type DrillState = {
  title: string;
  description: string;
  students: Student[];
  metricLabel?: string;
  metricValue?: (s: Student) => string | number;
} | null;

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function ReportsKpiStrip({ students, range }: { students: Student[]; range: "week" | "month" | "term" }) {
  const reduce = useReducedMotion();
  const stats = classStats(students);
  const rangeMultiplier = range === "week" ? 0.4 : range === "month" ? 1 : 1.6;
  const pfiDelta = Math.round(3.2 * rangeMultiplier * 10) / 10;
  const teiDelta = Math.round(2.1 * rangeMultiplier * 10) / 10;

  const [drill, setDrill] = useState<DrillState>(null);

  const riskCounts = {
    low: students.filter((s) => s.risk === "low").length,
    medium: students.filter((s) => s.risk === "medium").length,
    high: students.filter((s) => s.risk === "high").length,
    "at-risk": students.filter((s) => s.risk === "at-risk").length,
  };

  const items = [
    {
      label: "Avg Class PFI",
      value: stats.avgPfi,
      suffix: "",
      delta: pfiDelta,
      icon: Sparkles,
      tint: "hsl(142 52% 48%)",
      onClick: () =>
        setDrill({
          title: "Avg Class PFI breakdown",
          description: `All ${students.length} students sorted by PFI score.`,
          students: [...students].sort((a, b) => b.pfi - a.pfi),
          metricLabel: "PFI",
          metricValue: (s) => s.pfi,
        }),
    },
    {
      label: "Teaching Effectiveness",
      value: stats.tei,
      suffix: "",
      delta: teiDelta,
      icon: Activity,
      tint: "hsl(260 50% 60%)",
      onClick: () =>
        setDrill({
          title: "Teaching Effectiveness contributors",
          description: "Students whose growth drives the TEI metric.",
          students: [...students].sort((a, b) => b.pfi - b.pfiPrevCheckIn - (a.pfi - a.pfiPrevCheckIn)),
          metricLabel: "Δ PFI",
          metricValue: (s) => `${s.pfi - s.pfiPrevCheckIn >= 0 ? "+" : ""}${s.pfi - s.pfiPrevCheckIn}`,
        }),
    },
    {
      label: "Engagement",
      value: stats.engagement,
      suffix: "%",
      delta: 5.4 * rangeMultiplier,
      icon: Users,
      tint: "hsl(200 70% 55%)",
      onClick: () =>
        setDrill({
          title: "Engagement breakdown",
          description: "Games played vs assigned, per student.",
          students: [...students].sort(
            (a, b) => b.gamesPlayed / b.gamesAssigned - a.gamesPlayed / a.gamesAssigned,
          ),
          metricLabel: "Played",
          metricValue: (s) => `${s.gamesPlayed}/${s.gamesAssigned}`,
        }),
    },
  ];

  const openRiskDrill = (band: RiskLevel | "all") => {
    const list =
      band === "all"
        ? students.filter((s) => s.risk === "high" || s.risk === "at-risk")
        : students.filter((s) => s.risk === band);
    setDrill({
      title: band === "all" ? "All at-risk students" : `Students at ${band} risk`,
      description: `${list.length} student${list.length === 1 ? "" : "s"} in this band.`,
      students: list,
    });
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
      >
        {items.map((it) => {
          const Icon = it.icon;
          const positive = it.delta >= 0;
          return (
            <motion.button
              key={it.label}
              onClick={it.onClick}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.98 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
              }}
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              style={{ ["--kpi-tone" as never]: it.tint }}
              className="premium-surface premium-surface-hover premium-kpi sheen-hover group text-left rounded-[18px] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-muted-foreground font-semibold">{it.label}</span>
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center transition-transform duration-200 group-hover:scale-[1.06]"
                  style={{ background: it.tint.replace(")", " / 0.14)"), color: it.tint }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading font-extrabold text-[26px] leading-none tabular-nums">
                  <AnimatedNumber value={it.value} />
                </span>
                {it.suffix && (
                  <span className="text-[13px] font-bold text-muted-foreground">{it.suffix}</span>
                )}
              </div>
              <div
                className={cn(
                  "mt-2 inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 h-5 rounded-full",
                  positive
                    ? "bg-primary/12 text-primary border border-primary/25"
                    : "bg-destructive/12 text-destructive border border-destructive/25",
                )}
              >
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? "+" : ""}
                {it.delta.toFixed(1)} vs last {range}
              </div>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => openRiskDrill("all")}
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.98 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
          }}
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          style={{ ["--kpi-tone" as never]: "hsl(0 78% 58%)" }}
          className="premium-surface premium-surface-hover premium-kpi sheen-hover group text-left rounded-[18px] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-muted-foreground font-semibold">At-risk students</span>
            <div className="h-8 w-8 rounded-lg grid place-items-center bg-destructive/12 text-destructive transition-transform duration-200 group-hover:scale-[1.06]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-[26px] leading-none tabular-nums">
              <AnimatedNumber value={stats.atRisk} />
            </span>
            <span className="text-[13px] font-bold text-muted-foreground"> / {stats.total}</span>
          </div>
          <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Dot color="hsl(142 52% 48%)" count={riskCounts.low} label="low" onClick={() => openRiskDrill("low")} />
            <Dot color="hsl(38 92% 55%)" count={riskCounts.medium} label="med" onClick={() => openRiskDrill("medium")} />
            <Dot color="hsl(20 80% 55%)" count={riskCounts.high} label="high" onClick={() => openRiskDrill("high")} />
            <Dot color="hsl(0 70% 60%)" count={riskCounts["at-risk"]} label="at-risk" onClick={() => openRiskDrill("at-risk")} />
          </div>
        </motion.button>
      </motion.div>
      <StudentDrillDialog
        open={!!drill}
        onOpenChange={(o) => !o && setDrill(null)}
        title={drill?.title ?? ""}
        description={drill?.description}
        students={drill?.students ?? []}
        metricLabel={drill?.metricLabel}
        metricValue={drill?.metricValue}
      />
    </>
  );
}

function Dot({
  color,
  count,
  label,
  onClick,
}: {
  color: string;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 hover:opacity-70 transition-opacity"
      title={`${label}: ${count} — click to view`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{count}</span>
    </button>
  );
}
