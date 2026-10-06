import { getMongoClient } from "@/lib/mongodb";

export type RecommendedActivity = {
  key: string;
  name: string;
  activityType: string;
  objective: string;
  instructions: string[];
  materials: string;
  level: number;
  skill: string;
  indicator: string;
  startDay: number;
};

export type RecommendationResult = {
  age: string;
  assessment: string | null;
  skillsToDevelop: { skill: string; indicator: string }[];
  activities: RecommendedActivity[];
};

type RawActivity = {
  key: string;
  name: string;
  activity_type: string;
  objective: string;
  instructions: string;
  materials: string;
  level: number;
  assessment?: { name?: string };
  skill?: { name?: string };
  indicator?: { name?: string };
  startDay: number;
};

/** Reads the most recent plan in attention_hero.recommendation for an age
 * group (optionally filtered to one assessment area; most plans are untagged) and returns its skills
 * to develop and its activities in plan order, one entry per activity name. */
export async function getRecommendations(age: string, assessment: string | null = null, limit = 5): Promise<RecommendationResult | null> {
  const client = await getMongoClient();
  const col = client.db("attention_hero").collection<{ activities: RawActivity[] }>("recommendation");
  const latest = (filter: object) => col.find(filter).sort({ createdAt: -1 }).limit(1).next();
  const tagged = assessment ? await latest({ age, "activities.assessment.name": assessment }) : null;
  const doc = tagged ?? (await latest({ age }));
  if (!doc) return null;
  if (!tagged) assessment = null;

  const raw = doc.activities
    .filter((a) => !assessment || a.assessment?.name === assessment)
    .sort((a, b) => a.startDay - b.startDay);

  const skills = new Map<string, string>();
  for (const a of raw) if (a.skill?.name && !skills.has(a.skill.name)) skills.set(a.skill.name, a.indicator?.name ?? "");

  const seen = new Set<string>();
  const activities: RecommendedActivity[] = [];
  for (const a of raw) {
    if (seen.has(a.name)) continue;
    seen.add(a.name);
    activities.push({
      key: a.key,
      name: a.name,
      activityType: a.activity_type,
      objective: a.objective,
      instructions: a.instructions.split("##").filter(Boolean),
      materials: a.materials,
      level: a.level,
      skill: a.skill?.name ?? "",
      indicator: a.indicator?.name ?? "",
      startDay: a.startDay,
    });
    if (activities.length >= limit) break;
  }

  return {
    age,
    assessment,
    skillsToDevelop: [...skills].map(([skill, indicator]) => ({ skill, indicator })),
    activities,
  };
}
