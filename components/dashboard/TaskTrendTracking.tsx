"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TaskSnapshotData } from "@/lib/classTask";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ChartMode = "completion" | "initiation" | "persistence";

const MODE_TONE: Record<ChartMode, string> = {
  completion: "hsl(142 55% 42%)",
  initiation: "hsl(38 92% 50%)",
  persistence: "hsl(258 55% 60%)",
};

export function TaskTrendTracking({ snapshot }: { snapshot: TaskSnapshotData }) {
  const [mode, setMode] = useState<ChartMode>("completion");
  const reduce = useReducedMotion();

  const points = snapshot.trend.map((p) => ({
    label: p.label,
    value:
      mode === "completion" ? p.completion : mode === "initiation" ? p.initiation : p.persistence,
  }));

  return (
    <section
      aria-label="Task trend tracking"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Trend tracking</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            How task engagement is moving over time
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Monthly cadence — completion, initiation, and persistence.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5">
          {(
            [
              { k: "completion", l: "Completion" },
              { k: "initiation", l: "Initiation" },
              { k: "persistence", l: "Persistence" },
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

      <BarChart points={points} tone={MODE_TONE[mode]} reduce={!!reduce} />
    </section>
  );
}

function BarChart({
  points,
  tone,
  reduce,
}: {
  points: { label: string; value: number }[];
  tone: string;
  reduce: boolean;
}) {
  const max = Math.max(...points.map((p) => p.value), 100);
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
                  title={`${p.label}: ${p.value}`}
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
