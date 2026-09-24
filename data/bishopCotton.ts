import { REAL_STUDENTS, type RealStudent } from "@/data/realStudents";
import type { DemoDataMapping, DemoSchoolDataset, DemoSchoolMetric } from "@/data/types";

const SHEET_NAME = "Student metrics export";
const DASHBOARD_CLASSROOM = "Bishop Cotton School - Demo Class";
const TEACHER_ID = "teacher-maya-khan";

function averageMetric(
  students: RealStudent[],
  pick: (student: RealStudent) => number | null,
  sourceColumn: string,
): DemoSchoolMetric {
  const values = students.map(pick).filter((value): value is number => value != null);
  const value =
    values.length === 0
      ? null
      : Math.round((values.reduce((sum, current) => sum + current, 0) / values.length) * 100) / 100;
  return {
    value,
    sourceColumn,
    calculation: "average",
    sourceCount: values.length,
    totalCount: students.length,
  };
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
    column: "Attention and Focus",
    meaning: "Per-student attention and focus score.",
    dashboardSection: "Driver cards",
    uiComponent: "DriverCards",
    variableName: "student.cognitivePerformance.attentionAndFocus",
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
    column: "Behaviour and Discipline",
    meaning: "Per-student behaviour and discipline score where present.",
    dashboardSection: "Driver cards",
    uiComponent: "DriverCards",
    variableName: "student.cognitivePerformance.behaviourAndDiscipline",
  },
  {
    sheet: SHEET_NAME,
    column: "Instructional Friction",
    meaning: "Per-student instructional friction score where present.",
    dashboardSection: "Classroom efficiency",
    uiComponent: "ClassroomHealthScore",
    variableName: "student.cognitivePerformance.instructionalFriction",
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
    column: "Anxiety and Coping Index",
    meaning: "Per-student anxiety and coping score where present.",
    dashboardSection: "Wellbeing driver cards",
    uiComponent: "WellbeingDriverCards",
    variableName: "student.studentWellbeing.anxietyAndCopingIndex",
  },
  {
    sheet: SHEET_NAME,
    column: "Peer Safety and Belonging",
    meaning: "Per-student peer safety and belonging signal where present.",
    dashboardSection: "Wellbeing driver cards",
    uiComponent: "WellbeingDriverCards",
    variableName: "student.studentWellbeing.peerSafetyAndBelonging",
  },
  {
    sheet: SHEET_NAME,
    column: "Anger and Emotional Regulation",
    meaning: "Per-student anger and emotional regulation score where present.",
    dashboardSection: "Wellbeing driver cards",
    uiComponent: "WellbeingDriverCards",
    variableName: "student.studentWellbeing.angerAndEmotionalRegulation",
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
      "Mapped from the pasted Bishop Cotton School student metrics table. Null values represent blank cells or the source #DIV/0! value.",
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
    schoolHealthScore: averageMetric(
      REAL_STUDENTS,
      (student) => student.studentHealthScore,
      "Student Health Score",
    ),
    cognitivePerformanceScore: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.score,
      "Cognitive Performance Score",
    ),
    attentionAndFocus: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.attentionAndFocus,
      "Attention and Focus",
    ),
    taskEngagement: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.taskEngagement,
      "Task Engagement",
    ),
    behaviourAndDiscipline: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.behaviourAndDiscipline,
      "Behaviour and Discipline",
    ),
    instructionalFriction: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.instructionalFriction,
      "Instructional Friction",
    ),
    learningReadinessScore: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.score,
      "Learning Readiness Score",
    ),
    readingComprehension: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.readingComprehension,
      "Reading and Comprehension",
    ),
    recallRetention: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.recallRetention,
      "Recall and Retention",
    ),
    problemSolving: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.problemSolving,
      "Problem Solving",
    ),
    reasoning: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.reasoning,
      "Reasoning",
    ),
    creativeExpression: averageMetric(
      REAL_STUDENTS,
      (student) => student.cognitivePerformance.learningReadiness.creativeExpression,
      "Creative Expression",
    ),
    studentWellbeingScore: averageMetric(
      REAL_STUDENTS,
      (student) => student.studentWellbeing.score,
      "Student Wellbeing Score",
    ),
    anxietyAndCopingIndex: averageMetric(
      REAL_STUDENTS,
      (student) => student.studentWellbeing.anxietyAndCopingIndex,
      "Anxiety and Coping Index",
    ),
    peerSafetyAndBelonging: averageMetric(
      REAL_STUDENTS,
      (student) => student.studentWellbeing.peerSafetyAndBelonging,
      "Peer Safety and Belonging",
    ),
    angerAndEmotionalRegulation: averageMetric(
      REAL_STUDENTS,
      (student) => student.studentWellbeing.angerAndEmotionalRegulation,
      "Anger and Emotional Regulation",
    ),
  },
  mappings,
};

export const activeDemoSchool = bishopCottonSchool;
