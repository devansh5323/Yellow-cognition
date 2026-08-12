"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { behaviorWeeklyTrend, type BehaviorSnapshotData } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const SERIES = [
  { key: "score" as const, label: "Behaviour score", tone: "hsl(142 55% 42%)" },
  { key: "minor" as const, label: "Minor behaviours", tone: "hsl(38 92% 48%)" },
  { key: "major" as const, label: "Major behaviours", tone: "hsl(0 78% 56%)" },
  { key: "positive" as const, label: "Positive behaviours", tone: "hsl(212 90% 58%)" },
];

export function BehaviorTrendTracking({
  snapshot,
  positiveLogs,
}: {
  snapshot: BehaviorSnapshotData;
  positiveLogs: number;
}) {
  const reduce = useReducedMotion();

  const trend = useMemo(
    () =>
      behaviorWeeklyTrend({
        score: snapshot.controlScore,
        scoreDelta: snapshot.delta,
        minor: snapshot.minorBehaviours,
        minorDelta: snapshot.prevMinorBehaviours - snapshot.minorBehaviours,
        major: snapshot.majorBehaviours,
        majorDelta: snapshot.prevMajorBehaviours - snapshot.majorBehaviours,
        positive: positiveLogs,
        positiveDelta: 1,
      }),
    [snapshot, positiveLogs],
  );

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Weekly behaviour trend"
      className="rounded-2xl border border-border bg-card p-4 md:p-5"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="premium-eyebrow">
            <span>Weekly trend</span>
          </div>
          <h3 className="font-heading font-extrabold text-[15px] leading-tight mt-1">
            Is behaviour getting better, worse, or staying stable?
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[10.5px] font-bold">
              <span className="h-2 w-2 rounded-full" style={{ background: s.tone }} aria-hidden />
              <span style={{ color: s.tone }}>{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
            <XAxis dataKey="label" stroke="hsl(230 15% 55%)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(230 15% 55%)" fontSize={10} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid hsl(240 15% 88%)",
                background: "hsl(0 0% 100% / 0.98)",
                backdropFilter: "blur(12px)",
                fontSize: 11,
              }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.tone}
                strokeWidth={2}
                dot={{ r: 3, fill: s.tone, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
