// Shared metadata for the 7 driver-card keys (4 Cognitive Performance + 3
// Student Wellbeing) — same keys used by DriverCards.tsx, the "Select focus
// area" FTUE step, and Classroom Health Score's "Your focus area" callout,
// so all three stay in sync instead of redefining titles/tones separately.

import {
  BookOpen,
  ClipboardList,
  Cloud,
  Frown,
  HeartHandshake,
  Shield,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { OnboardingGoal } from "@/lib/onboarding";
import type { PillarKey } from "@/lib/classHealth";

const BLUE = "hsl(212 90% 58%)";
const GREEN = "hsl(142 55% 45%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";
const INDIGO = "hsl(243 75% 65%)";

export type DriverMeta = {
  key: OnboardingGoal;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
};

export const DRIVER_META: Record<OnboardingGoal, DriverMeta> = {
  focus: {
    key: "focus",
    title: "Attention and focus",
    description: "How well your class stays focused",
    Icon: Target,
    tone: BLUE,
  },
  academic: {
    key: "academic",
    title: "Learning readiness",
    description: "How prepared your class is to learn",
    Icon: BookOpen,
    tone: GREEN,
  },
  task: {
    key: "task",
    title: "Task engagement",
    description: "How well your class engages with assigned tasks",
    Icon: ClipboardList,
    tone: ORANGE,
  },
  behavior: {
    key: "behavior",
    title: "Behavior and discipline",
    description: "How consistently your class meets behavior expectations",
    Icon: Shield,
    tone: PURPLE,
  },
  anxiety: {
    key: "anxiety",
    title: "Anxiety and Coping Index",
    description: "How well your class copes with stress",
    Icon: Cloud,
    tone: INDIGO,
  },
  "peer-safety": {
    key: "peer-safety",
    title: "Peer Safety and Belonging",
    description: "How inclusive peer interactions are in your class",
    Icon: HeartHandshake,
    tone: PURPLE,
  },
  frustration: {
    key: "frustration",
    title: "Anger and Emotional Regulation",
    description: "How your class manages strong emotions",
    Icon: Frown,
    tone: ORANGE,
  },
};

const PILLAR_KEYS: PillarKey[] = ["focus", "academic", "task", "behavior"];

function isPillarKey(key: OnboardingGoal): key is PillarKey {
  return (PILLAR_KEYS as string[]).includes(key);
}

// Mirrors DriverCards.tsx's Student Wellbeing scores (72/81/64) — same
// "hardcoded but plausible" demo data, since there's no real per-class
// wellbeing model yet.
const WELLBEING_SCORE: Record<string, number> = {
  anxiety: 72,
  "peer-safety": 81,
  frustration: 64,
};

export function driverScore(key: OnboardingGoal, pillars: Record<PillarKey, number>): number {
  if (isPillarKey(key)) return pillars[key];
  return WELLBEING_SCORE[key] ?? 0;
}
