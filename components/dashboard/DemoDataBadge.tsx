"use client";

import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Explicit "this isn't real" flag — used wherever a card/section shows
 * seeded/randomized placeholder numbers because the real dataset has zero
 * signal for it yet (e.g. per-student Attention & Focus). Deliberately a
 * distinct amber/violet tone and a flask icon, never reused for real data —
 * so a glance at the color alone is enough to tell demo from real, on top
 * of the label. Pairs with `components/dashboard/NotEnoughData.tsx`, which
 * is for the opposite choice (showing nothing rather than a demo number). */
export function DemoDataBadge({
  label = "Demo data",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[hsl(280_60%_60%)]/30 bg-[hsl(280_60%_60%)]/[0.08] px-2.5 py-1 text-[10.5px] font-bold text-[hsl(280_55%_50%)] dark:text-[hsl(280_70%_75%)]",
        className,
      )}
    >
      <FlaskConical className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

/** Section-level banner version — sits at the top of a card/segment that's
 * entirely seeded/placeholder data, explaining why in one line rather than
 * just the small pill (used when the demo scope is the whole component, not
 * one field within an otherwise-real card). */
export function DemoDataBanner({
  description = "This roster has no real signal for this yet — showing randomized placeholder data so the layout is easy to evaluate.",
  className,
}: {
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[hsl(280_60%_60%)]/25 bg-[hsl(280_60%_60%)]/[0.05] px-3.5 py-2.5",
        className,
      )}
    >
      <FlaskConical className="h-3.5 w-3.5 shrink-0 text-[hsl(280_55%_50%)] dark:text-[hsl(280_70%_75%)]" />
      <p className="text-[11.5px] leading-snug text-foreground/80">
        <span className="font-bold text-[hsl(280_55%_50%)] dark:text-[hsl(280_70%_75%)]">Demo data.</span>{" "}
        {description}
      </p>
    </div>
  );
}
