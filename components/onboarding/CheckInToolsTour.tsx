"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Mic, Sparkles, Star, X, type LucideIcon } from "lucide-react";
import { completeCheckinTour } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type Stop = {
  id: string;
  /** null = no real element to spotlight — renders as a plain centered
   * intro card instead of a rect-anchored tooltip (used for the bridging
   * "here's what's next" beat between the setup tour and this one). */
  selector: string | null;
  title: string;
  body: string;
  Icon: LucideIcon;
};

const STOPS: Stop[] = [
  {
    id: "intro",
    selector: null,
    title: "Let's see the tools",
    body: "Now let's see the tools that will help you understand your classroom better.",
    Icon: Sparkles,
  },
  {
    id: "record-card",
    selector: "[data-tour-target='record-card']",
    title: "Record your class automatically",
    body: "Tap here to record a session — Yellow listens in and turns it into a full class check-in, no manual entry needed.",
    Icon: Mic,
  },
  {
    id: "record-behavior",
    selector: "[data-tour-target='tool-record-behavior']",
    title: "Log a behaviour in the moment",
    body: "Notice something disruptive? Voice-log it here and Yellow maps it to PBIS expectations automatically.",
    Icon: Mic,
  },
  {
    id: "positive-log",
    selector: "[data-tour-target='tool-positive-log']",
    title: "Recognise the good stuff too",
    body: "Praise, strengths, and expected behaviours — log the positive moments just as easily.",
    Icon: Star,
  },
  {
    id: "intervention-followup",
    selector: "[data-tour-target='tool-intervention-followup']",
    title: "Track what's working",
    body: "See whether a strategy you tried actually helped, and follow up on students who need another check-in.",
    Icon: ClipboardCheck,
  },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** The FTUE's final step: a purely explanatory, click-through walkthrough
 * of the Classroom Log tab's tools — no real action is required from the
 * teacher. Opens on a plain "here's what's next" beat (no spotlight) so the
 * jump from finishing the action-oriented setup tour doesn't feel abrupt,
 * then spotlights each real tool in turn. Finishing OR dismissing it (X,
 * Escape, backdrop click, or "Finish" on the last stop) all end it the same
 * way: mark checkinTourCompleted and let the caller redirect into RTUE.
 * Visually modeled on the dashboard's (now-unmounted) CoachmarkTour.tsx —
 * same spotlight-mask + tooltip pattern — but a fresh, dedicated component
 * since this one is FTUE-gating rather than an on-demand walkthrough. */
export function CheckInToolsTour({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [stopIdx, setStopIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduce = useReducedMotion();

  // Hoisted function declarations (not arrow consts) so the keydown
  // effect below can reference them regardless of declaration order.
  function finish() {
    completeCheckinTour();
    onDone();
  }
  function next() {
    if (stopIdx >= STOPS.length - 1) finish();
    else setStopIdx((i) => i + 1);
  }
  function prev() {
    setStopIdx((i) => Math.max(0, i - 1));
  }

  useLayoutEffect(() => {
    if (!active) return;
    const selector = STOPS[stopIdx].selector;
    const measure = () => {
      if (!selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(selector) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    const el = selector ? (document.querySelector(selector) as HTMLElement | null) : null;
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
  }, [active, stopIdx]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stopIdx]);

  if (!active) return null;
  if (typeof document === "undefined") return null;

  const stop = STOPS[stopIdx];
  const isIntro = stop.selector === null;
  const tooltipPos = computeTooltip(rect);

  const card = (
    <div className="relative rounded-2xl border border-border/70 bg-card shadow-[0_24px_60px_-20px_hsl(230_50%_20%/0.35)] p-5">
      <span className="auth-card-ring rounded-2xl" aria-hidden />
      <div className="relative">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <stop.Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
              Classroom Log · {stopIdx + 1} of {STOPS.length}
            </div>
            <h3 className="font-heading font-extrabold text-[15.5px] leading-tight mt-0.5">{stop.title}</h3>
          </div>
          <button onClick={finish} className="premium-icon-btn !h-7 !w-7" aria-label="Skip walkthrough">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2.5 text-[12.5px] text-muted-foreground leading-relaxed">{stop.body}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STOPS.map((_, i) => (
              <span
                key={i}
                className={cn("h-1 rounded-full transition-all", i === stopIdx ? "w-5 bg-primary" : "w-2 bg-border")}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {stopIdx > 0 && (
              <button
                onClick={prev}
                className="h-8 px-3 rounded-lg text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                Back
              </button>
            )}
            <button onClick={next} className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]">
              <span className="sheen" aria-hidden />
              <span className="inline-flex items-center gap-1">
                {isIntro ? "Let's go" : stopIdx === STOPS.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="checkin-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100]"
        aria-modal="true"
        role="dialog"
        aria-label="Classroom Log walkthrough"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={finish} aria-hidden>
          <defs>
            <mask id="checkin-tour-mask">
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
          <rect x="0" y="0" width="100%" height="100%" fill="hsl(230 25% 8% / 0.62)" mask="url(#checkin-tour-mask)" />
        </svg>

        {rect && (
          <motion.div
            key={stop.id}
            initial={false}
            animate={{ left: rect.x - 10, top: rect.y - 10, width: rect.width + 20, height: rect.height + 20, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="pointer-events-none absolute rounded-2xl"
            style={{
              boxShadow:
                "0 0 0 2px hsl(142 55% 55% / 0.95), 0 0 0 8px hsl(142 55% 55% / 0.18), 0 0 60px 0 hsl(142 55% 55% / 0.4)",
            }}
          />
        )}

        {isIntro ? (
          // No real element to anchor to yet — a plain centered card for
          // the bridging "here's what's next" beat.
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              key={`card-${stop.id}`}
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
              className="pointer-events-auto w-[340px]"
            >
              {card}
            </motion.div>
          </div>
        ) : (
          rect && (
            // Positioning (left/top) lives on this plain wrapper, separate
            // from the motion.div below — Framer Motion owns the `transform`
            // CSS property once any of its own transform-based animate
            // values (scale/y) are present, silently dropping a manually
            // supplied style.transform otherwise (confirmed via a real
            // off-screen-tooltip bug: computeTooltip() no longer needs to
            // center via `translate(-50%, ...)` at all — it returns an
            // already left-edge-clamped position instead).
            <div className="absolute pointer-events-auto" style={{ left: tooltipPos.left, top: tooltipPos.top, width: 320 }}>
              <motion.div
                key={`card-${stop.id}`}
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
              >
                {card}
              </motion.div>
            </div>
          )
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/** Returns the tooltip's final left-edge position directly (already
 * centered under the target and clamped to the viewport) — no CSS
 * transform needed, since mixing a manual transform with Framer Motion's
 * own transform-based animate values on the same element gets silently
 * dropped (see the comment where this is consumed). */
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
