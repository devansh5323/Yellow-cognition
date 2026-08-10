"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DistrictAppShell } from "@/components/district/DistrictAppShell";
import { DistrictDataReadinessHub } from "@/components/district/DistrictDataReadinessHub";
import { DistrictHealthScore } from "@/components/district/DistrictHealthScore";
import { DistrictHealthDriverCards } from "@/components/district/DistrictHealthDriverCards";
import { SchoolComparisonPanel } from "@/components/district/SchoolComparisonPanel";
import { DistrictTrendRow } from "@/components/district/DistrictTrendRow";
import { DistrictTierSupportOverview } from "@/components/district/DistrictTierSupportOverview";
import { DistrictPbisImplementationOverview } from "@/components/district/DistrictPbisImplementationOverview";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function DistrictDashboard() {
  const reduce = useReducedMotion();

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
        <DistrictDataReadinessHub />
        <DistrictHealthScore />
        <DistrictHealthDriverCards />
        <SchoolComparisonPanel />
        <DistrictTrendRow />
        <DistrictTierSupportOverview />
        <DistrictPbisImplementationOverview />
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <DistrictAppShell>
      <DistrictDashboard />
    </DistrictAppShell>
  );
}
