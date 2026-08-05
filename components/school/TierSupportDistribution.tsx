"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Building2,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Clock,
  GraduationCap,
  Info,
  Layers,
  ListFilter,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getSchoolClasses,
  schoolTierDistribution,
  schoolSupportStatus,
  schoolCapacityIndicators,
  schoolTierByGrade,
  schoolDriverCards,
  classTierSplit,
  classroomTierFor,
  classComposite,
  SCHOOL_DRIVER_LABEL,
  SUPPORT_STATUS_DELTA,
  TIER_COLOR,
  TIER_LABEL,
  TIER_SUBLABEL,
  type SchoolSupportStatus,
  type TierScope,
} from "@/lib/schoolData";
import { type PillarKey } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const CORE_DRIVERS: PillarKey[] = ["focus", "academic", "behavior", "task"];

const DRIVER_ICON: Record<PillarKey, LucideIcon> = {
  focus: Target,
  academic: GraduationCap,
  behavior: Layers,
  task: Activity,
};

const DRIVER_TONE: Record<PillarKey, string> = {
  focus: "hsl(212 90% 58%)",
  academic: "hsl(142 55% 45%)",
  behavior: "hsl(262 60% 62%)",
  task: "hsl(28 88% 54%)",
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

type SupportTileDef = {
  key: keyof SchoolSupportStatus;
  label: string;
  Icon: LucideIcon;
  tone: string;
};

const SUPPORT_TILES: SupportTileDef[] = [
  { key: "newReferrals", label: "New Referrals", Icon: UserPlus, tone: "hsl(262 60% 62%)" },
  { key: "awaitingReview", label: "Cases Awaiting Review", Icon: Clock, tone: "hsl(38 92% 48%)" },
  { key: "activeInterventions", label: "Active Interventions", Icon: ClipboardList, tone: "hsl(212 90% 58%)" },
  { key: "studentsImproving", label: "Students Improving", Icon: TrendingUp, tone: "hsl(142 55% 42%)" },
  { key: "limitedResponse", label: "Limited Response", Icon: AlertTriangle, tone: "hsl(28 88% 54%)" },
  { key: "escalations", label: "Cases Requiring Escalation", Icon: AlertOctagon, tone: "hsl(0 78% 58%)" },
];

type FilterTab = "grade" | "classroom" | "driver" | "status";

export function TierSupportDistribution() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const classes = useMemo(() => getSchoolClasses(), []);
  const gradeOptions = useMemo(() => schoolTierByGrade().map((r) => r.gradeLabel), []);

  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [classroomFilter, setClassroomFilter] = useState("All Classrooms");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [timePeriod, setTimePeriod] = useState("This Week");
  const [filterTab, setFilterTab] = useState<FilterTab>("grade");

  const scope: TierScope = useMemo(() => {
    const s: TierScope = {};
    if (gradeFilter !== "All Grades") s.grade = gradeFilter.replace("Grade ", "");
    if (classroomFilter !== "All Classrooms") {
      const cls = classes.find((c) => c.name === classroomFilter);
      if (cls) s.classroomId = cls.id;
    }
    if (driverFilter !== "All Drivers") {
      const key = CORE_DRIVERS.find((k) => SCHOOL_DRIVER_LABEL[k] === driverFilter);
      if (key) s.driver = key;
    }
    return s;
  }, [gradeFilter, classroomFilter, driverFilter, classes]);

  const distribution = useMemo(() => schoolTierDistribution(scope), [scope]);
  const status = useMemo(() => schoolSupportStatus(scope), [scope]);
  const capacity = useMemo(() => schoolCapacityIndicators(), []);
  const gradeRows = useMemo(() => schoolTierByGrade(), []);
  const driverCards = useMemo(() => schoolDriverCards(), []);

  const pieData = distribution.bands.map((b) => ({ name: TIER_LABEL[b.tier], value: b.count, tier: b.tier }));

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="Tier Support Distribution"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Effectiveness</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Tier Support Distribution
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Overview of student support levels and system effectiveness.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
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
              <div className="rounded-xl border border-border/60 bg-muted/20 p-2 flex items-center gap-2 flex-wrap">
                <FilterSelect icon={GraduationCap} value={gradeFilter} onChange={setGradeFilter} options={["All Grades", ...gradeOptions]} />
                <FilterSelect
                  icon={Building2}
                  value={classroomFilter}
                  onChange={setClassroomFilter}
                  options={["All Classrooms", ...classes.map((c) => c.name)]}
                />
                <FilterSelect
                  icon={Activity}
                  value={driverFilter}
                  onChange={setDriverFilter}
                  options={["All Drivers", ...CORE_DRIVERS.map((k) => SCHOOL_DRIVER_LABEL[k])]}
                />
                <FilterSelect
                  icon={Clock}
                  value={timePeriod}
                  onChange={(v) => {
                    if (v !== "This Week") {
                      comingSoon("Historical trend data");
                      return;
                    }
                    setTimePeriod(v);
                  }}
                  options={["This Week", "This Month", "Today"]}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
                <TierDistributionPanel pieData={pieData} distribution={distribution} />
                <SupportStatusPanel status={status} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
                <CapacityIndicatorsPanel capacity={capacity} />
                <FilterByPanel
                  tab={filterTab}
                  onTab={setFilterTab}
                  gradeRows={gradeRows}
                  classes={classes}
                  driverCards={driverCards}
                  status={status}
                />
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <p className="inline-flex items-center gap-2 text-[11.5px] text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Tier data is based on active interventions and support records. Students may move
                  between tiers as needs change.
                </p>
                <button
                  type="button"
                  onClick={() => comingSoon("The tiered-supports guide")}
                  className="text-[11.5px] font-bold text-primary hover:underline shrink-0"
                >
                  Learn more about tiered supports →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
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
        className="appearance-none h-9 pl-8 pr-7 text-[12.5px] font-semibold rounded-lg border border-border/60 bg-card text-foreground hover:border-primary/30 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer max-w-[180px] truncate"
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

function TierDistributionPanel({
  pieData,
  distribution,
}: {
  pieData: { name: string; value: number; tier: "tier1" | "tier2" | "tier3" }[];
  distribution: ReturnType<typeof schoolTierDistribution>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
            <Layers className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <h3 className="font-heading font-bold text-[13px]">Tier Distribution</h3>
        </div>
        <Link
          href="/school/classes"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline"
        >
          View by grade →
        </Link>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <div className="relative h-[160px] w-[160px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
              >
                {pieData.map((d) => (
                  <Cell key={d.tier} fill={TIER_COLOR[d.tier]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(240 15% 90%)",
                  background: "hsl(0 0% 100% / 0.95)",
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [`${value} students`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-heading font-black text-[26px] tabular-nums leading-none">
                {distribution.totalStudents}
              </div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground mt-1">
                Students
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[220px] grid grid-cols-1 sm:grid-cols-3 gap-3">
          {distribution.bands.map((b) => (
            <div key={b.tier}>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: TIER_COLOR[b.tier] }} />
                <span className="text-[11.5px] font-bold" style={{ color: TIER_COLOR[b.tier] }}>
                  {TIER_LABEL[b.tier]}
                </span>
              </div>
              <div className="text-[10.5px] text-muted-foreground leading-tight">{TIER_SUBLABEL[b.tier]}</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="font-heading font-extrabold text-[18px] tabular-nums leading-none">
                  {b.count}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{b.pct}%</span>
              </div>
              <div
                className="text-[10.5px] font-bold tabular-nums mt-0.5"
                style={{ color: b.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
              >
                {b.delta >= 0 ? "↑" : "↓"} {Math.abs(b.delta)}% vs last week
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border/60 bg-primary/[0.04] p-3 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-foreground/80 leading-snug">
          Tier 2 population increased slightly this week, mainly in classrooms trending downward.
        </p>
      </div>
    </div>
  );
}

function SupportStatusPanel({ status }: { status: SchoolSupportStatus }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <h3 className="font-heading font-bold text-[13px]">Support Status</h3>
        </div>
        <Link
          href="/school/classes"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline"
        >
          View all cases →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPORT_TILES.map((tile) => {
          const value = status[tile.key];
          const delta = SUPPORT_STATUS_DELTA[tile.key];
          return (
            <div key={tile.key} className="rounded-lg border border-border/60 p-3 flex items-start gap-2.5">
              <span
                className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`, color: tile.tone }}
              >
                <tile.Icon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-extrabold text-[18px] tabular-nums leading-none">
                    {value}
                  </span>
                  <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ↑ {delta}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-foreground/80 leading-tight mt-0.5">
                  {tile.label}
                </div>
                <div className="text-[9.5px] text-muted-foreground mt-0.5">vs last week</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CapacityIndicatorsPanel({ capacity }: { capacity: ReturnType<typeof schoolCapacityIndicators> }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
          <Users className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-heading font-bold text-[13px]">Capacity Indicators</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CapacityCard
          label="Tier 2 Group Capacity"
          Icon={Users}
          tone="hsl(38 92% 48%)"
          pct={capacity.tier2Pct}
          usedLabel={`Used: ${capacity.tier2Used} of ${capacity.tier2Capacity} places`}
          note={
            capacity.tier2Capacity - capacity.tier2Used > 0
              ? `${capacity.tier2Capacity - capacity.tier2Used} more students can be added across Tier 2 groups.`
              : "Tier 2 groups are at capacity."
          }
        />
        <CapacityCard
          label="Tier 3 Caseload"
          Icon={Users}
          tone="hsl(0 78% 55%)"
          pct={capacity.tier3Pct}
          usedLabel={`Used: ${capacity.tier3Used} of ${capacity.tier3Capacity} active cases`}
          note={
            capacity.tier3Pct >= 80
              ? "High caseload. Consider additional support or review case intensity."
              : "Caseload is within a manageable range."
          }
        />
        <div className="rounded-lg border border-border/60 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
              <UserPlus className="h-3.5 w-3.5" />
            </span>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground leading-tight">
              Specialist Support Availability
            </div>
          </div>
          <button
            type="button"
            onClick={() => comingSoon("Specialist scheduling data")}
            className="w-full text-left"
          >
            <div className="font-heading font-extrabold text-[15px] text-muted-foreground">Coming soon</div>
            <p className="text-[10.5px] text-muted-foreground mt-1 leading-snug">
              Requires specialist staff-scheduling data, which isn&apos;t tracked yet.
            </p>
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border/60 p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0 bg-rose-500/12 text-rose-600 dark:text-rose-400">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <div className="font-heading font-extrabold text-[16px] leading-none">
              {capacity.reviewsOverdueTotal}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Overdue Reviews</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10.5px] font-bold">
            Tier 2: {capacity.reviewsOverdueTier2}
          </span>
          <span className="inline-flex items-center rounded-full bg-rose-500/12 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-[10.5px] font-bold">
            Tier 3: {capacity.reviewsOverdueTier3}
          </span>
        </div>
        <Link
          href="/school/classes"
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline shrink-0"
        >
          View overdue reviews →
        </Link>
      </div>
    </div>
  );
}

function CapacityCard({
  label,
  Icon,
  tone,
  pct,
  usedLabel,
  note,
}: {
  label: string;
  Icon: LucideIcon;
  tone: string;
  pct: number;
  usedLabel: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground leading-tight">
          {label}
        </div>
      </div>
      <div className="font-heading font-extrabold text-[22px] tabular-nums leading-none" style={{ color: tone }}>
        {pct}%
      </div>
      <div className="text-[10.5px] text-muted-foreground mt-0.5">Capacity Used</div>
      <div className="h-2 w-full rounded-full bg-muted/60 mt-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct)}%`, background: tone }}
        />
      </div>
      <div className="text-[10.5px] text-muted-foreground mt-2">{usedLabel}</div>
      <p className="text-[10.5px] text-foreground/75 leading-snug mt-1.5 pt-1.5 border-t border-border/50">
        {note}
      </p>
    </div>
  );
}

function FilterByPanel({
  tab,
  onTab,
  gradeRows,
  classes,
  driverCards,
  status,
}: {
  tab: FilterTab;
  onTab: (t: FilterTab) => void;
  gradeRows: ReturnType<typeof schoolTierByGrade>;
  classes: ReturnType<typeof getSchoolClasses>;
  driverCards: ReturnType<typeof schoolDriverCards>;
  status: SchoolSupportStatus;
}) {
  const TABS: { key: FilterTab; label: string; Icon: LucideIcon }[] = [
    { key: "grade", label: "Grade", Icon: GraduationCap },
    { key: "classroom", label: "Classroom", Icon: Building2 },
    { key: "driver", label: "Driver", Icon: Target },
    { key: "status", label: "Support Status", Icon: ListFilter },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
          <ListFilter className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-heading font-bold text-[13px]">Filter By</h3>
      </div>

      <div role="tablist" className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 mb-3 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => onTab(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-bold transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
        {tab === "grade" && (
          <table className="w-full text-[12px] min-w-[380px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-1.5 font-bold text-[10px] uppercase">Grade</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier 1</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier 2</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier 3</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Total</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {gradeRows.map((r) => (
                <tr key={r.grade}>
                  <td className="p-1.5 font-semibold">{r.gradeLabel}</td>
                  <td className="p-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">{r.tier1Pct}%</td>
                  <td className="p-1.5 text-amber-600 dark:text-amber-400 font-semibold">{r.tier2Pct}%</td>
                  <td className="p-1.5 text-rose-600 dark:text-rose-400 font-semibold">{r.tier3Pct}%</td>
                  <td className="p-1.5 tabular-nums text-muted-foreground">{r.totalStudents}</td>
                  <td
                    className="p-1.5 font-semibold tabular-nums"
                    style={{ color: r.trend >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
                  >
                    {r.trend >= 0 ? "↑" : "↓"} {r.trend >= 0 ? "+" : ""}
                    {r.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "classroom" && (
          <table className="w-full text-[12px] min-w-[420px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-1.5 font-bold text-[10px] uppercase">Classroom</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier 2</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Tier 3</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {classes.map((c) => {
                const split = classTierSplit(c);
                const tierDef = classroomTierFor(classComposite(c.drivers));
                return (
                  <tr key={c.id}>
                    <td className="p-1.5 font-semibold truncate max-w-[140px]">{c.name}</td>
                    <td className="p-1.5 text-muted-foreground">{tierDef.label}</td>
                    <td className="p-1.5 text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                      {split.tier2}
                    </td>
                    <td className="p-1.5 text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                      {split.tier3}
                    </td>
                    <td className="p-1.5 tabular-nums text-muted-foreground">{c.size}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "driver" && (
          <table className="w-full text-[12px] min-w-[420px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-1.5 font-bold text-[10px] uppercase">Driver</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Score</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Classrooms flagged</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Students affected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {driverCards.map((d) => {
                const affected = classes.filter((c) => d.affectedClassIds.includes(c.id));
                const affectedStudents = affected.reduce((acc, c) => {
                  const s = classTierSplit(c);
                  return acc + s.tier2 + s.tier3;
                }, 0);
                const Icon = DRIVER_ICON[d.key];
                return (
                  <tr key={d.key}>
                    <td className="p-1.5 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" style={{ color: DRIVER_TONE[d.key] }} />
                        {d.label}
                      </span>
                    </td>
                    <td className="p-1.5 tabular-nums font-semibold" style={{ color: DRIVER_TONE[d.key] }}>
                      {d.score}
                    </td>
                    <td className="p-1.5 tabular-nums text-muted-foreground">{d.needAttentionCount}</td>
                    <td className="p-1.5 tabular-nums text-muted-foreground">{affectedStudents}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "status" && (
          <table className="w-full text-[12px] min-w-[340px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-1.5 font-bold text-[10px] uppercase">Support status</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Students</th>
                <th className="p-1.5 font-bold text-[10px] uppercase">Share of active cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {SUPPORT_TILES.filter((t) => t.key !== "activeInterventions").map((t) => {
                const value = status[t.key];
                const pct = status.activeInterventions > 0 ? Math.round((value / status.activeInterventions) * 100) : 0;
                return (
                  <tr key={t.key}>
                    <td className="p-1.5 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <t.Icon className="h-3.5 w-3.5" style={{ color: t.tone }} />
                        {t.label}
                      </span>
                    </td>
                    <td className="p-1.5 tabular-nums font-semibold">{value}</td>
                    <td className="p-1.5 tabular-nums text-muted-foreground">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
