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
  tourCompleted?: boolean;
  checklistDismissed?: boolean;
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

export function completeSchoolTour(): SchoolOnboardingState {
  return setSchoolOnboarding({ tourCompleted: true });
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
