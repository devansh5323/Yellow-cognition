// Lightweight onboarding state for the FTUE (mirror auth.ts pattern).
// Replace localStorage with real persistence when wiring backend.

const KEY = "ah_onboarding";

export type OnboardingProfile = {
  fullName: string;
  schoolName: string;
  yearsTeaching: number;
  gradeLevels: string[];
  subjects: string[];
};

export type RosterMethod = "csv" | "google" | "sample" | "manual" | "invite";

export type OnboardingClass = {
  name: string;
  period: string;
  size: number;
  rosterMethod: RosterMethod;
  rosterReady: boolean;
};

export type OnboardingGoal =
  | "focus"
  | "at-risk"
  | "parents"
  | "growth"
  | "behavior"
  | "wellbeing";

export type ActivationTaskId =
  | "first-checkin"
  | "read-insight"
  | "command-palette"
  | "parent-message"
  | "first-report";

export type OnboardingState = {
  completed: boolean;
  completedAt?: number;
  profile?: OnboardingProfile;
  primaryClass?: OnboardingClass;
  goals: OnboardingGoal[];
  tasks: Record<ActivationTaskId, boolean>;
  tourCompleted?: boolean;
  checklistDismissed?: boolean;
};

const DEFAULT_TASKS: Record<ActivationTaskId, boolean> = {
  "first-checkin": false,
  "read-insight": false,
  "command-palette": false,
  "parent-message": false,
  "first-report": false,
};

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  goals: [],
  tasks: { ...DEFAULT_TASKS },
};

export function getOnboarding(): OnboardingState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      tasks: { ...DEFAULT_TASKS, ...(parsed.tasks ?? {}) },
      goals: parsed.goals ?? [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function setOnboarding(next: Partial<OnboardingState>): OnboardingState {
  const current = getOnboarding();
  const merged: OnboardingState = {
    ...current,
    ...next,
    tasks: { ...current.tasks, ...(next.tasks ?? {}) },
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("ah-onboarding-change"));
  }
  return merged;
}

export function completeOnboarding(): OnboardingState {
  return setOnboarding({ completed: true, completedAt: Date.now() });
}

export function markTaskDone(id: ActivationTaskId): OnboardingState {
  const current = getOnboarding();
  if (current.tasks[id]) return current;
  return setOnboarding({ tasks: { ...current.tasks, [id]: true } });
}

export function dismissChecklist(): OnboardingState {
  return setOnboarding({ checklistDismissed: true });
}

export function completeTour(): OnboardingState {
  return setOnboarding({ tourCompleted: true });
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("ah-onboarding-change"));
}

export function isOnboarded(): boolean {
  return getOnboarding().completed;
}

export function tasksCompletedCount(state: OnboardingState): {
  done: number;
  total: number;
} {
  const entries = Object.values(state.tasks);
  return { done: entries.filter(Boolean).length, total: entries.length };
}
