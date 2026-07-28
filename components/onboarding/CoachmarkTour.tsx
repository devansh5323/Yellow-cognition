"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Compass, ArrowRight, X, Command, Sparkles, Layers, BarChart3 } from "lucide-react";
import { completeTour, getOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type Stop = {
  id: string;
  selector: string;
  title: string;
  body: string;
  Icon: typeof Compass;
  position: "right" | "bottom" | "left";
};

const STOPS: Stop[] = [
  {
    id: "sidebar",
    selector: 'aside[aria-label="Primary navigation"]',
    title: "Your workspace lives here",
    body: "Students, classroom, check-ins, reports — all one click away. The active page glides with you.",
    Icon: Layers,
    position: "right",
  },
  {
    id: "search",
    selector: "#global-search",
    title: "⌘K to do anything fast",
    body: "Jump to a student, run a check-in, message a parent — without leaving the keyboard.",
    Icon: Command,
    position: "bottom",
  },
  {
    id: "kpis",
    selector: 'section[aria-label="How each area is doing"]',
    title: "Four KPIs, one glance",
    body: "Learning, Focus, Behavior, and Task completion — each card shows how many students sit under it. Click Learning to drill in.",
    Icon: BarChart3,
    position: "bottom",
  },
  {
    id: "recommends",
    selector: 'section[aria-label="This week\'s focus"]',
    title: "Yellow recommends",
    body: "Tailored next moves for this class. The list re-ranks as new check-ins and gameplay signals come in.",
    Icon: Sparkles,
    position: "bottom",
  },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function CoachmarkTour() {
  const [eligible, setEligible] = useState(false);
  const [active, setActive] = useState(false);
  const [stopIdx, setStopIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduce = useReducedMotion();

  // Decide eligibility on mount: only run once for completed onboarders who haven't toured.
  useEffect(() => {
    const s = getOnboarding();
    if (!s.completed) return;
    if (s.tourCompleted) return;
    setEligible(true);
    // Slight delay so the dashboard has settled
    const t = window.setTimeout(() => setActive(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  // Allow the activation card (or anything else) to re-run the tour on demand
  // by dispatching a window-level "ah-start-tour" event.
  useEffect(() => {
    const onStart = () => {
      setEligible(true);
      setStopIdx(0);
      setActive(true);
    };
    window.addEventListener("ah-start-tour", onStart);
    return () => window.removeEventListener("ah-start-tour", onStart);
  }, []);

  // Recompute rect when stop changes / on resize / on scroll
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
      // Wait one frame for any scroll, then measure
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

  // Keyboard
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stopIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!eligible) return null;
  if (typeof document === "undefined") return null;

  const next = () => {
    if (stopIdx >= STOPS.length - 1) finish();
    else setStopIdx((i) => i + 1);
  };
  const prev = () => setStopIdx((i) => Math.max(0, i - 1));
  const finish = () => {
    completeTour();
    setActive(false);
  };

  const stop = STOPS[stopIdx];

  // Compute tooltip position relative to rect
  const tooltipPos = computeTooltip(rect, stop.position);

  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.div
          key="tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100]"
          aria-modal="true"
          role="dialog"
        >
          {/* SVG mask backdrop with cutout */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto"
            onClick={finish}
            aria-hidden
          >
            <defs>
              <mask id="coachmark-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {rect && (
                  <motion.rect
                    initial={false}
                    animate={{
                      x: rect.x - 10,
                      y: rect.y - 10,
                      width: rect.width + 20,
                      height: rect.height + 20,
                      rx: 16,
                    }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="hsl(230 25% 8% / 0.62)"
              mask="url(#coachmark-mask)"
            />
          </svg>

          {/* Pulsing border around the cutout */}
          {rect && (
            <motion.div
              key={stop.id}
              initial={false}
              animate={{
                left: rect.x - 10,
                top: rect.y - 10,
                width: rect.width + 20,
                height: rect.height + 20,
                opacity: 1,
              }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              className="pointer-events-none absolute rounded-2xl"
              style={{
                boxShadow:
                  "0 0 0 2px hsl(142 55% 55% / 0.95), 0 0 0 8px hsl(142 55% 55% / 0.18), 0 0 60px 0 hsl(142 55% 55% / 0.4)",
              }}
            />
          )}

          {/* Tooltip card */}
          {rect && (
            <motion.div
              key={`card-${stop.id}`}
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
              className="absolute pointer-events-auto"
              style={{
                left: tooltipPos.left,
                top: tooltipPos.top,
                transform: tooltipPos.transform,
                width: 320,
              }}
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
                        Quick tour · {stopIdx + 1} of {STOPS.length}
                      </div>
                      <h3 className="font-heading font-extrabold text-[15.5px] leading-tight mt-0.5">
                        {stop.title}
                      </h3>
                    </div>
                    <button
                      onClick={finish}
                      className="premium-icon-btn !h-7 !w-7"
                      aria-label="Skip tour"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-[12.5px] text-muted-foreground leading-relaxed">
                    {stop.body}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {STOPS.map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 rounded-full transition-all",
                            i === stopIdx ? "w-5 bg-primary" : "w-2 bg-border",
                          )}
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
                      <button
                        onClick={next}
                        className="cta-premium !h-9 !w-auto px-3.5 !text-[12.5px]"
                      >
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
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function computeTooltip(
  rect: DOMRect | null,
  position: "right" | "bottom" | "left",
): { left: number; top: number; transform: string } {
  if (!rect) return { left: 0, top: 0, transform: "translate(0,0)" };
  const margin = 18;
  const cardW = 320;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  if (position === "right") {
    const left = Math.min(rect.right + margin, vw - cardW - 12);
    const top = Math.max(12, Math.min(rect.top + rect.height / 2, vh - 220));
    return { left, top, transform: "translate(0, -50%)" };
  }
  if (position === "left") {
    const left = Math.max(12, rect.left - margin);
    const top = Math.max(12, Math.min(rect.top + rect.height / 2, vh - 220));
    return { left, top, transform: "translate(-100%, -50%)" };
  }
  // bottom
  const cx = rect.left + rect.width / 2;
  const left = Math.max(12, Math.min(cx, vw - cardW / 2 - 12));
  const top = Math.min(rect.bottom + margin, vh - 240);
  return { left, top, transform: "translate(-50%, 0)" };
}
