"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentAvatar } from "./StudentAvatar";
import { RiskBadge } from "./RiskBadge";
import type { Student } from "@/data/mockData";
import { MONTH_LABELS } from "@/data/mockData";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis,
} from "recharts";
import { ArrowUp, ArrowDown, X, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "hsl(142 52% 48%)",
  "hsl(260 50% 60%)",
  "hsl(38 92% 55%)",
  "hsl(200 70% 55%)",
  "hsl(340 70% 60%)",
  "hsl(170 60% 45%)",
];

export function CompareDrawer({
  open,
  onOpenChange,
  students,
  onRemove,
  onClear,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  students: Student[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  // Monthly check-in timeline data — null months are skipped per student
  const monthlyData = MONTH_LABELS.map((m, i) => {
    const row: Record<string, number | string | null> = { month: m };
    students.forEach((s) => (row[s.name] = s.monthly[i]));
    return row;
  });

  // Sub-domain radar data
  const radarData = students[0]?.subDomains.map((sd, i) => {
    const row: Record<string, number | string> = { name: sd.name.replace(/Attention$/, "Att.") };
    students.forEach((s) => (row[s.name] = s.subDomains[i].score));
    return row;
  }) ?? [];

  // Intra-month engagement history (W1-W4 game/session signal, not check-in data)
  const weekData = ["W1", "W2", "W3", "W4"].map((w, i) => {
    const row: Record<string, number | string> = { week: w };
    students.forEach((s) => (row[s.name] = s.history[i].pfi));
    return row;
  });

  const top = students.length
    ? [...students].sort((a, b) => b.pfi - a.pfi)[0]
    : null;
  const lowest = students.length
    ? [...students].sort((a, b) => a.pfi - b.pfi)[0]
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="font-heading font-extrabold text-xl">
                Compare students
              </SheetTitle>
              <SheetDescription>
                Side-by-side performance & attention for {students.length} student{students.length !== 1 ? "s" : ""}.
              </SheetDescription>
            </div>
            {students.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
                Clear all
              </Button>
            )}
          </div>
          {/* Selection chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border bg-card"
                style={{ borderLeftColor: PALETTE[i % PALETTE.length], borderLeftWidth: 4 }}
              >
                <StudentAvatar student={s} size="sm" className="!h-6 !w-6 text-[10px]" />
                <span className="text-xs font-semibold">{s.name}</span>
                <button onClick={() => onRemove(s.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </SheetHeader>

        {students.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Select students using the checkboxes to compare.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* KPI grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left p-2 font-semibold">Student</th>
                    <th className="p-2 font-semibold">PFI</th>
                    <th className="p-2 font-semibold">Trend</th>
                    <th className="p-2 font-semibold">CSI</th>
                    <th className="p-2 font-semibold">Engagement</th>
                    <th className="p-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const delta = s.pfi - s.pfiPrevCheckIn;
                    const completion = Math.round((s.gamesPlayed / s.gamesAssigned) * 100);
                    return (
                      <tr key={s.id} className="bg-muted/40">
                        <td className="p-2 rounded-l-lg">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-sm shrink-0"
                              style={{ background: PALETTE[i % PALETTE.length] }}
                            />
                            <StudentAvatar student={s} size="sm" className="!h-7 !w-7 text-[10px]" />
                            <div className="min-w-0">
                              <div className="font-semibold text-xs truncate">{s.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.grade} · {s.section}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center font-heading font-bold">{s.pfi}</td>
                        <td className="p-2 text-center">
                          <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                            delta >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive")}>
                            {delta >= 0 ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}
                            {Math.abs(delta)}
                          </span>
                        </td>
                        <td className="p-2 text-center font-semibold">{s.csi}</td>
                        <td className="p-2 text-center text-xs">{completion}%</td>
                        <td className="p-2 rounded-r-lg"><RiskBadge risk={s.risk} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Highlights */}
            {students.length > 1 && top && lowest && top.id !== lowest.id && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Highest PFI</div>
                    <div className="font-semibold text-sm truncate">{top.name} · {top.pfi}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Needs support</div>
                    <div className="font-semibold text-sm truncate">{lowest.name} · {lowest.pfi}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly check-in trend */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-heading font-bold text-sm mb-1">Attention by month</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Last {MONTH_LABELS.length} monthly check-ins · gaps mean no check-in submitted
              </p>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {students.map((s, i) => (
                      <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.name}
                        stroke={PALETTE[i % PALETTE.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Intra-month PFI (engagement signal, between check-ins) */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-heading font-bold text-sm mb-1">PFI · last 4 weeks</h3>
              <p className="text-xs text-muted-foreground mb-3">Engagement trend between check-ins</p>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" />
                    <XAxis dataKey="week" fontSize={11} />
                    <YAxis fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {students.map((s, i) => (
                      <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.name}
                        stroke={PALETTE[i % PALETTE.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-domain radar */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-heading font-bold text-sm mb-1">Attention sub-domains</h3>
              <p className="text-xs text-muted-foreground mb-3">Strengths & gaps across cognitive areas</p>
              <div className="h-72">
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(240 15% 88%)" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {students.map((s, i) => (
                      <Radar
                        key={s.id}
                        name={s.name}
                        dataKey={s.name}
                        stroke={PALETTE[i % PALETTE.length]}
                        fill={PALETTE[i % PALETTE.length]}
                        fillOpacity={0.18}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
