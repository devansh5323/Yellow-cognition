"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  History,
  Layers,
  Lightbulb,
  PieChart,
  Search,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  gradeOverviewRows,
  gradeWeeklyInsight,
  schoolHealthOverview,
  getSchoolClasses,
  SCHOOL_RECENT_EVENTS,
  SCHOOL_DRIVER_LABEL,
  SUGGESTED_ACTIONS_BY_DRIVER,
  SUPPORT_STATUS_LABEL,
  type GradeOverviewRow,
  type ClassroomTier,
} from "@/lib/schoolData";
import { type PillarKey, type ScoreBand } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const CORE_DRIVERS: PillarKey[] = ["focus", "academic", "behavior", "task"];

const DRIVER_ICON: Record<PillarKey, LucideIcon> = {
  focus: Target,
  academic: BookOpen,
  behavior: Shield,
  task: BarChart3,
};

const DRIVER_TONE: Record<PillarKey, string> = {
  focus: "hsl(212 90% 58%)",
  academic: "hsl(142 55% 45%)",
  behavior: "hsl(262 60% 62%)",
  task: "hsl(28 88% 54%)",
};

const STATUS_TONE: Record<ScoreBand, string> = {
  excellent: "hsl(212 90% 58%)",
  stable: "hsl(142 55% 45%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(0 78% 58%)",
};

const TIER_TONE: Record<ClassroomTier, string> = {
  strong: "hsl(142 55% 42%)",
  solid: "hsl(142 45% 55%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(28 88% 54%)",
  intensive: "hsl(0 78% 55%)",
};

const TIER_OPTIONS: ClassroomTier[] = ["strong", "solid", "watch", "needs-support", "intensive"];

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export function GradeClassroomOverview() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const rows = useMemo(() => gradeOverviewRows(), []);
  const insight = useMemo(() => gradeWeeklyInsight(), []);
  const distribution = useMemo(() => schoolHealthOverview().distribution, []);
  const classes = useMemo(() => getSchoolClasses(), []);

  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [timePeriod, setTimePeriod] = useState("This Week");
  const [search, setSearch] = useState("");
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const activeRow = rows.find((r) => r.grade === activeGrade) ?? null;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (gradeFilter !== "All Grades" && r.gradeLabel !== gradeFilter) return false;
      if (driverFilter !== "All Drivers") {
        const driverKey = CORE_DRIVERS.find((k) => SCHOOL_DRIVER_LABEL[k] === driverFilter);
        if (r.areaNeedingAttention !== driverKey) return false;
      }
      if (tierFilter !== "All Tiers" && SUPPORT_STATUS_LABEL[r.supportTier] !== tierFilter) return false;
      if (q) {
        const classesInGrade = classes.filter((c) => c.grade === r.grade);
        const matchesGrade = r.gradeLabel.toLowerCase().includes(q);
        const matchesClassroom = classesInGrade.some(
          (c) => c.name.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q),
        );
        if (!matchesGrade && !matchesClassroom) return false;
      }
      return true;
    });
  }, [rows, gradeFilter, driverFilter, tierFilter, search, classes]);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="Grade and Classroom Overview"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Compare</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Grade &amp; Classroom Overview
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Compare how different parts of the school are functioning.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-4 border-t border-border/60 space-y-4">
              <FiltersRow
                grades={rows.map((r) => r.gradeLabel)}
                gradeFilter={gradeFilter}
                onGradeFilter={setGradeFilter}
                driverFilter={driverFilter}
                onDriverFilter={setDriverFilter}
                tierFilter={tierFilter}
                onTierFilter={setTierFilter}
                timePeriod={timePeriod}
                onTimePeriod={(v) => {
                  if (v !== "This Week") {
                    comingSoon("Historical trend data");
                    return;
                  }
                  setTimePeriod(v);
                }}
                search={search}
                onSearch={setSearch}
              />

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
                <GradeTable rows={filteredRows} onViewGrade={setActiveGrade} />

                <div className="space-y-4">
                  <ClassroomDistributionPanel distribution={distribution} />
                  <InsightPanel insight={insight} onViewGrade={setActiveGrade} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GradeDetailDrawer
        row={activeRow}
        onOpenChange={(o) => !o && setActiveGrade(null)}
      />
    </motion.section>
  );
}

function FiltersRow({
  grades,
  gradeFilter,
  onGradeFilter,
  driverFilter,
  onDriverFilter,
  tierFilter,
  onTierFilter,
  timePeriod,
  onTimePeriod,
  search,
  onSearch,
}: {
  grades: string[];
  gradeFilter: string;
  onGradeFilter: (v: string) => void;
  driverFilter: string;
  onDriverFilter: (v: string) => void;
  tierFilter: string;
  onTierFilter: (v: string) => void;
  timePeriod: string;
  onTimePeriod: (v: string) => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-2 flex items-center gap-2 flex-wrap">
      <FilterSelect
        icon={GraduationCap}
        value={gradeFilter}
        onChange={onGradeFilter}
        options={["All Grades", ...grades]}
      />
      <FilterSelect
        icon={Activity}
        value={driverFilter}
        onChange={onDriverFilter}
        options={["All Drivers", ...CORE_DRIVERS.map((k) => SCHOOL_DRIVER_LABEL[k])]}
      />
      <FilterSelect
        icon={Layers}
        value={tierFilter}
        onChange={onTierFilter}
        options={["All Tiers", ...TIER_OPTIONS.map((t) => SUPPORT_STATUS_LABEL[t])]}
      />
      <FilterSelect
        icon={Clock}
        value={timePeriod}
        onChange={onTimePeriod}
        options={["This Week", "This Month", "Today"]}
      />

      <div className="relative flex-1 min-w-[180px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search grade or classroom…"
          className="w-full h-9 pl-8 pr-3 text-[12.5px] rounded-lg border border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>
    </div>
  );
}

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative shrink-0">
      <Icon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-9 pl-8 pr-7 text-[12.5px] font-semibold rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/30 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}

function GradeTable({
  rows,
  onViewGrade,
}: {
  rows: GradeOverviewRow[];
  onViewGrade: (grade: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] min-w-[820px]">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
            <tr className="text-left">
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em]">Grade</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em] w-[80px]">Health</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em] w-[90px]">Change</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em]">Strongest driver</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em]">Main concern</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em] w-[80px]">Tier 2/3</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em] w-[90px]">Readiness</th>
              <th className="p-2.5 font-bold text-[10px] uppercase tracking-[0.1em] w-[130px]">Status</th>
              <th className="p-2.5 w-[36px]" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-muted-foreground">
                  No grades match these filters.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <GradeRow key={row.grade} row={row} onView={() => onViewGrade(row.grade)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DriverChip({ driver }: { driver: PillarKey }) {
  const Icon = DRIVER_ICON[driver];
  const tone = DRIVER_TONE[driver];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-5 w-5 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.4} />
      </span>
      {SCHOOL_DRIVER_LABEL[driver]}
    </span>
  );
}

function GradeRow({ row, onView }: { row: GradeOverviewRow; onView: () => void }) {
  const statusTone = STATUS_TONE[row.status];
  const tierTone = TIER_TONE[row.supportTier];

  return (
    <tr
      className="hover:bg-muted/30 transition-colors border-l-[3px]"
      style={{ borderLeftColor: statusTone }}
    >
      <td className="p-2.5 font-heading font-bold text-[13px]">{row.gradeLabel}</td>
      <td className="p-2.5">
        <span
          className="inline-flex items-center justify-center min-w-[52px] rounded-lg px-2.5 py-1.5 font-heading font-black text-[15px] tabular-nums"
          style={{ background: `color-mix(in srgb, ${statusTone} 14%, transparent)`, color: statusTone }}
        >
          {row.healthScore}
        </span>
      </td>
      <td className="p-2.5">
        <span
          className="inline-flex items-center gap-0.5 font-bold tabular-nums"
          style={{ color: row.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
        >
          {row.delta >= 0 ? "↑" : "↓"} {row.delta >= 0 ? "+" : ""}
          {row.delta}
        </span>
      </td>
      <td className="p-2.5">
        <DriverChip driver={row.strongestDriver} />
      </td>
      <td className="p-2.5">
        {row.areaNeedingAttention ? (
          <DriverChip driver={row.areaNeedingAttention} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-2.5 tabular-nums text-muted-foreground">
        {row.tier2Count} / {row.tier3Count}
      </td>
      <td className="p-2.5 tabular-nums">{row.dataReadinessPct}%</td>
      <td className="p-2.5">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold whitespace-nowrap"
          style={{ background: `color-mix(in srgb, ${tierTone} 14%, transparent)`, color: tierTone }}
        >
          {SUPPORT_STATUS_LABEL[row.supportTier]}
        </span>
      </td>
      <td className="p-2.5">
        <button
          type="button"
          onClick={onView}
          aria-label={`View ${row.gradeLabel} details`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function ClassroomDistributionPanel({
  distribution,
}: {
  distribution: { tier: ClassroomTier; count: number; pct: number }[];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
          <PieChart className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-heading font-bold text-[12.5px]">Classroom distribution</h3>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/50 mb-3">
        {distribution.map((d) => {
          if (d.count <= 0) return null;
          return (
            <span
              key={d.tier}
              className="h-full"
              style={{ flex: `${d.pct} 1 0`, background: TIER_TONE[d.tier] }}
              title={`${SUPPORT_STATUS_LABEL[d.tier]}: ${d.count}`}
            />
          );
        })}
      </div>
      <ul className="space-y-1.5">
        {distribution.map((d) => (
          <li
            key={d.tier}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
            style={{ background: d.count > 0 ? `color-mix(in srgb, ${TIER_TONE[d.tier]} 6%, transparent)` : undefined }}
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: TIER_TONE[d.tier] }}
              />
              <span className="text-[11.5px] text-foreground/85 truncate">{SUPPORT_STATUS_LABEL[d.tier]}</span>
            </span>
            <span
              className="text-[11.5px] tabular-nums font-bold shrink-0"
              style={{ color: TIER_TONE[d.tier] }}
            >
              {d.count} <span className="text-muted-foreground font-medium">({d.pct}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightPanel({
  insight,
  onViewGrade,
}: {
  insight: ReturnType<typeof gradeWeeklyInsight>;
  onViewGrade: (grade: string) => void;
}) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-heading font-bold text-[12.5px]">Insight this week</h3>
      </div>

      {!insight ? (
        <p className="text-[11.5px] text-muted-foreground leading-snug">
          No grade shows a concerning decline this week.
        </p>
      ) : (
        <>
          <p className="text-[12px] text-foreground/85 leading-snug">
            <span className="font-bold">{insight.gradeLabel}</span> shows the sharpest decline this
            week ({insight.delta}). {SCHOOL_DRIVER_LABEL[insight.driver]} is the main concern, with{" "}
            {insight.flaggedCount} classroom{insight.flaggedCount === 1 ? "" : "s"} flagged for
            monitoring or support.
          </p>

          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">
              Suggested actions
            </div>
            <ul className="space-y-1.5">
              {insight.suggestedActions.map((action) => (
                <li key={action} className="flex items-start gap-1.5 text-[11.5px] text-foreground/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-[1px] shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onViewGrade(insight.grade)}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 hover:bg-amber-500/20 px-3 h-8 text-[11.5px] font-bold text-amber-700 dark:text-amber-400 transition-colors"
          >
            View {insight.gradeLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function classroomInitials(name: string): string {
  const match = name.match(/Grade\s+([^\s]+)\s*·\s*([A-Za-z])/);
  return match ? `${match[1]}${match[2]}`.toUpperCase().slice(0, 3) : name.slice(0, 2).toUpperCase();
}

function GradeDetailDrawer({
  row,
  onOpenChange,
}: {
  row: GradeOverviewRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const classes = useMemo(() => getSchoolClasses(), []);
  const classesInGrade = row ? classes.filter((c) => row.classIds.includes(c.id)) : [];
  const history = row
    ? SCHOOL_RECENT_EVENTS.filter(
        (e) => e.title.includes(`Grade ${row.grade}`) || e.body.includes(`Grade ${row.grade}`),
      )
    : [];
  const statusTone = row ? STATUS_TONE[row.status] : "";

  return (
    <Sheet open={!!row} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {row && (
          <>
            <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
              <SheetTitle className="font-heading font-extrabold text-[16px]">
                {row.gradeLabel} — grade context
              </SheetTitle>
              <SheetDescription className="text-[12px]">
                {row.classroomsContributing} classroom{row.classroomsContributing === 1 ? "" : "s"}{" "}
                contributing · {row.dataReadinessPct}% data readiness
              </SheetDescription>
            </SheetHeader>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-heading font-black text-[36px] tabular-nums leading-none"
                    style={{ color: statusTone }}
                  >
                    {row.healthScore}
                  </span>
                  <span className="text-[13px] font-bold text-muted-foreground/70">/100</span>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums"
                  style={{ color: row.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
                >
                  {row.delta >= 0 ? "↑" : "↓"} {row.delta >= 0 ? "+" : ""}
                  {row.delta} from last week
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-border/60 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Strongest driver
                  </div>
                  <div className="text-[12.5px] font-semibold">
                    {SCHOOL_DRIVER_LABEL[row.strongestDriver]}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Area needing attention
                  </div>
                  <div className="text-[12.5px] font-semibold">
                    {row.areaNeedingAttention ? SCHOOL_DRIVER_LABEL[row.areaNeedingAttention] : "None"}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Tier 2 / Tier 3
                  </div>
                  <div className="text-[12.5px] font-semibold tabular-nums">
                    {row.tier2Count} / {row.tier3Count} classrooms
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Support status
                  </div>
                  <div
                    className="text-[12.5px] font-semibold"
                    style={{ color: TIER_TONE[row.supportTier] }}
                  >
                    {SUPPORT_STATUS_LABEL[row.supportTier]}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-[13px] mb-2">Classrooms in this grade</h4>
                <ul className="space-y-1">
                  {classesInGrade.map((c) => (
                    <li key={c.id}>
                      <Link
                        href="/school/classes"
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
                      >
                        <span
                          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 text-[11px] font-bold"
                          style={{ background: `color-mix(in srgb, ${statusTone} 16%, transparent)`, color: statusTone }}
                        >
                          {classroomInitials(c.name)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{c.teacherName}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-heading font-bold text-[13px] mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Recent history
                </h4>
                {history.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No recorded history for this grade yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {history.map((e) => (
                      <li key={e.id} className="rounded-lg border border-border/60 p-2.5">
                        <div className="text-[12px] font-semibold">{e.title}</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{e.body}</p>
                        <div className="text-[10px] text-muted-foreground mt-1">{e.time}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {row.areaNeedingAttention && (
                <div>
                  <h4 className="font-heading font-bold text-[13px] mb-2">Suggested next steps</h4>
                  <ul className="space-y-1">
                    {SUGGESTED_ACTIONS_BY_DRIVER[row.areaNeedingAttention].map((action) => (
                      <li key={action} className="flex items-start gap-1.5 text-[12px] text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => comingSoon("Recording a leadership decision")}
                  className="flex-1 h-9 rounded-lg border border-border/60 text-[12px] font-bold hover:bg-muted/50 transition-colors"
                >
                  Record decision
                </button>
                <button
                  type="button"
                  onClick={() => comingSoon("Assigning a follow-up")}
                  className="flex-1 h-9 rounded-lg border border-border/60 text-[12px] font-bold hover:bg-muted/50 transition-colors"
                >
                  Assign follow-up
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
