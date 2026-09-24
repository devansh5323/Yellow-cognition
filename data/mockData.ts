// Real student data for the Yellow Teacher Dashboard.
// `STUDENTS` is supplied by the active named demo dataset (Bishop Cotton
// School today) — see data/bishopCotton.ts and data/realStudents.ts for the
// source-of-truth values and provenance. The
// prior 24-student synthetic mock roster (and every helper that only existed
// to serve its gameplay-signal fields — pfi/csi/subDomains/ksa/indicators/
// subjects/sessions/history/monthly/attention-domains) has been removed
// rather than kept alongside, since those fields have no real equivalent and
// silently falling back to synthetic data would misrepresent real, named
// students.

import { activeDemoSchool } from "@/data/bishopCotton";
import type { RealStudent } from "@/data/realStudents";

export type Student = RealStudent;

export const DEMO_SCHOOL = activeDemoSchool;
export const STUDENTS: Student[] = activeDemoSchool.students;

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

// The source contains no historical classroom check-ins.
export const SEED_CHECKINS: ClassCheckIn[] = [];

// ─────────────────────────────────────────────────────────────
// The source contains no dated notification or activity records.
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

export const INBOX_ITEMS: InboxItem[] = [];
