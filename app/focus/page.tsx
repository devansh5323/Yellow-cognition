"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { DataSourcesConfidence } from "@/components/dashboard/DataSourcesConfidence";
import { MonthlyFocusCheckIn } from "@/components/dashboard/MonthlyFocusCheckIn";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <AppShell>
      <FocusPage />
    </AppShell>
  );
}

function FocusPage() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        {/* Page header */}
        <header className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
          >
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-foreground">Attention & Focus</span>
          </nav>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Attention & focus
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            How well this roster is holding attention and staying on task.
          </p>
        </header>

        {/* Data sources & confidence */}
        <DataSourcesConfidence />

        {/* Monthly check-in — an independent teacher self-report, unaffected by
            the roster's attention & focus signal gap below. */}
        <MonthlyFocusCheckIn />

        {/* No real attention & focus signal exists for this roster yet — every
            per-student/per-domain insight this page used to show was derived
            from gameplay data that doesn't exist in the real dataset, so we
            show an honest empty state instead of a fabricated one. */}
        <NotEnoughDataPanel
          title="Not enough data yet"
          description="We don't have real attention & focus signal for this roster yet — this page will come back to life once it's available."
        />
      </motion.div>
    </div>
  );
}
