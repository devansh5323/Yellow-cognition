"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCheckInsForTeacher } from "@/lib/checkIn";
import type { ClassCheckIn } from "@/data/mockData";
import { cn } from "@/lib/utils";

const TEACHER_NAME = "Maya Khan";
const FRESH_DAYS = 21;
const DUE_DAYS = 35;
const EASE = [0.2, 0.7, 0.2, 1] as const;

type CycleState = "empty" | "fresh" | "due" | "overdue";

function deriveState(latest: ClassCheckIn | undefined): {
  state: CycleState;
  daysSince: number;
} {
  if (!latest) return { state: "empty", daysSince: 0 };
  const days = Math.floor((Date.now() - +new Date(latest.createdAt)) / 86_400_000);
  if (days <= FRESH_DAYS) return { state: "fresh", daysSince: days };
  if (days <= DUE_DAYS) return { state: "due", daysSince: days };
  return { state: "overdue", daysSince: days };
}

function inMonth(iso: string, monthOffset: number): boolean {
  const d = new Date(iso);
  const ref = new Date();
  ref.setDate(1);
  ref.setMonth(ref.getMonth() - monthOffset);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function monthLabel(monthOffset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthOffset);
  return d.toLocaleDateString(undefined, { month: "short" });
}

function describeDaysAgo(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 30) return `${days} days ago`;
  if (days < 45) return "over a month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export function CheckInStatusBanner({ hideCta = false }: { hideCta?: boolean }) {
  const reduce = useReducedMotion();
  // Hydrate after mount — listCheckIns reads localStorage which is browser-only.
  const [history, setHistory] = useState<ClassCheckIn[]>([]);
  useEffect(() => {
    const refresh = () => setHistory(listCheckInsForTeacher(TEACHER_NAME));
    refresh();
  }, []);

  const latest = history[0];
  const { state, daysSince } = deriveState(latest);

  const cycles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const offset = 5 - i; // oldest -> newest
        return {
          offset,
          label: monthLabel(offset),
          submitted: history.some((c) => inMonth(c.createdAt, offset)),
        };
      }),
    [history],
  );

  const palette = STATE_PALETTE[state];
  const Icon = palette.Icon;
  const CtaIcon = palette.CtaIcon;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: palette.accent }} aria-hidden />

      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className={cn(
              "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border",
              palette.iconBg,
            )}
          >
            <Icon className={cn("h-5 w-5", palette.iconText)} />
          </div>
          <div className="min-w-0">
            <div className="premium-eyebrow">
              <span>{palette.eyebrow}</span>
            </div>
            <h2 className="mt-1 font-heading font-extrabold text-[19px] md:text-[21px] leading-tight">
              {palette.headline(daysSince)}
            </h2>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {state === "empty"
                ? "Capture your first class to power friction insights and remedial plans."
                : `Last check-in ${describeDaysAgo(daysSince)}${
                    latest
                      ? ` · ${latest.grade}${latest.section ? ` ${latest.section}` : ""} · ${latest.subject}`
                      : ""
                  }`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <CycleRibbon cycles={cycles} />
          {!hideCta && (
            <Button asChild size="sm" variant={palette.ctaVariant} className={palette.ctaClass}>
              <Link href="/check-in">
                <CtaIcon className="h-3.5 w-3.5" />
                {palette.ctaLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function CycleRibbon({
  cycles,
}: {
  cycles: { offset: number; label: string; submitted: boolean }[];
}) {
  return (
    <div
      className="hidden sm:flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2"
      role="list"
      aria-label="Last six monthly check-ins"
    >
      {cycles.map((c, i) => (
        <div key={c.offset} className="flex items-center gap-3">
          <div role="listitem" title={`${c.label} — ${c.submitted ? "submitted" : "no check-in"}`} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                c.submitted
                  ? "bg-primary shadow-[0_0_0_3px_hsl(142_55%_45%/0.18)]"
                  : "bg-muted border border-border/80",
              )}
              aria-hidden
            />
            <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground leading-none">
              {c.label}
            </span>
          </div>
          {i < cycles.length - 1 && <span className="h-px w-3 bg-border/70 -mt-3.5" aria-hidden />}
        </div>
      ))}
    </div>
  );
}

type Palette = {
  eyebrow: string;
  Icon: typeof CalendarCheck2;
  iconBg: string;
  iconText: string;
  accent: string;
  headline: (d: number) => string;
  ctaLabel: string;
  CtaIcon: typeof ArrowRight;
  ctaVariant: "default" | "outline";
  ctaClass: string;
};

const STATE_PALETTE: Record<CycleState, Palette> = {
  empty: {
    eyebrow: "Monthly check-in",
    Icon: Sparkles,
    iconBg: "bg-primary/10 border-primary/25",
    iconText: "text-primary",
    accent: "hsl(142 55% 45%)",
    headline: () => "Capture your first check-in",
    ctaLabel: "Start check-in",
    CtaIcon: Plus,
    ctaVariant: "default",
    ctaClass: "",
  },
  fresh: {
    eyebrow: "Monthly check-in · up to date",
    Icon: CalendarCheck2,
    iconBg: "bg-primary/10 border-primary/25",
    iconText: "text-primary",
    accent: "hsl(142 55% 45%)",
    headline: (d) =>
      d <= 0
        ? "Submitted today — nicely done"
        : `You're caught up — submitted ${describeDaysAgo(d)}`,
    ctaLabel: "Start next check-in",
    CtaIcon: ArrowRight,
    ctaVariant: "outline",
    ctaClass: "",
  },
  due: {
    eyebrow: "Monthly check-in · due",
    Icon: CalendarCheck2,
    iconBg: "bg-amber-500/10 border-amber-500/30",
    iconText: "text-amber-600",
    accent: "hsl(38 92% 50%)",
    headline: () => "Time for this month's check-in",
    ctaLabel: "Start check-in",
    CtaIcon: ArrowRight,
    ctaVariant: "default",
    ctaClass: "bg-amber-500 hover:bg-amber-500/90 text-white",
  },
  overdue: {
    eyebrow: "Monthly check-in · overdue",
    Icon: AlertCircle,
    iconBg: "bg-destructive/10 border-destructive/30",
    iconText: "text-destructive",
    accent: "hsl(0 78% 56%)",
    headline: (d) => `Overdue · ${Math.max(d - 30, 1)}d past your monthly cadence`,
    ctaLabel: "Catch up now",
    CtaIcon: ArrowRight,
    ctaVariant: "default",
    ctaClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  },
};
