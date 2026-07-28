"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { visibleGrowth, priorityAlert } from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const POSITIVE = "hsl(142 55% 45%)";
const NEGATIVE = "hsl(0 78% 58%)";

export function GrowthAlertRow() {
  const reduce = useReducedMotion();
  const growth = useMemo(() => visibleGrowth(), []);
  const alert = useMemo(() => priorityAlert(), []);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="What changed this week"
    >
      <div className="premium-eyebrow">
        <span>What changed this week</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Banner
          tone={POSITIVE}
          eyebrow="Visible growth"
          icon={<TrendingUp className="h-4 w-4" />}
          headline={growth?.headline ?? "No clear gains this week"}
          detail={
            growth?.detail ??
            "Keep at the routines you have in place — growth shows up over the next check-in."
          }
          action="See contributors"
        />
        <Banner
          tone={NEGATIVE}
          eyebrow="Priority alert"
          severity="HIGH"
          icon={<AlertTriangle className="h-4 w-4" />}
          headline={alert?.headline ?? "Nothing critical this week"}
          detail={alert?.detail ?? "You're in a good window to push on a stretch goal."}
          action="View affected"
        />
      </div>
    </motion.section>
  );
}

function Banner({
  tone,
  eyebrow,
  severity,
  icon,
  headline,
  detail,
  action,
}: {
  tone: string;
  eyebrow: string;
  severity?: string;
  icon: ReactNode;
  headline: string;
  detail: string;
  action: string;
}) {
  return (
    <article
      className="relative rounded-2xl border p-4 flex items-start gap-3 transition-transform hover:-translate-y-0.5"
      style={{
        background: `color-mix(in srgb, ${tone} 6%, var(--card))`,
        borderColor: `color-mix(in srgb, ${tone} 28%, transparent)`,
      }}
    >
      <span
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in srgb, ${tone} 16%, transparent)`,
          color: tone,
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone }}
          >
            {eyebrow}
          </span>
          {severity && (
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tone} 18%, transparent)`,
                color: tone,
              }}
            >
              · {severity}
            </span>
          )}
        </div>
        <h3
          className="font-heading font-extrabold text-[15px] leading-tight mt-1"
          style={{ color: tone }}
        >
          {headline}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{detail}</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold mt-2.5 hover:underline"
          style={{ color: tone }}
        >
          {action}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}
