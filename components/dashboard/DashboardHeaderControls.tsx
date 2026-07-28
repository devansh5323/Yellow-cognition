"use client";

import { useState } from "react";
import { RefreshCw, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardRange = "Week" | "Month" | "Quarter";

interface Props {
  range: DashboardRange;
  onRangeChange: (r: DashboardRange) => void;
  hideTei: boolean;
  onHideTeiChange: (v: boolean) => void;
  onRefresh: () => void;
}

export function DashboardHeaderControls({ range, onRangeChange, hideTei, onHideTeiChange, onRefresh }: Props) {
  const [spinning, setSpinning] = useState(false);
  const ranges: DashboardRange[] = ["Week", "Month", "Quarter"];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex rounded-full border border-border/60 bg-card/80 backdrop-blur p-0.5 shadow-sm">
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={cn(
              "px-3 h-8 text-[12px] font-semibold rounded-full transition-all",
              range === r
                ? "bg-gradient-to-b from-[hsl(142_60%_56%)] to-[hsl(142_55%_40%)] text-white shadow-[0_4px_10px_-4px_hsl(142_55%_35%/0.5)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <button
        onClick={() => onHideTeiChange(!hideTei)}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold rounded-full border border-border/60 bg-card/80 backdrop-blur hover:-translate-y-0.5 transition-transform"
      >
        {hideTei ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {hideTei ? "Show TEI" : "Hide TEI"}
      </button>

      <button
        onClick={() => {
          setSpinning(true);
          onRefresh();
          setTimeout(() => setSpinning(false), 700);
        }}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold rounded-full border border-border/60 bg-card/80 backdrop-blur hover:-translate-y-0.5 transition-transform"
        aria-label="Refresh dashboard"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
        Refresh
      </button>
    </div>
  );
}
