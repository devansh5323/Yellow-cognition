"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BEHAVIOR_STATUS_LABEL,
  BEHAVIOR_STATUS_TONE,
  statusFromScore,
  type BehaviorSnapshotData,
  type BehaviorStatus,
} from "@/lib/classBehavior";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DISTRIBUTION_ORDER: BehaviorStatus[] = ["strong", "stable", "reinforcement", "support"];

type ChartMode = "disruptions" | "time" | "distribution";

export function BehaviorTrendTracking({ snapshot }: { snapshot: BehaviorSnapshotData }) {
  const [mode, setMode] = useState<ChartMode>("disruptions");
  const reduce = useReducedMotion();

  const distribution = useMemo(() => buildDistribution(snapshot), [snapshot]);

  return (
    <section
      aria-label="Behavior trend tracking"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Trend tracking</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            How behaviour is moving over time
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Monthly cadence — disruptions, time gained, and the shift in status bands.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
          {(
            [
              { k: "disruptions", l: "Disruptions" },
              { k: "time", l: "Time gained" },
              { k: "distribution", l: "Distribution" },
            ] as const
          ).map((m) => (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
              className={cn(
                "px-3 h-7 rounded-full text-[11px] font-bold transition-colors",
                mode === m.k
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.l}
            </button>
          ))}
        </div>
      </header>

      {mode === "disruptions" && (
        <BarChart
          points={snapshot.trend.map((p) => ({ label: p.label, value: p.disruptions }))}
          maxOverride={Math.max(...snapshot.trend.map((p) => p.disruptions), 10)}
          tone="hsl(0 78% 56%)"
          suffix=" / class"
          reduce={!!reduce}
        />
      )}

      {mode === "time" && (
        <BarChart
          points={snapshot.trend.map((p) => ({ label: p.label, value: p.timeGained }))}
          maxOverride={Math.max(...snapshot.trend.map((p) => p.timeGained), 60)}
          tone="hsl(142 55% 42%)"
          suffix=" min"
          reduce={!!reduce}
        />
      )}

      {mode === "distribution" && (
        <DistributionChart distribution={distribution} reduce={!!reduce} />
      )}
    </section>
  );
}

function BarChart({
  points,
  maxOverride,
  tone,
  suffix,
  reduce,
}: {
  points: { label: string; value: number }[];
  maxOverride: number;
  tone: string;
  suffix: string;
  reduce: boolean;
}) {
  const max = Math.max(maxOverride, 1);
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-4">
      <ul className="flex items-end gap-2 sm:gap-3 h-[160px]">
        {points.map((p, i) => {
          const ratio = p.value / max;
          return (
            <li
              key={p.label + i}
              className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full"
            >
              <div className="w-full flex-1 rounded-md bg-muted/30 overflow-hidden flex items-end">
                <motion.span
                  initial={reduce ? undefined : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                  className="block w-full origin-bottom rounded-md"
                  style={{
                    height: `${Math.max(ratio * 100, 6)}%`,
                    background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 92%, white 8%), ${tone})`,
                    boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.18)",
                  }}
                  title={`${p.label}: ${p.value}${suffix}`}
                />
              </div>
              <span className="text-[10.5px] font-bold tabular-nums" style={{ color: tone }}>
                {p.value}
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {p.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type DistributionPoint = {
  label: string;
  counts: Record<BehaviorStatus, number>;
};

function buildDistribution(snapshot: BehaviorSnapshotData): DistributionPoint[] {
  const total = Math.max(1, snapshot.total);
  // Synth a 6-month band shift from the score trend so the bars tell the
  // same story as the score line above. Higher score → more strong/stable.
  return snapshot.trend.map((p) => {
    const counts: Record<BehaviorStatus, number> = {
      strong: 0,
      stable: 0,
      reinforcement: 0,
      support: 0,
    };
    // Build a synthetic per-student distribution by jitter around the month's
    // composite score so the stacked bar moves naturally with the trend.
    for (let i = 0; i < total; i++) {
      const offset = ((i * 7) % 21) - 10;
      const score = Math.max(0, Math.min(100, p.score + offset));
      counts[statusFromScore(score)] += 1;
    }
    return { label: p.label, counts };
  });
}

function DistributionChart({
  distribution,
  reduce,
}: {
  distribution: DistributionPoint[];
  reduce: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-4">
      <ul className="flex items-end gap-2 sm:gap-3 h-[160px]">
        {distribution.map((p, i) => {
          const total = Math.max(
            1,
            p.counts.strong + p.counts.stable + p.counts.reinforcement + p.counts.support,
          );
          return (
            <li
              key={p.label + i}
              className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full"
            >
              <div className="w-full flex-1 rounded-md bg-muted/30 overflow-hidden flex flex-col">
                {DISTRIBUTION_ORDER.map((band) => {
                  const v = p.counts[band];
                  const pct = (v / total) * 100;
                  return (
                    <motion.span
                      key={band}
                      initial={reduce ? undefined : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.03 * i, duration: 0.45, ease: EASE }}
                      className="block origin-top"
                      style={{
                        height: `${pct}%`,
                        background: BEHAVIOR_STATUS_TONE[band],
                      }}
                      title={`${BEHAVIOR_STATUS_LABEL[band]}: ${v}`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {p.label}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {DISTRIBUTION_ORDER.map((band) => (
          <span key={band} className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: BEHAVIOR_STATUS_TONE[band] }}
              aria-hidden
            />
            <span className="text-foreground/80">{BEHAVIOR_STATUS_LABEL[band]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
