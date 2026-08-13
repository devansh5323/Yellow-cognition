"use client";

import { useMemo, useState } from "react";
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
import { classHealth, pillarScores, type PillarKey } from "@/lib/classHealth";
import { STUDENTS, type RiskLevel, type Student } from "@/data/mockData";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";
const INDIGO = "hsl(243 75% 65%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";

type DriverItem = {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
  score: number;
};

/** A driver's own tone identifies *which* driver it is (kept stable); this
 * separate health read says how it's currently doing — same green/amber/red
 * language used everywhere else on the dashboard. */
function healthBand(score: number): { tone: string; label: string } {
  if (score >= 80) return { tone: GREEN, label: "Strong" };
  if (score >= 60) return { tone: AMBER, label: "Moderate" };
  return { tone: RED, label: "Needs attention" };
}

function average(items: DriverItem[]): number {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length);
}

const PILLAR_KEYS: PillarKey[] = ["focus", "academic", "task", "behavior"];

function isPillarKey(key: string): key is PillarKey {
  return (PILLAR_KEYS as string[]).includes(key);
}

const RISK_RANK: Record<RiskLevel, number> = { "at-risk": 3, high: 2, medium: 1, low: 0 };

/** Cognitive drivers map onto real per-student pillar scores, so the
 * drilldown can show an exact number and sort weakest-first. Wellbeing
 * drivers only have a class-level mock average (no per-student model exists
 * yet), so their drilldown surfaces at-risk students instead of a fabricated
 * per-driver score. */
function driverDrilldown(key: string): {
  students: Student[];
  metricValue?: (s: Student) => string | number;
} {
  if (isPillarKey(key)) {
    const students = [...STUDENTS].sort((a, b) => pillarScores(a)[key] - pillarScores(b)[key]);
    return { students, metricValue: (s) => pillarScores(s)[key] };
  }
  const students = [...STUDENTS].sort((a, b) => RISK_RANK[b.risk] - RISK_RANK[a.risk]);
  return { students };
}

export function DriverCards({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  // Locked (FTUE) passes an empty roster so every pillar score is zero
  // instead of the mock class's simulated history.
  const ch = useMemo(() => classHealth(locked ? [] : undefined), [locked]);
  const [drillKey, setDrillKey] = useState<string | null>(null);

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

  const allItems = [...cognitive, ...wellbeing];
  const drillItem = drillKey ? allItems.find((i) => i.key === drillKey) : undefined;
  const drill = drillKey ? driverDrilldown(drillKey) : null;

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
      <p className="text-[12.5px] text-muted-foreground -mt-1">
        The specific signals behind your Class Health Score, grouped by cognitive performance and
        well-being.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DriverGroup
          title="Cognitive Performance"
          Icon={Brain}
          tone={BLUE}
          items={cognitive}
          reduce={!!reduce}
          onSelect={locked ? undefined : setDrillKey}
        />
        <DriverGroup
          title="Student Wellbeing"
          Icon={HeartPulse}
          tone={INDIGO}
          items={wellbeing}
          reduce={!!reduce}
          onSelect={locked ? undefined : setDrillKey}
        />
      </div>

      {drillItem && drill && (
        <StudentDrillDialog
          open={!!drillKey}
          onOpenChange={(open) => setDrillKey(open ? drillKey : null)}
          title={drillItem.title}
          description={
            isPillarKey(drillItem.key)
              ? `${drill.students.length} students, sorted lowest first for ${drillItem.title.toLowerCase()}.`
              : `${drill.students.length} students to check in on for ${drillItem.title.toLowerCase()}.`
          }
          students={drill.students}
          metricLabel={drill.metricValue ? "/100" : undefined}
          metricValue={drill.metricValue}
        />
      )}
    </motion.section>
  );
}

function DriverGroup({
  title,
  Icon,
  tone,
  items,
  reduce,
  onSelect,
}: {
  title: string;
  Icon: LucideIcon;
  tone: string;
  items: DriverItem[];
  reduce: boolean;
  onSelect?: (key: string) => void;
}) {
  const avg = average(items);
  const band = healthBand(avg);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="font-heading font-extrabold text-[16px] leading-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-heading font-extrabold text-[22px] tabular-nums leading-none"
            style={{ color: tone }}
          >
            {avg}
            <span className="text-muted-foreground text-[12px] font-bold">/100</span>
          </span>
          <span
            className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full"
            style={{ background: `color-mix(in srgb, ${band.tone} 14%, transparent)`, color: band.tone }}
          >
            {band.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item, i) => {
          const itemBand = healthBand(item.score);
          const isLastOdd = items.length % 2 === 1 && i === items.length - 1;
          return (
            <motion.button
              type="button"
              key={item.key}
              onClick={onSelect ? () => onSelect(item.key) : undefined}
              disabled={!onSelect}
              initial={reduce ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}
              className={cn(
                "group w-full text-left rounded-xl border border-border/60 bg-background/50 p-3 transition-colors",
                onSelect && "hover:border-foreground/15 hover:bg-background/80 cursor-pointer",
                isLastOdd && "sm:col-span-2",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${item.tone} 14%, transparent)`, color: item.tone }}
                >
                  <item.Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1 font-heading font-bold text-[12.5px] leading-tight truncate">
                  {item.title}
                </div>
                <div className="flex items-baseline gap-0.5 shrink-0">
                  <span
                    className="font-heading font-extrabold text-[15px] tabular-nums leading-none"
                    style={{ color: item.tone }}
                  >
                    {item.score}
                  </span>
                  <span className="text-muted-foreground text-[9px] font-bold">/100</span>
                </div>
              </div>

              <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug">{item.description}</p>

              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted/50 overflow-hidden">
                  <motion.span
                    initial={reduce ? undefined : { scaleX: 0 }}
                    animate={{ scaleX: item.score / 100 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                    className="block h-full w-full origin-left rounded-full"
                    style={{ background: item.tone }}
                  />
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.06em] shrink-0"
                  style={{ color: itemBand.tone }}
                >
                  {itemBand.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
