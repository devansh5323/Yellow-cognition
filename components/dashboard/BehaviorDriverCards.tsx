"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  Ban,
  Clipboard,
  Compass,
  Hand,
  HeartPulse,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  strategyForDriver,
  studentsByDisruption,
  type DisruptionKey,
  type DisruptionStat,
} from "@/lib/classBehavior";
import { dataSourcesSnapshot } from "@/lib/classFocus";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { NotEnoughData } from "@/components/dashboard/NotEnoughData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DRIVER_ICON: Record<DisruptionKey, LucideIcon> = {
  "off-task": Compass,
  "non-compliance": Ban,
  peer: Users,
  impulse: Zap,
  emotional: HeartPulse,
  participation: Hand,
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

function tryStrategy(key: DisruptionKey) {
  const strategy = strategyForDriver(key);
  if (!strategy) {
    comingSoon("Strategy suggestions for this driver");
    return;
  }
  toast(strategy.title, { description: strategy.rationale });
}

export function BehaviorDriverCards({ stats }: { stats: DisruptionStat[] }) {
  const reduce = useReducedMotion();
  const [drillKey, setDrillKey] = useState<DisruptionKey | null>(null);

  // Real evidence-source counts (teacher observations/behaviour logs, class
  // check-ins) — still meaningful even though no per-driver score exists yet.
  const [sources, setSources] = useState(() => dataSourcesSnapshot(TEACHER_NAME));
  useEffect(() => {
    const refresh = () => setSources(dataSourcesSnapshot(TEACHER_NAME));
    refresh();
    window.addEventListener("ah-behavior-log-change", refresh);
    window.addEventListener("ah-checkin-change", refresh);
    return () => {
      window.removeEventListener("ah-behavior-log-change", refresh);
      window.removeEventListener("ah-checkin-change", refresh);
    };
  }, []);

  const evidenceSources = useMemo(() => {
    const out: string[] = [];
    if (sources.observationCount > 0) out.push("Teacher observations & behaviour logs");
    if (sources.checkInCount > 0) out.push("Class recording");
    return out;
  }, [sources]);

  const drillStudents = useMemo(() => (drillKey ? studentsByDisruption(drillKey) : []), [drillKey]);
  const drillMeta = drillKey ? stats.find((s) => s.key === drillKey) : null;

  return (
    <section
      aria-label="Where behaviour friction is coming from"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Disruption breakdown</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          What kind of behaviour is happening
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
          The main behaviour and regulation categories we track — no real per-student signal
          exists yet to score them.
        </p>
        {evidenceSources.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-2">
            {evidenceSources.map((src) => (
              <li
                key={src}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-foreground/75"
              >
                {src === "Class recording" && <Video className="h-2.5 w-2.5" />}
                {src.startsWith("Teacher") && <Clipboard className="h-2.5 w-2.5" />}
                {src}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <DriverCard
            key={stat.key}
            stat={stat}
            onViewStudents={() => setDrillKey(stat.key)}
            reduce={!!reduce}
            index={i}
          />
        ))}
      </div>

      <StudentDrillDialog
        open={!!drillKey}
        onOpenChange={(o) => !o && setDrillKey(null)}
        title={drillMeta ? `${drillMeta.label} — affected students` : ""}
        description={
          drillStudents.length === 0
            ? "No students are currently flagged for this driver."
            : `${drillStudents.length} student${drillStudents.length === 1 ? "" : "s"} contributing to ${drillMeta?.label.toLowerCase() ?? "this driver"}.`
        }
        students={drillStudents}
      />
    </section>
  );
}

function DriverCard({
  stat,
  onViewStudents,
  reduce,
  index,
}: {
  stat: DisruptionStat;
  onViewStudents: () => void;
  reduce: boolean;
  index: number;
}) {
  const Icon = DRIVER_ICON[stat.key];
  const tone = stat.hue;

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.32, ease: EASE }}
      className="h-full flex flex-col rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-foreground/15"
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            color: tone,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 22%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-foreground/90 leading-tight">{stat.label}</div>
          <NotEnoughData className="mt-1.5" />
        </div>
      </div>

      <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{stat.description}</p>

      <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onViewStudents}
          className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
        >
          View students
        </button>
        <button
          type="button"
          onClick={() => tryStrategy(stat.key)}
          className="inline-flex items-center gap-1 rounded-lg px-2 h-7 text-[10.5px] font-bold transition-colors"
          style={{ color: tone, background: `color-mix(in srgb, ${tone} 10%, transparent)` }}
        >
          Try strategy
        </button>
      </div>
    </motion.div>
  );
}
