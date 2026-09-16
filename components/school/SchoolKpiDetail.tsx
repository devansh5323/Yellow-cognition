"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { KpiSparkline } from "@/components/dashboard/KpiSparkline";
import { NotEnoughData, NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import {
  STATUS_COPY,
  STATUS_TONE,
  type SchoolKpi,
  type SubMetric,
} from "@/lib/schoolKpis";
import { SchoolKpiRecommends } from "@/components/school/SchoolKpiRecommends";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Props = {
  kpi: SchoolKpi;
};

/**
 * Renders the discrete sections of a school KPI detail page:
 * 1. Top row — KPI summary card (8/12) + Yellow Recommends strip (4/12)
 * 2. Sub-metrics card — one simple tile per real sub-metric
 *
 * When the KPI has no real signal yet (`hasData: false` — currently true for
 * Recovered Instructional Time and Teacher Efficiency Index, since neither has
 * any real tracking behind it), the whole hero collapses to a single honest
 * "not enough data yet" panel instead of a fabricated summary.
 */
export function SchoolKpiDetail({ kpi }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={kpi.id}
      initial={reduce ? undefined : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
      data-tour-target="school-kpi-detail"
    >
      {!kpi.hasData ? (
        <section
          aria-label={`${kpi.title} summary`}
          className="premium-elevated rounded-[22px] overflow-hidden"
        >
          <div className="p-5 md:p-6">
            <NotEnoughDataPanel
              title={`Not enough data yet for ${kpi.title}`}
              description={kpi.meaning}
            />
          </div>
        </section>
      ) : (
        <>
          {/* Row 1 · Summary (left) + Yellow Recommends (right) */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-8">
              <KpiSummaryCard kpi={kpi} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <SchoolKpiRecommends kpi={kpi} />
            </div>
          </div>

          {kpi.subMetrics.length > 0 && <SubMetricsSection kpi={kpi} />}
        </>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Section · KPI summary
 * ───────────────────────────────────────────────────────────── */

function KpiSummaryCard({ kpi }: { kpi: SchoolKpi }) {
  const statusTone = kpi.status ? STATUS_TONE[kpi.status] : "hsl(230 10% 55%)";

  return (
    <section
      aria-label={`${kpi.title} summary`}
      className="relative premium-elevated rounded-[22px] overflow-hidden h-full"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${kpi.tone}, transparent)`,
        }}
      />

      {/* Soft tone aura across the entire card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 70% at 18% 60%, color-mix(in srgb, ${kpi.tone} 8%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative p-5 md:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-5 items-center">
          <div className="min-w-0 relative">
            <div className="relative">
              {kpi.status && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.10em] px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${statusTone} 14%, transparent)`,
                      color: statusTone,
                      border: `1px solid color-mix(in srgb, ${statusTone} 28%, transparent)`,
                    }}
                  >
                    {STATUS_COPY[kpi.status]}
                  </span>
                </div>
              )}
              <h2 className="font-heading font-extrabold text-[22px] md:text-[26px] leading-tight mt-2">
                {kpi.title}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-2 max-w-[640px] leading-snug">
                {kpi.meaning}
              </p>

              <div className="mt-6">
                {/* Soft tonal score plate behind the value */}
                <div
                  className="relative inline-flex flex-col gap-1 rounded-[20px] px-4 py-3 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${kpi.tone} 7%, transparent), transparent)`,
                    border: `1px solid color-mix(in srgb, ${kpi.tone} 14%, transparent)`,
                    boxShadow: `inset 0 1px 0 0 color-mix(in srgb, ${kpi.tone} 10%, transparent)`,
                  }}
                >
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className="font-heading font-black tabular-nums leading-[0.85] text-[60px] md:text-[72px] tracking-tight"
                      style={{
                        color: kpi.tone,
                        textShadow: `0 1px 0 color-mix(in srgb, ${kpi.tone} 18%, transparent)`,
                      }}
                    >
                      {kpi.value != null ? <AnimatedNumber value={kpi.value} /> : "—"}
                    </span>
                    <span className="text-[13px] font-extrabold text-muted-foreground/70 leading-none mb-3">
                      {kpi.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground/70 leading-none">
                      {kpi.deltaLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TrendImpactPanel kpi={kpi} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Trend panel — right-side of the summary card. There is no real
 * week-over-week history yet, so this shows the (flat) sparkline and the
 * honest deltaLabel rather than any invented "translated for your school"
 * projection.
 * ───────────────────────────────────────────────────────────── */

function TrendImpactPanel({ kpi }: { kpi: SchoolKpi }) {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-4 flex flex-col gap-3 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 60% at 100% 0%, color-mix(in srgb, ${kpi.tone} 9%, transparent), transparent 60%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground inline-flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" style={{ color: kpi.tone }} />
          Trend
        </div>
      </div>
      <div className="relative">
        <KpiSparkline data={kpi.spark} color={kpi.tone} height={72} smooth />
      </div>
      <p className="relative text-[11.5px] text-muted-foreground leading-snug">
        {kpi.deltaLabel}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Section · Sub-metrics (simple, no per-class/subject/teacher breakdown —
 * there's only one real class, so there's nothing left to break down).
 * ───────────────────────────────────────────────────────────── */

function SubMetricsSection({ kpi }: { kpi: SchoolKpi }) {
  const count = kpi.subMetrics.length;
  const countWord = count === 2 ? "two" : count === 3 ? "three" : `${count}`;

  return (
    <section
      aria-label="Sub-metrics breakdown"
      className="premium-elevated rounded-[22px] overflow-hidden"
    >
      <header className="px-5 md:px-6 py-4 border-b border-border/70">
        <div className="premium-eyebrow">Sub-metrics</div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
          What makes up {kpi.title}
        </h3>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">
          The {countWord} signals that compose the headline score
        </p>
      </header>

      <div className="p-5 md:p-6">
        <div
          className={`grid grid-cols-1 gap-3 items-stretch ${count === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
        >
          {kpi.subMetrics.map((sm, i) => (
            <SubMetricCard key={sm.id} sm={sm} tone={kpi.tone} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SubMetricCard({
  sm,
  tone,
  index,
}: {
  sm: SubMetric;
  tone: string;
  index: number;
}) {
  const reduce = useReducedMotion();
  const positiveRaw = sm.delta >= 0;
  const positive = sm.negativeIsGood ? !positiveRaw : positiveRaw;
  const deltaTone = positive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)";
  const statusTone = sm.statusTone ?? "hsl(200 60% 50%)";

  // Suppress arrow when the deltaText already carries an explicit sign.
  const showDeltaArrow = sm.deltaText && !/^[+\-−]/.test(sm.deltaText.trim());

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.05 * index }}
      className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 md:p-5 flex flex-col gap-3 h-full"
    >
      <h4 className="font-heading font-extrabold text-[14.5px] leading-tight">
        {sm.label}
      </h4>
      <p className="text-[11.5px] text-muted-foreground leading-snug -mt-1">
        {sm.description}
      </p>

      {sm.value != null ? (
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className="font-heading font-black tabular-nums text-[34px] md:text-[38px] leading-[0.9]"
            style={{ color: tone }}
          >
            <AnimatedNumber
              value={sm.value}
              decimals={Number.isInteger(sm.value) ? undefined : 1}
            />
          </span>
          {sm.unit && (
            <span className="text-[13px] font-extrabold text-muted-foreground/80 leading-none">
              {sm.unit}
            </span>
          )}
        </div>
      ) : (
        <NotEnoughData />
      )}

      {sm.caption && (
        <p className="text-[11.5px] text-muted-foreground leading-snug -mt-1">
          {sm.caption}
        </p>
      )}

      {sm.deltaText && (
        <p
          className="text-[11.5px] font-semibold leading-snug inline-flex items-center gap-1"
          style={{ color: deltaTone }}
        >
          {showDeltaArrow ? (
            positiveRaw ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )
          ) : null}
          {sm.deltaText}
        </p>
      )}

      {sm.statusLabel && <StatusPill label={sm.statusLabel} tone={statusTone} />}
    </motion.article>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="self-start inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 h-6 rounded-full whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
        color: tone,
        border: `1px solid color-mix(in srgb, ${tone} 28%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
