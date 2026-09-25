"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  ChevronRight,
  ClipboardList,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import { classHealth } from "@/lib/classHealth";
import { WellbeingDriverCards } from "@/components/dashboard/WellbeingDriverCards";
import { WELLBEING_STATUS_TONE, WELLBEING_STATUS_LABEL, wellbeingStatusFromScore } from "@/lib/classWellbeing";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import { activeDemoSchool } from "@/data/bishopCotton";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";

type DriverItem = {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
  score: number | null;
};

/** A driver's own tone identifies *which* driver it is (kept stable, used
 * for its icon/accent stripe); this separate health read says how it's
 * currently doing — the same Strong/Stable/Watch/Needs Support palette
 * (WELLBEING_STATUS_TONE) used by the Student Wellbeing driver cards and
 * the Classroom Health "Student Distribution" bar, rather than this
 * file's own (slightly different, only-3-tier) band. */
function healthBand(score: number): { tone: string; label: string } {
  const status = wellbeingStatusFromScore(score);
  return { tone: WELLBEING_STATUS_TONE[status], label: WELLBEING_STATUS_LABEL[status] };
}

export function DriverCards({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  // Locked (FTUE) passes an empty roster so every pillar score is zero
  // instead of the mock class's simulated history.
  const ch = useMemo(() => classHealth(locked ? [] : undefined), [locked]);

  // "Behavior and discipline", "Attention and focus", "Task engagement", and
  // "Learning readiness" each have a full dedicated analytics page — send
  // them there. The other drivers don't have a page of their own yet, so
  // their "View details" is a no-op until that's designed.
  const DEDICATED_PAGE: Partial<Record<string, string>> = {
    behavior: "/behavior",
    focus: "/focus",
    task: "/task-engagement",
    academic: "/learning-readiness",
  };
  const handleSelect = (key: string) => {
    const href = DEDICATED_PAGE[key];
    if (href) router.push(href);
  };

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

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Areas impacting your Classroom Health"
    >
      <div className="premium-eyebrow">
        <span>Areas impacting your Classroom Health</span>
      </div>
      <p className="text-[12.5px] text-muted-foreground -mt-1">
        Growth across these areas improve Class Health and Class Efficiency.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DriverGroup
          title="Cognitive Performance"
          Icon={Brain}
          tone={BLUE}
          items={cognitive}
          reduce={!!reduce}
          onSelect={locked ? undefined : handleSelect}
        />
        <WellbeingDriverCards locked={locked} />
      </div>
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
  const avg = onSelect ? activeDemoSchool.metrics.cognitivePerformanceScore.value : null;
  const band = avg != null ? healthBand(avg) : null;

  console.log("Cognitive Performance average:", avg);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-7 flex flex-col gap-5">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${tone} 7%, transparent), transparent 60%)` }}
      />
      <div className="relative flex items-center justify-between gap-3">
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
          {avg != null && band ? (
            <>
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
            </>
          ) : (
            <NotEnoughData />
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-3">
        {items.map((item, i) => {
          const itemBand = item.score != null ? healthBand(item.score) : null;
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
                "group relative w-full text-left overflow-hidden rounded-xl border border-border/60 bg-background/60 pl-4 pr-3.5 py-4 flex items-center gap-3.5 transition-all",
                onSelect && "hover:border-foreground/20 hover:bg-background/90 hover:shadow-sm cursor-pointer",
              )}
            >
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                aria-hidden
                style={{ background: item.tone }}
              />
              <span
                className="h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${item.tone} 14%, transparent)`, color: item.tone }}
              >
                <item.Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-heading font-bold text-[12.5px] leading-tight truncate min-w-0">
                    {item.title}
                  </div>
                  {itemBand && (
                    <span
                      className="shrink-0 inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                      style={{ background: `color-mix(in srgb, ${itemBand.tone} 12%, transparent)`, color: itemBand.tone }}
                    >
                      {itemBand.label}
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug truncate">
                  {item.description}
                </p>
                {item.score != null && itemBand ? (
                  <div className="mt-3.5 h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                    <motion.span
                      initial={reduce ? undefined : { scaleX: 0 }}
                      animate={{ scaleX: item.score / 100 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
                      className="block h-full w-full origin-left rounded-full"
                      style={{ background: itemBand.tone }}
                    />
                  </div>
                ) : (
                  <NotEnoughData className="mt-3.5" />
                )}
              </div>

              {onSelect && (
                <span
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-2 rounded-lg transition-colors"
                  style={{ color: item.tone, background: `color-mix(in srgb, ${item.tone} 10%, transparent)` }}
                >
                  View details
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
