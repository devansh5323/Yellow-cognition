"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  READINESS_STATUS_LABEL,
  READINESS_STATUS_TONE,
  type ReadinessSnapshot,
  type ReadinessStatus,
} from "@/lib/classLearning";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STATUS_ORDER: ReadinessStatus[] = ["strong", "stable", "watch", "support"];

export function LearningReadinessSnapshot({ snapshot }: { snapshot: ReadinessSnapshot }) {
  const reduce = useReducedMotion();

  if (snapshot.score == null || snapshot.status == null) {
    return (
      <NotEnoughDataPanel
        title="Not enough data yet"
        description="We don't have enough real learning-readiness signal yet to show an overall score for this class."
      />
    );
  }

  const tone = READINESS_STATUS_TONE[snapshot.status];
  const stableOrStrong = snapshot.statusDistribution.strong + snapshot.statusDistribution.stable;

  const insight =
    snapshot.strongestAreas.length > 0 && snapshot.supportAreas.length > 0
      ? `The class shows stronger readiness in ${snapshot.strongestAreas
          .map((a) => a.label)
          .join(" and ")}, while ${snapshot.supportAreas
          .map((a) => a.label)
          .join(" and ")} may need support.`
      : "Not enough area-level data yet to compare strengths and support needs.";

  return (
    <section
      aria-label="Learning readiness snapshot"
      className="premium-elevated rounded-[20px] p-6 md:p-7 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, hsl(258 70% 82% / 0.22), transparent 65%), radial-gradient(55% 45% at 100% 100%, hsl(142 60% 80% / 0.14), transparent 65%)",
        }}
      />

      <div className="relative">
        <header className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Overall Learning Readiness
        </header>

        <div className="mt-3 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-0 lg:divide-x divide-border/60">
          {/* Score + distribution */}
          <div className="lg:pr-8 flex flex-col gap-4 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-black tabular-nums leading-[0.85] text-[64px] md:text-[72px]"
                  style={{ color: tone }}
                >
                  {snapshot.score}
                </span>
                <span className="text-[15px] md:text-[16px] font-extrabold text-muted-foreground/80">
                  /100
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold mb-1.5"
                style={{
                  background: `color-mix(in srgb, ${tone} 12%, transparent)`,
                  color: `color-mix(in srgb, ${tone} 80%, black 12%)`,
                  border: `1px solid color-mix(in srgb, ${tone} 25%, transparent)`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
                {READINESS_STATUS_LABEL[snapshot.status]}
              </span>
            </div>

            {snapshot.supportRiskPenalty > 0 && (
              <div className="-mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                {snapshot.rawScore} weighted average − {snapshot.supportRiskPenalty} support-risk
                adjustment (foundational area{snapshot.supportRiskPenalty > 3 ? "s are" : " is"} weak)
              </div>
            )}

            <p className="text-[12.5px] text-muted-foreground leading-snug -mt-1">
              Generated from Attention Hero gameplay signals to guide classroom support, not to
              measure academic achievement.
            </p>

            <div className="rounded-2xl border border-border/60 bg-background/40 p-3.5">
              <div className="text-[12.5px] font-semibold text-foreground/90">
                {stableOrStrong} of {snapshot.total} students show stable or strong readiness
              </div>
              <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                {STATUS_ORDER.map((key) => {
                  const count = snapshot.statusDistribution[key];
                  if (count <= 0) return null;
                  return (
                    <span
                      key={key}
                      className="h-full"
                      style={{
                        flex: `${(count / Math.max(1, snapshot.total)) * 100} 1 0`,
                        background: READINESS_STATUS_TONE[key],
                      }}
                      title={`${READINESS_STATUS_LABEL[key]}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_ORDER.map((key) => (
                  <div key={key} className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: READINESS_STATUS_TONE[key] }}
                      aria-hidden
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground truncate">
                      {READINESS_STATUS_LABEL[key]}
                    </span>
                    <span className="ml-auto text-[12px] font-extrabold tabular-nums">
                      {snapshot.statusDistribution[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contribution donut + insight */}
          <div className="lg:pl-8 min-w-0 flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <ContributionDonut areas={snapshot.areas} reduce={!!reduce} />
              <ul className="flex-1 min-w-0 space-y-1.5">
                {snapshot.areas.map((a) => (
                  <li key={a.key} className="flex items-center gap-2 text-[11.5px]">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: a.hue }}
                      aria-hidden
                    />
                    <span className="text-foreground/85 truncate">{a.label}</span>
                    {a.score != null ? (
                      <span className="ml-auto font-bold tabular-nums shrink-0" style={{ color: a.hue }}>
                        {a.score}
                      </span>
                    ) : (
                      <span className="ml-auto text-[10px] font-semibold text-muted-foreground shrink-0">
                        No data
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl border p-3.5 flex items-start gap-3"
              style={{
                background:
                  "radial-gradient(80% 100% at 0% 0%, color-mix(in srgb, hsl(258 70% 60%) 10%, transparent), transparent 70%), color-mix(in srgb, var(--card) 92%, transparent)",
                borderColor: "color-mix(in srgb, hsl(258 70% 55%) 22%, transparent)",
              }}
            >
              <span
                aria-hidden
                className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, hsl(258 70% 60%) 20%, transparent), color-mix(in srgb, hsl(38 92% 60%) 16%, transparent))",
                }}
              >
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-300" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-violet-700/80 dark:text-violet-300/80">
                  Yellow Insight
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-foreground/85">{insight}</p>
              </div>
              <Image
                src="/fumi-mascot.png"
                alt=""
                aria-hidden
                width={44}
                height={44}
                className="rounded-[10px] shrink-0 hidden sm:block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContributionDonut({
  areas,
  reduce,
}: {
  areas: ReadinessSnapshot["areas"];
  reduce: boolean;
}) {
  const scored = areas.filter((a): a is typeof areas[number] & { score: number } => a.score != null);
  const total = Math.max(
    1,
    scored.reduce((sum, a) => sum + a.score, 0),
  );
  const size = 108;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Precompute each segment's dash length + cumulative start offset in a
  // single pass, rather than mutating a variable inside the render map.
  const segments = scored.reduce<{ key: string; hue: string; dash: number; offset: number }[]>(
    (acc, a) => {
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
      acc.push({ key: a.key, hue: a.hue, dash: (a.score / total) * c, offset: prevOffset });
      return acc;
    },
    [],
  );

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(240 15% 90%)"
          strokeWidth={stroke}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        {segments.map((seg, i) => (
          <motion.circle
            key={seg.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={seg.hue}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${seg.dash} ${c - seg.dash}`}
            strokeDashoffset={-seg.offset}
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.04 * i, duration: 0.4, ease: EASE }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-extrabold tabular-nums leading-none text-[20px]">
          {scored.length}
        </span>
        <span className="text-[9px] font-bold text-muted-foreground">areas</span>
      </div>
    </div>
  );
}
