// SEL Coordinator onboarding state. Mirrors lib/schoolOnboarding.ts pattern.
// localStorage-backed, event-emitting. Replace with backend later.

const KEY = "ah_sel_onboarding";

// The SEL portal is shared by a few adjacent roles at a school — all of
// them log in as "selCoordinator" (see lib/auth.ts) and land on the same
// dashboard, but this lets the person say which of the three they actually
// are for a personalized greeting, not a separate permission level.
export type SelPosition = "selCoordinator" | "counsellor" | "specialEducator";

export const SEL_POSITION_LABEL: Record<SelPosition, string> = {
  selCoordinator: "SEL Coordinator",
  counsellor: "School Counsellor",
  specialEducator: "Special Educator",
};

export type SelProfile = {
  fullName: string;
  position: SelPosition;
  primarySchool: string;
  /** Free-text labels only — no real per-school data model exists yet
   * (see components/sel/SelAppShell.tsx), so additional schools are just
   * noted for later rather than backed by their own dashboards today. */
  supportsMultipleSchools: boolean;
  additionalSchools: string[];
  grades: string[];
};

// The dashboard's "Action 1: Choose what you want to monitor" picker. Where
// an option corresponds to an existing lib/selPulse.ts SEL_COMPETENCIES
// entry, the exact same string is reused (matching casing) so a selection
// here can filter/highlight that same real signal elsewhere later, rather
// than being a subtly-different duplicate label. "Anxiety & Coping" and
// "Peer Safety & Belonging" have no exact match in that taxonomy today.
export const SEL_MONITOR_FOCUS_OPTIONS = [
  "Emotional regulation",
  "Anxiety & Coping",
  "Peer Safety & Belonging",
  "Peer relationships",
  "Student-Teacher Relationships",
] as const;

export type SelMonitorFocus = (typeof SEL_MONITOR_FOCUS_OPTIONS)[number];

// The dashboard's FTUE progression — mirrors lib/onboarding.ts's
// ActivationTaskId/computeFtueStage pattern exactly. Each id is only ever
// marked done from inside the real "create" action it represents
// (createPulse/createProgram/createGroup) — NOT derived from
// getPulses()/getGroups().length, since both of those auto-seed demo data
// on first read (see their ensureSeeded()), which would make the FTUE gate
// permanently "unlocked" even for a session that never did anything.
export type SelActivationTaskId = "first-pulse" | "first-program" | "first-group";

export type SelOnboardingState = {
  completed: boolean;
  completedAt?: number;
  profile?: SelProfile;
  /** Empty/undefined = the coordinator hasn't completed the dashboard's
   * "Choose what you want to monitor" action yet. */
  monitorFocus?: SelMonitorFocus[];
  tasks: Record<SelActivationTaskId, boolean>;
  /** Whether the "Your SEL dashboard is ready" milestone screen has already
   * been shown — shows once, the first time computeSelFtueStage() reaches
   * "done", not on every subsequent visit. */
  milestoneSeen?: boolean;
};

const DEFAULT_TASKS: Record<SelActivationTaskId, boolean> = {
  "first-pulse": false,
  "first-program": false,
  "first-group": false,
};

const DEFAULT_STATE: SelOnboardingState = { completed: false, tasks: { ...DEFAULT_TASKS } };

export function getSelOnboarding(): SelOnboardingState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<SelOnboardingState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      tasks: { ...DEFAULT_TASKS, ...(parsed.tasks ?? {}) },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function setSelOnboarding(next: Partial<SelOnboardingState>): SelOnboardingState {
  const current = getSelOnboarding();
  const merged: SelOnboardingState = {
    ...current,
    ...next,
    tasks: { ...current.tasks, ...(next.tasks ?? {}) },
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("ah-sel-onboarding-change"));
  }
  return merged;
}

export function completeSelOnboarding(): SelOnboardingState {
  return setSelOnboarding({ completed: true, completedAt: Date.now() });
}

export function isSelOnboarded(): boolean {
  return getSelOnboarding().completed;
}

export function markSelTaskDone(id: SelActivationTaskId): SelOnboardingState {
  const current = getSelOnboarding();
  if (current.tasks[id]) return current;
  return setSelOnboarding({ tasks: { ...current.tasks, [id]: true } });
}

export function markSelMilestoneSeen(): SelOnboardingState {
  return setSelOnboarding({ milestoneSeen: true });
}

// Dashboard FTUE progression: choose what to monitor → launch a pulse →
// set up a program → track targeted support → everything unlocked. Each
// stage's "done" condition is the real signal behind its snapshot tile's
// CTA, per the school-snapshot spec.
export type SelFtueStage = "monitor" | "pulse" | "program" | "group" | "done";

export function computeSelFtueStage(): SelFtueStage {
  const state = getSelOnboarding();
  if ((state.monitorFocus?.length ?? 0) === 0) return "monitor";
  if (!state.tasks["first-pulse"]) return "pulse";
  if (!state.tasks["first-program"]) return "program";
  if (!state.tasks["first-group"]) return "group";
  return "done";
}

export function isSelFtueDone(): boolean {
  return computeSelFtueStage() === "done";
}
