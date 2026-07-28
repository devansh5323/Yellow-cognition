"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  CalendarRange,
  ChevronDown,
  Clock4,
  GraduationCap,
  Play,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { KpiSparkline } from "@/components/dashboard/KpiSparkline";
import { SubMetricTrendChart } from "@/components/dashboard/SubMetricTrendChart";
import {
  STATUS_COPY,
  STATUS_TONE,
  type BreakdownDim,
  type KpiDimensionalHighlight,
  type SchoolKpi,
  type SchoolKpiRosterRow,
  type SubMetric,
  type SubMetricIcon,
} from "@/lib/schoolKpis";
import { SchoolKpiRecommends } from "@/components/school/SchoolKpiRecommends";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const SUB_METRIC_ICON: Record<SubMetricIcon, LucideIcon> = {
  wave: Waves,
  swap: ArrowLeftRight,
  shield: ShieldCheck,
  scale: Scale,
  star: Star,
  play: Play,
  rotate: RotateCcw,
};

type Props = {
  kpi: SchoolKpi;
  /** Roster used to derive Yellow Recommends — top, friction driver, needs-attention. */
  roster: SchoolKpiRosterRow[];
  /** Current page-level breakdown dimension (display-only in mock data). */
  dim?: BreakdownDim;
};

/**
 * Renders the discrete sections of a school KPI detail page:
 * 1. Top row — KPI summary card (8/12) + Yellow Recommends strip (4/12)
 * 2. Sub-metrics card — three bespoke sub-metric tiles
 * 3. "Where to focus support" callout
 */
export function SchoolKpiDetail({ kpi, roster, dim = "class" }: Props) {
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
      {/* Row 1 · Summary (left) + Yellow Recommends (right) */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <KpiSummaryCard kpi={kpi} dim={dim} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <SchoolKpiRecommends kpi={kpi} roster={roster} />
        </div>
      </div>

      <SubMetricsSection kpi={kpi} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Section · KPI summary
 * ───────────────────────────────────────────────────────────── */

const DIM_NOUN: Record<BreakdownDim, string> = {
  class: "class",
  subject: "subject",
  teacher: "teacher",
};

function KpiSummaryCard({ kpi, dim }: { kpi: SchoolKpi; dim: BreakdownDim }) {
  const statusTone = STATUS_TONE[kpi.status];
  const positive = kpi.delta >= 0;
  const highlights = kpi.dimensionalHighlights[dim];

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
                      {kpi.id === "rit" && positive && "+"}
                      <AnimatedNumber
                        value={kpi.value}
                        format={(n) =>
                          kpi.id === "rit" ? n.toFixed(1) : String(n)
                        }
                      />
                    </span>
                    <span className="text-[13px] font-extrabold text-muted-foreground/70 leading-none mb-3">
                      {kpi.unit}
                    </span>
                  </div>

                  {/* Trend badge row */}
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums px-2 h-[22px] rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${positive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)"} 12%, transparent)`,
                        color: positive
                          ? "hsl(142 55% 45%)"
                          : "hsl(0 78% 58%)",
                      }}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {positive ? "+" : ""}
                      {kpi.delta}
                      {kpi.id === "rit" ? "%" : " pts"}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground/70 leading-none">
                      {kpi.deltaLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend + (RIT) principal impact stats */}
          <TrendImpactPanel kpi={kpi} positive={positive} />
        </div>

        <div className="border-t border-border/60" />

        <DimensionalHighlightsRow dim={dim} highlights={highlights} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Trend + Impact panel — right-side of the summary card.
 * For RIT, translates +6.8 min/class into principal-grade outcomes
 * (hours per class per week / per term, % of classes gaining).
 * ───────────────────────────────────────────────────────────── */

function TrendImpactPanel({ kpi, positive }: { kpi: SchoolKpi; positive: boolean }) {
  const showRitImpact = kpi.id === "rit";
  const showTeiImpact = kpi.id === "tei";
  const minPerClass = showRitImpact ? kpi.value : 0;
  // Assume ~20 instructional periods per class per week (4/day × 5 days)
  // and a 12-week term. Numbers stay coherent with the 6.8 min/class headline.
  const hrsPerWeek = showRitImpact ? (minPerClass * 20) / 60 : 0;
  const hrsPerTerm = showRitImpact ? hrsPerWeek * 12 : 0;
  // Coverage stat from school-wide context.
  const coveragePct = 92;

  // For TEI, translate the +11 pt headline into the three component gains
  // (delivery time recovered, load reduction, stability) so the panel reads
  // as principal-grade outcomes instead of a bare score.
  const teiDelivery = showTeiImpact
    ? kpi.subMetrics.find((s) => s.id === "delivery")
    : undefined;
  const teiLoad = showTeiImpact
    ? kpi.subMetrics.find((s) => s.id === "load")
    : undefined;
  const teiStability = showTeiImpact
    ? kpi.subMetrics.find((s) => s.id === "stability")
    : undefined;

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
          Trend · last 10 weeks
        </div>
        <span
          className="text-[10.5px] font-bold tabular-nums px-1.5 h-5 inline-flex items-center rounded-full"
          style={{
            background: `color-mix(in srgb, ${kpi.tone} 12%, transparent)`,
            color: kpi.tone,
          }}
        >
          {positive ? "+" : ""}
          {kpi.delta}
          {kpi.id === "rit" ? "%" : " pts"}
        </span>
      </div>
      <div className="relative">
        <KpiSparkline data={kpi.spark} color={kpi.tone} height={72} smooth />
      </div>

      {showRitImpact ? (
        <div className="relative">
          <div className="border-t border-border/50 -mx-4 mb-3" />
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground inline-flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" style={{ color: kpi.tone }} />
            Translated for your school
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <ImpactStat
              icon={Clock4}
              tone={kpi.tone}
              value={hrsPerWeek.toFixed(1)}
              unit="hrs / wk"
              label="Per class"
            />
            <ImpactStat
              icon={CalendarRange}
              tone={kpi.tone}
              value={Math.round(hrsPerTerm).toString()}
              unit="hrs / term"
              label="Per class"
            />
            <ImpactStat
              icon={Sparkles}
              tone={kpi.tone}
              value={`${coveragePct}%`}
              unit="classes"
              label="Net gain"
            />
          </div>
          <p className="mt-2.5 text-[10.5px] text-muted-foreground leading-snug">
            Estimated from {kpi.value.toFixed(1)} min recovered per class · 20 periods / week · 12-week term
          </p>
        </div>
      ) : showTeiImpact && teiDelivery && teiLoad && teiStability ? (
        <div className="relative">
          <div className="border-t border-border/50 -mx-4 mb-3" />
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground inline-flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" style={{ color: kpi.tone }} />
            Translated for your school
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <ImpactStat
              icon={Clock4}
              tone={kpi.tone}
              value={`+${teiDelivery.delta.toFixed(1)}`}
              unit="min / class"
              label="Time recovered"
            />
            <ImpactStat
              icon={Scale}
              tone={kpi.tone}
              value={`${teiLoad.delta > 0 ? "+" : "−"}${Math.abs(teiLoad.delta)}`}
              unit="pts load"
              label="Teacher effort"
            />
            <ImpactStat
              icon={Waves}
              tone={kpi.tone}
              value={`${teiStability.value}`}
              unit="/ 100 flow"
              label="Lesson stability"
            />
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col gap-2">
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            {kpi.band ?? `${positive ? "+" : ""}${kpi.delta} ${kpi.deltaLabel}`}
          </p>
          {kpi.bands && (
            <>
              <div className="border-t border-border/50 -mx-4" />
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground inline-flex items-center gap-1.5">
                <Scale className="h-3 w-3" style={{ color: kpi.tone }} />
                Readiness mix
              </div>
              <BandBar bands={kpi.bands} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ImpactStat({
  icon: Icon,
  tone,
  value,
  unit,
  label,
}: {
  icon: LucideIcon;
  tone: string;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div
      className="rounded-xl px-2.5 py-2 flex flex-col gap-0.5"
      style={{
        background: `color-mix(in srgb, ${tone} 7%, transparent)`,
        border: `1px solid color-mix(in srgb, ${tone} 18%, transparent)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3" style={{ color: tone }} strokeWidth={2.4} />
        <span
          className="font-heading font-black tabular-nums text-[16px] leading-none"
          style={{ color: tone }}
        >
          {value}
        </span>
      </div>
      <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/90 leading-tight">
        {unit}
      </span>
      <span className="text-[10px] text-muted-foreground/80 leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Best · Needs attention — filter-aware tiles inside the summary card.
 * ───────────────────────────────────────────────────────────── */

function DimensionalHighlightsRow({
  dim,
  highlights,
}: {
  dim: BreakdownDim;
  highlights: { best: KpiDimensionalHighlight; worst: KpiDimensionalHighlight };
}) {
  const noun = DIM_NOUN[dim];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="premium-eyebrow">Performance by {noun}</div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground/80">
          Reflects current filter
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <HighlightTile
          variant="best"
          dimNoun={noun}
          entry={highlights.best}
        />
        <HighlightTile
          variant="worst"
          dimNoun={noun}
          entry={highlights.worst}
        />
      </div>
    </div>
  );
}

function HighlightTile({
  variant,
  dimNoun,
  entry,
}: {
  variant: "best" | "worst";
  dimNoun: string;
  entry: KpiDimensionalHighlight;
}) {
  const tone =
    variant === "best" ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)";
  const eyebrow =
    variant === "best" ? `Top ${dimNoun}` : `${dimNoun} needing attention`;
  const Icon = variant === "best" ? Sparkles : AlertTriangle;
  const positive = entry.delta >= 0;

  return (
    <article
      className="relative rounded-2xl border bg-card/60 backdrop-blur p-4 flex flex-col gap-2 overflow-hidden"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 22%, var(--border))`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 6%, transparent) 0%, color-mix(in srgb, ${tone} 0%, transparent) 60%)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: tone }}
        >
          {eyebrow}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-heading font-extrabold text-[15px] leading-tight truncate">
            {entry.name}
          </h4>
          {entry.meta && (
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">
              {entry.meta}
            </p>
          )}
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span
            className="font-heading font-black tabular-nums text-[26px] md:text-[28px] leading-none"
            style={{ color: tone }}
          >
            {entry.value}
          </span>
          <span className="text-[11px] font-extrabold text-muted-foreground/80 leading-none">
            {entry.unit}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span
          className="inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums px-1.5 h-5 rounded-full"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {positive ? "+" : ""}
          {entry.delta}%
        </span>
        <span className="text-[10.5px] font-semibold text-muted-foreground leading-none">
          {entry.deltaLabel}
        </span>
      </div>

      <p className="text-[11.5px] text-muted-foreground leading-snug mt-1">
        {entry.reason}
      </p>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Section · Sub-metrics (bespoke per-card content)
 * ───────────────────────────────────────────────────────────── */

function SubMetricsSection({ kpi }: { kpi: SchoolKpi }) {
  // Shared expand state — toggling any sub-metric card opens/closes the row together.
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);

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
            <SubMetricCard
              key={sm.id}
              sm={sm}
              tone={kpi.tone}
              index={i}
              expanded={expanded}
              onToggle={toggle}
            />
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
  expanded,
  onToggle,
}: {
  sm: SubMetric;
  tone: string;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const positiveRaw = sm.delta >= 0;
  const positive = sm.negativeIsGood ? !positiveRaw : positiveRaw;
  const deltaTone = positive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)";
  const statusTone = sm.statusTone ?? "hsl(200 60% 50%)";
  const isCompare = sm.viz?.kind === "compare";
  const compareValueDisplay =
    sm.viz?.kind === "compare" ? sm.viz.valueDisplay : undefined;
  const compareSummary =
    sm.viz?.kind === "compare" ? sm.viz.summaryLine : undefined;
  const headlineTone = isCompare ? deltaTone : tone;

  // Suppress arrow when the deltaText already carries an explicit sign.
  const showDeltaArrow =
    sm.deltaText && !/^[+\-−]/.test(sm.deltaText.trim());

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.05 * index }}
      className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 md:p-5 flex flex-col gap-3 h-full"
    >
      {/* Title row — toggles the collapsible body for all three cards in sync */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`submetric-${sm.id}-body`}
        className="flex items-center gap-2.5 text-left w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {sm.headerIcon && (
          <SubMetricIconBadge icon={sm.headerIcon} tone={statusTone} size="md" />
        )}
        <h4 className="flex-1 min-w-0 font-heading font-extrabold text-[14.5px] leading-tight">
          {sm.label}
        </h4>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          strokeWidth={2.4}
        />
      </button>

      {/* Always-visible: value block + caption + delta + (compare summary) + status pill */}
      <ValueBlock
        sm={sm}
        headlineTone={headlineTone}
        compareValueDisplay={compareValueDisplay}
      />

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

      {isCompare && compareSummary && (
        <p className="text-[12.5px] font-heading font-extrabold leading-snug">
          {compareSummary}
        </p>
      )}

      {sm.statusLabel && (
        <StatusPill
          label={sm.statusLabel}
          tone={statusTone}
          icon={sm.statusIcon}
        />
      )}

      {/* Collapsible · part 1 — viz (accordion height animation).
          Sits right after the status pill in its natural flow position. */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="submetric-viz"
            id={`submetric-${sm.id}-body`}
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: "hidden" }}
            className="-mx-4 md:-mx-5 px-4 md:px-5 flex flex-col gap-3"
          >
            {isCompare ? (
              <>
                <div className="border-t border-border/50 -mx-4 md:-mx-5" />
                {sm.viz?.kind === "compare" && (
                  <CompareBars baseline={sm.viz.baseline} now={sm.viz.now} />
                )}
              </>
            ) : (
              <>
                {/* Divider only when there's a viz below */}
                {(sm.viz || sm.bands) && (
                  <div className="border-t border-border/50 -mx-4 md:-mx-5" />
                )}

                {sm.viz?.kind === "components" && (
                  <ComponentsBar items={sm.viz.items} />
                )}
                {sm.viz?.kind === "phases" && <PhaseTiles items={sm.viz.items} />}

                {/* Fallback for sub-metrics without bespoke viz (TEI/LRS):
                    show a trend chart with Y/X ticks + baseline reference so
                    principals can read the trajectory without external context. */}
                {!sm.viz && (
                  <>
                    <SubMetricTrendChart
                      data={sm.spark}
                      baseline={sm.value - sm.delta}
                      color={tone}
                    />
                    {sm.bands && <BandBar bands={sm.bands} />}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible · part 2 — breakdown footer.
          `mt-auto` keeps it pinned to the bottom of the article so all three
          cards' Top class / Needs attention rows align even when their viz
          content has different heights. */}
      <AnimatePresence initial={false}>
        {expanded && sm.breakdown && (
          <motion.div
            key="submetric-footer"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: reduce ? 0 : 0.05 }}
            style={{ overflow: "hidden" }}
            className="mt-auto"
          >
            <SubMetricBreakdownFooter breakdown={sm.breakdown.class} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* Per-sub-metric "Top class · Needs attention" strip — gives every
 * card a directly-actionable read-out without needing the user to
 * scan the roster table below. */
function SubMetricBreakdownFooter({
  breakdown,
}: {
  breakdown: { best: { name: string; meta?: string; value: string }; worst: { name: string; meta?: string; value: string } };
}) {
  const goodTone = "hsl(142 55% 45%)";
  const badTone = "hsl(0 78% 58%)";
  return (
    <div className="mt-auto -mx-4 md:-mx-5 px-4 md:px-5 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
      <div className="min-w-0">
        <div
          className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.10em]"
          style={{ color: goodTone }}
        >
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2.6} />
          Top class
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-1.5">
          <span className="font-heading font-extrabold text-[12.5px] leading-tight truncate">
            {breakdown.best.name}
          </span>
          <span
            className="font-heading font-black tabular-nums text-[13px] leading-none shrink-0"
            style={{ color: goodTone }}
          >
            {breakdown.best.value}
          </span>
        </div>
        {breakdown.best.meta && (
          <div className="text-[10px] text-muted-foreground/80 truncate leading-tight mt-0.5">
            {breakdown.best.meta}
          </div>
        )}
      </div>
      <div className="min-w-0 border-l border-border/40 pl-3">
        <div
          className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.10em]"
          style={{ color: badTone }}
        >
          <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.6} />
          Needs attention
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-1.5">
          <span className="font-heading font-extrabold text-[12.5px] leading-tight truncate">
            {breakdown.worst.name}
          </span>
          <span
            className="font-heading font-black tabular-nums text-[13px] leading-none shrink-0"
            style={{ color: badTone }}
          >
            {breakdown.worst.value}
          </span>
        </div>
        {breakdown.worst.meta && (
          <div className="text-[10px] text-muted-foreground/80 truncate leading-tight mt-0.5">
            {breakdown.worst.meta}
          </div>
        )}
      </div>
    </div>
  );
}

function ValueBlock({
  sm,
  headlineTone,
  compareValueDisplay,
}: {
  sm: SubMetric;
  headlineTone: string;
  compareValueDisplay?: string;
}) {
  if (compareValueDisplay) {
    return (
      <div className="flex items-baseline gap-1.5 leading-none">
        <span
          className="font-heading font-black tabular-nums text-[34px] md:text-[38px] leading-[0.9]"
          style={{ color: headlineTone }}
        >
          {compareValueDisplay}
        </span>
      </div>
    );
  }
  const hasDecimals = !Number.isInteger(sm.value);
  return (
    <div className="flex items-baseline gap-1.5 leading-none">
      <span
        className="font-heading font-black tabular-nums text-[34px] md:text-[38px] leading-[0.9]"
        style={{ color: headlineTone }}
      >
        <AnimatedNumber
          value={sm.value}
          decimals={hasDecimals ? 1 : undefined}
        />
      </span>
      {sm.unit && (
        <span className="text-[13px] font-extrabold text-muted-foreground/80 leading-none">
          {sm.unit}
        </span>
      )}
    </div>
  );
}

function StatusPill({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: string;
  icon?: SubMetricIcon;
}) {
  const Icon = icon ? SUB_METRIC_ICON[icon] : null;
  return (
    <span
      className="self-start inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 h-6 rounded-full whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
        color: tone,
        border: `1px solid color-mix(in srgb, ${tone} 28%, transparent)`,
      }}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.4} />}
      {label}
    </span>
  );
}

function SubMetricIconBadge({
  icon,
  tone,
  size = "md",
}: {
  icon: SubMetricIcon;
  tone: string;
  size?: "sm" | "md";
}) {
  const Icon = SUB_METRIC_ICON[icon];
  const dim = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconDim = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      aria-hidden
      className={`${dim} rounded-full inline-flex items-center justify-center shrink-0`}
      style={{
        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
        color: tone,
      }}
    >
      <Icon className={iconDim} strokeWidth={2.4} />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Viz · Components stacked bar (IFI)
 * ───────────────────────────────────────────────────────────── */

function ComponentsBar({
  items,
}: {
  items: { label: string; pct: number; tone: string }[];
}) {
  return (
    <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            {/* Color dot */}
            <span
              className="h-2.5 w-2.5 rounded-[3px] shrink-0"
              style={{ background: it.tone }}
            />

            {/* Label + mini bar */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-foreground truncate">
                  {it.label}
                </span>
                <span
                  className="text-[12.5px] font-heading font-black tabular-nums leading-none shrink-0 ml-2"
                  style={{ color: it.tone }}
                >
                  {it.pct}%
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="h-1 w-full rounded-full bg-muted/70 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${it.pct}%`, background: it.tone }}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Viz · Phase tiles (Transition Efficiency)
 * ───────────────────────────────────────────────────────────── */

function PhaseTiles({
  items,
}: {
  items: {
    label: string;
    icon: SubMetricIcon;
    pct: number;
    tone: string;
  }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const Icon = SUB_METRIC_ICON[it.icon];
        return (
          <div key={it.label} className="flex items-center gap-3">
            {/* Tinted icon swatch — mirrors the color-dot in ComponentsBar */}
            <span
              className="h-5 w-5 rounded-md inline-flex items-center justify-center shrink-0"
              style={{
                background: `color-mix(in srgb, ${it.tone} 14%, transparent)`,
                color: it.tone,
              }}
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
            </span>

            {/* Label + mini bar */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-foreground truncate">
                  {it.label}
                </span>
                <span
                  className="text-[12.5px] font-heading font-black tabular-nums leading-none shrink-0 ml-2"
                  style={{ color: it.tone }}
                >
                  {it.pct}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted/70 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${it.pct}%`, background: it.tone }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Viz · Baseline → Now rows (Disruption Reduction)
 *
 * Matches the row layout used by ComponentsBar / PhaseTiles:
 * color swatch · label · value · thin tone-colored progress bar.
 * Bar widths are proportional to the larger of the two values,
 * so a smaller "Now" bar visually reads as the reduction.
 * ───────────────────────────────────────────────────────────── */

function CompareBars({ baseline, now }: { baseline: number; now: number }) {
  const max = Math.max(baseline, now, 0.0001);
  const baselineTone = "hsl(220 10% 65%)";
  const nowTone = "hsl(142 55% 50%)";

  const rows = [
    {
      label: "Baseline",
      value: baseline,
      pct: (baseline / max) * 100,
      tone: baselineTone,
      valueColor: "hsl(220 10% 35%)",
    },
    {
      label: "Now",
      value: now,
      pct: (now / max) * 100,
      tone: nowTone,
      valueColor: nowTone,
    },
  ];

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          {/* Color swatch — mirrors ComponentsBar */}
          <span
            className="h-2.5 w-2.5 rounded-[3px] shrink-0"
            style={{ background: r.tone }}
          />

          {/* Label + mini bar */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-foreground truncate">
                {r.label}
              </span>
              <span
                className="text-[12.5px] font-heading font-black tabular-nums leading-none shrink-0 ml-2"
                style={{ color: r.valueColor }}
              >
                {r.value.toFixed(1)}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted/70 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.pct}%`, background: r.tone }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * BandBar — kept for TEI/LRS sub-metrics that carry bands data.
 * ───────────────────────────────────────────────────────────── */

function BandBar({
  bands,
}: {
  bands: NonNullable<SubMetric["bands"]>;
}) {
  return (
    <div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        {bands.map((b) => (
          <span
            key={b.label}
            className="h-full"
            style={{ flex: `${b.pct} 1 0`, background: b.tone }}
            title={`${b.label}: ${b.pct}%`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
        {bands.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-sm"
              style={{ background: b.tone }}
            />
            <span className="font-semibold text-foreground/80">{b.label}</span>
            <span className="tabular-nums">{b.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

