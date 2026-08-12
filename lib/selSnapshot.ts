// SEL Snapshot — Segment 1. A compact overview strip answering "how active
// is SEL across the school, and where is workload building up?"
//
// All five tiles now compose real data from Tools 1/3/4/5/6: Student
// Participation (Tool 4's assigned programs), Pulse Participation (Tool
// 1's active pulses), Classroom Overview (Tool 3's implementation rows),
// Active Tier 2 Groups (Tool 5's groups), and Teacher Support Requests
// (Tool 6's requests).

import { pulseGradeOptions, type Pulse } from "@/lib/selPulse";
import { classroomImplementationRows } from "@/lib/selImplementation";
import { activeGroupsSummary, type SelGroup } from "@/lib/selGroups";
import { openTeacherRequestsSummary, type TeacherRequest } from "@/lib/selTeacherSupport";

export type { StudentParticipation } from "@/lib/selProgram";
export { studentParticipationSummary } from "@/lib/selProgram";

export type PulseParticipation = { pct: number; gradesParticipating: number; gradesTotal: number };

export function pulseParticipationSummary(pulses: Pulse[]): PulseParticipation {
  const activeGrades = new Set(pulses.filter((p) => p.status === "active").map((p) => p.grade));
  const gradesTotal = pulseGradeOptions().length;
  const gradesParticipating = activeGrades.size;
  return { pct: gradesTotal === 0 ? 0 : Math.round((gradesParticipating / gradesTotal) * 100), gradesParticipating, gradesTotal };
}

export type ClassroomOverview = { needSupport: number; total: number };

export function classroomOverviewSummary(): ClassroomOverview {
  const rows = classroomImplementationRows();
  return { needSupport: rows.filter((r) => r.status !== "on-track").length, total: rows.length };
}

export type GroupSupportSummary = { activeGroups: number; studentsParticipating: number; dueForReview: number };

export function groupSupportSummary(groups: SelGroup[]): GroupSupportSummary {
  return activeGroupsSummary(groups);
}

export type TeacherRequestsSummary = { openCount: number; awaitingCoordinator: number };

export function teacherRequestsSummary(requests: TeacherRequest[]): TeacherRequestsSummary {
  return openTeacherRequestsSummary(requests);
}
