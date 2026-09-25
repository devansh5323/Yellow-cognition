// Real student data — Bishop Cottons, first batch (16 students), shared
// 2026-09-07 as a MongoDB metrics export + a roster PDF mapping each
// `user_id` to a name/age group/parent. Every field below is transcribed
// directly from those two sources; every `null` is a field genuinely not
// yet computed for that student (never a fabricated placeholder). The source
// `#DIV/0!` value is stored as `null`; numeric values, including `-2`, are
// preserved exactly as supplied.
// Corrected metrics matched by user_id against the supplied table.
// Includes exactly the 16 students in the supplied metrics table.
// Jhanu has an empty parent name pending roster information.
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
    id: "69de4872f0593243d066ed13",
    name: "Akku (Akansha)",
    ageGroup: "11-12 yrs",
    parentName: "Abishek Wesley",
    studentHealthScore: 63.49,
    cognitivePerformance: {
      score: 42.6825,
      attentionAndFocus: 41.11,
      taskEngagement: 40.38,
      behaviourAndDiscipline: 44.17,
      instructionalFriction: null,
      learningReadiness: {
        score: 45.07,
        readingComprehension: 47.61,
        recallRetention: 25.18,
        problemSolving: 46.65,
        reasoning: 55.41,
        creativeExpression: 50.51,
      },
    },
    studentWellbeing: {
      score: 52.24342593,
      anxietyAndCopingIndex: 52.6725,
      peerSafetyAndBelonging: 62.5,
      angerAndEmotionalRegulation: 41.55777778,
    },
  },
  {
    id: "69dc859b7ec07d4b67b141a0",
    name: "C Jersha",
    ageGroup: "11-12 yrs",
    parentName: "Jansi R",
    studentHealthScore: 57.41,
    cognitivePerformance: {
      score: 42.545,
      attentionAndFocus: 40.12,
      taskEngagement: 42.61,
      behaviourAndDiscipline: 41.78,
      instructionalFriction: null,
      learningReadiness: {
        score: 45.67,
        readingComprehension: 46.77,
        recallRetention: 27.66,
        problemSolving: 43.11,
        reasoning: 49.63,
        creativeExpression: 61.16,
      },
    },
    studentWellbeing: {
      score: 50.23664286,
      anxietyAndCopingIndex: 42.016,
      peerSafetyAndBelonging: 68.57142857,
      angerAndEmotionalRegulation: 40.1225,
    },
  },
  {
    id: "69dc85ad7ec07d4b67b141aa",
    name: "Dhriti",
    ageGroup: "11-12 yrs",
    parentName: "Namratha",
    studentHealthScore: 60.68,
    cognitivePerformance: {
      score: 56.7925,
      attentionAndFocus: 55.95,
      taskEngagement: 56.55,
      behaviourAndDiscipline: 57.07,
      instructionalFriction: null,
      learningReadiness: {
        score: 57.6,
        readingComprehension: 62.69,
        recallRetention: 47.77,
        problemSolving: 58.75,
        reasoning: 59.46,
        creativeExpression: 59.34,
      },
    },
    studentWellbeing: {
      score: 62.77705601,
      anxietyAndCopingIndex: 64.64737288,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 60.90673913,
    },
  },
  {
    id: "69dc8a1f7ec07d4b67b141de",
    name: "Nivriti",
    ageGroup: "10-11 yrs",
    parentName: "Yamuna",
    studentHealthScore: 59.11,
    cognitivePerformance: {
      score: 50.805,
      attentionAndFocus: 46.66,
      taskEngagement: 50.53,
      behaviourAndDiscipline: 48,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.03,
        readingComprehension: 50.03,
        recallRetention: 61.03,
        problemSolving: 56.17,
        reasoning: 63.03,
        creativeExpression: 59.91,
      },
    },
    studentWellbeing: {
      score: 48.935,
      anxietyAndCopingIndex: 61.475,
      peerSafetyAndBelonging: 30,
      angerAndEmotionalRegulation: 55.33,
    },
  },
  {
    id: "69f1ec1d4b6ad164e9ae8c43",
    name: "Kriyaa",
    ageGroup: "10-11 yrs",
    parentName: "Divya",
    studentHealthScore: 56.45,
    cognitivePerformance: {
      score: 56.1975,
      attentionAndFocus: 52.17,
      taskEngagement: 53.79,
      behaviourAndDiscipline: 63.16,
      instructionalFriction: null,
      learningReadiness: {
        score: 55.67,
        readingComprehension: 52.36,
        recallRetention: 62.02,
        problemSolving: 54.07,
        reasoning: 55.75,
        creativeExpression: 54.13,
      },
    },
    studentWellbeing: {
      score: 66.36481481,
      anxietyAndCopingIndex: 67.14444444,
      peerSafetyAndBelonging: 60,
      angerAndEmotionalRegulation: 71.95,
    },
  },
  {
    id: "69dcbc6d767cbb6e1a7a9212",
    name: "Lakshita D.K",
    ageGroup: "10-11 yrs",
    parentName: "Shreedharani",
    studentHealthScore: 47.46,
    cognitivePerformance: {
      score: 60.4075,
      attentionAndFocus: 55.39,
      taskEngagement: 65.83,
      behaviourAndDiscipline: 72.98,
      instructionalFriction: null,
      learningReadiness: {
        score: 47.43,
        readingComprehension: 52.94,
        recallRetention: 44.17,
        problemSolving: 63.75,
        reasoning: 36.46,
        creativeExpression: 39.84,
      },
    },
    studentWellbeing: {
      score: 56.41666667,
      anxietyAndCopingIndex: 81.95,
      peerSafetyAndBelonging: 15,
      angerAndEmotionalRegulation: 72.3,
    },
  },
  {
    id: "69dc85877ec07d4b67b1419d",
    name: "Teju",
    ageGroup: "11-12 yrs",
    parentName: "Geetha",
    studentHealthScore: 66.64,
    cognitivePerformance: {
      score: 55.0025,
      attentionAndFocus: 51.83,
      taskEngagement: 52.78,
      behaviourAndDiscipline: 58.78,
      instructionalFriction: null,
      learningReadiness: {
        score: 56.62,
        readingComprehension: 64.08,
        recallRetention: 51.33,
        problemSolving: 48.79,
        reasoning: 53.11,
        creativeExpression: 65.78,
      },
    },
    studentWellbeing: {
      score: 56.31956349,
      anxietyAndCopingIndex: 57.17357143,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 55.46555556,
    },
  },
  {
    id: "69dcfbc1f0593243d066ebce",
    name: "Aizah",
    ageGroup: "11-12 yrs",
    parentName: "Zahra Yaseen",
    studentHealthScore: 62.64,
    cognitivePerformance: {
      score: 40.8875,
      attentionAndFocus: 37.12,
      taskEngagement: 41.27,
      behaviourAndDiscipline: 43.64,
      instructionalFriction: null,
      learningReadiness: {
        score: 41.52,
        readingComprehension: 33.56,
        recallRetention: 44.9,
        problemSolving: 53.73,
        reasoning: 37.56,
        creativeExpression: 37.86,
      },
    },
    studentWellbeing: {
      score: 65.33357143,
      anxietyAndCopingIndex: 58.625,
      peerSafetyAndBelonging: 90,
      angerAndEmotionalRegulation: 47.37571429,
    },
  },
  {
    id: "69dc85547ec07d4b67b14192",
    name: "Keren Manuel",
    ageGroup: "9-10 yrs",
    parentName: "Edith Manuel",
    studentHealthScore: 52.94,
    cognitivePerformance: {
      score: 56.5925,
      attentionAndFocus: 52.79,
      taskEngagement: 55.05,
      behaviourAndDiscipline: 60.12,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.41,
        readingComprehension: 56.73,
        recallRetention: 53.31,
        problemSolving: 64.81,
        reasoning: 57.24,
        creativeExpression: 59.96,
      },
    },
    studentWellbeing: {
      score: 67.0081746,
      anxietyAndCopingIndex: 69.35785714,
      peerSafetyAndBelonging: 64,
      angerAndEmotionalRegulation: 67.66666667,
    },
  },
  {
    id: "69df85f9f0593243d066edf9",
    name: "ASH",
    ageGroup: "11-12 yrs",
    parentName: "Priya Solomon",
    studentHealthScore: 51.17,
    cognitivePerformance: {
      score: 63.915,
      attentionAndFocus: 60.22,
      taskEngagement: 59.47,
      behaviourAndDiscipline: 68.59,
      instructionalFriction: null,
      learningReadiness: {
        score: 67.38,
        readingComprehension: 65.02,
        recallRetention: 82.49,
        problemSolving: 62.69,
        reasoning: 61.95,
        creativeExpression: 64.76,
      },
    },
    studentWellbeing: {
      score: 69.41230769,
      anxietyAndCopingIndex: 65.80461538,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 73.02,
    },
  },
  {
    id: "69dc85c07ec07d4b67b141b1",
    name: "Judy",
    ageGroup: "11-12 yrs",
    parentName: "Judith aradhana",
    studentHealthScore: 40.08,
    cognitivePerformance: {
      score: 57.665,
      attentionAndFocus: 54.98,
      taskEngagement: 57.46,
      behaviourAndDiscipline: 61.24,
      instructionalFriction: null,
      learningReadiness: {
        score: 56.98,
        readingComprehension: 57.97,
        recallRetention: 54.19,
        problemSolving: 56.31,
        reasoning: 57.13,
        creativeExpression: 59.31,
      },
    },
    studentWellbeing: {
      score: 63.69887931,
      anxietyAndCopingIndex: 63.61775862,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 63.78,
    },
  },
  {
    id: "69de446ef0593243d066ed05",
    name: "Manya",
    ageGroup: "10-11 yrs",
    parentName: "Dilmeet",
    studentHealthScore: 66.11,
    cognitivePerformance: {
      score: 56.86,
      attentionAndFocus: 53.63,
      taskEngagement: 53.87,
      behaviourAndDiscipline: 60.59,
      instructionalFriction: null,
      learningReadiness: {
        score: 59.35,
        readingComprehension: 58.3,
        recallRetention: 66.07,
        problemSolving: 55.47,
        reasoning: 62.63,
        creativeExpression: 54.3,
      },
    },
    studentWellbeing: {
      score: 73.94814815,
      anxietyAndCopingIndex: 67.03333333,
      peerSafetyAndBelonging: 81.11111111,
      angerAndEmotionalRegulation: 73.7,
    },
  },
  {
    id: "69dc856b7ec07d4b67b14199",
    name: "Yuktha S urs",
    ageGroup: "10-11 yrs",
    parentName: "Srikanth Raj Urs L",
    studentHealthScore: 51.41,
    cognitivePerformance: {
      score: 32.66,
      attentionAndFocus: 32.52,
      taskEngagement: 31.34,
      behaviourAndDiscipline: 31.96,
      instructionalFriction: null,
      learningReadiness: {
        score: 34.82,
        readingComprehension: 40.34,
        recallRetention: 9,
        problemSolving: 33.99,
        reasoning: 48.78,
        creativeExpression: 42.01,
      },
    },
    studentWellbeing: {
      score: 39.33333333,
      anxietyAndCopingIndex: 44.66666667,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 34,
    },
  },
  {
    id: "69df2a67f0593243d066ed7d",
    name: "Ananya",
    ageGroup: "11-12 yrs",
    parentName: "Anisha",
    studentHealthScore: 65.75,
    cognitivePerformance: {
      score: 47.48,
      attentionAndFocus: 47.5,
      taskEngagement: 43.48,
      behaviourAndDiscipline: 45.48,
      instructionalFriction: null,
      learningReadiness: {
        score: 53.46,
        readingComprehension: 59.53,
        recallRetention: 46.85,
        problemSolving: 53.19,
        reasoning: 56.27,
        creativeExpression: 51.45,
      },
    },
    studentWellbeing: {
      score: 46.62666667,
      anxietyAndCopingIndex: 50.25,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 43.00333333,
    },
  },
  {
    id: "69dd1c1df0593243d066ebe6",
    name: "Gunashreya",
    ageGroup: "11-12 yrs",
    parentName: "Sujatha",
    studentHealthScore: 58.05,
    cognitivePerformance: {
      score: 43.1325,
      attentionAndFocus: 39.48,
      taskEngagement: 43.77,
      behaviourAndDiscipline: 39.67,
      instructionalFriction: null,
      learningReadiness: {
        score: 49.61,
        readingComprehension: 52.14,
        recallRetention: 46.69,
        problemSolving: 51.1,
        reasoning: 48.03,
        creativeExpression: 50.08,
      },
    },
    studentWellbeing: {
      score: 38.99190476,
      anxietyAndCopingIndex: 52.22571429,
      peerSafetyAndBelonging: 20,
      angerAndEmotionalRegulation: 44.75,
    },
  },
  {
    id: "69e64e7df0593243d066f115",
    name: "Jhanu",
    ageGroup: "11-12 yrs",
    parentName: "Jhanavi",
    studentHealthScore: 39.62,
    cognitivePerformance: {
      score: 56.645,
      attentionAndFocus: 53,
      taskEngagement: 55.31,
      behaviourAndDiscipline: 59.87,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.4,
        readingComprehension: 59.22,
        recallRetention: 58.7,
        problemSolving: 56.92,
        reasoning: 57.66,
        creativeExpression: 59.5,
      },
    },
    studentWellbeing: {
      score: 63.48544118,
      anxietyAndCopingIndex: 62.94588235,
      peerSafetyAndBelonging: null,
      angerAndEmotionalRegulation: 64.025,
    },
  },
];
