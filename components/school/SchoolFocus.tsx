"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SCHOOL_RECENT_EVENTS, type SchoolRecentEvent } from "@/lib/schoolData";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const SEVERITY_TONE: Record<NonNullable<SchoolRecentEvent["severity"]>, string> = {
  critical: "hsl(0 78% 58%)",
  warning: "hsl(38 92% 50%)",
};
const SEVERITY_COPY: Record<NonNullable<SchoolRecentEvent["severity"]>, string> = {
  critical: "Critical",
  warning: "Warning",
};

export function SchoolFocus() {
  const reduce = useReducedMotion();
  const items = SCHOOL_RECENT_EVENTS.filter((e) => e.kind === "alert" && e.recommend);

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-elevated rounded-[22px] p-5 md:p-6 relative overflow-hidden"
      aria-label="Where to focus this month"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 100% 0%, hsl(48 95% 70% / 0.18), transparent 60%)",
        }}
      />

      <header className="relative z-10 flex items-end justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="premium-eyebrow">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Yellow recommends
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1.5">
            Where to focus this month
          </h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Top {items.length} {items.length === 1 ? "alert" : "alerts"} from this month's classroom
            activity — with a recommended next step for each.
          </p>
        </div>
      </header>

      <div className="relative z-10 divide-y divide-border/60">
        {items.map((item, idx) => (
          <FocusRow key={item.id} event={item} index={idx + 1} />
        ))}
      </div>
    </motion.section>
  );
}

function FocusRow({ event, index }: { event: SchoolRecentEvent; index: number }) {
  const severity = event.severity ?? "warning";
  const tone = SEVERITY_TONE[severity];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 md:gap-6 py-4 first:pt-0 last:pb-0 items-start">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[11.5px] font-extrabold tabular-nums"
          style={{
            background: `color-mix(in srgb, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          {index}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: tone }}
            >
              Alert
            </span>
            <span
              className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                color: tone,
              }}
            >
              {SEVERITY_COPY[severity]}
            </span>
          </div>
          <h3 className="font-heading font-bold text-[14px] leading-tight mt-0.5">{event.title}</h3>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{event.body}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center self-stretch">
        <div className="h-px flex-1 bg-border/70" />
        <div className="px-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Try this
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="h-px flex-1 bg-border/70" />
      </div>

      {event.recommend && (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">
              Strategy
            </span>
          </div>
          <h3 className="font-heading font-bold text-[14px] leading-tight mt-0.5">
            {event.recommend.title}
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">
            {event.recommend.reason}
          </p>
          {event.cta && (
            <Link
              href={event.cta.to}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:text-primary/80 mt-2"
            >
              {event.cta.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
