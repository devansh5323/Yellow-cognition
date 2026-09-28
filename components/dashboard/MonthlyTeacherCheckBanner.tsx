"use client";

import { ShieldCheck } from "lucide-react";

/** Component 6 entry point: "Monthly Teacher Check" — opens
 * ReviewLearningOutcomePlacementsModal. */
export function MonthlyTeacherCheckBanner({ onReview }: { onReview: () => void }) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-9 w-9 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold">Monthly Teacher Check</div>
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            Review and confirm placements based on marks-card ranges, recent class performance, and gameplay-based learning signals.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReview}
        className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-bold hover:opacity-90 transition-opacity"
      >
        Confirm Placements
      </button>
    </section>
  );
}
