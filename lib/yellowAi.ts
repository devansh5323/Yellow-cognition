import { STUDENTS, type Student } from "@/data/mockData";

export type NoteCategory = "Focus" | "Behavior" | "Task engagement" | "Learning" | "General";

export const NOTE_CATEGORY_OPTIONS: NoteCategory[] = [
  "Focus",
  "Behavior",
  "Task engagement",
  "Learning",
  "General",
];

export interface ExtractedNote {
  body: string;
  category: NoteCategory;
  suggestedStudent?: Student;
  /** Strings the model picked up that hint at category, surfaced for transparency. */
  cues: string[];
}

const FILLER_RE = /\b(um+|uh+|er+|hmm+|like|you know|i mean|sort of|kind of)\b/gi;

const CATEGORY_KEYWORDS: { category: NoteCategory; words: string[] }[] = [
  {
    category: "Focus",
    words: [
      "focus",
      "focused",
      "attention",
      "distract",
      "distracted",
      "zoned out",
      "off task",
      "concentrate",
      "concentration",
    ],
  },
  {
    category: "Behavior",
    words: [
      "behavior",
      "behaviour",
      "calm",
      "disrupt",
      "disruptive",
      "outburst",
      "tantrum",
      "kind",
      "polite",
      "rude",
      "fight",
      "argument",
      "hit",
      "shout",
      "respectful",
    ],
  },
  {
    category: "Task engagement",
    words: [
      "task",
      "assignment",
      "homework",
      "engaged",
      "engagement",
      "participation",
      "completed",
      "finished",
      "incomplete",
      "didn't finish",
      "did not finish",
      "on task",
      "submitted",
    ],
  },
  {
    category: "Learning",
    words: [
      "learn",
      "learning",
      "understood",
      "understand",
      "math",
      "english",
      "reading",
      "spelling",
      "science",
      "concept",
      "grasp",
      "explained",
      "comprehension",
      "skill",
    ],
  },
];

/** Quick "Add note for <name>" / "for <name>" detection on the leading words. */
function detectStudent(raw: string): { student?: Student; remainder: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { remainder: trimmed };

  const lower = trimmed.toLowerCase();
  // Try first 1–3 capitalized words after "for"/"about"/"add note for".
  const m = lower.match(/^(?:add\s+(?:a\s+)?note\s+for|note\s+for|for|about)\s+([a-z][a-z'\- ]*)/i);
  if (m) {
    const after = m[1];
    const candidate = pickStudentFromPhrase(after);
    if (candidate) {
      const remainder = trimmed.slice(m[0].length).replace(/^[\s,:.-]+/, "");
      return { student: candidate, remainder };
    }
  }

  // Otherwise scan whole text for any first-name match.
  const found = STUDENTS.find((s) => {
    const first = s.name.split(" ")[0].toLowerCase();
    return new RegExp(`\\b${first}\\b`, "i").test(lower);
  });
  return { student: found, remainder: trimmed };
}

function pickStudentFromPhrase(phrase: string): Student | undefined {
  const tokens = phrase
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3);
  if (tokens.length === 0) return undefined;

  // Prefer students whose first name matches the first token.
  const firstToken = tokens[0];
  const firstNameMatch = STUDENTS.find((s) => s.name.split(" ")[0].toLowerCase() === firstToken);
  if (firstNameMatch) return firstNameMatch;

  // Fallback: any name containing the token.
  return STUDENTS.find((s) => s.name.toLowerCase().includes(firstToken));
}

function detectCategory(text: string): { category: NoteCategory; cues: string[] } {
  const lower = text.toLowerCase();
  const cues: string[] = [];
  let best: { category: NoteCategory; score: number } = { category: "General", score: 0 };

  for (const { category, words } of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const w of words) {
      const re = new RegExp(`\\b${w.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (re.test(lower)) {
        score++;
        cues.push(w);
      }
    }
    if (score > best.score) best = { category, score };
  }
  return { category: best.category, cues };
}

function tidy(text: string): string {
  if (!text) return "";
  let out = text.replace(FILLER_RE, " ");
  out = out.replace(/\s+([,.;:!?])/g, "$1");
  out = out.replace(/\s+/g, " ").trim();
  if (!out) return out;
  // Capitalise first letter of each sentence.
  out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c: string) => p + c.toUpperCase());
  // Ensure trailing punctuation.
  if (!/[.!?]$/.test(out)) out += ".";
  // "i" → "I".
  out = out.replace(/\bi\b/g, "I");
  return out;
}

/** Strip the leading "add note for X," directive so the saved note reads cleanly. */
function stripDirective(text: string, student?: Student): string {
  if (!text) return text;
  let out = text;
  out = out
    .replace(
      /^\s*(?:please\s+)?(?:add\s+(?:a\s+)?note\s+for|note\s+for|for|about)\b[^,.:;-]*[,.:;-]?/i,
      "",
    )
    .trim();
  if (student) {
    const first = student.name.split(" ")[0];
    out = out.replace(new RegExp(`^\\s*${first}\\b[\\s,:-]*`, "i"), "").trim();
  }
  return out;
}

/**
 * Turn a teacher's raw dictation/typing into a clean note draft. Pure function —
 * no network calls — so it doubles as the "AI" mock and keeps everything
 * deterministic for tests.
 */
export function extractNote(raw: string, preselected?: Student | null): ExtractedNote {
  const { student: detectedStudent, remainder } = preselected
    ? { student: preselected, remainder: raw }
    : detectStudent(raw);

  const studentForStrip = preselected ?? detectedStudent;
  const stripped = stripDirective(remainder, studentForStrip);
  const body = tidy(stripped || raw);
  const { category, cues } = detectCategory(body);

  return {
    body,
    category,
    suggestedStudent: preselected ? undefined : detectedStudent,
    cues,
  };
}

export function searchStudents(query: string, limit = 8): Student[] {
  const q = query.trim().toLowerCase();
  if (!q) return STUDENTS.slice(0, limit);
  return STUDENTS.filter((s) => {
    const hay = `${s.name} ${s.grade} ${s.section}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}
