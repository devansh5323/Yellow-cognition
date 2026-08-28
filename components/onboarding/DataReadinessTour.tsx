"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export type TourStep = {
  id: string;
  /** The `data-tour-target` value to spotlight for this step — not always
   * `step-${id}`: e.g. the classroom step points at the topbar's "+ Add
   * classroom" pill instead of its own (still-greyed) card until a
   * classroom actually exists, mirroring the same sub-state distinction
   * the plain step-card row already makes for its own glow. */
  target: string;
  title: string;
  description: string;
  cta: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
};

/** The 3 setup steps' guided walkthrough — unlike CheckInToolsTour (purely
 * explanatory), this one is action-oriented: there's no Next/Back, the
 * spotlighted step only advances once its real underlying condition
 * actually becomes true (activeIndex is fully driven by the caller's real
 * onboarding state, not internal step-index state). The tooltip's single
 * CTA triggers the exact same action the static step card's own button
 * does (`onAction`), so this is a stronger prompt for the same real flow,
 * not a parallel one. Dismissing (X / Escape / backdrop click) only hides
 * this visual guide for the session — it never fakes step completion, so
 * the real FTUE gate is untouched and the plain step cards underneath stay
 * fully usable either way. */
export function DataReadinessTour({
  steps,
  activeIndex,
  dismissed,
  onAction,
  onDismiss,
}: {
  steps: TourStep[];
  /** Index into `steps` of the current real not-done step, or -1 once
   * every step is genuinely done (hides the tour). */
  activeIndex: number;
  dismissed: boolean;
  onAction: (id: string) => void;
  onDismiss: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduce = useReducedMotion();
  const active = !dismissed && activeIndex >= 0 && activeIndex < steps.length;
  const step = active ? steps[activeIndex] : null;

  useLayoutEffect(() => {
    if (!step) return;
    const selector = `[data-tour-target='${step.target}']`;
    const update = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      requestAnimationFrame(() => {
        setRect(el.getBoundingClientRect());
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  // Toast the moment a step's real completion advances activeIndex —
  // positive feedback for finishing a real action, not a manufactured one.
  // A ref (not state) tracks the previous value purely to detect the
  // change — nothing here needs to trigger a re-render.
  const prevIndexRef = useRef(activeIndex);
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    if (activeIndex > prevIndex && prevIndex >= 0 && prevIndex < steps.length) {
      toast.success(`Nice! ${steps[prevIndex].title} is done.`);
    }
    prevIndexRef.current = activeIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onDismiss]);

  if (!step) return null;
  if (typeof document === "undefined") return null;

  const tooltipPos = computeTooltip(rect);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="data-readiness-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        // Below the shadcn Dialog's z-50 (components/ui/dialog.tsx) —
        // unlike CheckInToolsTour, this tour's own CTA opens real Dialogs
        // (focus area / Fumi / classroom setup) on top of itself, so those
        // need to render above it and receive clicks, not get shadowed by
        // this overlay the way a z-[100] tour would.
        className="fixed inset-0 z-40"
        aria-modal="true"
        role="dialog"
        aria-label="Getting-started walkthrough"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={onDismiss} aria-hidden>
          <defs>
            <mask id="data-readiness-tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <motion.rect
                  initial={false}
                  animate={{ x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20, rx: 16 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="hsl(230 25% 8% / 0.62)" mask="url(#data-readiness-tour-mask)" />
        </svg>

        {rect && (
          <motion.div
            key={step.id}
            initial={false}
            animate={{ left: rect.x - 10, top: rect.y - 10, width: rect.width + 20, height: rect.height + 20, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="pointer-events-none absolute rounded-2xl"
            style={{
              boxShadow: `0 0 0 2px color-mix(in srgb, ${step.tone} 95%, transparent), 0 0 0 8px color-mix(in srgb, ${step.tone} 18%, transparent), 0 0 60px 0 color-mix(in srgb, ${step.tone} 40%, transparent)`,
            }}
          />
        )}

        {rect && (
          <div className="absolute pointer-events-auto" style={{ left: tooltipPos.left, top: tooltipPos.top, width: 320 }}>
            <motion.div
              key={`card-${step.id}`}
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
            >
              <div className="relative auth-card rounded-2xl p-5">
                <span className="auth-card-ring rounded-2xl" aria-hidden />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <span
                      className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${step.tone} 15%, transparent)`, color: step.tone }}
                    >
                      <step.Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                        Getting started · Step {activeIndex + 1} of {steps.length}
                      </div>
                      <h3 className="font-heading font-extrabold text-[15.5px] leading-tight mt-0.5">{step.title}</h3>
                    </div>
                    <button onClick={onDismiss} className="premium-icon-btn !h-7 !w-7" aria-label="Dismiss walkthrough">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-[12.5px] text-muted-foreground leading-relaxed">{step.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {steps.map((_, i) => (
                        <span
                          key={i}
                          className={
                            "h-1 rounded-full transition-all " +
                            (i < activeIndex ? "w-2 bg-primary/50" : i === activeIndex ? "w-5 bg-primary" : "w-2 bg-border")
                          }
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => onAction(step.id)}
                      className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]"
                    >
                      <span className="sheen" aria-hidden />
                      <span className="inline-flex items-center gap-1">
                        {step.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

function computeTooltip(rect: DOMRect | null): { left: number; top: number } {
  if (!rect) return { left: 0, top: 0 };
  const margin = 18;
  const cardW = 320;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cx = rect.left + rect.width / 2;
  const left = Math.max(12, Math.min(cx - cardW / 2, vw - cardW - 12));
  const top = Math.min(rect.bottom + margin, vh - 240);
  return { left, top };
}
