// Session-only overrides for student risk + intervention tags + notes + contact log.
import { useSyncExternalStore } from "react";
import type { RiskLevel } from "@/data/mockData";

export interface StudentNote {
  id: string;
  category: string;
  body: string;
  tag?: string;
  sharedWithParent: boolean;
  createdAt: string;
}

export interface StudentContact {
  id: string;
  channel: "call" | "whatsapp" | "email";
  template?: string;
  createdAt: string;
}

export interface StudentOverride {
  riskOverride?: RiskLevel;
  tags: { label: string; addedAt: string }[];
  notes: StudentNote[];
  contacts: StudentContact[];
}

const EMPTY: StudentOverride = { tags: [], notes: [], contacts: [] };

const store = new Map<string, StudentOverride>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function ensure(id: string): StudentOverride {
  return store.get(id) ?? { tags: [], notes: [], contacts: [] };
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getOverrides(id: string): StudentOverride {
  return store.get(id) ?? EMPTY;
}

export function setRisk(id: string, risk: RiskLevel | undefined) {
  store.set(id, { ...ensure(id), riskOverride: risk });
  emit();
}

export function addTag(id: string, label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  const cur = ensure(id);
  if (cur.tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) return;
  store.set(id, {
    ...cur,
    tags: [...cur.tags, { label: trimmed, addedAt: new Date().toISOString() }],
  });
  emit();
}

export function removeTag(id: string, label: string) {
  const cur = store.get(id);
  if (!cur) return;
  store.set(id, { ...cur, tags: cur.tags.filter((t) => t.label !== label) });
  emit();
}

export function bulkSetRisk(ids: string[], risk: RiskLevel) {
  ids.forEach((id) => store.set(id, { ...ensure(id), riskOverride: risk }));
  emit();
}

export function bulkAddTag(ids: string[], label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  const stamp = new Date().toISOString();
  ids.forEach((id) => {
    const cur = ensure(id);
    if (cur.tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) return;
    store.set(id, { ...cur, tags: [...cur.tags, { label: trimmed, addedAt: stamp }] });
  });
  emit();
}

export function addNote(id: string, payload: Omit<StudentNote, "id" | "createdAt">) {
  const cur = ensure(id);
  const note: StudentNote = {
    ...payload,
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  store.set(id, { ...cur, notes: [note, ...cur.notes] });
  emit();
}

export function removeNote(id: string, noteId: string) {
  const cur = store.get(id);
  if (!cur) return;
  store.set(id, { ...cur, notes: cur.notes.filter((n) => n.id !== noteId) });
  emit();
}

export function logContact(id: string, payload: Omit<StudentContact, "id" | "createdAt">) {
  const cur = ensure(id);
  const entry: StudentContact = {
    ...payload,
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  store.set(id, { ...cur, contacts: [entry, ...cur.contacts] });
  emit();
}

function getVersion() {
  return version;
}

export function useStudentOverrides(id?: string) {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  if (!id) return EMPTY;
  return getOverrides(id);
}

export function useOverridesVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export const PRESET_TAGS = [
  "Energy Break",
  "1:1 Check-in",
  "Sustained Attention Game",
  "Parent Contact",
  "Visual Recap",
  "Group Activity",
];

export const NOTE_CATEGORIES = ["Behavior", "Focus", "Social", "Academic", "Parent contact", "Other"];
