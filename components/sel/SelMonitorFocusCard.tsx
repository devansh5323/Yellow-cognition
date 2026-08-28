"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import {
  setSelOnboarding,
  SEL_MONITOR_FOCUS_OPTIONS,
  type SelMonitorFocus,
} from "@/lib/selOnboarding";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** First-time dashboard setup action — shown until the coordinator picks at
 * least one competency to monitor. Kept as its own standalone card (not a
 * generic multi-step framework) since only this one action exists so far;
 * revisit if/when a second dashboard action is confirmed. */
export function SelMonitorFocusCard({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<SelMonitorFocus[]>([]);

  const toggle = (opt: SelMonitorFocus) => {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const confirm = () => {
    if (selected.length === 0) return;
    setSelOnboarding({ monitorFocus: selected });
    onDone();
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="premium-surface rounded-2xl p-5 md:p-6"
      aria-label="Choose what to monitor"
      data-tour-target="sel-monitor-focus"
    >
      <div className="flex items-start gap-3.5">
        <span className="h-11 w-11 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
          <Target className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="premium-eyebrow">
            <span>Action 1</span>
          </div>
          <h2 className="mt-1 font-heading font-extrabold text-[17px] leading-tight">
            Choose what you want to monitor
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            This is useful because SEL needs differ by school.
          </p>

          <p className="mt-4 text-[13px] font-semibold text-foreground/90">
            What would you like Yellow to help you track?
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SEL_MONITOR_FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                data-active={selected.includes(opt)}
                className="premium-pill !h-9 !px-3.5 !text-[12.5px]"
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={selected.length === 0}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 h-11 bg-primary text-primary-foreground font-heading font-bold text-[13.5px] shadow-md shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
