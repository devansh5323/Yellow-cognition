"use client";

import { Lock } from "lucide-react";

/** Grays out a dashboard segment and stops interaction with it — used for
 * the FTUE, where every segment except Data Readiness starts locked.
 * `locked` defaults to true so existing call sites (no unlock condition
 * defined yet) keep behaving exactly as before; pass `locked={false}` once
 * a segment has a real unlock trigger to render children plainly. */
export function LockedSection({
  label = "Locked",
  hint,
  locked = true,
  children,
}: {
  label?: string;
  hint?: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;

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
