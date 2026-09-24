// Real student data — Bishop Cottons, first batch (16 students), refreshed from
// Bishop_Cottons_Students_-_STUDENT-HEALTH-SCORE.csv (Student Health Score export).
// Every field below is transcribed directly from that CSV; nothing here is
// fabricated. Parent names are not present in this export, so parentName is
// left as an empty string rather than invented.
export type RealStudent = {
  id: string;
  name: string;
  ageGroup: string;
  parentName: string;
  studentHealthScore: number;
  cognitivePerformance: {
    score: number;
    attentionAndFocus: number | null;
    taskEngagement: number | null;
    behaviourAndDiscipline: number | null;
    instructionalFriction: number | null;
    learningReadiness: {
      score: number | null;
      readingComprehension: number | null;
      recallRetention: number | null;
      problemSolving: number | null;
      reasoning: number | null;
      creativeExpression: number | null;
    };
  };
  studentWellbeing: {
    score: number | null;
    anxietyAndCopingIndex: number | null;
    peerSafetyAndBelonging: number | null;
    angerAndEmotionalRegulation: number | null;
  };
};

export const REAL_STUDENTS: RealStudent[] = [
  {
    id: "69dc85547ec07d4b67b14192",
    name: "Keren Manuel",
    ageGroup: "9-10 yrs",
    parentName: "",
    studentHealthScore: 56.5925,
    cognitivePerformance: {
      score: 56.5925,
      attentionAndFocus: 52.79,
      taskEngagement: 55.05,
      behaviourAndDiscipline: 60.12,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.41,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc856b7ec07d4b67b14199",
    name: "Yuktha S urs",
    ageGroup: "10-11 yrs",
    parentName: "",
    studentHealthScore: 32.66,
    cognitivePerformance: {
      score: 32.66,
      attentionAndFocus: 32.52,
      taskEngagement: 31.34,
      behaviourAndDiscipline: 31.96,
      instructionalFriction: null,
      learningReadiness: {
        score: 34.82,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc85877ec07d4b67b1419d",
    name: "Teju",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 55.0025,
    cognitivePerformance: {
      score: 55.0025,
      attentionAndFocus: 51.83,
      taskEngagement: 52.78,
      behaviourAndDiscipline: 58.78,
      instructionalFriction: null,
      learningReadiness: {
        score: 56.62,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc859b7ec07d4b67b141a0",
    name: "C Jersha",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 42.545,
    cognitivePerformance: {
      score: 42.545,
      attentionAndFocus: 40.12,
      taskEngagement: 42.61,
      behaviourAndDiscipline: 41.78,
      instructionalFriction: null,
      learningReadiness: {
        score: 45.67,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc85ad7ec07d4b67b141aa",
    name: "Dhriti",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 56.7925,
    cognitivePerformance: {
      score: 56.7925,
      attentionAndFocus: 55.95,
      taskEngagement: 56.55,
      behaviourAndDiscipline: 57.07,
      instructionalFriction: null,
      learningReadiness: {
        score: 57.6,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc85c07ec07d4b67b141b1",
    name: "Judy",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 57.665,
    cognitivePerformance: {
      score: 57.665,
      attentionAndFocus: 54.98,
      taskEngagement: 57.46,
      behaviourAndDiscipline: 61.24,
      instructionalFriction: null,
      learningReadiness: {
        score: 56.98,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dc8a1f7ec07d4b67b141de",
    name: "Nivriti",
    ageGroup: "10-11 yrs",
    parentName: "",
    studentHealthScore: 50.805,
    cognitivePerformance: {
      score: 50.805,
      attentionAndFocus: 46.66,
      taskEngagement: 50.53,
      behaviourAndDiscipline: 48,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.03,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dcbc6d767cbb6e1a7a9212",
    name: "Lakshita D.K",
    ageGroup: "10-11 yrs",
    parentName: "",
    studentHealthScore: 60.4075,
    cognitivePerformance: {
      score: 60.4075,
      attentionAndFocus: 55.39,
      taskEngagement: 65.83,
      behaviourAndDiscipline: 72.98,
      instructionalFriction: null,
      learningReadiness: {
        score: 47.43,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dcfbc1f0593243d066ebce",
    name: "Aizah",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 40.8875,
    cognitivePerformance: {
      score: 40.8875,
      attentionAndFocus: 37.12,
      taskEngagement: 41.27,
      behaviourAndDiscipline: 43.64,
      instructionalFriction: null,
      learningReadiness: {
        score: 41.52,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69dd1c1df0593243d066ebe6",
    name: "Gunashreya",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 43.1325,
    cognitivePerformance: {
      score: 43.1325,
      attentionAndFocus: 39.48,
      taskEngagement: 43.77,
      behaviourAndDiscipline: 39.67,
      instructionalFriction: null,
      learningReadiness: {
        score: 49.61,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69de446ef0593243d066ed05",
    name: "Manya",
    ageGroup: "10-11 yrs",
    parentName: "",
    studentHealthScore: 56.86,
    cognitivePerformance: {
      score: 56.86,
      attentionAndFocus: 53.63,
      taskEngagement: 53.87,
      behaviourAndDiscipline: 60.59,
      instructionalFriction: null,
      learningReadiness: {
        score: 59.35,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69de4872f0593243d066ed13",
    name: "Akku (Akansha)",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 42.6825,
    cognitivePerformance: {
      score: 42.6825,
      attentionAndFocus: 41.11,
      taskEngagement: 40.38,
      behaviourAndDiscipline: 44.17,
      instructionalFriction: null,
      learningReadiness: {
        score: 45.07,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69df2a67f0593243d066ed7d",
    name: "Ananya",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 47.48,
    cognitivePerformance: {
      score: 47.48,
      attentionAndFocus: 47.5,
      taskEngagement: 43.48,
      behaviourAndDiscipline: 45.48,
      instructionalFriction: null,
      learningReadiness: {
        score: 53.46,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69df85f9f0593243d066edf9",
    name: "ASH",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 63.915,
    cognitivePerformance: {
      score: 63.915,
      attentionAndFocus: 60.22,
      taskEngagement: 59.47,
      behaviourAndDiscipline: 68.59,
      instructionalFriction: null,
      learningReadiness: {
        score: 67.38,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69f1ec1d4b6ad164e9ae8c43",
    name: "Kriyaa",
    ageGroup: "10-11 yrs",
    parentName: "",
    studentHealthScore: 56.1975,
    cognitivePerformance: {
      score: 56.1975,
      attentionAndFocus: 52.17,
      taskEngagement: 53.79,
      behaviourAndDiscipline: 63.16,
      instructionalFriction: null,
      learningReadiness: {
        score: 55.67,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
  {
    id: "69e64e7df0593243d066f115",
    name: "Jhanu",
    ageGroup: "11-12 yrs",
    parentName: "",
    studentHealthScore: 56.645,
    cognitivePerformance: {
      score: 56.645,
      attentionAndFocus: 53,
      taskEngagement: 55.31,
      behaviourAndDiscipline: 59.87,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.4,
        readingComprehension: null,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: null,
      anxietyAndCopingIndex: null,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: null,
    },
  },
];