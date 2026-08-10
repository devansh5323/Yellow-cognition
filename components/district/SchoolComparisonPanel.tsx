"use client";

import { Fragment, useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Search,
  Table2,
  X,
} from "lucide-react";
import {
  districtSchools,
  schoolComparisonInsights,
  SCHOOL_STATUS_META,
  PBIS_TONE,
  TIER_PRESSURE_TONE,
  type DistrictSchool,
  type SchoolStatus,
  type PbisImplementation,
  type TierPressure,
} from "@/lib/districtData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const GREEN = "hsl(142 55% 45%)";
const RED = "hsl(0 78% 58%)";
const LINK_BLUE = "hsl(212 90% 62%)";

const STATUS_ORDER: SchoolStatus[] = ["strong", "stable", "monitor", "support-recommended", "immediate-review"];
const GRADE_BAND_OPTIONS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle" },
  { value: "high", label: "High" },
];

type SortKey = "name" | "gradeBand" | "health" | "pbis" | "tier" | "status";
type SortDir = "asc" | "desc";

const STATUS_RANK: Record<SchoolStatus, number> = {
  strong: 0,
  stable: 1,
  monitor: 2,
  "support-recommended": 3,
  "immediate-review": 4,
};
const PBIS_RANK: Record<PbisImplementation, number> = { Strong: 0, Moderate: 1, "Needs Support": 2 };
const TIER_RANK: Record<TierPressure, number> = { Low: 0, Moderate: 1, High: 2, Critical: 3 };

export function SchoolComparisonPanel() {
  const reduce = useReducedMotion();
  const schools = useMemo(() => districtSchools(), []);
  const insights = useMemo(() => schoolComparisonInsights(), []);

  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<string>("all");
  const [gradeBand, setGradeBand] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("health");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [view, setView] = useState<"table" | "quadrant">("table");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const ROW_LIMIT = 5;

  const clusters = useMemo(() => Array.from(new Set(schools.map((s) => s.cluster))).sort(), [schools]);

  const counts = useMemo(() => {
    const byStatus = STATUS_ORDER.reduce(
      (acc, s) => ({ ...acc, [s]: schools.filter((sc) => sc.status === s).length }),
      {} as Record<SchoolStatus, number>,
    );
    return { total: schools.length, byStatus };
  }, [schools]);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (cluster !== "all" && s.cluster !== cluster) return false;
      if (gradeBand !== "all" && s.gradeBand !== gradeBand) return false;
      if (status !== "all" && s.status !== status) return false;
      return true;
    });
  }, [schools, search, cluster, gradeBand, status]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "gradeBand":
          return a.gradeConfig.localeCompare(b.gradeConfig) * dir;
        case "health":
          return (a.healthScore - b.healthScore) * dir;
        case "pbis":
          return (PBIS_RANK[a.pbisImplementation] - PBIS_RANK[b.pbisImplementation]) * dir;
        case "tier":
          return (TIER_RANK[a.tierPressure] - TIER_RANK[b.tierPressure]) * dir;
        case "status":
          return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const hasActiveFilters = search.trim() || cluster !== "all" || gradeBand !== "all" || status !== "all";
  const clearFilters = () => {
    setSearch("");
    setCluster("all");
    setGradeBand("all");
    setStatus("all");
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="School Comparison and School Health Overview"
    >
      <div className="premium-eyebrow">
        <span>School Comparison &amp; School Health Overview</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5">
        {/* 4.1 — Comparison summary bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SummaryChip label="Schools Total" value={counts.total} tone="hsl(212 90% 62%)" />
          {STATUS_ORDER.map((s) => (
            <SummaryChip
              key={s}
              label={SCHOOL_STATUS_META[s].label}
              value={counts.byStatus[s]}
              tone={SCHOOL_STATUS_META[s].tone}
            />
          ))}
        </div>

        {/* 4.6 — Insights panel */}
        {insights.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-6 w-6 rounded-md inline-flex items-center justify-center bg-muted/70 text-muted-foreground shrink-0">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <span className="font-heading font-extrabold text-[13px]">Comparison Insights</span>
            </div>
            <ul className="space-y-1.5">
              {insights.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-snug">
                  <span className="mt-[7px] h-1 w-1 rounded-full bg-muted-foreground/70 shrink-0" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by school name"
              className="w-full h-9 rounded-lg border border-border/70 bg-background/60 pl-8 pr-3 text-[12.5px] placeholder:text-muted-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          <FilterSelect
            placeholder="Cluster"
            value={cluster}
            onChange={setCluster}
            options={clusters.map((c) => ({ value: c, label: c }))}
          />
          <FilterSelect
            placeholder="Grade band"
            value={gradeBand}
            onChange={setGradeBand}
            options={GRADE_BAND_OPTIONS}
          />
          <FilterSelect
            placeholder="District status"
            value={status}
            onChange={setStatus}
            options={STATUS_ORDER.map((s) => ({ value: s, label: SCHOOL_STATUS_META[s].label }))}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          <div className="ml-auto inline-flex rounded-lg border border-border/60 p-0.5 shrink-0">
            <ViewToggleButton active={view === "table"} onClick={() => setView("table")} icon={Table2} label="Table" />
            <ViewToggleButton
              active={view === "quadrant"}
              onClick={() => setView("quadrant")}
              icon={LayoutGrid}
              label="Quadrant"
            />
          </div>
        </div>

        {view === "table" ? (
          <>
            <SchoolTable
              schools={showAllRows ? sorted : sorted.slice(0, ROW_LIMIT)}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
              expandedId={expandedId}
              onToggleExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            />
            {sorted.length > ROW_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllRows((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold hover:underline"
                style={{ color: LINK_BLUE }}
              >
                {showAllRows ? "Show fewer schools" : `Show all ${sorted.length} schools`}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAllRows && "rotate-180")} />
              </button>
            )}
          </>
        ) : (
          <QuadrantView schools={sorted} />
        )}
      </div>
    </motion.section>
  );
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3.5 py-2.5 flex items-center gap-2.5">
      <span className="font-heading font-extrabold text-[18px] tabular-nums leading-none" style={{ color: tone }}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground leading-snug max-w-[92px]">{label}</span>
    </div>
  );
}

function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 rounded-lg border-border/70 bg-background/60 text-[12.5px] w-[150px] shrink-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Table2;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11.5px] font-bold transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Th({
  label,
  sortKeyName,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  sortKeyName: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === sortKeyName;
  return (
    <th className={cn("p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKeyName)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

function SchoolTable({
  schools,
  sortKey,
  sortDir,
  onSort,
  expandedId,
  onToggleExpand,
}: {
  schools: DistrictSchool[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-[12.5px] min-w-[1080px]">
        <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
          <tr>
            <Th label="School" sortKeyName="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Grade band" sortKeyName="gradeBand" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Health" sortKeyName="health" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Strongest Driver</th>
            <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Area Needing Attention</th>
            <Th label="PBIS" sortKeyName="pbis" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Tier Pressure" sortKeyName="tier" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="District Status" sortKeyName="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Action Status</th>
            <th className="p-3 w-[40px]">
              <span className="sr-only">Expand</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {schools.map((s) => {
            const statusMeta = SCHOOL_STATUS_META[s.status];
            const deltaPositive = s.healthDelta >= 0;
            const expanded = expandedId === s.id;
            return (
              <Fragment key={s.id}>
                <tr
                  className="border-t border-border/50 hover:bg-primary/[0.035] transition-colors cursor-pointer"
                  onClick={() => onToggleExpand(s.id)}
                >
                  <td className="p-3 align-middle">
                    <div className="font-heading font-bold text-[13px] leading-tight">{s.name}</div>
                    <div className="text-[10.5px] text-muted-foreground mt-0.5">{s.cluster} cluster</div>
                  </td>
                  <td className="p-3 align-middle text-[12px] text-muted-foreground whitespace-nowrap">
                    {s.gradeConfig}
                  </td>
                  <td className="p-3 align-middle whitespace-nowrap">
                    <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: statusMeta.tone }}>
                      {s.healthScore}
                    </span>
                    <span
                      className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums"
                      style={{ color: deltaPositive ? GREEN : RED }}
                    >
                      {deltaPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {deltaPositive ? "+" : ""}
                      {s.healthDelta}
                    </span>
                  </td>
                  <td className="p-3 align-middle text-[12px]">{s.strongestDriverLabel}</td>
                  <td className="p-3 align-middle text-[12px] text-muted-foreground">
                    {s.areaNeedingAttentionLabel}
                  </td>
                  <td className="p-3 align-middle">
                    <Pill tone={PBIS_TONE[s.pbisImplementation]}>{s.pbisImplementation}</Pill>
                  </td>
                  <td className="p-3 align-middle">
                    <Pill tone={TIER_PRESSURE_TONE[s.tierPressure]}>{s.tierPressure}</Pill>
                  </td>
                  <td className="p-3 align-middle">
                    <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
                  </td>
                  <td className="p-3 align-middle text-[11.5px] text-muted-foreground whitespace-nowrap">
                    {s.actionStatus}
                  </td>
                  <td className="p-3 align-middle text-right">
                    <ChevronRight
                      className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-90")}
                    />
                  </td>
                </tr>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={10} className="p-0 border-t border-border/40">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-background/40 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                                Why this status
                              </div>
                              <p className="text-[12px] text-muted-foreground leading-snug">{s.reasoning}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                              <DetailField label="District owner" value={s.districtOwner} />
                              <DetailField label="Current action" value={s.actionStatus} />
                              <DetailField label="Last review" value={s.lastReviewDate} />
                              <DetailField label="Next review" value={s.nextReviewDate} />
                            </div>
                            <div className="lg:col-span-2 flex justify-end">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
                                style={{ color: LINK_BLUE }}
                              >
                                View School Detail
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}

          {schools.length === 0 && (
            <tr>
              <td colSpan={10} className="p-10 text-center text-[12.5px] text-muted-foreground">
                No schools match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="text-foreground/90 font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-1 rounded-full whitespace-nowrap"
      style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
    >
      {children}
    </span>
  );
}

function QuadrantView({ schools }: { schools: DistrictSchool[] }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const w = 100;
  const h = 60;
  const pad = 6;

  if (schools.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-background/40 p-10 text-center text-[12.5px] text-muted-foreground">
        No schools match the current filters.
      </div>
    );
  }

  const pbisScore = (s: DistrictSchool) => (s.classroomReportingCoveragePct + s.interventionFollowUpCoveragePct) / 2;
  const healthValues = schools.map((s) => s.healthScore);
  const pbisValues = schools.map(pbisScore);
  const medianHealth = median(healthValues);
  const medianPbis = median(pbisValues);

  // Autoscale each axis to the data's own range (with a little breathing room)
  // rather than a fixed 0-100 — otherwise a tight real-world spread (e.g. PBIS
  // scores only ever landing between 45-99) reads as empty chart space.
  const scale = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const margin = range * 0.15;
    return { min: min - margin, max: max + margin };
  };
  const healthRange = scale(healthValues);
  const pbisRange = scale(pbisValues);
  const normalize = (value: number, range: { min: number; max: number }) =>
    (value - range.min) / Math.max(1, range.max - range.min);

  const points = schools.map((s) => ({
    school: s,
    x: pad + normalize(s.healthScore, healthRange) * (w - pad * 2),
    y: h - pad - normalize(pbisScore(s), pbisRange) * (h - pad * 2),
  }));

  const hovered = points.find((p) => p.school.id === hoverId) ?? null;

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-muted-foreground">
          School Health <span className="text-foreground/70">(x-axis)</span> vs PBIS Implementation{" "}
          <span className="text-foreground/70">(y-axis)</span>
        </div>
        {hovered && (
          <div className="text-[11.5px] font-bold text-right">
            {hovered.school.name}
            <span className="text-muted-foreground font-normal">
              {" "}
              · Health {hovered.school.healthScore} · PBIS {Math.round(pbisScore(hovered.school))}
            </span>
          </div>
        )}
      </div>
      <div className="relative w-full" style={{ paddingBottom: "60%" }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line
            x1={pad + normalize(medianHealth, healthRange) * (w - pad * 2)}
            y1={pad}
            x2={pad + normalize(medianHealth, healthRange) * (w - pad * 2)}
            y2={h - pad}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="1.5 1.5"
            strokeWidth={0.3}
          />
          <line
            x1={pad}
            y1={h - pad - normalize(medianPbis, pbisRange) * (h - pad * 2)}
            x2={w - pad}
            y2={h - pad - normalize(medianPbis, pbisRange) * (h - pad * 2)}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="1.5 1.5"
            strokeWidth={0.3}
          />
          {points.map((p) => {
            const tone = SCHOOL_STATUS_META[p.school.status].tone;
            return (
              <circle
                key={p.school.id}
                cx={p.x}
                cy={p.y}
                r={p.school.id === hoverId ? 2.2 : 1.6}
                fill={tone}
                fillOpacity={0.85}
                stroke="var(--card)"
                strokeWidth={0.4}
                className="cursor-pointer"
                onMouseEnter={() => setHoverId(p.school.id)}
                onMouseLeave={() => setHoverId(null)}
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: SCHOOL_STATUS_META[s].tone }} />
            {SCHOOL_STATUS_META[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
