// Whether the teacher has agreed to classroom recording — asked once,
// before the very first recording, and reviewable/revocable from Settings
// afterward. Same localStorage + custom-event pattern as checkInTools.ts.

const KEY = "ah_recording_consent";
const EVENT = "ah-recording-consent-change";

type ConsentRecord = { granted: boolean; grantedAt?: string };

function read(): ConsentRecord {
  if (typeof window === "undefined") return { granted: false };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { granted: false };
    return JSON.parse(raw) as ConsentRecord;
  } catch {
    return { granted: false };
  }
}

export function hasRecordingConsent(): boolean {
  return read().granted;
}

export function getRecordingConsent(): ConsentRecord {
  return read();
}

export function setRecordingConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  const payload: ConsentRecord = granted
    ? { granted: true, grantedAt: new Date().toISOString() }
    : { granted: false };
  window.localStorage.setItem(KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(EVENT));
}
