"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Ear,
  Eye,
  Layers,
  Shuffle,
  Sparkle,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { AttentionInsight, AttentionInsightTone } from "@/lib/classFocus";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICONS: Record<AttentionInsight["iconKey"], LucideIcon> = {
  clock: Clock,
  ear: Ear,
  eye: Eye,
  timer: Timer,
  shuffle: Shuffle,
  layers: Layers,
  spark: Sparkle,
};

const TONE: Record<AttentionInsightTone, { hue: string; label: string; bg: string }> = {
  warning: {
    hue: "hsl(0 78% 56%)",
    label: "Action needed",
    bg: "color-mix(in srgb, hsl(0 78% 60%) 8%, transparent)",
  },
  watch: {
    hue: "hsl(38 92% 48%)",
    label: "Watch",
    bg: "color-mix(in srgb, hsl(38 92% 60%) 8%, transparent)",
  },
  info: {
    hue: "hsl(212 55% 50%)",
    label: "Pattern",
    bg: "color-mix(in srgb, hsl(212 60% 60%) 8%, transparent)",
  },
  positive: {
    hue: "hsl(142 55% 42%)",
    label: "Strength",
    bg: "color-mix(in srgb, hsl(142 55% 50%) 8%, transparent)",
  },
};

export function AttentionPatternInsights({ insights }: { insights: AttentionInsight[] }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Attention pattern insights"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Class patterns</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Attention pattern insights
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            Plain-language reads of how your class is paying attention right now.
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map((insight, i) => {
          const Icon = ICONS[insight.iconKey];
          const tone = TONE[insight.tone];
          return (
            <motion.li
              key={insight.id}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
              className="rounded-xl border border-border bg-background p-3.5 flex items-start gap-3 transition-colors hover:border-foreground/15"
            >
              <span
                aria-hidden
                className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
                style={{
                  background: tone.bg,
                  color: tone.hue,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone.hue} 22%, transparent)`,
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.10em]"
                    style={{
                      color: tone.hue,
                      background: `color-mix(in srgb, ${tone.hue} 12%, transparent)`,
                    }}
                  >
                    {tone.label}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground/90">
                  {insight.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {insight.detail}
                </p>
                <Link
                  href={`/students?ids=${insight.studentIds.join(",")}`}
                  className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
                  style={{ color: tone.hue }}
                >
                  View students
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
