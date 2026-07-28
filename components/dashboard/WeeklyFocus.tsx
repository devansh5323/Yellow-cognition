"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  topSupportAreas,
  recommendations,
  type SupportArea,
  type Recommendation,
  type RecommendationType,
  type PillarKey,
} from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const PILLAR_TONE: Record<PillarKey, string> = {
  task: "hsl(0 78% 58%)",
  focus: "hsl(38 92% 55%)",
  behavior: "hsl(212 90% 58%)",
  academic: "hsl(142 55% 45%)",
};

const TYPE_TONE: Record<RecommendationType, string> = {
  "Whole Class": "hsl(38 92% 55%)",
  "Small Group": "hsl(212 90% 58%)",
  "Routine Change": "hsl(142 55% 45%)",
  "Quick Check": "hsl(280 60% 60%)",
};

export function WeeklyFocus() {
  const reduce = useReducedMotion();
  const pairs = useMemo(() => {
    const areas = topSupportAreas();
    const recs = recommendations();
    return areas.map((area, i) => ({ area, rec: recs[i] as Recommendation | undefined }));
  }, []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-elevated rounded-[22px] p-5 md:p-6 relative overflow-hidden"
      aria-label="This week's focus"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 100% 0%, hsl(280 60% 80% / 0.14), transparent 60%)",
        }}
      />

      <header className="relative z-10 flex items-end justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="premium-eyebrow">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Yellow recommends
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1.5">
            This week's focus
          </h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Top {pairs.length} areas where your class needs support — and a strategy for each.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary/80"
        >
          See all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="relative z-10 divide-y divide-border/60">
        {pairs.map(({ area, rec }, idx) => (
          <FocusRow key={area.id} area={area} rec={rec} index={idx + 1} />
        ))}
      </div>
    </motion.section>
  );
}

function FocusRow({
  area,
  rec,
  index,
}: {
  area: SupportArea;
  rec: Recommendation | undefined;
  index: number;
}) {
  const tone = PILLAR_TONE[area.pillar];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 md:gap-6 py-4 first:pt-0 last:pb-0 items-start">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[11.5px] font-extrabold tabular-nums"
          style={{
            background: `color-mix(in srgb, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          {index}
        </span>
        <div className="min-w-0">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone }}
          >
            Issue
          </div>
          <h3 className="font-heading font-bold text-[14px] leading-tight mt-0.5">{area.title}</h3>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{area.evidence}.</p>
        </div>
      </div>

      <div className="hidden md:flex items-center self-stretch">
        <div className="h-px flex-1 bg-border/70" />
        <div className="px-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Try this
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="h-px flex-1 bg-border/70" />
      </div>

      {rec && <RecommendationBlock rec={rec} />}
    </div>
  );
}

function RecommendationBlock({ rec }: { rec: Recommendation }) {
  const tone = TYPE_TONE[rec.type];
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">
          Strategy
        </span>
        <span
          className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
          }}
        >
          {rec.type}
        </span>
      </div>
      <h3 className="font-heading font-bold text-[14px] leading-tight mt-0.5">{rec.title}</h3>
      <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{rec.rationale}</p>
    </div>
  );
}
