import { activeDemoSchool } from "@/data/bishopCotton";

const metrics = activeDemoSchool.metrics;

// Compatibility view for older consumers. Values are derived from the active
// demo dataset so this module cannot drift from the student source rows.
export const REAL_CLASS_METRICS = {
  classHealthScore: metrics.schoolHealthScore.value,
  cognitivePerformanceScore: metrics.cognitivePerformanceScore.value,
  attentionAndFocus: metrics.attentionAndFocus.value,
  taskEngagement: metrics.taskEngagement.value,
  behaviourAndDiscipline: metrics.behaviourAndDiscipline.value,
  instructionalFriction: metrics.instructionalFriction.value,
  learningReadinessScore: metrics.learningReadinessScore.value,
  readingComprehension: metrics.readingComprehension.value,
  recallRetention: metrics.recallRetention.value,
  problemSolving: metrics.problemSolving.value,
  reasoning: metrics.reasoning.value,
  creativeExpression: metrics.creativeExpression.value,
  studentWellbeingScore: metrics.studentWellbeingScore.value,
  anxietyAndCopingIndex: metrics.anxietyAndCopingIndex.value,
  peerSafetyAndBelonging: metrics.peerSafetyAndBelonging.value,
  angerAndEmotionalRegulation: metrics.angerAndEmotionalRegulation.value,
} as const;
