"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { getSchoolTeachers } from "@/lib/schoolData";
import {
  DEFAULT_FILTERS,
  SCHOOL_CONTEXT,
  getSchoolKpiList,
  type FilterKey,
} from "@/lib/schoolKpis";
import { SchoolOnboardingChecklist } from "@/components/school/SchoolOnboardingChecklist";
import { SchoolCoachmarkTour } from "@/components/school/SchoolCoachmarkTour";
import { SchoolContextHeader } from "@/components/school/SchoolContextHeader";
import { SchoolPillarRow } from "@/components/school/SchoolPillarRow";
import { SchoolGrowthAlertRow } from "@/components/school/SchoolGrowthAlertRow";
import { SchoolFocus } from "@/components/school/SchoolFocus";

export default function Page() {
  return (
    <SchoolAppShell>
      <SchoolDashboard />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function SchoolDashboard() {
  const reduce = useReducedMotion();
  const teachers = getSchoolTeachers();
  const kpis = useMemo(() => getSchoolKpiList(), []);

  const [filters, setFilters] =
    useState<Record<FilterKey, string>>(DEFAULT_FILTERS);

  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const dormantTeachers = teachers.filter((t) => t.status === "dormant").length;

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
        className="relative space-y-6"
      >
        {/* Tier 0 · Activation */}
        <SchoolOnboardingChecklist />

        {/* Header · context + filters */}
        <SchoolContextHeader
          context={SCHOOL_CONTEXT}
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((p) => ({ ...p, [key]: value }))
          }
        />

        {/* Tier 1 · Where do we stand — 3 compact pillar tiles */}
        <SchoolPillarRow kpis={kpis} />

        {/* Tier 2 · What changed this month — win + priority alert */}
        <SchoolGrowthAlertRow />

        {/* Tier 3 · Yellow recommends — prescribed next steps */}
        <SchoolFocus />

        {/* Footer entry points to detail pages */}
        <CohortFooter
          activeTeachers={activeTeachers}
          dormantTeachers={dormantTeachers}
        />
      </motion.div>

      <SchoolCoachmarkTour />
    </div>
  );
}

function CohortFooter({
  activeTeachers,
  dormantTeachers,
}: {
  activeTeachers: number;
  dormantTeachers: number;
}) {
  return (
    <FooterLink
      to="/school/teachers"
      label="Teacher cohort"
      detail={`${activeTeachers} active · ${dormantTeachers} dormant — manage cohort`}
      icon={<Users className="h-4 w-4" />}
    />
  );
}

function FooterLink({
  to,
  label,
  detail,
  icon,
}: {
  to: "/school/teachers";
  label: string;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      {icon && (
        <span className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[13px] leading-tight">
          {label}
        </div>
        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
          {detail}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
