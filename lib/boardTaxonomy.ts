// Static board → subject/credit-system nomenclature mapping. No live AI
// lookup — each board's subject list and grading terminology is curated
// here so onboarding language matches what a teacher on that board
// actually expects, instantly and without hallucination risk. A custom
// (typed-in, unrecognized) board falls back to DEFAULT_TAXONOMY rather
// than guessing.

export const BOARDS = [
  "IB (International Baccalaureate)",
  "Cambridge International (CAIE)",
  "ICSE",
  "CBSE",
  "State Board",
  "IGCSE",
  "American Curriculum (Common Core)",
  "National Curriculum for England",
  "Australian Curriculum",
  "National Curriculum Framework (NCF)",
  "Montessori",
  "Waldorf",
] as const;

export type BoardTaxonomy = {
  subjects: string[];
  creditLabel: string;
};

const DEFAULT_TAXONOMY: BoardTaxonomy = {
  subjects: ["Math", "ELA", "Science", "Social Studies", "Art", "Music", "PE", "Technology", "Language", "SEL"],
  creditLabel: "Grades / Marks",
};

const BOARD_TAXONOMY: Record<string, BoardTaxonomy> = {
  "IB (International Baccalaureate)": {
    subjects: [
      "Language & Literature",
      "Language Acquisition",
      "Individuals & Societies",
      "Sciences",
      "Mathematics",
      "Arts",
      "Physical & Health Education",
      "Design",
    ],
    creditLabel: "IB Grade (1–7 criteria scale)",
  },
  "Cambridge International (CAIE)": {
    subjects: ["English", "Mathematics", "Sciences", "ICT", "Global Perspectives", "Art & Design", "Business Studies", "Economics"],
    creditLabel: "Cambridge Grade (A*–G)",
  },
  ICSE: {
    subjects: ["English", "Second Language", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"],
    creditLabel: "Marks (out of 100)",
  },
  CBSE: {
    subjects: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education"],
    creditLabel: "Marks (out of 100) / CGPA",
  },
  "State Board": {
    subjects: ["Language 1", "Language 2", "Mathematics", "Science", "Social Studies", "Physical Education"],
    creditLabel: "Marks (out of 100)",
  },
  IGCSE: {
    subjects: ["English", "Mathematics", "Sciences", "Business Studies", "Computer Science", "Additional Language"],
    creditLabel: "IGCSE Grade (9–1 / A*–G)",
  },
  "American Curriculum (Common Core)": {
    subjects: ["English Language Arts", "Mathematics", "Science", "Social Studies", "Physical Education", "Arts", "Technology"],
    creditLabel: "Credit Hours (GPA)",
  },
  "National Curriculum for England": {
    subjects: ["English", "Mathematics", "Science", "Design & Technology", "Geography", "History", "Art & Design", "PE"],
    creditLabel: "GCSE Grade (9–1)",
  },
  "Australian Curriculum": {
    subjects: ["English", "Mathematics", "Science", "Humanities & Social Sciences", "The Arts", "Health & PE", "Technologies"],
    creditLabel: "Achievement Standard (A–E)",
  },
  "National Curriculum Framework (NCF)": {
    subjects: ["Language", "Mathematics", "Science", "Social Science", "Work Education", "Art Education"],
    creditLabel: "Grades (A–E)",
  },
  Montessori: {
    subjects: ["Practical Life", "Sensorial", "Language", "Mathematics", "Cultural Studies"],
    creditLabel: "Narrative Progress Report (no letter grades)",
  },
  Waldorf: {
    subjects: ["Main Lesson", "Language Arts", "Mathematics", "Handwork", "Eurythmy", "Music & Arts"],
    creditLabel: "Narrative Progress Report (no letter grades)",
  },
};

/** Case-insensitive, trims whitespace — matches whether the board came
 * from a picked suggestion or free-typed text. Unrecognized/custom boards
 * (including an empty string) get the generic default rather than a guess. */
export function getBoardTaxonomy(board: string | undefined | null): BoardTaxonomy {
  if (!board) return DEFAULT_TAXONOMY;
  const key = Object.keys(BOARD_TAXONOMY).find((k) => k.toLowerCase() === board.trim().toLowerCase());
  return key ? BOARD_TAXONOMY[key] : DEFAULT_TAXONOMY;
}
