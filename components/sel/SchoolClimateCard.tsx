"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  areaOverview,
  byGradeOverview,
  topNeed,
  strongestArea,
  climateCoverage,
  SCHOOL_CLIMATE_AREAS,
} from "@/lib/selClimate";
import { NEEDS_BAND_LABEL, NEEDS_BAND_TONE, type Trend } from "@/lib/selNeeds";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ViewKey = "area" | "grade";

const TREND_ICON: Record<Trend, typeof TrendingUp> = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_TONE: Record<Trend, string> = {
  up: "hsl(142 55% 42%)",
  down: "hsl(0 78% 56%)",
  flat: "var(--muted-foreground)",
};

export function SchoolClimateCard() {
  const reduce = useReducedMotion();
  const [view, setView] = useState<ViewKey>("area");

  const areas = useMemo(() => areaOverview(), []);
  const grades = useMemo(() => byGradeOverview(), []);
  const need = useMemo(() => topNeed(), []);
  const strongest = useMemo(() => strongestArea(), []);
  const coverage = useMemo(() => climateCoverage(), []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="School Climate and SEL Needs"
      className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <Compass className="h-3 w-3" />
            <span>School Climate &amp; SEL Needs</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where needs are concentrated, where strengths hold
          </h3>
        </header>

        <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1 shrink-0">
          {(["area", "grade"] as ViewKey[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "h-7 rounded-full px-3 text-[11px] font-bold transition-colors whitespace-nowrap",
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "area" ? "By SEL Area" : "By Grade"}
            </button>
          ))}
        </div>
      </div>

      {view === "area" ? (
        <ul className="space-y-1.5">
          {areas.map((row) => {
            const TrendIcon = TREND_ICON[row.trend];
            return (
              <li
                key={row.competency}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
              >
                <span className="flex-1 min-w-0 font-semibold text-[12.5px]">{row.competency}</span>
                {row.available ? (
                  <>
                    <TrendIcon className="h-3.5 w-3.5 shrink-0" style={{ color: TREND_TONE[row.trend] }} />
                    <span className="text-[10.5px] text-muted-foreground shrink-0 hidden sm:inline">
                      {row.coveragePct}% coverage
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${NEEDS_BAND_TONE[row.band!]} 14%, transparent)`,
                        color: NEEDS_BAND_TONE[row.band!],
                      }}
                    >
                      {NEEDS_BAND_LABEL[row.band!]}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground shrink-0">
                    Not tracked yet
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-1.5">
          {grades.map((row) => (
            <li
              key={row.grade}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
            >
              <span className="flex-1 min-w-0 font-semibold text-[12.5px]">{row.grade}</span>
              <span className="text-[10.5px] text-muted-foreground shrink-0">{row.coveragePct}% coverage</span>
              {row.band ? (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${NEEDS_BAND_TONE[row.band]} 14%, transparent)`,
                    color: NEEDS_BAND_TONE[row.band],
                  }}
                >
                  {NEEDS_BAND_LABEL[row.band]}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground shrink-0">
                  Not tracked yet
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {need && (
          <div className="rounded-xl border border-[hsl(0_78%_56%/0.25)] bg-[hsl(0_78%_56%/0.05)] p-3.5">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-[hsl(0_78%_56%)] mb-1">Top SEL Need</div>
            <div className="font-heading font-bold text-[13px]">{need.competency}</div>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{need.sentence}</p>
            <Link
              href={`/sel/needs?competency=${encodeURIComponent(need.competency)}`}
              className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[hsl(0_78%_56%)]"
            >
              Explore pattern
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {strongest && (
          <div className="rounded-xl border border-[hsl(142_55%_45%/0.25)] bg-[hsl(142_55%_45%/0.05)] p-3.5">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-[hsl(142_55%_38%)] mb-1">Strongest Area</div>
            <div className="font-heading font-bold text-[13px]">{strongest.competency}</div>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{strongest.sentence}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground/80">School Climate Coverage: {coverage.overallPct}%</span> — based
          on student pulses and teacher observations across {SCHOOL_CLIMATE_AREAS.length} SEL areas and{" "}
          {coverage.byGrade.length} grade{coverage.byGrade.length === 1 ? "" : "s"}.
        </p>
        <Link href="/sel/needs" className="inline-flex items-center gap-1 text-[11px] font-bold text-primary shrink-0">
          Explore full insights
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.section>
  );
}
