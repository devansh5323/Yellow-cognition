"use client";

import { Card, CardContent } from "@/components/ui/card";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import type { Student } from "@/data/mockData";

/** The real roster has no per-skill (KSA) breakdown field — that field only
 * existed on the old synthetic mock students, so this renders an honest
 * empty state instead of a fabricated radar/leaderboard. */
export function KsaRadar({ students }: { students: Student[] }) {
  return (
    <Card className="card-shadow">
      <CardContent className="p-5">
        <h2 className="font-heading font-bold mb-3">KSA breakdown</h2>
        <NotEnoughDataPanel
          title="No skill breakdown yet"
          description={`A per-skill (KSA) breakdown isn't available for ${students.length ? "this cohort" : "any students"} yet.`}
        />
      </CardContent>
    </Card>
  );
}
