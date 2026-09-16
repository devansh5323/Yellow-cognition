// Real classroom data — first batch, shared 2026-09-07, covering 16 real
// students. This is a partial delivery: only the fields below have real
// values so far. Every consumer keeps falling back to its existing
// mock-derived computation for anything not listed here (Attention and
// Focus, Behaviour and Discipline, Instructional Friction, Anxiety and
// Coping Index, Anger and Emotional Regulation, Curiosity & Exploration —
// either not yet provided or a known-bad value to ignore for now).
export const REAL_CLASS_METRICS = {
  classHealthScore: 56,
  cognitivePerformanceScore: 56,
  taskEngagement: 57,
  learningReadinessScore: 58,
  readingComprehension: 58,
  recallRetention: 61,
  problemSolving: 20,
  reasoning: 61,
  creativeExpression: 63,
  studentWellbeingScore: 60,
  peerSafetyAndBelonging: 60,
} as const;
