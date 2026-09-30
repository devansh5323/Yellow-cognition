// Classroom-level (L2) data transcribed from Bishop Cottons Students.pdf.
// This module is intentionally separate from the L1 roster in realStudents.ts.
// Blank spreadsheet cells and #DIV/0! values are represented as null.

export type L2PeriodBase = {
  startDate: string;
  endDate: string;
  activeUsers: number | null;
  totalLogs: number | null;
};

export type FocusStatus = "Focussed" | "Fluctuating" | "Distracted";

export type FocusTrendPoint = L2PeriodBase & {
  averageScore: number | null;
  status: FocusStatus;
};

export type FocusStudentGrowth = {
  userId: string;
  currentScore: number;
  previousScore: number;
  growthPct: number;
  currentStatus: FocusStatus;
  previousStatus: FocusStatus;
};

export type LearningReadinessTrendPoint = L2PeriodBase & {
  learningReadiness: number | null;
  readingAndComprehension: number | null;
  recallAndRetention: number | null;
  problemSolving: number | null;
  reasoning: number | null;
  creativeExpression: number | null;
};

export type TaskEngagementTrendPoint = L2PeriodBase & {
  taskEngagementScore: number | null;
  consistency: number | null;
  taskInitiation: number | null;
  independentExecution: number | null;
  responseToChallenge: number | null;
  persistence: number | null;
  planningAndTimeManagement: number | null;
  completion: number | null;
};

export type BehaviorTrendPoint = L2PeriodBase & {
  behaviorAndDisciplineScore: number | null;
  offTaskBehavior: number | null;
  nonCompliance: number | null;
  participationControl: number | null;
  peerSafetyAndBelonging: number | null;
  impulseControl: number | null;
  angerAndEmotionalRegulation: number | null;
};

const focusMonthly: FocusTrendPoint[] = [
  { startDate: "2026-04-01", endDate: "2026-04-30", averageScore: 48.68, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-05-01", endDate: "2026-05-31", averageScore: 52.85, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-01", endDate: "2026-06-30", averageScore: 46.83, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-07-01", endDate: "2026-07-31", averageScore: 56.33, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-08-01", endDate: "2026-08-31", averageScore: 50.06, status: "Fluctuating", activeUsers: null, totalLogs: null },
];

const focusStudentGrowth: FocusStudentGrowth[] = [
  { userId: "69dc85547ec07d4b67b14192", currentScore: 52.79, previousScore: 52.14, growthPct: 1.25, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dc856b7ec07d4b67b14199", currentScore: 32.52, previousScore: 32.52, growthPct: 0, currentStatus: "Distracted", previousStatus: "Distracted" },
  { userId: "69dc85877ec07d4b67b1419d", currentScore: 51.83, previousScore: 51.99, growthPct: -0.31, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dc859b7ec07d4b67b141a0", currentScore: 40.12, previousScore: 37.88, growthPct: 5.91, currentStatus: "Fluctuating", previousStatus: "Distracted" },
  { userId: "69dc85ad7ec07d4b67b141aa", currentScore: 55.95, previousScore: 55.9, growthPct: 0.09, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dc85c07ec07d4b67b141b1", currentScore: 54.98, previousScore: 55.2, growthPct: -0.4, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dc8a1f7ec07d4b67b141de", currentScore: 46.66, previousScore: 45.11, growthPct: 3.44, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dcbc6d767cbb6e1a7a9212", currentScore: 55.39, previousScore: 67.42, growthPct: -17.84, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69dcfbc1f0593243d066ebce", currentScore: 37.12, previousScore: 41.44, growthPct: -10.42, currentStatus: "Distracted", previousStatus: "Fluctuating" },
  { userId: "69dd1c1df0593243d066ebe6", currentScore: 39.48, previousScore: 40.97, growthPct: -3.64, currentStatus: "Distracted", previousStatus: "Fluctuating" },
  { userId: "69de446ef0593243d066ed05", currentScore: 53.63, previousScore: 56.96, growthPct: -5.85, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69de4872f0593243d066ed13", currentScore: 41.11, previousScore: 38.94, growthPct: 5.57, currentStatus: "Fluctuating", previousStatus: "Distracted" },
  { userId: "69df2a67f0593243d066ed7d", currentScore: 47.5, previousScore: 47.5, growthPct: 0, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69df85f9f0593243d066edf9", currentScore: 60.22, previousScore: 60.43, growthPct: -0.35, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69f1ec1d4b6ad164e9ae8c43", currentScore: 52.17, previousScore: 52.07, growthPct: 0.19, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
  { userId: "69e64e7df0593243d066f115", currentScore: 53, previousScore: 53.03, growthPct: -0.06, currentStatus: "Fluctuating", previousStatus: "Fluctuating" },
];

const focusWeekly: FocusTrendPoint[] = [
  { startDate: "2026-04-13", endDate: "2026-04-19", averageScore: 48.99, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-04-20", endDate: "2026-04-26", averageScore: 51.86, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-04-27", endDate: "2026-05-03", averageScore: 49.75, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-05-04", endDate: "2026-05-10", averageScore: 53.02, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-05-11", endDate: "2026-05-17", averageScore: 50.46, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-05-18", endDate: "2026-05-24", averageScore: 52.99, status: "Distracted", activeUsers: null, totalLogs: null },
  { startDate: "2026-05-25", endDate: "2026-05-31", averageScore: 56.12, status: "Distracted", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-01", endDate: "2026-06-07", averageScore: 53.15, status: "Distracted", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-08", endDate: "2026-06-14", averageScore: 55.27, status: "Focussed", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-15", endDate: "2026-06-21", averageScore: 58.88, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-22", endDate: "2026-06-28", averageScore: 44.79, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-06-29", endDate: "2026-07-05", averageScore: 48.86, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-07-06", endDate: "2026-07-12", averageScore: 56.95, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-07-13", endDate: "2026-07-19", averageScore: 62.24, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-07-20", endDate: "2026-07-26", averageScore: 61.83, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-07-27", endDate: "2026-08-02", averageScore: 61.31, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-08-03", endDate: "2026-08-09", averageScore: 68.64, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-08-10", endDate: "2026-08-16", averageScore: 42.89, status: "Fluctuating", activeUsers: null, totalLogs: null },
  { startDate: "2026-08-17", endDate: "2026-08-23", averageScore: null, status: "Fluctuating", activeUsers: 0, totalLogs: 0 },
  { startDate: "2026-08-24", endDate: "2026-08-30", averageScore: 46.3, status: "Fluctuating", activeUsers: null, totalLogs: null },
];

const learningReadinessMonthly: LearningReadinessTrendPoint[] = [
  { startDate: "2026-04-01", endDate: "2026-04-30", learningReadiness: 52.02, readingAndComprehension: 53.45, recallAndRetention: 49.05, problemSolving: 49.65, reasoning: 53.35, creativeExpression: 54.58, activeUsers: 15, totalLogs: 8193 },
  { startDate: "2026-05-01", endDate: "2026-05-31", learningReadiness: 57.5, readingAndComprehension: 56.9, recallAndRetention: 57.22, problemSolving: 57.01, reasoning: 56.74, creativeExpression: 59.65, activeUsers: 9, totalLogs: 5652 },
  { startDate: "2026-06-01", endDate: "2026-06-30", learningReadiness: 57.45, readingAndComprehension: 61.69, recallAndRetention: 56.28, problemSolving: 57.14, reasoning: 58.88, creativeExpression: 57.97, activeUsers: 7, totalLogs: 3773 },
  { startDate: "2026-07-01", endDate: "2026-07-31", learningReadiness: 58.39, readingAndComprehension: 63.47, recallAndRetention: 59.47, problemSolving: 60.03, reasoning: 56.33, creativeExpression: 58.37, activeUsers: 5, totalLogs: 3600 },
  { startDate: "2026-08-01", endDate: "2026-08-31", learningReadiness: 55.95, readingAndComprehension: 55.94, recallAndRetention: 54.58, problemSolving: 54.33, reasoning: 54.55, creativeExpression: 54.73, activeUsers: 11, totalLogs: 1665 },
];

const learningReadinessWeekly: LearningReadinessTrendPoint[] = [
  { startDate: "2026-04-13", endDate: "2026-04-19", learningReadiness: 52.98, readingAndComprehension: 54.69, recallAndRetention: 49.26, problemSolving: 51.18, reasoning: 52.59, creativeExpression: 56.05, activeUsers: 13, totalLogs: 4395 },
  { startDate: "2026-04-20", endDate: "2026-04-26", learningReadiness: 56.89, readingAndComprehension: 57.71, recallAndRetention: 55.01, problemSolving: 53.2, reasoning: 56.73, creativeExpression: 59.21, activeUsers: 6, totalLogs: 2312 },
  { startDate: "2026-04-27", endDate: "2026-05-03", learningReadiness: 51.08, readingAndComprehension: 52.8, recallAndRetention: 50.88, problemSolving: 46.99, reasoning: 55.97, creativeExpression: 48.78, activeUsers: 6, totalLogs: 2123 },
  { startDate: "2026-05-04", endDate: "2026-05-10", learningReadiness: 58.33, readingAndComprehension: 56.26, recallAndRetention: 66.17, problemSolving: 59.27, reasoning: 58.61, creativeExpression: 57.35, activeUsers: 7, totalLogs: 1436 },
  { startDate: "2026-05-11", endDate: "2026-05-17", learningReadiness: 55.61, readingAndComprehension: 53.5, recallAndRetention: 62.12, problemSolving: 56.08, reasoning: 56.09, creativeExpression: 50.79, activeUsers: 5, totalLogs: 1361 },
  { startDate: "2026-05-18", endDate: "2026-05-24", learningReadiness: 58.28, readingAndComprehension: 56.81, recallAndRetention: 57.59, problemSolving: 58.64, reasoning: 58.12, creativeExpression: 61.55, activeUsers: 7, totalLogs: 1238 },
  { startDate: "2026-05-25", endDate: "2026-05-31", learningReadiness: 61.35, readingAndComprehension: 62.39, recallAndRetention: 58.25, problemSolving: 63.59, reasoning: 59.4, creativeExpression: 64.08, activeUsers: 4, totalLogs: 980 },
  { startDate: "2026-06-01", endDate: "2026-06-07", learningReadiness: 58.05, readingAndComprehension: 61.25, recallAndRetention: 55.19, problemSolving: 59.22, reasoning: 58.28, creativeExpression: 59.35, activeUsers: 6, totalLogs: 1724 },
  { startDate: "2026-06-08", endDate: "2026-06-14", learningReadiness: 61.01, readingAndComprehension: 66.1, recallAndRetention: 65.21, problemSolving: 58, reasoning: 63.89, creativeExpression: 60.5, activeUsers: 4, totalLogs: 852 },
  { startDate: "2026-06-15", endDate: "2026-06-21", learningReadiness: 62.09, readingAndComprehension: 65.44, recallAndRetention: 62.85, problemSolving: 54.79, reasoning: 62.65, creativeExpression: 64.72, activeUsers: 3, totalLogs: 692 },
  { startDate: "2026-06-22", endDate: "2026-06-28", learningReadiness: 62.33, readingAndComprehension: 65.9, recallAndRetention: 57.37, problemSolving: 57.42, reasoning: 61.03, creativeExpression: 61.07, activeUsers: 3, totalLogs: 289 },
  { startDate: "2026-06-29", endDate: "2026-07-05", learningReadiness: 57.49, readingAndComprehension: 62.59, recallAndRetention: 53.16, problemSolving: 59.02, reasoning: 56.2, creativeExpression: 56.46, activeUsers: 3, totalLogs: 811 },
  { startDate: "2026-07-06", endDate: "2026-07-12", learningReadiness: 60.44, readingAndComprehension: 64.51, recallAndRetention: 64.9, problemSolving: 61.74, reasoning: 61.83, creativeExpression: 62.31, activeUsers: 4, totalLogs: 369 },
  { startDate: "2026-07-13", endDate: "2026-07-19", learningReadiness: 68.78, readingAndComprehension: 70.37, recallAndRetention: 82.03, problemSolving: 58.97, reasoning: 68.79, creativeExpression: 63.74, activeUsers: 2, totalLogs: 1936 },
  { startDate: "2026-07-20", endDate: "2026-07-26", learningReadiness: 69.43, readingAndComprehension: 67.37, recallAndRetention: 84.33, problemSolving: 68.92, reasoning: 68.66, creativeExpression: 64.13, activeUsers: 2, totalLogs: 318 },
  { startDate: "2026-07-27", endDate: "2026-08-02", learningReadiness: 65.32, readingAndComprehension: 65.98, recallAndRetention: 60.31, problemSolving: 64.59, reasoning: 62.06, creativeExpression: 69.43, activeUsers: 3, totalLogs: 524 },
  { startDate: "2026-08-03", endDate: "2026-08-09", learningReadiness: 72.13, readingAndComprehension: 82.66, recallAndRetention: 80.02, problemSolving: 58.07, reasoning: 69.28, creativeExpression: 73.59, activeUsers: 2, totalLogs: 667 },
  { startDate: "2026-08-10", endDate: "2026-08-16", learningReadiness: 72.84, readingAndComprehension: 83.2, recallAndRetention: 76.69, problemSolving: 54.66, reasoning: 75.48, creativeExpression: 74.16, activeUsers: 1, totalLogs: 298 },
  { startDate: "2026-08-17", endDate: "2026-08-23", learningReadiness: null, readingAndComprehension: null, recallAndRetention: null, problemSolving: null, reasoning: null, creativeExpression: null, activeUsers: 0, totalLogs: 0 },
  { startDate: "2026-08-24", endDate: "2026-08-30", learningReadiness: 52.43, readingAndComprehension: 49.48, recallAndRetention: 50.12, problemSolving: 55.72, reasoning: 52.5, creativeExpression: 45.84, activeUsers: 9, totalLogs: 558 },
];

const taskEngagementMonthly: TaskEngagementTrendPoint[] = [
  { startDate: "2026-04-01", endDate: "2026-04-30", taskEngagementScore: 48.57, consistency: 57.33, taskInitiation: 49.38, independentExecution: 55.6, responseToChallenge: 60.07, persistence: 51.71, planningAndTimeManagement: 48.6, completion: 3.58, activeUsers: 15, totalLogs: 5744 },
  { startDate: "2026-05-01", endDate: "2026-05-31", taskEngagementScore: 51.74, consistency: 61.68, taskInitiation: 62.73, independentExecution: 58.26, responseToChallenge: 63.25, persistence: 57.19, planningAndTimeManagement: 56.05, completion: 3.83, activeUsers: 9, totalLogs: 3289 },
  { startDate: "2026-06-01", endDate: "2026-06-30", taskEngagementScore: 43.43, consistency: 57.69, taskInitiation: 65, independentExecution: 63.61, responseToChallenge: 57.51, persistence: 48.06, planningAndTimeManagement: 58.77, completion: 2.27, activeUsers: 9, totalLogs: 2190 },
  { startDate: "2026-07-01", endDate: "2026-07-31", taskEngagementScore: 57.23, consistency: 67.74, taskInitiation: 62.34, independentExecution: 58.01, responseToChallenge: 65.32, persistence: 56.28, planningAndTimeManagement: 57.11, completion: 2.58, activeUsers: 9, totalLogs: 1783 },
  { startDate: "2026-08-01", endDate: "2026-08-31", taskEngagementScore: 55.07, consistency: 66.89, taskInitiation: 53.02, independentExecution: 64.46, responseToChallenge: 61.76, persistence: 54.92, planningAndTimeManagement: 54.66, completion: 1.25, activeUsers: 12, totalLogs: 1659 },
];

const taskEngagementWeekly: TaskEngagementTrendPoint[] = [
  { startDate: "2026-04-13", endDate: "2026-04-19", taskEngagementScore: 48.96, consistency: 58.01, taskInitiation: 47.36, independentExecution: 56.03, responseToChallenge: 60.02, persistence: 50.96, planningAndTimeManagement: 50.35, completion: 2.08, activeUsers: 13, totalLogs: 3426 },
  { startDate: "2026-04-20", endDate: "2026-04-26", taskEngagementScore: 52.43, consistency: 63.71, taskInitiation: 62.12, independentExecution: 62.47, responseToChallenge: 62.82, persistence: 57.95, planningAndTimeManagement: 58.14, completion: 2.83, activeUsers: 6, totalLogs: 1167 },
  { startDate: "2026-04-27", endDate: "2026-05-03", taskEngagementScore: 49.92, consistency: 59.24, taskInitiation: 57.6, independentExecution: 56.6, responseToChallenge: 58.96, persistence: 53.19, planningAndTimeManagement: 48.51, completion: 2.84, activeUsers: 6, totalLogs: 1478 },
  { startDate: "2026-05-04", endDate: "2026-05-10", taskEngagementScore: 44.76, consistency: 61.28, taskInitiation: 63.35, independentExecution: 63.19, responseToChallenge: 63.76, persistence: 60.68, planningAndTimeManagement: 59.23, completion: 1.57, activeUsers: 7, totalLogs: 714 },
  { startDate: "2026-05-11", endDate: "2026-05-17", taskEngagementScore: 51.69, consistency: 59.03, taskInitiation: 66.97, independentExecution: 56.8, responseToChallenge: 63.87, persistence: 53.24, planningAndTimeManagement: 56.31, completion: 3.01, activeUsers: 5, totalLogs: 917 },
  { startDate: "2026-05-18", endDate: "2026-05-24", taskEngagementScore: 49.37, consistency: 65.31, taskInitiation: 61.31, independentExecution: 55.53, responseToChallenge: 65.67, persistence: 53.19, planningAndTimeManagement: 56.86, completion: 1.55, activeUsers: 7, totalLogs: 829 },
  { startDate: "2026-05-25", endDate: "2026-05-31", taskEngagementScore: 53.63, consistency: 67.21, taskInitiation: 62.04, independentExecution: 63.98, responseToChallenge: 66.43, persistence: 57.6, planningAndTimeManagement: 59.88, completion: 1.5, activeUsers: 4, totalLogs: 502 },
  { startDate: "2026-06-01", endDate: "2026-06-07", taskEngagementScore: 48.96, consistency: 65.72, taskInitiation: 64.48, independentExecution: 62.74, responseToChallenge: 64.37, persistence: 57.12, planningAndTimeManagement: 59.2, completion: 1.54, activeUsers: 6, totalLogs: 834 },
  { startDate: "2026-06-08", endDate: "2026-06-14", taskEngagementScore: 47.94, consistency: 66.84, taskInitiation: 66.57, independentExecution: 62.87, responseToChallenge: 68, persistence: 58.64, planningAndTimeManagement: 61.2, completion: 1.04, activeUsers: 4, totalLogs: 623 },
  { startDate: "2026-06-15", endDate: "2026-06-21", taskEngagementScore: 53.6, consistency: 66.99, taskInitiation: 63.96, independentExecution: 67.43, responseToChallenge: 66.98, persistence: 58.56, planningAndTimeManagement: 57.81, completion: 0.94, activeUsers: 3, totalLogs: 435 },
  { startDate: "2026-06-22", endDate: "2026-06-28", taskEngagementScore: 42.74, consistency: 50.65, taskInitiation: null, independentExecution: 67.94, responseToChallenge: 64.73, persistence: 38.31, planningAndTimeManagement: 65.19, completion: 0.71, activeUsers: 5, totalLogs: 117 },
  { startDate: "2026-06-29", endDate: "2026-07-05", taskEngagementScore: 49.23, consistency: 57.71, taskInitiation: 60.2, independentExecution: 53.61, responseToChallenge: 61.71, persistence: 48.47, planningAndTimeManagement: 57.66, completion: 1.72, activeUsers: 7, totalLogs: 450 },
  { startDate: "2026-07-06", endDate: "2026-07-12", taskEngagementScore: 56.51, consistency: 72.49, taskInitiation: 61.63, independentExecution: 67.4, responseToChallenge: 64.18, persistence: 57.22, planningAndTimeManagement: 61.71, completion: 0.62, activeUsers: 6, totalLogs: 250 },
  { startDate: "2026-07-13", endDate: "2026-07-19", taskEngagementScore: 57.62, consistency: 71.99, taskInitiation: 64.12, independentExecution: 71.56, responseToChallenge: 67.97, persistence: 61.33, planningAndTimeManagement: 64.4, completion: 1.99, activeUsers: 2, totalLogs: 711 },
  { startDate: "2026-07-20", endDate: "2026-07-26", taskEngagementScore: 57.44, consistency: 72.72, taskInitiation: null, independentExecution: 69.95, responseToChallenge: 66.14, persistence: 66.83, planningAndTimeManagement: 68.11, completion: 0.92, activeUsers: 2, totalLogs: 177 },
  { startDate: "2026-07-27", endDate: "2026-08-02", taskEngagementScore: 54.59, consistency: 76.15, taskInitiation: null, independentExecution: 66.67, responseToChallenge: 69, persistence: 61.86, planningAndTimeManagement: 61.63, completion: 0.82, activeUsers: 3, totalLogs: 455 },
  { startDate: "2026-08-03", endDate: "2026-08-09", taskEngagementScore: 54.84, consistency: 82.51, taskInitiation: 66.03, independentExecution: 77.37, responseToChallenge: 72.94, persistence: 65.08, planningAndTimeManagement: 68.49, completion: 1.09, activeUsers: 2, totalLogs: 406 },
  { startDate: "2026-08-10", endDate: "2026-08-16", taskEngagementScore: 41.45, consistency: 87.7, taskInitiation: null, independentExecution: 76.29, responseToChallenge: 47.68, persistence: 42.55, planningAndTimeManagement: 66.72, completion: 0.94, activeUsers: 2, totalLogs: 171 },
  { startDate: "2026-08-17", endDate: "2026-08-23", taskEngagementScore: null, consistency: null, taskInitiation: null, independentExecution: null, responseToChallenge: null, persistence: null, planningAndTimeManagement: null, completion: null, activeUsers: 0, totalLogs: 0 },
  { startDate: "2026-08-24", endDate: "2026-08-30", taskEngagementScore: 56.72, consistency: 61.67, taskInitiation: 40, independentExecution: 62.36, responseToChallenge: 59.58, persistence: 53.68, planningAndTimeManagement: 53.56, completion: null, activeUsers: 10, totalLogs: 1003 },
];

const behaviorMonthly: BehaviorTrendPoint[] = [
  { startDate: "2026-04-01", endDate: "2026-04-30", behaviorAndDisciplineScore: 53.87, offTaskBehavior: 57.33, nonCompliance: 55.98, participationControl: 55.72, peerSafetyAndBelonging: 51.85, impulseControl: 50.57, angerAndEmotionalRegulation: 51.2, activeUsers: 15, totalLogs: 6922 },
  { startDate: "2026-05-01", endDate: "2026-05-31", behaviorAndDisciplineScore: 54.39, offTaskBehavior: 65.61, nonCompliance: 62.6, participationControl: 62.33, peerSafetyAndBelonging: 49.22, impulseControl: 60.29, angerAndEmotionalRegulation: 51.16, activeUsers: 10, totalLogs: 4021 },
  { startDate: "2026-06-01", endDate: "2026-06-30", behaviorAndDisciplineScore: 44.46, offTaskBehavior: 66.61, nonCompliance: 64.91, participationControl: 51.43, peerSafetyAndBelonging: 41.03, impulseControl: 61.25, angerAndEmotionalRegulation: 42.75, activeUsers: 9, totalLogs: 1922 },
  { startDate: "2026-07-01", endDate: "2026-07-31", behaviorAndDisciplineScore: 54.51, offTaskBehavior: 73.32, nonCompliance: 65.07, participationControl: 62.25, peerSafetyAndBelonging: 48.44, impulseControl: 67.78, angerAndEmotionalRegulation: 46.57, activeUsers: 9, totalLogs: 1650 },
  { startDate: "2026-08-01", endDate: "2026-08-31", behaviorAndDisciplineScore: 54.78, offTaskBehavior: 70, nonCompliance: 55.91, participationControl: 61.73, peerSafetyAndBelonging: 51.44, impulseControl: 48.68, angerAndEmotionalRegulation: 55.57, activeUsers: 12, totalLogs: 2048 },
];

const behaviorWeekly: BehaviorTrendPoint[] = [
  { startDate: "2026-04-13", endDate: "2026-04-19", behaviorAndDisciplineScore: 53.79, offTaskBehavior: 56.71, nonCompliance: 54.73, participationControl: 56.75, peerSafetyAndBelonging: 50.83, impulseControl: 47.02, angerAndEmotionalRegulation: 50.68, activeUsers: 13, totalLogs: 4580 },
  { startDate: "2026-04-20", endDate: "2026-04-26", behaviorAndDisciplineScore: 60.4, offTaskBehavior: 64, nonCompliance: 63.69, participationControl: 61.32, peerSafetyAndBelonging: 57.48, impulseControl: 58.54, angerAndEmotionalRegulation: 57.38, activeUsers: 6, totalLogs: 1062 },
  { startDate: "2026-04-27", endDate: "2026-05-03", behaviorAndDisciplineScore: 56.7, offTaskBehavior: 65.98, nonCompliance: 60.12, participationControl: 55.4, peerSafetyAndBelonging: 56.43, impulseControl: 55.31, angerAndEmotionalRegulation: 52.79, activeUsers: 6, totalLogs: 1687 },
  { startDate: "2026-05-04", endDate: "2026-05-10", behaviorAndDisciplineScore: 61.88, offTaskBehavior: 63.92, nonCompliance: 63.09, participationControl: 66.38, peerSafetyAndBelonging: 58.37, impulseControl: 57.94, angerAndEmotionalRegulation: 60.89, activeUsers: 5, totalLogs: 800 },
  { startDate: "2026-05-11", endDate: "2026-05-17", behaviorAndDisciplineScore: 58.84, offTaskBehavior: 67.11, nonCompliance: 60.38, participationControl: 60.47, peerSafetyAndBelonging: 53.85, impulseControl: 62.53, angerAndEmotionalRegulation: 52.02, activeUsers: 5, totalLogs: 1049 },
  { startDate: "2026-05-18", endDate: "2026-05-24", behaviorAndDisciplineScore: 53.85, offTaskBehavior: 68.1, nonCompliance: 63.72, participationControl: 64.12, peerSafetyAndBelonging: 48.88, impulseControl: 61.46, angerAndEmotionalRegulation: 45.52, activeUsers: 8, totalLogs: 1178 },
  { startDate: "2026-05-25", endDate: "2026-05-31", behaviorAndDisciplineScore: 63.61, offTaskBehavior: 70.87, nonCompliance: 66.04, participationControl: 66.16, peerSafetyAndBelonging: 58.03, impulseControl: 63.26, angerAndEmotionalRegulation: 57.65, activeUsers: 4, totalLogs: 587 },
  { startDate: "2026-06-01", endDate: "2026-06-07", behaviorAndDisciplineScore: 61.7, offTaskBehavior: 67.91, nonCompliance: 65.27, participationControl: 61.62, peerSafetyAndBelonging: 58.09, impulseControl: 60.63, angerAndEmotionalRegulation: 56.67, activeUsers: 5, totalLogs: 713 },
  { startDate: "2026-06-08", endDate: "2026-06-14", behaviorAndDisciplineScore: 66.77, offTaskBehavior: 77.27, nonCompliance: 68.01, participationControl: 69.54, peerSafetyAndBelonging: 62.57, impulseControl: 65.66, angerAndEmotionalRegulation: 58.68, activeUsers: 3, totalLogs: 531 },
  { startDate: "2026-06-15", endDate: "2026-06-21", behaviorAndDisciplineScore: 66.6, offTaskBehavior: 83.75, nonCompliance: 65.42, participationControl: 69.6, peerSafetyAndBelonging: 61.58, impulseControl: 68.14, angerAndEmotionalRegulation: 58.75, activeUsers: 3, totalLogs: 472 },
  { startDate: "2026-06-22", endDate: "2026-06-28", behaviorAndDisciplineScore: 45.49, offTaskBehavior: 63.9, nonCompliance: 72.22, participationControl: 50.42, peerSafetyAndBelonging: 48.68, impulseControl: null, angerAndEmotionalRegulation: 38, activeUsers: 5, totalLogs: 70 },
  { startDate: "2026-06-29", endDate: "2026-07-05", behaviorAndDisciplineScore: 44.83, offTaskBehavior: 66.94, nonCompliance: 73.52, participationControl: 56.17, peerSafetyAndBelonging: 41.02, impulseControl: 63.57, angerAndEmotionalRegulation: 39.42, activeUsers: 8, totalLogs: 394 },
  { startDate: "2026-07-06", endDate: "2026-07-12", behaviorAndDisciplineScore: 63.83, offTaskBehavior: 83.18, nonCompliance: 48.79, participationControl: 67.15, peerSafetyAndBelonging: 59.66, impulseControl: 76.99, angerAndEmotionalRegulation: 57.35, activeUsers: 6, totalLogs: 275 },
  { startDate: "2026-07-13", endDate: "2026-07-19", behaviorAndDisciplineScore: 73.66, offTaskBehavior: 82.35, nonCompliance: 76.43, participationControl: 76.5, peerSafetyAndBelonging: 70.17, impulseControl: 73.49, angerAndEmotionalRegulation: 63.04, activeUsers: 2, totalLogs: 480 },
  { startDate: "2026-07-20", endDate: "2026-07-26", behaviorAndDisciplineScore: 74.12, offTaskBehavior: 90, nonCompliance: 67.24, participationControl: 81.06, peerSafetyAndBelonging: 70.74, impulseControl: 73.26, angerAndEmotionalRegulation: 66.83, activeUsers: 2, totalLogs: 160 },
  { startDate: "2026-07-27", endDate: "2026-08-02", behaviorAndDisciplineScore: 35.91, offTaskBehavior: 85.9, nonCompliance: 71.15, participationControl: 54.54, peerSafetyAndBelonging: 31.6, impulseControl: 77.04, angerAndEmotionalRegulation: 30.85, activeUsers: 6, totalLogs: 550 },
  { startDate: "2026-08-03", endDate: "2026-08-09", behaviorAndDisciplineScore: 73.16, offTaskBehavior: 84.48, nonCompliance: 72.86, participationControl: 82.33, peerSafetyAndBelonging: 65.54, impulseControl: 73.69, angerAndEmotionalRegulation: 64.79, activeUsers: 2, totalLogs: 562 },
  { startDate: "2026-08-10", endDate: "2026-08-16", behaviorAndDisciplineScore: 43.74, offTaskBehavior: 64.6, nonCompliance: 90, participationControl: 50.62, peerSafetyAndBelonging: 35.37, impulseControl: 67.13, angerAndEmotionalRegulation: 34.27, activeUsers: 2, totalLogs: 104 },
  { startDate: "2026-08-17", endDate: "2026-08-23", behaviorAndDisciplineScore: null, offTaskBehavior: null, nonCompliance: null, participationControl: null, peerSafetyAndBelonging: null, impulseControl: null, angerAndEmotionalRegulation: null, activeUsers: 0, totalLogs: 0 },
  { startDate: "2026-08-24", endDate: "2026-08-30", behaviorAndDisciplineScore: 50.47, offTaskBehavior: 30, nonCompliance: 41.56, participationControl: 55.21, peerSafetyAndBelonging: 50.83, impulseControl: 42.34, angerAndEmotionalRegulation: 54.52, activeUsers: 10, totalLogs: 1309 },
];

export const L2_CLASSROOM_DATA = {
  focus: {
    classSummary: { currentScore: 48.4, previousScore: 49.34, growthPct: -1.4 },
    studentGrowth: focusStudentGrowth,
    distribution: {
      current: { focussed: 0, fluctuating: 13, distracted: 3 },
      previous: { focussed: 0, fluctuating: 13, distracted: 3 },
      change: { focussed: 0, fluctuating: 0, distracted: 0 },
    },
    subdomains: [
      { key: "visualAttention", name: "Visual Attention", displayName: "VIS", averageScore: 52.13, status: "Med" },
      { key: "attentionSwitching", name: "Attention Switching", displayName: "SWI", averageScore: 50.29, status: "Med" },
      { key: "emotionalRegulation", name: "Emotional Regulation", displayName: "BEH", averageScore: 49.21, status: "Med" },
      { key: "dividedAttention", name: "Divided Attention", displayName: "DIV", averageScore: 48.59, status: "Med" },
      { key: "impulseControl", name: "Impulse Control", displayName: "SUS", averageScore: 47.51, status: "Med" },
      { key: "sustainedAttention", name: "Sustained Attention", displayName: "HYP", averageScore: 47.97, status: "Med" },
      { key: "selectiveAttention", name: "Selective Attention", displayName: "SEL", averageScore: 47.6, status: "Med" },
      { key: "auditoryAttention", name: "Auditory Attention", displayName: "AUD", averageScore: 41.94, status: "Med" },
    ],
    monthly: focusMonthly,
    weekly: focusWeekly,
  },
  learningReadiness: {
    monthly: learningReadinessMonthly,
    weekly: learningReadinessWeekly,
  },
  taskEngagement: {
    monthly: taskEngagementMonthly,
    weekly: taskEngagementWeekly,
  },
  behavior: {
    monthly: behaviorMonthly,
    weekly: behaviorWeekly,
  },
} as const;
