"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/mockData";

const STYLES: Record<RiskLevel, string> = {
  low: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-warning/20 text-warning-foreground border-warning/40 dark:text-warning",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  "at-risk": "bg-destructive text-destructive-foreground border-destructive",
};

const LABEL: Record<RiskLevel, string> = {
  low: "On track",
  medium: "Watch",
  high: "Needs help",
  "at-risk": "At risk",
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-semibold border", STYLES[risk], className)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[risk]}
    </Badge>
  );
}
