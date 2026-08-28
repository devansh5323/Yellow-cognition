"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { FumiIntroVisualPicker } from "@/components/onboarding/FumiIntroVisual";
import { FUMI_INTRO_SCREENS } from "@/components/onboarding/fumiIntroContent";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** "Meet Fumi" — a couple of one-time intro screens shown during teacher
 * onboarding (see app/welcome/page.tsx), between the welcome hero and the
 * profile step — full-bleed hero moments, big type, no card, filling the
 * viewport. Screens come from FUMI_INTRO_SCREENS; this component only owns
 * navigating between them. Next on the last screen hands off via
 * onComplete. onBack is optional — pass it only when there's a real
 * previous screen to return to (e.g. a wizard step before this one);
 * otherwise the Back button is hidden on the first screen instead of
 * calling nothing. */
export function FumiIntro({ onBack, onComplete }: { onBack?: () => void; onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const screen = FUMI_INTRO_SCREENS[idx];
  const isLast = idx === FUMI_INTRO_SCREENS.length - 1;
  const isFirst = idx === 0;
  const showBack = !isFirst || !!onBack;

  const next = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setIdx((i) => i + 1);
  };

  const back = () => {
    if (isFirst) {
      onBack?.();
      return;
    }
    setDirection(-1);
    setIdx((i) => Math.max(0, i - 1));
  };

  const backButton = showBack && (
    <button
      type="button"
      onClick={back}
      className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );

  const dots = FUMI_INTRO_SCREENS.length > 1 && (
    <div className="flex items-center justify-center gap-1.5">
      {FUMI_INTRO_SCREENS.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === idx ? "w-5 bg-primary" : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );

  return (
    // No min-h-screen here — <main> in app/welcome/page.tsx already reserves
    // min-h-[calc(100vh-90px)] and centers its child via flex items-center
    // (same as every other step, e.g. StepWelcome). Adding another 100vh
    // minimum on top of that double-counts the header's height and forces
    // the page to scroll regardless of how compact this content is.
    <div className="w-full flex flex-col items-center text-center px-6 py-4">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={idx}
          custom={direction}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 32, filter: "blur(6px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -direction * 32, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="w-full max-w-5xl"
        >
          <FumiIntroVisualPicker visual={screen.visual ?? "mascot"} />
          <h1
            className={cn(
              "font-heading font-black text-[28px] sm:text-[36px] md:text-[40px] leading-[1.1] tracking-tight",
              screen.visual === "none" ? "mt-0" : "mt-4",
            )}
          >
            {screen.title}
          </h1>
          <p className="mt-2.5 text-[15px] sm:text-[16.5px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {screen.body}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 backdrop-blur px-4 py-2 text-[12.5px] font-semibold text-foreground/80">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            {screen.bottomText}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-3">{dots}</div>

      <div className="mt-2.5 flex items-center justify-center gap-3">
        {backButton}
        <button type="button" onClick={next} className="cta-premium !h-11 !w-auto px-8 !text-[14px]">
          <span className="sheen" aria-hidden />
          <span className="inline-flex items-center gap-2">
            {screen.cta}
            <ArrowRight className="h-[17px] w-[17px]" />
          </span>
        </button>
      </div>
    </div>
  );
}
