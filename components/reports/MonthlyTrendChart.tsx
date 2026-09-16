"use client";

import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import type { Student } from "@/data/mockData";

/** The real roster has no monthly check-in history (that concept only
 * existed on the old synthetic mock students) — shown honestly instead of a
 * fabricated trend line. */
export function MonthlyTrendChart({ students }: { students: Student[] }) {
  return (
    <NotEnoughDataPanel
      title="No monthly trend yet"
      description={`Monthly check-in trends will appear here once ${students.length ? "this cohort" : "the roster"} has more than one snapshot of data.`}
    />
  );
}
