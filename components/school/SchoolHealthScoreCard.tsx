"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  Info,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  coverageLabelFor,
  gradeOverviewRows,
  schoolHealthCoverage,
  schoolHealthOverview,
  schoolHealthTrend,
  schoolPillarMetrics,
  schoolSupportFocus,
  type SchoolPillarKey,
  type SchoolPillarMetric,
  type SchoolHealthCoverage,
  type SchoolHealthOverview,
  type SupportFocusRow,
} from "@/lib/schoolData";
import { SCORE_BANDS, type ScoreBand } from "@/lib/classHealth";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const STATUS_TONE: Record<ScoreBand, string> = {
  excellent: "hsl(142 55% 45%)",
  stable: "hsl(38 92% 48%)",
  watch: "hsl(28 88% 54%)",
  "needs-support": "hsl(0 78% 58%)",
};

const STATUS_LABEL: Record<ScoreBand, string> = {
  excellent: "Excellent",
  stable: "Stable",
  watch: "Watch",
  "needs-support": "Needs Support",
};

const COVERAGE_TONE: Record<string, string> = {
  "High coverage": "hsl(142 55% 42%)",
  "Moderate coverage": "hsl(38 92% 45%)",
  "Low coverage": "hsl(0 78% 55%)",
};

const PILLAR_ICON: Record<SchoolPillarKey, LucideIcon> = {
  studentWellbeing: HeartHandshake,
  classroomPerformance: BarChart3,
  teacherEfficiency: Users,
};

const PILLAR_TONE: Record<SchoolPillarKey, string> = {
  studentWellbeing: "hsl(142 55% 42%)",
  classroomPerformance: "hsl(262 60% 55%)",
  teacherEfficiency: "hsl(28 88% 54%)",
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export function SchoolHealthScoreCard() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const gradeLabels = useMemo(() => gradeOverviewRows().map((r) => r.gradeLabel), []);
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [periodFilter, setPeriodFilter] = useState("This Week");
  const [visible, setVisible] = useState<Record<SchoolPillarKey, boolean>>({
    studentWellbeing: true,
    classroomPerformance: true,
    teacherEfficiency: true,
  });

  const scopedGrade = gradeFilter === "All Grades" ? null : gradeFilter.replace("Grade ", "");

  const overview = useMemo(() => schoolHealthOverview(scopedGrade), [scopedGrade]);
  const coverage = useMemo(() => schoolHealthCoverage(scopedGrade), [scopedGrade]);
  const pillars = useMemo(() => schoolPillarMetrics(scopedGrade), [scopedGrade]);
  const supportFocus = useMemo(() => schoolSupportFocus(scopedGrade), [scopedGrade]);
  const trend = useMemo(() => schoolHealthTrend(scopedGrade), [scopedGrade]);

  const statusTone = STATUS_TONE[overview.status];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="School Health Score"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>School health</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            School Health Score
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            A summary of student well-being, classroom performance and teacher efficiency.
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
              <div className="rounded-xl border border-border/60 bg-muted/20 p-2 flex items-center gap-2 flex-wrap">
                <FilterSelect
                  icon={CalendarDays}
                  value={periodFilter}
                  onChange={(v) => {
                    if (v !== "This Week") {
                      comingSoon("Historical date ranges");
                      return;
                    }
                    setPeriodFilter(v);
                  }}
                  options={["This Week", "This Month", "Custom range"]}
                />
                <FilterSelect
                  icon={GraduationCap}
                  value={gradeFilter}
                  onChange={setGradeFilter}
                  options={["All Grades", ...gradeLabels]}
                />
                <FilterSelect
                  icon={BookOpen}
                  value={subjectFilter}
                  onChange={(v) => {
                    if (v !== "All Subjects") {
                      comingSoon("Subject-level breakdown");
                      return;
                    }
                    setSubjectFilter(v);
                  }}
                  options={["All Subjects", "Math", "Reading", "Science"]}
                />
              </div>

              <ScoreDetailCard
                overview={overview}
                coverage={coverage}
                pillars={pillars}
                supportFocus={supportFocus}
                statusTone={statusTone}
              />

              <TrendChart
                trend={trend}
                visible={visible}
                onToggle={(key) => setVisible((v) => ({ ...v, [key]: !v[key] }))}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-primary hover:underline"
                  >
                    <Info className="h-3.5 w-3.5" />
                    How School Health is calculated
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-[320px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    School Health Score
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-2 leading-snug">
                    The average of 6 drivers, each rolled up from every classroom&apos;s real check-in and
                    follow-up data:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {overview.drivers.map((d) => (
                      <li key={d.key} className="flex items-center justify-between text-[11.5px]">
                        <span className="text-foreground/85">{d.label}</span>
                        <span className="font-bold tabular-nums">{d.score}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                      Status bands
                    </div>
                    <ul className="space-y-1">
                      {SCORE_BANDS.map((b) => (
                        <li key={b.band} className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{b.tag}</span>
                          <span className="tabular-nums text-foreground/80">{b.range}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
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

function CoverageStat({
  icon: Icon,
  label,
  pct,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  pct: number;
  detail: string;
}) {
  const coverageLabel = coverageLabelFor(pct);
  const tone = COVERAGE_TONE[coverageLabel];
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 min-w-0">
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 mb-2"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      <div className="font-heading font-extrabold text-[17px] tabular-nums leading-none">{detail}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mt-1">{label}</div>
      <div className="h-1 w-full rounded-full bg-muted/60 mt-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
      </div>
      <div className="inline-flex items-center gap-1 text-[10px] font-bold mt-1.5" style={{ color: tone }}>
        {coverageLabel}
      </div>
    </div>
  );
}

function PillarMiniCard({ metric }: { metric: SchoolPillarMetric }) {
  const Icon = PILLAR_ICON[metric.key];
  const tone = PILLAR_TONE[metric.key];

  return (
    <div
      className="rounded-xl border p-3 min-w-0"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 22%, var(--border))`,
        background: `color-mix(in srgb, ${tone} 5%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-bold text-foreground/85 leading-tight truncate">{metric.label}</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading font-extrabold text-[18px] tabular-nums leading-none" style={{ color: tone }}>
              {metric.score}%
            </span>
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums"
              style={{ color: metric.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
            >
              {metric.delta >= 0 ? "↑" : "↓"} {Math.abs(metric.delta)}%
            </span>
          </div>
        </div>
      </div>
      <div className="h-1 w-full rounded-full bg-muted/60 mt-2.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, metric.score)}%`, background: tone }} />
      </div>
    </div>
  );
}

function ScoreDetailCard({
  overview,
  coverage,
  pillars,
  supportFocus,
  statusTone,
}: {
  overview: SchoolHealthOverview;
  coverage: SchoolHealthCoverage;
  pillars: SchoolPillarMetric[];
  supportFocus: SupportFocusRow[];
  statusTone: string;
}) {
  const classroomsPct =
    coverage.classroomsTotal > 0 ? Math.round((coverage.classroomsUsed / coverage.classroomsTotal) * 100) : 0;
  const teachersPct = coverage.teachersTotal > 0 ? Math.round((coverage.teachersUsed / coverage.teachersTotal) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
      <div
        className="p-4 md:p-5"
        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${statusTone} 7%, transparent), transparent 60%)` }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-2">
              School Health Score
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className="font-heading font-black tabular-nums leading-none text-[52px]"
                style={{ color: statusTone }}
              >
                {overview.score}
              </span>
              <span className="text-[13px] font-extrabold text-muted-foreground/80">/100</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
              style={{ background: `color-mix(in srgb, ${statusTone} 14%, transparent)`, color: statusTone }}
            >
              <ShieldCheck className="h-3 w-3" />
              {STATUS_LABEL[overview.status]}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold tabular-nums"
              style={{ color: overview.delta >= 0 ? "hsl(142 55% 42%)" : "hsl(0 78% 55%)" }}
            >
              {overview.delta >= 0 ? "↑" : "↓"} {Math.abs(overview.delta)} from last week
            </span>
          </div>
        </div>
        <p className="text-[12px] text-foreground/80 leading-snug mt-3 max-w-[64ch]">{overview.interpretation}</p>

        <div className="mt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2">
            Complementary scores
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {pillars.map((metric) => (
              <PillarMiniCard key={metric.key} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5 pt-4 border-t border-border/60 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-3">
            Coverage
            <Info className="h-3 w-3" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <CoverageStat
              icon={Building2}
              label="Classrooms"
              pct={classroomsPct}
              detail={`${coverage.classroomsUsed}/${coverage.classroomsTotal}`}
            />
            <CoverageStat
              icon={Users}
              label="Teachers"
              pct={teachersPct}
              detail={`${coverage.teachersUsed}/${coverage.teachersTotal}`}
            />
            <CoverageStat
              icon={Activity}
              label="Data readiness"
              pct={coverage.dataReadinessPct}
              detail={`${coverage.dataReadinessPct}%`}
            />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Support Focus
            <Info className="h-3 w-3" />
          </div>
          <p className="text-[10.5px] text-muted-foreground mt-1 mb-2.5">
            Grades or staff groups needing closer review
          </p>
          {supportFocus.length === 0 ? (
            <p className="text-[11.5px] text-muted-foreground">Nothing currently needs closer review.</p>
          ) : (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 px-2.5 py-1.5 bg-muted/40 text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                <span>Grade / Area</span>
                <span>Details</span>
                <span>CTA</span>
              </div>
              <ul className="divide-y divide-border/60">
                {supportFocus.map((row) => (
                  <li key={row.pillar} className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center px-2.5 py-2">
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-bold">{row.gradeLabel}</div>
                      <div className="text-[9.5px] text-muted-foreground">{row.area}</div>
                    </div>
                    <div className="text-[10.5px] text-foreground/80 leading-snug">{row.details}</div>
                    <Link
                      href={row.ctaHref}
                      className="text-[10.5px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
                    >
                      {row.ctaLabel} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={() => comingSoon("The full support-focus list")}
            className="mt-2.5 text-[11px] font-bold text-primary hover:underline"
          >
            View all support items →
          </button>
        </div>
      </div>
    </div>
  );
}

function TrendChart({
  trend,
  visible,
  onToggle,
}: {
  trend: ReturnType<typeof schoolHealthTrend>;
  visible: Record<SchoolPillarKey, boolean>;
  onToggle: (key: SchoolPillarKey) => void;
}) {
  const [periodFilter, setPeriodFilter] = useState("Weekly");
  const keys: SchoolPillarKey[] = ["studentWellbeing", "classroomPerformance", "teacherEfficiency"];

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="inline-flex items-center gap-1.5 text-[13px] font-bold">
          School Health Score Trend
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {keys.map((key) => (
            <label key={key} className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={visible[key]}
                onCheckedChange={() => onToggle(key)}
                style={
                  visible[key]
                    ? { borderColor: PILLAR_TONE[key], background: PILLAR_TONE[key] }
                    : { borderColor: PILLAR_TONE[key] }
                }
              />
              <span className="text-[11.5px] font-bold" style={{ color: PILLAR_TONE[key] }}>
                {PILLAR_LABEL_SHORT[key]}
              </span>
            </label>
          ))}
          <FilterSelect
            icon={CalendarDays}
            value={periodFilter}
            onChange={(v) => {
              if (v !== "Weekly") {
                comingSoon("Alternate trend granularity");
                return;
              }
              setPeriodFilter(v);
            }}
            options={["Weekly", "Monthly"]}
          />
          <button
            type="button"
            onClick={() => comingSoon("Table view")}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors shrink-0"
            aria-label="View as table"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
            <XAxis dataKey="weekLabel" stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
            <RechartsTooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(240 15% 88%)",
                background: "hsl(0 0% 100% / 0.98)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.25)",
                fontSize: 12,
              }}
            />
            {keys.map(
              (key) =>
                visible[key] && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={PILLAR_LABEL_SHORT[key]}
                    stroke={PILLAR_TONE[key]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: PILLAR_TONE[key], strokeWidth: 0 }}
                    label={{ position: "top", fontSize: 10, fill: PILLAR_TONE[key], fontWeight: 700 }}
                  />
                ),
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const PILLAR_LABEL_SHORT: Record<SchoolPillarKey, string> = {
  studentWellbeing: "Student Well-being",
  classroomPerformance: "Classroom Performance Index",
  teacherEfficiency: "Teacher Efficiency",
};
