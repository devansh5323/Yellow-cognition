"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cloud, Frown, HeartHandshake, HeartPulse, Users, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  classWellbeingDrivers,
  studentsByWellbeingDriver,
  wellbeingStatusFromScore,
  WELLBEING_STATUS_LABEL,
  WELLBEING_STATUS_TONE,
  type WellbeingDriverKey,
  type WellbeingDriverStat,
} from "@/lib/classWellbeing";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";
import { activeDemoSchool } from "@/data/bishopCotton";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const ICONS: Record<WellbeingDriverKey, LucideIcon> = {
  anxiety: Cloud,
  "peer-safety": HeartHandshake,
  frustration: Frown,
};

export function WellbeingDriverCards({ locked = false }: { locked?: boolean }) {
  const reduce = useReducedMotion();
  const drivers = useMemo(() => classWellbeingDrivers(locked ? [] : undefined), [locked]);
  const [drillKey, setDrillKey] = useState<WellbeingDriverKey | null>(null);

  const avgScore = locked ? null : activeDemoSchool.metrics.studentWellbeingScore.value;
  const avgStatus = avgScore != null ? wellbeingStatusFromScore(avgScore) : null;
  const avgTone = avgStatus ? WELLBEING_STATUS_TONE[avgStatus] : undefined;

  const drillDriver = drillKey ? drivers.find((d) => d.key === drillKey) : undefined;
  const drillStudents = drillKey && !locked ? studentsByWellbeingDriver(drillKey) : [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-7 flex flex-col gap-5">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, hsl(243 75% 65%) 7%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in srgb, hsl(243 75% 65%) 14%, transparent)", color: "hsl(243 75% 65%)" }}
          >
            <HeartPulse className="h-5 w-5" />
          </span>
          <h3 className="font-heading font-extrabold text-[16px] leading-tight">Student Wellbeing</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {avgScore != null && avgStatus && avgTone ? (
            <>
              <span className="font-heading font-extrabold text-[22px] tabular-nums leading-none" style={{ color: avgTone }}>
                {avgScore}
                <span className="text-muted-foreground text-[12px] font-bold">/100</span>
              </span>
              <span
                className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full"
                style={{ background: `color-mix(in srgb, ${avgTone} 14%, transparent)`, color: avgTone }}
              >
                {WELLBEING_STATUS_LABEL[avgStatus]}
              </span>
            </>
          ) : (
            <NotEnoughData />
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-3">
        {drivers.map((driver, i) => (
          <WellbeingCard
            key={driver.key}
            driver={driver}
            index={i}
            reduce={!!reduce}
            locked={locked}
            onViewStudents={() => setDrillKey(driver.key)}
          />
        ))}
      </div>

      <StudentDrillDialog
        open={!!drillKey}
        onOpenChange={(o) => !o && setDrillKey(null)}
        title={drillDriver ? `${drillDriver.label} — students needing support` : ""}
        description={
          drillStudents.length === 0
            ? "No students are currently flagged for this area."
            : `${drillStudents.length} student${drillStudents.length === 1 ? "" : "s"} below threshold for ${drillDriver?.label.toLowerCase() ?? "this area"}.`
        }
        students={drillStudents}
      />
    </div>
  );
}

function WellbeingCard({
  driver,
  index,
  reduce,
  locked,
  onViewStudents,
}: {
  driver: WellbeingDriverStat;
  index: number;
  reduce: boolean;
  locked: boolean;
  onViewStudents: () => void;
}) {
  const Icon = ICONS[driver.key];
  const statusTone = driver.status ? WELLBEING_STATUS_TONE[driver.status] : undefined;

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3, ease: EASE }}
      className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60 pl-4 pr-3.5 py-4"
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" aria-hidden style={{ background: driver.hue }} />

      <div className="flex items-start gap-3">
        <span
          className="h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${driver.hue} 14%, transparent)`, color: driver.hue }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-heading font-bold text-[13px] leading-tight truncate min-w-0">{driver.label}</div>
            {driver.status && statusTone && (
              <span
                className="shrink-0 inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                style={{ background: `color-mix(in srgb, ${statusTone} 12%, transparent)`, color: statusTone }}
              >
                {WELLBEING_STATUS_LABEL[driver.status]}
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{driver.description}</p>
        </div>
      </div>

      {driver.score != null && statusTone ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.span
              initial={reduce ? undefined : { scaleX: 0 }}
              animate={{ scaleX: driver.score / 100 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.04 * index }}
              className="block h-full w-full origin-left rounded-full"
              style={{ background: statusTone }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <NotEnoughData />
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
        <Users className="h-3 w-3" />
        {driver.dataCount} student{driver.dataCount === 1 ? "" : "s"} contributing
      </div>
      <p className="mt-1 text-[11px] text-foreground/80 leading-snug">{driver.mainSignal}</p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onViewStudents}
          disabled={locked}
          className="flex-1 inline-flex items-center justify-center text-[11px] font-bold px-2.5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: driver.hue, background: `color-mix(in srgb, ${driver.hue} 10%, transparent)` }}
        >
          View students
        </button>
        <button
          type="button"
          onClick={() => toast.info(`Strategy suggestions for ${driver.label} are coming soon.`)}
          disabled={locked}
          className="flex-1 inline-flex items-center justify-center text-[11px] font-bold px-2.5 py-2 rounded-lg border border-border/70 text-foreground/80 hover:bg-muted/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Try strategy
        </button>
      </div>
    </motion.div>
  );
}
