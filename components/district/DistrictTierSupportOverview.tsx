"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  Info,
  Layers,
  Minus,
  School,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { districtTierSupport } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";
const BLUE = "hsl(212 90% 58%)";
const ORANGE = "hsl(28 88% 54%)";
const PURPLE = "hsl(262 60% 62%)";

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <ArrowUpRight className="h-3 w-3" />;
  if (delta < 0) return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function DonutRing({ pct, tone, size = 40 }: { pct: number; tone: string; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-muted/40"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={tone}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function DistrictTierSupportOverview() {
  const reduce = useReducedMotion();
  const tier = useMemo(() => districtTierSupport(), []);

  const tiers = [
    { key: "tier1", label: "Tier 1", pct: tier.tier1Pct, count: tier.tier1Count, delta: tier.tier1Delta, tone: GREEN },
    { key: "tier2", label: "Tier 2", pct: tier.tier2Pct, count: tier.tier2Count, delta: tier.tier2Delta, tone: AMBER },
    { key: "tier3", label: "Tier 3", pct: tier.tier3Pct, count: tier.tier3Count, delta: tier.tier3Delta, tone: RED },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Tier Support and Student-Support Overview"
    >
      <div className="premium-eyebrow">
        <span>District Tier Support &amp; Student-Support Overview</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        {/* Tier distribution */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="inline-flex items-center gap-1.5 font-heading font-extrabold text-[16px] leading-tight">
            Tier Distribution
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {tier.totalStudents.toLocaleString()} students district-wide
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/50">
          {tiers.map((t) => (
            <span
              key={t.key}
              className="h-full"
              style={{ flex: `${t.pct} 1 0`, background: t.tone }}
              title={`${t.label}: ${t.pct}%`}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div
              key={t.key}
              className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
              style={{
                background: `color-mix(in srgb, ${t.tone} 6%, var(--card))`,
                borderColor: `color-mix(in srgb, ${t.tone} 24%, transparent)`,
              }}
            >
              <DonutRing pct={t.pct} tone={t.tone} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-[17px] tabular-nums" style={{ color: t.tone }}>
                    {t.pct}%
                  </span>
                  <span className="text-[12.5px] font-semibold text-foreground/90">{t.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                  {t.count.toLocaleString()} students
                </div>
              </div>
              <span
                className="inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums shrink-0"
                style={{ color: t.delta > 0 ? AMBER : t.delta < 0 ? GREEN : "var(--muted-foreground)" }}
              >
                <DeltaIcon delta={t.delta} />
                {t.delta > 0 ? "+" : ""}
                {t.delta}
              </span>
            </div>
          ))}
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Support pipeline stats */}
        <h2 className="inline-flex items-center gap-1.5 font-heading font-extrabold text-[16px] leading-tight mb-3">
          Support Pipeline
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatTile icon={<ClipboardList className="h-4 w-4" />} value={tier.newReferrals} label="New Referrals" tone={BLUE} />
          <StatTile
            icon={<CalendarClock className="h-4 w-4" />}
            value={tier.casesAwaitingReview}
            label="Cases Awaiting Review"
            tone={AMBER}
          />
          <StatTile
            icon={<Layers className="h-4 w-4" />}
            value={tier.activeInterventions}
            label="Active Interventions"
            tone={PURPLE}
          />
          <StatTile
            icon={<TrendingUp className="h-4 w-4" />}
            value={tier.studentsImproving}
            label="Students Improving"
            tone={GREEN}
          />
          <StatTile
            icon={<TrendingDown className="h-4 w-4" />}
            value={tier.limitedResponse}
            label="Limited Response"
            tone={ORANGE}
          />
          <StatTile
            icon={<ShieldAlert className="h-4 w-4" />}
            value={tier.escalations}
            label="Escalations"
            tone={RED}
          />
          <StatTile
            icon={<School className="h-4 w-4" />}
            value={tier.schoolsHighSupportDemand}
            label="Schools with High Support Demand"
            tone={RED}
          />
          <StatTile
            icon={<AlertTriangle className="h-4 w-4" />}
            value={`${Math.round((tier.limitedResponse / Math.max(1, tier.activeInterventions)) * 100)}%`}
            label="Limited-Response Rate"
            tone={AMBER}
          />
        </div>
      </div>
    </motion.section>
  );
}

function StatTile({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-3.5">
      <span
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <div className="mt-2.5 font-heading font-extrabold text-[20px] leading-none tabular-nums" style={{ color: tone }}>
        {value}
      </div>
      <div className="mt-1 text-[10.5px] text-muted-foreground leading-snug">{label}</div>
    </div>
  );
}
