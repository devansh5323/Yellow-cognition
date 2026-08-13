// Roster + invite tracking. Demo persistence via localStorage.
// Replace with backend when wiring real APIs.

import type { RosterMethod } from "@/lib/onboarding";
import { STUDENTS } from "@/data/mockData";

export type StudentStatus = "pending-invite" | "invited" | "active";

export type RosterStudent = {
  id: string;
  childName: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  status: StudentStatus;
  source: RosterMethod;
  addedAt: number;
  invitedAt?: number;
  activatedAt?: number;
};

export type InviteStats = {
  total: number;
  invited: number; // sent at least one invite (covers active too)
  active: number; // parent created profile / child logged in
  pending: number; // added but no invite sent yet
};

const KEY = "ah_roster";
// Bumped from `ah_roster_seeded` so existing demos pick up the larger seed
// that matches the dashboard's class roll (30 students: 24 linked, 4 invited,
// 2 not yet invited).
const SEEDED_KEY = "ah_roster_seeded_v2";

const DAY = 86_400_000;

const EXTRA_STUDENTS: { childName: string; parentName: string }[] = [
  { childName: "Vihaan Mehta", parentName: "Anjali Mehta" },
  { childName: "Aanya Verma", parentName: "Rakesh Verma" },
  { childName: "Reyansh Kapoor", parentName: "Sneha Kapoor" },
  { childName: "Saanvi Nair", parentName: "Lakshmi Nair" },
  { childName: "Arjun Banerjee", parentName: "Sourav Banerjee" },
  { childName: "Myra Joshi", parentName: "Pooja Joshi" },
];

function makeId(): string {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@parents.example`;
}

function phoneFor(idx: number): string {
  return `+91 98xxx ${String(100 + idx).slice(-3)}`;
}

function seedData(): RosterStudent[] {
  const now = Date.now();
  // Active = students whose data feeds the dashboard. Use the STUDENTS mock so
  // names line up with the class snapshot. Add 4 invited-but-not-active and
  // 2 pending-invite entries on top, totalling 30.
  const active: RosterStudent[] = STUDENTS.map((s, i) => {
    const childName = s.name;
    const parentName = `${s.name.split(" ")[0]}'s parent`;
    return {
      id: `seed_active_${s.id}`,
      childName,
      parentName,
      parentEmail: emailFor(childName.split(" ")[0]),
      parentPhone: phoneFor(i),
      status: "active",
      source: i % 3 === 0 ? "csv" : i % 3 === 1 ? "invite" : "manual",
      addedAt: now - (10 + i) * DAY,
      invitedAt: now - (9 + i) * DAY,
      activatedAt: now - (5 + (i % 4)) * DAY,
    };
  });

  const invited: RosterStudent[] = EXTRA_STUDENTS.slice(0, 4).map((e, i) => ({
    id: `seed_invited_${i + 1}`,
    childName: e.childName,
    parentName: e.parentName,
    parentEmail: emailFor(e.childName.split(" ")[0]),
    parentPhone: phoneFor(active.length + i),
    status: "invited",
    source: "invite",
    addedAt: now - (3 + i) * DAY,
    invitedAt: now - (2 + i) * DAY,
  }));

  const pending: RosterStudent[] = EXTRA_STUDENTS.slice(4, 6).map((e, i) => ({
    id: `seed_pending_${i + 1}`,
    childName: e.childName,
    parentName: e.parentName,
    parentEmail: emailFor(e.childName.split(" ")[0]),
    status: "pending-invite",
    source: "manual",
    addedAt: now - (1 + i) * DAY,
  }));

  return [...active, ...invited, ...pending];
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ah-roster-change"));
}

function read(): RosterStudent[] {
  if (typeof window === "undefined") return [];
  try {
    // If the seed version has bumped since this user last loaded, reseed so
    // the demo always reflects the current class roll. Once the SEEDED_KEY
    // flips to "1", the user can keep editing the roster freely afterwards.
    const seededAt = window.localStorage.getItem(SEEDED_KEY);
    if (seededAt !== "1") {
      const seed = seedData();
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      window.localStorage.setItem(SEEDED_KEY, "1");
      return seed;
    }
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as RosterStudent[];
    return [];
  } catch {
    return [];
  }
}

function write(list: RosterStudent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

export function getRoster(): RosterStudent[] {
  return read();
}

export type StudentInput = {
  childName: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  source: RosterMethod;
};

export function addStudent(
  input: StudentInput,
  options: { sendInvite?: boolean } = {},
): RosterStudent {
  const list = read();
  const now = Date.now();
  const willInvite = options.sendInvite && (input.parentEmail || input.parentPhone);
  const next: RosterStudent = {
    id: makeId(),
    childName: input.childName.trim(),
    parentName: input.parentName?.trim() || undefined,
    parentEmail: input.parentEmail?.trim() || undefined,
    parentPhone: input.parentPhone?.trim() || undefined,
    status: willInvite ? "invited" : "pending-invite",
    source: input.source,
    addedAt: now,
    invitedAt: willInvite ? now : undefined,
  };
  write([next, ...list]);
  return next;
}

export function bulkAdd(
  inputs: StudentInput[],
  options: { sendInvite?: boolean } = {},
): RosterStudent[] {
  const list = read();
  const now = Date.now();
  const willInvite = options.sendInvite ?? false;
  const created: RosterStudent[] = inputs.map((input) => {
    const canInvite = willInvite && (input.parentEmail || input.parentPhone);
    return {
      id: makeId(),
      childName: input.childName.trim(),
      parentName: input.parentName?.trim() || undefined,
      parentEmail: input.parentEmail?.trim() || undefined,
      parentPhone: input.parentPhone?.trim() || undefined,
      status: canInvite ? "invited" : "pending-invite",
      source: input.source,
      addedAt: now,
      invitedAt: canInvite ? now : undefined,
    };
  });
  write([...created, ...list]);
  return created;
}

export function sendInvite(id: string): RosterStudent | null {
  const list = read();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const now = Date.now();
  const next: RosterStudent = {
    ...list[idx],
    status: list[idx].status === "active" ? "active" : "invited",
    invitedAt: now,
  };
  const out = [...list];
  out[idx] = next;
  write(out);
  return next;
}

export function sendAllPendingInvites(): number {
  const list = read();
  const now = Date.now();
  let count = 0;
  const out = list.map((s) => {
    if (s.status === "pending-invite" && (s.parentEmail || s.parentPhone)) {
      count++;
      return { ...s, status: "invited" as StudentStatus, invitedAt: now };
    }
    return s;
  });
  if (count > 0) write(out);
  return count;
}

// Nudges everyone who hasn't activated Fumi yet — covers both "never
// invited" (pending-invite) and "invited but no response" (invited),
// unlike sendAllPendingInvites() which only covers the former.
export function sendReminders(): number {
  const list = read();
  const now = Date.now();
  let count = 0;
  const out = list.map((s) => {
    if (s.status !== "active" && (s.parentEmail || s.parentPhone)) {
      count++;
      return { ...s, status: "invited" as StudentStatus, invitedAt: now };
    }
    return s;
  });
  if (count > 0) write(out);
  return count;
}

export function simulateLogin(id: string): RosterStudent | null {
  const list = read();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const now = Date.now();
  const next: RosterStudent = {
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

export function removeStudent(id: string): void {
  const list = read();
  write(list.filter((s) => s.id !== id));
}

export function clearRoster(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function getStats(list?: RosterStudent[]): InviteStats {
  const arr = list ?? read();
  return {
    total: arr.length,
    invited: arr.filter((s) => s.status !== "pending-invite").length,
    active: arr.filter((s) => s.status === "active").length,
    pending: arr.filter((s) => s.status === "pending-invite").length,
  };
}
