// School-level mock data for the admin dashboard demo.
// Stable, deterministic — no random per-render changes.

export type TeacherStatus = "active" | "dormant" | "invited" | "pending";

export type SchoolTeacher = {
  id: string;
  name: string;
  email: string;
  initials: string;
  subject: string;
  classes: string[];
  studentCount: number;
  avgPfi: number;
  pfiTrend: number;
  status: TeacherStatus;
  lastActiveDays?: number;
  joinedDaysAgo?: number;
  invitedDaysAgo?: number;
};

export type SchoolClassRow = {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacherId: string;
  teacherName: string;
  size: number;
  avgPfi: number;
  pfiTrend: number;
  atRisk: number;
  monthlyCheckIn: boolean;
  engagementPct: number;
};

export type SchoolKpis = {
  totalStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  invitedTeachers: number;
  pendingTeachers: number;
  avgSchoolPfi: number;
  avgPfiTrend: number;
  atRiskCount: number;
  atRiskPct: number;
  monthlyCheckInsDone: number;
  monthlyCheckInsTotal: number;
  parentActivationPct: number;
  parentActivationTrend: number;
};

const FIRST_NAMES = [
  "Maya",
  "Arjun",
  "Priya",
  "Ravi",
  "Anjali",
  "Vikram",
  "Neha",
  "Karan",
  "Aditi",
  "Rohit",
  "Sara",
  "Aman",
  "Divya",
  "Ishan",
  "Rhea",
  "Kabir",
  "Zara",
  "Nikhil",
  "Tara",
  "Dev",
  "Mira",
  "Yash",
];
const LAST_NAMES = [
  "Sharma",
  "Kapoor",
  "Reddy",
  "Iyer",
  "Khan",
  "Patel",
  "Mehta",
  "Singh",
  "Das",
  "Rao",
  "Verma",
  "Joshi",
  "Nair",
  "Desai",
  "Bose",
  "Chopra",
];
const SUBJECTS = [
  "Math",
  "ELA",
  "Science",
  "Social Studies",
  "Art",
  "Music",
  "PE",
  "World Language",
];
const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildTeachers(): SchoolTeacher[] {
  const out: SchoolTeacher[] = [];
  const total = 18;
  for (let i = 0; i < total; i++) {
    const name = `${pick(FIRST_NAMES, i * 7 + 1)} ${pick(LAST_NAMES, i * 11 + 3)}`;
    const subject = pick(SUBJECTS, i * 3);
    const grade = pick(GRADES, i * 2 + 1);
    const section = pick(SECTIONS, i + 1);
    const classes = [`Grade ${grade} · ${section}`];
    if (i % 4 === 0) {
      const g2 = pick(GRADES, i * 5 + 2);
      classes.push(`Grade ${g2} · ${pick(SECTIONS, i + 2)}`);
    }
    const studentCount = 18 + ((i * 7) % 12);
    const avgPfi = 58 + ((i * 13) % 28);
    const pfiTrend = ((i * 5) % 11) - 5;
    let status: TeacherStatus = "active";
    if (i === 2 || i === 8 || i === 13) status = "dormant";
    else if (i === 4 || i === 11) status = "invited";
    else if (i === 17) status = "pending";

    out.push({
      id: `t_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@school.edu`,
      initials: initialsOf(name),
      subject,
      classes,
      studentCount,
      avgPfi,
      pfiTrend,
      status,
      lastActiveDays: status === "active" ? i % 3 : status === "dormant" ? 9 + (i % 8) : undefined,
      joinedDaysAgo: status === "active" || status === "dormant" ? 30 + i * 4 : undefined,
      invitedDaysAgo: status === "invited" ? 2 + (i % 5) : status === "pending" ? 8 : undefined,
    });
  }
  return out;
}

function buildClasses(teachers: SchoolTeacher[]): SchoolClassRow[] {
  const out: SchoolClassRow[] = [];
  let id = 0;
  teachers.forEach((t) => {
    if (t.status === "invited" || t.status === "pending") return;
    t.classes.forEach((cl) => {
      const [, gradeRaw, section] = cl.match(/Grade ([^\s]+) · ([A-Z])/) ?? [];
      const grade = gradeRaw ?? "3";
      const sec = section ?? "A";
      const size = t.studentCount + ((id * 3) % 5) - 2;
      const avgPfi = Math.max(40, Math.min(94, t.avgPfi + ((id * 7) % 9) - 4));
      const trend = ((id * 5) % 11) - 5;
      const atRisk = Math.max(0, Math.round(size * (0.12 + ((id * 3) % 7) / 100) - (id % 2)));
      const monthlyCheckIn = id % 4 !== 0;
      const engagementPct = 60 + ((id * 11) % 32);
      out.push({
        id: `c_${++id}`,
        name: cl,
        grade,
        section: sec,
        teacherId: t.id,
        teacherName: t.name,
        size,
        avgPfi,
        pfiTrend: trend,
        atRisk,
        monthlyCheckIn,
        engagementPct,
      });
    });
  });
  return out;
}

function computeKpis(teachers: SchoolTeacher[], classes: SchoolClassRow[]): SchoolKpis {
  const active = teachers.filter((t) => t.status === "active").length;
  const invited = teachers.filter((t) => t.status === "invited").length;
  const pending = teachers.filter((t) => t.status === "pending").length;
  const totalStudents = classes.reduce((acc, c) => acc + c.size, 0);
  const atRiskCount = classes.reduce((acc, c) => acc + c.atRisk, 0);
  const sumPfi = classes.reduce((acc, c) => acc + c.avgPfi * c.size, 0);
  const avgSchoolPfi = totalStudents > 0 ? Math.round(sumPfi / totalStudents) : 0;
  const monthlyCheckInsDone = classes.filter((c) => c.monthlyCheckIn).length;
  return {
    totalStudents,
    totalTeachers: teachers.length,
    activeTeachers: active,
    invitedTeachers: invited,
    pendingTeachers: pending,
    avgSchoolPfi,
    avgPfiTrend: 4,
    atRiskCount,
    atRiskPct: totalStudents > 0 ? Math.round((atRiskCount / totalStudents) * 100) : 0,
    monthlyCheckInsDone,
    monthlyCheckInsTotal: classes.length,
    parentActivationPct: 64,
    parentActivationTrend: 7,
  };
}

const TEACHERS = buildTeachers();
const CLASSES = buildClasses(TEACHERS);
const KPIS = computeKpis(TEACHERS, CLASSES);

export function getSchoolTeachers(): SchoolTeacher[] {
  return TEACHERS;
}
export function getSchoolClasses(): SchoolClassRow[] {
  return CLASSES;
}
export function getSchoolKpis(): SchoolKpis {
  return KPIS;
}

// Intra-day attention curve — 8 points across the school day, used as a
// secondary signal alongside the monthly check-in. Hour-of-day, not cadence.
export function schoolDailyAttention(): { hour: string; attention: number }[] {
  const HOURS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"];
  const PFI = [62, 71, 78, 81, 74, 67, 70, 65];
  return HOURS.map((h, i) => ({ hour: h, attention: PFI[i] }));
}

export const TEACHER_LEADERBOARD = (() => {
  const ranked = [...TEACHERS]
    .filter((t) => t.status === "active" || t.status === "dormant")
    .sort((a, b) => b.avgPfi - a.avgPfi);
  return {
    top: ranked.slice(0, 5),
    needsSupport: ranked.slice(-5).reverse(),
  };
})();

export type SchoolEventKind = "celebration" | "alert" | "info";
export type SchoolEventSeverity = "critical" | "warning";
export type SchoolEventCtaTarget =
  | "/school/teachers"
  | "/school/classes"
  | "/school/reports"
  | "/school/settings";

export type SchoolRecentEvent = {
  id: string;
  kind: SchoolEventKind;
  title: string;
  body: string;
  time: string;
  severity?: SchoolEventSeverity;
  recommend?: {
    title: string;
    reason: string;
  };
  cta?: { label: string; to: SchoolEventCtaTarget };
};

export const SCHOOL_RECENT_EVENTS: SchoolRecentEvent[] = [
  {
    id: "e5",
    kind: "alert",
    severity: "critical",
    title: "Class 3 readiness dropped 8 pts",
    body: "Grade 3 · 28 students — focus and task initiation softened over the last two weeks.",
    time: "2d ago",
    recommend: {
      title: "Add a 3-min focus warm-up before core blocks",
      reason:
        "Short focus drills lift task initiation by ~14% in similar Grade 3 cohorts within two weeks.",
    },
    cta: { label: "View class", to: "/school/classes" },
  },
  {
    id: "e2",
    kind: "alert",
    severity: "warning",
    title: "3 classes haven't run this month's check-in",
    body: "Grades 6B, 7A, 8C are due — auto-nudge sent to teachers.",
    time: "Today",
    recommend: {
      title: "Pair the nudge with a 5-min co-plan slot",
      reason:
        "Lead teachers in these sections reported scheduling friction; a co-plan slot recovers ~12 mins/class in week one.",
    },
    cta: { label: "Open class list", to: "/school/classes" },
  },
  {
    id: "e6",
    kind: "alert",
    severity: "warning",
    title: "Disruption events up 18% in Science blocks",
    body: "Grade 6–8 Science · transitions between lab segments absorbing teaching time.",
    time: "Yesterday",
    recommend: {
      title: "Cue lab transitions with a visible 60-sec timer",
      reason:
        "Visible timers cut transition loss by ~30% across the cohorts running them this term.",
    },
    cta: { label: "Coach teachers", to: "/school/teachers" },
  },
  {
    id: "e1",
    kind: "celebration",
    title: "Grade 4 · Section B led the school this month",
    body: "Highest sustained focus in this month's check-in.",
    time: "1h ago",
    cta: { label: "View class", to: "/school/classes" },
  },
  {
    id: "e4",
    kind: "celebration",
    title: "Parent activation crossed 60%",
    body: "238 of 376 families now active in the Yellow app.",
    time: "2d ago",
  },
  {
    id: "e3",
    kind: "info",
    title: "Monthly all-staff digest scheduled",
    body: "Goes out at month-end to 18 teachers and 2 admins.",
    time: "Yesterday",
  },
];
