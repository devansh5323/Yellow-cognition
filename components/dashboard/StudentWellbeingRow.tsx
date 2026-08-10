"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Cloud,
  EllipsisVertical,
  Eye,
  Frown,
  HeartHandshake,
  Info,
  Lightbulb,
  Shield,
  SignalMedium,
  Users,
  type LucideIcon,
} from "lucide-react";
import { wavePoints } from "@/components/dashboard/Sparkline";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const RED = "hsl(0 78% 58%)";
const AMBER = "hsl(38 92% 55%)";
const ORANGE = "hsl(28 88% 54%)";
const PURPLE = "hsl(262 60% 62%)";
const INDIGO = "hsl(243 75% 65%)";
const LINK_BLUE = "hsl(212 90% 62%)";

type SupportLevel = "Moderate" | "Needs Attention" | "Strong";
type Band = "Stable" | "Watch" | "Healthy";

const SUPPORT_LEVEL_TONE: Record<SupportLevel, string> = {
  Moderate: AMBER,
  "Needs Attention": ORANGE,
  Strong: GREEN,
};

const BAND_TONE: Record<Band, string> = {
  Stable: INDIGO,
  Watch: ORANGE,
  Healthy: GREEN,
};

type WellbeingCard = {
  key: string;
  title: string;
  Icon: LucideIcon;
  tone: string;
  score: number;
  band: Band;
  delta: number;
  studentsCount: number;
  studentsLine: string;
  supportLevel: SupportLevel;
  supportDesc: string;
  mostVisible: string;
  mostVisibleDesc: string;
  nextStep: string;
  nextStepDesc: string;
  footerNote: string;
};

const CARDS: WellbeingCard[] = [
  {
    key: "anxiety",
    title: "Anxiety Coping Index",
    Icon: Cloud,
    tone: INDIGO,
    score: 72,
    band: "Stable",
    delta: 2,
    studentsCount: 8,
    studentsLine: "may need coping support during transitions or uncertainty.",
    supportLevel: "Moderate",
    supportDesc: "Monitor and provide timely support.",
    mostVisible: "Transitions",
    mostVisibleDesc: "During class changes, new tasks, or routines.",
    nextStep: "Use a calming preview",
    nextStepDesc: "Give a heads-up before changes or new activities.",
    footerNote:
      "This index reflects students' ability to manage worry, uncertainty and pressure in the classroom.",
  },
  {
    key: "frustration",
    title: "Anger & Emotional Regulation",
    Icon: Frown,
    tone: ORANGE,
    score: 64,
    band: "Watch",
    delta: -5,
    studentsCount: 11,
    studentsLine: "may escalate during challenging tasks or corrections.",
    supportLevel: "Needs Attention",
    supportDesc: "Intervene and build regulation skills.",
    mostVisible: "Multi-step Activities",
    mostVisibleDesc: "During difficult tasks, mistakes, or feedback.",
    nextStep: "Break tasks into smaller steps",
    nextStepDesc: "Provide encouragement and positive prompts.",
    footerNote: "This index reflects students' ability to manage frustration during challenging situations.",
  },
  {
    key: "peer-safety",
    title: "Peer Safety & Belonging",
    Icon: HeartHandshake,
    tone: PURPLE,
    score: 81,
    band: "Healthy",
    delta: 3,
    studentsCount: 4,
    studentsLine: "may need peer support for inclusion or social confidence.",
    supportLevel: "Strong",
    supportDesc: "Continue positive reinforcement.",
    mostVisible: "Group Activities",
    mostVisibleDesc: "During group work, lunch, or free time.",
    nextStep: "Start a peer connection routine",
    nextStepDesc: "Use buddy systems or check-in circles.",
    footerNote: "This index reflects students' sense of safety, belonging and positive peer relationships.",
  },
];

export function StudentWellbeingRow() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Student Well-Being and Safety"
    >
      <div className="premium-eyebrow">
        <span>Student Well-Being &amp; Safety</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-end mb-4">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[12px] font-bold hover:underline shrink-0"
            style={{ color: LINK_BLUE }}
          >
            View all insights
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CARDS.map((card, idx) => (
            <WellbeingCardItem key={card.key} card={card} seed={idx} />
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start gap-2.5">
          <span className="h-6 w-6 rounded-full inline-flex items-center justify-center shrink-0 bg-muted/70 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11.5px] text-muted-foreground leading-snug">
            These insights are based on check-ins, behavior data, and classroom observations. For critical
            concerns, follow your school&apos;s support escalation process.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function WellbeingCardItem({ card, seed }: { card: WellbeingCard; seed: number }) {
  const trend = useMemo(() => wavePoints(card.score, seed), [card.score, seed]);
  const bandTone = BAND_TONE[card.band];
  const supportTone = SUPPORT_LEVEL_TONE[card.supportLevel];
  const deltaPositive = card.delta >= 0;

  return (
    <article className="rounded-2xl border border-border/60 bg-background/40 flex flex-col overflow-hidden">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${card.tone} 14%, transparent)`, color: card.tone }}
            >
              <card.Icon className="h-4.5 w-4.5" />
            </span>
            <span className="inline-flex items-center gap-1.5 font-heading font-extrabold text-[14px] leading-tight min-w-0">
              {card.title}
              <Info className="h-3 w-3 text-muted-foreground shrink-0" />
            </span>
          </div>
          <EllipsisVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-3 mt-3.5">
          <div className="shrink-0 flex items-center gap-2.5">
            <div className="flex items-baseline gap-1">
              <span
                className="font-heading font-extrabold text-[34px] leading-none tabular-nums"
                style={{ color: card.tone }}
              >
                {card.score}
              </span>
              <span className="text-muted-foreground text-[13px] font-bold">/100</span>
            </div>
            <span
              className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.08em] px-2.5 py-1.5 rounded-full"
              style={{ background: `color-mix(in srgb, ${bandTone} 14%, transparent)`, color: bandTone }}
            >
              {card.band}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <Sparkline data={trend} tone={card.tone} />
            <div
              className="flex items-center justify-end gap-1 text-[10.5px] font-bold mt-1"
              style={{ color: deltaPositive ? GREEN : RED }}
            >
              {deltaPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(card.delta)}
              <span className="text-muted-foreground font-medium">from last month</span>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-border/60 flex items-start gap-2.5">
          <span
            className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${card.tone} 14%, transparent)`, color: card.tone }}
          >
            <Users className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11.5px] leading-snug">
            <span className="font-extrabold" style={{ color: card.tone }}>
              {card.studentsCount} students
            </span>{" "}
            <span className="text-muted-foreground">{card.studentsLine}</span>
          </p>
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-border/60 grid grid-cols-3 gap-2.5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <SignalMedium className="h-3 w-3" />
              Support Level
            </div>
            <span
              className="inline-flex items-center text-[9.5px] font-bold px-1.5 py-0.5 rounded-md mt-1.5"
              style={{ background: `color-mix(in srgb, ${supportTone} 14%, transparent)`, color: supportTone }}
            >
              {card.supportLevel}
            </span>
            <p className="text-[10px] text-muted-foreground leading-snug mt-1.5">{card.supportDesc}</p>
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <Eye className="h-3 w-3" />
              Most Visible
            </div>
            <span
              className="inline-flex items-center text-[9.5px] font-bold px-1.5 py-0.5 rounded-md mt-1.5"
              style={{ background: `color-mix(in srgb, ${card.tone} 14%, transparent)`, color: card.tone }}
            >
              {card.mostVisible}
            </span>
            <p className="text-[10px] text-muted-foreground leading-snug mt-1.5">{card.mostVisibleDesc}</p>
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              Suggested Next Step
            </div>
            <p className="font-heading font-extrabold text-[11px] leading-snug mt-1.5">{card.nextStep}</p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-1">{card.nextStepDesc}</p>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 border-t flex items-start justify-between gap-2.5"
        style={{ borderColor: `color-mix(in srgb, ${card.tone} 16%, transparent)` }}
      >
        <p className="inline-flex items-start gap-1.5 text-[10px] text-muted-foreground leading-snug min-w-0">
          <Info className="h-3 w-3 shrink-0 mt-0.5" />
          {card.footerNote}
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg border shrink-0 hover:opacity-80 transition-opacity"
          style={{
            borderColor: `color-mix(in srgb, ${card.tone} 40%, transparent)`,
            color: card.tone,
          }}
        >
          View details
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}

/** Compact, hover-enabled trend line — compressed height, with a tooltip on each point. */
function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 100;
  const h = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const points = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 6) - 3,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const gradientId = `wellbeing-fill-${tone.replace(/[^a-zA-Z0-9]/g, "")}`;
  const areaPath = `${path} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="relative w-full h-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity={0.28} />
            <stop offset="100%" stopColor={tone} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={path} fill="none" stroke={tone} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={1.5} fill={tone} />
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full rounded-md border border-border/70 bg-popover px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-md pointer-events-none z-10"
          style={{
            left: `${points[hover].x}%`,
            top: `${(points[hover].y / h) * 100}%`,
            marginTop: "-4px",
            color: tone,
          }}
        >
          {Math.round(data[hover])}
        </div>
      )}
    </div>
  );
}
