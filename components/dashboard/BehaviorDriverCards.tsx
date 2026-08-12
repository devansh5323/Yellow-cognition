"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Clipboard,
  Compass,
  Gamepad2,
  HeartPulse,
  Info,
  Shuffle,
  Users,
  Video,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  DISRUPTION_SIGNS,
  DRIVER_STATUS_LABEL,
  driverImpactingSkills,
  strategyForDriver,
  studentsByDisruption,
  type DisruptionKey,
  type DisruptionStat,
} from "@/lib/classBehavior";
import { dataSourcesSnapshot } from "@/lib/classFocus";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DRIVER_ICON: Record<DisruptionKey, LucideIcon> = {
  "off-task": Compass,
  impulse: Zap,
  transition: Shuffle,
  peer: Users,
  anxiety: Wind,
  emotional: HeartPulse,
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
  const [openKey, setOpenKey] = useState<DisruptionKey | null>(null);
  const [drillKey, setDrillKey] = useState<DisruptionKey | null>(null);

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
    if (sources.gamesActiveStudents > 0) out.push("Attention Hero signals");
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
          <span>Behaviour drivers</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          Where behaviour friction is coming from
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
          The main behaviour and regulation signals shaping this score.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <DriverCard
            key={stat.key}
            stat={stat}
            open={openKey === stat.key}
            onToggle={() => setOpenKey((k) => (k === stat.key ? null : stat.key))}
            onViewStudents={() => setDrillKey(stat.key)}
            evidenceSources={evidenceSources}
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
  open,
  onToggle,
  onViewStudents,
  evidenceSources,
  reduce,
  index,
}: {
  stat: DisruptionStat;
  open: boolean;
  onToggle: () => void;
  onViewStudents: () => void;
  evidenceSources: string[];
  reduce: boolean;
  index: number;
}) {
  const Icon = DRIVER_ICON[stat.key];
  const tone = stat.hue;
  const skills = useMemo(() => driverImpactingSkills(stat.key), [stat.key]);
  const signs = DISRUPTION_SIGNS[stat.key];
  const panelId = `driver-panel-${stat.key}`;

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
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="font-heading font-extrabold text-[19px] tabular-nums leading-none" style={{ color: tone }}>
              {stat.score}
              <span className="text-[11px] font-bold text-muted-foreground/70">/100</span>
            </span>
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
            >
              {DRIVER_STATUS_LABEL[stat.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-[10.5px]">
        <span className="font-semibold text-muted-foreground">
          {stat.studentCount} student{stat.studentCount === 1 ? "" : "s"}
        </span>
        {stat.weeklyChange !== 0 && (
          <span
            className="inline-flex items-center gap-0.5 font-bold tabular-nums"
            style={{ color: stat.weeklyChange > 0 ? "hsl(142 55% 42%)" : "hsl(0 70% 50%)" }}
          >
            {stat.weeklyChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(stat.weeklyChange)} vs last week
          </span>
        )}
      </div>

      <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{stat.description}</p>

      <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
        >
          View impacting skills
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
        </button>
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

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/70 space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                  What&apos;s showing up
                </div>
                <ul className="space-y-1">
                  {signs.map((sign) => (
                    <li key={sign} className="text-[11.5px] text-foreground/80 leading-snug flex gap-1.5">
                      <span className="text-muted-foreground">•</span>
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                  Top impacting skills
                </div>
                <ul className="space-y-1.5">
                  {skills.map((skill) => (
                    <li key={skill.name}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] font-semibold text-foreground/85 truncate">{skill.name}</span>
                        <span className="font-heading font-extrabold tabular-nums text-[11.5px] leading-none shrink-0" style={{ color: tone }}>
                          {skill.score}
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                        <span className="block h-full rounded-full" style={{ width: `${skill.score}%`, background: tone }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                  Evidence sources
                </div>
                {evidenceSources.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No data sources logged yet this period.</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {evidenceSources.map((src) => (
                      <li
                        key={src}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-foreground/75"
                      >
                        {src === "Class recording" && <Video className="h-2.5 w-2.5" />}
                        {src === "Attention Hero signals" && <Gamepad2 className="h-2.5 w-2.5" />}
                        {src.startsWith("Teacher") && <Clipboard className="h-2.5 w-2.5" />}
                        {src}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-1.5">
                  Actions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={onViewStudents}
                    className="inline-flex items-center rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    View students
                  </button>
                  <button
                    type="button"
                    onClick={() => tryStrategy(stat.key)}
                    className="inline-flex items-center rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    Generate strategy
                  </button>
                  <button
                    type="button"
                    onClick={() => comingSoon("Creating a small group")}
                    className="inline-flex items-center rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    Create small group
                  </button>
                  <button
                    type="button"
                    onClick={() => comingSoon("Assigning an Attention Hero workout")}
                    className="inline-flex items-center rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    Assign Attention Hero workout
                  </button>
                  <button
                    type="button"
                    onClick={() => comingSoon("Logging a follow-up")}
                    className="inline-flex items-center rounded-lg border border-border/60 px-2 h-7 text-[10.5px] font-bold text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    Log follow-up
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-snug inline-flex items-start gap-1">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                Train these skills directly and this driver loses its grip over time.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
