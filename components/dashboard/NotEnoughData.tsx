"use client";

import { DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Honest empty state for a metric or page section with zero real data yet
 * — used in place of a fabricated score wherever the real student dataset
 * doesn't cover a field, rather than falling back to a placeholder number. */
export function NotEnoughData({
  label = "Not enough data yet",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/80",
        className,
      )}
    >
      <DatabaseZap className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}

/** Full-page/section-level version — a page shell that has zero real signal
 * yet (e.g. Focus, Behavior) renders this instead of fabricated per-student
 * breakdowns. Comes back automatically once real data arrives. */
export function NotEnoughDataPanel({
  title = "Not enough data yet",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12",
        className,
      )}
    >
      <span className="h-11 w-11 rounded-2xl bg-muted/60 text-muted-foreground inline-flex items-center justify-center">
        <DatabaseZap className="h-5 w-5" />
      </span>
      <h3 className="font-heading font-extrabold text-[15px]">{title}</h3>
      {description && (
        <p className="text-[12.5px] text-muted-foreground max-w-sm leading-snug">{description}</p>
      )}
    </div>
  );
}
