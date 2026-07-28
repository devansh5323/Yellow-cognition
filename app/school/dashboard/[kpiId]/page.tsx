"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Filter } from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { SchoolKpiDetail } from "@/components/school/SchoolKpiDetail";
import { SchoolKpiRosterTable } from "@/components/school/SchoolKpiRosterTable";
import {
  getSchoolKpi,
  getSchoolKpiRoster,
  type BreakdownDim,
  type KpiId,
} from "@/lib/schoolKpis";
import { cn } from "@/lib/utils";

const VALID_KPI_IDS: KpiId[] = ["rit", "tei", "lrs"];
const isValidKpiId = (id: string): id is KpiId =>
  (VALID_KPI_IDS as string[]).includes(id);

const PAGE_DIM_OPTIONS: { id: BreakdownDim; label: string }[] = [
  { id: "class", label: "By Class" },
  { id: "subject", label: "By Subject" },
  { id: "teacher", label: "By Teacher" },
];

function KpiNotFound() {
  return (
    <SchoolAppShell>
      <div className="p-8 text-center">
        <h2 className="font-heading font-bold text-xl">KPI not found</h2>
        <Link
          href="/school/dashboard"
          className="text-primary text-sm mt-2 inline-block"
        >
          ← Back to school overview
        </Link>
      </div>
    </SchoolAppShell>
  );
}

export default function Page() {
  const params = useParams<{ kpiId: string }>();
  const kpiId = params?.kpiId;
  if (!kpiId || !isValidKpiId(kpiId)) return <KpiNotFound />;
  return (
    <SchoolAppShell>
      <SchoolKpiDetailPage kpiId={kpiId} />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function SchoolKpiDetailPage({ kpiId }: { kpiId: KpiId }) {
  const reduce = useReducedMotion();
  const kpi = getSchoolKpi(kpiId);
  const roster = useMemo(
    () => getSchoolKpiRoster(kpiId),
    [kpiId],
  );

  // Page-level breakdown dimension. Controls which slice of the school
  // the page is showing — applies to every section below.
  const [dim, setDim] = useState<BreakdownDim>("class");

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] premium-dotgrid opacity-70"
        aria-hidden
      />
      <motion.div
        initial={reduce ? undefined : "hidden"}
        animate="show"
        variants={fadeIn}
        className="relative space-y-5"
      >
        {/* Page header — breadcrumb + title + global dimension filter. */}
        <header className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
          >
            <Link
              href="/school/dashboard"
              className="hover:text-foreground transition-colors"
            >
              School overview
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">{kpi.title}</span>
          </nav>
          <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
            <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight">
              {kpi.title}
            </h1>
            <PageDimensionFilter dim={dim} onChange={setDim} />
          </div>
        </header>

        {/* KPI sections — summary + recommends, sub-metrics, focus callout. */}
        <SchoolKpiDetail kpi={kpi} roster={roster} dim={dim} />

        {/* Class roster — its own card */}
        <SchoolKpiRosterTable kpi={kpi} rows={roster} />
      </motion.div>
    </div>
  );
}

function PageDimensionFilter({
  dim,
  onChange,
}: {
  dim: BreakdownDim;
  onChange: (d: BreakdownDim) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Breakdown dimension"
      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 p-0.5 backdrop-blur"
    >
      <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
      {PAGE_DIM_OPTIONS.map((t) => {
        const active = dim === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors whitespace-nowrap",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
