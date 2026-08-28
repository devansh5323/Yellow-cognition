"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain } from "lucide-react";
import { DOMAIN_INTERVENTIONS, studentsByAttentionDomain, type AttentionDomainKey } from "@/data/mockData";
import {
  ATTENTION_HEATMAP_STATUS_LABEL,
  ATTENTION_HEATMAP_STATUS_TONE,
  type AttentionHeatmapStat,
  type AttentionHeatmapStatus,
} from "@/lib/classFocus";
import { AttentionSubDomainDrawer } from "@/components/dashboard/AttentionSubDomainDrawer";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const STATUS_ORDER: AttentionHeatmapStatus[] = ["high", "med", "low"];

export function ClassAttentionProfile({
  domains,
  logsPerStudent,
}: {
  domains: AttentionHeatmapStat[];
  logsPerStudent: number;
}) {
  const reduce = useReducedMotion();
  const [openKey, setOpenKey] = useState<AttentionDomainKey | null>(null);

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
      aria-label="Attention domain heatmap"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span>TEI breakdown</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Attention domain heatmap
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Click any domain to see affected students and interventions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {STATUS_ORDER.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: ATTENTION_HEATMAP_STATUS_TONE[s] }}
                aria-hidden
              />
              {ATTENTION_HEATMAP_STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {domains.map((d, i) => {
          const statusTone = ATTENTION_HEATMAP_STATUS_TONE[d.status];
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
                <span className="text-[12px] font-heading font-extrabold uppercase tracking-wide text-foreground/80">
                  {d.short}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${statusTone} 16%, transparent)`,
                    color: statusTone,
                  }}
                >
                  {ATTENTION_HEATMAP_STATUS_LABEL[d.status]}
                </span>
              </div>

              <div
                className="mt-1.5 font-heading font-extrabold text-[26px] tabular-nums leading-none"
                style={{ color: d.hue }}
              >
                {d.score}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-muted-foreground">{d.label}</div>

              <div className="mt-2.5 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.span
                  initial={reduce ? undefined : { scaleX: 0 }}
                  animate={{ scaleX: d.score / 100 }}
                  transition={{ delay: 0.08 + 0.03 * i, duration: 0.6, ease: EASE }}
                  className="block h-full origin-left rounded-full"
                  style={{ background: d.hue, width: "100%" }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-[10.5px] font-semibold text-muted-foreground">
                <span>{d.atRiskPct}% at risk</span>
                <span>{logsPerStudent}/student</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AttentionSubDomainDrawer
        open={!!openKey}
        onOpenChange={(o) => !o && setOpenKey(null)}
        domain={activeMeta}
        domainKey={openKey}
        students={activeStudents}
        interventions={activeInterventions}
      />
    </section>
  );
}
