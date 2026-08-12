"use client";

import Link from "next/link";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Sparkle,
  Sparkles,
  User,
  UserSquare2,
  Users,
  Users2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  strategyForDriver,
  TIER_RECOMMENDATION_LABEL,
  type RecommendationTier,
  type TierRecommendation,
} from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TIER_TONE: Record<RecommendationTier, string> = {
  wholeClass: "hsl(258 55% 60%)",
  smallGroup: "hsl(196 75% 50%)",
  individual: "hsl(38 92% 48%)",
};

const TIER_ICON: Record<RecommendationTier, LucideIcon> = {
  wholeClass: Users,
  smallGroup: Users2,
  individual: User,
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type TierCta = { label: string; Icon: LucideIcon; onClick?: () => void; href?: string };

function tierCtas(rec: TierRecommendation): TierCta[] {
  if (rec.tier === "wholeClass") {
    return [
      {
        label: "Use this strategy",
        Icon: Wand2,
        onClick: () => {
          const strategy = rec.driverKey ? strategyForDriver(rec.driverKey) : null;
          toast(strategy?.title ?? rec.title, { description: strategy?.rationale ?? rec.detail });
        },
      },
      { label: "Add to weekly plan", Icon: CalendarPlus, onClick: () => comingSoon("Adding to the weekly plan") },
      { label: "Log strategy tried", Icon: ClipboardCheck, onClick: () => comingSoon("Logging a strategy tried") },
    ];
  }
  if (rec.tier === "smallGroup") {
    return [
      { label: "Create group", Icon: Users2, onClick: () => comingSoon("Creating a small group") },
      { label: "Generate routine", Icon: Sparkles, onClick: () => comingSoon("Generating a routine") },
      { label: "Assign workout", Icon: Dumbbell, onClick: () => comingSoon("Assigning an Attention Hero workout") },
      { label: "Log intervention", Icon: ClipboardCheck, onClick: () => comingSoon("Logging this intervention") },
    ];
  }
  return [
    { label: "Prepare summary", Icon: FileText, onClick: () => comingSoon("Preparing an observation summary") },
    { label: "Share profile", Icon: UserSquare2, href: rec.studentId ? `/students/${rec.studentId}?tab=overview` : undefined },
    { label: "Schedule review", Icon: CalendarClock, onClick: () => comingSoon("Scheduling a review") },
  ];
}

export function BehaviorRecommendsStrip({ recommendations }: { recommendations: TierRecommendation[] }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Yellow Recommends — Tier-Wise Insights"
      className="premium-elevated rounded-[20px] p-5 md:p-6 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 100% 0%, hsl(38 92% 80% / 0.22), transparent 65%), radial-gradient(55% 45% at 0% 100%, hsl(258 70% 80% / 0.16), transparent 65%)",
        }}
      />

      <div className="relative">
        <header className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              aria-hidden
              className="relative h-8 w-8 rounded-xl inline-flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 22%, transparent), color-mix(in srgb, hsl(258 70% 70%) 18%, transparent))",
                boxShadow:
                  "inset 0 1px 0 0 hsl(0 0% 100% / 0.5), 0 6px 16px -10px hsl(38 92% 50% / 0.45)",
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-[16px] leading-tight">Yellow Recommends</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Recommended supports by tier — not the same as Priority Actions.
              </p>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] shrink-0 mt-0.5"
            style={{
              color: "hsl(38 92% 38%)",
              background: "color-mix(in srgb, hsl(38 92% 60%) 14%, transparent)",
              border: "1px solid color-mix(in srgb, hsl(38 92% 55%) 28%, transparent)",
            }}
          >
            <Sparkle className="h-2.5 w-2.5" strokeWidth={2.4} />
            AI
          </span>
        </header>

        {recommendations.length === 0 ? (
          <p className="text-[12px] text-muted-foreground mt-4">
            No tiered recommendations right now — the class is holding steady.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => {
              const tone = TIER_TONE[rec.tier];
              const Icon = TIER_ICON[rec.tier];
              return (
                <motion.div
                  key={rec.tier}
                  initial={reduce ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.32, ease: EASE }}
                  className="rounded-xl border bg-background p-3.5 flex flex-col"
                  style={{ borderColor: `color-mix(in srgb, ${tone} 22%, var(--border))` }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 w-fit rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2.4} />
                    {TIER_RECOMMENDATION_LABEL[rec.tier]}
                  </span>
                  <p className="mt-2 text-[12.5px] font-semibold leading-snug text-foreground/90">{rec.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{rec.detail}</p>

                  <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
                    {tierCtas(rec).map((cta) =>
                      cta.href ? (
                        <Link
                          key={cta.label}
                          href={cta.href}
                          className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                        >
                          <cta.Icon className="h-3 w-3" />
                          {cta.label}
                        </Link>
                      ) : (
                        <button
                          key={cta.label}
                          type="button"
                          onClick={cta.onClick}
                          className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                        >
                          <cta.Icon className="h-3 w-3" />
                          {cta.label}
                        </button>
                      ),
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
