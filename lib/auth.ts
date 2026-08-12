// Lightweight mock auth for the dashboard demo.
// Replace with Lovable Cloud auth when wiring real backend.

const KEY = "ah_teacher_session";

export type UserRole = "teacher" | "admin" | "specialEducator" | "district" | "selCoordinator";

export type TeacherSession = {
  email: string;
  name: string;
  initials: string;
  role?: UserRole; // optional for backwards compat — older sessions default to "teacher"
};

export function getSession(): TeacherSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TeacherSession) : null;
  } catch {
    return null;
  }
}

export function signIn(
  email: string,
  password: string,
  role: UserRole = "teacher",
): TeacherSession {
  if (!email || !password || password.length < 4) {
    throw new Error("Please enter a valid email and password (min 4 characters).");
  }
  const namePart = email.split("@")[0].replace(/[._-]+/g, " ");
  const fallback =
    role === "admin"
      ? "School Admin"
      : role === "specialEducator"
        ? "Special Educator"
        : role === "district"
          ? "District Leader"
          : role === "selCoordinator"
            ? "SEL Coordinator"
            : "Teacher";
  const name = namePart
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ") || fallback;
  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    (role === "admin"
      ? "SA"
      : role === "specialEducator"
        ? "SE"
        : role === "district"
          ? "DL"
          : role === "selCoordinator"
            ? "SC"
            : "T");
  const session: TeacherSession = { email, name, initials, role };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function getRole(): UserRole {
  return getSession()?.role ?? "teacher";
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}

export function isSpecialEducator(): boolean {
  return getRole() === "specialEducator";
}

export function isSelCoordinator(): boolean {
  return getRole() === "selCoordinator";
}
