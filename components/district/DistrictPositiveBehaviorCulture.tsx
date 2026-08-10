"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Heart, Megaphone, Share2, Sparkles, Star, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { districtPositiveCulture } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const PURPLE = "hsl(262 60% 62%)";
const TEAL = "hsl(172 55% 40%)";

const QUICK_ACTIONS: { label: string; Icon: LucideIcon }[] = [
  { label: "Recognise a school", Icon: Award },
  { label: "Share strong practice", Icon: Share2 },
  { label: "Generate district communication", Icon: Megaphone },
  { label: "Launch district-wide expectation campaign", Icon: Sparkles },
];

export function DistrictPositiveBehaviorCulture() {
  const reduce = useReducedMotion();
  const culture = useMemo(() => districtPositiveCulture(), []);
  const maxExpectation = Math.max(...culture.topExpectations.map((e) => e.count), 1);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Positive Behaviour Culture Across the District"
    >
      <div className="premium-eyebrow">
        <span>Positive Behaviour Culture Across the District</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        {/* Headline stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            icon={<Heart className="h-4 w-4" />}
            value={culture.totalAcknowledgements.toLocaleString()}
            label="Total Positive Acknowledgements"
            tone={GREEN}
          />
          <StatTile
            icon={<Users className="h-4 w-4" />}
            value={`${culture.studentsRecognized.toLocaleString()}/${culture.totalStudents.toLocaleString()}`}
            label="Students Recognised"
            tone={BLUE}
          />
          <StatTile
            icon={<Star className="h-4 w-4" />}
            value={culture.schoolsWithStrongRecognition}
            label="Schools with Strong Recognition"
            tone={TEAL}
          />
          <StatTile
            icon={<TrendingUp className="h-4 w-4" />}
            value={culture.schoolsShowingGrowth}
            label="Schools Showing Growth"
            tone={GREEN}
          />
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Most recognized expectations */}
        <h2 className="font-heading font-extrabold text-[16px] leading-tight mb-3">
          Most Recognised PBIS Expectations
        </h2>
        <div className="space-y-2.5">
          {culture.topExpectations.map((exp) => (
            <div key={exp.label} className="flex items-center gap-3">
              <span className="text-[12.5px] font-semibold text-foreground/90 w-[180px] shrink-0 truncate">
                {exp.label}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(exp.count / maxExpectation) * 100}%`, background: GREEN }}
                />
              </div>
              <span className="text-[11.5px] text-muted-foreground tabular-nums w-[90px] text-right shrink-0">
                {exp.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OpportunityList
            title="Celebration Opportunities"
            icon={Award}
            tone={GREEN}
            items={culture.celebrationOpportunities}
          />
          <OpportunityList
            title="Practice-Sharing Opportunities"
            icon={Share2}
            tone={PURPLE}
            items={culture.practiceSharingOpportunities}
          />
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Actions */}
        <h2 className="font-heading font-extrabold text-[16px] leading-tight mb-3">Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="rounded-xl border border-border/60 bg-background/30 px-3 py-3.5 flex flex-col items-center justify-center gap-2 text-center transition-colors hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] hover:bg-muted/30"
            >
              <action.Icon className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function StatTile({ icon, value, label, tone }: { icon: ReactNode; value: string | number; label: string; tone: string }) {
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

function OpportunityList({
  title,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  icon: LucideIcon;
  tone: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="font-heading font-extrabold text-[13.5px]">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-snug">
            <span className="mt-[7px] h-1 w-1 rounded-full shrink-0" style={{ background: tone }} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
