"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Info, Minus } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getStudentRubricTrend } from "@/lib/checkIn";
import { STUDENTS, BEHAVIOUR_RUBRIC, type ClassCheckIn } from "@/data/mockData";

const REVERSE_TOOLTIP =
  "Reverse-scored: higher ratings mean more disruption. We invert the score before ranking, so a 5 on 'Interrupts class' counts as worst — not best.";

export function ReverseScoreInfo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center text-amber-600 hover:text-amber-700 transition-colors"
          aria-label="Reverse-scored explanation"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-[11.5px] leading-snug">
        {REVERSE_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}

/** The per-recording "report" — per-student rubric table plus a trend strip.
 * Shared between the friction cohort drilldown and the check-in history's
 * "View report" action, so the two never drift out of sync. Callers using
 * this inside a Radix Dialog/Tooltip need to be within a TooltipProvider. */
export function ClassCheckInReport({ checkIn }: { checkIn: ClassCheckIn }) {
  const studentLookup = useMemo(() => {
    const m = new Map(STUDENTS.map((s) => [s.id, s]));
    return m;
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-[10.5px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Student</th>
              {BEHAVIOUR_RUBRIC.map((r) => (
                <th key={r.id} className="px-2 py-2 text-center font-semibold">
                  <span className="inline-flex items-center gap-0.5">
                    {r.label.split(" ")[0]}
                    {r.reverse && <ReverseScoreInfo />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkIn.students.map((s) => {
              const stu = studentLookup.get(s.studentId);
              return (
                <tr key={s.studentId} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{stu?.name ?? s.studentId}</td>
                  {BEHAVIOUR_RUBRIC.map((r) => {
                    const v = s.ratings[r.id];
                    if (s.absent)
                      return (
                        <td
                          key={r.id}
                          className="px-2 py-2 text-center text-muted-foreground text-[10.5px]"
                        >
                          abs
                        </td>
                      );
                    if (typeof v !== "number")
                      return (
                        <td
                          key={r.id}
                          className="px-2 py-2 text-center text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    const range = r.max - r.min || 1;
                    const norm = (v - r.min) / range;
                    const bad = r.reverse ? norm : 1 - norm;
                    return (
                      <td key={r.id} className="px-2 py-2 text-center">
                        <span
                          className="inline-block min-w-[22px] h-6 leading-6 rounded text-[11px] font-bold tabular-nums"
                          style={{
                            background: `hsl(${bad > 0.5 ? 0 : 142} ${bad > 0.5 ? 70 : 55}% ${90 - bad * 30}%)`,
                            color: bad > 0.5 ? "hsl(0 60% 28%)" : "hsl(142 55% 22%)",
                          }}
                        >
                          {v}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <StudentTrendStrip checkIn={checkIn} />
    </div>
  );
}

function StudentTrendStrip({ checkIn }: { checkIn: ClassCheckIn }) {
  const trends = useMemo(() => {
    return checkIn.students
      .filter((s) => !s.absent)
      .slice(0, 6)
      .map((s) => {
        const stu = STUDENTS.find((x) => x.id === s.studentId);
        const points = getStudentRubricTrend(s.studentId);
        return { id: s.studentId, name: stu?.name ?? s.studentId, initials: stu?.initials ?? "?", points };
      })
      .filter((t) => t.points.length >= 2);
  }, [checkIn]);

  if (trends.length === 0) return null;

  return (
    <div>
      <h4 className="text-[12px] font-bold tracking-wider uppercase text-muted-foreground mb-2">
        Student trend over recent check-ins
      </h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {trends.map((t) => {
          const first = t.points[0].avgScore;
          const last = t.points[t.points.length - 1].avgScore;
          const delta = Math.round((last - first) * 10) / 10;
          const trendUp = delta > 0;
          return (
            <div
              key={t.id}
              className="rounded-lg border border-border bg-card/50 p-2.5"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-[11.5px] font-semibold truncate">{t.name}</div>
                <span
                  className={cn(
                    "text-[10.5px] font-semibold inline-flex items-center gap-0.5",
                    Math.abs(delta) < 0.1
                      ? "text-muted-foreground"
                      : trendUp
                        ? "text-emerald-600"
                        : "text-rose-600",
                  )}
                >
                  {Math.abs(delta) < 0.1 ? (
                    <Minus className="h-3 w-3" />
                  ) : trendUp ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(delta)}
                </span>
              </div>
              <div className="h-12">
                <ResponsiveContainer>
                  <LineChart data={t.points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <YAxis hide domain={[1, 5]} />
                    <XAxis hide dataKey="label" />
                    <RTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(240 15% 90%)",
                        background: "hsl(0 0% 100% / 0.95)",
                        fontSize: 11,
                        padding: "4px 8px",
                      }}
                      formatter={(v: number) => [`${v} / 5`, "Avg"]}
                      labelFormatter={(l) => l as string}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke={trendUp ? "hsl(142 55% 48%)" : "hsl(0 70% 60%)"}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {t.points.length} check-ins · last {t.points[t.points.length - 1].avgScore} / 5
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
