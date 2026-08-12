// SEL Program & Lesson Planner — Tool 4. The one tool in this set that's
// genuinely a planning tool, not a monitor: the coordinator authors a
// multi-week program and assigns it to a grade. localStorage-backed CRUD,
// same pattern as lib/selPulse.ts. Because this whole app is a single
// browser with no real backend, "assign" is what actually closes the loop
// with the teacher dashboard — the same localStorage the assignment is
// written to is what AssignedSelProgramBanner reads on /dashboard.
//
// The week-by-week curriculum titles are hand-authored content (there's no
// existing SEL lesson-plan library anywhere in this app to derive them
// from) — same "plausible starter content" convention as this app's other
// template libraries (e.g. specialEdPlaceholderData.ts's TRACKER_TEMPLATES).

import { STUDENTS, type Grade } from "@/data/mockData";
import { needsGradeOptions } from "@/lib/selNeeds";
import { SEL_COMPETENCIES, type SelCompetency } from "@/lib/selPulse";

export { needsGradeOptions as programGradeOptions };

export type StudentParticipation = { participating: number; total: number; pct: number };

/** Takes the caller's already-fetched programs rather than re-reading
 * localStorage itself — keeps callers' useMemo dependency arrays honest.
 * Lives here (not lib/selSnapshot.ts) so lib/selGroups.ts can reuse it too
 * without creating an import cycle back through the snapshot module. */
export function studentParticipationSummary(programs: SelProgram[]): StudentParticipation {
  const assignedGrades = new Set<string>(programs.filter((p) => p.status === "assigned").map((p) => p.grade));
  const participating = STUDENTS.filter((s) => assignedGrades.has(s.grade)).length;
  const total = STUDENTS.length;
  return { participating, total, pct: total === 0 ? 0 : Math.round((participating / total) * 100) };
}

export const PROGRAM_DURATIONS = [4, 6, 8] as const;
export type ProgramDuration = (typeof PROGRAM_DURATIONS)[number];

const WEEK_TEMPLATES: Record<SelCompetency, string[]> = {
  "Emotional regulation": [
    "Recognising emotions",
    "Identifying triggers",
    "Calming strategies",
    "Managing frustration",
    "Coping with challenges",
    "Review and practice",
  ],
  "Coping with Challenges": [
    "Naming stress",
    "Growth mindset",
    "Problem-solving steps",
    "Asking for help",
    "Building resilience",
    "Review and practice",
  ],
  "Peer relationships": [
    "Understanding friendship",
    "Active listening",
    "Resolving conflicts",
    "Working in groups",
    "Empathy building",
    "Review and practice",
  ],
  "Sense of belonging": [
    "What makes me, me",
    "Celebrating differences",
    "Building classroom community",
    "Inclusion in action",
    "Speaking up and being heard",
    "Review and practice",
  ],
  "Student-Teacher Relationships": [
    "Building trust",
    "Getting to know each other",
    "Two-way feedback",
    "Repairing ruptures",
    "Consistency and follow-through",
    "Review and practice",
  ],
  "Emotional safety": [
    "What makes a space safe",
    "Trust and honesty",
    "Respecting boundaries",
    "Speaking up safely",
    "Supporting each other",
    "Review and practice",
  ],
  "Help-seeking": [
    "Knowing when to ask",
    "Who can help",
    "How to ask for help",
    "Practicing asking",
    "Helping others",
    "Review and practice",
  ],
  "Confidence & self-efficacy": [
    "Naming strengths",
    "Setting small goals",
    "Trying new things",
    "Learning from mistakes",
    "Celebrating progress",
    "Review and practice",
  ],
  Conflict: [
    "What conflict looks like",
    "Staying calm in disagreements",
    "Using “I” statements",
    "Finding win-win solutions",
    "Repairing relationships",
    "Review and practice",
  ],
  "School connectedness": [
    "What connects us",
    "School traditions and pride",
    "Finding your people",
    "Contributing to community",
    "Leadership and voice",
    "Review and practice",
  ],
};

export type ProgramWeek = { week: number; title: string };

/** Stretches/condenses the 6-week template to any duration, always
 * keeping the template's first steps and ending on "Review and practice". */
export function weeksForFocus(focus: SelCompetency, duration: number): ProgramWeek[] {
  const template = WEEK_TEMPLATES[focus];
  const last = template[template.length - 1];
  let titles: string[];
  if (duration === template.length) titles = template;
  else if (duration < template.length) titles = [...template.slice(0, duration - 1), last];
  else {
    const extra = Array.from({ length: duration - template.length }, (_, i) => `Practice & reflection ${i + 1}`);
    titles = [...template.slice(0, -1), ...extra, last];
  }
  return titles.map((title, i) => ({ week: i + 1, title }));
}

export type ProgramStatus = "draft" | "assigned";

export type SelProgram = {
  id: string;
  grade: Grade;
  focus: SelCompetency;
  duration: number;
  weeks: ProgramWeek[];
  status: ProgramStatus;
  createdAt: string;
  assignedAt: string | null;
};

const KEY = "ah_sel_programs";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getPrograms(): SelProgram[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SelProgram[]) : [];
  } catch {
    return [];
  }
}

function writePrograms(programs: SelProgram[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(programs));
  window.dispatchEvent(new CustomEvent("ah-sel-program-change"));
}

export function createProgram(input: { grade: Grade; focus: SelCompetency; duration: number }): SelProgram {
  const program: SelProgram = {
    id: `program-${Date.now()}`,
    grade: input.grade,
    focus: input.focus,
    duration: input.duration,
    weeks: weeksForFocus(input.focus, input.duration),
    status: "draft",
    createdAt: new Date().toISOString(),
    assignedAt: null,
  };
  writePrograms([program, ...getPrograms()]);
  return program;
}

export function assignProgram(id: string) {
  writePrograms(
    getPrograms().map((p) => (p.id === id ? { ...p, status: "assigned", assignedAt: new Date().toISOString() } : p)),
  );
}

/** Which week a teacher should currently be on, based on real elapsed time
 * since assignment — null once the program has run its full duration. */
export function currentWeekFor(program: SelProgram, nowMs: number): ProgramWeek | null {
  if (program.status !== "assigned" || !program.assignedAt) return null;
  const weeksElapsed = Math.floor((nowMs - +new Date(program.assignedAt)) / (7 * 24 * 60 * 60 * 1000));
  const weekIndex = Math.min(weeksElapsed, program.weeks.length - 1);
  if (weekIndex < 0 || weekIndex >= program.weeks.length) return null;
  return program.weeks[weekIndex];
}

export { SEL_COMPETENCIES as PROGRAM_FOCUS_OPTIONS };
