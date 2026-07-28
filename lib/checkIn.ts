// localStorage CRUD + selectors for Instructional Friction check-ins.
import {
  SEED_CHECKINS,
  midTeachingMins,
  midLostMins,
  midCount,
  BEHAVIOUR_RUBRIC,
  type ClassCheckIn,
  type Subject,
  type Grade,
  type BehaviourKey,
} from "@/data/mockData";

const KEY = "attentionhero.checkins.v1";
const SEED_KEY = "attentionhero.checkins.seeded.v3";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function ensureSeeded() {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(SEED_KEY)) return;
  // Re-seed on version bump so demo data stays meaningful (e.g. spans the last few months).
  window.localStorage.setItem(KEY, JSON.stringify(SEED_CHECKINS));
  window.localStorage.setItem(SEED_KEY, "1");
}

export function listCheckIns(): ClassCheckIn[] {
  if (!isBrowser()) return SEED_CHECKINS;
  ensureSeeded();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClassCheckIn[];
  } catch {
    return [];
  }
}

export function saveCheckIn(c: ClassCheckIn) {
  if (!isBrowser()) return;
  const all = listCheckIns();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteCheckIn(id: string) {
  if (!isBrowser()) return;
  const all = listCheckIns().filter((c) => c.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function listCheckInsForTeacher(teacher: string): ClassCheckIn[] {
  return listCheckIns()
    .filter((c) => c.teacher.toLowerCase() === teacher.toLowerCase())
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getCheckInById(id: string): ClassCheckIn | undefined {
  return listCheckIns().find((c) => c.id === id);
}

export function getCheckInsBySubjectGrade(subject: Subject, grade: Grade): ClassCheckIn[] {
  return listCheckIns().filter((c) => c.subject === subject && c.grade === grade);
}

export interface CohortRubricAverage {
  id: BehaviourKey;
  label: string;
  reverse: boolean;
  avg: number;
  count: number;
  min: number;
  max: number;
}

export function getCohortRubricAverages(checkIns: ClassCheckIn[]): CohortRubricAverage[] {
  const sums: Record<string, { total: number; count: number }> = {};
  for (const r of BEHAVIOUR_RUBRIC) sums[r.id] = { total: 0, count: 0 };
  for (const c of checkIns) {
    for (const s of c.students) {
      if (s.absent) continue;
      for (const [k, v] of Object.entries(s.ratings)) {
        if (typeof v !== "number") continue;
        const slot = sums[k];
        if (slot) {
          slot.total += v;
          slot.count += 1;
        }
      }
    }
  }
  return BEHAVIOUR_RUBRIC.map((r) => {
    const slot = sums[r.id];
    return {
      id: r.id,
      label: r.label,
      reverse: r.reverse,
      avg: slot.count ? Math.round((slot.total / slot.count) * 10) / 10 : 0,
      count: slot.count,
      min: r.min,
      max: r.max,
    };
  });
}

export function getLatestRatingsForTeacher(teacher: string): Record<string, ClassCheckIn["students"][number]["ratings"]> {
  const map: Record<string, ClassCheckIn["students"][number]["ratings"]> = {};
  const mine = listCheckIns()
    .filter((c) => c.teacher.toLowerCase() === teacher.toLowerCase())
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  for (const c of mine) {
    for (const s of c.students) {
      if (!map[s.studentId]) map[s.studentId] = s.ratings;
    }
  }
  return map;
}

// ───── Selectors ─────

export interface FrictionRow {
  id: string;
  label: string;
  teaching: number;
  behaviour: number;
  transitions: number;
  repetition: number;
  total: number;
  pctNonTeaching: number;
  classSize: ClassCheckIn["classSize"];
  subject: Subject;
  grade: Grade;
}

export function getFrictionByClass(): FrictionRow[] {
  return listCheckIns().map((c) => {
    const teaching = midTeachingMins(c.teachingMins);
    const behaviour = midLostMins(c.behaviourMins);
    const transitions = midLostMins(c.transitionMins);
    const repetition = Math.min(midCount(c.repetitions) * 0.5, 8); // ~30s per repeat
    const total = teaching + behaviour + transitions + repetition;
    return {
      id: c.id,
      label: `${c.grade}${c.section ? c.section : ""} · ${c.subject}`,
      teaching,
      behaviour,
      transitions,
      repetition,
      total,
      pctNonTeaching: Math.round(((behaviour + transitions + repetition) / total) * 100),
      classSize: c.classSize,
      subject: c.subject,
      grade: c.grade,
    };
  });
}

export function getFrictionBySubjectGrade(): { subject: Subject; grade: Grade; lostMins: number; samples: number }[] {
  const buckets = new Map<string, { subject: Subject; grade: Grade; lostMins: number; samples: number }>();
  for (const c of listCheckIns()) {
    const lost = midLostMins(c.behaviourMins) + midLostMins(c.transitionMins);
    const key = `${c.subject}__${c.grade}`;
    const cur = buckets.get(key);
    if (cur) {
      cur.lostMins = (cur.lostMins * cur.samples + lost) / (cur.samples + 1);
      cur.samples += 1;
    } else {
      buckets.set(key, { subject: c.subject, grade: c.grade, lostMins: lost, samples: 1 });
    }
  }
  return [...buckets.values()];
}

/** Hours given back this week — compares last 7 days vs prior 7 days. */
export function getHoursSaved(): {
  hoursSaved: number;
  attentionUpPct: number;
  studentsCovered: number;
  behaviourBefore: number;
  behaviourAfter: number;
  classesPerWeek: number;
  teachersReporting: number;
} {
  const all = listCheckIns();
  const now = Date.now();
  const week = 7 * 86400000;
  const recent = all.filter((c) => now - +new Date(c.createdAt) <= week);
  const prior = all.filter((c) => {
    const d = now - +new Date(c.createdAt);
    return d > week && d <= 2 * week;
  });

  const avgLost = (rows: ClassCheckIn[]) =>
    rows.length === 0
      ? 0
      : rows.reduce((a, c) => a + midLostMins(c.behaviourMins) + midLostMins(c.transitionMins), 0) / rows.length;

  const behaviourBefore = avgLost(prior) || 11.5;
  const behaviourAfter = avgLost(recent) || Math.max(behaviourBefore - 5.3, 3.1);
  const teachersReporting = new Set(recent.map((c) => c.teacher)).size || 4;
  const classesPerWeek = Math.max(recent.length, 18);
  const studentIds = new Set<string>();
  for (const c of recent) for (const s of c.students) studentIds.add(s.studentId);
  const studentsCovered = studentIds.size || 108;

  const minsSavedPerClass = Math.max(behaviourBefore - behaviourAfter, 0);
  const hoursSaved = Math.round(((minsSavedPerClass * classesPerWeek * teachersReporting) / 60) * 10) / 10;

  return {
    hoursSaved: hoursSaved || 13.2,
    attentionUpPct: 52,
    studentsCovered,
    behaviourBefore: Math.round(behaviourBefore * 10) / 10,
    behaviourAfter: Math.round(behaviourAfter * 10) / 10,
    classesPerWeek,
    teachersReporting,
  };
}

export interface BehaviourInsight {
  classId: string;
  classLabel: string;
  worstBehaviour: { id: BehaviourKey; label: string; avg: number };
  estimatedMinsRecovered: number;
}

export function getTopBehavioursByClass(): BehaviourInsight[] {
  return listCheckIns().map((c) => {
    const sums: Record<string, { total: number; count: number; reverse: boolean; label: string }> = {};
    for (const r of BEHAVIOUR_RUBRIC) {
      sums[r.id] = { total: 0, count: 0, reverse: r.reverse, label: r.label };
    }
    for (const s of c.students) {
      if (s.absent) continue;
      for (const [k, v] of Object.entries(s.ratings)) {
        if (typeof v !== "number") continue;
        const slot = sums[k];
        if (slot) {
          // for reverse-scored items higher = worse, so we keep raw and flip when ranking
          slot.total += v;
          slot.count += 1;
        }
      }
    }
    // Worst = lowest avg for positive items, highest avg for reverse items.
    let worst: BehaviourInsight["worstBehaviour"] = { id: "sustained", label: "Sustained attention", avg: 5 };
    let worstScore = -Infinity; // higher worstScore = worse
    for (const [k, slot] of Object.entries(sums)) {
      if (slot.count === 0) continue;
      const avg = slot.total / slot.count;
      const score = slot.reverse ? avg : 5 - avg;
      if (score > worstScore) {
        worstScore = score;
        worst = { id: k as BehaviourKey, label: slot.label, avg: Math.round(avg * 10) / 10 };
      }
    }
    const behaviourMins = midLostMins(c.behaviourMins);
    return {
      classId: c.id,
      classLabel: `${c.grade}${c.section ?? ""} · ${c.subject}`,
      worstBehaviour: worst,
      estimatedMinsRecovered: Math.round(behaviourMins * 0.6 * 10) / 10,
    };
  });
}

export function newCheckInId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ───── Period-over-period cohort comparison ─────

export type CohortWindow = "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

/** Inclusive ISO date range (YYYY-MM-DD) for arbitrary time windows. */
export interface CohortDateRange {
  fromISO: string;
  toISO: string;
}

export type CohortRange = CohortWindow | CohortDateRange;

const WEEK_MS = 7 * 86400000;
const MONTH_MS = 30 * 86400000;

function isDateRange(r: CohortRange): r is CohortDateRange {
  return typeof r === "object" && r !== null && "fromISO" in r && "toISO" in r;
}

/** Inclusive day boundaries for a YYYY-MM-DD pair (local time). */
function rangeBounds(r: CohortDateRange): { start: number; end: number } {
  const start = new Date(`${r.fromISO}T00:00:00`).getTime();
  const end = new Date(`${r.toISO}T23:59:59.999`).getTime();
  return { start, end };
}

export function getCheckInsInWindow(window: CohortRange): ClassCheckIn[] {
  const now = Date.now();
  const all = listCheckIns();
  if (isDateRange(window)) {
    const { start, end } = rangeBounds(window);
    return all.filter((c) => {
      const t = +new Date(c.createdAt);
      return t >= start && t <= end;
    });
  }
  return all.filter((c) => {
    const age = now - +new Date(c.createdAt);
    switch (window) {
      case "thisWeek":
        return age <= WEEK_MS;
      case "lastWeek":
        return age > WEEK_MS && age <= 2 * WEEK_MS;
      case "thisMonth":
        return age <= MONTH_MS;
      case "lastMonth":
        return age > MONTH_MS && age <= 2 * MONTH_MS;
    }
  });
}

export interface CohortFrictionSummary {
  window: CohortRange;
  classes: number;
  avgBehaviourMins: number;
  avgTransitionMins: number;
  avgRepetitionMins: number;
  avgTotalLost: number;
  avgTeachingMins: number;
  rubric: CohortRubricAverage[];
}

export interface CohortFilter {
  subject?: Subject | "all";
  grade?: Grade | "all";
  /** When set and non-empty, only include check-ins whose classKey is in this list. */
  classKeys?: string[];
}

/** A stable identity for a "class roster" across check-ins. */
export function classKey(c: Pick<ClassCheckIn, "subject" | "grade" | "section" | "teacher">): string {
  return `${c.subject}__${c.grade}__${c.section ?? ""}__${c.teacher}`;
}

export interface CohortClassOption {
  key: string;
  label: string;
  subject: Subject;
  grade: Grade;
  section?: string;
  teacher: string;
  checkIns: number;
}

/** All distinct classes seen in stored check-ins, ranked by recency / frequency. */
export function listCohortClasses(): CohortClassOption[] {
  const map = new Map<string, CohortClassOption>();
  for (const c of listCheckIns()) {
    const k = classKey(c);
    const existing = map.get(k);
    if (existing) {
      existing.checkIns += 1;
    } else {
      map.set(k, {
        key: k,
        label: `${c.grade}${c.section ?? ""} · ${c.subject} · ${c.teacher}`,
        subject: c.subject,
        grade: c.grade,
        section: c.section,
        teacher: c.teacher,
        checkIns: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.checkIns - a.checkIns);
}

function applyCohortFilter(rows: ClassCheckIn[], filter?: CohortFilter): ClassCheckIn[] {
  if (!filter) return rows;
  return rows.filter((c) => {
    if (filter.subject && filter.subject !== "all" && c.subject !== filter.subject) return false;
    if (filter.grade && filter.grade !== "all" && c.grade !== filter.grade) return false;
    if (filter.classKeys && filter.classKeys.length > 0 && !filter.classKeys.includes(classKey(c)))
      return false;
    return true;
  });
}

export function getCohortFrictionSummary(
  window: CohortRange,
  filter?: CohortFilter,
): CohortFrictionSummary {
  const rows = applyCohortFilter(getCheckInsInWindow(window), filter);
  const n = rows.length || 1;
  const sumBeh = rows.reduce((a, c) => a + midLostMins(c.behaviourMins), 0);
  const sumTr = rows.reduce((a, c) => a + midLostMins(c.transitionMins), 0);
  const sumRep = rows.reduce((a, c) => a + Math.min(midCount(c.repetitions) * 0.5, 8), 0);
  const sumTeach = rows.reduce((a, c) => a + midTeachingMins(c.teachingMins), 0);
  const round1 = (v: number) => Math.round(v * 10) / 10;
  return {
    window,
    classes: rows.length,
    avgBehaviourMins: round1(sumBeh / n),
    avgTransitionMins: round1(sumTr / n),
    avgRepetitionMins: round1(sumRep / n),
    avgTotalLost: round1((sumBeh + sumTr + sumRep) / n),
    avgTeachingMins: round1(sumTeach / n),
    rubric: getCohortRubricAverages(rows),
  };
}

// ───── Student trend across check-ins ─────

export interface StudentRubricTrendPoint {
  date: string;
  label: string;
  avgScore: number; // 1..5, normalized so higher = better (reverse items inverted)
  ratedItems: number;
}

/** Returns chronological rubric points for a student across all check-ins they appear in. */
export function getStudentRubricTrend(studentId: string): StudentRubricTrendPoint[] {
  const points: StudentRubricTrendPoint[] = [];
  const sorted = listCheckIns()
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  for (const c of sorted) {
    const row = c.students.find((s) => s.studentId === studentId);
    if (!row || row.absent) continue;
    let total = 0;
    let count = 0;
    for (const r of BEHAVIOUR_RUBRIC) {
      const v = row.ratings[r.id];
      if (typeof v !== "number") continue;
      const range = r.max - r.min || 1;
      const norm = (v - r.min) / range; // 0..1
      const good = r.reverse ? 1 - norm : norm;
      total += good * 4 + 1; // back to 1..5 scale
      count += 1;
    }
    if (count === 0) continue;
    points.push({
      date: c.createdAt,
      label: new Date(c.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      avgScore: Math.round((total / count) * 10) / 10,
      ratedItems: count,
    });
  }
  return points;
}

// ───── Remedial action plan (rule-based) ─────

export interface RemedialStrategy {
  title: string;
  description: string;
  practiceSegment: string; // suggested Yellow exercise / classroom drill
}

const STRATEGY_LIBRARY: Record<BehaviourKey, RemedialStrategy[]> = {
  sustained: [
    {
      title: "10-minute focus sprints",
      description:
        "Break direct instruction into 10-min blocks separated by a 60-sec movement micro-break. Sustained attention recovers fastest with predictable rest cycles.",
      practiceSegment: "Neurogame · Sustained Attention Track (3×4 min)",
    },
    {
      title: "Visual progress anchor",
      description:
        "Display a simple bar that fills as the lesson progresses. Visible progress reduces drift in the back third of the class.",
      practiceSegment: "Classroom drill · Silent timer + checkpoint Q every 5 min",
    },
  ],
  onTask: [
    {
      title: "Task-card hand-off",
      description:
        "Give every student a 1-line task card before transitions. Eliminates the 'what am I doing now' gap that bleeds 2-3 min per switch.",
      practiceSegment: "Classroom drill · Task-card relay (5 min/day)",
    },
  ],
  completion: [
    {
      title: "Chunked checkpoints",
      description:
        "Split a 20-min task into 3 sub-tasks with a teacher tick after each. Completion rates climb sharply when finish lines are visible.",
      practiceSegment: "Worksheet practice · 3-checkpoint format",
    },
  ],
  interrupts: [
    {
      title: "Parking-lot signals",
      description:
        "Give each student two 'question chips' per lesson. Spent chips = wait. Cuts mid-instruction interruptions by ~60% in week one.",
      practiceSegment: "Classroom routine · Chip protocol (introduce in 5 min)",
    },
    {
      title: "Inhibitory control practice",
      description:
        "Daily 4-min Go/No-Go style game targets the impulse pathway behind blurted interruptions.",
      practiceSegment: "Neurogame · Inhibitory Control Track (4 min/day)",
    },
  ],
  multiStep: [
    {
      title: "Echo-back before start",
      description:
        "Have one student paraphrase the 3-step instruction back before any work begins. Drops repetition requests by half.",
      practiceSegment: "Classroom drill · Echo-back routine",
    },
    {
      title: "Working-memory loading",
      description:
        "Short n-back style sessions strengthen the capacity that multi-step instructions tax.",
      practiceSegment: "Neurogame · Working Memory Track (3×3 min)",
    },
  ],
  motor: [
    {
      title: "Movement gateway",
      description:
        "Insert a 60-sec gross-motor reset (stand, stretch, cross-body) before tasks needing stillness. Reduces fidget escalation.",
      practiceSegment: "Classroom routine · Cross-body reset (60 sec)",
    },
  ],
};

export interface RemedialPlanItem {
  behaviourId: BehaviourKey;
  behaviourLabel: string;
  reverse: boolean;
  severity: number; // 0..1, higher = worse
  estimatedMinsRecovered: number;
  strategies: RemedialStrategy[];
}

/**
 * Build a personalised remedial plan from cohort rubric averages.
 * Ranks behaviours by severity (reverse-aware) and emits matched strategies.
 */
export function buildRemedialPlan(
  rubric: CohortRubricAverage[],
  avgBehaviourMins: number,
  topN = 3,
): RemedialPlanItem[] {
  const ranked = rubric
    .filter((r) => r.count > 0)
    .map((r) => {
      const range = r.max - r.min || 1;
      const norm = (r.avg - r.min) / range; // 0..1
      const severity = r.reverse ? norm : 1 - norm; // higher = worse
      return { r, severity };
    })
    .sort((a, b) => b.severity - a.severity)
    .slice(0, topN);

  const totalSeverity = ranked.reduce((a, x) => a + x.severity, 0) || 1;
  // Roughly 60% of behaviour-loss minutes are recoverable; distribute by severity weight.
  const recoveryPool = avgBehaviourMins * 0.6;

  return ranked.map(({ r, severity }) => ({
    behaviourId: r.id,
    behaviourLabel: r.label,
    reverse: r.reverse,
    severity: Math.round(severity * 100) / 100,
    estimatedMinsRecovered: Math.round(((severity / totalSeverity) * recoveryPool) * 10) / 10,
    strategies: STRATEGY_LIBRARY[r.id] ?? [],
  }));
}

// ───── Remedial outcomes (teacher-logged "I tried this") ─────

export type RemedialOutcomeResult = "worked" | "partial" | "no_change";

export interface RemedialOutcome {
  id: string;
  behaviourId: BehaviourKey;
  strategyTitle: string;
  studentIds: string[]; // empty = whole-class
  subject?: Subject;
  grade?: Grade;
  result: RemedialOutcomeResult;
  note?: string;
  createdAt: string;
}

const OUTCOMES_KEY = "attentionhero.remedial.outcomes.v1";

export function listRemedialOutcomes(): RemedialOutcome[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(OUTCOMES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RemedialOutcome[];
  } catch {
    return [];
  }
}

export function saveRemedialOutcome(o: RemedialOutcome) {
  if (!isBrowser()) return;
  const all = listRemedialOutcomes();
  const idx = all.findIndex((x) => x.id === o.id);
  if (idx >= 0) all[idx] = o;
  else all.unshift(o);
  window.localStorage.setItem(OUTCOMES_KEY, JSON.stringify(all));
}

export function deleteRemedialOutcome(id: string) {
  if (!isBrowser()) return;
  const all = listRemedialOutcomes().filter((o) => o.id !== id);
  window.localStorage.setItem(OUTCOMES_KEY, JSON.stringify(all));
}

export function getOutcomesForStrategy(
  behaviourId: BehaviourKey,
  strategyTitle: string,
): RemedialOutcome[] {
  return listRemedialOutcomes()
    .filter((o) => o.behaviourId === behaviourId && o.strategyTitle === strategyTitle)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Roster of students seen in check-ins matching the given subject/grade (or all). */
export function getRosterForCohort(filter?: CohortFilter): { id: string; classes: number }[] {
  const rows = applyCohortFilter(listCheckIns(), filter);
  const counts = new Map<string, number>();
  for (const c of rows) {
    for (const s of c.students) {
      counts.set(s.studentId, (counts.get(s.studentId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, classes]) => ({ id, classes }))
    .sort((a, b) => b.classes - a.classes);
}

export function newRemedialOutcomeId() {
  return `ro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
