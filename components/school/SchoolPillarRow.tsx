"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  STATUS_COPY,
  STATUS_TONE,
  getKpiAttentionCount,
  type SchoolKpi,
} from "@/lib/schoolKpis";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Props = {
  kpis: SchoolKpi[];
};

export function SchoolPillarRow({ kpis }: Props) {
  const reduce = useReducedMotion();
  return (
    <TooltipProvider delayDuration={150}>
      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="space-y-3"
        aria-label="How each area is doing"
        data-tour-target="school-kpis"
      >
        <div className="premium-eyebrow">
          <span>How each area is doing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {kpis.map((kpi) => (
            <PillarTile key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </motion.section>
    </TooltipProvider>
  );
}

function PillarTile({ kpi }: { kpi: SchoolKpi }) {
  const statusTone = STATUS_TONE[kpi.status];
  const positive = kpi.delta >= 0;
  const { count, total } = getKpiAttentionCount(kpi.id);

  return (
    <div className="relative group rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] hover:shadow-[0_14px_28px_-18px_rgba(0,0,0,0.18)] focus-within:ring-2 focus-within:ring-primary/40">
      {/* Link covers the whole card so it's all clickable; sits below the info button. */}
      <Link
        href={`/school/dashboard/${kpi.id}`}
        aria-label={`${kpi.title} — view detail`}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none"
      />

      <div className="relative z-[1] flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground truncate">
            {kpi.title}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`What is ${kpi.title}?`}
                className="pointer-events-auto h-4 w-4 inline-flex items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors shrink-0"
              >
                <Info className="h-3 w-3" strokeWidth={2.2} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              className="max-w-[260px] text-left text-[11.5px] leading-snug font-normal bg-popover text-popover-foreground border border-border/60"
            >
              <div className="font-heading font-bold mb-0.5 text-[12px]">
                {kpi.title}
              </div>
              {kpi.meaning}
            </TooltipContent>
          </Tooltip>
        </div>
        <span
          className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0"
          style={{
            background: `color-mix(in srgb, ${statusTone} 12%, transparent)`,
            color: statusTone,
          }}
        >
          {STATUS_COPY[kpi.status]}
        </span>
      </div>

      <div className="relative z-[1] flex items-baseline gap-1.5 pointer-events-none">
        <span
          className="font-heading font-extrabold text-[28px] leading-none tabular-nums"
          style={{ color: kpi.tone }}
        >
          {kpi.id === "rit" && positive && "+"}
          <AnimatedNumber
            value={kpi.value}
            format={(n) => (kpi.id === "rit" ? n.toFixed(1) : String(n))}
          />
        </span>
        <span className="text-[11.5px] font-bold text-muted-foreground/90 leading-none">
          {kpi.unit}
        </span>
        <span
          className="inline-flex items-center text-[11px] font-bold tabular-nums ml-1"
          style={{ color: positive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)" }}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(kpi.delta)}
        </span>
      </div>

      <div className="relative z-[1] pointer-events-none">
        <CountRow count={count} total={total} tone={kpi.tone} label={kpi.title} />
      </div>
    </div>
  );
}

function CountRow({
  count,
  total,
  tone,
  label,
}: {
  /** Classes needing attention. */
  count: number;
  total: number;
  tone: string;
  label: string;
}) {
  const safeTotal = Math.max(1, total);
  const onTrack = Math.max(0, total - count);
  const pct = (onTrack / safeTotal) * 100;
  const COACH_TONE = "hsl(38 92% 50%)";

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-heading font-extrabold text-[15px] tabular-nums leading-none"
          style={{ color: tone }}
        >
          {onTrack}
        </span>
        <span className="text-[12px] tabular-nums text-muted-foreground">
          of {total} classes on track
        </span>
        {count > 0 && (
          <span
            className="ml-1 inline-flex items-center text-[10.5px] font-bold tabular-nums px-1.5 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: `color-mix(in srgb, ${COACH_TONE} 14%, transparent)`,
              color: COACH_TONE,
            }}
            title={`${count} classes need support on ${label}`}
          >
            {count} need support
          </span>
        )}
        <span
          aria-hidden
          className="ml-auto inline-flex items-center gap-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100"
          style={{ color: tone }}
        >
          View
          <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
        </span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-muted/50 overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: tone }}
          aria-label={`${onTrack} of ${total} classes on track for ${label}; ${count} need support`}
        />
      </div>
    </div>
  );
}
