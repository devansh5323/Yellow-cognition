// SEL Needs Explorer — Tool 2. The analytical engine: "where does the
// school need SEL support?" drilling School → Grade → Classroom → Student.
//
// Three of the 9 SEL_COMPETENCIES already have a real, per-student signal
// via classBehavior.ts's driver breakdown (the same real attention/behaviour
// data every other dashboard in this app is built on) — that's what lets
// this drill all the way to an individual student. The rest either fall
// back to the Pulse tool's grade-level seed data (bottoms out at Grade,
// honestly — no classroom/student split exists for those) or have no real
// backing at all yet and are marked unavailable rather than padded with a
// number. "Student group" has no real grouping model anywhere in this app
// (Tier 2/3 caseload groupings belong to the Special Ed role, not a
// general SEL cohort concept) — omitted rather than fabricated.

import { STUDENTS, type Grade, type Student } from "@/data/mockData";
import { classDisruptionBreakdown, DISRUPTION_LABEL, type DisruptionKey } from "@/lib/classBehavior";
import { SEL_COMPETENCIES, weeklySeriesFor, type SelCompetency } from "@/lib/selPulse";

const COMPETENCY_DRIVER: Partial<Record<SelCompetency, DisruptionKey>> = {
  "Emotional regulation": "emotional",
  "Peer relationships": "peer",
  "Coping with Challenges": "anxiety",
};

// Short "when it shows up" fragments per driver — presentation-layer
// context, same convention as classBehavior.ts's own DISRUPTION_SIGNS/
// DISRUPTION_DESCRIPTION, not a derived claim. Only the *which grade* part
// of the concentration insight is computed from real scores.
const CONCENTRATION_CONTEXT: Partial<Record<DisruptionKey, string>> = {
  emotional: "during transitions and challenging independent tasks",
  peer: "during group work and unstructured time",
  anxiety: "before assessments and unfamiliar tasks",
};

export type NeedsBand = "excellent" | "stable" | "watch" | "needs-support";

export const NEEDS_BAND_LABEL: Record<NeedsBand, string> = {
  excellent: "Strong",
  stable: "On Track",
  watch: "Watch",
  "needs-support": "Needs Support",
};

export const NEEDS_BAND_TONE: Record<NeedsBand, string> = {
  excellent: "hsl(142 60% 40%)",
  stable: "hsl(142 55% 45%)",
  watch: "hsl(38 92% 48%)",
  "needs-support": "hsl(0 78% 56%)",
};

function bandFromHealthScore(score: number): NeedsBand {
  if (score >= 80) return "excellent";
  if (score >= 65) return "stable";
  if (score >= 50) return "watch";
  return "needs-support";
}

/** "Conflict" is the one incidence-style competency (higher reported = worse)
 * — everything else already reads higher-is-healthier. */
function healthScore(competency: SelCompetency, rawScore: number): number {
  return competency === "Conflict" ? 100 - rawScore : rawScore;
}

export function classroomKey(student: Student): string {
  return `${student.grade.replace(/\D/g, "")}${student.section}`;
}

export function needsGradeOptions(): Grade[] {
  return Array.from(new Set(STUDENTS.map((s) => s.grade))).sort() as Grade[];
}

export function needsClassroomOptions(grade?: Grade | null): string[] {
  const pool = grade ? STUDENTS.filter((s) => s.grade === grade) : STUDENTS;
  return Array.from(new Set(pool.map(classroomKey))).sort();
}

/** Real staff names already attached to student records (`coach`) — a
 * round-robin assignment, not a genuine teacher-of-record link, but the
 * closest honest substitute since no Teacher field exists on Student. */
export function needsTeacherOptions(): string[] {
  return Array.from(new Set(STUDENTS.map((s) => s.coach))).sort();
}

export type NeedsScope = { grade?: Grade | null; classroom?: string | null; teacher?: string | null };

export function studentsForScope(scope: NeedsScope): Student[] {
  return STUDENTS.filter((s) => {
    if (scope.grade && s.grade !== scope.grade) return false;
    if (scope.classroom && classroomKey(s) !== scope.classroom) return false;
    if (scope.teacher && s.coach !== scope.teacher) return false;
    return true;
  });
}

export type CompetencyStatus = {
  competency: SelCompetency;
  available: boolean;
  score: number | null;
  band: NeedsBand | null;
  source: "behavior" | "pulse" | null;
};

export function competencyStatusFor(competency: SelCompetency, scope: NeedsScope): CompetencyStatus {
  const driverKey = COMPETENCY_DRIVER[competency];
  const unavailable: CompetencyStatus = { competency, available: false, score: null, band: null, source: null };

  if (driverKey) {
    const students = studentsForScope(scope);
    if (students.length === 0) return unavailable;
    const stat = classDisruptionBreakdown(students).find((d) => d.key === driverKey);
    if (!stat) return unavailable;
    return { competency, available: true, score: stat.score, band: bandFromHealthScore(stat.score), source: "behavior" };
  }

  // Pulse fallback only exists at grade granularity — no classroom/teacher
  // split was ever collected for these competencies.
  if (scope.classroom || scope.teacher) return unavailable;
  const grades = scope.grade ? [scope.grade] : needsGradeOptions();
  const scores = grades
    .map((g) => weeklySeriesFor(g, competency))
    .filter((series) => series.length > 0)
    .map((series) => series[series.length - 1]);
  if (scores.length === 0) return unavailable;
  const avgRaw = scores.reduce((a, b) => a + b, 0) / scores.length;
  const score = Math.round(healthScore(competency, avgRaw));
  return { competency, available: true, score, band: bandFromHealthScore(score), source: "pulse" };
}

export function allCompetencyStatuses(scope: NeedsScope): CompetencyStatus[] {
  return SEL_COMPETENCIES.map((c) => competencyStatusFor(c, scope));
}

export type Trend = "up" | "down" | "flat";

/** Real week-over-week direction — classDisruptionBreakdown's own
 * weeklyChange for driver-backed competencies, or a live delta across the
 * latest two collected pulse weeks otherwise. */
export function competencyTrendFor(competency: SelCompetency, scope: NeedsScope): Trend {
  const driverKey = COMPETENCY_DRIVER[competency];
  if (driverKey) {
    const students = studentsForScope(scope);
    if (students.length === 0) return "flat";
    const stat = classDisruptionBreakdown(students).find((d) => d.key === driverKey);
    if (!stat) return "flat";
    if (stat.weeklyChange > 1) return "up";
    if (stat.weeklyChange < -1) return "down";
    return "flat";
  }

  if (scope.classroom || scope.teacher) return "flat";
  const grades = scope.grade ? [scope.grade] : needsGradeOptions();
  const deltas = grades
    .map((g) => weeklySeriesFor(g, competency))
    .filter((series) => series.length >= 2)
    .map((series) => healthScore(competency, series[series.length - 1]) - healthScore(competency, series[series.length - 2]));
  if (deltas.length === 0) return "flat";
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  if (avgDelta > 1) return "up";
  if (avgDelta < -1) return "down";
  return "flat";
}

/** Individual-student drill-down — real, but necessarily binary (a single
 * student either trips the driver's signal or doesn't; classDisruptionBreakdown's
 * severity scoring only has room to be continuous across a group). `null`
 * when this competency has no per-student driver backing it at all. */
export function studentFlagFor(competency: SelCompetency, student: Student): boolean | null {
  const driverKey = COMPETENCY_DRIVER[competency];
  if (!driverKey) return null;
  const stat = classDisruptionBreakdown([student]).find((d) => d.key === driverKey);
  return stat ? stat.studentCount > 0 : null;
}

/** One classroom's average health score across whichever competencies are
 * actually driver-backed at classroom granularity — feeds the Implementation
 * Tracker's "SEL Metrics %" column. `null` when the classroom has no
 * students (shouldn't happen for a real classroom key, but keeps this
 * honest rather than dividing by zero). */
export function classroomSelMetricsPct(classroom: string): number | null {
  const scores = Object.keys(COMPETENCY_DRIVER)
    .map((c) => competencyStatusFor(c as SelCompetency, { classroom }))
    .filter((s) => s.available && s.score !== null)
    .map((s) => s.score!);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type ConcentrationInsight = { competency: SelCompetency; grade: Grade; sentence: string };

/** For each competency with a real per-student driver signal, find which
 * real grade currently scores worst — and only flag it when that grade is
 * genuinely in Watch/Needs Support, not for every competency regardless of
 * severity. */
export function concentrationInsights(): ConcentrationInsight[] {
  const grades = needsGradeOptions();
  const insights: ConcentrationInsight[] = [];

  for (const competency of SEL_COMPETENCIES) {
    const driverKey = COMPETENCY_DRIVER[competency];
    if (!driverKey) continue;

    const byGrade = grades
      .map((grade) => ({ grade, status: competencyStatusFor(competency, { grade }) }))
      .filter((row) => row.status.available && row.status.score !== null);
    if (byGrade.length === 0) continue;

    const worst = byGrade.reduce((a, b) => (b.status.score! < a.status.score! ? b : a));
    if (worst.status.band !== "watch" && worst.status.band !== "needs-support") continue;

    const context = CONCENTRATION_CONTEXT[driverKey];
    const sentence = context
      ? `${DISRUPTION_LABEL[driverKey]} difficulties are concentrated in ${worst.grade} and are most commonly observed ${context}.`
      : `${DISRUPTION_LABEL[driverKey]} difficulties are concentrated in ${worst.grade}.`;
    insights.push({ competency, grade: worst.grade, sentence });
  }

  return insights;
}
