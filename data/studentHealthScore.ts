export type Students = {

  id: string;
  name: string;
  ageGroup: string;
  parentName: string;
  studentHealthScore: number | null;
  cognitivePerformance: {
    score: number | null;
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

export type TimeSeriesData = {
  startDate: string;
  endDate: string;
  attentionAndFocusAvg: number | null;
  learningAndReadiness: number | null;
  readingAndComprehension: number | null;
  recallAndRetention: number | null;
  problemSolving: number | null;
  reasoning: number | null;
  creativeExpression: number | null;
  taskEngagementScore: number | null;
  consistency: number | null;
  taskInitiation: number | null;
  independentExecution: number | null;
  responseToChallenge: number | null;
  persistence: number | null;
  planningAndTimeManagement: number | null;
  completion: number | null;
  behaviorAndDisciplineScore: number | null;
  offTaskBehavior: number | null;
  nonCompliance: number | null;
  participationControl: number | null;
  peerSafetyAndBelonging: number | null;
  impulseControl: number | null;
  angerAndEmotionalRegulation: number | null;
  studentHealthScore: number | null;
};

export type DriverTierCounts = {
  tier1: number;
  tier2: number;
  tier3: number;
};

export type TierDistributionData = {
  studentHealth: DriverTierCounts;
  attentionAndFocus: DriverTierCounts;
  learningReadiness: DriverTierCounts;
  taskEngagement: DriverTierCounts;
  behaviourAndDiscipline: DriverTierCounts;
};

export type ClassAverageData = Omit<Students, 'id' | 'name' | 'ageGroup' | 'parentName'>;

export const STUDENTS: Students[] = [
  {
    "id": "69dc85547ec07d4b67b14192",
    "name": "Keren Manuel",
    "ageGroup": "9-10 yrs",
    "parentName": "",
    "studentHealthScore": 56.5925,
    "cognitivePerformance": {
      "score": 56.5925,
      "attentionAndFocus": 52.79,
      "taskEngagement": 55.05,
      "behaviourAndDiscipline": 60.12,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 58.41,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc856b7ec07d4b67b14199",
    "name": "Yuktha S urs",
    "ageGroup": "10-11 yrs",
    "parentName": "",
    "studentHealthScore": 32.66,
    "cognitivePerformance": {
      "score": 32.66,
      "attentionAndFocus": 32.52,
      "taskEngagement": 31.34,
      "behaviourAndDiscipline": 31.96,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 34.82,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc85877ec07d4b67b1419d",
    "name": "Teju",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 55.0025,
    "cognitivePerformance": {
      "score": 55.0025,
      "attentionAndFocus": 51.83,
      "taskEngagement": 52.78,
      "behaviourAndDiscipline": 58.78,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 56.62,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc859b7ec07d4b67b141a0",
    "name": "C Jersha",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 42.545,
    "cognitivePerformance": {
      "score": 42.545,
      "attentionAndFocus": 40.12,
      "taskEngagement": 42.61,
      "behaviourAndDiscipline": 41.78,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 45.67,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc85ad7ec07d4b67b141aa",
    "name": "Dhriti",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 56.7925,
    "cognitivePerformance": {
      "score": 56.7925,
      "attentionAndFocus": 55.95,
      "taskEngagement": 56.55,
      "behaviourAndDiscipline": 57.07,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 57.6,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc85c07ec07d4b67b141b1",
    "name": "Judy",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 57.665,
    "cognitivePerformance": {
      "score": 57.665,
      "attentionAndFocus": 54.98,
      "taskEngagement": 57.46,
      "behaviourAndDiscipline": 61.24,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 56.98,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dc8a1f7ec07d4b67b141de",
    "name": "Nivriti",
    "ageGroup": "10-11 yrs",
    "parentName": "",
    "studentHealthScore": 50.805,
    "cognitivePerformance": {
      "score": 50.805,
      "attentionAndFocus": 46.66,
      "taskEngagement": 50.53,
      "behaviourAndDiscipline": 48,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 58.03,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dcbc6d767cbb6e1a7a9212",
    "name": "Lakshita D.K",
    "ageGroup": "10-11 yrs",
    "parentName": "",
    "studentHealthScore": 60.4075,
    "cognitivePerformance": {
      "score": 60.4075,
      "attentionAndFocus": 55.39,
      "taskEngagement": 65.83,
      "behaviourAndDiscipline": 72.98,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 47.43,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dcfbc1f0593243d066ebce",
    "name": "Aizah",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 40.8875,
    "cognitivePerformance": {
      "score": 40.8875,
      "attentionAndFocus": 37.12,
      "taskEngagement": 41.27,
      "behaviourAndDiscipline": 43.64,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 41.52,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69dd1c1df0593243d066ebe6",
    "name": "Gunashreya",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 43.1325,
    "cognitivePerformance": {
      "score": 43.1325,
      "attentionAndFocus": 39.48,
      "taskEngagement": 43.77,
      "behaviourAndDiscipline": 39.67,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 49.61,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69de446ef0593243d066ed05",
    "name": "Manya",
    "ageGroup": "10-11 yrs",
    "parentName": "",
    "studentHealthScore": 56.86,
    "cognitivePerformance": {
      "score": 56.86,
      "attentionAndFocus": 53.63,
      "taskEngagement": 53.87,
      "behaviourAndDiscipline": 60.59,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 59.35,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69de4872f0593243d066ed13",
    "name": "Akku (Akansha)",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 42.6825,
    "cognitivePerformance": {
      "score": 42.6825,
      "attentionAndFocus": 41.11,
      "taskEngagement": 40.38,
      "behaviourAndDiscipline": 44.17,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 45.07,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69df2a67f0593243d066ed7d",
    "name": "Ananya",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 47.48,
    "cognitivePerformance": {
      "score": 47.48,
      "attentionAndFocus": 47.5,
      "taskEngagement": 43.48,
      "behaviourAndDiscipline": 45.48,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 53.46,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69df85f9f0593243d066edf9",
    "name": "ASH",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 63.915,
    "cognitivePerformance": {
      "score": 63.915,
      "attentionAndFocus": 60.22,
      "taskEngagement": 59.47,
      "behaviourAndDiscipline": 68.59,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 67.38,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69f1ec1d4b6ad164e9ae8c43",
    "name": "Kriyaa",
    "ageGroup": "10-11 yrs",
    "parentName": "",
    "studentHealthScore": 56.1975,
    "cognitivePerformance": {
      "score": 56.1975,
      "attentionAndFocus": 52.17,
      "taskEngagement": 53.79,
      "behaviourAndDiscipline": 63.16,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 55.67,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  },
  {
    "id": "69e64e7df0593243d066f115",
    "name": "Jhanu",
    "ageGroup": "11-12 yrs",
    "parentName": "",
    "studentHealthScore": 56.645,
    "cognitivePerformance": {
      "score": 56.645,
      "attentionAndFocus": 53,
      "taskEngagement": 55.31,
      "behaviourAndDiscipline": 59.87,
      "instructionalFriction": null,
      "learningReadiness": {
        "score": 58.4,
        "readingComprehension": null,
        "recallRetention": null,
        "problemSolving": null,
        "reasoning": null,
        "creativeExpression": null
      }
    },
    "studentWellbeing": {
      "score": null,
      "anxietyAndCopingIndex": null,
      "peerSafetyAndBelonging": null,
      "angerAndEmotionalRegulation": null
    }
  }
];

export const CLASS_AVERAGE: ClassAverageData = {
  "studentHealthScore": 51.266875,
  "cognitivePerformance": {
    "score": 51.266875,
    "attentionAndFocus": 48.404375,
    "taskEngagement": 50.218125,
    "behaviourAndDiscipline": 53.56875,
    "instructionalFriction": null,
    "learningReadiness": {
      "score": 52.87625,
      "readingComprehension": null,
      "recallRetention": null,
      "problemSolving": null,
      "reasoning": null,
      "creativeExpression": null
    }
  },
  "studentWellbeing": {
    "score": null,
    "anxietyAndCopingIndex": null,
    "peerSafetyAndBelonging": null,
    "angerAndEmotionalRegulation": null
  }
};

export const MONTHLY_DATA: TimeSeriesData[] = [
  {
    "startDate": "2026-04-01",
    "endDate": "2026-04-30",
    "attentionAndFocusAvg": 48.68,
    "learningAndReadiness": 52.02,
    "readingAndComprehension": 53.45,
    "recallAndRetention": 49.05,
    "problemSolving": 49.65,
    "reasoning": 53.35,
    "creativeExpression": 54.58,
    "taskEngagementScore": 48.57,
    "consistency": 57.33,
    "taskInitiation": 49.38,
    "independentExecution": 55.6,
    "responseToChallenge": 60.07,
    "persistence": 51.71,
    "planningAndTimeManagement": 48.6,
    "completion": 3.58,
    "behaviorAndDisciplineScore": 53.87,
    "offTaskBehavior": 57.33,
    "nonCompliance": 55.98,
    "participationControl": 55.72,
    "peerSafetyAndBelonging": 51.85,
    "impulseControl": 50.57,
    "angerAndEmotionalRegulation": 51.2,
    "studentHealthScore": 50.785
  },
  {
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "attentionAndFocusAvg": 52.85,
    "learningAndReadiness": 57.5,
    "readingAndComprehension": 56.9,
    "recallAndRetention": 57.22,
    "problemSolving": 57.01,
    "reasoning": 56.74,
    "creativeExpression": 59.65,
    "taskEngagementScore": 51.74,
    "consistency": 61.68,
    "taskInitiation": 62.73,
    "independentExecution": 58.26,
    "responseToChallenge": 63.25,
    "persistence": 57.19,
    "planningAndTimeManagement": 56.05,
    "completion": 3.83,
    "behaviorAndDisciplineScore": 54.39,
    "offTaskBehavior": 65.61,
    "nonCompliance": 62.6,
    "participationControl": 62.33,
    "peerSafetyAndBelonging": 49.22,
    "impulseControl": 60.29,
    "angerAndEmotionalRegulation": 51.16,
    "studentHealthScore": 54.12
  },
  {
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "attentionAndFocusAvg": 46.83,
    "learningAndReadiness": 57.45,
    "readingAndComprehension": 61.69,
    "recallAndRetention": 56.28,
    "problemSolving": 57.14,
    "reasoning": 58.88,
    "creativeExpression": 57.97,
    "taskEngagementScore": 43.43,
    "consistency": 57.69,
    "taskInitiation": 65,
    "independentExecution": 63.61,
    "responseToChallenge": 57.51,
    "persistence": 48.06,
    "planningAndTimeManagement": 58.77,
    "completion": 2.27,
    "behaviorAndDisciplineScore": 44.46,
    "offTaskBehavior": 66.61,
    "nonCompliance": 64.91,
    "participationControl": 51.43,
    "peerSafetyAndBelonging": 41.03,
    "impulseControl": 61.25,
    "angerAndEmotionalRegulation": 42.75,
    "studentHealthScore": 48.0425
  },
  {
    "startDate": "2026-07-01",
    "endDate": "2026-07-31",
    "attentionAndFocusAvg": 56.33,
    "learningAndReadiness": 58.39,
    "readingAndComprehension": 63.47,
    "recallAndRetention": 59.47,
    "problemSolving": 60.03,
    "reasoning": 56.33,
    "creativeExpression": 58.37,
    "taskEngagementScore": 57.23,
    "consistency": 67.74,
    "taskInitiation": 62.34,
    "independentExecution": 58.01,
    "responseToChallenge": 65.32,
    "persistence": 56.28,
    "planningAndTimeManagement": 57.11,
    "completion": 2.58,
    "behaviorAndDisciplineScore": 54.51,
    "offTaskBehavior": 73.32,
    "nonCompliance": 65.07,
    "participationControl": 62.25,
    "peerSafetyAndBelonging": 48.44,
    "impulseControl": 67.78,
    "angerAndEmotionalRegulation": 46.57,
    "studentHealthScore": 56.615
  },
  {
    "startDate": "2026-08-01",
    "endDate": "2026-08-31",
    "attentionAndFocusAvg": 50.06,
    "learningAndReadiness": 55.95,
    "readingAndComprehension": 55.94,
    "recallAndRetention": 54.58,
    "problemSolving": 54.33,
    "reasoning": 54.55,
    "creativeExpression": 54.73,
    "taskEngagementScore": 55.07,
    "consistency": 66.89,
    "taskInitiation": 53.02,
    "independentExecution": 64.46,
    "responseToChallenge": 61.76,
    "persistence": 54.92,
    "planningAndTimeManagement": 54.66,
    "completion": 1.25,
    "behaviorAndDisciplineScore": 54.78,
    "offTaskBehavior": 70,
    "nonCompliance": 55.91,
    "participationControl": 61.73,
    "peerSafetyAndBelonging": 51.44,
    "impulseControl": 48.68,
    "angerAndEmotionalRegulation": 55.57,
    "studentHealthScore": 53.965
  }
];

export const WEEKLY_DATA: TimeSeriesData[] = [
  {
    "startDate": "2026-04-13",
    "endDate": "2026-04-19",
    "attentionAndFocusAvg": 48.99,
    "learningAndReadiness": 52.98,
    "readingAndComprehension": 54.69,
    "recallAndRetention": 49.26,
    "problemSolving": 51.18,
    "reasoning": 52.59,
    "creativeExpression": 56.05,
    "taskEngagementScore": 48.96,
    "consistency": 58.01,
    "taskInitiation": 47.36,
    "independentExecution": 56.03,
    "responseToChallenge": 60.02,
    "persistence": 50.96,
    "planningAndTimeManagement": 50.35,
    "completion": 2.08,
    "behaviorAndDisciplineScore": 53.79,
    "offTaskBehavior": 56.71,
    "nonCompliance": 54.73,
    "participationControl": 56.75,
    "peerSafetyAndBelonging": 50.83,
    "impulseControl": 47.02,
    "angerAndEmotionalRegulation": 50.68,
    "studentHealthScore": 51.18
  },
  {
    "startDate": "2026-04-20",
    "endDate": "2026-04-26",
    "attentionAndFocusAvg": 51.86,
    "learningAndReadiness": 56.89,
    "readingAndComprehension": 57.71,
    "recallAndRetention": 55.01,
    "problemSolving": 53.2,
    "reasoning": 56.73,
    "creativeExpression": 59.21,
    "taskEngagementScore": 52.43,
    "consistency": 63.71,
    "taskInitiation": 62.12,
    "independentExecution": 62.47,
    "responseToChallenge": 62.82,
    "persistence": 57.95,
    "planningAndTimeManagement": 58.14,
    "completion": 2.83,
    "behaviorAndDisciplineScore": 60.4,
    "offTaskBehavior": 64,
    "nonCompliance": 63.69,
    "participationControl": 61.32,
    "peerSafetyAndBelonging": 57.48,
    "impulseControl": 58.54,
    "angerAndEmotionalRegulation": 57.38,
    "studentHealthScore": 55.395
  },
  {
    "startDate": "2026-04-27",
    "endDate": "2026-05-03",
    "attentionAndFocusAvg": 49.75,
    "learningAndReadiness": 51.08,
    "readingAndComprehension": 52.8,
    "recallAndRetention": 50.88,
    "problemSolving": 46.99,
    "reasoning": 55.97,
    "creativeExpression": 48.78,
    "taskEngagementScore": 49.92,
    "consistency": 59.24,
    "taskInitiation": 57.6,
    "independentExecution": 56.6,
    "responseToChallenge": 58.96,
    "persistence": 53.19,
    "planningAndTimeManagement": 48.51,
    "completion": 2.84,
    "behaviorAndDisciplineScore": 56.7,
    "offTaskBehavior": 65.98,
    "nonCompliance": 60.12,
    "participationControl": 55.4,
    "peerSafetyAndBelonging": 56.43,
    "impulseControl": 55.31,
    "angerAndEmotionalRegulation": 52.79,
    "studentHealthScore": 51.8625
  },
  {
    "startDate": "2026-05-04",
    "endDate": "2026-05-10",
    "attentionAndFocusAvg": 53.02,
    "learningAndReadiness": 58.33,
    "readingAndComprehension": 56.26,
    "recallAndRetention": 66.17,
    "problemSolving": 59.27,
    "reasoning": 58.61,
    "creativeExpression": 57.35,
    "taskEngagementScore": 44.76,
    "consistency": 61.28,
    "taskInitiation": 63.35,
    "independentExecution": 63.19,
    "responseToChallenge": 63.76,
    "persistence": 60.68,
    "planningAndTimeManagement": 59.23,
    "completion": 1.57,
    "behaviorAndDisciplineScore": 61.88,
    "offTaskBehavior": 63.92,
    "nonCompliance": 63.09,
    "participationControl": 66.38,
    "peerSafetyAndBelonging": 58.37,
    "impulseControl": 57.94,
    "angerAndEmotionalRegulation": 60.89,
    "studentHealthScore": 54.4975
  },
  {
    "startDate": "2026-05-11",
    "endDate": "2026-05-17",
    "attentionAndFocusAvg": 50.46,
    "learningAndReadiness": 55.61,
    "readingAndComprehension": 53.5,
    "recallAndRetention": 62.12,
    "problemSolving": 56.08,
    "reasoning": 56.09,
    "creativeExpression": 50.79,
    "taskEngagementScore": 51.69,
    "consistency": 59.03,
    "taskInitiation": 66.97,
    "independentExecution": 56.8,
    "responseToChallenge": 63.87,
    "persistence": 53.24,
    "planningAndTimeManagement": 56.31,
    "completion": 3.01,
    "behaviorAndDisciplineScore": 58.84,
    "offTaskBehavior": 67.11,
    "nonCompliance": 60.38,
    "participationControl": 60.47,
    "peerSafetyAndBelonging": 53.85,
    "impulseControl": 62.53,
    "angerAndEmotionalRegulation": 52.02,
    "studentHealthScore": 54.15
  },
  {
    "startDate": "2026-05-18",
    "endDate": "2026-05-24",
    "attentionAndFocusAvg": 52.99,
    "learningAndReadiness": 58.28,
    "readingAndComprehension": 56.81,
    "recallAndRetention": 57.59,
    "problemSolving": 58.64,
    "reasoning": 58.12,
    "creativeExpression": 61.55,
    "taskEngagementScore": 49.37,
    "consistency": 65.31,
    "taskInitiation": 61.31,
    "independentExecution": 55.53,
    "responseToChallenge": 65.67,
    "persistence": 53.19,
    "planningAndTimeManagement": 56.86,
    "completion": 1.55,
    "behaviorAndDisciplineScore": 53.85,
    "offTaskBehavior": 68.1,
    "nonCompliance": 63.72,
    "participationControl": 64.12,
    "peerSafetyAndBelonging": 48.88,
    "impulseControl": 61.46,
    "angerAndEmotionalRegulation": 45.52,
    "studentHealthScore": 53.6225
  },
  {
    "startDate": "2026-05-25",
    "endDate": "2026-05-31",
    "attentionAndFocusAvg": 56.12,
    "learningAndReadiness": 61.35,
    "readingAndComprehension": 62.39,
    "recallAndRetention": 58.25,
    "problemSolving": 63.59,
    "reasoning": 59.4,
    "creativeExpression": 64.08,
    "taskEngagementScore": 53.63,
    "consistency": 67.21,
    "taskInitiation": 62.04,
    "independentExecution": 63.98,
    "responseToChallenge": 66.43,
    "persistence": 57.6,
    "planningAndTimeManagement": 59.88,
    "completion": 1.5,
    "behaviorAndDisciplineScore": 63.61,
    "offTaskBehavior": 70.87,
    "nonCompliance": 66.04,
    "participationControl": 66.16,
    "peerSafetyAndBelonging": 58.03,
    "impulseControl": 63.26,
    "angerAndEmotionalRegulation": 57.65,
    "studentHealthScore": 58.6775
  },
  {
    "startDate": "2026-06-01",
    "endDate": "2026-06-07",
    "attentionAndFocusAvg": 53.15,
    "learningAndReadiness": 58.05,
    "readingAndComprehension": 61.25,
    "recallAndRetention": 55.19,
    "problemSolving": 59.22,
    "reasoning": 58.28,
    "creativeExpression": 59.35,
    "taskEngagementScore": 48.96,
    "consistency": 65.72,
    "taskInitiation": 64.48,
    "independentExecution": 62.74,
    "responseToChallenge": 64.37,
    "persistence": 57.12,
    "planningAndTimeManagement": 59.2,
    "completion": 1.54,
    "behaviorAndDisciplineScore": 61.7,
    "offTaskBehavior": 67.91,
    "nonCompliance": 65.27,
    "participationControl": 61.62,
    "peerSafetyAndBelonging": 58.09,
    "impulseControl": 60.63,
    "angerAndEmotionalRegulation": 56.67,
    "studentHealthScore": 55.465
  },
  {
    "startDate": "2026-06-08",
    "endDate": "2026-06-14",
    "attentionAndFocusAvg": 55.27,
    "learningAndReadiness": 61.01,
    "readingAndComprehension": 66.1,
    "recallAndRetention": 65.21,
    "problemSolving": 58,
    "reasoning": 63.89,
    "creativeExpression": 60.5,
    "taskEngagementScore": 47.94,
    "consistency": 66.84,
    "taskInitiation": 66.57,
    "independentExecution": 62.87,
    "responseToChallenge": 68,
    "persistence": 58.64,
    "planningAndTimeManagement": 61.2,
    "completion": 1.04,
    "behaviorAndDisciplineScore": 66.77,
    "offTaskBehavior": 77.27,
    "nonCompliance": 68.01,
    "participationControl": 69.54,
    "peerSafetyAndBelonging": 62.57,
    "impulseControl": 65.66,
    "angerAndEmotionalRegulation": 58.68,
    "studentHealthScore": 57.7475
  },
  {
    "startDate": "2026-06-15",
    "endDate": "2026-06-21",
    "attentionAndFocusAvg": 58.88,
    "learningAndReadiness": 62.09,
    "readingAndComprehension": 65.44,
    "recallAndRetention": 62.85,
    "problemSolving": 54.79,
    "reasoning": 62.65,
    "creativeExpression": 64.72,
    "taskEngagementScore": 53.6,
    "consistency": 66.99,
    "taskInitiation": 63.96,
    "independentExecution": 67.43,
    "responseToChallenge": 66.98,
    "persistence": 58.56,
    "planningAndTimeManagement": 57.81,
    "completion": 0.94,
    "behaviorAndDisciplineScore": 66.6,
    "offTaskBehavior": 83.75,
    "nonCompliance": 65.42,
    "participationControl": 69.6,
    "peerSafetyAndBelonging": 61.58,
    "impulseControl": 68.14,
    "angerAndEmotionalRegulation": 58.75,
    "studentHealthScore": 60.2925
  },
  {
    "startDate": "2026-06-22",
    "endDate": "2026-06-28",
    "attentionAndFocusAvg": 44.79,
    "learningAndReadiness": 62.33,
    "readingAndComprehension": 65.9,
    "recallAndRetention": 57.37,
    "problemSolving": 57.42,
    "reasoning": 61.03,
    "creativeExpression": 61.07,
    "taskEngagementScore": 42.74,
    "consistency": 50.65,
    "taskInitiation": null,
    "independentExecution": 67.94,
    "responseToChallenge": 64.73,
    "persistence": 38.31,
    "planningAndTimeManagement": 65.19,
    "completion": 0.71,
    "behaviorAndDisciplineScore": 45.49,
    "offTaskBehavior": 63.9,
    "nonCompliance": 72.22,
    "participationControl": 50.42,
    "peerSafetyAndBelonging": 48.68,
    "impulseControl": null,
    "angerAndEmotionalRegulation": 38,
    "studentHealthScore": 48.8375
  },
  {
    "startDate": "2026-06-29",
    "endDate": "2026-07-05",
    "attentionAndFocusAvg": 48.86,
    "learningAndReadiness": 57.49,
    "readingAndComprehension": 62.59,
    "recallAndRetention": 53.16,
    "problemSolving": 59.02,
    "reasoning": 56.2,
    "creativeExpression": 56.46,
    "taskEngagementScore": 49.23,
    "consistency": 57.71,
    "taskInitiation": 60.2,
    "independentExecution": 53.61,
    "responseToChallenge": 61.71,
    "persistence": 48.47,
    "planningAndTimeManagement": 57.66,
    "completion": 1.72,
    "behaviorAndDisciplineScore": 44.83,
    "offTaskBehavior": 66.94,
    "nonCompliance": 73.52,
    "participationControl": 56.17,
    "peerSafetyAndBelonging": 41.02,
    "impulseControl": 63.57,
    "angerAndEmotionalRegulation": 39.42,
    "studentHealthScore": 50.1025
  },
  {
    "startDate": "2026-07-06",
    "endDate": "2026-07-12",
    "attentionAndFocusAvg": 56.95,
    "learningAndReadiness": 60.44,
    "readingAndComprehension": 64.51,
    "recallAndRetention": 64.9,
    "problemSolving": 61.74,
    "reasoning": 61.83,
    "creativeExpression": 62.31,
    "taskEngagementScore": 56.51,
    "consistency": 72.49,
    "taskInitiation": 61.63,
    "independentExecution": 67.4,
    "responseToChallenge": 64.18,
    "persistence": 57.22,
    "planningAndTimeManagement": 61.71,
    "completion": 0.62,
    "behaviorAndDisciplineScore": 63.83,
    "offTaskBehavior": 83.18,
    "nonCompliance": 48.79,
    "participationControl": 67.15,
    "peerSafetyAndBelonging": 59.66,
    "impulseControl": 76.99,
    "angerAndEmotionalRegulation": 57.35,
    "studentHealthScore": 59.4325
  },
  {
    "startDate": "2026-07-13",
    "endDate": "2026-07-19",
    "attentionAndFocusAvg": 62.24,
    "learningAndReadiness": 68.78,
    "readingAndComprehension": 70.37,
    "recallAndRetention": 82.03,
    "problemSolving": 58.97,
    "reasoning": 68.79,
    "creativeExpression": 63.74,
    "taskEngagementScore": 57.62,
    "consistency": 71.99,
    "taskInitiation": 64.12,
    "independentExecution": 71.56,
    "responseToChallenge": 67.97,
    "persistence": 61.33,
    "planningAndTimeManagement": 64.4,
    "completion": 1.99,
    "behaviorAndDisciplineScore": 73.66,
    "offTaskBehavior": 82.35,
    "nonCompliance": 76.43,
    "participationControl": 76.5,
    "peerSafetyAndBelonging": 70.17,
    "impulseControl": 73.49,
    "angerAndEmotionalRegulation": 63.04,
    "studentHealthScore": 65.575
  },
  {
    "startDate": "2026-07-20",
    "endDate": "2026-07-26",
    "attentionAndFocusAvg": 61.83,
    "learningAndReadiness": 69.43,
    "readingAndComprehension": 67.37,
    "recallAndRetention": 84.33,
    "problemSolving": 68.92,
    "reasoning": 68.66,
    "creativeExpression": 64.13,
    "taskEngagementScore": 57.44,
    "consistency": 72.72,
    "taskInitiation": null,
    "independentExecution": 69.95,
    "responseToChallenge": 66.14,
    "persistence": 66.83,
    "planningAndTimeManagement": 68.11,
    "completion": 0.92,
    "behaviorAndDisciplineScore": 74.12,
    "offTaskBehavior": 90,
    "nonCompliance": 67.24,
    "participationControl": 81.06,
    "peerSafetyAndBelonging": 70.74,
    "impulseControl": 73.26,
    "angerAndEmotionalRegulation": 66.83,
    "studentHealthScore": 65.705
  },
  {
    "startDate": "2026-07-27",
    "endDate": "2026-08-02",
    "attentionAndFocusAvg": 61.31,
    "learningAndReadiness": 65.32,
    "readingAndComprehension": 65.98,
    "recallAndRetention": 60.31,
    "problemSolving": 64.59,
    "reasoning": 62.06,
    "creativeExpression": 69.43,
    "taskEngagementScore": 54.59,
    "consistency": 76.15,
    "taskInitiation": null,
    "independentExecution": 66.67,
    "responseToChallenge": 69,
    "persistence": 61.86,
    "planningAndTimeManagement": 61.63,
    "completion": 0.82,
    "behaviorAndDisciplineScore": 35.91,
    "offTaskBehavior": 85.9,
    "nonCompliance": 71.15,
    "participationControl": 54.54,
    "peerSafetyAndBelonging": 31.6,
    "impulseControl": 77.04,
    "angerAndEmotionalRegulation": 30.85,
    "studentHealthScore": 54.2825
  },
  {
    "startDate": "2026-08-03",
    "endDate": "2026-08-09",
    "attentionAndFocusAvg": 68.64,
    "learningAndReadiness": 72.13,
    "readingAndComprehension": 82.66,
    "recallAndRetention": 80.02,
    "problemSolving": 58.07,
    "reasoning": 69.28,
    "creativeExpression": 73.59,
    "taskEngagementScore": 54.84,
    "consistency": 82.51,
    "taskInitiation": 66.03,
    "independentExecution": 77.37,
    "responseToChallenge": 72.94,
    "persistence": 65.08,
    "planningAndTimeManagement": 68.49,
    "completion": 1.09,
    "behaviorAndDisciplineScore": 73.16,
    "offTaskBehavior": 84.48,
    "nonCompliance": 72.86,
    "participationControl": 82.33,
    "peerSafetyAndBelonging": 65.54,
    "impulseControl": 73.69,
    "angerAndEmotionalRegulation": 64.79,
    "studentHealthScore": 67.1925
  },
  {
    "startDate": "2026-08-10",
    "endDate": "2026-08-16",
    "attentionAndFocusAvg": 42.89,
    "learningAndReadiness": 72.84,
    "readingAndComprehension": 83.2,
    "recallAndRetention": 76.69,
    "problemSolving": 54.66,
    "reasoning": 75.48,
    "creativeExpression": 74.16,
    "taskEngagementScore": 41.45,
    "consistency": 87.7,
    "taskInitiation": null,
    "independentExecution": 76.29,
    "responseToChallenge": 47.68,
    "persistence": 42.55,
    "planningAndTimeManagement": 66.72,
    "completion": 0.94,
    "behaviorAndDisciplineScore": 43.74,
    "offTaskBehavior": 64.6,
    "nonCompliance": 90,
    "participationControl": 50.62,
    "peerSafetyAndBelonging": 35.37,
    "impulseControl": 67.13,
    "angerAndEmotionalRegulation": 34.27,
    "studentHealthScore": 50.23
  },
  {
    "startDate": "2026-08-17",
    "endDate": "2026-08-23",
    "attentionAndFocusAvg": null,
    "learningAndReadiness": null,
    "readingAndComprehension": null,
    "recallAndRetention": null,
    "problemSolving": null,
    "reasoning": null,
    "creativeExpression": null,
    "taskEngagementScore": null,
    "consistency": null,
    "taskInitiation": null,
    "independentExecution": null,
    "responseToChallenge": null,
    "persistence": null,
    "planningAndTimeManagement": null,
    "completion": null,
    "behaviorAndDisciplineScore": null,
    "offTaskBehavior": null,
    "nonCompliance": null,
    "participationControl": null,
    "peerSafetyAndBelonging": null,
    "impulseControl": null,
    "angerAndEmotionalRegulation": null,
    "studentHealthScore": null
  },
  {
    "startDate": "2026-08-24",
    "endDate": "2026-08-30",
    "attentionAndFocusAvg": 46.3,
    "learningAndReadiness": 52.43,
    "readingAndComprehension": 49.48,
    "recallAndRetention": 50.12,
    "problemSolving": 55.72,
    "reasoning": 52.5,
    "creativeExpression": 45.84,
    "taskEngagementScore": 56.72,
    "consistency": 61.67,
    "taskInitiation": 40,
    "independentExecution": 62.36,
    "responseToChallenge": 59.58,
    "persistence": 53.68,
    "planningAndTimeManagement": 53.56,
    "completion": null,
    "behaviorAndDisciplineScore": 50.47,
    "offTaskBehavior": 30,
    "nonCompliance": 41.56,
    "participationControl": 55.21,
    "peerSafetyAndBelonging": 50.83,
    "impulseControl": 42.34,
    "angerAndEmotionalRegulation": 54.52,
    "studentHealthScore": 51.48
  }
];


export const TIER_COUNTS: TierDistributionData = {
  studentHealth: { tier1: 0, tier2: 15, tier3: 1 },
  attentionAndFocus: { tier1: 0, tier2: 13, tier3: 3 },
  learningReadiness: { tier1: 0, tier2: 15, tier3: 1 },
  taskEngagement: { tier1: 0, tier2: 15, tier3: 1 },
  behaviourAndDiscipline: { tier1: 1, tier2: 15, tier3: 1 },
};


// This array contains any rows (like Tiers, counts, percentages) that didn't fit into the structures above.
export const OTHER_ROWS: any[][] = [
  [
    "< 40 = tier 3",
    null,
    null,
    null,
    null,
    null,
    "count",
    "Tier 1",
    0,
    0,
    0,
    0,
    1
  ],
  [
    "41 to 70 = tier 2",
    null,
    null,
    null,
    null,
    null,
    null,
    "Tier 2",
    15,
    13,
    15,
    15,
    15
  ],
  [
    "> 70 = tier 1",
    null,
    null,
    null,
    null,
    null,
    null,
    "Tier 3",
    1,
    3,
    1,
    1,
    1
  ]
];
