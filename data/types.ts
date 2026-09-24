import type { RealStudent } from "@/data/realStudents";

export type DemoDatasetId = "bishop-cotton";

export type DemoSchoolMetric = {
  value: number | null;
  sourceColumn: string;
  calculation: "source" | "average";
  sourceCount: number;
  totalCount: number;
};

export type DemoSchoolMetrics = {
  schoolHealthScore: DemoSchoolMetric;
  cognitivePerformanceScore: DemoSchoolMetric;
  attentionAndFocus: DemoSchoolMetric;
  taskEngagement: DemoSchoolMetric;
  behaviourAndDiscipline: DemoSchoolMetric;
  instructionalFriction: DemoSchoolMetric;
  learningReadinessScore: DemoSchoolMetric;
  readingComprehension: DemoSchoolMetric;
  recallRetention: DemoSchoolMetric;
  problemSolving: DemoSchoolMetric;
  reasoning: DemoSchoolMetric;
  creativeExpression: DemoSchoolMetric;
  studentWellbeingScore: DemoSchoolMetric;
  anxietyAndCopingIndex: DemoSchoolMetric;
  peerSafetyAndBelonging: DemoSchoolMetric;
  angerAndEmotionalRegulation: DemoSchoolMetric;
};

export type DemoDataMapping = {
  sheet: string;
  column: string;
  meaning: string;
  dashboardSection: string;
  uiComponent: string;
  variableName: string;
};

export type DemoTeacher = {
  id: string;
  name: string;
  role: "teacher";
};

export type DemoClassroom = {
  id: string;
  schoolName: string;
  label: string;
  teacherId: string;
  studentIds: string[];
};

export type DemoSchoolDataset = {
  id: DemoDatasetId;
  schoolName: string;
  displayName: string;
  source: {
    workbookName: string;
    sheetName: string;
    notes: string;
  };
  teachers: DemoTeacher[];
  classrooms: DemoClassroom[];
  students: RealStudent[];
  metrics: DemoSchoolMetrics;
  mappings: DemoDataMapping[];
};
