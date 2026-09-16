"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { SchoolKpiDetail } from "@/components/school/SchoolKpiDetail";
import { SchoolKpiRosterTable } from "@/components/school/SchoolKpiRosterTable";
import { getSchoolKpi, getSchoolKpiRoster, type KpiId } from "@/lib/schoolKpis";

const VALID_KPI_IDS: KpiId[] = ["rit", "tei", "lrs"];
const isValidKpiId = (id: string): id is KpiId =>
  (VALID_KPI_IDS as string[]).includes(id);

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
        {/* Page header — breadcrumb + title. */}
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
          <h1 className="mt-2 font-heading font-black text-[24px] md:text-[28px] leading-tight">
            {kpi.title}
          </h1>
        </header>

        {/* KPI sections — summary + recommends, sub-metrics. */}
        <SchoolKpiDetail kpi={kpi} />

        {/* Class roster — its own card */}
        <SchoolKpiRosterTable kpi={kpi} rows={roster} />
      </motion.div>
    </div>
  );
}
