"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, HeartPulse, AlertTriangle, Sparkles } from "lucide-react";
import type { Student } from "@/data/mockData";
import { scoreBand, type ScoreBand } from "@/lib/classHealth";
import { SCORE_BAND_TONE } from "@/components/dashboard/RiskBadge";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { StudentDrillDialog } from "./StudentDrillDialog";

type DrillState = {
  title: string;
  description: string;
  students: Student[];
  metricLabel?: string;
  metricValue?: (s: Student) => string | number;
} | null;

const EASE = [0.2, 0.7, 0.2, 1] as const;

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/** Rebuilt from what's actually real about this roster — the old
 * PFI/Teaching Effectiveness/Engagement KPIs (and their week-over-week
 * deltas) depended on gameplay signals and history that don't exist for
 * real students, so those are gone rather than kept with fabricated
 * numbers. */
export function ReportsKpiStrip({ students }: { students: Student[]; range: "week" | "month" | "term" }) {
  const reduce = useReducedMotion();
  const [drill, setDrill] = useState<DrillState>(null);

  const avgHealth = avg(students.map((s) => s.studentHealthScore)) ?? 0;
  const avgCognitive = avg(students.map((s) => s.cognitivePerformance.score)) ?? 0;
  const avgWellbeing = avg(
    students.map((s) => s.studentWellbeing.score).filter((v): v is number => v != null),
  );

  const bandCounts: Record<ScoreBand, number> = {
    excellent: 0,
    stable: 0,
    watch: 0,
    "needs-support": 0,
  };
  students.forEach((s) => bandCounts[scoreBand(s.studentHealthScore)]++);
  const needsSupport = bandCounts["needs-support"];

  const openBandDrill = (band: ScoreBand | "all") => {
    const list =
      band === "all"
        ? students.filter((s) => scoreBand(s.studentHealthScore) === "needs-support" || scoreBand(s.studentHealthScore) === "watch")
        : students.filter((s) => scoreBand(s.studentHealthScore) === band);
    setDrill({
      title: band === "all" ? "Students needing attention" : `Students at ${band.replace("-", " ")}`,
      description: `${list.length} student${list.length === 1 ? "" : "s"} in this band.`,
      students: list,
    });
  };

  const items = [
    {
      label: "Avg health score",
      value: avgHealth,
      suffix: "",
      icon: Sparkles,
      tint: SCORE_BAND_TONE.excellent,
      onClick: () =>
        setDrill({
          title: "Avg health score breakdown",
          description: `All ${students.length} students sorted by health score.`,
          students: [...students].sort((a, b) => b.studentHealthScore - a.studentHealthScore),
          metricLabel: "Score",
          metricValue: (s) => s.studentHealthScore,
        }),
    },
    {
      label: "Avg cognitive score",
      value: avgCognitive,
      suffix: "",
      icon: Brain,
      tint: "hsl(212 90% 58%)",
      onClick: () =>
        setDrill({
          title: "Cognitive performance breakdown",
          description: `All ${students.length} students sorted by cognitive score.`,
          students: [...students].sort((a, b) => b.cognitivePerformance.score - a.cognitivePerformance.score),
          metricLabel: "Score",
          metricValue: (s) => s.cognitivePerformance.score,
        }),
    },
  ];

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
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() =>
            setDrill({
              title: "Students with wellbeing data",
              description: "Wellbeing score is only available for students with at least one real signal.",
              students: students.filter((s) => s.studentWellbeing.score != null),
              metricLabel: "Score",
              metricValue: (s) => s.studentWellbeing.score ?? "—",
            })
          }
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.98 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
          }}
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          style={{ ["--kpi-tone" as never]: "hsl(243 75% 65%)" }}
          className="premium-surface premium-surface-hover premium-kpi sheen-hover group text-left rounded-[18px] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-muted-foreground font-semibold">Avg wellbeing score</span>
            <div className="h-8 w-8 rounded-lg grid place-items-center bg-[hsl(243_75%_65%/0.14)] text-[hsl(243_75%_65%)] transition-transform duration-200 group-hover:scale-[1.06]">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            {avgWellbeing != null ? (
              <span className="font-heading font-extrabold text-[26px] leading-none tabular-nums">
                <AnimatedNumber value={avgWellbeing} />
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-muted-foreground">Not enough data yet</span>
            )}
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => openBandDrill("all")}
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.98 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
          }}
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          style={{ ["--kpi-tone" as never]: SCORE_BAND_TONE["needs-support"] }}
          className="premium-surface premium-surface-hover premium-kpi sheen-hover group text-left rounded-[18px] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-muted-foreground font-semibold">Needs support</span>
            <div className="h-8 w-8 rounded-lg grid place-items-center bg-destructive/12 text-destructive transition-transform duration-200 group-hover:scale-[1.06]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-[26px] leading-none tabular-nums">
              <AnimatedNumber value={needsSupport} />
            </span>
            <span className="text-[13px] font-bold text-muted-foreground"> / {students.length}</span>
          </div>
          <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Dot color={SCORE_BAND_TONE.excellent} count={bandCounts.excellent} label="excellent" onClick={() => openBandDrill("excellent")} />
            <Dot color={SCORE_BAND_TONE.stable} count={bandCounts.stable} label="stable" onClick={() => openBandDrill("stable")} />
            <Dot color={SCORE_BAND_TONE.watch} count={bandCounts.watch} label="watch" onClick={() => openBandDrill("watch")} />
            <Dot color={SCORE_BAND_TONE["needs-support"]} count={bandCounts["needs-support"]} label="needs support" onClick={() => openBandDrill("needs-support")} />
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
