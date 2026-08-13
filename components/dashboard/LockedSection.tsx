"use client";

import { Lock } from "lucide-react";

/** Grays out a dashboard segment and stops interaction with it — used for
 * the FTUE, where every segment except Data Readiness starts locked.
 * Unconditional for now (always locked); the unlock condition comes in a
 * later pass, so this doesn't take a `locked` prop yet — everything that
 * wraps in this is locked, full stop. */
export function LockedSection({
  label = "Locked",
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 grayscale">{children}</div>
      <div className="absolute inset-0 flex items-start justify-end p-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 backdrop-blur px-2.5 py-1 text-[10.5px] font-bold text-muted-foreground shadow-sm"
          title={hint}
        >
          <Lock className="h-3 w-3" />
          {label}
        </span>
      </div>
    </div>
  );
}
