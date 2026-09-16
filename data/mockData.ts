// Real student data for the Yellow Teacher Dashboard.
// `STUDENTS` is the first real-data batch (16 students, Bishop Cottons) — see
// data/realStudents.ts for the source-of-truth values and provenance. The
// prior 24-student synthetic mock roster (and every helper that only existed
// to serve its gameplay-signal fields — pfi/csi/subDomains/ksa/indicators/
// subjects/sessions/history/monthly/attention-domains) has been removed
// rather than kept alongside, since those fields have no real equivalent and
// silently falling back to synthetic data would misrepresent real, named
// students.

import { REAL_STUDENTS, type RealStudent } from "@/data/realStudents";

export type Student = RealStudent;

export const STUDENTS: Student[] = REAL_STUDENTS;

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

// ─────────────────────────────────────────────────────────────
// Instructional Friction — teacher check-in types & seed data.
// Independent of the Student roster's score fields (a check-in only
// attaches per-student behaviour *ratings* the teacher enters live, keyed by
// student id) — unaffected by the real-data switch beyond the id list.
// ─────────────────────────────────────────────────────────────

export const SUBJECTS = ["Math", "Science", "English", "Social", "Hindi"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
] as const;
export type Grade = (typeof GRADES)[number];

export const CLASS_SIZE_BUCKETS = ["1-10", "11-20", ">20"] as const;
export type ClassSizeBucket = (typeof CLASS_SIZE_BUCKETS)[number];

export const TEACHING_MIN_BUCKETS = ["<20", "20-25", "30-35", "40+"] as const;
export type TeachingMinBucket = (typeof TEACHING_MIN_BUCKETS)[number];

export const LOST_MIN_BUCKETS = ["<2", "2-5", "6-10", "10-15", ">15"] as const;
export type LostMinBucket = (typeof LOST_MIN_BUCKETS)[number];

export const COUNT_BUCKETS = ["<3", "3-5", "5-10", ">10"] as const;
export type CountBucket = (typeof COUNT_BUCKETS)[number];

// Midpoint helpers — convert tap-only buckets to numeric estimates.
export function midTeachingMins(b: TeachingMinBucket): number {
  return { "<20": 18, "20-25": 22, "30-35": 32, "40+": 42 }[b];
}
export function midLostMins(b: LostMinBucket): number {
  return { "<2": 1, "2-5": 3.5, "6-10": 8, "10-15": 12.5, ">15": 18 }[b];
}
export function midCount(b: CountBucket): number {
  return { "<3": 2, "3-5": 4, "5-10": 7.5, ">10": 12 }[b];
}

export const BEHAVIOUR_RUBRIC = [
  { id: "sustained", label: "Sustained attention", reverse: false, min: 1, max: 5 },
  { id: "onTask", label: "Stays on task", reverse: false, min: 1, max: 5 },
  { id: "completion", label: "Task completion", reverse: false, min: 1, max: 5 },
  { id: "interrupts", label: "Interrupts class", reverse: true, min: 1, max: 5 },
  { id: "multiStep", label: "Follows multi-step instructions", reverse: false, min: 1, max: 5 },
  { id: "motor", label: "Motor regulation", reverse: true, min: 0, max: 5 },
] as const;

export type BehaviourKey = (typeof BEHAVIOUR_RUBRIC)[number]["id"];

export interface StudentBehaviourRating {
  studentId: string;
  absent?: boolean;
  ratings: Partial<Record<BehaviourKey, number>>;
}

export interface ClassCheckIn {
  id: string;
  createdAt: string; // ISO
  teacher: string;
  grade: Grade;
  section?: string;
  subject: Subject;
  classSize: ClassSizeBucket;
  teachingMins: TeachingMinBucket;
  behaviourMins: LostMinBucket;
  transitionMins: LostMinBucket;
  disruptions: CountBucket;
  repetitions: CountBucket;
  students: StudentBehaviourRating[];
}

// Seed a few past check-ins so the friction page renders meaningfully on
// first load. Spaced at ~30-day intervals to reflect the monthly check-in
// cadence; the most recent seed sits within the last few days so the
// friction page's default window still has data to show. Slices sized for
// the current 16-student roster (was 24).
export const SEED_CHECKINS: ClassCheckIn[] = [
  {
    id: "seed-1",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "Math",
    classSize: ">20",
    teachingMins: "20-25",
    behaviourMins: "6-10",
    transitionMins: "2-5",
    disruptions: "5-10",
    repetitions: "5-10",
    students: STUDENTS.slice(0, 8).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 3) % 5) + 1,
        onTask: ((i * 2) % 5) + 1,
        completion: ((i * 5) % 5) + 1,
        interrupts: ((i * 7) % 5) + 1,
        multiStep: ((i * 11) % 5) + 1,
        motor: (i * 13) % 6,
      },
    })),
  },
  {
    id: "seed-2",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "English",
    classSize: ">20",
    teachingMins: "30-35",
    behaviourMins: "2-5",
    transitionMins: "<2",
    disruptions: "<3",
    repetitions: "3-5",
    students: STUDENTS.slice(0, 8).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 2) % 5) + 1,
        onTask: ((i * 4) % 5) + 1,
        completion: ((i * 6) % 5) + 1,
        interrupts: ((i * 3) % 5) + 1,
        multiStep: ((i * 9) % 5) + 1,
        motor: (i * 5) % 6,
      },
    })),
  },
  {
    id: "seed-3",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    teacher: "Arjun Mehta",
    grade: "Grade 4",
    section: "B",
    subject: "Math",
    classSize: ">20",
    teachingMins: "<20",
    behaviourMins: "10-15",
    transitionMins: "6-10",
    disruptions: ">10",
    repetitions: ">10",
    students: STUDENTS.slice(8, 16).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 7) % 5) + 1,
        onTask: ((i * 11) % 5) + 1,
        completion: ((i * 3) % 5) + 1,
        interrupts: ((i * 5) % 5) + 1,
        multiStep: ((i * 2) % 5) + 1,
        motor: (i * 4) % 6,
      },
    })),
  },
  {
    id: "seed-4",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "Math",
    classSize: ">20",
    teachingMins: "30-35",
    behaviourMins: "2-5",
    transitionMins: "<2",
    disruptions: "3-5",
    repetitions: "3-5",
    students: STUDENTS.slice(0, 8).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 3) % 5) + 2,
        onTask: ((i * 2) % 5) + 2,
        completion: ((i * 5) % 5) + 2,
        interrupts: ((i * 7) % 5) + 1,
        multiStep: ((i * 11) % 5) + 2,
        motor: (i * 13) % 5,
      },
    })),
  },
  {
    id: "seed-5",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    teacher: "Riya Kapoor",
    grade: "Grade 5",
    section: "A",
    subject: "Science",
    classSize: "11-20",
    teachingMins: "30-35",
    behaviourMins: "<2",
    transitionMins: "2-5",
    disruptions: "<3",
    repetitions: "<3",
    students: STUDENTS.slice(4, 12).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: 4,
        onTask: 4,
        completion: ((i * 2) % 3) + 3,
        interrupts: 2,
        multiStep: 4,
        motor: 1,
      },
    })),
  },
];

// ─────────────────────────────────────────────────────────────
// Dashboard notifications — small, hand-authored, and honestly derivable
// from the real roster (health-score extremes), not fabricated deltas.
// ─────────────────────────────────────────────────────────────

export type InboxItem = {
  id: string;
  kind: "at-risk" | "parent-reply" | "missed-session" | "anomaly" | "celebration";
  title: string;
  body: string;
  studentId?: string;
  time: string;
  priority: "high" | "medium" | "low";
};

const lowestHealth = [...STUDENTS].sort((a, b) => a.studentHealthScore - b.studentHealthScore)[0];
const highestHealth = [...STUDENTS].sort((a, b) => b.studentHealthScore - a.studentHealthScore)[0];

export const INBOX_ITEMS: InboxItem[] = [
  {
    id: "i1",
    kind: "at-risk",
    title: `${lowestHealth.name} — lowest health score in class`,
    body: `${Math.round(lowestHealth.studentHealthScore)}/100 this batch. Worth a closer look.`,
    studentId: lowestHealth.id,
    time: "8m",
    priority: "high",
  },
  {
    id: "i2",
    kind: "celebration",
    title: `🎉 ${highestHealth.name} — highest health score in class`,
    body: `${Math.round(highestHealth.studentHealthScore)}/100 this batch — best of the roster.`,
    studentId: highestHealth.id,
    time: "3h",
    priority: "low",
  },
];

