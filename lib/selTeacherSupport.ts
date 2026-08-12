// Teacher Implementation & Support — Tool 6. The coordinator's role isn't
// only monitoring students; it's enabling teachers to deliver SEL
// consistently. Builds directly on Tool 3's real classroom-implementation
// rows (classroomImplementationRows()), aggregated up to the teacher level
// — the same 3 real staff names (`coach` in data/mockData.ts) already used
// as the honest Teacher substitute elsewhere in this app.
//
// Teacher requests and strategy follow-ups are localStorage-backed seed
// data — no request/coaching-log model exists anywhere yet — following
// the same isolated, documented convention as this app's other seed
// modules (lib/selPulse.ts, lib/specialEdPlaceholderData.ts).

import { classroomImplementationRows, type ClassroomImplementation } from "@/lib/selImplementation";
import type { SelActionItem } from "@/lib/selPulse";

export const TEACHER_SUPPORT_CATEGORIES = [
  "Managing classroom emotions",
  "Strategies for peer conflict",
  "Supporting difficult transitions",
  "SEL routines and consistency",
  "Student participation in SEL activities",
] as const;
export type TeacherSupportCategory = (typeof TEACHER_SUPPORT_CATEGORIES)[number];

export type RequestStatus = "open" | "awaiting-coordinator" | "resolved";

export type TeacherRequest = {
  id: string;
  teacher: string;
  category: TeacherSupportCategory;
  note: string;
  status: RequestStatus;
  createdAt: string;
};

export type FollowUpStatus = "awaiting-feedback" | "completed";

export type StrategyFollowUp = {
  id: string;
  teacher: string;
  classroom: string;
  strategy: string;
  assignedAt: string;
  status: FollowUpStatus;
};

const REQUESTS_KEY = "ah_sel_teacher_requests";
const REQUESTS_SEED_KEY = "ah_sel_teacher_requests_seeded_v1";
const FOLLOWUPS_KEY = "ah_sel_strategy_followups";
const FOLLOWUPS_SEED_KEY = "ah_sel_strategy_followups_seeded_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seedRequests(): TeacherRequest[] {
  return [
    {
      id: "seed-req-1",
      teacher: "Ms. Priya Sharma",
      category: "Managing classroom emotions",
      note: "Looking for strategies for a student who shuts down after small frustrations.",
      status: "awaiting-coordinator",
      createdAt: daysAgo(4),
    },
    {
      id: "seed-req-2",
      teacher: "Mr. Arjun Mehta",
      category: "Strategies for peer conflict",
      note: "Recurring conflicts during group work this week.",
      status: "open",
      createdAt: daysAgo(2),
    },
    {
      id: "seed-req-3",
      teacher: "Mr. Arjun Mehta",
      category: "SEL routines and consistency",
      note: "Struggling to fit the weekly SEL activity into the schedule consistently.",
      status: "awaiting-coordinator",
      createdAt: daysAgo(6),
    },
    {
      id: "seed-req-4",
      teacher: "Ms. Riya Kapoor",
      category: "Supporting difficult transitions",
      note: "Resolved with a visual transition schedule.",
      status: "resolved",
      createdAt: daysAgo(15),
    },
  ];
}

function seedFollowUps(): StrategyFollowUp[] {
  return [
    {
      id: "seed-fu-1",
      teacher: "Ms. Priya Sharma",
      classroom: "3A",
      strategy: "Calming corner check-ins",
      assignedAt: daysAgo(9),
      status: "awaiting-feedback",
    },
    {
      id: "seed-fu-2",
      teacher: "Mr. Arjun Mehta",
      classroom: "3B",
      strategy: "Peer-mediated conflict script",
      assignedAt: daysAgo(7),
      status: "awaiting-feedback",
    },
    {
      id: "seed-fu-3",
      teacher: "Ms. Riya Kapoor",
      classroom: "4A",
      strategy: "Visual transition schedule",
      assignedAt: daysAgo(15),
      status: "completed",
    },
  ];
}

function ensureSeeded(key: string, seedKey: string, seed: () => unknown[]) {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(seedKey)) return;
  window.localStorage.setItem(key, JSON.stringify(seed()));
  window.localStorage.setItem(seedKey, "1");
}

export function getTeacherRequests(): TeacherRequest[] {
  if (!isBrowser()) return seedRequests();
  ensureSeeded(REQUESTS_KEY, REQUESTS_SEED_KEY, seedRequests);
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as TeacherRequest[]) : [];
  } catch {
    return [];
  }
}

function writeRequests(requests: TeacherRequest[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent("ah-sel-teacher-request-change"));
}

export function resolveRequest(id: string) {
  writeRequests(getTeacherRequests().map((r) => (r.id === id ? { ...r, status: "resolved" as RequestStatus } : r)));
}

export function getStrategyFollowUps(): StrategyFollowUp[] {
  if (!isBrowser()) return seedFollowUps();
  ensureSeeded(FOLLOWUPS_KEY, FOLLOWUPS_SEED_KEY, seedFollowUps);
  try {
    const raw = window.localStorage.getItem(FOLLOWUPS_KEY);
    return raw ? (JSON.parse(raw) as StrategyFollowUp[]) : [];
  } catch {
    return [];
  }
}

function writeFollowUps(followUps: StrategyFollowUp[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps));
  window.dispatchEvent(new CustomEvent("ah-sel-followup-change"));
}

export function requestFollowUp(teacher: string, classroom: string, strategy: string) {
  const followUp: StrategyFollowUp = {
    id: `followup-${Date.now()}`,
    teacher,
    classroom,
    strategy,
    assignedAt: new Date().toISOString(),
    status: "awaiting-feedback",
  };
  writeFollowUps([followUp, ...getStrategyFollowUps()]);
}

export function markFollowUpComplete(id: string) {
  writeFollowUps(getStrategyFollowUps().map((f) => (f.id === id ? { ...f, status: "completed" as FollowUpStatus } : f)));
}

/* ─────────────────────────────────────────────────────────
 * L1 — Teacher Implementation Distribution
 * ───────────────────────────────────────────────────────── */

export type TeacherImplementationStatus = "on-track" | "needs-support" | "low-implementation";

export const TEACHER_STATUS_LABEL: Record<TeacherImplementationStatus, string> = {
  "on-track": "On Track",
  "needs-support": "Needs Support",
  "low-implementation": "Low Implementation",
};

export const TEACHER_STATUS_TONE: Record<TeacherImplementationStatus, string> = {
  "on-track": "hsl(142 55% 45%)",
  "needs-support": "hsl(38 92% 48%)",
  "low-implementation": "hsl(0 78% 56%)",
};

export type TeacherImplementation = {
  teacher: string;
  classrooms: string[];
  completionPct: number;
  hasOpenRequest: boolean;
  status: TeacherImplementationStatus;
};

function statusFromPct(pct: number): TeacherImplementationStatus {
  if (pct >= 90) return "on-track";
  if (pct >= 60) return "needs-support";
  return "low-implementation";
}

export function teacherImplementationDistribution(
  requests: TeacherRequest[],
  rows: ClassroomImplementation[] = classroomImplementationRows(),
): TeacherImplementation[] {
  const teachers = Array.from(new Set(rows.map((r) => r.teacher)));
  const openTeachers = new Set(requests.filter((r) => r.status !== "resolved").map((r) => r.teacher));

  return teachers.map((teacher) => {
    const teacherRows = rows.filter((r) => r.teacher === teacher);
    const planned = teacherRows.reduce((a, r) => a + r.planned, 0);
    const completed = teacherRows.reduce((a, r) => a + r.completed, 0);
    const completionPct = planned === 0 ? 0 : Math.round((completed / planned) * 100);
    const hasOpenRequest = openTeachers.has(teacher);
    let status = statusFromPct(completionPct);
    // An open request bumps On Track up to at least Needs Support — a
    // teacher actively asking for help isn't "on track" regardless of
    // their raw completion number.
    if (hasOpenRequest && status === "on-track") status = "needs-support";
    return { teacher, classrooms: teacherRows.map((r) => r.classroom), completionPct, hasOpenRequest, status };
  });
}

export type TeacherDistributionSummary = Record<TeacherImplementationStatus, number>;

export function teacherDistributionSummary(distribution: TeacherImplementation[]): TeacherDistributionSummary {
  return {
    "on-track": distribution.filter((t) => t.status === "on-track").length,
    "needs-support": distribution.filter((t) => t.status === "needs-support").length,
    "low-implementation": distribution.filter((t) => t.status === "low-implementation").length,
  };
}

/* ─────────────────────────────────────────────────────────
 * L2.1 — Open Teacher Requests
 * ───────────────────────────────────────────────────────── */

export type OpenRequestsSummary = { openCount: number; awaitingCoordinator: number };

export function openTeacherRequestsSummary(requests: TeacherRequest[]): OpenRequestsSummary {
  return {
    openCount: requests.filter((r) => r.status !== "resolved").length,
    awaitingCoordinator: requests.filter((r) => r.status === "awaiting-coordinator").length,
  };
}

/* ─────────────────────────────────────────────────────────
 * L2.2 — Top Teacher Support Needs
 * ───────────────────────────────────────────────────────── */

export type SupportNeedTally = { category: TeacherSupportCategory; count: number };

/** Real tally of open requests per category — the 5 category labels are
 * fixed by the spec, but which ones actually rank highest is computed from
 * real request records, not a hardcoded order. */
export function topTeacherSupportNeeds(requests: TeacherRequest[]): SupportNeedTally[] {
  const open = requests.filter((r) => r.status !== "resolved");
  return TEACHER_SUPPORT_CATEGORIES.map((category) => ({
    category,
    count: open.filter((r) => r.category === category).length,
  })).sort((a, b) => b.count - a.count);
}

/* ─────────────────────────────────────────────────────────
 * L2.3 — Strategy Follow-Ups
 * ───────────────────────────────────────────────────────── */

export function followUpsAwaitingFeedback(followUps: StrategyFollowUp[]): StrategyFollowUp[] {
  return followUps.filter((f) => f.status === "awaiting-feedback");
}

/** Feeds the dashboard's Action Hub — requests waiting on the coordinator,
 * and any teacher who's dropped to Low Implementation. */
export function buildTeacherSupportActionItems(
  requests: TeacherRequest[],
  distribution: TeacherImplementation[],
): SelActionItem[] {
  const items: SelActionItem[] = [];
  const { awaitingCoordinator } = openTeacherRequestsSummary(requests);
  if (awaitingCoordinator > 0) {
    items.push({
      id: "teacher-requests-awaiting",
      priority: "medium",
      action: `Respond to ${awaitingCoordinator} teacher request${awaitingCoordinator === 1 ? "" : "s"}`,
      whyItMatters: "These teachers are waiting on a coordinator response.",
      related: "Open teacher requests",
      ctaLabel: "Review requests",
      href: "/sel/teachers",
    });
  }
  const low = distribution.filter((t) => t.status === "low-implementation");
  if (low.length > 0) {
    items.push({
      id: "teachers-low-implementation",
      priority: "high",
      action: `Support ${low.length} teacher${low.length === 1 ? "" : "s"} with low SEL implementation`,
      whyItMatters: `${low.map((t) => t.teacher).join(", ")} ${low.length === 1 ? "is" : "are"} below the implementation bar this month.`,
      related: low.map((t) => t.teacher).join(", "),
      ctaLabel: "Support teacher",
      href: "/sel/teachers",
    });
  }
  return items;
}
