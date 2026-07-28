"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  ChevronDown,
  School as SchoolIcon,
  SlidersHorizontal,
  Users,
  GraduationCap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import {
  DEFAULT_FILTERS,
  FILTERS,
  getSchoolHealth,
  type FilterKey,
  type SchoolContext,
} from "@/lib/schoolKpis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  context: SchoolContext;
  filters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
};

export function SchoolContextHeader({ context, filters, onFilterChange }: Props) {
  return (
    <section
      data-tour-target="school-context-header"
      className="premium-elevated rounded-[22px] p-5 md:p-6 flex items-start gap-5 flex-wrap"
    >
      <div className="flex-1 min-w-[280px]">
        <div className="premium-eyebrow">
          <SchoolIcon className="h-3 w-3" /> School performance overview
        </div>
        <h1 className="mt-1.5 font-heading font-extrabold text-[22px] md:text-[26px] leading-tight tracking-tight">
          Riverside Academy ·{" "}
          <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
            {context.term} snapshot
          </span>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          <ContextItem label={context.scope} />
          <Dot />
          <ContextItem label={context.term} />
          <Dot />
          <ContextItem
            icon={<GraduationCap className="h-3 w-3" />}
            label={`${context.students.toLocaleString()} students`}
          />
          <Dot />
          <ContextItem
            icon={<Users className="h-3 w-3" />}
            label={`${context.teachers} teachers`}
          />
          <Dot />
          <ContextItem
            icon={<SchoolIcon className="h-3 w-3" />}
            label={`${context.classrooms} classrooms`}
          />
          <Dot />
          <ContextItem
            icon={<Activity className="h-3 w-3" />}
            label={`${context.activeCoveragePct}% active coverage`}
          />
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <LastUpdatedPill
          lastUpdated={context.lastUpdated}
          cadence={context.refreshCadence}
        />
        <SchoolHealthPill />
        <FilterBar filters={filters} onFilterChange={onFilterChange} />
      </div>
    </section>
  );
}

function LastUpdatedPill({
  lastUpdated,
  cadence,
}: {
  lastUpdated: string;
  cadence: string;
}) {
  const date = new Date(lastUpdated);
  const relative = formatRelative(date);
  const absolute = date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`KPIs last updated ${relative}. ${cadence}.`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border/60 bg-card/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              Updated
            </span>
            <span className="text-[12.5px] font-semibold text-foreground tabular-nums">
              {relative}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[240px] p-3 text-left bg-popover text-popover-foreground border border-border/60 shadow-lg"
        >
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-1">
            KPI refresh
          </div>
          <div className="font-heading font-extrabold text-[13px] leading-tight">
            {absolute}
          </div>
          <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground font-normal">
            {cadence}.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function SchoolHealthPill() {
  const health = getSchoolHealth();
  const positiveOverall = health.positiveCount >= health.total / 2;
  const Trend = positiveOverall ? ArrowUpRight : ArrowDownRight;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`How the school is doing — ${health.headline}. ${health.meaning}`}
            className="group relative inline-flex items-center gap-2.5 h-9 pl-2.5 pr-3 rounded-full border backdrop-blur transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            style={{
              borderColor: `color-mix(in srgb, ${health.tone} 32%, transparent)`,
              background: `linear-gradient(135deg, color-mix(in srgb, ${health.tone} 12%, var(--card)) 0%, var(--card) 100%)`,
              boxShadow: `0 6px 18px -14px color-mix(in srgb, ${health.tone} 60%, transparent)`,
            }}
          >
            <span aria-hidden className="flex items-end gap-[3px] h-[14px] shrink-0">
              {health.kpiSignals.map((s, i) => {
                const positive = s.delta >= 0;
                const heights = positive ? [6, 9, 12] : [12, 9, 6];
                return (
                  <span
                    key={s.id}
                    className="w-[3px] rounded-sm"
                    style={{
                      height: `${heights[i] ?? 8}px`,
                      background: s.tone,
                      opacity: 0.92,
                    }}
                  />
                );
              })}
            </span>

            <span className="flex items-center gap-1.5 leading-none min-w-0">
              <span
                className="text-[12.5px] font-extrabold font-heading truncate max-w-[180px] sm:max-w-none"
                style={{ color: health.tone }}
              >
                {health.headline}
              </span>
              <span
                aria-hidden
                className="inline-flex items-center text-[11px] font-bold tabular-nums"
                style={{ color: health.tone }}
              >
                <Trend className="h-3 w-3" strokeWidth={2.4} />
                {health.positiveCount}/{health.total}
              </span>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[280px] p-3 text-left bg-popover text-popover-foreground border border-border/60 shadow-lg"
        >
          <div
            className="text-[10.5px] font-bold tracking-[0.14em] uppercase mb-1"
            style={{ color: health.tone }}
          >
            How the school is doing
          </div>
          <div className="font-heading font-extrabold text-[13px] leading-tight mb-1.5">
            {health.headline}
          </div>
          <p className="text-[11.5px] leading-snug text-muted-foreground mb-2.5 font-normal">
            {health.meaning}
          </p>
          <ul className="space-y-1">
            {health.kpiSignals.map((s) => {
              const positive = s.delta >= 0;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="flex items-center gap-2 text-foreground/80 font-semibold">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: s.tone }}
                    />
                    {s.title}
                  </span>
                  <span
                    className="inline-flex items-center font-bold tabular-nums"
                    style={{ color: s.tone }}
                  >
                    {positive ? (
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" strokeWidth={2.4} />
                    )}
                    {positive ? "+" : ""}
                    {s.delta}
                  </span>
                </li>
              );
            })}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Dot() {
  return <span className="mx-1.5 text-muted-foreground/50">·</span>;
}

function ContextItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {icon}
      <span className="font-semibold text-foreground/85">{label}</span>
    </span>
  );
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = FILTERS.reduce(
    (n, f) => (filters[f.key] !== DEFAULT_FILTERS[f.key] ? n + 1 : n),
    0,
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Open filters"
          className={cn(
            "inline-flex items-center gap-2 h-9 px-3.5 text-[12.5px] font-semibold rounded-full border border-border/60 bg-card/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30",
            open && "border-primary/40 bg-card",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10.5px] font-bold tabular-nums">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[300px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-3 shadow-xl shadow-black/5"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
              Filters
            </div>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  FILTERS.forEach((f) => onFilterChange(f.key, DEFAULT_FILTERS[f.key]));
                }}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset all
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {FILTERS.map((f) => (
              <FilterRow
                key={f.key}
                label={f.label}
                options={f.options}
                value={filters[f.key]}
                onChange={(v) => onFilterChange(f.key, v)}
              />
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[11.5px] font-semibold text-muted-foreground">{label}</span>
      <div className="relative w-[150px] shrink-0">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full h-8 pl-3 pr-7 text-[12.5px] font-semibold rounded-lg border border-border/60 bg-card/80 text-foreground hover:border-primary/30 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
      </div>
    </label>
  );
}
