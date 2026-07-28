"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Equal,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ROSTER_STATUS_COPY,
  ROSTER_STATUS_TONE,
  ROSTER_TREND_COPY,
  ROSTER_TREND_TONE,
  type RosterStatus,
  type RosterTrend,
  type SchoolKpi,
  type SchoolKpiRosterRow,
} from "@/lib/schoolKpis";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

type Props = {
  kpi: SchoolKpi;
  rows: SchoolKpiRosterRow[];
};

type Filter = "all" | "improving" | "stable" | "declining";

export function SchoolKpiRosterTable({ kpi, rows }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== (filter as RosterStatus))
        return false;
      if (
        q &&
        !(
          r.className.toLowerCase().includes(q) ||
          r.classMeta.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [rows, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : startIdx + 1;
  const rangeEnd = Math.min(startIdx + PAGE_SIZE, filtered.length);

  // Reset to page 1 whenever the visible set changes.
  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  const counts = useMemo(() => {
    const c: Record<RosterStatus, number> = {
      improving: 0,
      stable: 0,
      declining: 0,
    };
    rows.forEach((r) => {
      c[r.status]++;
    });
    return c;
  }, [rows]);

  const isRit = kpi.id === "rit";
  const deltaSuffix = isRit ? "%" : " pts";

  return (
    <section
      aria-label="Classes roster"
      className="premium-elevated rounded-[22px] overflow-hidden"
    >
      {/* Header */}
      <header className="px-5 md:px-6 py-4 border-b border-border/70">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="premium-eyebrow">
              <Users className="h-3 w-3" /> Classes roster
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
              All classes · {kpi.title}
            </h3>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              {rows.length} classes · sorted by movement, best at the top
            </p>
          </div>

          {/* Search + filter toolbar on the right */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="premium-search h-9 min-w-[220px] max-w-[280px] px-3">
              <Search className="h-4 w-4 shrink-0 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search class or grade…"
                aria-label="Search classes"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="ml-1 h-5 w-5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-border/60 bg-card/80 text-[12px] font-bold transition-colors hover:border-primary/40"
                >
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {(
                      [
                        { key: "all", label: "All" },
                        { key: "improving", label: "Improving" },
                        { key: "stable", label: "Stable" },
                        { key: "declining", label: "Declining" },
                      ] as { key: Filter; label: string }[]
                    ).find((f) => f.key === filter)?.label ?? "All"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-48 p-2 rounded-xl"
                sideOffset={4}
              >
                <div className="space-y-0.5">
                  {(
                    [
                      { key: "all", label: `All (${rows.length})` },
                      {
                        key: "improving",
                        label: `Improving (${counts.improving})`,
                      },
                      { key: "stable", label: `Stable (${counts.stable})` },
                      {
                        key: "declining",
                        label: `Declining (${counts.declining})`,
                      },
                    ] as { key: Filter; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
                        filter === f.key
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Table */}
      <div>
        <Table className="text-[12.5px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/25">
              <TableHead className="pl-5 md:pl-6 pr-4 w-[200px] h-11 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Class</TableHead>
              {kpi.subMetrics.map((sm) => (
                <TableHead
                  key={sm.id}
                  className="text-center whitespace-nowrap px-4 w-[120px] h-11 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
                  title={sm.label}
                >
                  {abbreviate(sm.label)}
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap pl-6 pr-4 w-[170px] h-11 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Trend</TableHead>
              <TableHead className="whitespace-nowrap px-4 w-[120px] h-11 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="pr-5 md:pr-6 w-[44px] h-11" aria-hidden />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, rowIdx) => (
              <TableRow
                key={row.classId}
                className={cn(
                  "group border-border/50 transition-colors",
                  rowIdx % 2 === 1 && "bg-muted/[0.025]",
                  "hover:bg-muted/25",
                )}
              >
                <TableCell className="pl-5 md:pl-6 pr-4 py-3 w-[200px]">
                  <div className="font-heading font-extrabold text-[13px] leading-tight">
                    {row.className}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground leading-tight">
                    {row.classMeta}
                  </div>
                </TableCell>

                {row.subMetricValues.map((v, i) => {
                  const sm = kpi.subMetrics[i];
                  return (
                    <TableCell
                      key={sm.id}
                      className="text-center tabular-nums font-heading font-extrabold text-[14px] px-4 w-[120px]"
                      style={{ color: kpi.tone }}
                    >
                      {v}
                    </TableCell>
                  );
                })}

                <TableCell className="pl-6 pr-4 w-[170px]">
                  <TrendCell trend={row.trend} delta={row.delta} suffix={deltaSuffix} />
                </TableCell>
                <TableCell className="px-4 w-[120px]">
                  <StatusPill status={row.status} />
                </TableCell>
                <TableCell className="pr-5 md:pr-6 text-right w-[44px]">
                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 inline-block text-muted-foreground/60 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                </TableCell>
              </TableRow>
            ))}
            {pageRows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4 + kpi.subMetrics.length}
                  className="py-10 text-center text-muted-foreground text-[12.5px]"
                >
                  {query
                    ? `No classes match “${query}”.`
                    : "No classes match the current filter."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer · pagination + legend */}
      <footer className="border-t border-border/60">
        <div className="px-5 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[11.5px] text-muted-foreground tabular-nums">
            {filtered.length === 0
              ? "No classes to show"
              : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} ${filtered.length === 1 ? "class" : "classes"}`}
          </span>

          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Previous page"
                    className={cn(
                      "inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors",
                      safePage === 1
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <PaginationItem key={n}>
                      <PaginationLink
                        href="#"
                        isActive={n === safePage}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(n);
                        }}
                        className="h-8 w-8 text-[12px] font-bold tabular-nums"
                      >
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage === totalPages}
                    aria-label="Next page"
                    className={cn(
                      "inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors",
                      safePage === totalPages
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        <div className="px-5 md:px-6 py-2.5 border-t border-border/50 flex items-center gap-x-4 gap-y-1.5 flex-wrap text-[10.5px] text-muted-foreground">
          <span className="font-bold uppercase tracking-[0.10em]">Legend</span>
          <LegendDot tone={ROSTER_STATUS_TONE.improving} label="Improving" />
          <LegendDot tone={ROSTER_STATUS_TONE.stable} label="Stable" />
          <LegendDot tone={ROSTER_STATUS_TONE.declining} label="Declining" />
        </div>
      </footer>
    </section>
  );
}

function TrendCell({
  trend,
  delta,
  suffix,
}: {
  trend: RosterTrend;
  delta?: number;
  suffix?: string;
}) {
  const tone = ROSTER_TREND_TONE[trend];
  const label = ROSTER_TREND_COPY[trend];
  const Icon =
    trend === "moving-up"
      ? TrendingUp
      : trend === "declining"
        ? TrendingDown
        : Equal;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
      style={{ color: tone }}
    >
      <Icon className="h-3.5 w-3.5" />
      {delta !== undefined && suffix !== undefined && (
        <span className="font-heading font-extrabold tabular-nums text-[13px]">
          {delta > 0 ? "+" : ""}
          {delta}
          {suffix}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

function StatusPill({ status }: { status: RosterStatus }) {
  const tone = ROSTER_STATUS_TONE[status];
  const label = ROSTER_STATUS_COPY[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 h-5 rounded-full whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
        color: tone,
        border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

function LegendDot({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      <span className="font-semibold text-foreground/80">{label}</span>
    </span>
  );
}

/**
 * Compact column header for the table: "Instructional Friction Index" → "IFI".
 * Falls back to the original label if no abbreviation fits.
 */
function abbreviate(label: string): string {
  switch (label) {
    case "Instructional Friction Index":
      return "Friction (IFI)";
    case "Transition Efficiency":
      return "Transition";
    case "Disruption Reduction Index":
      return "Disruption";
    case "Instructional Delivery Time":
      return "Delivery (mins)";
    case "Teacher Cognitive Load":
      return "Cog. Load";
    case "Classroom Stability":
      return "Stability";
    case "Learning Skill Score":
    case "Learning Readiness Score":
      return "Readiness";
    case "Focus":
      return "Focus (mins)";
    case "Task Engagement":
      return "Engagement %";
    default:
      return label;
  }
}
