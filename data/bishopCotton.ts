import { REAL_STUDENTS, type RealStudent } from "@/data/realStudents";
import type { DemoDataMapping, DemoSchoolDataset, DemoSchoolMetric } from "@/data/types";

const SHEET_NAME = "Student metrics export";
const DASHBOARD_CLASSROOM = "Bishop Cotton School - Demo Class";
const TEACHER_ID = "teacher-maya-khan";

function average(
  students: RealStudent[],
  pick: (student: RealStudent) => number | null,
): number | null {
  const values = students.map(pick).filter((value): value is number => value != null);
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function metric(
  value: number | null,
  sourceColumn: string,
  calculation: DemoSchoolMetric["calculation"] = "average",
): DemoSchoolMetric {
  return { value, sourceColumn, calculation };
}

const mappings: DemoDataMapping[] = [
  {
    sheet: SHEET_NAME,
    column: "User ID",
    meaning: "Stable student identifier from the source export.",
    dashboardSection: "Student drilldown",
    uiComponent: "StudentDrilldownRow / student profile",
    variableName: "student.id",
  },
  {
    sheet: SHEET_NAME,
    column: "Student Health Score",
    meaning: "Per-student overall health score.",
    dashboardSection: "Classroom Health",
    uiComponent: "ClassroomHealthScore / StudentDrilldownRow",
    variableName: "student.studentHealthScore",
  },
  {
    sheet: SHEET_NAME,
    column: "Cognitive Performance Score",
    meaning: "Per-student cognitive performance composite.",
    dashboardSection: "Driver cards",
    uiComponent: "DriverCards",
    variableName: "student.cognitivePerformance.score",
  },
  {
    sheet: SHEET_NAME,
    column: "Task Engagement",
    meaning: "Per-student task engagement signal.",
    dashboardSection: "Classroom Health / Yellow recommendations",
    uiComponent: "ClassroomHealthScore / WeeklyFocus",
    variableName: "student.cognitivePerformance.taskEngagement",
  },
  {
    sheet: SHEET_NAME,
    column: "Learning Readiness Score",
    meaning: "Per-student readiness-to-learn score.",
    dashboardSection: "Driver cards / Yellow recommendations",
    uiComponent: "DriverCards / WeeklyFocus",
    variableName: "student.cognitivePerformance.learningReadiness.score",
  },
  {
    sheet: SHEET_NAME,
    column: "Reading and Comprehension",
    meaning: "Learning readiness sub-skill score.",
    dashboardSection: "Learning readiness",
    uiComponent: "LearningReadinessAreas",
    variableName: "student.cognitivePerformance.learningReadiness.readingComprehension",
  },
  {
    sheet: SHEET_NAME,
    column: "Recall and Retention",
    meaning: "Learning readiness sub-skill score.",
    dashboardSection: "Learning readiness",
    uiComponent: "LearningReadinessAreas",
    variableName: "student.cognitivePerformance.learningReadiness.recallRetention",
  },
  {
    sheet: SHEET_NAME,
    column: "Problem Solving",
    meaning: "Learning readiness sub-skill score.",
    dashboardSection: "Learning readiness",
    uiComponent: "LearningReadinessAreas",
    variableName: "student.cognitivePerformance.learningReadiness.problemSolving",
  },
  {
    sheet: SHEET_NAME,
    column: "Reasoning",
    meaning: "Learning readiness sub-skill score.",
    dashboardSection: "Learning readiness",
    uiComponent: "LearningReadinessAreas",
    variableName: "student.cognitivePerformance.learningReadiness.reasoning",
  },
  {
    sheet: SHEET_NAME,
    column: "Creative Expression",
    meaning: "Learning readiness sub-skill score.",
    dashboardSection: "Learning readiness",
    uiComponent: "LearningReadinessAreas",
    variableName: "student.cognitivePerformance.learningReadiness.creativeExpression",
  },
  {
    sheet: SHEET_NAME,
    column: "Student Wellbeing Score",
    meaning: "Per-student wellbeing composite where present.",
    dashboardSection: "Wellbeing driver cards",
    uiComponent: "WellbeingDriverCards",
    variableName: "student.studentWellbeing.score",
  },
  {
    sheet: SHEET_NAME,
    column: "Peer Safety and Belonging",
    meaning: "Per-student peer safety and belonging signal where present.",
    dashboardSection: "Wellbeing driver cards",
    uiComponent: "WellbeingDriverCards",
    variableName: "student.studentWellbeing.peerSafetyAndBelonging",
  },
];

export const bishopCottonSchool: DemoSchoolDataset = {
  id: "bishop-cotton",
  schoolName: "Bishop Cotton School",
  displayName: "Bishop Cotton School Demo",
  source: {
    workbookName: "Bishop Cotton School metrics export",
    sheetName: SHEET_NAME,
    notes:
      "Mapped from the pasted Bishop Cotton School student metrics table. Null values represent blank cells in the source data.",
  },
  teachers: [
    {
      id: TEACHER_ID,
      name: "Maya Khan",
      role: "teacher",
    },
  ],
  classrooms: [
    {
      id: "bishop-cotton-demo-class",
      schoolName: "Bishop Cotton School",
      label: DASHBOARD_CLASSROOM,
      teacherId: TEACHER_ID,
      studentIds: REAL_STUDENTS.map((student) => student.id),
    },
  ],
  students: REAL_STUDENTS,
  metrics: {
    schoolHealthScore: metric(
      average(REAL_STUDENTS, (student) => student.studentHealthScore),
      "Student Health Score",
    ),
    cognitivePerformanceScore: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.score),
      "Cognitive Performance Score",
    ),
    taskEngagement: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.taskEngagement),
      "Task Engagement",
    ),
    learningReadinessScore: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.score),
      "Learning Readiness Score",
    ),
    readingComprehension: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.readingComprehension),
      "Reading and Comprehension",
    ),
    recallRetention: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.recallRetention),
      "Recall and Retention",
    ),
    problemSolving: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.problemSolving),
      "Problem Solving",
    ),
    reasoning: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.reasoning),
      "Reasoning",
    ),
    creativeExpression: metric(
      average(REAL_STUDENTS, (student) => student.cognitivePerformance.learningReadiness.creativeExpression),
      "Creative Expression",
    ),
    studentWellbeingScore: metric(
      average(REAL_STUDENTS, (student) => student.studentWellbeing.score),
      "Student Wellbeing Score",
    ),
    peerSafetyAndBelonging: metric(
      average(REAL_STUDENTS, (student) => student.studentWellbeing.peerSafetyAndBelonging),
      "Peer Safety and Belonging",
    ),
  },
  mappings,
};

export const activeDemoSchool = bishopCottonSchool;
