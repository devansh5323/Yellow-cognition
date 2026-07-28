// Realistic mock data for Yellow Teacher Dashboard.
// 24 students across 2 grades, 4-week history, attention timelines, sub-domain scores.

export type RiskLevel = "low" | "medium" | "high" | "at-risk";

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  section: string;
  avatarColor: string;
  initials: string;
  pfi: number; // 0-100
  pfiPrevCheckIn: number;
  csi: number; // Cognitive Stamina Index
  gamesPlayed: number;
  gamesAssigned: number;
  daysActive: number;
  lastActiveDays: number;
  risk: RiskLevel;
  parent: { name: string; email: string; phone: string };
  coach: string;
  // 4-week intra-month engagement history (game/session signal, not check-in data)
  history: { week: string; pfi: number; engagement: number }[];
  // Sub-domain scores (0-100) — 8 attention sub-domains
  subDomains: { name: string; description: string; score: number; classAvg: number }[];
  // Monthly check-in focus score; null = teacher didn't submit a check-in that month
  monthly: (number | null)[];
  sessions: SessionLog[];
  ksa: { name: string; description: string; score: number }[];
  indicators: {
    name: string;
    score: number;
    ksas: { name: string; weight: number }[];
  }[];
  subjects: { name: string; score: number; trend: number }[];
  flags?: string[];
}

export interface SessionLog {
  date: string;
  type: "Neurogame" | "Sessions" | "Project";
  title: string;
  duration: number; // minutes
  score: number;
  completion: number;
}

// 8 attention sub-domains (verbatim from research grid)
const SUB_DOMAINS: { name: string; description: string }[] = [
  { name: "Sustained Attention", description: "Ability to stay focused on a task or activity for an extended period of time without getting distracted." },
  { name: "Selective Attention", description: "Filtering out distractions to focus on relevant information." },
  { name: "Divided Attention", description: "Managing multiple tasks at a time without getting distracted." },
  { name: "Attention Switching", description: "Ability to switch focus between different tasks or activities without getting stuck." },
  { name: "Impulse Control", description: "Pausing oneself to think before acting too quickly or impulsively." },
  { name: "Emotional Regulation", description: "Managing emotions and staying calm when facing challenges or frustration." },
  { name: "Visual Attention", description: "Ability to focus on and process visual information quickly and efficiently." },
  { name: "Auditory Attention", description: "Ability to pay attention to sounds or what others are saying, even when there are other noises around." },
];

// Representative KSAs across cognitive, social, emotional, language and physical domains.
// Names use the research-grid `display_name`. Descriptions are verbatim definitions.
const KSA_LIST: { name: string; description: string }[] = [
  { name: "Selective Attention", description: "Ability to concentrate on a task over a period of time without being distracted." },
  { name: "Working Memory", description: "The ability to hold and process temporary information and perform complex tasks such as language comprehension, reading, learning, and reasoning." },
  { name: "Mental Flexibility", description: "The ability to shift between different tasks, strategies, or mental frameworks quickly and efficiently, enabling problem-solving and adaptability in changing situations." },
  { name: "Self Regulation", description: "Recognizing and controlling one's own emotions, behavior, and impulses." },
  { name: "Self - Awareness", description: "Recognizing self as separate from others, and knowledge about one's own character and feelings." },
  { name: "Auditory Attention", description: "It is the ability to focus on a single type of sound in the presence of other distracting sounds." },
  { name: "Visual Tracking", description: "It is the ability to smoothly follow moving objects with their eyes." },
  { name: "Behavior Control", description: "Ability to suppress, delay, and manage impulsive behaviors that are not aligned with one's goals." },
  { name: "Motor Control", description: "Ability to suppress motor impulses, such as repetitive behaviors and fidgeting, displaying control over bodily actions." },
  { name: "Frustration Tolerance", description: "Ability to cope with and handle frustrating situations." },
  { name: "Active Listening", description: "Listening with full attention without interrupting, and asking appropriate questions for deeper understanding." },
  { name: "Social Perception", description: "Being aware of others' reactions and understanding why they react as they do." },
];

// Class subjects (Grade 3-4) → the cognitive skills they draw on, plus games
// that target those skills. Used by the "Subjects" tab on the student detail
// page to translate KSA work into classroom impact.
export const SUBJECT_DETAILS: {
  name: string;
  short: string;
  iconKey: "calculator" | "book-open" | "flask-conical" | "languages" | "globe-2";
  hue: number;
  skills: string[];
  games: { title: string; targets: string[] }[];
}[] = [
  {
    name: "Mathematics",
    short: "Math",
    iconKey: "calculator",
    hue: 200,
    skills: ["Working Memory", "Mental Flexibility", "Selective Attention", "Visual Tracking"],
    games: [
      { title: "Tower Build", targets: ["Working Memory", "Mental Flexibility"] },
      { title: "Memory Match", targets: ["Working Memory", "Visual Tracking"] },
      { title: "Focus Maze", targets: ["Selective Attention", "Visual Tracking"] },
      { title: "Color Sort", targets: ["Selective Attention", "Mental Flexibility"] },
    ],
  },
  {
    name: "English",
    short: "Eng",
    iconKey: "book-open",
    hue: 260,
    skills: ["Auditory Attention", "Active Listening", "Working Memory", "Self Regulation"],
    games: [
      { title: "Sound Detective", targets: ["Auditory Attention", "Active Listening"] },
      { title: "Memory Match", targets: ["Working Memory", "Visual Tracking"] },
      { title: "Stop Signal", targets: ["Self Regulation", "Behavior Control"] },
    ],
  },
  {
    name: "Science",
    short: "Sci",
    iconKey: "flask-conical",
    hue: 142,
    skills: ["Mental Flexibility", "Visual Tracking", "Selective Attention", "Active Listening"],
    games: [
      { title: "Tower Build", targets: ["Working Memory", "Mental Flexibility"] },
      { title: "Focus Maze", targets: ["Selective Attention", "Visual Tracking"] },
      { title: "Reaction Quest", targets: ["Visual Tracking", "Motor Control"] },
      { title: "Sound Detective", targets: ["Auditory Attention", "Active Listening"] },
    ],
  },
  {
    name: "Hindi",
    short: "Hin",
    iconKey: "languages",
    hue: 340,
    skills: ["Auditory Attention", "Active Listening", "Working Memory", "Visual Tracking"],
    games: [
      { title: "Sound Detective", targets: ["Auditory Attention", "Active Listening"] },
      { title: "Memory Match", targets: ["Working Memory", "Visual Tracking"] },
      { title: "Reaction Quest", targets: ["Visual Tracking", "Motor Control"] },
    ],
  },
  {
    name: "Social Studies",
    short: "Soc",
    iconKey: "globe-2",
    hue: 38,
    skills: ["Active Listening", "Self - Awareness", "Social Perception", "Working Memory"],
    games: [
      { title: "Sound Detective", targets: ["Auditory Attention", "Active Listening"] },
      { title: "Mood Mirror", targets: ["Self - Awareness", "Social Perception"] },
      { title: "Memory Match", targets: ["Working Memory", "Visual Tracking"] },
    ],
  },
];

// Indicators sampled from the 8–9 yrs band of the indicator-KSA mapping grid.
// Each indicator lists the KSAs it taps into, with the research-grid weightage.
const INDICATOR_LIST: {
  name: string;
  ksas: { name: string; weight: number }[];
}[] = [
  {
    name: "Accurately interprets spoken information",
    ksas: [
      { name: "Auditory Perception", weight: 9.6 },
      { name: "Oral Comprehension", weight: 9.1 },
      { name: "Auditory Working Memory", weight: 9.0 },
    ],
  },
  {
    name: "Adapts self to new rules",
    ksas: [
      { name: "Adaptive Thinking", weight: 9.8 },
      { name: "Self Regulation", weight: 9.0 },
      { name: "Social Perception", weight: 9.1 },
    ],
  },
  {
    name: "Follows multiple-step directions",
    ksas: [
      { name: "Working Memory", weight: 9.0 },
      { name: "Active Listening", weight: 8.9 },
      { name: "Oral Comprehension", weight: 9.3 },
      { name: "Procedural Knowledge", weight: 9.5 },
    ],
  },
  {
    name: "Shows attention to detail",
    ksas: [
      { name: "Visual Discrimination", weight: 8.7 },
      { name: "Cognitive Recognition", weight: 9.5 },
      { name: "Visual Processing", weight: 8.6 },
    ],
  },
  {
    name: "Recognizes signs of frustration",
    ksas: [
      { name: "Frustration Tolerance", weight: 9.8 },
      { name: "Self - Awareness", weight: 8.4 },
      { name: "Self Regulation", weight: 9.0 },
    ],
  },
  {
    name: "Demonstrates ability to switch between tasks without resistance",
    ksas: [
      { name: "Mental Flexibility", weight: 9.6 },
      { name: "Attention Shifting", weight: 9.6 },
      { name: "Frustration Tolerance", weight: 8.7 },
    ],
  },
  {
    name: "Listens without interrupting",
    ksas: [
      { name: "Verbal Regulation", weight: 9.2 },
      { name: "Active Listening", weight: 9.6 },
    ],
  },
  {
    name: "Demonstrates control over repetitive movements such as fidgeting or tapping",
    ksas: [
      { name: "Motor Control", weight: 9.5 },
      { name: "Arousal Modulation", weight: 8.2 },
    ],
  },
];

const COACHES = ["Ms. Priya Sharma", "Mr. Arjun Mehta", "Ms. Riya Kapoor"];

const NAMES: { name: string; initials: string; color: string }[] = [
  { name: "Aarav Patel", initials: "AP", color: "hsl(142 52% 48%)" },
  { name: "Diya Sharma", initials: "DS", color: "hsl(260 50% 60%)" },
  { name: "Vihaan Singh", initials: "VS", color: "hsl(200 70% 55%)" },
  { name: "Anaya Verma", initials: "AV", color: "hsl(38 92% 55%)" },
  { name: "Arjun Reddy", initials: "AR", color: "hsl(340 70% 60%)" },
  { name: "Saanvi Iyer", initials: "SI", color: "hsl(170 60% 45%)" },
  { name: "Reyansh Gupta", initials: "RG", color: "hsl(20 80% 55%)" },
  { name: "Myra Joshi", initials: "MJ", color: "hsl(290 55% 60%)" },
  { name: "Kabir Khanna", initials: "KK", color: "hsl(220 60% 55%)" },
  { name: "Aadhya Menon", initials: "AM", color: "hsl(140 45% 50%)" },
  { name: "Ishaan Rao", initials: "IR", color: "hsl(50 80% 55%)" },
  { name: "Kiara Nair", initials: "KN", color: "hsl(310 60% 60%)" },
  { name: "Atharv Bhatt", initials: "AB", color: "hsl(180 60% 45%)" },
  { name: "Pari Desai", initials: "PD", color: "hsl(0 70% 60%)" },
  { name: "Shaurya Malhotra", initials: "SM", color: "hsl(240 55% 60%)" },
  { name: "Riya Agarwal", initials: "RA", color: "hsl(80 55% 50%)" },
  { name: "Ayaan Kapoor", initials: "AK", color: "hsl(15 75% 55%)" },
  { name: "Navya Pillai", initials: "NP", color: "hsl(280 50% 60%)" },
  { name: "Vivaan Shetty", initials: "VS", color: "hsl(190 65% 50%)" },
  { name: "Kyra Bose", initials: "KB", color: "hsl(330 60% 60%)" },
  { name: "Advik Choudhary", initials: "AC", color: "hsl(160 50% 45%)" },
  { name: "Anika Saxena", initials: "AS", color: "hsl(45 85% 55%)" },
  { name: "Dhruv Trivedi", initials: "DT", color: "hsl(210 60% 55%)" },
  { name: "Tara Mishra", initials: "TM", color: "hsl(300 55% 60%)" },
];

// Deterministic pseudo-random
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function makeStudent(idx: number): Student {
  const base = NAMES[idx];
  const seed = idx + 1;
  const grade = idx < 12 ? "Grade 3" : "Grade 4";
  const section = idx % 2 === 0 ? "A" : "B";
  const age = grade === "Grade 3" ? 8 : 9;

  const pfi = clamp(45 + rand(seed) * 50);
  const delta = (rand(seed * 7) - 0.5) * 16;
  const pfiPrevCheckIn = clamp(pfi - delta);

  let risk: RiskLevel = "low";
  if (pfi < 55) risk = "at-risk";
  else if (pfi < 65) risk = "high";
  else if (pfi < 75) risk = "medium";

  const gamesAssigned = 20;
  const gamesPlayed = Math.round(rand(seed * 3) * gamesAssigned);
  const lastActiveDays = Math.floor(rand(seed * 11) * 6);
  const daysActive = clamp(28 - lastActiveDays - Math.floor(rand(seed * 5) * 8), 0, 28);

  const history = ["W1", "W2", "W3", "W4"].map((w, i) => ({
    week: w,
    pfi: clamp(pfi - 10 + i * 3 + rand(seed + i) * 8),
    engagement: clamp(60 + rand(seed * (i + 1)) * 30),
  }));

  const subDomains = SUB_DOMAINS.map((d, i) => ({
    name: d.name,
    description: d.description,
    score: clamp(pfi - 10 + rand(seed * (i + 2)) * 25),
    classAvg: clamp(65 + rand(i + 100) * 15),
  }));

  // 6 monthly check-ins, oldest → newest. Trends upward toward current pfi with
  // some noise; ~12% of months are missing to simulate skipped check-ins.
  const monthly: (number | null)[] = Array.from({ length: 6 }, (_, m) => {
    const missing = rand(seed * 17 + m * 19);
    if (missing < 0.12) return null;
    const trend = (m - 5) * 1.6; // older months sit a bit below current pfi
    const noise = (rand(seed * 23 + m * 7) - 0.5) * 14;
    return clamp(pfi + trend + noise);
  });

  const sessions: SessionLog[] = Array.from({ length: 8 }, (_, i) => ({
    date: `Apr ${20 - i}, 2026`,
    type: (["Neurogame", "Sessions", "Project"] as const)[i % 3],
    title: ["Focus Maze", "Memory Match", "Reaction Quest", "Tower Build", "Color Sort"][i % 5],
    duration: 8 + Math.floor(rand(seed + i) * 12),
    score: clamp(60 + rand(seed * i + 1) * 35),
    completion: clamp(70 + rand(seed + i * 2) * 30),
  }));

  const ksa = KSA_LIST.map((k, i) => ({
    name: k.name,
    description: k.description,
    score: clamp(pfi - 5 + rand(seed * (i + 9)) * 20),
  }));

  const indicators = INDICATOR_LIST.map((ind, i) => ({
    name: ind.name,
    ksas: ind.ksas,
    score: clamp(pfi - 8 + rand(seed * (i + 21)) * 22),
  }));

  const subjects = SUBJECT_DETAILS.map((sub, i) => ({
    name: sub.name,
    score: clamp(pfi - 6 + rand(seed * (i + 31)) * 22),
    trend: Math.round((rand(seed * (i + 41)) - 0.5) * 14),
  }));

  const flags: string[] = [];
  if (pfi - pfiPrevCheckIn < -5) flags.push("Declining PFI");
  if (gamesPlayed / gamesAssigned < 0.5) flags.push("Low completion");
  if (lastActiveDays >= 3) flags.push(`Inactive ${lastActiveDays}d`);

  return {
    id: `s${idx + 1}`,
    name: base.name,
    age,
    grade,
    section,
    avatarColor: base.color,
    initials: base.initials,
    pfi,
    pfiPrevCheckIn,
    csi: clamp(pfi - 5 + rand(seed * 13) * 15),
    gamesPlayed,
    gamesAssigned,
    daysActive,
    lastActiveDays,
    risk,
    parent: {
      name: `Parent of ${base.name.split(" ")[0]}`,
      email: `${base.name.split(" ")[0].toLowerCase()}.parent@school.edu`,
      phone: "+91 98XXX XX" + (1000 + idx),
    },
    coach: COACHES[idx % COACHES.length],
    history,
    subDomains,
    monthly,
    sessions,
    ksa,
    indicators,
    subjects,
    flags,
  };
}

export const STUDENTS: Student[] = NAMES.map((_, i) => makeStudent(i));

export function getStudent(id: string) {
  return STUDENTS.find((s) => s.id === id);
}

// Class-level aggregates
export function classStats(students: Student[] = STUDENTS) {
  const avg = (key: keyof Student) =>
    Math.round(students.reduce((a, s) => a + (s[key] as number), 0) / students.length);
  const atRisk = students.filter((s) => s.risk === "at-risk" || s.risk === "high").length;
  const totalGames = students.reduce((a, s) => a + s.gamesPlayed, 0);
  const totalAssessments = students.reduce((a, s) => a + s.sessions.length, 0);
  const engagement = Math.round(
    students.reduce((a, s) => a + s.gamesPlayed / s.gamesAssigned, 0) / students.length * 100,
  );
  const tei = Math.round(
    students.reduce((a, s) => a + (s.pfi + s.csi) / 2, 0) / students.length,
  );
  return {
    total: students.length,
    avgPfi: avg("pfi"),
    tei,
    minutesSaved: Math.round(students.length * 8.4),
    engagement,
    atRisk,
    totalGames,
    totalAssessments,
  };
}

// Last 6 monthly check-ins, oldest → newest. Aligned with the monthly teacher
// check-in cadence — there is no daily/hourly tracking from the classroom.
export const MONTH_LABELS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

export function studentMonthlyCheckIns(student: Student): (number | null)[] {
  return student.monthly;
}

export function classMonthlyAttention(students: Student[] = STUDENTS) {
  return MONTH_LABELS.map((label, i) => {
    const vals = students.map((s) => s.monthly[i]).filter((v): v is number => v != null);
    return {
      month: label,
      attention: vals.length
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : null,
    };
  });
}

export function classSubDomainAvg(students: Student[] = STUDENTS) {
  return SUB_DOMAINS.map((d, i) => ({
    name: d.name,
    score: Math.round(
      students.reduce((a, s) => a + s.subDomains[i].score, 0) / students.length,
    ),
  }));
}

export type InboxItem = {
  id: string;
  kind: "at-risk" | "parent-reply" | "missed-session" | "anomaly" | "celebration";
  title: string;
  body: string;
  studentId?: string;
  time: string;
  priority: "high" | "medium" | "low";
};

export const INBOX_ITEMS: InboxItem[] = [
  { id: "i1", kind: "at-risk", title: "Aarav Patel — PFI declining", body: "Down 12 points over 3 sessions. Suggest a 1:1 check-in.", studentId: "s1", time: "8m", priority: "high" },
  { id: "i2", kind: "parent-reply", title: "Mr. Sharma replied", body: "“Thanks — we'll practice the focus exercises tonight.”", studentId: "s2", time: "32m", priority: "medium" },
  { id: "i3", kind: "missed-session", title: "Liam missed Focus Maze", body: "3rd missed Neurogame this month. Re-assign?", studentId: "s5", time: "1h", priority: "medium" },
  { id: "i4", kind: "anomaly", title: "Class focus dipped 18% post-11am", body: "Below typical Tuesday range. Movement break suggested.", time: "2h", priority: "low" },
  { id: "i5", kind: "celebration", title: "🎉 Diya hit a new PFI peak", body: "92/100 in this morning's session — best of the term.", studentId: "s2", time: "3h", priority: "low" },
];

export type ClassVibe = {
  mood: "energized" | "focused" | "restless" | "tired";
  emoji: string;
  bestDomain: string;
  worstDomain: string;
  vsBenchmark: number; // % vs same-day-last-week
  summary: string;
};

export function classVibe(students: Student[] = STUDENTS): ClassVibe {
  const subAvg = classSubDomainAvg(students);
  const best = subAvg.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = subAvg.reduce((a, b) => (b.score < a.score ? b : a));
  const avg = classStats(students).avgPfi;
  const vs = Math.round(((avg - 72) / 72) * 100);
  let mood: ClassVibe["mood"] = "focused";
  let emoji = "🎯";
  if (avg >= 80) { mood = "energized"; emoji = "⚡"; }
  else if (avg < 60) { mood = "tired"; emoji = "😴"; }
  else if (vs < -5) { mood = "restless"; emoji = "🌀"; }
  return {
    mood, emoji,
    bestDomain: best.name,
    worstDomain: worst.name,
    vsBenchmark: vs,
    summary: vs >= 0
      ? `Class is ${Math.abs(vs)}% above last Tuesday's focus level.`
      : `Class is ${Math.abs(vs)}% below last Tuesday — try a movement break.`,
  };
}

export const AI_INSIGHTS = [
  {
    icon: "Zap",
    title: "Energy Break Suggested",
    body: "Class attention dipped 18% after 11am. A 3-minute movement break could restore focus.",
    cta: "Start break timer",
    tone: "warning" as const,
  },
  {
    icon: "Users",
    title: "Group Activity Recommended",
    body: "6 students show high collaboration scores this month — pair them on the Tower Build project.",
    cta: "Create groups",
    tone: "primary" as const,
  },
  {
    icon: "Eye",
    title: "Visual Learners Engaged",
    body: "Students with strong visual tracking scored 23% higher today. Consider a visual recap.",
    cta: "View recommendation",
    tone: "accent" as const,
  },
  {
    icon: "AlertTriangle",
    title: "Aarav needs attention",
    body: "PFI dropped 12 points since last check-in. Recommend a 1:1 chat and sustained attention game.",
    cta: "Open profile",
    tone: "danger" as const,
  },
];

// ─────────────────────────────────────────────────────────────
// Instructional Friction — teacher check-in types & seed data
// ─────────────────────────────────────────────────────────────

export const SUBJECTS = ["Math", "Science", "English", "Social", "Hindi"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
] as const;
export type Grade = (typeof GRADES)[number];

export const CLASS_SIZE_BUCKETS = ["1-10", "11-20", ">20"] as const;
export type ClassSizeBucket = (typeof CLASS_SIZE_BUCKETS)[number];

export const TEACHING_MIN_BUCKETS = ["<20", "20-25", "30-35", "40+"] as const;
export type TeachingMinBucket = (typeof TEACHING_MIN_BUCKETS)[number];

export const LOST_MIN_BUCKETS = ["<2", "2-5", "6-10", "10-15", ">15"] as const;
export type LostMinBucket = (typeof LOST_MIN_BUCKETS)[number];

export const COUNT_BUCKETS = ["<3", "3-5", "5-10", ">10"] as const;
export type CountBucket = (typeof COUNT_BUCKETS)[number];

// Midpoint helpers — convert tap-only buckets to numeric estimates.
export function midTeachingMins(b: TeachingMinBucket): number {
  return { "<20": 18, "20-25": 22, "30-35": 32, "40+": 42 }[b];
}
export function midLostMins(b: LostMinBucket): number {
  return { "<2": 1, "2-5": 3.5, "6-10": 8, "10-15": 12.5, ">15": 18 }[b];
}
export function midCount(b: CountBucket): number {
  return { "<3": 2, "3-5": 4, "5-10": 7.5, ">10": 12 }[b];
}

export const BEHAVIOUR_RUBRIC = [
  { id: "sustained", label: "Sustained attention", reverse: false, min: 1, max: 5 },
  { id: "onTask", label: "Stays on task", reverse: false, min: 1, max: 5 },
  { id: "completion", label: "Task completion", reverse: false, min: 1, max: 5 },
  { id: "interrupts", label: "Interrupts class", reverse: true, min: 1, max: 5 },
  { id: "multiStep", label: "Follows multi-step instructions", reverse: false, min: 1, max: 5 },
  { id: "motor", label: "Motor regulation", reverse: true, min: 0, max: 5 },
] as const;

export type BehaviourKey = (typeof BEHAVIOUR_RUBRIC)[number]["id"];

export interface StudentBehaviourRating {
  studentId: string;
  absent?: boolean;
  ratings: Partial<Record<BehaviourKey, number>>;
}

export interface ClassCheckIn {
  id: string;
  createdAt: string; // ISO
  teacher: string;
  grade: Grade;
  section?: string;
  subject: Subject;
  classSize: ClassSizeBucket;
  teachingMins: TeachingMinBucket;
  behaviourMins: LostMinBucket;
  transitionMins: LostMinBucket;
  disruptions: CountBucket;
  repetitions: CountBucket;
  students: StudentBehaviourRating[];
}

// Seed a few past check-ins so the friction page renders meaningfully on first load.
// Spaced at ~30-day intervals to reflect the monthly check-in cadence; the most
// recent seed sits within the last few days so the friction page's default window
// still has data to show.
export const SEED_CHECKINS: ClassCheckIn[] = [
  {
    id: "seed-1",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "Math",
    classSize: ">20",
    teachingMins: "20-25",
    behaviourMins: "6-10",
    transitionMins: "2-5",
    disruptions: "5-10",
    repetitions: "5-10",
    students: STUDENTS.slice(0, 12).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 3) % 5) + 1,
        onTask: ((i * 2) % 5) + 1,
        completion: ((i * 5) % 5) + 1,
        interrupts: ((i * 7) % 5) + 1,
        multiStep: ((i * 11) % 5) + 1,
        motor: (i * 13) % 6,
      },
    })),
  },
  {
    id: "seed-2",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "English",
    classSize: ">20",
    teachingMins: "30-35",
    behaviourMins: "2-5",
    transitionMins: "<2",
    disruptions: "<3",
    repetitions: "3-5",
    students: STUDENTS.slice(0, 12).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 2) % 5) + 1,
        onTask: ((i * 4) % 5) + 1,
        completion: ((i * 6) % 5) + 1,
        interrupts: ((i * 3) % 5) + 1,
        multiStep: ((i * 9) % 5) + 1,
        motor: (i * 5) % 6,
      },
    })),
  },
  {
    id: "seed-3",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    teacher: "Arjun Mehta",
    grade: "Grade 4",
    section: "B",
    subject: "Math",
    classSize: ">20",
    teachingMins: "<20",
    behaviourMins: "10-15",
    transitionMins: "6-10",
    disruptions: ">10",
    repetitions: ">10",
    students: STUDENTS.slice(12, 24).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 7) % 5) + 1,
        onTask: ((i * 11) % 5) + 1,
        completion: ((i * 3) % 5) + 1,
        interrupts: ((i * 5) % 5) + 1,
        multiStep: ((i * 2) % 5) + 1,
        motor: (i * 4) % 6,
      },
    })),
  },
  {
    id: "seed-4",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    teacher: "Maya Khan",
    grade: "Grade 3",
    section: "A",
    subject: "Math",
    classSize: ">20",
    teachingMins: "30-35",
    behaviourMins: "2-5",
    transitionMins: "<2",
    disruptions: "3-5",
    repetitions: "3-5",
    students: STUDENTS.slice(0, 12).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: ((i * 3) % 5) + 2,
        onTask: ((i * 2) % 5) + 2,
        completion: ((i * 5) % 5) + 2,
        interrupts: ((i * 7) % 5) + 1,
        multiStep: ((i * 11) % 5) + 2,
        motor: (i * 13) % 5,
      },
    })),
  },
  {
    id: "seed-5",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    teacher: "Riya Kapoor",
    grade: "Grade 5",
    section: "A",
    subject: "Science",
    classSize: "11-20",
    teachingMins: "30-35",
    behaviourMins: "<2",
    transitionMins: "2-5",
    disruptions: "<3",
    repetitions: "<3",
    students: STUDENTS.slice(6, 16).map((s, i) => ({
      studentId: s.id,
      ratings: {
        sustained: 4,
        onTask: 4,
        completion: ((i * 2) % 3) + 3,
        interrupts: 2,
        multiStep: 4,
        motor: 1,
      },
    })),
  },
];

// ─────────────────────────────────────────────────────────────
// Dashboard analytics — classroom overview, attention domains,
// behaviour recovery, risk radar, per-student profiles
// ─────────────────────────────────────────────────────────────

export type AttentionDomainKey = "sus" | "sel" | "vis" | "aud" | "div" | "swi" | "hyp" | "beh";

export const ATTENTION_DOMAINS: { key: AttentionDomainKey; short: string; label: string }[] = [
  { key: "sus", short: "SUS", label: "Sustained" },
  { key: "sel", short: "SEL", label: "Selective" },
  { key: "vis", short: "VIS", label: "Visual" },
  { key: "aud", short: "AUD", label: "Auditory" },
  { key: "div", short: "DIV", label: "Divided" },
  { key: "swi", short: "SWI", label: "Switching" },
  { key: "hyp", short: "HYP", label: "Hyperactivity" },
  { key: "beh", short: "BEH", label: "Behavioral Reg." },
];

export type AttentionDomainScores = Record<AttentionDomainKey, number>;

/** Deterministic per-student 8-domain scores derived from existing pfi/csi. */
export function studentAttentionDomains(s: Student): AttentionDomainScores {
  const seed = s.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (s.pfi + s.csi) / 2;
  const offsets = [0, -4, 6, -7, 3, -2, -10, 5];
  const out = {} as AttentionDomainScores;
  ATTENTION_DOMAINS.forEach((d, i) => {
    const j = (rand((seed + i) * 3) - 0.5) * 12;
    out[d.key] = clamp(base + offsets[i] + j);
  });
  return out;
}

export type Compliance = "HIGH" | "MEDIUM" | "LOW";

export interface StudentMonitorRow {
  student: Student;
  status: "Thriving" | "On Track" | "Needs Support" | "At Risk";
  csi: number;
  trend: number; // pfi - pfiPrevCheckIn
  compliance: Compliance;
  selfReg: number; // %
  coreIssues: string[];
  recommendedGames: string[];
}

const ALL_GAMES = ["Task Switch", "Impulse Control", "Dual Task", "Calming", "Focus Maze", "Memory Match"];

export function studentMonitorRow(s: Student): StudentMonitorRow {
  const trend = s.pfi - s.pfiPrevCheckIn;
  let status: StudentMonitorRow["status"] = "On Track";
  if (s.risk === "at-risk") status = "At Risk";
  else if (s.risk === "high") status = "Needs Support";
  else if (s.pfi >= 82) status = "Thriving";

  const ratio = s.gamesPlayed / s.gamesAssigned;
  const compliance: Compliance = ratio >= 0.7 ? "HIGH" : ratio >= 0.4 ? "MEDIUM" : "LOW";
  const selfReg = clamp(40 + (s.csi - 50) + rand(s.id.length * 7) * 20);

  const domains = studentAttentionDomains(s);
  const issues: string[] = [];
  if (domains.sus < 55) issues.push("Low sustained attention");
  if (domains.hyp > 75) issues.push("High hyperactivity");
  if (domains.beh < 55) issues.push("Behavioural regulation");
  if (trend < -5) issues.push("Declining performance");
  if (issues.length === 0) issues.push("Steady focus");

  const seed = s.id.length;
  const games = [
    ALL_GAMES[seed % ALL_GAMES.length],
    ALL_GAMES[(seed + 2) % ALL_GAMES.length],
    ALL_GAMES[(seed + 4) % ALL_GAMES.length],
  ];

  return { student: s, status, csi: s.csi, trend, compliance, selfReg, coreIssues: issues, recommendedGames: games };
}

export function classroomOverview(students: Student[] = STUDENTS) {
  const total = students.length;
  const present = total - students.filter((s) => s.lastActiveDays >= 1).length;
  const focused = students.filter((s) => s.pfi >= 65 && s.pfi < 82).length;
  const needSupport = students.filter((s) => s.risk === "at-risk" || s.risk === "high").length;
  const topPerformers = students.filter((s) => s.pfi >= 82).length;
  return {
    present: Math.max(present, total - 2),
    total,
    attendancePct: Math.round((Math.max(present, total - 2) / total) * 100),
    focused,
    needSupport,
    topPerformers,
  };
}

export function attentionDomainSummary(students: Student[] = STUDENTS) {
  return ATTENTION_DOMAINS.map((d) => {
    const scores = students.map((s) => studentAttentionDomains(s)[d.key]);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const atRisk = scores.filter((v) => v < 55).length;
    return {
      key: d.key,
      short: d.short,
      label: d.label,
      score: avg,
      atRiskPct: Math.round((atRisk / students.length) * 100),
      sessionsPerStudent: +(2 + rand(d.short.length * 5) * 2).toFixed(1),
    };
  });
}

export function behaviorAnalytics(students: Student[] = STUDENTS) {
  const timeLost30d = 120;
  const timeRecovered = 86;
  return {
    timeLost30d,
    timeRecovered,
    recoveryRate: Math.round((timeRecovered / timeLost30d) * 100),
    incidentsPerWeek: Math.round(students.length * 0.4),
    improvementPct: 14,
  };
}

export type RiskReason = "At Risk (CSI<50)" | "Declining Performance" | "Emotional Dips" | "High Impulsivity";

export function classRiskRadar(students: Student[] = STUDENTS): { reason: RiskReason; students: Student[] }[] {
  const groups: Record<RiskReason, Student[]> = {
    "At Risk (CSI<50)": [],
    "Declining Performance": [],
    "Emotional Dips": [],
    "High Impulsivity": [],
  };
  students.forEach((s) => {
    if (s.csi < 60) groups["At Risk (CSI<50)"].push(s);
    if (s.pfi - s.pfiPrevCheckIn < -5) groups["Declining Performance"].push(s);
    const d = studentAttentionDomains(s);
    if (d.beh < 55) groups["Emotional Dips"].push(s);
    if (d.hyp > 72) groups["High Impulsivity"].push(s);
  });
  return (Object.keys(groups) as RiskReason[]).map((reason) => ({
    reason,
    students: groups[reason],
  }));
}

/** Count of distinct students flagged across all risk reasons in classRiskRadar —
 * the aggregate "follow-ups pending" figure shared across dashboard widgets. */
export function countFollowUpsPending(students: Student[] = STUDENTS): number {
  const ids = new Set<string>();
  classRiskRadar(students).forEach((group) => group.students.forEach((s) => ids.add(s.id)));
  return ids.size;
}

/** Students whose score in a given attention domain is < 55 (at-risk for that domain). */
export function studentsByAttentionDomain(
  domainKey: AttentionDomainKey,
  students: Student[] = STUDENTS,
): Student[] {
  return students
    .map((s) => ({ s, v: studentAttentionDomains(s)[domainKey] }))
    .filter((x) => x.v < 55)
    .sort((a, b) => a.v - b.v)
    .map((x) => x.s);
}

/** Recommended interventions per attention domain. */
export const DOMAIN_INTERVENTIONS: Record<AttentionDomainKey, string[]> = {
  sus: ["Pomodoro 15/3 cycles", "Sustained-Focus game (Lighthouse)", "Reduce ambient noise"],
  sel: ["Single-channel worksheets", "Selective-Attention game (Find-It)", "Front-row seating"],
  vis: ["Visual scaffolds & color cues", "Visual-Search game (Spotter)", "Larger fonts on board"],
  aud: ["Repeat-back protocol", "Auditory-Memory game (Echo)", "Use FM mic for clarity"],
  div: ["One-task-at-a-time framing", "Dual-Task ramp game", "Checklists for multi-step work"],
  swi: ["Transition warnings (2-min)", "Task-Switch game", "Visual schedule on desk"],
  hyp: ["Movement breaks every 20 min", "Impulse-Control game", "Fidget tool allowance"],
  beh: ["Calming corner access", "Self-Reg breathing game", "Daily check-in card"],
};

/** Recommended interventions per risk reason. */
export const RISK_INTERVENTIONS: Record<RiskReason, string[]> = {
  "At Risk (CSI<50)": ["Schedule 1:1 check-in", "Notify counselor", "Daily progress tracker"],
  "Declining Performance": ["Parent contact within 7 days", "Reduce cognitive load", "Re-baseline assessment"],
  "Emotional Dips": ["Calming corner access", "Mood check-in cards", "Counselor referral if persistent"],
  "High Impulsivity": ["Movement breaks", "Impulse-Control games daily", "Visual stop-and-think cue"],
};

export const AI_SUGGESTIONS = [
  {
    severity: "high" as const,
    title: "Movement break recommended",
    body: "Class focus dropped 18% post-11am. A 3-minute movement break can restore baseline by 70%.",
    cta: "Start Break Timer",
    icon: "Zap" as const,
  },
  {
    severity: "medium" as const,
    title: "Switch to paired activity",
    body: "Aarav and Diya show low sustained attention. Pair them for the next Tower Build session.",
    cta: "View Activity Ideas",
    icon: "Users" as const,
  },
  {
    severity: "low" as const,
    title: "Reinforce visual learners",
    body: "Visual tracking scores are strong today. A short visual recap should boost retention.",
    cta: "Get Visual Resources",
    icon: "Eye" as const,
  },
];

export const RECOMMENDED_GAMES = ["Task Switch", "Impulse Control", "Dual Task", "Calming Games"];

export function frictionStudents(students: Student[] = STUDENTS): Student[] {
  return students
    .map((s) => ({ s, score: studentAttentionDomains(s).hyp - studentAttentionDomains(s).beh }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);
}

