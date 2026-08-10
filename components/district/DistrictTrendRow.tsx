"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, AlertTriangle, Eye, Shield, ArrowRight, type LucideIcon } from "lucide-react";
import { districtTrends } from "@/lib/districtData";
import { wavePoints, Sparkline, BarSparkline } from "@/components/dashboard/Sparkline";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICON: Record<string, LucideIcon> = {
  growth: TrendingUp,
  alert: AlertTriangle,
  pattern: Eye,
  strength: Shield,
};

const ACTION_LABEL: Record<string, string> = {
  growth: "See contributing schools",
  alert: "View affected schools",
  pattern: "Review pattern",
  strength: "View strength drivers",
};

export function DistrictTrendRow() {
  const reduce = useReducedMotion();
  const trends = useMemo(() => districtTrends(), []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Trends"
    >
      <div className="premium-eyebrow">
        <span>District Trends</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trends.map((trend, idx) => {
            const Icon = ICON[trend.id];
            return (
            <Banner
              key={trend.id}
              tone={trend.tone}
              eyebrow={trend.eyebrow}
              icon={<Icon className="h-4 w-4" />}
              headline={trend.headline}
              detail={trend.detail}
              action={ACTION_LABEL[trend.id]}
              chart={
                trend.id === "alert" ? (
                  <BarSparkline data={wavePoints(70, idx)} tone={trend.tone} />
                ) : (
                  <Sparkline data={wavePoints(75, idx)} tone={trend.tone} area />
                )
              }
            />
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function Banner({
  tone,
  eyebrow,
  icon,
  headline,
  detail,
  action,
  chart,
}: {
  tone: string;
  eyebrow: string;
  icon: ReactNode;
  headline: string;
  detail: string;
  action: string;
  chart: ReactNode;
}) {
  return (
    <article
      className="relative rounded-2xl border overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
      style={{
        background: `color-mix(in srgb, ${tone} 6%, var(--card))`,
        borderColor: `color-mix(in srgb, ${tone} 24%, transparent)`,
      }}
    >
      <div className="p-5 flex-1">
        <span
          className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
        >
          {icon}
        </span>

        <div className="flex items-center gap-2 flex-wrap mt-3.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: tone }}>
            {eyebrow}
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-[14.5px] leading-snug mt-1.5">{headline}</h3>
        <p className="text-[12px] text-muted-foreground mt-1.5 leading-snug">{detail}</p>

        <div className="mt-4">{chart}</div>
      </div>

      <div className="px-5 py-3.5 border-t" style={{ borderColor: `color-mix(in srgb, ${tone} 16%, transparent)` }}>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
          style={{ color: tone }}
        >
          {action}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}
