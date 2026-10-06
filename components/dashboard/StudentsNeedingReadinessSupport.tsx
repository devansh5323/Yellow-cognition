"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, Info, Lightbulb, Star, Users2 } from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { STUDENTS } from "@/data/mockData";
import {
  LEARNING_AREA_DESCRIPTION,
  LEARNING_AREA_HUE,
  READINESS_STATUS_LABEL,
  READINESS_STATUS_TONE,
  learningAreaToSkills,
  suggestedActivityForLearningArea,
  type StudentReadinessRow,
} from "@/lib/classLearning";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecommendations } from "@/hooks/useRecommendations";
import { formatDecimal1 } from "@/lib/format";

const PREVIEW_COUNT = 5;

/** Per-student readiness review: a priority table (worst-first by real
 * readiness score) paired with a persistent "Yellow Insights" panel for
 * whichever student is selected — same structure and language as
 * FocusSupportTable.tsx's panel (Support Area → Skills to Develop →
 * Suggested Activity → "View more in Yellow Insights"). Real data only:
 * score/status/weakest-area come from lib/classLearning.ts's
 * studentReadinessRows(); "Skills to Develop" reuses the existing static
 * learningAreaToSkills() reference table; "Suggested Activity" reuses
 * classFocus.ts's real QUICK_ACTIVITIES library via
 * suggestedActivityForLearningArea() rather than inventing new content. */
export function StudentsNeedingReadinessSupport({ rows }: { rows: StudentReadinessRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.score == null && b.score == null) return 0;
      if (a.score == null) return 1;
      if (b.score == null) return -1;
      return a.score - b.score;
    });
  }, [rows]);

  const visible = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT);
  const selected = sorted.find((r) => r.student.id === selectedId) ?? visible[0] ?? null;
  const rec = useRecommendations(selected?.student.ageGroup);
  const skillsByArea = useMemo(() => learningAreaToSkills(), []);

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-label="Students needing learning support" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
              <Users2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-heading font-extrabold text-[17px]">Students Needing Learning Support</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-[11px] leading-snug">
                    Ranked worst-first by real readiness score, each paired with their weakest learning area.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Who needs help and where.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 max-w-xs">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-muted-foreground leading-snug">Give focused, individualized support where it matters most.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
          {/* Priority table */}
          <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 flex-wrap">
              <span className="text-[12.5px] font-bold">
                Top Priority Cases <span className="text-muted-foreground font-semibold">(Students needing immediate support)</span>
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
              <table className="w-full text-[12.5px] min-w-[480px]">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">Student</th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">Readiness Score</th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">Status</th>
                    <th className="px-3 py-2.5 font-bold text-[10.5px] uppercase tracking-[0.10em]">Weakest Area</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const active = selected?.student.id === row.student.id;
                    const tone = row.status ? READINESS_STATUS_TONE[row.status] : "hsl(240 8% 60%)";
                    const areaHue = row.weakestArea ? LEARNING_AREA_HUE[row.weakestArea.key] : undefined;
                    return (
                      <tr
                        key={row.student.id}
                        onClick={() => setSelectedId(row.student.id)}
                        className={"border-t border-border/50 cursor-pointer transition-colors " + (active ? "bg-primary/[0.05]" : "hover:bg-muted/30")}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <StudentAvatar student={row.student} size="sm" />
                            <div className="min-w-0">
                              <div className="font-heading font-bold text-[13px] truncate leading-tight">{row.student.name}</div>
                              <div className="text-[10.5px] text-muted-foreground">{row.student.ageGroup}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {row.score != null ? <MiniScoreRing score={formatDecimal1(row.score)} tone={tone} /> : <span className="text-[11px] text-muted-foreground">No data</span>}
                        </td>
                        <td className="px-3 py-3">
                          {row.status ? (
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                              style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                            >
                              {READINESS_STATUS_LABEL[row.status]}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {row.weakestArea ? (
                            <div className="max-w-[20ch]">
                              <div className="text-[12px] font-bold leading-tight" style={{ color: areaHue }}>
                                {row.weakestArea.label}
                              </div>
                              <div className="text-[10.5px] text-muted-foreground tabular-nums">{row.weakestArea.score}/100</div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No data</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <ChevronRight className={`h-4 w-4 ml-auto ${active ? "text-primary" : "text-muted-foreground/50"}`} />
                        </td>
                      </tr>
                    );
                  })}

                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[12.5px] text-muted-foreground">
                        No students to show.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Readiness Score is generated from Attention Hero gameplay. Lower scores indicate greater need for support.
            </div>
          </div>

          {/* Yellow Insights — persistent per-selection panel */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
              <div>
                <div className="text-[13px] font-bold">Yellow Insights</div>
                <p className="text-[11px] text-muted-foreground leading-snug">Personalized support ideas for the selected student.</p>
              </div>
            </div>

            {selected ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <StudentAvatar student={selected.student} size="md" />
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-[14px] truncate">{selected.student.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      Readiness Score:{" "}
                      {selected.score != null && selected.status ? (
                        <span className="font-bold" style={{ color: READINESS_STATUS_TONE[selected.status] }}>
                          {selected.score}/100
                        </span>
                      ) : (
                        <span className="font-bold text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                </div>

                {selected.weakestArea ? (
                  <>
                    <div>
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">Learning Support Area</div>
                      <div className="flex items-start gap-2.5">
                        <span
                          className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
                          style={{
                            background: `color-mix(in srgb, ${LEARNING_AREA_HUE[selected.weakestArea.key]} 14%, transparent)`,
                            color: LEARNING_AREA_HUE[selected.weakestArea.key],
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-bold leading-tight" style={{ color: LEARNING_AREA_HUE[selected.weakestArea.key] }}>
                            {selected.weakestArea.label} ({selected.weakestArea.score}/100)
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-snug">
                            {LEARNING_AREA_DESCRIPTION[selected.weakestArea.key]}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">Skills to Develop</div>
                      <ul className="space-y-2">
                        {(rec?.skillsToDevelop.slice(0, 4).map((x) => x.skill) ?? skillsByArea.find((a) => a.key === selected.weakestArea!.key)?.skills ?? []).map((skill) => (
                          <li key={skill} className="flex items-start gap-2 text-[12px] leading-snug">
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: LEARNING_AREA_HUE[selected.weakestArea!.key] }} />
                            <span className="text-foreground/85">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {(() => {
                      const real = rec?.activities[0];
                      const fallback = suggestedActivityForLearningArea(selected.weakestArea.key);
                      const activity = real
                        ? { title: real.name, description: real.objective, durationMins: null as number | null }
                        : { title: fallback.title, description: fallback.description, durationMins: fallback.durationMins as number | null };
                      return (
                        <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
                          <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-primary mb-1.5">Suggested Activity</div>
                          <div className="flex items-start gap-2.5">
                            <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
                              <Clock className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[12.5px] font-bold">{activity.title}</span>
                                {activity.durationMins != null && (
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">{activity.durationMins} mins</span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{activity.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-[11.5px] text-muted-foreground">No real area-level data yet for this student.</p>
                )}

                <a href="#yellow-insights" className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                  View more in Yellow Insights
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <p className="mt-4 text-[12px] text-muted-foreground">Select a student from the table to see personalized suggestions.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-[12px] text-muted-foreground flex items-center gap-2">
            <Users2 className="h-4 w-4 text-muted-foreground shrink-0" />
            {showAll ? `Showing all ${rows.length} students in class.` : `Showing top ${Math.min(PREVIEW_COUNT, rows.length)} students who may need learning support.`}
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

function MiniScoreRing({ score, tone }: { score: string; tone: string }) {
  const SIZE = 44;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (Math.max(0, Math.min(100, parseFloat(score))) / 100) * C;
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="hsl(240 15% 90%)" strokeWidth={STROKE} fill="none" className="dark:stroke-[hsl(230_20%_25%)]" />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={tone} strokeWidth={STROKE} strokeLinecap="round" fill="none" style={{ strokeDasharray: C, strokeDashoffset: offset }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading font-extrabold text-[13px] tabular-nums" style={{ color: tone }}>
          {score}
        </span>
      </div>
    </div>
  );
}
