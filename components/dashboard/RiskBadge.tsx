"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCORE_BANDS, type ScoreBand } from "@/lib/classHealth";

/** Canonical tone-per-band colors — shared across every place a student's
 * (or the class's) ScoreBand needs a consistent color, not just this badge. */
export const SCORE_BAND_TONE: Record<ScoreBand, string> = {
  excellent: "hsl(142 55% 45%)",
  stable: "hsl(212 90% 58%)",
  watch: "hsl(38 92% 55%)",
  "needs-support": "hsl(0 78% 58%)",
};

const STYLES: Record<ScoreBand, string> = {
  excellent: "bg-primary/15 text-primary border-primary/30",
  stable: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  watch: "bg-warning/20 text-warning-foreground border-warning/40 dark:text-warning",
  "needs-support": "bg-destructive/15 text-destructive border-destructive/30",
};

const LABEL: Record<ScoreBand, string> = Object.fromEntries(
  SCORE_BANDS.map((b) => [b.band, b.tag]),
) as Record<ScoreBand, string>;

/** A student's (or the class's) ScoreBand, badged — this used to render the
 * old RiskLevel/risk concept (removed; there's no real "risk" field
 * anymore), so it's repurposed to the real `studentHealthScore`-derived
 * ScoreBand instead. */
export function RiskBadge({ band, className }: { band: ScoreBand; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-semibold border", STYLES[band], className)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[band]}
    </Badge>
  );
}
