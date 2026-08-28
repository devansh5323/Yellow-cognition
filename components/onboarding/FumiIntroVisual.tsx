"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Gamepad2, Sparkles } from "lucide-react";
import { FumiMascot } from "@/components/onboarding/FumiMascot";
import type { FumiIntroVisual } from "@/components/onboarding/fumiIntroContent";

const FUR_LIGHT = "#BBD1DB";
const FUR_DEEP = "#6E8FA0";

/** Illustrative (not literal) mock of the Fumi app — a small report tile
 * and a game tile, since no real product screenshots exist to drop in
 * here yet. Keeps the same storybook-calm palette as FumiMascot. */
function AppPreviewMock() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-40 w-full max-w-[280px] sm:h-44">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 rounded-[22px] border border-border/70 bg-card/90 backdrop-blur shadow-[0_18px_40px_-24px_hsl(230_50%_18%/0.35)] p-4 flex flex-col gap-2.5"
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: FUR_DEEP }} aria-hidden />
          <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-border" aria-hidden />
          <span className="ml-auto text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Fumi
          </span>
        </div>

        <div
          className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
          style={{ background: `color-mix(in srgb, ${FUR_LIGHT} 45%, transparent)` }}
        >
          <span className="h-7 w-7 rounded-lg bg-card inline-flex items-center justify-center shrink-0" style={{ color: FUR_DEEP }}>
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-foreground/85">Weekly progress report</div>
            <div className="h-1.5 w-24 rounded-full bg-card mt-1 overflow-hidden">
              <span className="block h-full w-2/3 rounded-full" style={{ background: FUR_DEEP }} />
            </div>
          </div>
        </div>

        <div
          className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
          style={{ background: `color-mix(in srgb, ${FUR_LIGHT} 45%, transparent)` }}
        >
          <span className="h-7 w-7 rounded-lg bg-card inline-flex items-center justify-center shrink-0" style={{ color: FUR_DEEP }}>
            <Gamepad2 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-foreground/85">Today&apos;s focus activity</div>
            <div className="text-[10px] text-muted-foreground">2 games · 8 mins</div>
          </div>
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: FUR_DEEP }} />
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="absolute -bottom-5 -right-4 h-20 w-20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
      >
        <FumiMascot className="h-full w-full" />
      </motion.div>
    </div>
  );
}

export function FumiIntroVisualPicker({ visual }: { visual: FumiIntroVisual }) {
  if (visual === "app-preview") return <AppPreviewMock />;
  if (visual === "mascot") return <FumiMascot className="mx-auto h-36 w-36 sm:h-40 sm:w-40" />;
  return null;
}
