"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
} from "recharts";
import type { Student } from "@/data/mockData";

export function KsaRadar({ students }: { students: Student[] }) {
  const domains = students[0]?.ksa.map((k) => k.name) ?? [];
  const data = domains.map((name, i) => {
    const scores = students.map((s) => s.ksa[i].score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    const top = students.reduce((best, s) => (s.ksa[i].score > best.ksa[i].score ? s : best), students[0]);
    const low = students.reduce((worst, s) => (s.ksa[i].score < worst.ksa[i].score ? s : worst), students[0]);
    return { name, avg, top: top?.name, topScore: top?.ksa[i].score, low: low?.name, lowScore: low?.ksa[i].score };
  });

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="card-shadow">
        <CardContent className="p-5">
          <h2 className="font-heading font-bold mb-3">KSA breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid stroke="hsl(240 15% 90%)" />
                <PolarAngleAxis dataKey="name" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} angle={90} fontSize={10} />
                <Radar dataKey="avg" stroke="hsl(260 50% 60%)" fill="hsl(260 50% 60%)" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="card-shadow">
        <CardContent className="p-5">
          <h2 className="font-heading font-bold mb-3">Per-domain leaders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-2">Domain</th>
                  <th className="py-2 pr-2">Avg</th>
                  <th className="py-2 pr-2">Top</th>
                  <th className="py-2">Lowest</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.name} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-semibold">{d.name}</td>
                    <td className="py-2 pr-2 tabular-nums">{d.avg}</td>
                    <td className="py-2 pr-2 text-xs">
                      <div className="font-semibold">{d.top}</div>
                      <div className="text-emerald-600">{d.topScore}</div>
                    </td>
                    <td className="py-2 text-xs">
                      <div className="font-semibold">{d.low}</div>
                      <div className="text-rose-600">{d.lowScore}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
