"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Gamepad2,
  HeartHandshake,
  ThumbsUp,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DATA_CONFIDENCE_LABEL,
  DATA_CONFIDENCE_TONE,
  dataSourcesSnapshot,
  type DataConfidenceLevel,
  type DataSourcesSnapshot,
} from "@/lib/classFocus";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 50%)";
const PURPLE = "hsl(262 60% 62%)";

type SourceTile = {
  key: string;
  label: string;
  Icon: LucideIcon;
  tone: string;
  status?: string;
  value: string;
  unit?: string;
  met: boolean;
  need: string;
};

export function DataSourcesConfidence() {
  const reduce = useReducedMotion();
  const [snapshot, setSnapshot] = useState<DataSourcesSnapshot | null>(null);

  useEffect(() => {
    const refresh = () => setSnapshot(dataSourcesSnapshot(TEACHER_NAME));
    refresh();
    window.addEventListener("ah-behavior-log-change", refresh);
    window.addEventListener("ah-positive-log-change", refresh);
    window.addEventListener("ah-followup-change", refresh);
    window.addEventListener("ah-checkin-change", refresh);
    return () => {
      window.removeEventListener("ah-behavior-log-change", refresh);
      window.removeEventListener("ah-positive-log-change", refresh);
      window.removeEventListener("ah-followup-change", refresh);
      window.removeEventListener("ah-checkin-change", refresh);
    };
  }, []);

  if (!snapshot) return null;

  const gamesCoverage =
    snapshot.gamesTotalStudents > 0 ? snapshot.gamesActiveStudents / snapshot.gamesTotalStudents : 0;
  const followUpsCoverage =
    snapshot.followUpsTotal > 0 ? snapshot.followUpsCompleted / snapshot.followUpsTotal : 1;

  const tiles: SourceTile[] = [
    {
      key: "games",
      label: "Attention Hero games",
      Icon: Gamepad2,
      tone: GREEN,
      status: snapshot.gamesActiveStudents > 0 ? "Active" : "Inactive",
      value: `${snapshot.gamesActiveStudents} / ${snapshot.gamesTotalStudents}`,
      unit: "students",
      met: gamesCoverage >= 0.5,
      need: "at least half the class playing",
    },
    {
      key: "observations",
      label: "Teacher observations",
      Icon: ClipboardList,
      tone: AMBER,
      value: `${snapshot.observationCount}`,
      unit: snapshot.observationCount === 1 ? "log" : "logs",
      met: snapshot.observationCount >= 5,
      need: "5+ behaviour notes logged",
    },
    {
      key: "checkins",
      label: "Class recording",
      Icon: Video,
      tone: BLUE,
      value: `${snapshot.checkInCount}`,
      unit: snapshot.checkInCount === 1 ? "session" : "sessions",
      status: snapshot.checkInCount > 0 ? "analyzed" : undefined,
      met: snapshot.checkInCount >= 1,
      need: "a class check-in this week",
    },
    {
      key: "positive",
      label: "Positive logs",
      Icon: ThumbsUp,
      tone: GREEN,
      value: `${snapshot.positiveLogCount}`,
      met: snapshot.positiveLogCount >= 3,
      need: "3+ positive behaviour logs",
    },
    {
      key: "followups",
      label: "Follow-ups",
      Icon: HeartHandshake,
      tone: PURPLE,
      value: `${snapshot.followUpsCompleted} / ${snapshot.followUpsTotal}`,
      status: snapshot.followUpsTotal > 0 ? "completed" : undefined,
      met: followUpsCoverage >= 0.5,
      need: "half of flagged follow-ups closed",
    },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-border bg-card p-5"
      aria-label="Data Sources and Confidence"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
          <h2 className="font-heading font-extrabold text-[15px] leading-tight">
            Data Sources &amp; Confidence
          </h2>
          <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
            Insights are based on both Attention Hero activity and teacher observations.
          </p>
        </div>

        <ConfidencePopover confidence={snapshot.confidence} tiles={tiles} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {tiles.map((tile) => (
          <SourceTileView key={tile.key} tile={tile} />
        ))}
      </div>
    </motion.section>
  );
}

function SourceTileView({ tile }: { tile: SourceTile }) {
  const Icon = tile.Icon;
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span
        className="h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`, color: tile.tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-bold leading-tight">{tile.label}</div>
        {tile.status && (
          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{tile.status}</div>
        )}
        <div className="mt-0.5">
          <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: tile.tone }}>
            {tile.value}
          </span>
          {tile.unit && <span className="text-[11px] text-muted-foreground ml-1">{tile.unit}</span>}
        </div>
      </div>
    </div>
  );
}

function ConfidencePopover({
  confidence,
  tiles,
}: {
  confidence: DataConfidenceLevel;
  tiles: SourceTile[];
}) {
  const tone = DATA_CONFIDENCE_TONE[confidence];
  const metCount = tiles.filter((t) => t.met).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-1.5 py-1 text-[11.5px] font-semibold text-muted-foreground hover:border-primary/40 transition-colors shrink-0"
        >
          Overall confidence
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] px-2 py-1 rounded-full"
            style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
          >
            {DATA_CONFIDENCE_LABEL[confidence]}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[300px] rounded-2xl border border-border/70 bg-popover/95 backdrop-blur p-4 shadow-xl shadow-black/5"
      >
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading font-extrabold text-[14px]">Confidence</h4>
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
            style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
          >
            {DATA_CONFIDENCE_LABEL[confidence]}
          </span>
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-snug">
          {metCount} of {tiles.length} data sources are meeting a healthy bar this period.
        </p>
        <ul className="mt-3 space-y-2">
          {tiles.map((t) => (
            <li key={t.key} className="flex items-start gap-2">
              <span
                className={
                  t.met
                    ? "h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0 mt-0.5"
                    : "h-4 w-4 rounded-full bg-muted text-muted-foreground inline-flex items-center justify-center shrink-0 mt-0.5"
                }
              >
                {t.met && <Check className="h-2.5 w-2.5" />}
              </span>
              <div className="min-w-0">
                <span className="text-[11.5px] font-semibold">{t.label}</span>
                {!t.met && (
                  <div className="text-[11px] text-muted-foreground leading-snug">Needs {t.need}.</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
