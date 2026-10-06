"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, Gamepad2, Video, type LucideIcon } from "lucide-react";
import {
  DATA_CONFIDENCE_LABEL,
  DATA_CONFIDENCE_TONE,
  dataSourcesSnapshot,
  type DataSourcesSnapshot,
} from "@/lib/classFocus";
import { TEACHER_NAME } from "@/components/dashboard/DataReadinessCard";
import { STUDENTS } from "@/data/mockData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

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

  const total = STUDENTS.length;

  const tiles: SourceTile[] = [
    {
      key: "attention-hero",
      label: "Attention Hero games",
      Icon: Gamepad2,
      tone: PURPLE,
      status: "Active",
      value: `${total}/${total}`,
      unit: "students",
    },
    {
      key: "checkins",
      label: "Class recordings",
      Icon: Video,
      tone: BLUE,
      value: `${snapshot.checkInCount}`,
      unit: snapshot.checkInCount === 1 ? "session" : "sessions",
      status: snapshot.checkInCount > 0 ? "analyzed" : undefined,
    },
    {
      key: "parent-observation",
      label: "Parent observation",
      Icon: ClipboardList,
      tone: AMBER,
      value: `${total}/${total}`,
      unit: "students",
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
            Data Sources
          </h2>
          <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
            Insights are based on Attention Hero gameplay, class recordings, and parent observation.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-1.5 py-1 text-[11.5px] font-semibold text-muted-foreground shrink-0">
          Overall confidence
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] px-2 py-1 rounded-full"
            style={{
              background: `color-mix(in srgb, ${DATA_CONFIDENCE_TONE[snapshot.confidence]} 16%, transparent)`,
              color: DATA_CONFIDENCE_TONE[snapshot.confidence],
            }}
          >
            {DATA_CONFIDENCE_LABEL[snapshot.confidence]}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

