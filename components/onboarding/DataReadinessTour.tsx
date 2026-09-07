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
  /** Omit when the real action can't be reduced to one button click (e.g. a
   * multi-select-then-confirm card) — the spotlighted element is directly
   * clickable through the cutout (see the click-catcher path below), so a
   * step with no single action just shows as an informational card with no
   * CTA row instead of a redundant button next to the real one. */
  cta?: string;
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
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    const el = document.querySelector(selector) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    measure();
    // A single requestAnimationFrame right after starting a *smooth* scroll
    // measures a mid-animation position, not where the element actually
    // ends up — the spotlight/tooltip would land offset from the real
    // element (confirmed via a real overlap bug: the tooltip landed partly
    // on top of the spotlighted card instead of below it). The scroll
    // listener re-measures live while it's moving; this timeout is one
    // authoritative measurement once a native smooth scroll has had time to
    // settle (typical duration, not exact per browser, but comfortably
    // past it).
    const settle = window.setTimeout(measure, 450);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
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

  // The click-catcher below only captures dismiss-clicks in the darkened
  // area — the cutout itself is excluded from its hit-test region (an
  // evenodd hole, not just a visual mask), so a click on the spotlighted
  // element reaches the real page underneath instead of being swallowed by
  // this overlay. Doesn't need to track viewport size in its own state:
  // any resize already re-measures `rect` (see the effect above), which
  // re-renders this component anyway.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const outerPath = `M0,0 H${vw} V${vh} H0 Z`;
  const holePath = rect
    ? `M${rect.x - 10},${rect.y - 10} H${rect.x - 10 + rect.width + 20} V${rect.y - 10 + rect.height + 20} H${rect.x - 10} Z`
    : "";

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="data-readiness-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        // Below the shadcn Dialog's z-50 (components/ui/dialog.tsx) —
        // unlike CheckInToolsTour, this tour's own CTA opens real Dialogs
        // (focus area / Fumi / classroom setup) on top of itself, so those
        // need to render above it and receive clicks, not get shadowed by
        // this overlay the way a z-[100] tour would.
        // pointer-events-none here (not just on the svg) — a plain div's
        // full box is hit-testable by default regardless of transparency,
        // which was silently swallowing clicks meant to pass through the
        // cutout to the real page even after the svg and its decorative
        // shapes were marked non-interactive. The click-catcher path and
        // the tooltip wrapper each explicitly opt back into pointer-events
        // below, which is enough to override this.
        className="fixed inset-0 z-40 pointer-events-none"
        aria-modal="true"
        role="dialog"
        aria-label="Getting-started walkthrough"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
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
            {/* A soft radial vignette (rather than a flat fill) reads as a
                deliberate spotlight/cinematic dim instead of a plain dark
                sheet — center-weighted toward where the highlighted card
                tends to sit. */}
            <radialGradient id="data-readiness-tour-backdrop" cx="50%" cy="38%" r="75%">
              <stop offset="0%" stopColor="hsl(230 30% 13% / 0.52)" />
              <stop offset="100%" stopColor="hsl(230 34% 5% / 0.8)" />
            </radialGradient>
            {/* Soft falloff (not a flat-opacity fill) so the ambient glow
                blends into the backdrop instead of reading as a hard-edged
                circle pasted on top — a flat circle at any visible opacity
                showed a distinct boundary against the dim backdrop. */}
            <radialGradient id="data-readiness-tour-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={step.tone} stopOpacity="0.4" />
              <stop offset="55%" stopColor={step.tone} stopOpacity="0.12" />
              <stop offset="100%" stopColor={step.tone} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#data-readiness-tour-backdrop)"
            mask="url(#data-readiness-tour-mask)"
          />
          {/* A tone-tinted glow bleeding from the spotlighted element into the
              dimmed backdrop (screen blend against the backdrop rect just
              painted below it, so it only ever brightens) — the cutout
              alone reads as a hole in the dark; this makes the guide feel
              like it's actively illuminating the next step. Masked with the
              exact same cutout as the backdrop so it never bleeds onto the
              real spotlighted element itself — screen-blending against
              live DOM content behind the whole overlay (rather than just
              this SVG's own backdrop rect) doesn't reliably stay invisible
              over a bright background, confirmed visually as a stray tint
              washing over the spotlighted card before this mask was added.
              Radius is capped rather than scaled to the target's own size —
              a full-width setup card would otherwise wash the entire
              viewport in tint. */}
          {rect && (
            <motion.circle
              initial={false}
              animate={{
                cx: rect.x + rect.width / 2,
                cy: rect.y + rect.height / 2,
                r: Math.min(Math.max(rect.width, rect.height) * 0.28 + 50, 200),
              }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              fill="url(#data-readiness-tour-glow)"
              mask="url(#data-readiness-tour-mask)"
              style={{ mixBlendMode: "screen" }}
            />
          )}
          {/* Real click-catcher (separate from the purely visual mask
              above): fill-rule="evenodd" makes the cutout a genuine
              geometric hole rather than just a rendered one, so clicks
              inside it hit the real spotlighted element instead of this
              overlay — pointer-events:"all" forces hit-testing to run
              despite the transparent fill. */}
          <path
            d={`${outerPath} ${holePath}`}
            fill="transparent"
            fillRule="evenodd"
            onClick={onDismiss}
            style={{ pointerEvents: "all" }}
          />
        </svg>

        {rect && (
          <motion.div
            key={step.id}
            initial={false}
            animate={{ left: rect.x - 10, top: rect.y - 10, width: rect.width + 20, height: rect.height + 20 }}
            transition={
              reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24, mass: 0.9 }
            }
            className="pointer-events-none absolute rounded-2xl"
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: `0 0 0 2px color-mix(in srgb, ${step.tone} 95%, transparent), 0 0 0 8px color-mix(in srgb, ${step.tone} 18%, transparent)`,
              }}
            />
            {!reduce && (
              <motion.div
                className="absolute -inset-1 rounded-[20px]"
                style={{ boxShadow: `0 0 60px 4px color-mix(in srgb, ${step.tone} 55%, transparent)` }}
                animate={{ opacity: [0.55, 0.95, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        )}

        {rect && (
          <div className="absolute pointer-events-auto" style={{ left: tooltipPos.left, top: tooltipPos.top, width: 320 }}>
            <motion.div
              key={`card-${step.id}`}
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 340, damping: 26, mass: 0.8 }
              }
            >
              <div className="relative rounded-2xl border border-border/70 bg-card shadow-[0_28px_70px_-20px_hsl(230_50%_15%/0.45)] p-5 overflow-hidden">
                <span className="auth-card-ring rounded-2xl" aria-hidden />
                <div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/15"
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <span
                      className="relative h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${step.tone} 15%, transparent)`, color: step.tone }}
                    >
                      {!reduce && (
                        <motion.span
                          className="absolute inset-0 rounded-xl"
                          style={{ boxShadow: `0 0 0 2px color-mix(in srgb, ${step.tone} 55%, transparent)` }}
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.4 }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <step.Icon className="h-[18px] w-[18px] relative" strokeWidth={2.2} />
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
                          className="h-1 rounded-full transition-all duration-300"
                          style={
                            i < activeIndex
                              ? { width: 8, background: `color-mix(in srgb, ${step.tone} 50%, transparent)` }
                              : i === activeIndex
                                ? {
                                    width: 20,
                                    background: step.tone,
                                    boxShadow: `0 0 8px 0 color-mix(in srgb, ${step.tone} 65%, transparent)`,
                                  }
                                : { width: 8, background: "var(--border)" }
                          }
                        />
                      ))}
                    </div>
                    {step.cta ? (
                      <button
                        onClick={() => onAction(step.id)}
                        className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]"
                        style={{
                          background: `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, ${step.tone} 65%, white) 0%, transparent 60%), linear-gradient(180deg, ${step.tone} 0%, color-mix(in srgb, ${step.tone} 74%, black) 100%)`,
                          border: `1px solid color-mix(in srgb, ${step.tone} 55%, black)`,
                          boxShadow: `0 1px 0 0 color-mix(in srgb, ${step.tone} 45%, white) inset, 0 -1px 0 0 color-mix(in srgb, ${step.tone} 40%, black) inset, 0 10px 24px -10px color-mix(in srgb, ${step.tone} 55%, transparent)`,
                        }}
                      >
                        <span className="sheen" aria-hidden />
                        <span className="inline-flex items-center gap-1">
                          {step.cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ) : (
                      // No single action to trigger — the real picker is
                      // directly clickable through the cutout (see the
                      // click-catcher path above), so this just points the
                      // teacher/coordinator at it instead of duplicating it.
                      <span className="text-[11px] font-semibold" style={{ color: step.tone }}>
                        Pick above to continue
                      </span>
                    )}
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

/** Places the card below the spotlighted rect when there's room, otherwise
 * flips it above — a plain "clamp to vh - 240" (the earlier version) can
 * land the card back on top of a tall/low-on-the-page rect instead of
 * genuinely avoiding it (confirmed via a real overlap bug against the
 * Classroom Log tool cards). cardH is an estimate (actual content varies a
 * little), generous enough that the flip decision stays on the safe side. */
function computeTooltip(rect: DOMRect | null): { left: number; top: number } {
  if (!rect) return { left: 0, top: 0 };
  const margin = 18;
  const cardW = 320;
  const cardH = 220;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cx = rect.left + rect.width / 2;
  const left = Math.max(12, Math.min(cx - cardW / 2, vw - cardW - 12));

  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;
  const top =
    spaceBelow >= cardH + margin || spaceBelow >= spaceAbove
      ? Math.min(rect.bottom + margin, vh - 12 - cardH)
      : Math.max(12, rect.top - margin - cardH);
  return { left, top };
}
