// Lightweight onboarding state for the FTUE (mirror auth.ts pattern).
// Replace localStorage with real persistence when wiring backend.

const KEY = "ah_onboarding";

export type OnboardingProfile = {
  fullName: string;
  schoolName: string;
  yearsTeaching: number;
  board?: string;
};

export type RosterMethod = "csv" | "google" | "sample" | "manual" | "invite";

// A teacher can create more than one classroom during onboarding — grade,
// section, and subjects live per-classroom rather than as flat profile
// fields, since a teacher teaching Grade 3A Math and Grade 5B Science is
// two different subject/grade combinations, not one flat set of each.
export type OnboardingClassroom = {
  id: string;
  grade: string;
  section: string;
  subjects: string[];
  size: number;
  period: string;
  rosterMethod: RosterMethod;
  rosterReady: boolean;
};

// Matches the 7 driver-card keys in components/dashboard/DriverCards.tsx
// (4 Cognitive Performance + 3 Student Wellbeing) — the "Select focus area"
// FTUE step lets a teacher pick which driver matters most for their class.
export type OnboardingGoal =
  | "focus"
  | "academic"
  | "task"
  | "behavior"
  | "anxiety"
  | "peer-safety"
  | "frustration";

export type ActivationTaskId =
  | "first-checkin"
  | "read-insight"
  | "command-palette"
  | "parent-message"
  | "first-report"
  | "behavior-log"
  | "positive-log"
  | "review-health";

export type OnboardingState = {
  completed: boolean;
  completedAt?: number;
  profile?: OnboardingProfile;
  classrooms: OnboardingClassroom[];
  goals: OnboardingGoal[];
  tasks: Record<ActivationTaskId, boolean>;
  tourCompleted?: boolean;
  checklistDismissed?: boolean;
  /** Whether the classroom setup dialog has already auto-opened once on
   * dashboard landing — set the first time, so it doesn't force itself
   * open again on every later visit while classrooms is still empty. */
  classroomPromptShown?: boolean;
  /** The teacher's chosen focus area for the "three steps to get started"
   * checklist — set once from a fixed option list, changeable anytime. */
  focusArea?: OnboardingGoal;
  /** Whether the teacher has activated Fumi from the getting-started checklist. */
  fumiActivated?: boolean;
};

const DEFAULT_TASKS: Record<ActivationTaskId, boolean> = {
  "first-checkin": false,
  "read-insight": false,
  "command-palette": false,
  "parent-message": false,
  "first-report": false,
  "behavior-log": false,
  "positive-log": false,
  "review-health": false,
};

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  classrooms: [],
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
      classrooms: parsed.classrooms ?? [],
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
