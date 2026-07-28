// Teacher-invite state for the school admin. Mirrors roster.ts but
// for the *teacher* cohort (the school's activation engine).

export type TeacherInviteMethod = "csv" | "google" | "manual" | "invite";
export type TeacherInviteStatus = "pending-invite" | "invited" | "active";

export type InvitedTeacher = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  subject?: string;
  status: TeacherInviteStatus;
  source: TeacherInviteMethod;
  addedAt: number;
  invitedAt?: number;
  activatedAt?: number;
};

export type TeacherInviteStats = {
  total: number;
  invited: number;
  active: number;
  pending: number;
};

const KEY = "ah_school_teacher_invites";
const SEEDED_KEY = "ah_school_teacher_invites_seeded";
const DAY = 86_400_000;

function id(): string {
  return `ti_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function seed(): InvitedTeacher[] {
  const now = Date.now();
  return [
    {
      id: "tseed_1",
      fullName: "Maya Khan",
      email: "maya.khan@school.edu",
      subject: "Math",
      status: "active",
      source: "manual",
      addedAt: now - 21 * DAY,
      invitedAt: now - 21 * DAY + 3600_000,
      activatedAt: now - 19 * DAY,
    },
    {
      id: "tseed_2",
      fullName: "Arjun Reddy",
      email: "arjun.reddy@school.edu",
      subject: "Science",
      status: "active",
      source: "google",
      addedAt: now - 18 * DAY,
      invitedAt: now - 18 * DAY,
      activatedAt: now - 16 * DAY,
    },
    {
      id: "tseed_3",
      fullName: "Priya Iyer",
      email: "priya.iyer@school.edu",
      subject: "ELA",
      status: "invited",
      source: "csv",
      addedAt: now - 4 * DAY,
      invitedAt: now - 4 * DAY,
    },
    {
      id: "tseed_4",
      fullName: "Karan Mehta",
      email: "karan.mehta@school.edu",
      subject: "Social Studies",
      status: "pending-invite",
      source: "manual",
      addedAt: now - 1 * DAY,
    },
  ];
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ah-teacher-invites-change"));
}

function read(): InvitedTeacher[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as InvitedTeacher[];
    if (!window.localStorage.getItem(SEEDED_KEY)) {
      const data = seed();
      window.localStorage.setItem(KEY, JSON.stringify(data));
      window.localStorage.setItem(SEEDED_KEY, "1");
      return data;
    }
    return [];
  } catch {
    return [];
  }
}

function write(list: InvitedTeacher[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

export function getInvitedTeachers(): InvitedTeacher[] {
  return read();
}

export type InvitedTeacherInput = {
  fullName: string;
  email?: string;
  phone?: string;
  subject?: string;
  source: TeacherInviteMethod;
};

export function addInvitedTeacher(
  input: InvitedTeacherInput,
  options: { sendInvite?: boolean } = {},
): InvitedTeacher {
  const list = read();
  const now = Date.now();
  const willInvite = options.sendInvite && (input.email || input.phone);
  const next: InvitedTeacher = {
    id: id(),
    fullName: input.fullName.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    subject: input.subject?.trim() || undefined,
    status: willInvite ? "invited" : "pending-invite",
    source: input.source,
    addedAt: now,
    invitedAt: willInvite ? now : undefined,
  };
  write([next, ...list]);
  return next;
}

export function bulkAddInvitedTeachers(
  inputs: InvitedTeacherInput[],
  options: { sendInvite?: boolean } = {},
): InvitedTeacher[] {
  const list = read();
  const now = Date.now();
  const send = options.sendInvite ?? false;
  const created: InvitedTeacher[] = inputs.map((input) => {
    const canInvite = send && (input.email || input.phone);
    return {
      id: id(),
      fullName: input.fullName.trim(),
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      subject: input.subject?.trim() || undefined,
      status: canInvite ? "invited" : "pending-invite",
      source: input.source,
      addedAt: now,
      invitedAt: canInvite ? now : undefined,
    };
  });
  write([...created, ...list]);
  return created;
}

export function sendTeacherInvite(idValue: string): InvitedTeacher | null {
  const list = read();
  const idx = list.findIndex((s) => s.id === idValue);
  if (idx < 0) return null;
  const now = Date.now();
  const next: InvitedTeacher = {
    ...list[idx],
    status: list[idx].status === "active" ? "active" : "invited",
    invitedAt: now,
  };
  const out = [...list];
  out[idx] = next;
  write(out);
  return next;
}

export function sendAllPendingTeacherInvites(): number {
  const list = read();
  const now = Date.now();
  let count = 0;
  const out = list.map((t) => {
    if (t.status === "pending-invite" && (t.email || t.phone)) {
      count++;
      return { ...t, status: "invited" as TeacherInviteStatus, invitedAt: now };
    }
    return t;
  });
  if (count > 0) write(out);
  return count;
}

export function simulateTeacherJoin(idValue: string): InvitedTeacher | null {
  const list = read();
  const idx = list.findIndex((s) => s.id === idValue);
  if (idx < 0) return null;
  const now = Date.now();
  const next: InvitedTeacher = {
    ...list[idx],
    status: "active",
    activatedAt: now,
    invitedAt: list[idx].invitedAt ?? now,
  };
  const out = [...list];
  out[idx] = next;
  write(out);
  return next;
}

export function removeInvitedTeacher(idValue: string): void {
  const list = read();
  write(list.filter((s) => s.id !== idValue));
}

export function clearTeacherInvites(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function getTeacherInviteStats(list?: InvitedTeacher[]): TeacherInviteStats {
  const arr = list ?? read();
  return {
    total: arr.length,
    invited: arr.filter((s) => s.status !== "pending-invite").length,
    active: arr.filter((s) => s.status === "active").length,
    pending: arr.filter((s) => s.status === "pending-invite").length,
  };
}
