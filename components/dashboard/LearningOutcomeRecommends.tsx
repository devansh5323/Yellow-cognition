"use client";

import { ClipboardList, Sparkles, Target, Zap } from "lucide-react";
import type { OutcomeRecommendation, OutcomeRecommendationKind } from "@/lib/learningOutcomes";

const KIND_TONE: Record<OutcomeRecommendationKind, string> = {
  "Whole Class": "hsl(258 55% 60%)",
  "Small Group": "hsl(196 75% 50%)",
  "Quick Check": "hsl(38 92% 52%)",
};

const KIND_ICON: Record<OutcomeRecommendationKind, typeof ClipboardList> = {
  "Whole Class": ClipboardList,
  "Small Group": Target,
  "Quick Check": Zap,
};

/** Component 5: "Yellow Recommends" — real, bound to whichever real Learning
 * Readiness areas currently score weakest (lib/learningOutcomes.ts /
 * lib/classLearning.ts) — not fabricated. */
export function LearningOutcomeRecommends({ recommendations }: { recommendations: OutcomeRecommendation[] }) {
  return (
    <section aria-label="Yellow Recommends" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h2 className="font-heading font-extrabold text-[15px]">Yellow Recommends</h2>
      </div>
      <p className="text-[11.5px] text-muted-foreground mb-3">Actionable strategies to improve outcomes.</p>

      <ul className="space-y-2.5">
        {recommendations.map((rec) => {
          const Icon = KIND_ICON[rec.kind];
          const tone = KIND_TONE[rec.kind];
          return (
            <li key={rec.id} className="rounded-xl border border-border/60 bg-amber-500/[0.04] p-3.5 flex items-start gap-2.5">
              <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold leading-snug">{rec.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{rec.rationale}</p>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}>
                {rec.kind}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
