"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Compass,
  ArrowRight,
  X,
  Layers,
  Users,
  Target,
} from "lucide-react";
import { completeSchoolTour, getSchoolOnboarding } from "@/lib/schoolOnboarding";
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
    selector: '[data-tour-target="school-sidebar"]',
    title: "Your admin workspace",
    body: "Teachers, classes, reports — every part of your school in one click.",
    Icon: Layers,
    position: "right",
  },
  {
    id: "kpis",
    selector: '[data-tour-target="school-kpis"]',
    title: "School health at a glance",
    body: "Four numbers that tell you whether the school is on track this month.",
    Icon: Target,
    position: "bottom",
  },
  {
    id: "checklist",
    selector: '[data-tour-target="school-checklist"]',
    title: "Your activation engine",
    body: "Five quick tasks to bring your teachers and parents fully online. Each one unlocks more of the dashboard.",
    Icon: Users,
    position: "bottom",
  },
];

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function SchoolCoachmarkTour() {
  const [eligible, setEligible] = useState(false);
  const [active, setActive] = useState(false);
  const [stopIdx, setStopIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const s = getSchoolOnboarding();
    if (!s.completed) return;
    if (s.tourCompleted) return;
    setEligible(true);
    const t = window.setTimeout(() => setActive(true), 600);
    return () => window.clearTimeout(t);
  }, []);

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
      requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
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
  }, [active, stopIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!eligible) return null;
  if (typeof document === "undefined") return null;

  const next = () => {
    if (stopIdx >= STOPS.length - 1) finish();
    else setStopIdx((i) => i + 1);
  };
  const prev = () => setStopIdx((i) => Math.max(0, i - 1));
  const finish = () => {
    completeSchoolTour();
    setActive(false);
  };

  const stop = STOPS[stopIdx];
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
          <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={finish} aria-hidden>
            <defs>
              <mask id="school-coachmark-mask">
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
              mask="url(#school-coachmark-mask)"
            />
          </svg>

          {rect && (
            <motion.div
              key={stop.id}
              initial={false}
              animate={{
                left: rect.x - 10,
                top: rect.y - 10,
                width: rect.width + 20,
                height: rect.height + 20,
              }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              className="pointer-events-none absolute rounded-2xl"
              style={{
                boxShadow:
                  "0 0 0 2px hsl(260 55% 65% / 0.95), 0 0 0 8px hsl(260 55% 65% / 0.18), 0 0 60px 0 hsl(260 55% 65% / 0.4)",
              }}
            />
          )}

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
                    <span className="h-10 w-10 rounded-xl bg-[hsl(260_55%_60%)]/15 text-[hsl(260_55%_55%)] dark:text-[hsl(260_60%_72%)] flex items-center justify-center shrink-0">
                      <stop.Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                        Quick tour · {stopIdx + 1} of {STOPS.length}
                      </div>
                      <h3 className="font-heading font-extrabold text-[15.5px] leading-tight mt-0.5">{stop.title}</h3>
                    </div>
                    <button onClick={finish} className="premium-icon-btn !h-7 !w-7" aria-label="Skip tour">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-[12.5px] text-muted-foreground leading-relaxed">{stop.body}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {STOPS.map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 rounded-full transition-all",
                            i === stopIdx ? "w-5 bg-[hsl(260_55%_60%)]" : "w-2 bg-border",
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
  const cx = rect.left + rect.width / 2;
  const left = Math.max(12, Math.min(cx, vw - cardW / 2 - 12));
  const top = Math.min(rect.bottom + margin, vh - 240);
  return { left, top, transform: "translate(-50%, 0)" };
}
