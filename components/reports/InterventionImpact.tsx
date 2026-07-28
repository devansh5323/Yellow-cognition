"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Activity, Users, Eye, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERVENTIONS = [
  { name: "Movement break", before: 62, after: 78, students: 24, date: "Apr 18", icon: Activity, tone: "hsl(142 52% 48%)" },
  { name: "Group activity", before: 65, after: 74, students: 18, date: "Apr 16", icon: Users, tone: "hsl(260 50% 60%)" },
  { name: "Visual recap", before: 58, after: 71, students: 22, date: "Apr 14", icon: Eye, tone: "hsl(200 70% 55%)" },
  { name: "1:1 check-in", before: 48, after: 63, students: 4, date: "Apr 12", icon: MessageCircle, tone: "hsl(38 92% 55%)" },
];

export function InterventionImpact() {
  return (
    <div className="space-y-4">
      <Card className="card-shadow">
        <CardContent className="p-5">
          <h2 className="font-heading font-bold mb-3">Intervention impact on PFI</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={INTERVENTIONS}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="before" fill="hsl(240 15% 75%)" radius={[8, 8, 0, 0]} name="Before" />
                <Bar dataKey="after" fill="hsl(142 52% 48%)" radius={[8, 8, 0, 0]} name="After" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow">
        <CardContent className="p-5">
          <h2 className="font-heading font-bold mb-3">Recent interventions</h2>
          <ul className="divide-y">
            {INTERVENTIONS.map((it) => {
              const Icon = it.icon;
              const delta = it.after - it.before;
              return (
                <li key={it.name} className="py-3 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl grid place-items-center"
                    style={{ background: it.tone.replace(")", " / 0.12)"), color: it.tone }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.students} students · {it.date}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full",
                      delta >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600",
                    )}
                  >
                    {delta >= 0 ? "+" : ""}{delta} PFI
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
