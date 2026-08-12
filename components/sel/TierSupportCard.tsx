"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import type { TierDistribution } from "@/lib/selGroups";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TIER_TONE = {
  tier1: "hsl(142 55% 45%)",
  tier2: "hsl(38 92% 48%)",
  tier3: "hsl(0 78% 56%)",
} as const;

export function TierSupportCard({ tiers }: { tiers: TierDistribution }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Tiered SEL Support & Response"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <Layers className="h-3 w-3" />
            <span>Tiered SEL Support &amp; Response</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Tier Support Distribution</h3>
        </header>
        <Link href="/sel/groups" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary shrink-0">
          Manage groups
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <TierTile
          tone={TIER_TONE.tier1}
          label="Tier 1 — Universal"
          detail="Students participating in school-wide SEL."
          value={`${tiers.tier1.count} students`}
          sub={`${tiers.tier1.pct}% of school`}
        />
        <TierTile
          tone={TIER_TONE.tier2}
          label="Tier 2 — Targeted"
          detail="Students receiving targeted group support."
          value={`${tiers.tier2.count} students`}
          sub={`${tiers.tier2.pct}% of school`}
        />
        <TierTile
          tone={TIER_TONE.tier3}
          label="Additional Support Required"
          detail="Students needing onward referral or individualized support."
          value={`${tiers.tier3.count} students`}
          sub={null}
        />
      </div>
    </motion.section>
  );
}

function TierTile({
  tone,
  label,
  detail,
  value,
  sub,
}: {
  tone: string;
  label: string;
  detail: string;
  value: string;
  sub: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5" style={{ borderTopColor: tone, borderTopWidth: 2 }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="font-heading font-extrabold text-[17px] tabular-nums leading-none" style={{ color: tone }}>
          {value}
        </span>
        {sub && <span className="text-[11px] font-semibold text-muted-foreground">· {sub}</span>}
      </div>
      <p className="text-[10.5px] text-muted-foreground leading-snug mt-1.5">{detail}</p>
    </div>
  );
}
