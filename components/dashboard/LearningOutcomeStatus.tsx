"use client";

import { CheckCircle2, ClipboardList, TrendingUp, Users } from "lucide-react";
import { DemoDataBadge } from "@/components/dashboard/DemoDataBadge";
import { BAND_LABEL, BAND_TONE, BAND_ORDER, type OutcomeBand, type OutcomeSummary } from "@/lib/learningOutcomes";
import { cn } from "@/lib/utils";

const TREND_LABEL: Record<OutcomeSummary["trend"], string> = {
  positive: "Positive Progress",
  holding: "Holding Steady",
  watch: "Needs Attention",
};
const TREND_TONE: Record<OutcomeSummary["trend"], string> = {
  positive: "hsl(142 55% 42%)",
  holding: "hsl(212 90% 58%)",
  watch: "hsl(0 78% 55%)",
};

/** Component 1: "Current Outcome Status" — the headline student-count read,
 * plus the 3 side tiles (Students Needing Support, Moving Up, Placements to
 * Review). Band placements are demo (no real marks/grades data exists —
 * see lib/learningOutcomes.ts); counts/percentages derived from them are
 * real arithmetic over that demo data. */
export function LearningOutcomeStatus({ summary }: { summary: OutcomeSummary }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 items-stretch">
      <section aria-label="Current outcome status" className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">Current Outcome Status</div>
          <DemoDataBadge />
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-[34px] leading-none tabular-nums" style={{ color: TREND_TONE[summary.trend] }}>
              {summary.meeting} of {summary.total}
            </span>
            <span className="text-[14px] font-bold text-muted-foreground">students</span>
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-heading font-extrabold text-[20px] tabular-nums" style={{ color: TREND_TONE[summary.trend] }}>
            {summary.meetingPct}%
          </span>
          <span className="text-[13px] font-semibold text-muted-foreground">meeting expected outcomes</span>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `color-mix(in srgb, ${TREND_TONE[summary.trend]} 14%, transparent)`, color: TREND_TONE[summary.trend] }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {TREND_LABEL[summary.trend]}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-bold text-foreground/80">
            {summary.headline}
          </span>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Students in Secure or Advanced bands</p>
        <div className="mt-2 flex rounded-lg overflow-hidden h-2.5">
          {BAND_ORDER.map((band) => {
            const count = summary.distribution[band];
            const pct = (count / Math.max(1, summary.total)) * 100;
            if (pct <= 0) return null;
            return <span key={band} style={{ width: `${pct}%`, background: BAND_TONE[band] }} />;
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {BAND_ORDER.map((band) => {
            const count = summary.distribution[band];
            if (count <= 0) return null;
            return (
              <span key={band} className="inline-flex items-center gap-1 text-[10.5px]">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BAND_TONE[band] }} aria-hidden />
                <span className="font-bold" style={{ color: BAND_TONE[band] }}>
                  {count}
                </span>
                <span className="text-muted-foreground">{BAND_LABEL[band]}</span>
              </span>
            );
          })}
        </div>
      </section>

      <SideTile
        icon={Users}
        tone="hsl(0 78% 55%)"
        label="Students Needing Support"
        value={summary.needingSupport}
        detail={`${Math.round((summary.needingSupport / Math.max(1, summary.total)) * 100)}% of class`}
        footer="Needs Attention"
        footerTone="hsl(0 78% 55%)"
      />
      <SideTile
        icon={TrendingUp}
        tone="hsl(212 90% 58%)"
        label="Moving Up"
        value={summary.movingUp}
        detail={`${Math.round((summary.movingUp / Math.max(1, summary.total)) * 100)}% of class`}
        footer="Positive Trend"
        footerTone="hsl(212 90% 58%)"
      />
      <SideTile
        icon={ClipboardList}
        tone="hsl(262 60% 60%)"
        label="Placements to Review"
        value={summary.placementsToReview}
        detail="Monthly review"
        footer="Needs confirmation"
        footerTone="hsl(262 60% 60%)"
      />
    </div>
  );
}

function SideTile({
  icon: Icon,
  tone,
  label,
  value,
  detail,
  footer,
  footerTone,
}: {
  icon: typeof Users;
  tone: string;
  label: string;
  value: number;
  detail: string;
  footer: string;
  footerTone: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 flex flex-col">
      <span
        className="h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-2.5 text-[11px] font-bold text-foreground/80 leading-snug">{label}</div>
      <div className="font-heading font-black text-[28px] leading-none tabular-nums mt-1" style={{ color: tone }}>
        {value}
      </div>
      <div className="text-[10.5px] text-muted-foreground mt-1">{detail}</div>
      <div className={cn("mt-auto pt-2 text-[10.5px] font-bold")} style={{ color: footerTone }}>
        {footer}
      </div>
    </section>
  );
}

// Re-exported for callers that only need band metadata without the summary
// shape (e.g. the placements modal).
export type { OutcomeBand };
