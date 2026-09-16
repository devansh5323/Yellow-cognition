"use client";

import { TrendingUp } from "lucide-react";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";

/** Component 7: is behaviour improving? This used to reuse the 6-month
 * disruptions/time-gained trend plus a before/after distribution comparison
 * — none of that exists anymore. There's no real per-student behaviour
 * signal to derive a week-over-week trend from, so this renders an honest
 * empty state instead of a fabricated line chart. */
export function BehaviorTrendTracking() {
  return (
    <section
      aria-label="Behaviour trend tracking"
      className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
    >
      <header className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-[17px]">Behavior Trend Tracking</h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">Is behavior improving?</p>
        </div>
      </header>

      <NotEnoughDataPanel
        title="Not enough data yet"
        description="We don't have a real week-over-week behaviour trend for this roster yet — check back once it's available."
      />
    </section>
  );
}
