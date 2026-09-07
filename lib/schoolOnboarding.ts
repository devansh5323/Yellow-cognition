// School-admin onboarding state. Mirrors lib/onboarding.ts pattern.
// localStorage-backed, event-emitting. Replace with backend later.

const KEY = "ah_school_onboarding";

export type SchoolType = "public" | "private" | "charter" | "international" | "religious" | "other";

export type SchoolProfile = {
  schoolName: string;
  schoolType: SchoolType;
  city: string;
  country: string;
  totalStudents: number;
  totalTeachers: number;
};

export type SchoolStructure = {
  gradeLevels: string[]; // e.g., ["K", "1", "2", "3", "4", "5"]
  sectionsPerGrade: number;
  hasMultipleCampuses: boolean;
};

export type SchoolPriority =
  | "at-risk"
  | "attendance"
  | "parent-engagement"
  | "teacher-pd"
  | "wellbeing"
  | "academic-growth";

export type SchoolActivationTaskId =
  | "invite-teachers"
  | "review-digest"
  | "set-thresholds"
  | "configure-parent-comms"
  | "schedule-report";

export type SchoolOnboardingState = {
  completed: boolean;
  completedAt?: number;
  profile?: SchoolProfile;
  structure?: SchoolStructure;
  priorities: SchoolPriority[];
  tasks: Record<SchoolActivationTaskId, boolean>;
  checklistDismissed?: boolean;
  /** Whether the "You're all set" milestone screen has already been shown —
   * shows once, the first time computeSchoolFtueStage() reaches "done",
   * not on every subsequent visit. Mirrors lib/selOnboarding.ts's
   * milestoneSeen. */
  milestoneSeen?: boolean;
};

const DEFAULT_TASKS: Record<SchoolActivationTaskId, boolean> = {
  "invite-teachers": false,
  "review-digest": false,
  "set-thresholds": false,
  "configure-parent-comms": false,
  "schedule-report": false,
};

const DEFAULT_STATE: SchoolOnboardingState = {
  completed: false,
  priorities: [],
  tasks: { ...DEFAULT_TASKS },
};

export function getSchoolOnboarding(): SchoolOnboardingState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<SchoolOnboardingState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      tasks: { ...DEFAULT_TASKS, ...(parsed.tasks ?? {}) },
      priorities: parsed.priorities ?? [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function setSchoolOnboarding(
  next: Partial<SchoolOnboardingState>,
): SchoolOnboardingState {
  const current = getSchoolOnboarding();
  const merged: SchoolOnboardingState = {
    ...current,
    ...next,
    tasks: { ...current.tasks, ...(next.tasks ?? {}) },
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("ah-school-onboarding-change"));
  }
  return merged;
}

export function completeSchoolOnboarding(): SchoolOnboardingState {
  return setSchoolOnboarding({ completed: true, completedAt: Date.now() });
}

export function markSchoolTaskDone(id: SchoolActivationTaskId): SchoolOnboardingState {
  const current = getSchoolOnboarding();
  if (current.tasks[id]) return current;
  return setSchoolOnboarding({ tasks: { ...current.tasks, [id]: true } });
}

export function dismissSchoolChecklist(): SchoolOnboardingState {
  return setSchoolOnboarding({ checklistDismissed: true });
}

export function markSchoolMilestoneSeen(): SchoolOnboardingState {
  return setSchoolOnboarding({ milestoneSeen: true });
}

export function resetSchoolOnboarding(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("ah-school-onboarding-change"));
}

export function isSchoolOnboarded(): boolean {
  return getSchoolOnboarding().completed;
}

export function schoolTasksCompletedCount(state: SchoolOnboardingState): {
  done: number;
  total: number;
} {
  const entries = Object.values(state.tasks);
  return { done: entries.filter(Boolean).length, total: entries.length };
}

// Dashboard FTUE progression — mirrors lib/onboarding.ts's FtueStage and
// lib/selOnboarding.ts's SelFtueStage pattern: one stage per real
// activation task, in the same order the checklist already presents them,
// so the guided tour and the checklist are two views onto the same real
// state rather than a separate "have you seen the tour" flag.
export type SchoolFtueStage = "invite" | "digest" | "thresholds" | "comms" | "report" | "done";

// Exported so callers (the dashboard's section-locking, the tour's
// "take me there" action) can look up which real task blocks a given
// stage instead of relying on array position matching between files.
export const SCHOOL_STAGE_TASK: Record<Exclude<SchoolFtueStage, "done">, SchoolActivationTaskId> = {
  invite: "invite-teachers",
  digest: "review-digest",
  thresholds: "set-thresholds",
  comms: "configure-parent-comms",
  report: "schedule-report",
};

export const SCHOOL_STAGE_ORDER: Exclude<SchoolFtueStage, "done">[] = [
  "invite",
  "digest",
  "thresholds",
  "comms",
  "report",
];

export function computeSchoolFtueStage(): SchoolFtueStage {
  const state = getSchoolOnboarding();
  for (const stage of SCHOOL_STAGE_ORDER) {
    if (!state.tasks[SCHOOL_STAGE_TASK[stage]]) return stage;
  }
  return "done";
}

export function isSchoolFtueDone(): boolean {
  return computeSchoolFtueStage() === "done";
}
