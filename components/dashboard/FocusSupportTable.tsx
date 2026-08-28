"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Equal,
  Info,
  Lightbulb,
  Star,
  Users2,
} from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { STUDENTS } from "@/data/mockData";
import {
  FOCUS_DOMAIN_HUE,
  FOCUS_SUPPORT_STATUS_LABEL,
  FOCUS_SUPPORT_STATUS_TONE,
  focusSupportRoster,
  suggestedActivityForDomain,
} from "@/lib/classFocus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PREVIEW_COUNT = 5;

/** Component 8: a priority table (worst focus scores first) paired with a
 * persistent "Yellow Recommends" panel for whichever student is selected —
 * reuses the same QUICK_ACTIVITIES library Component 6 already has for its
 * "Suggested Activity" callout, so the two never suggest different things
 * for the same domain. */
export function FocusSupportTable() {
  const reduce = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => focusSupportRoster(STUDENTS, { includeAll: showAll }), [showAll]);
  const visible = showAll ? rows : rows.slice(0, PREVIEW_COUNT);
  const selected = rows.find((r) => r.student.id === selectedId) ?? visible[0] ?? null;

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-label="Students needing focus support"
        className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4"
      >
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
              <Users2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-extrabold text-[17px]">
                  8. Students Needing Focus Support
                </h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="More info"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                    Ranked worst-first by PFI score, each paired with their weakest attention
                    sub-domain.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Individual insights to help you support students who need it most.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 max-w-xs">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-muted-foreground leading-snug">
              Give focused, individualized support where it matters most.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
          {/* Priority table */}
          <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 flex-wrap">
              <span className="text-[12.5px] font-bold">
                Top Priority Cases{" "}
                <span className="text-muted-foreground font-semibold">
                  (Students needing immediate support)
                </span>
              </span>
              <Link
                href="/students"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 h-8 text-[11.5px] font-bold hover:border-foreground/20 transition-colors shrink-0"
              >
                <Users2 className="h-3.5 w-3.5" />
                View all students
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[560px]">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">
                      Student
                    </th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">
                      PFI Score
                    </th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">
                      Focus Status
                    </th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">
                      Top Priority Domain
                    </th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">
                      Trend
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, i) => {
                    const active = selected?.student.id === row.student.id;
                    const tone = FOCUS_SUPPORT_STATUS_TONE[row.status];
                    const domainHue = FOCUS_DOMAIN_HUE[row.topDomain];
                    return (
                      <motion.tr
                        key={row.student.id}
                        initial={reduce ? undefined : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.02 * i, duration: 0.25 }}
                        onClick={() => setSelectedId(row.student.id)}
                        className={
                          "border-t border-border/50 cursor-pointer transition-colors " +
                          (active ? "bg-primary/[0.05]" : "hover:bg-muted/30")
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <StudentAvatar student={row.student} size="sm" />
                            <div className="min-w-0">
                              <div className="font-heading font-bold text-[13px] truncate leading-tight">
                                {row.student.name}
                              </div>
                              <div className="text-[10.5px] text-muted-foreground">
                                {row.student.grade}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <MiniScoreRing score={row.score} tone={tone} />
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                            style={{
                              background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                              color: tone,
                            }}
                          >
                            {FOCUS_SUPPORT_STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-[26ch]">
                            <div
                              className="text-[12px] font-bold leading-tight"
                              style={{ color: domainHue }}
                            >
                              {row.topDomainLabel} Attention
                            </div>
                            <div className="text-[10.5px] text-muted-foreground leading-snug">
                              {row.topDomainReason}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <TrendChip trend={row.trend} />
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ChevronRight
                            className={`h-4 w-4 ml-auto ${active ? "text-primary" : "text-muted-foreground/50"}`}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}

                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[12.5px] text-muted-foreground">
                        No students need focus support right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              PFI Score is a composite of all attention domains. Lower scores indicate greater need
              for support.
            </div>
          </div>

          {/* Yellow Recommends — persistent per-selection panel */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
              <div>
                <div className="text-[13px] font-bold">Yellow Recommends</div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Personalized support ideas for the selected student.
                </p>
              </div>
            </div>

            {selected ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <StudentAvatar student={selected.student} size="md" />
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-[14px] truncate">
                      {selected.student.name}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">
                      PFI Score:{" "}
                      <span
                        className="font-bold"
                        style={{ color: FOCUS_SUPPORT_STATUS_TONE[selected.status] }}
                      >
                        {selected.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                    Focus Support Area
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span
                      className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${FOCUS_DOMAIN_HUE[selected.topDomain]} 14%, transparent)`,
                        color: FOCUS_DOMAIN_HUE[selected.topDomain],
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[12.5px] font-bold leading-tight"
                        style={{ color: FOCUS_DOMAIN_HUE[selected.topDomain] }}
                      >
                        {selected.topDomainLabel} Attention
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {selected.topDomainReason}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                    Recommended Actions
                  </div>
                  <ul className="space-y-2">
                    {selected.recommendedActions.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-[12px] leading-snug">
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: FOCUS_DOMAIN_HUE[selected.topDomain] }}
                        />
                        <span className="text-foreground/85">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {(() => {
                  const activity = suggestedActivityForDomain(selected.topDomain);
                  return (
                    <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-primary mb-1.5">
                        Suggested Activity
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12.5px] font-bold">{activity.title}</span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                              {activity.durationMins} mins
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <a
                  href="#yellow-recommends"
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                >
                  View more in Yellow Recommends
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <p className="mt-4 text-[12px] text-muted-foreground">
                Select a student from the table to see personalized suggestions.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-[12px] text-muted-foreground flex items-center gap-2">
            <Users2 className="h-4 w-4 text-muted-foreground shrink-0" />
            {showAll
              ? `Showing all ${rows.length} students in class.`
              : `Showing top ${Math.min(PREVIEW_COUNT, rows.length)} students who may need focus support.`}
          </p>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 h-9 text-[12px] font-bold hover:border-foreground/20 transition-colors shrink-0"
          >
            <Users2 className="h-3.5 w-3.5" />
            {showAll ? "Show top priority only" : `View all ${STUDENTS.length} students in class`}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </TooltipProvider>
  );
}

function MiniScoreRing({ score, tone }: { score: number; tone: string }) {
  const SIZE = 44;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.max(0, Math.min(100, score)) / 100) * C;
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="hsl(240 15% 90%)"
          strokeWidth={STROKE}
          fill="none"
          className="dark:stroke-[hsl(230_20%_25%)]"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          style={{ strokeDasharray: C, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading font-extrabold text-[13px] tabular-nums" style={{ color: tone }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function TrendChip({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
        <ArrowUpRight className="h-3.5 w-3.5" />+{trend}
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums text-rose-700 dark:text-rose-400">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {trend}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground">
      <Equal className="h-3.5 w-3.5" />0
    </span>
  );
}
