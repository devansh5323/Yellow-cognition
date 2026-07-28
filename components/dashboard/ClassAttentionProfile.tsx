"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  DOMAIN_INTERVENTIONS,
  studentAttentionDomains,
  studentsByAttentionDomain,
} from "@/data/mockData";
import type { FocusDomainKey, FocusDomainStat } from "@/lib/classFocus";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function statusFor(score: number): { label: string; tone: string } {
  if (score >= 78) return { label: "Strong", tone: "hsl(142 55% 42%)" };
  if (score >= 65) return { label: "Stable", tone: "hsl(212 55% 45%)" };
  if (score >= 55) return { label: "Watch", tone: "hsl(38 92% 48%)" };
  return { label: "Needs Support", tone: "hsl(0 78% 52%)" };
}

export function ClassAttentionProfile({ domains }: { domains: FocusDomainStat[] }) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<FocusDomainKey | null>(null);

  const activeMeta = useMemo(
    () => (openKey ? (domains.find((d) => d.key === openKey) ?? null) : null),
    [openKey, domains],
  );
  const activeStudents = useMemo(
    () => (openKey ? studentsByAttentionDomain(openKey) : []),
    [openKey],
  );
  const activeInterventions = openKey ? DOMAIN_INTERVENTIONS[openKey] : [];

  return (
    <section
      aria-label="Class attention profile"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Sub-domain breakdown</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Attention profile of the class
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Click any sub-domain to see affected students and recommended interventions.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {domains.map((d, i) => {
          const status = statusFor(d.score);
          const delta = d.score - d.prevScore;
          return (
            <motion.button
              key={d.key}
              type="button"
              onClick={() => setOpenKey(d.key)}
              aria-label={`${d.label} — view affected students`}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35, ease: EASE }}
              className="group text-left rounded-xl border border-border bg-background p-3.5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_10px_24px_-18px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span
                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${d.hue} 12%, transparent)`,
                      color: d.hue,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${d.hue} 22%, transparent)`,
                    }}
                  >
                    <span className="text-[10.5px] font-heading font-extrabold uppercase tracking-tight">
                      {d.label.split(" ")[0].slice(0, 3)}
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-foreground/90 truncate">
                    {d.label}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: status.tone }}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span
                  className="font-heading font-extrabold text-[26px] tabular-nums leading-none"
                  style={{ color: d.hue }}
                >
                  {d.score}
                </span>
                <DeltaPill delta={delta} />
                <span className="ml-auto text-[10.5px] tabular-nums text-muted-foreground">
                  {d.atRiskCount} at risk
                </span>
              </div>

              <div className="mt-2.5 h-1 rounded-full bg-muted/50 overflow-hidden">
                <motion.span
                  initial={reduce ? undefined : { scaleX: 0 }}
                  animate={{ scaleX: d.score / 100 }}
                  transition={{ delay: 0.08 + 0.03 * i, duration: 0.6, ease: EASE }}
                  className="block h-full origin-left rounded-full"
                  style={{ background: d.hue, width: "100%" }}
                />
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-2">
                <p className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                  {d.description}
                </p>
                <span
                  aria-hidden
                  className="inline-flex items-center gap-0.5 shrink-0 mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100"
                  style={{ color: d.hue }}
                >
                  View
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <StudentDrillDialog
        open={!!openKey}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={activeMeta ? `${activeMeta.label} — affected students` : ""}
        description={
          activeStudents.length === 0
            ? "No students are currently below threshold for this sub-domain."
            : `${activeStudents.length} student${activeStudents.length === 1 ? "" : "s"} scoring below 55 on ${activeMeta?.label ?? "this sub-domain"}.`
        }
        students={activeStudents}
        metricLabel="score"
        metricValue={(s) => (openKey ? Math.round(studentAttentionDomains(s)[openKey]) : "")}
        footer={
          activeInterventions.length > 0 ? (
            <div>
              <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Recommended interventions
              </div>
              <ul className="text-[12.5px] space-y-1 list-disc list-inside text-foreground/90">
                {activeInterventions.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ) : null
        }
      />
    </section>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="text-[10.5px] tabular-nums text-muted-foreground">no change</span>;
  }
  const positive = delta > 0;
  return (
    <span
      className="text-[10.5px] tabular-nums font-bold"
      style={{ color: positive ? "hsl(142 55% 40%)" : "hsl(0 70% 50%)" }}
    >
      {positive ? "+" : ""}
      {delta}
    </span>
  );
}
