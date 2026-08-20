"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";

/** Fogs out a dashboard segment and stops interaction with it — used for
 * the FTUE, where every segment except Data Readiness starts locked.
 * `locked` defaults to true so existing call sites (no unlock condition
 * defined yet) keep behaving exactly as before; pass `locked={false}` once
 * a segment has a real unlock trigger to render children plainly.
 *
 * Deliberately blurs + dims rather than fully desaturating — real (if
 * blurred) color underneath reads as "there's live content waiting here,"
 * whereas flat grayscale reads as dead/disabled. The overlay card's copy is
 * per-segment (passed in by the caller) rather than a generic "Locked", so
 * each one says what specifically is waiting behind it. Optionally takes an
 * `onAction`, rendered as a "Take me there" CTA that jumps the teacher
 * straight to whatever they still need to finish to unlock it. */
export function LockedSection({
  label = "Locked",
  hint,
  locked = true,
  onAction,
  actionLabel = "Take me there",
  children,
}: {
  label?: string;
  hint?: string;
  locked?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="pointer-events-none select-none blur-[1.5px] opacity-75 saturate-90">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card/95 backdrop-blur px-5 py-4 text-center shadow-lg max-w-[260px]"
        >
          <span className="h-9 w-9 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center">
            <Lock className="h-4 w-4" />
          </span>
          <span className="text-[12px] font-bold text-foreground">{label}</span>
          {hint && (
            <span className="text-[10.5px] text-muted-foreground leading-snug">{hint}</span>
          )}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              {actionLabel}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
