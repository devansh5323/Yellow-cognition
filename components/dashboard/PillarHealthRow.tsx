"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import Link from "next/link";
import {
  classHealth,
  pillarStatus,
  primaryPillarCounts,
  studentComposites,
  type PillarKey,
  type PillarStatus,
} from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Pillar = {
  key: PillarKey;
  label: string;
  tone: string;
  href?: string;
};

const PILLARS: Pillar[] = [
  { key: "focus", label: "Focus", tone: "hsl(38 92% 55%)", href: "/focus" },
  {
    key: "behavior",
    label: "Behaviour and Discipline",
    tone: "hsl(212 90% 58%)",
    href: "/behavior",
  },
  {
    key: "task",
    label: "Task completion",
    tone: "hsl(0 78% 58%)",
    href: "/task-engagement",
  },
  {
    key: "academic",
    label: "Learning Readiness",
    tone: "hsl(142 55% 45%)",
    href: "/learning-outcomes",
  },
];

const STATUS_LABEL: Record<PillarStatus, string> = {
  stable: "On track",
  watch: "Watch",
  improving: "Improving",
  "needs-attention": "Needs support",
};

const STATUS_TONE: Record<PillarStatus, string> = {
  stable: "hsl(142 55% 45%)",
  watch: "hsl(38 92% 55%)",
  improving: "hsl(212 90% 58%)",
  "needs-attention": "hsl(0 78% 58%)",
};

export function PillarHealthRow() {
  const reduce = useReducedMotion();
  const ch = useMemo(() => classHealth(), []);
  const composites = useMemo(() => studentComposites(), []);
  const counts = useMemo(() => primaryPillarCounts(composites), [composites]);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="How each area is doing"
    >
      <div className="premium-eyebrow">
        <span>How each area is doing</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PILLARS.map((p) => {
          const score = ch.pillars[p.key];
          const delta = ch.pillarDelta[p.key];
          const status = pillarStatus(score, delta);
          const statusTone = STATUS_TONE[status];
          const deltaPositive = delta >= 0;
          const studentsUnder = counts[p.key];
          const total = ch.total;

          const body = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {p.label}
                </span>
                <span
                  className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${statusTone} 12%, transparent)`,
                    color: statusTone,
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className="font-heading font-extrabold text-[28px] leading-none tabular-nums"
                  style={{ color: p.tone }}
                >
                  {score}
                </span>
                <span
                  className="inline-flex items-center text-[11px] font-bold tabular-nums"
                  style={{ color: deltaPositive ? "hsl(142 55% 45%)" : "hsl(0 78% 58%)" }}
                >
                  {deltaPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(delta)}
                </span>
              </div>

              <CountRow
                count={studentsUnder}
                total={total}
                tone={p.tone}
                label={p.label}
                clickable={!!p.href}
              />
            </>
          );

          if (p.href) {
            return (
              <Link
                key={p.key}
                href={p.href}
                aria-label={`${p.label} — view detail`}
                className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] hover:shadow-[0_14px_28px_-18px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {body}
              </Link>
            );
          }

          return (
            <article
              key={p.key}
              className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
            >
              {body}
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}

function CountRow({
  count,
  total,
  tone,
  label,
  clickable = false,
}: {
  count: number;
  total: number;
  tone: string;
  label: string;
  clickable?: boolean;
}) {
  const safeTotal = Math.max(1, total);
  const pct = (count / safeTotal) * 100;
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-heading font-extrabold text-[15px] tabular-nums leading-none"
          style={{ color: tone }}
        >
          {count}
        </span>
        <span className="text-[12px] tabular-nums text-muted-foreground">of {total} students</span>
        {clickable && (
          <span
            aria-hidden
            className="ml-auto inline-flex items-center gap-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100"
            style={{ color: tone }}
          >
            View
            <ArrowUpRight className="h-3 w-3" strokeWidth={2.6} />
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-muted/50 overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: tone }}
          aria-label={`${count} of ${total} students under ${label}`}
        />
      </div>
    </div>
  );
}
