"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Mic, Star, X, type LucideIcon } from "lucide-react";
import { completeCheckinTour } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type Stop = {
  id: string;
  selector: string;
  title: string;
  body: string;
  Icon: LucideIcon;
};

const STOPS: Stop[] = [
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
 * teacher. Finishing OR dismissing it (X, Escape, backdrop click, or
 * "Finish" on the last stop) all end it the same way: mark
 * checkinTourCompleted and let the caller redirect into RTUE. Visually
 * modeled on the dashboard's (now-unmounted) CoachmarkTour.tsx — same
 * spotlight-mask + tooltip pattern — but a fresh, dedicated component since
 * this one is FTUE-gating rather than an on-demand dashboard walkthrough. */
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
    const stop = STOPS[stopIdx];
    const update = () => {
      const el = document.querySelector(stop.selector) as HTMLElement | null;
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
  const tooltipPos = computeTooltip(rect);

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

        {rect && (
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
            <div className="relative auth-card rounded-2xl p-5">
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
                        {stopIdx === STOPS.length - 1 ? "Finish" : "Next"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </div>
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

/** Returns the tooltip's final left-edge position directly (already
 * centered under the target and clamped to the viewport) — no CSS
 * transform needed, since mixing a manual transform with Framer Motion's
 * own transform-based animate values on the same element gets silently
 * dropped (see the comment where this is consumed). */
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
