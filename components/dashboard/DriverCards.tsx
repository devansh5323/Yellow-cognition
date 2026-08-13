"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  ClipboardList,
  Cloud,
  Frown,
  HeartHandshake,
  HeartPulse,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import { classHealth } from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";
const INDIGO = "hsl(243 75% 65%)";

type DriverItem = {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
  score: number;
};

export function DriverCards({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  // Locked (FTUE) passes an empty roster so every pillar score is zero
  // instead of the mock class's simulated history.
  const ch = useMemo(() => classHealth(locked ? [] : undefined), [locked]);

  const cognitive: DriverItem[] = [
    {
      key: "focus",
      title: "Attention and focus",
      description: "How well your class stays focused",
      Icon: Target,
      tone: BLUE,
      score: ch.pillars.focus,
    },
    {
      key: "academic",
      title: "Learning readiness",
      description: "How prepared your class is to learn",
      Icon: BookOpen,
      tone: GREEN,
      score: ch.pillars.academic,
    },
    {
      key: "task",
      title: "Task engagement",
      description: "How well your class engages with assigned tasks",
      Icon: ClipboardList,
      tone: ORANGE,
      score: ch.pillars.task,
    },
    {
      key: "behavior",
      title: "Behavior and discipline",
      description: "How consistently your class meets behavior expectations",
      Icon: Shield,
      tone: PURPLE,
      score: ch.pillars.behavior,
    },
  ];

  // Mirrors StudentWellbeingRow.tsx's demo scores (72/81/64) — this is the
  // same "hardcoded but plausible" data, just regrouped under Driver Cards'
  // Student Wellbeing card. Zeroed when locked, same as every other FTUE
  // segment on this dashboard.
  const wellbeing: DriverItem[] = [
    {
      key: "anxiety",
      title: "Anxiety and Coping Index",
      description: "How well your class copes with stress",
      Icon: Cloud,
      tone: INDIGO,
      score: locked ? 0 : 72,
    },
    {
      key: "peer-safety",
      title: "Peer Safety and Belonging",
      description: "How inclusive peer interactions are in your class",
      Icon: HeartHandshake,
      tone: PURPLE,
      score: locked ? 0 : 81,
    },
    {
      key: "frustration",
      title: "Anger and Emotional Regulation",
      description: "How your class manages strong emotions",
      Icon: Frown,
      tone: ORANGE,
      score: locked ? 0 : 64,
    },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Driver cards"
    >
      <div className="premium-eyebrow">
        <span>Driver cards</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DriverGroup title="Cognitive Performance" Icon={Brain} tone={BLUE} items={cognitive} />
        <DriverGroup title="Student Wellbeing" Icon={HeartPulse} tone={INDIGO} items={wellbeing} />
      </div>
    </motion.section>
  );
}

function DriverGroup({
  title,
  Icon,
  tone,
  items,
}: {
  title: string;
  Icon: LucideIcon;
  tone: string;
  items: DriverItem[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span
          className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-heading font-extrabold text-[16px] leading-tight">{title}</h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${item.tone} 14%, transparent)`, color: item.tone }}
              >
                <item.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="font-heading font-bold text-[13px] leading-tight">{item.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {item.description}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span
                className="font-heading font-extrabold text-[18px] tabular-nums leading-none"
                style={{ color: item.tone }}
              >
                {item.score}
              </span>
              <span className="text-muted-foreground text-[10px] font-bold">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
