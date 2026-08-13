"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, User, Users, UsersRound, type LucideIcon } from "lucide-react";
import { topSupportAreas, recommendations, type SupportArea, type Recommendation } from "@/lib/classHealth";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const RED = "hsl(0 78% 58%)";
const AMBER = "hsl(38 92% 55%)";
const GREEN = "hsl(142 55% 45%)";

type TierMeta = {
  tier: string;
  category: string;
  tone: string;
  Icon: LucideIcon;
};

const TIERS: TierMeta[] = [
  { tier: "Tier 1", category: "Whole Class", tone: GREEN, Icon: UsersRound },
  { tier: "Tier 2", category: "Small Group", tone: AMBER, Icon: Users },
  { tier: "Tier 3", category: "Individual Support", tone: RED, Icon: User },
];

export function WeeklyFocus({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  // Locked (FTUE) passes an empty roster so every "N students" count is
  // zero instead of the mock class's simulated history.
  const pairs = useMemo(() => {
    const areas = topSupportAreas(locked ? [] : undefined);
    const recs = recommendations(locked ? [] : undefined);
    return areas.map((area, i) => ({ area, rec: recs[i] as Recommendation | undefined }));
  }, [locked]);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="This week's focus"
    >
      <div className="premium-eyebrow">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> Yellow recommends
        </span>
      </div>

      <div className="premium-elevated rounded-[22px] p-5 md:p-6 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 60% at 100% 0%, hsl(280 60% 80% / 0.14), transparent 60%)",
          }}
        />

        <header className="relative z-10 flex items-end justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight">
              This week&apos;s focus
            </h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Top {pairs.length} supports your class needs this week — one for each PBIS tier.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[12px] font-bold hover:opacity-80 transition-opacity"
            style={{ color: AMBER }}
          >
            See all recommendations
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="relative z-10 space-y-3">
          {pairs.map(({ area, rec }, idx) => (
            <FocusRow key={area.id} area={area} rec={rec} index={idx + 1} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FocusRow({
  area,
  rec,
  index,
}: {
  area: SupportArea;
  rec: Recommendation | undefined;
  index: number;
}) {
  const meta = TIERS[Math.min(index - 1, TIERS.length - 1)];
  const tone = meta.tone;

  return (
    <div
      className="rounded-2xl border border-border/60 bg-background/40 border-l-4 overflow-hidden"
      style={{ borderLeftColor: tone }}
    >
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(220px,1fr)_72px_minmax(260px,1.3fr)] gap-4 lg:gap-5 lg:items-center">
        {/* Tier + issue */}
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="h-14 w-14 rounded-full border-2 inline-flex flex-col items-center justify-center gap-0.5 shrink-0"
            style={{ borderColor: tone, color: tone }}
          >
            <meta.Icon className="h-4 w-4" />
            <span className="font-heading font-extrabold text-[11.5px] leading-none whitespace-nowrap">
              {meta.tier}
            </span>
          </span>
          <div className="min-w-0">
            <div
              className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: tone }}
            >
              {meta.category}
            </div>
            <h3 className="font-heading font-extrabold text-[16px] leading-tight mt-1">
              {area.title}
            </h3>
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full mt-1.5"
              style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
            >
              <Users className="h-3 w-3" />
              {area.studentsAffected} students
            </span>
            <p className="text-[12px] text-muted-foreground mt-1.5 leading-snug">
              {stripCount(area.evidence)}.
            </p>
          </div>
        </div>

        {/* Try this divider */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-1 text-muted-foreground">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.12em]">Try this</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Strategy */}
        <div className="min-w-0">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone }}
          >
            Strategy
          </div>
          {rec && (
            <>
              <h3 className="font-heading font-extrabold text-[15px] leading-snug mt-1 max-w-[46ch]">
                {rec.title}.
              </h3>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug max-w-[52ch]">
                {rec.rationale}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Evidence strings lead with "{count} students " — strip it since the count renders as its own badge. */
function stripCount(evidence: string): string {
  return evidence.replace(/^\d+\s+students?\s+/i, "");
}
