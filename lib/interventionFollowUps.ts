// Tracks whether a recommended PBIS support was actually tried and whether it
// worked — closes the loop that classRiskRadar() otherwise leaves open (it
// re-flags the same student/reason forever since it's derived live from mock
// scores). Logging a follow-up here marks that specific flagged reason as
// addressed so it drops out of the pending queue.

import { classRiskRadar, RISK_INTERVENTIONS, type RiskReason, type Student } from "@/data/mockData";

export type ImplementationStatus =
  | "Not yet tried"
  | "Tried once"
  | "Tried a few times"
  | "Tried consistently";

export const IMPLEMENTATION_OPTIONS: ImplementationStatus[] = [
  "Not yet tried",
  "Tried once",
  "Tried a few times",
  "Tried consistently",
];

export type OutcomeStatus = "Improved" | "No change" | "Got worse" | "Too early to tell";

export const OUTCOME_OPTIONS: OutcomeStatus[] = [
  "Improved",
  "No change",
  "Got worse",
  "Too early to tell",
];

export type NextStep =
  | "Continue"
  | "Adjust strategy"
  | "Escalate to Tier 2"
  | "Escalate to Tier 3"
  | "Involve special educator"
  | "Close support";

export const NEXT_STEP_OPTIONS: NextStep[] = [
  "Continue",
  "Adjust strategy",
  "Escalate to Tier 2",
  "Escalate to Tier 3",
  "Involve special educator",
  "Close support",
];

export type FollowUpRecord = {
  id: string;
  studentId: string;
  reason: RiskReason;
  support: string;
  implementation: ImplementationStatus;
  outcome: OutcomeStatus;
  evidence: string;
  note?: string;
  nextStep: NextStep;
  createdAt: string;
};

const KEY = "ah_intervention_followups";
const EVENT = "ah-followup-change";

function readRecords(): FollowUpRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FollowUpRecord[]) : [];
  } catch {
    return [];
  }
}

function resolvedKey(studentId: string, reason: RiskReason): string {
  return `${studentId}::${reason}`;
}

export function getSupportOptions(reason: RiskReason): string[] {
  return RISK_INTERVENTIONS[reason];
}

export function logFollowUp(payload: Omit<FollowUpRecord, "id" | "createdAt">): FollowUpRecord {
  const record: FollowUpRecord = {
    ...payload,
    id: `fu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const list = readRecords();
  list.push(record);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT));
  }
  return record;
}

export function getFollowUpRecordsForStudent(studentId: string): FollowUpRecord[] {
  return readRecords()
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** True once a follow-up has been logged for this exact student + flagged reason. */
export function isAddressed(studentId: string, reason: RiskReason): boolean {
  const resolved = new Set(readRecords().map((r) => resolvedKey(r.studentId, r.reason)));
  return resolved.has(resolvedKey(studentId, reason));
}

export type PendingFollowUp = { student: Student; reason: RiskReason };

export function getPendingFollowUps(): PendingFollowUp[] {
  const resolved = new Set(readRecords().map((r) => resolvedKey(r.studentId, r.reason)));
  const pending: PendingFollowUp[] = [];
  for (const group of classRiskRadar()) {
    for (const student of group.students) {
      if (!resolved.has(resolvedKey(student.id, group.reason))) {
        pending.push({ student, reason: group.reason });
      }
    }
  }
  return pending;
}

export function getPendingFollowUpCount(): number {
  const ids = new Set(getPendingFollowUps().map((p) => p.student.id));
  return ids.size;
}
