// Real student data — Bishop Cottons, first batch (16 students), shared
// 2026-09-07 as a MongoDB metrics export + a roster PDF mapping each
// `user_id` to a name/age group/parent. Every field below is transcribed
// directly from those two sources; every `null` is a field genuinely not
// yet computed for that student (never a fabricated placeholder). The source
// `#DIV/0!` value is stored as `null`; numeric values, including `-2`, are
// preserved exactly as supplied.
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
    studentHealthScore: 52.94,
    cognitivePerformance: {
      score: 52.94,
      attentionAndFocus: null,
      taskEngagement: 51.2,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 54.68,
        readingComprehension: 62.06,
        recallRetention: 47.3,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 51.41,
    cognitivePerformance: {
      score: 51.41,
      attentionAndFocus: null,
      taskEngagement: 49.28,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 53.54,
        readingComprehension: 45.95,
        recallRetention: 63.2,
        problemSolving: 20,
        reasoning: null,
        creativeExpression: 85,
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
    studentHealthScore: 66.64,
    cognitivePerformance: {
      score: 66.635,
      attentionAndFocus: null,
      taskEngagement: 68.61,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 64.66,
        readingComprehension: 64.15,
        recallRetention: 64.24,
        problemSolving: null,
        reasoning: 65.6,
        creativeExpression: null,
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
    studentHealthScore: 57.41,
    cognitivePerformance: {
      score: 57.415,
      attentionAndFocus: null,
      taskEngagement: 56.08,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 58.75,
        readingComprehension: null,
        recallRetention: 59.5,
        problemSolving: null,
        reasoning: 58,
        creativeExpression: null,
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
    studentHealthScore: 60.68,
    cognitivePerformance: {
      score: 61.355,
      attentionAndFocus: null,
      taskEngagement: 61.58,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 61.13,
        readingComprehension: null,
        recallRetention: 61.13,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 40.08,
    cognitivePerformance: {
      score: 40.08,
      attentionAndFocus: null,
      taskEngagement: 58.49,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 21.67,
        readingComprehension: 21.67,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 59.11,
    cognitivePerformance: {
      score: 59.115,
      attentionAndFocus: null,
      taskEngagement: 60.77,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 57.46,
        readingComprehension: 56.7,
        recallRetention: 55.77,
        problemSolving: null,
        reasoning: 59.9,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: 56.3195635,
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
    studentHealthScore: 47.46,
    cognitivePerformance: {
      score: 47.46,
      attentionAndFocus: null,
      taskEngagement: 44.32,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 50.6,
        readingComprehension: 61.2,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: 40,
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
    studentHealthScore: 62.64,
    cognitivePerformance: {
      score: 62.645,
      attentionAndFocus: null,
      taskEngagement: 63.43,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 61.86,
        readingComprehension: 62.03,
        recallRetention: 62.55,
        problemSolving: null,
        reasoning: 61,
        creativeExpression: null,
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
    id: "6a01f5774b6ad164e9ae9652",
    name: "Aizu",
    ageGroup: "11-12 yrs",
    parentName: "Zahra Yaseen",
    studentHealthScore: 58.05,
    cognitivePerformance: {
      score: 58.05,
      attentionAndFocus: null,
      taskEngagement: 58.05,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: null,
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
    parentName: "Priya Solomon",
    studentHealthScore: 66.11,
    cognitivePerformance: {
      score: 66.11,
      attentionAndFocus: null,
      taskEngagement: 70.24,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 61.98,
        readingComprehension: 55.65,
        recallRetention: 67.58,
        problemSolving: null,
        reasoning: 62.7,
        creativeExpression: null,
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
    studentHealthScore: 63.49,
    cognitivePerformance: {
      score: 63.495,
      attentionAndFocus: null,
      taskEngagement: 65.21,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 61.78,
        readingComprehension: 58.63,
        recallRetention: 64.92,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 65.75,
    cognitivePerformance: {
      score: 65.75,
      attentionAndFocus: null,
      taskEngagement: 63.87,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 67.63,
        readingComprehension: 71.87,
        recallRetention: 63.4,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 51.17,
    cognitivePerformance: {
      score: 51.165,
      attentionAndFocus: null,
      taskEngagement: 38.63,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 63.7,
        readingComprehension: 63.7,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: 39.33333334,
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
    studentHealthScore: 56.45,
    cognitivePerformance: {
      score: 56.45,
      attentionAndFocus: null,
      taskEngagement: 53.6,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 59.3,
        readingComprehension: 59.3,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
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
    studentHealthScore: 39.62,
    cognitivePerformance: {
      score: 39.61666667,
      attentionAndFocus: -2,
      taskEngagement: 48.25,
      behaviourAndDiscipline: null,
      instructionalFriction: null,
      learningReadiness: {
        score: 72.6,
        readingComprehension: 72.6,
        recallRetention: null,
        problemSolving: null,
        reasoning: null,
        creativeExpression: null,
      },
    },
    studentWellbeing: {
      score: 38.99190476,
      anxietyAndCopingIndex: 52.22571429,
      peerSafetyAndBelonging: 20,
      angerAndEmotionalRegulation: 44.75,
    },
  },
];
