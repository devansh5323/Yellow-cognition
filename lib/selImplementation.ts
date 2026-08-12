// SEL Implementation Tracker — Tool 3. Whether the SEL program is actually
// being delivered, not just how students are doing.
//
// No lesson-delivery-logging model exists anywhere in this app yet (no
// "mark this week's SEL activity done" flow for teachers), so the
// planned/completed counts and teacher-of-record per classroom below are
// SEED / DEMO DATA — same isolated, documented convention as
// lib/specialEdPlaceholderData.ts. What IS real: the classroom identifiers
// and grades come straight from data/mockData.ts's actual roster (no
// invented "Grade 5A/6A" — this app's real students only span Grade 3–4),
// and every summary number and status band below is computed FROM the
// seed rows, not independently made up.

import { STUDENTS, type Grade } from "@/data/mockData";
import { classroomKey } from "@/lib/selNeeds";
import type { SelActionItem, SelCompetency } from "@/lib/selPulse";

export type ImplementationStatus = "on-track" | "watch" | "needs-follow-up";

export const IMPLEMENTATION_STATUS_LABEL: Record<ImplementationStatus, string> = {
  "on-track": "On track",
  watch: "Watch",
  "needs-follow-up": "Needs follow-up",
};

export const IMPLEMENTATION_STATUS_TONE: Record<ImplementationStatus, string> = {
  "on-track": "hsl(142 55% 45%)",
  watch: "hsl(38 92% 48%)",
  "needs-follow-up": "hsl(0 78% 56%)",
};

function statusFromRatio(planned: number, completed: number): ImplementationStatus {
  const ratio = planned === 0 ? 0 : completed / planned;
  if (ratio >= 0.9) return "on-track";
  if (ratio >= 0.6) return "watch";
  return "needs-follow-up";
}

export type ClassroomImplementation = {
  classroom: string;
  grade: Grade;
  selFocus: SelCompetency;
  teacher: string;
  planned: number;
  completed: number;
  status: ImplementationStatus;
};

type SeedRow = { classroom: string; selFocus: SelCompetency; teacher: string; planned: number; completed: number };

const SEED_ROWS: SeedRow[] = [
  { classroom: "3A", selFocus: "Emotional regulation", teacher: "Ms. Priya Sharma", planned: 4, completed: 4 },
  { classroom: "3B", selFocus: "Emotional regulation", teacher: "Mr. Arjun Mehta", planned: 4, completed: 2 },
  { classroom: "4A", selFocus: "Peer relationships", teacher: "Ms. Riya Kapoor", planned: 4, completed: 3 },
  { classroom: "4B", selFocus: "Coping with Challenges", teacher: "Ms. Priya Sharma", planned: 4, completed: 4 },
];

function gradeForClassroom(classroom: string): Grade {
  const student = STUDENTS.find((s) => classroomKey(s) === classroom);
  return (student?.grade ?? "Grade 3") as Grade;
}

export function classroomImplementationRows(): ClassroomImplementation[] {
  return SEED_ROWS.map((r) => ({
    classroom: r.classroom,
    grade: gradeForClassroom(r.classroom),
    selFocus: r.selFocus,
    teacher: r.teacher,
    planned: r.planned,
    completed: r.completed,
    status: statusFromRatio(r.planned, r.completed),
  }));
}

export type ImplementationSummary = {
  classesParticipating: number;
  totalClasses: number;
  completionPct: number;
  teachersActive: number;
  totalTeachers: number;
  classesMissingWeekly: number;
  followUpsRequired: number;
};

/** Every number here is a real aggregation over classroomImplementationRows()
 * — none independently invented. */
export function implementationSummary(rows: ClassroomImplementation[]): ImplementationSummary {
  const classesParticipating = rows.filter((r) => r.completed > 0).length;
  const plannedTotal = rows.reduce((a, r) => a + r.planned, 0);
  const completedTotal = rows.reduce((a, r) => a + r.completed, 0);
  const teachers = new Set(rows.map((r) => r.teacher));
  const activeTeachers = new Set(rows.filter((r) => r.completed > 0).map((r) => r.teacher));
  return {
    classesParticipating,
    totalClasses: rows.length,
    completionPct: plannedTotal === 0 ? 0 : Math.round((completedTotal / plannedTotal) * 100),
    teachersActive: activeTeachers.size,
    totalTeachers: teachers.size,
    classesMissingWeekly: rows.filter((r) => r.completed < r.planned).length,
    followUpsRequired: rows.filter((r) => r.status === "needs-follow-up").length,
  };
}

export type ImplementationInsight = { classroom: string; grade: Grade; pct: number; sentence: string };

/** "Implementation Gap Insight" — the single worst classroom below the
 * on-track bar, or `null` when every classroom is on track (honest, not
 * padded). */
export function worstImplementationInsight(rows: ClassroomImplementation[]): ImplementationInsight | null {
  const behind = rows.filter((r) => r.status !== "on-track" && r.planned > 0);
  if (behind.length === 0) return null;
  const worst = behind.reduce((a, b) => (b.completed / b.planned < a.completed / a.planned ? b : a));
  const pct = Math.round((worst.completed / worst.planned) * 100);
  return {
    classroom: worst.classroom,
    grade: worst.grade,
    pct,
    sentence: `Grade ${worst.classroom} completed ${worst.completed} of ${worst.planned} planned ${worst.selFocus.toLowerCase()} activities this month.`,
  };
}

export type GradeImplementation = {
  grade: Grade;
  completionPct: number;
  status: ImplementationStatus;
  classroomCount: number;
};

/** "Implementation by Grade" — aggregates the classroom rows up one level,
 * same status thresholds as the classroom-level bands. */
export function implementationByGrade(rows: ClassroomImplementation[]): GradeImplementation[] {
  const grades = Array.from(new Set(rows.map((r) => r.grade)));
  return grades.map((grade) => {
    const gradeRows = rows.filter((r) => r.grade === grade);
    const planned = gradeRows.reduce((a, r) => a + r.planned, 0);
    const completed = gradeRows.reduce((a, r) => a + r.completed, 0);
    return {
      grade,
      completionPct: planned === 0 ? 0 : Math.round((completed / planned) * 100),
      status: statusFromRatio(planned, completed),
      classroomCount: gradeRows.length,
    };
  });
}

export type ClassesMissingSel = { count: number; classrooms: string[] };

/** "Classes Missing SEL" — real classrooms currently behind pace. */
export function classesMissingSel(rows: ClassroomImplementation[]): ClassesMissingSel {
  const behind = rows.filter((r) => r.completed < r.planned);
  return { count: behind.length, classrooms: behind.map((r) => r.classroom) };
}

export type GradeFocus = { grade: Grade; focuses: SelCompetency[] };

/** "Current SEL Focus" — whichever competency (or competencies, if a
 * grade's classrooms differ) each real grade is actively working on this
 * month, straight from the classroom rows rather than a fabricated K–2/
 * 3–5/6–8 banding this roster doesn't actually have grades for. */
export function currentFocusByGrade(rows: ClassroomImplementation[]): GradeFocus[] {
  const grades = Array.from(new Set(rows.map((r) => r.grade)));
  return grades.map((grade) => ({
    grade,
    focuses: Array.from(new Set(rows.filter((r) => r.grade === grade).map((r) => r.selFocus))),
  }));
}

/** Feeds the dashboard's Action Hub alongside Pulse's emerging-pattern
 * rungs — only produces an item when a real classroom is genuinely behind. */
export function buildImplementationActionItems(rows: ClassroomImplementation[]): SelActionItem[] {
  const insight = worstImplementationInsight(rows);
  if (!insight) return [];
  const row = rows.find((r) => r.classroom === insight.classroom);
  if (!row) return [];
  return [
    {
      id: `implementation-${insight.classroom}`,
      priority: row.status === "needs-follow-up" ? "high" : "medium",
      action: `Support ${insight.classroom} on ${row.selFocus.toLowerCase()}`,
      whyItMatters: insight.sentence,
      related: `Grade ${insight.classroom} · ${row.teacher}`,
      ctaLabel: "Support teacher",
      href: "/sel/implementation",
    },
  ];
}
