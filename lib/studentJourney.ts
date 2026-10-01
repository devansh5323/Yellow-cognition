// Student "Hero Journey" (Neuroplay game/session history) — the real
// student dataset (data/realStudents.ts) has no per-student game/session
// log yet, so every number here is a deterministic seeded DEMO estimate,
// stable per student across reloads (not different every render), standing
// in for the real Neuroplay activity feed until it exists. The moment real
// per-student session data exists, this file is the one to replace.

function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function idSeed(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function range(seed: number, min: number, max: number): number {
  return Math.round(min + rand(seed) * (max - min));
}

export type StudentJourneySummary = {
  totalWorkouts: number;
  recommendedWorkouts: number;
  libraryWorkouts: number;
  coachSessions: number;
  coachingSessions: number;
  baselineSessions: number;
  neuroplayMinutes: number;
  coachingMinutes: number;
  recommendedGameMinutes: number;
  libraryGameMinutes: number;
  projectsCompleted: number;
  projectsRecommended: number;
};

export function studentJourneySummary(studentId: string): StudentJourneySummary {
  const seed = idSeed(studentId);

  const recommendedWorkouts = range(seed * 2, 12, 34);
  const libraryWorkouts = range(seed * 3, 2, 14);
  const totalWorkouts = recommendedWorkouts + libraryWorkouts;

  const coachingSessions = range(seed * 5, 0, 4);
  const baselineSessions = range(seed * 7, 0, 2);
  const coachSessions = coachingSessions + baselineSessions;

  const coachingMinutes = coachingSessions * range(seed * 11, 25, 45);
  const recommendedGameMinutes = recommendedWorkouts * range(seed * 13, 4, 8);
  const libraryGameMinutes = libraryWorkouts * range(seed * 17, 3, 7);
  const neuroplayMinutes = coachingMinutes + recommendedGameMinutes + libraryGameMinutes;

  const projectsRecommended = range(seed * 19, 6, 16);
  const projectsCompleted = Math.min(projectsRecommended, range(seed * 23, 0, 3));

  return {
    totalWorkouts,
    recommendedWorkouts,
    libraryWorkouts,
    coachSessions,
    coachingSessions,
    baselineSessions,
    neuroplayMinutes,
    coachingMinutes,
    recommendedGameMinutes,
    libraryGameMinutes,
    projectsCompleted,
    projectsRecommended,
  };
}
