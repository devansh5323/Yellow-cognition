"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  ArrowRight,
  Sparkles,
  Layers,
  Info,
  ChevronLeft,
  Lightbulb,
  ArrowDown,
  ArrowUp,
  Minus,
  CheckCircle2,
  CircleDashed,
  XCircle,
  ClipboardCheck,
  Trash2,
  CalendarIcon,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { AppShell } from "@/components/dashboard/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getFrictionByClass,
  getFrictionBySubjectGrade,
  getTopBehavioursByClass,
  getHoursSaved,
  getCheckInsBySubjectGrade,
  getCohortRubricAverages,
  getCohortFrictionSummary,
  buildRemedialPlan,
  getStudentRubricTrend,
  getRosterForCohort,
  listCohortClasses,
  getOutcomesForStrategy,
  listRemedialOutcomes,
  saveRemedialOutcome,
  deleteRemedialOutcome,
  newRemedialOutcomeId,
  type CohortRange,
  type CohortDateRange,
  type CohortFilter,
  type RemedialPlanItem,
  type RemedialOutcome,
  type RemedialOutcomeResult,
  type RemedialStrategy,
} from "@/lib/checkIn";
import {
  SUBJECTS,
  GRADES,
  BEHAVIOUR_RUBRIC,
  STUDENTS,
  midLostMins,
  type Subject,
  type Grade,
  type ClassCheckIn,
  type BehaviourKey,
} from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Page() {
  return (
    <AppShell>
      <FrictionPage />
    </AppShell>
  );
}

const REVERSE_TOOLTIP =
  "Reverse-scored: higher ratings mean more disruption. We invert the score before ranking, so a 5 on 'Interrupts class' counts as worst — not best.";

// ───── Date-range helpers (for cohort comparison selector) ─────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Default 7-day window ending `daysAgo` ago (0 = ending today, 7 = prior 7 days). */
function defaultRange(daysAgo: number): CohortDateRange {
  return makeRange(daysAgo, 7);
}

/** Window of `lengthDays` days ending `endDaysAgo` days before today. */
function makeRange(endDaysAgo: number, lengthDays: number): CohortDateRange {
  const end = new Date();
  end.setDate(end.getDate() - endDaysAgo);
  const start = new Date(end);
  start.setDate(start.getDate() - (lengthDays - 1));
  return { fromISO: toISODate(start), toISO: toISODate(end) };
}

function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function formatRangeShort(r: CohortDateRange): string {
  const f = parseISODate(r.fromISO);
  const t = parseISODate(r.toISO);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (r.fromISO === r.toISO) return f.toLocaleDateString(undefined, opts);
  return `${f.toLocaleDateString(undefined, opts)} – ${t.toLocaleDateString(undefined, opts)}`;
}

function rangeDays(r: CohortDateRange): number {
  const f = parseISODate(r.fromISO).getTime();
  const t = parseISODate(r.toISO).getTime();
  return Math.round((t - f) / 86400000) + 1;
}

function ReverseScoreInfo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors"
          aria-label="Reverse-scored explanation"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-[11.5px] leading-snug">
        {REVERSE_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}

function isReverse(id: BehaviourKey): boolean {
  return BEHAVIOUR_RUBRIC.find((r) => r.id === id)?.reverse ?? false;
}

function FrictionPage() {
  const rows = useMemo(() => getFrictionByClass(), []);
  const heat = useMemo(() => getFrictionBySubjectGrade(), []);
  const behaviours = useMemo(() => getTopBehavioursByClass(), []);
  const hs = useMemo(() => getHoursSaved(), []);

  // Hero overview derived metrics
  const worstClass = useMemo(
    () =>
      rows.length === 0
        ? null
        : [...rows].sort((a, b) => b.pctNonTeaching - a.pctNonTeaching)[0],
    [rows],
  );
  const topQuickWin = useMemo(
    () =>
      behaviours.length === 0
        ? null
        : [...behaviours].sort(
            (a, b) => b.estimatedMinsRecovered - a.estimatedMinsRecovered,
          )[0],
    [behaviours],
  );
  const totalMinutesLost = useMemo(
    () =>
      rows.reduce(
        (acc, r) => acc + r.behaviour + r.transitions + r.repetition,
        0,
      ),
    [rows],
  );
  const behaviourDelta = hs.behaviourBefore - hs.behaviourAfter;
  const behaviourImproved = behaviourDelta > 0;
  const behaviourDeltaPct =
    hs.behaviourBefore > 0
      ? Math.round((behaviourDelta / hs.behaviourBefore) * 100)
      : 0;

  // ───── Class filter (scope: "Where the minutes go", advisories, fix-this-first) ─────
  const MAX_CLASS_FILTER = 4;
  const [classFilterIds, setClassFilterIds] = useState<string[]>(() =>
    rows.slice(0, MAX_CLASS_FILTER).map((r) => r.id),
  );
  const hasClassFilter =
    classFilterIds.length > 0 && classFilterIds.length < rows.length;
  const filteredRows = useMemo(
    () =>
      classFilterIds.length === 0
        ? rows
        : rows.filter((r) => classFilterIds.includes(r.id)),
    [rows, classFilterIds],
  );
  const filteredBehaviours = useMemo(
    () =>
      classFilterIds.length === 0
        ? behaviours
        : behaviours.filter((b) => classFilterIds.includes(b.classId)),
    [behaviours, classFilterIds],
  );
  const toggleClassFilter = (id: string) => {
    setClassFilterIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CLASS_FILTER) return prev;
      return [...prev, id];
    });
  };
  const classFilterLabel =
    classFilterIds.length === 0
      ? `All ${rows.length} classes`
      : classFilterIds.length === 1
        ? rows.find((r) => r.id === classFilterIds[0])?.label ?? "1 class"
        : `${classFilterIds.length} of ${rows.length} classes`;

  const usedGrades = useMemo(() => {
    const set = new Set(heat.map((h) => h.grade));
    return GRADES.filter((g) => set.has(g));
  }, [heat]);

  const heatLookup = useMemo(() => {
    const m = new Map<string, number>();
    for (const h of heat) m.set(`${h.subject}__${h.grade}`, h.lostMins);
    return m;
  }, [heat]);

  const advisories = filteredRows.filter((r) => r.classSize === ">20" && r.behaviour >= 6);

  const [drill, setDrill] = useState<{ subject: Subject; grade: Grade } | null>(null);
  const [drillClassId, setDrillClassId] = useState<string | null>(null);

  const [cohortFilter, setCohortFilter] = useState<CohortFilter>({ subject: "all", grade: "all" });
  const [rangeA, setRangeA] = useState<CohortDateRange>(() => makeRange(0, 30));
  const [rangeB, setRangeB] = useState<CohortDateRange>(() => makeRange(30, 30));
  const current = useMemo(
    () => getCohortFrictionSummary(rangeA, cohortFilter),
    [cohortFilter, rangeA],
  );
  const previous = useMemo(
    () => getCohortFrictionSummary(rangeB, cohortFilter),
    [cohortFilter, rangeB],
  );
  const [cohortView, setCohortView] = useState<"compare" | "A" | "B">("compare");
  const remedial = useMemo(
    () => buildRemedialPlan(current.rubric, current.avgBehaviourMins, 3),
    [current],
  );

  const [outcomeDraft, setOutcomeDraft] = useState<{
    behaviourId: BehaviourKey;
    behaviourLabel: string;
    strategy: RemedialStrategy;
    editing?: RemedialOutcome;
  } | null>(null);
  const [outcomesVersion, setOutcomesVersion] = useState(0);
  const allOutcomes = useMemo(() => listRemedialOutcomes(), [outcomesVersion]);
  const bumpOutcomes = () => setOutcomesVersion((v) => v + 1);


  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* Hero */}
        <header className="relative premium-elevated rounded-[22px] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "radial-gradient(65% 55% at 0% 0%, hsl(142 60% 80% / 0.26), transparent 65%), radial-gradient(50% 50% at 100% 0%, hsl(38 92% 75% / 0.22), transparent 65%), radial-gradient(45% 50% at 50% 100%, hsl(200 70% 80% / 0.18), transparent 65%)",
            }}
          />
          <div className="relative z-10 p-5 md:p-6 space-y-5">
            {/* Headline + CTA */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="premium-eyebrow">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Instructional friction · this month</span>
                </div>
                <h1 className="mt-2 font-heading font-extrabold text-[26px] md:text-[34px] leading-[1.1] tracking-tight">
                  <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent tabular-nums">
                    +{hs.hoursSaved} hrs
                  </span>{" "}
                  of teaching recovered
                </h1>
                <p className="mt-1.5 text-[13px] text-muted-foreground max-w-2xl">
                  Class focus up{" "}
                  <span className="font-semibold text-foreground">{hs.attentionUpPct}%</span> across{" "}
                  <span className="font-semibold text-foreground">{hs.studentsCovered}</span>{" "}
                  students.{" "}
                  {behaviourImproved ? (
                    <>
                      Behaviour-loss down{" "}
                      <span className="font-semibold text-primary">
                        {behaviourDeltaPct}%
                      </span>{" "}
                      per class.
                    </>
                  ) : (
                    <>
                      Behaviour-loss this month:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {hs.behaviourBefore} → {hs.behaviourAfter}
                      </span>{" "}
                      min/class.
                    </>
                  )}
                </p>
              </div>
              <Link href="/check-in">
                <Button className="rounded-xl shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]">
                  <ClipboardCheck className="h-4 w-4 mr-1.5" />
                  New check-in
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Overview tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <HeroStat
                icon={<Clock className="h-4 w-4" />}
                label="Time saved"
                primary={
                  <>
                    +{hs.hoursSaved}
                    <span className="text-[12px] text-muted-foreground font-bold ml-1">
                      hrs
                    </span>
                  </>
                }
                meta="back into teaching"
                tone="primary"
              />
              <HeroStat
                icon={<TrendingUp className="h-4 w-4" />}
                label="Attention lift"
                primary={
                  <>
                    +{hs.attentionUpPct}
                    <span className="text-[12px] text-muted-foreground font-bold ml-0.5">
                      %
                    </span>
                  </>
                }
                meta={`${hs.studentsCovered} students`}
                tone="accent"
              />
              <HeroStat
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Worst class"
                primary={worstClass?.label ?? "—"}
                meta={
                  worstClass
                    ? `${worstClass.pctNonTeaching}% non-teaching`
                    : "no check-ins yet"
                }
                tone="warning"
              />
              <HeroStat
                icon={<Lightbulb className="h-4 w-4" />}
                label="Quickest win"
                primary={topQuickWin?.worstBehaviour.label ?? "—"}
                meta={
                  topQuickWin
                    ? `Save ~${topQuickWin.estimatedMinsRecovered} min/class`
                    : "no data yet"
                }
                tone="violet"
              />
            </div>

            {/* Tail line — total minutes context */}
            {totalMinutesLost > 0 && (
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 flex-wrap text-[11.5px] text-muted-foreground">
                <span>
                  Across{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {rows.length}
                  </span>{" "}
                  recent check-ins,{" "}
                  <span className="font-semibold text-foreground tabular-nums">
                    {Math.round(totalMinutesLost)}
                  </span>{" "}
                  minutes are still being lost to friction.
                </span>
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <ArrowDown className="h-3 w-3" /> Drill into sections below
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Where the minutes go */}
        <section className="premium-elevated rounded-[22px] p-6">
          <div className="premium-section-header mb-4 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="premium-eyebrow">Where the minutes go</h2>
              <h3 className="font-heading font-extrabold text-[18px] mt-1.5 leading-tight">
                Teaching vs lost minutes per class
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Pick up to {MAX_CLASS_FILTER} classes · applies to advisories &amp; fix-this-first below.
              </p>
            </div>
            {rows.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card/70 hover:border-primary/40 text-[12.5px] font-semibold transition-colors"
                  >
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{classFilterLabel}</span>
                    {hasClassFilter && (
                      <span className="inline-flex h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold items-center justify-center tabular-nums">
                        {classFilterIds.length}
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[320px] p-3 rounded-xl max-h-[360px] overflow-auto"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Compare classes · max {MAX_CLASS_FILTER}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setClassFilterIds(
                          classFilterIds.length === 0
                            ? rows.slice(0, MAX_CLASS_FILTER).map((r) => r.id)
                            : [],
                        )
                      }
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      {classFilterIds.length === 0 ? "Select first 4" : "Clear"}
                    </button>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {rows.map((r) => {
                      const active = classFilterIds.includes(r.id);
                      const atMax =
                        !active && classFilterIds.length >= MAX_CLASS_FILTER;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          disabled={atMax}
                          onClick={() => toggleClassFilter(r.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] font-semibold text-left transition-colors",
                            active ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                            atMax && "opacity-40 cursor-not-allowed",
                          )}
                        >
                          <Checkbox checked={active} className="pointer-events-none" />
                          <span className="truncate flex-1">{r.label}</span>
                          {r.pctNonTeaching > 35 && (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold rounded-full px-1.5 py-0.5 bg-destructive/10 text-destructive border border-destructive/25 tabular-nums">
                              {r.pctNonTeaching}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart
                  data={filteredRows.map((r) => ({
                    name: r.label,
                    Teaching: r.teaching,
                    Behaviour: r.behaviour,
                    Transitions: r.transitions,
                    Repetition: r.repetition,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(230 15% 55%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(230 15% 55%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(240 15% 90%)",
                      background: "hsl(0 0% 100% / 0.95)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Teaching" stackId="a" fill="hsl(142 55% 48%)" />
                  <Bar dataKey="Behaviour" stackId="a" fill="hsl(0 70% 60%)" />
                  <Bar dataKey="Transitions" stackId="a" fill="hsl(38 92% 55%)" />
                  <Bar
                    dataKey="Repetition"
                    stackId="a"
                    fill="hsl(260 55% 60%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {filteredRows.some((r) => r.pctNonTeaching > 35) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredRows
                .filter((r) => r.pctNonTeaching > 35)
                .map((r) => (
                  <Badge
                    key={r.id}
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/25"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {r.label}: {r.pctNonTeaching}% non-teaching
                  </Badge>
                ))}
            </div>
          )}
        </section>

        {/* Friction by subject × grade */}
        <section className="premium-elevated rounded-[22px] p-6">
          <div className="premium-section-header mb-4">
            <div>
              <h2 className="premium-eyebrow">Where it concentrates</h2>
              <h3 className="font-heading font-extrabold text-[18px] mt-1.5 leading-tight">
                Friction by subject × grade
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Average lost minutes per class. Click any cell to drill into the underlying classes.
              </p>
            </div>
          </div>
          {heat.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1 min-w-[480px]">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground px-2 py-1 w-[120px]">
                      Subject
                    </th>
                    {usedGrades.map((g) => (
                      <th
                        key={g}
                        className="text-[11px] font-semibold text-muted-foreground px-2 py-1 text-center"
                      >
                        {g.replace("Grade ", "G")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBJECTS.map((s) => (
                    <tr key={s}>
                      <td className="text-[12.5px] font-semibold px-2 py-1">{s}</td>
                      {usedGrades.map((g) => {
                        const v = heatLookup.get(`${s}__${g}`);
                        const intensity = v ? Math.min(1, v / 25) : 0;
                        const interactive = v !== undefined;
                        return (
                          <td key={g} className="px-1 py-1 text-center">
                            <button
                              type="button"
                              disabled={!interactive}
                              onClick={() => {
                                if (!interactive) return;
                                setDrillClassId(null);
                                setDrill({ subject: s, grade: g });
                              }}
                              className={cn(
                                "h-9 w-full rounded-md flex items-center justify-center text-[11.5px] font-bold transition-all",
                                interactive
                                  ? "cursor-pointer hover:ring-2 hover:ring-primary/40 hover:scale-[1.03]"
                                  : "cursor-default",
                              )}
                              style={{
                                background:
                                  v === undefined
                                    ? "hsl(240 15% 95%)"
                                    : `hsl(0 70% ${85 - intensity * 35}% / ${0.35 + intensity * 0.55})`,
                                color:
                                  v === undefined
                                    ? "hsl(230 15% 65%)"
                                    : intensity > 0.5
                                      ? "white"
                                      : "hsl(0 60% 30%)",
                              }}
                              aria-label={
                                interactive
                                  ? `${s} ${g}: ${Math.round(v!)} mins lost — open details`
                                  : `${s} ${g}: no data`
                              }
                            >
                              {v === undefined ? "—" : Math.round(v)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cohort comparison: range A vs range B */}
        <CohortCompareSection
          current={current}
          previous={previous}
          view={cohortView}
          onViewChange={setCohortView}
          filter={cohortFilter}
          onFilterChange={setCohortFilter}
          rangeA={rangeA}
          onRangeAChange={setRangeA}
          rangeB={rangeB}
          onRangeBChange={setRangeB}
        />

        {/* Personalised remedial plan */}
        <RemedialPlanSection
          plan={remedial}
          allOutcomes={allOutcomes}
          onMarkTried={(behaviourId, behaviourLabel, strategy) =>
            setOutcomeDraft({ behaviourId, behaviourLabel, strategy })
          }
          onEditOutcome={(outcome, behaviourLabel, strategy) =>
            setOutcomeDraft({
              behaviourId: outcome.behaviourId,
              behaviourLabel,
              strategy,
              editing: outcome,
            })
          }
        />

        {/* Tried strategies log */}
        <TriedStrategiesPanel
          outcomes={allOutcomes}
          onDelete={(id) => {
            deleteRemedialOutcome(id);
            bumpOutcomes();
          }}
        />

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Class-size advisory */}
          <section className="premium-elevated rounded-[22px] p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-heading font-extrabold text-[16px]">Class-size advisories</h3>
              {hasClassFilter && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em] rounded-full px-2 py-0.5 bg-primary/10 text-primary border border-primary/25">
                  <Filter className="h-3 w-3" />
                  {classFilterIds.length} class{classFilterIds.length === 1 ? "" : "es"}
                </span>
              )}
            </div>
            {advisories.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                {hasClassFilter
                  ? "No structural class-size issues in the selected classes. 🎉"
                  : "No structural class-size issues detected. 🎉"}
              </p>
            ) : (
              <ul className="space-y-3">
                {advisories.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border p-3.5 bg-card/50 flex items-start gap-3"
                  >
                    <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[13.5px]">{a.label}</div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {a.classSize} students, {a.behaviour} mins/class lost to behaviour. Consider
                        splitting the class — load looks structural, not attention-driven.
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Top disruptive behaviours */}
          <section className="premium-elevated rounded-[22px] p-6">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-heading font-extrabold text-[16px]">Fix-this-first per class</h3>
              {hasClassFilter && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em] rounded-full px-2 py-0.5 bg-primary/10 text-primary border border-primary/25">
                  <Filter className="h-3 w-3" />
                  {classFilterIds.length} class{classFilterIds.length === 1 ? "" : "es"}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-muted-foreground mb-4 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Items marked are reverse-scored — hover for details.
            </p>
            {filteredBehaviours.length === 0 ? (
              hasClassFilter ? (
                <p className="text-[13px] text-muted-foreground">
                  No data for the selected classes.
                </p>
              ) : (
                <EmptyState compact />
              )
            ) : (
              <ul className="space-y-3">
                {filteredBehaviours.slice(0, 4).map((b) => {
                  const reverse = isReverse(b.worstBehaviour.id);
                  return (
                    <li
                      key={b.classId}
                      className="rounded-xl border border-border p-3.5 bg-card/50"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-semibold text-[13.5px]">{b.classLabel}</div>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/25 text-[10.5px]"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />~{b.estimatedMinsRecovered}{" "}
                          min/class
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground inline-flex items-center gap-1">
                          {b.worstBehaviour.label}
                          {reverse && <ReverseScoreInfo />}
                        </span>
                        — solving this alone could recover ~{b.estimatedMinsRecovered} minutes per
                        class.
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <DrillDialog
          drill={drill}
          drillClassId={drillClassId}
          setDrillClassId={setDrillClassId}
          onClose={() => {
            setDrill(null);
            setDrillClassId(null);
          }}
        />

        <OutcomeDialog
          draft={outcomeDraft}
          filter={cohortFilter}
          onClose={() => setOutcomeDraft(null)}
          onSaved={() => {
            bumpOutcomes();
            setOutcomeDraft(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

function DrillDialog({
  drill,
  drillClassId,
  setDrillClassId,
  onClose,
}: {
  drill: { subject: Subject; grade: Grade } | null;
  drillClassId: string | null;
  setDrillClassId: (id: string | null) => void;
  onClose: () => void;
}) {
  const classes = useMemo<ClassCheckIn[]>(
    () => (drill ? getCheckInsBySubjectGrade(drill.subject, drill.grade) : []),
    [drill],
  );
  const cohort = useMemo(() => getCohortRubricAverages(classes), [classes]);
  const focusedClass = useMemo(
    () => classes.find((c) => c.id === drillClassId) ?? null,
    [classes, drillClassId],
  );

  const avgLost =
    classes.length === 0
      ? 0
      : Math.round(
          (classes.reduce(
            (a, c) => a + midLostMins(c.behaviourMins) + midLostMins(c.transitionMins),
            0,
          ) /
            classes.length) *
            10,
        ) / 10;

  return (
    <Dialog open={!!drill} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {drill && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-[18px]">
                {focusedClass ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => setDrillClassId(null)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Back to cohort"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {focusedClass.grade}
                    {focusedClass.section} · {focusedClass.subject} — {focusedClass.teacher}
                  </span>
                ) : (
                  <>
                    {drill.subject} · {drill.grade}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {focusedClass
                  ? `${new Date(focusedClass.createdAt).toLocaleDateString()} · ${focusedClass.classSize} students · ${focusedClass.students.length} rated`
                  : `${classes.length} class${classes.length === 1 ? "" : "es"}, avg ${avgLost} min lost / class`}
              </DialogDescription>
            </DialogHeader>

            {focusedClass ? (
              <ClassDetailView checkIn={focusedClass} />
            ) : (
              <CohortDetailView
                classes={classes}
                cohort={cohort}
                onSelectClass={(id) => setDrillClassId(id)}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CohortDetailView({
  classes,
  cohort,
  onSelectClass,
}: {
  classes: ClassCheckIn[];
  cohort: ReturnType<typeof getCohortRubricAverages>;
  onSelectClass: (id: string) => void;
}) {
  if (classes.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-6 text-center">
        No check-ins yet for this cohort.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground mb-2">
          Classes contributing
        </h4>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] text-muted-foreground">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Teacher</th>
                <th className="px-3 py-2 font-semibold">Size</th>
                <th className="px-3 py-2 font-semibold text-right">Behaviour</th>
                <th className="px-3 py-2 font-semibold text-right">Transitions</th>
                <th className="px-3 py-2 font-semibold text-right">Total lost</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => {
                const beh = midLostMins(c.behaviourMins);
                const tr = midLostMins(c.transitionMins);
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectClass(c.id)}
                    className="border-t border-border hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">{c.teacher}</td>
                    <td className="px-3 py-2">{c.classSize}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{beh} min</td>
                    <td className="px-3 py-2 text-right tabular-nums">{tr} min</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {beh + tr} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          Student rubric averages
          <ReverseScoreInfo />
        </h4>
        <ul className="space-y-2.5">
          {cohort.map((r) => {
            const range = r.max - r.min || 1;
            const pct = r.count ? ((r.avg - r.min) / range) * 100 : 0;
            const goodColor = "hsl(142 55% 48%)";
            const badColor = "hsl(0 70% 60%)";
            const fillColor = r.reverse ? badColor : goodColor;
            const trackBg = r.reverse ? `${goodColor} 0%, hsl(240 15% 92%) 100%` : undefined;
            return (
              <li key={r.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="font-semibold inline-flex items-center gap-1">
                    {r.label}
                    {r.reverse && <ReverseScoreInfo />}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {r.count > 0 ? r.avg.toFixed(1) : "—"}{" "}
                    <span className="text-[10.5px]">/ {r.max}</span>
                    <span className="text-[10.5px] ml-1.5">({r.count})</span>
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden relative"
                  style={{
                    background: trackBg
                      ? `linear-gradient(to right, ${trackBg})`
                      : "hsl(240 15% 92%)",
                  }}
                >
                  {r.count > 0 && (
                    <div
                      className="h-full absolute top-0 transition-all"
                      style={{
                        width: `${pct}%`,
                        background: fillColor,
                        ...(r.reverse ? { right: 0 } : { left: 0 }),
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ClassDetailView({ checkIn }: { checkIn: ClassCheckIn }) {
  const studentLookup = useMemo(() => {
    const m = new Map(STUDENTS.map((s) => [s.id, s]));
    return m;
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-[10.5px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Student</th>
              {BEHAVIOUR_RUBRIC.map((r) => (
                <th key={r.id} className="px-2 py-2 text-center font-semibold">
                  <span className="inline-flex items-center gap-0.5">
                    {r.label.split(" ")[0]}
                    {r.reverse && <ReverseScoreInfo />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkIn.students.map((s) => {
              const stu = studentLookup.get(s.studentId);
              return (
                <tr key={s.studentId} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{stu?.name ?? s.studentId}</td>
                  {BEHAVIOUR_RUBRIC.map((r) => {
                    const v = s.ratings[r.id];
                    if (s.absent)
                      return (
                        <td
                          key={r.id}
                          className="px-2 py-2 text-center text-muted-foreground text-[10.5px]"
                        >
                          abs
                        </td>
                      );
                    if (typeof v !== "number")
                      return (
                        <td
                          key={r.id}
                          className="px-2 py-2 text-center text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    const range = r.max - r.min || 1;
                    const norm = (v - r.min) / range;
                    const bad = r.reverse ? norm : 1 - norm;
                    return (
                      <td key={r.id} className="px-2 py-2 text-center">
                        <span
                          className="inline-block min-w-[22px] h-6 leading-6 rounded text-[11px] font-bold tabular-nums"
                          style={{
                            background: `hsl(${bad > 0.5 ? 0 : 142} ${bad > 0.5 ? 70 : 55}% ${90 - bad * 30}%)`,
                            color: bad > 0.5 ? "hsl(0 60% 28%)" : "hsl(142 55% 22%)",
                          }}
                        >
                          {v}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <StudentTrendStrip checkIn={checkIn} />
      <div className="flex justify-end">
        <Link
          href={`/check-in?edit=${checkIn.id}`}
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline"
        >
          Open check-in <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card/40 text-center",
        compact ? "p-4" : "p-8",
      )}
    >
      <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
      <p className="text-[13px] text-muted-foreground">
        No check-ins yet —{" "}
        <Link
          href="/check-in"
          className="text-primary font-semibold hover:underline"
        >
          run your first one
        </Link>{" "}
        to populate this view.
      </p>
    </div>
  );
}

// ───── Cohort comparison section ─────

type CohortSummary = ReturnType<typeof getCohortFrictionSummary>;

function CohortCompareSection({
  current,
  previous,
  view,
  onViewChange,
  filter,
  onFilterChange,
  rangeA,
  onRangeAChange,
  rangeB,
  onRangeBChange,
}: {
  current: CohortSummary;
  previous: CohortSummary;
  view: "compare" | "A" | "B";
  onViewChange: (v: "compare" | "A" | "B") => void;
  filter: CohortFilter;
  onFilterChange: (f: CohortFilter) => void;
  rangeA: CohortDateRange;
  onRangeAChange: (r: CohortDateRange) => void;
  rangeB: CohortDateRange;
  onRangeBChange: (r: CohortDateRange) => void;
}) {
  const classOptions = useMemo(() => listCohortClasses(), []);
  const filterMode: "subjectGrade" | "class" = Array.isArray(filter.classKeys)
    ? "class"
    : "subjectGrade";
  const activeChips = buildActiveFilterChips(filter, onFilterChange, classOptions);
  const empty = current.classes === 0 && previous.classes === 0;

  const clearAll = () =>
    onFilterChange(
      filterMode === "class"
        ? { subject: "all", grade: "all", classKeys: [] }
        : { subject: "all", grade: "all", classKeys: undefined },
    );

  return (
    <section className="premium-elevated rounded-[22px] p-6">
      <div className="premium-section-header mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="premium-eyebrow">Cohort trends</h2>
          <h3 className="font-heading font-extrabold text-[18px] mt-1.5 leading-tight">
            Compare two time windows
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Spot friction &amp; rubric changes by range, subject, or class.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RangeSelector
            rangeA={rangeA}
            rangeB={rangeB}
            onRangeAChange={onRangeAChange}
            onRangeBChange={onRangeBChange}
          />
          <CohortFilterButton
            filter={filter}
            onFilterChange={onFilterChange}
            classOptions={classOptions}
          />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10.5px] mr-0.5">
            Filters
          </span>
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.onRemove}
              className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-[11.5px] font-semibold hover:bg-primary/15 transition-colors"
            >
              {c.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {empty ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-[13px] text-muted-foreground">
          {filterMode === "class" && (filter.classKeys ?? []).length === 0
            ? "Pick classes from the Cohort filter to compare."
            : "No check-ins match this filter. Try widening subject, grade, or selected classes."}
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-end">
            <div className="inline-flex rounded-lg border border-border bg-card/50 p-0.5 text-[11px]">
              {(
                [
                  { id: "compare" as const, label: "Compare" },
                  { id: "A" as const, label: `A · ${formatRangeShort(rangeA)}` },
                  { id: "B" as const, label: `B · ${formatRangeShort(rangeB)}` },
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onViewChange(t.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-semibold transition-colors",
                    view === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {view === "compare" ? (
            <CohortCompareGrid current={current} previous={previous} />
          ) : (
            <CohortSingleView summary={view === "A" ? current : previous} />
          )}
        </>
      )}
    </section>
  );
}

// ───── Range selector (preset + custom) ─────

function detectRangePreset(
  a: CohortDateRange,
  b: CohortDateRange,
): "wow" | "mom" | "qoq" | "custom" {
  const eq = (x: CohortDateRange, y: CohortDateRange) =>
    x.fromISO === y.fromISO && x.toISO === y.toISO;
  const wow: [CohortDateRange, CohortDateRange] = [defaultRange(0), defaultRange(7)];
  const mom: [CohortDateRange, CohortDateRange] = [makeRange(0, 30), makeRange(30, 30)];
  const qoq: [CohortDateRange, CohortDateRange] = [makeRange(0, 90), makeRange(90, 90)];
  if (eq(a, wow[0]) && eq(b, wow[1])) return "wow";
  if (eq(a, mom[0]) && eq(b, mom[1])) return "mom";
  if (eq(a, qoq[0]) && eq(b, qoq[1])) return "qoq";
  return "custom";
}

function RangeSelector({
  rangeA,
  rangeB,
  onRangeAChange,
  onRangeBChange,
}: {
  rangeA: CohortDateRange;
  rangeB: CohortDateRange;
  onRangeAChange: (r: CohortDateRange) => void;
  onRangeBChange: (r: CohortDateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const preset = detectRangePreset(rangeA, rangeB);
  const label =
    preset === "wow"
      ? "Week / week"
      : preset === "mom"
        ? "Month / month"
        : preset === "qoq"
          ? "Quarter / quarter"
          : `${formatRangeShort(rangeA)} vs ${formatRangeShort(rangeB)}`;

  const applyPreset = (p: "wow" | "mom" | "qoq") => {
    if (p === "wow") {
      onRangeAChange(defaultRange(0));
      onRangeBChange(defaultRange(7));
    } else if (p === "mom") {
      onRangeAChange(makeRange(0, 30));
      onRangeBChange(makeRange(30, 30));
    } else {
      onRangeAChange(makeRange(0, 90));
      onRangeBChange(makeRange(90, 90));
    }
    setOpen(false);
  };

  const presets: { id: "wow" | "mom" | "qoq"; label: string }[] = [
    { id: "wow", label: "This week vs last week" },
    { id: "mom", label: "This month vs last month" },
    { id: "qoq", label: "This quarter vs last quarter" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card/70 hover:border-primary/40 text-[12.5px] font-semibold transition-colors"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 rounded-xl">
        <div className="mb-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
            Quick compare
          </div>
          <div className="flex flex-col gap-1">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "text-left px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors",
                  preset === p.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/60 text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
            Custom range
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RangePickerButton label="A" value={rangeA} onChange={onRangeAChange} />
            <span className="text-muted-foreground text-[11px]">vs</span>
            <RangePickerButton label="B" value={rangeB} onChange={onRangeBChange} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ───── Cohort filter (subject+grade OR class roster) ─────

function buildCohortFilterLabel(
  filter: CohortFilter,
  classOptions: { key: string; label: string }[],
): string {
  if (Array.isArray(filter.classKeys)) {
    const n = filter.classKeys.length;
    if (n === 0) return "Pick classes";
    if (n === 1) return classOptions.find((c) => c.key === filter.classKeys![0])?.label ?? "1 class";
    return `${n} classes`;
  }
  const parts: string[] = [];
  if (filter.subject && filter.subject !== "all") parts.push(filter.subject);
  if (filter.grade && filter.grade !== "all") parts.push(filter.grade);
  return parts.length > 0 ? parts.join(" · ") : "All cohorts";
}

function countCohortFilters(filter: CohortFilter): number {
  let n = 0;
  if (filter.subject && filter.subject !== "all") n++;
  if (filter.grade && filter.grade !== "all") n++;
  n += (filter.classKeys ?? []).length;
  return n;
}

function buildActiveFilterChips(
  filter: CohortFilter,
  onFilterChange: (f: CohortFilter) => void,
  classOptions: { key: string; label: string }[],
): { key: string; label: string; onRemove: () => void }[] {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filter.subject && filter.subject !== "all") {
    chips.push({
      key: `sub-${filter.subject}`,
      label: filter.subject,
      onRemove: () => onFilterChange({ ...filter, subject: "all" }),
    });
  }
  if (filter.grade && filter.grade !== "all") {
    chips.push({
      key: `gr-${filter.grade}`,
      label: filter.grade,
      onRemove: () => onFilterChange({ ...filter, grade: "all" }),
    });
  }
  for (const k of filter.classKeys ?? []) {
    const opt = classOptions.find((c) => c.key === k);
    chips.push({
      key: `cls-${k}`,
      label: opt?.label ?? k,
      onRemove: () =>
        onFilterChange({
          ...filter,
          classKeys: (filter.classKeys ?? []).filter((x) => x !== k),
        }),
    });
  }
  return chips;
}

function CohortFilterButton({
  filter,
  onFilterChange,
  classOptions,
}: {
  filter: CohortFilter;
  onFilterChange: (f: CohortFilter) => void;
  classOptions: { key: string; label: string; checkIns: number }[];
}) {
  const [open, setOpen] = useState(false);
  const filterMode: "subjectGrade" | "class" = Array.isArray(filter.classKeys)
    ? "class"
    : "subjectGrade";
  const activeCount = countCohortFilters(filter);
  const label = buildCohortFilterLabel(filter, classOptions);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card/70 hover:border-primary/40 text-[12.5px] font-semibold transition-colors"
        >
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{label}</span>
          {activeCount > 0 && (
            <span className="inline-flex h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[340px] p-3 rounded-xl max-h-[480px] overflow-auto"
      >
        <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-[11.5px]">
          <button
            type="button"
            onClick={() =>
              onFilterChange({ subject: "all", grade: "all", classKeys: undefined })
            }
            className={cn(
              "px-2.5 py-1 rounded-md font-semibold transition-colors",
              filterMode === "subjectGrade"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Subject &amp; grade
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ subject: "all", grade: "all", classKeys: [] })}
            className={cn(
              "px-2.5 py-1 rounded-md font-semibold transition-colors",
              filterMode === "class"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Class roster
          </button>
        </div>

        {filterMode === "subjectGrade" ? (
          <div className="space-y-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Subject
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="All"
                  active={!filter.subject || filter.subject === "all"}
                  onClick={() => onFilterChange({ ...filter, subject: "all" })}
                />
                {SUBJECTS.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    active={filter.subject === s}
                    onClick={() => onFilterChange({ ...filter, subject: s })}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
                Grade
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="All"
                  active={!filter.grade || filter.grade === "all"}
                  onClick={() => onFilterChange({ ...filter, grade: "all" })}
                />
                {GRADES.map((g) => (
                  <FilterChip
                    key={g}
                    label={g.replace("Grade ", "G")}
                    active={filter.grade === g}
                    onClick={() => onFilterChange({ ...filter, grade: g })}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Classes ({(filter.classKeys ?? []).length} selected)
              </div>
              {classOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({ ...filter, classKeys: classOptions.map((c) => c.key) })
                  }
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Select all
                </button>
              )}
            </div>
            {classOptions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-3 text-[12px] text-muted-foreground text-center">
                No classes recorded yet — run a check-in first.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {classOptions.map((opt) => {
                  const selected = (filter.classKeys ?? []).includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        const cur = filter.classKeys ?? [];
                        const next = cur.includes(opt.key)
                          ? cur.filter((k) => k !== opt.key)
                          : [...cur, opt.key];
                        onFilterChange({ ...filter, classKeys: next });
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                      )}
                    >
                      {opt.label}
                      <span
                        className={cn(
                          "text-[9.5px] tabular-nums px-1 rounded",
                          selected ? "bg-primary-foreground/20" : "bg-muted",
                        )}
                      >
                        {opt.checkIns}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeCount > 0 && (
          <div className="border-t border-border mt-3 pt-3 flex justify-end">
            <button
              type="button"
              onClick={() =>
                onFilterChange(
                  filterMode === "class"
                    ? { subject: "all", grade: "all", classKeys: [] }
                    : { subject: "all", grade: "all", classKeys: undefined },
                )
              }
              className="text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ───── Hero overview tile ─────

const HERO_STAT_TONE = {
  primary: "bg-primary/10 text-primary border-primary/25",
  accent:
    "bg-[hsl(200_70%_55%)]/10 text-[hsl(200_70%_42%)] dark:text-[hsl(200_70%_72%)] border-[hsl(200_70%_55%)]/25",
  warning:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
  violet:
    "bg-[hsl(260_55%_60%)]/10 text-[hsl(260_55%_50%)] dark:text-[hsl(260_55%_75%)] border-[hsl(260_55%_60%)]/25",
} as const;

function HeroStat({
  icon,
  label,
  primary,
  meta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  primary: React.ReactNode;
  meta: React.ReactNode;
  tone: keyof typeof HERO_STAT_TONE;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3 flex items-start gap-2.5">
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border",
          HERO_STAT_TONE[tone],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
          {label}
        </div>
        <div className="font-heading font-extrabold text-[15px] leading-tight mt-1 truncate">
          {primary}
        </div>
        <div className="text-[10.5px] text-muted-foreground truncate mt-0.5">
          {meta}
        </div>
      </div>
    </div>
  );
}

// ───── Date-range picker button (used by CohortCompareSection) ─────

function RangePickerButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CohortDateRange;
  onChange: (r: CohortDateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = {
    from: parseISODate(value.fromISO),
    to: parseISODate(value.toISO),
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-card/60 hover:bg-card text-[12px] font-semibold transition-colors"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
            {label}
          </span>
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatRangeShort(value)}</span>
          <span className="text-muted-foreground tabular-nums text-[10.5px]">
            {rangeDays(value)}d
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={(r) => {
            if (r?.from && r?.to) {
              onChange({ fromISO: toISODate(r.from), toISO: toISODate(r.to) });
              setOpen(false);
            } else if (r?.from) {
              onChange({ fromISO: toISODate(r.from), toISO: toISODate(r.from) });
            }
          }}
          defaultMonth={selected.from}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}

function DeltaPill({
  current,
  previous,
  unit = "",
  goodDirection = "down",
}: {
  current: number;
  previous: number;
  unit?: string;
  goodDirection?: "up" | "down";
}) {
  const diff = Math.round((current - previous) * 10) / 10;
  if (Math.abs(diff) < 0.1) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }
  const isImprovement = goodDirection === "down" ? diff < 0 : diff > 0;
  const Icon = diff < 0 ? ArrowDown : ArrowUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10.5px] font-semibold",
        isImprovement ? "text-emerald-600" : "text-rose-600",
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(diff)}
      {unit}
    </span>
  );
}

function CohortCompareGrid({
  current,
  previous,
}: {
  current: CohortSummary;
  previous: CohortSummary;
}) {
  const metrics: {
    label: string;
    cur: number;
    prev: number;
    unit: string;
    goodDirection: "up" | "down";
  }[] = [
    { label: "Behaviour mins lost", cur: current.avgBehaviourMins, prev: previous.avgBehaviourMins, unit: " min", goodDirection: "down" },
    { label: "Transition mins lost", cur: current.avgTransitionMins, prev: previous.avgTransitionMins, unit: " min", goodDirection: "down" },
    { label: "Repetition mins lost", cur: current.avgRepetitionMins, prev: previous.avgRepetitionMins, unit: " min", goodDirection: "down" },
    { label: "Total non-teaching", cur: current.avgTotalLost, prev: previous.avgTotalLost, unit: " min", goodDirection: "down" },
    { label: "Teaching mins / class", cur: current.avgTeachingMins, prev: previous.avgTeachingMins, unit: " min", goodDirection: "up" },
    { label: "Classes recorded", cur: current.classes, prev: previous.classes, unit: "", goodDirection: "up" },
  ];

  // Rubric pairs by id
  const rubricPairs = current.rubric.map((r) => {
    const prev = previous.rubric.find((x) => x.id === r.id);
    return { r, prevAvg: prev?.avg ?? 0, prevCount: prev?.count ?? 0 };
  });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border bg-card/50 p-3.5"
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {m.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="font-heading font-extrabold text-[22px] tabular-nums">
                {m.cur}
                <span className="text-[12px] font-semibold text-muted-foreground">{m.unit}</span>
              </div>
              <DeltaPill
                current={m.cur}
                previous={m.prev}
                unit={m.unit}
                goodDirection={m.goodDirection}
              />
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">
              prev {m.prev}
              {m.unit}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          Rubric averages — current period vs previous
          <ReverseScoreInfo />
        </h4>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-[10.5px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Behaviour</th>
                <th className="px-3 py-2 text-right font-semibold">Previous</th>
                <th className="px-3 py-2 text-right font-semibold">Current</th>
                <th className="px-3 py-2 text-right font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {rubricPairs.map(({ r, prevAvg, prevCount }) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      {r.label}
                      {r.reverse && <ReverseScoreInfo />}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {prevCount > 0 ? prevAvg.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">
                    {r.count > 0 ? r.avg.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.count > 0 && prevCount > 0 ? (
                      <DeltaPill
                        current={r.avg}
                        previous={prevAvg}
                        goodDirection={r.reverse ? "down" : "up"}
                      />
                    ) : (
                      <span className="text-[10.5px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CohortSingleView({ summary }: { summary: CohortSummary }) {
  if (summary.classes === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-6 text-center">
        No check-ins recorded in this window.
      </p>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <SimpleStat label="Classes" value={summary.classes} />
      <SimpleStat label="Behaviour min" value={summary.avgBehaviourMins} suffix=" min" />
      <SimpleStat label="Transitions min" value={summary.avgTransitionMins} suffix=" min" />
      <SimpleStat label="Total lost" value={summary.avgTotalLost} suffix=" min" />
    </div>
  );
}

function SimpleStat({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3.5">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-heading font-extrabold text-[22px] tabular-nums">
        {value}
        <span className="text-[12px] font-semibold text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

// ───── Remedial plan section ─────

function RemedialPlanSection({
  plan,
  allOutcomes,
  onMarkTried,
  onEditOutcome,
}: {
  plan: RemedialPlanItem[];
  allOutcomes: RemedialOutcome[];
  onMarkTried: (
    behaviourId: BehaviourKey,
    behaviourLabel: string,
    strategy: RemedialStrategy,
  ) => void;
  onEditOutcome: (
    outcome: RemedialOutcome,
    behaviourLabel: string,
    strategy: RemedialStrategy,
  ) => void;
}) {
  const totalRecover =
    Math.round(plan.reduce((a, p) => a + p.estimatedMinsRecovered, 0) * 10) / 10;
  return (
    <section className="premium-elevated rounded-[22px] p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="premium-eyebrow">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <span>Personalised remedial plan</span>
          </div>
          <h3 className="font-heading font-extrabold text-[18px] mt-1.5 leading-tight">
            Top {plan.length} disruptive behaviours · suggested strategies
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Generated from the current period's reverse-scored rubric averages. Acting on these alone could
            recover ~<span className="font-semibold text-foreground">{totalRecover}</span> teaching
            minutes per class.
          </p>
        </div>
      </div>

      {plan.length === 0 ? (
        <EmptyState compact />
      ) : (
        <ul className="space-y-3">
          {plan.map((p, idx) => (
            <li key={p.behaviourId} className="rounded-xl border border-border bg-card/40 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-[12px]">
                    {idx + 1}
                  </span>
                  <span className="font-heading font-bold text-[14.5px] inline-flex items-center gap-1">
                    {p.behaviourLabel}
                    {p.reverse && <ReverseScoreInfo />}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25 text-[10.5px]"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ~{p.estimatedMinsRecovered} min/class recoverable
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-2.5">
                {p.strategies.map((s) => {
                  const outcomes = allOutcomes
                    .filter(
                      (o) => o.behaviourId === p.behaviourId && o.strategyTitle === s.title,
                    )
                    .slice(0, 3);
                  return (
                    <div
                      key={s.title}
                      className="rounded-lg border border-border bg-background/50 p-3 flex flex-col"
                    >
                      <div className="font-semibold text-[12.5px] mb-1">{s.title}</div>
                      <p className="text-[11.5px] text-muted-foreground leading-snug">
                        {s.description}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary">
                        <Sparkles className="h-3 w-3" />
                        {s.practiceSegment}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => onMarkTried(p.behaviourId, p.behaviourLabel, s)}
                        >
                          <ClipboardCheck className="h-3 w-3" />
                          Mark tried
                        </Button>
                        {outcomes.length > 0 && (
                          <span className="text-[10.5px] text-muted-foreground">
                            {outcomes.length} logged
                          </span>
                        )}
                      </div>
                      {outcomes.length > 0 && (
                        <ul className="mt-2 space-y-1.5 border-t border-border pt-2">
                          {outcomes.map((o) => (
                            <li key={o.id}>
                              <button
                                type="button"
                                onClick={() => onEditOutcome(o, p.behaviourLabel, s)}
                                className="w-full text-left flex items-start gap-1.5 text-[11px] hover:bg-muted/40 rounded px-1.5 py-1 transition-colors"
                              >
                                <OutcomeIcon result={o.result} />
                                <span className="flex-1 min-w-0">
                                  <span className="font-semibold">
                                    {outcomeLabel(o.result)}
                                  </span>
                                  {o.studentIds.length > 0 && (
                                    <span className="text-muted-foreground">
                                      {" · "}
                                      {o.studentIds.length} student
                                      {o.studentIds.length === 1 ? "" : "s"}
                                    </span>
                                  )}
                                  {o.note && (
                                    <span className="text-muted-foreground block truncate">
                                      "{o.note}"
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {new Date(o.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ───── Tried strategies log panel ─────

function TriedStrategiesPanel({
  outcomes,
  onDelete,
}: {
  outcomes: RemedialOutcome[];
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [resultFilter, setResultFilter] = useState<RemedialOutcomeResult | "all">("all");

  const filtered = useMemo(
    () =>
      outcomes.filter((o) => resultFilter === "all" || o.result === resultFilter),
    [outcomes, resultFilter],
  );

  const counts = useMemo(() => {
    const c = { worked: 0, partial: 0, no_change: 0 } as Record<RemedialOutcomeResult, number>;
    for (const o of outcomes) c[o.result] += 1;
    return c;
  }, [outcomes]);

  return (
    <section className="premium-elevated rounded-[22px] p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="premium-eyebrow">
            <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
            <span>Tried strategies log</span>
          </div>
          <h3 className="font-heading font-extrabold text-[18px] mt-1.5 leading-tight">
            What you've tried · {outcomes.length} entries
          </h3>
          <p className="text-[12px] text-muted-foreground">
            {counts.worked} worked · {counts.partial} partial · {counts.no_change} no change
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[12px] font-semibold text-muted-foreground hover:text-foreground"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11.5px]">
            <FilterChip
              label="All"
              active={resultFilter === "all"}
              onClick={() => setResultFilter("all")}
            />
            <FilterChip
              label="Worked"
              active={resultFilter === "worked"}
              onClick={() => setResultFilter("worked")}
            />
            <FilterChip
              label="Partial"
              active={resultFilter === "partial"}
              onClick={() => setResultFilter("partial")}
            />
            <FilterChip
              label="No change"
              active={resultFilter === "no_change"}
              onClick={() => setResultFilter("no_change")}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-[13px] text-muted-foreground py-6 text-center">
              No outcomes logged yet — use "Mark tried" on any strategy above.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((o) => {
                const studentNames = o.studentIds
                  .map((id) => STUDENTS.find((s) => s.id === id)?.name ?? id)
                  .slice(0, 3)
                  .join(", ");
                const extra = o.studentIds.length > 3 ? ` +${o.studentIds.length - 3} more` : "";
                return (
                  <li
                    key={o.id}
                    className="rounded-lg border border-border bg-card/50 p-3 flex items-start gap-2.5"
                  >
                    <OutcomeIcon result={o.result} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold">
                        {o.strategyTitle}
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · for {behaviourLabelFromKey(o.behaviourId)}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {outcomeLabel(o.result)}
                        {o.studentIds.length > 0
                          ? ` · ${studentNames}${extra}`
                          : " · whole class"}
                        {o.subject ? ` · ${o.subject}` : ""}
                        {o.grade ? ` · ${o.grade}` : ""}
                        {" · "}
                        {new Date(o.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {o.note && (
                        <p className="text-[11.5px] mt-1 italic text-muted-foreground">
                          "{o.note}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(o.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function OutcomeIcon({ result }: { result: RemedialOutcomeResult }) {
  if (result === "worked")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />;
  if (result === "partial")
    return <CircleDashed className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />;
  return <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />;
}

function outcomeLabel(r: RemedialOutcomeResult): string {
  if (r === "worked") return "Worked";
  if (r === "partial") return "Partial improvement";
  return "No change";
}

function behaviourLabelFromKey(id: BehaviourKey): string {
  return BEHAVIOUR_RUBRIC.find((r) => r.id === id)?.label ?? id;
}

// ───── Outcome dialog (mark tried / edit) ─────

function OutcomeDialog({
  draft,
  filter,
  onClose,
  onSaved,
}: {
  draft: {
    behaviourId: BehaviourKey;
    behaviourLabel: string;
    strategy: RemedialStrategy;
    editing?: RemedialOutcome;
  } | null;
  filter: CohortFilter;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = draft?.editing;
  const [result, setResult] = useState<RemedialOutcomeResult>("worked");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [initFor, setInitFor] = useState<string | null>(null);

  // Initialize when draft changes (keyed by editing id or new sentinel)
  const draftKey = draft ? (editing?.id ?? `new:${draft.behaviourId}:${draft.strategy.title}`) : null;
  if (draftKey !== initFor) {
    setInitFor(draftKey);
    setResult(editing?.result ?? "worked");
    setStudentIds(editing?.studentIds ?? []);
    setNote(editing?.note ?? "");
  }

  const roster = useMemo(() => {
    if (!draft) return [];
    return getRosterForCohort(filter);
  }, [draft, filter]);

  if (!draft) return null;

  const toggleStudent = (id: string) => {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const save = () => {
    const payload: RemedialOutcome = {
      id: editing?.id ?? newRemedialOutcomeId(),
      behaviourId: draft.behaviourId,
      strategyTitle: draft.strategy.title,
      studentIds,
      subject: filter.subject && filter.subject !== "all" ? filter.subject : undefined,
      grade: filter.grade && filter.grade !== "all" ? filter.grade : undefined,
      result,
      note: note.trim() || undefined,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    saveRemedialOutcome(payload);
    onSaved();
  };

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-[16px]">
            {editing ? "Edit outcome" : "Mark strategy tried"}
          </DialogTitle>
          <DialogDescription>
            {draft.strategy.title} · for {draft.behaviourLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Result
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["worked", "partial", "no_change"] as RemedialOutcomeResult[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[12px] font-semibold inline-flex items-center gap-1.5",
                    result === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <OutcomeIcon result={r} />
                  {outcomeLabel(r)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Students {studentIds.length > 0 && `(${studentIds.length} selected)`}
              </div>
              {studentIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStudentIds([])}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Leave empty for a whole-class outcome. Roster is drawn from check-ins matching the
              current cohort filter
              {filter.subject && filter.subject !== "all" ? ` · ${filter.subject}` : ""}
              {filter.grade && filter.grade !== "all" ? ` · ${filter.grade}` : ""}.
            </p>
            {roster.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-3 text-[12px] text-muted-foreground text-center">
                No students in scope. Outcome will be recorded for the whole class.
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {roster.map((row) => {
                  const stu = STUDENTS.find((s) => s.id === row.id);
                  const checked = studentIds.includes(row.id);
                  return (
                    <label
                      key={row.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-muted/40 text-[12.5px]"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleStudent(row.id)}
                      />
                      <span className="flex-1 min-w-0 truncate">
                        {stu?.name ?? row.id}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {row.classes} class{row.classes === 1 ? "" : "es"}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Note (optional)
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you observe? Any tweaks for next time?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{editing ? "Save changes" : "Log outcome"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───── Student trend mini-chart (used inside drill-down) ─────

function StudentTrendStrip({ checkIn }: { checkIn: ClassCheckIn }) {
  const trends = useMemo(() => {
    return checkIn.students
      .filter((s) => !s.absent)
      .slice(0, 6)
      .map((s) => {
        const stu = STUDENTS.find((x) => x.id === s.studentId);
        const points = getStudentRubricTrend(s.studentId);
        return { id: s.studentId, name: stu?.name ?? s.studentId, initials: stu?.initials ?? "?", points };
      })
      .filter((t) => t.points.length >= 2);
  }, [checkIn]);

  if (trends.length === 0) return null;

  return (
    <div>
      <h4 className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground mb-2">
        Student trend over recent check-ins
      </h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {trends.map((t) => {
          const first = t.points[0].avgScore;
          const last = t.points[t.points.length - 1].avgScore;
          const delta = Math.round((last - first) * 10) / 10;
          const trendUp = delta > 0;
          return (
            <div
              key={t.id}
              className="rounded-lg border border-border bg-card/50 p-2.5"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-[11.5px] font-semibold truncate">{t.name}</div>
                <span
                  className={cn(
                    "text-[10.5px] font-semibold inline-flex items-center gap-0.5",
                    Math.abs(delta) < 0.1
                      ? "text-muted-foreground"
                      : trendUp
                        ? "text-emerald-600"
                        : "text-rose-600",
                  )}
                >
                  {Math.abs(delta) < 0.1 ? (
                    <Minus className="h-3 w-3" />
                  ) : trendUp ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(delta)}
                </span>
              </div>
              <div className="h-12">
                <ResponsiveContainer>
                  <LineChart data={t.points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <YAxis hide domain={[1, 5]} />
                    <XAxis hide dataKey="label" />
                    <RTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(240 15% 90%)",
                        background: "hsl(0 0% 100% / 0.95)",
                        fontSize: 11,
                        padding: "4px 8px",
                      }}
                      formatter={(v: number) => [`${v} / 5`, "Avg"]}
                      labelFormatter={(l) => l as string}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke={trendUp ? "hsl(142 55% 48%)" : "hsl(0 70% 60%)"}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {t.points.length} check-ins · last {t.points[t.points.length - 1].avgScore} / 5
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
