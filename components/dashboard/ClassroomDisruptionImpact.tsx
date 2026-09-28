"use client";

import { useMemo } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { Clock, Info, Lightbulb, TrendingUp, Users2 } from "lucide-react";
import { classDisruptionImpact } from "@/lib/classBehavior";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const TONE = "hsl(20 85% 58%)";

const IMPACT_TONE: Record<"Low" | "Medium" | "High", string> = {
  Low: "hsl(142 55% 42%)",
  Medium: "hsl(38 92% 48%)",
  High: "hsl(0 78% 55%)",
};

/** Component 3 of the Classroom Behaviour & Regulation page: how much
 * instructional time disruptions are costing. Fully demo — no real
 * time-tracking data exists anywhere in this app. */
export function ClassroomDisruptionImpact() {
  const reduce = useReducedMotion();
  const impact = useMemo(() => classDisruptionImpact(), []);
  const maxHours = Math.max(...impact.weekly.map((p) => p.hours), 1);

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Classroom disruption impact" className="rounded-2xl border border-border bg-card p-5 md:p-6 h-full flex flex-col">
        <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="font-heading font-extrabold text-[17px]">Classroom Disruption Impact</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                Estimated instructional time lost to behaviour disruptions.
              </TooltipContent>
            </Tooltip>
          </div>
          <DemoDataBadge />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-center">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-black text-[36px] leading-none tabular-nums" style={{ color: TONE }}>
                {impact.hoursLostThisMonth}
              </span>
              <span className="text-[14px] font-bold text-muted-foreground">hours lost this month</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-1">Behaviour management time reported by teacher.</p>
          </div>

          <div className="h-[70px] w-full">
            <svg width="100%" height="100%" viewBox="0 0 220 70" preserveAspectRatio="none">
              <motion.path
                d={buildAreaPath(impact.weekly.map((p) => p.hours), maxHours, 220, 70)}
                fill={`color-mix(in srgb, ${TONE} 16%, transparent)`}
                initial={reduce ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                d={buildLinePath(impact.weekly.map((p) => p.hours), maxHours, 220, 70)}
                fill="none"
                stroke={TONE}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? undefined : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
              />
            </svg>
            <div className="flex items-center justify-between mt-1">
              {impact.weekly.map((p) => (
                <span key={p.label} className="text-[9.5px] font-semibold text-muted-foreground">
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MiniStat icon={Clock} label="Average incidents" value={`${impact.avgIncidentsPerClass} per class`} />
          <MiniStat icon={Users2} label="Most affected moment" value={impact.mostAffectedMoment} />
          <MiniStat icon={TrendingUp} label="Teaching flow impact" value={impact.teachingFlowImpact} valueColor={IMPACT_TONE[impact.teachingFlowImpact]} />
        </div>

        <div className="mt-auto pt-3.5 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11.5px] leading-snug">
            <span className="font-bold">Teacher insight:</span> {impact.teacherInsight}
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}

function MiniStat({ icon: Icon, label, value, valueColor }: { icon: typeof Clock; label: string; value: string; valueColor?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
      <div className="mt-1.5 text-[13px] font-bold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{label}</div>
    </div>
  );
}

function buildLinePath(values: number[], max: number, w: number, h: number): string {
  const stepX = w / Math.max(1, values.length - 1);
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`).join(" ");
}

function buildAreaPath(values: number[], max: number, w: number, h: number): string {
  const line = buildLinePath(values, max, w, h);
  const stepX = w / Math.max(1, values.length - 1);
  return `${line} L ${(values.length - 1) * stepX} ${h} L 0 ${h} Z`;
}
