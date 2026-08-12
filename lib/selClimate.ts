// School Climate & SEL Needs — Segment 2. The primary analytical segment:
// which areas need attention, where are needs concentrated, which areas
// are strong. Built entirely on top of Tool 2's real competencyStatusFor/
// competencyTrendFor derivations — this module just aggregates them into
// the 5-area board, the Top Need / Strongest Area callouts, and a coverage
// indicator, rather than introducing any new scoring logic of its own.

import { type Grade } from "@/data/mockData";
import {
  competencyStatusFor,
  competencyTrendFor,
  needsGradeOptions,
  NEEDS_BAND_LABEL,
  type NeedsBand,
  type Trend,
} from "@/lib/selNeeds";
import { type SelCompetency } from "@/lib/selPulse";

/** The spec's "recommended areas" — a school could track more of the full
 * SEL_COMPETENCIES taxonomy, but this segment's board is scoped to these 5. */
export const SCHOOL_CLIMATE_AREAS: SelCompetency[] = [
  "Emotional regulation",
  "Peer relationships",
  "Sense of belonging",
  "Coping with Challenges",
  "Student-Teacher Relationships",
];

// Short "what this band looks like" line per area — same hand-authored,
// presentation-only convention as classBehavior.ts's WATCH_TEXT/STRENGTH_TEXT.
const INTERPRETATION: Record<SelCompetency, Record<NeedsBand, string>> = {
  "Emotional regulation": {
    excellent: "Students recover quickly from frustration.",
    stable: "Emotional regulation is developing as expected.",
    watch: "Recovery time after frustration is lengthening.",
    "needs-support": "Frequent shutdowns or escalations need direct support.",
  },
  "Peer relationships": {
    excellent: "Peer interactions are consistently positive.",
    stable: "Peer relationships are generally steady.",
    watch: "Peer conflicts are becoming more frequent.",
    "needs-support": "Peer conflict is actively disrupting classrooms.",
  },
  "Sense of belonging": {
    excellent: "Students report feeling strongly connected to their class.",
    stable: "Most students feel they belong.",
    watch: "A growing number of students feel disconnected.",
    "needs-support": "Many students report low belonging.",
  },
  "Coping with Challenges": {
    excellent: "Students bounce back well from setbacks.",
    stable: "Coping strategies are generally effective.",
    watch: "Students are struggling more with setbacks.",
    "needs-support": "Students need direct support coping with challenges.",
  },
  "Student-Teacher Relationships": {
    excellent: "Students report strong trust with their teachers.",
    stable: "Student-teacher relationships are generally positive.",
    watch: "Trust in teacher relationships is softening.",
    "needs-support": "Students report weak connection with teachers.",
  },
  "Emotional safety": {
    excellent: "Classrooms feel consistently safe to speak up in.",
    stable: "Most students feel physically and emotionally safe.",
    watch: "Fewer students feel safe speaking up.",
    "needs-support": "Emotional safety needs direct attention.",
  },
  "Help-seeking": {
    excellent: "Students readily ask for help when needed.",
    stable: "Most students ask for help when needed.",
    watch: "Fewer students are asking for help.",
    "needs-support": "Students are not seeking help when they need it.",
  },
  "Confidence & self-efficacy": {
    excellent: "Students show strong confidence tackling new tasks.",
    stable: "Most students approach new tasks with confidence.",
    watch: "Confidence is dipping when tasks get harder.",
    "needs-support": "Students need direct support building confidence.",
  },
  Conflict: {
    excellent: "Reported conflict is rare.",
    stable: "Conflict is at a manageable baseline.",
    watch: "Reported conflict is trending up.",
    "needs-support": "Conflict is frequent and needs direct intervention.",
  },
  "School connectedness": {
    excellent: "Students feel strongly connected to the school community.",
    stable: "Most students feel connected to the school.",
    watch: "Fewer students feel connected to the wider school.",
    "needs-support": "School connectedness needs direct attention.",
  },
};

/** How many real grades have any data for this area, out of the total —
 * always 100% for driver-backed areas (the real roster always contributes),
 * lower for pulse-backed ones without an active pulse everywhere yet. */
export function areaCoveragePct(competency: SelCompetency): number {
  const grades = needsGradeOptions();
  if (grades.length === 0) return 0;
  const covered = grades.filter((g) => competencyStatusFor(competency, { grade: g }).available).length;
  return Math.round((covered / grades.length) * 100);
}

export type AreaOverviewRow = {
  competency: SelCompetency;
  available: boolean;
  score: number | null;
  band: NeedsBand | null;
  trend: Trend;
  coveragePct: number;
  interpretation: string | null;
};

export function areaOverview(areas: SelCompetency[] = SCHOOL_CLIMATE_AREAS): AreaOverviewRow[] {
  return areas.map((competency) => {
    const status = competencyStatusFor(competency, {});
    const trend = competencyTrendFor(competency, {});
    return {
      competency,
      available: status.available,
      score: status.score,
      band: status.band,
      trend,
      coveragePct: areaCoveragePct(competency),
      interpretation: status.band ? INTERPRETATION[competency][status.band] : null,
    };
  });
}

export type GradeOverviewRow = { grade: Grade; score: number | null; band: NeedsBand | null; coveragePct: number };

/** "By Grade" view — each grade's average health score across whichever of
 * the 5 areas actually have data for it. */
export function byGradeOverview(areas: SelCompetency[] = SCHOOL_CLIMATE_AREAS): GradeOverviewRow[] {
  return needsGradeOptions().map((grade) => {
    const statuses = areas.map((c) => competencyStatusFor(c, { grade })).filter((s) => s.available && s.score !== null);
    if (statuses.length === 0) return { grade, score: null, band: null, coveragePct: 0 };
    const score = Math.round(statuses.reduce((a, s) => a + s.score!, 0) / statuses.length);
    const band: NeedsBand = score >= 80 ? "excellent" : score >= 65 ? "stable" : score >= 50 ? "watch" : "needs-support";
    return { grade, score, band, coveragePct: Math.round((statuses.length / areas.length) * 100) };
  });
}

export type TopNeed = { competency: SelCompetency; score: number; decliningGrades: Grade[]; sentence: string };

/** The single worst-scoring available area school-wide — `null` when
 * nothing has real data yet, or when even the worst area is genuinely
 * healthy (Watch/Needs Support only; don't manufacture a "top need" out
 * of an area that's merely the least-excellent of a healthy bunch). */
export function topNeed(areas: SelCompetency[] = SCHOOL_CLIMATE_AREAS): TopNeed | null {
  const rows = areaOverview(areas).filter((r) => r.available && r.score !== null);
  if (rows.length === 0) return null;
  const worst = rows.reduce((a, b) => (b.score! < a.score! ? b : a));
  if (worst.band !== "watch" && worst.band !== "needs-support") return null;

  const decliningGrades = needsGradeOptions().filter((g) => competencyTrendFor(worst.competency, { grade: g }) === "down");
  const gradeList = decliningGrades.length > 0 ? decliningGrades.join(" and ") : null;
  const sentence = gradeList
    ? `Concerns increased across ${gradeList}.`
    : `Currently the area needing the most attention, though no grade is actively trending down.`;

  return { competency: worst.competency, score: worst.score!, decliningGrades, sentence };
}

export type StrongestArea = { competency: SelCompetency; score: number; onTrackFraction: number; sentence: string };

export function strongestArea(areas: SelCompetency[] = SCHOOL_CLIMATE_AREAS): StrongestArea | null {
  const rows = areaOverview(areas).filter((r) => r.available && r.score !== null);
  if (rows.length === 0) return null;
  const best = rows.reduce((a, b) => (b.score! > a.score! ? b : a));
  if (best.band !== "excellent") return null;

  const grades = needsGradeOptions();
  const onTrackOrStrong = grades.filter((g) => {
    const s = competencyStatusFor(best.competency, { grade: g });
    return s.band === "excellent" || s.band === "stable";
  });
  const onTrackFraction = grades.length === 0 ? 0 : onTrackOrStrong.length / grades.length;
  const sentence =
    onTrackFraction >= 0.5
      ? "Most grades remain On Track or Strong."
      : "Performance varies more across grades for this area.";

  return { competency: best.competency, score: best.score!, onTrackFraction, sentence };
}

export type ClimateCoverage = { overallPct: number; byGrade: { grade: Grade; pct: number }[] };

export function climateCoverage(areas: SelCompetency[] = SCHOOL_CLIMATE_AREAS): ClimateCoverage {
  const overallPct = Math.round(areas.reduce((a, c) => a + areaCoveragePct(c), 0) / Math.max(1, areas.length));
  const byGrade = byGradeOverview(areas).map((r) => ({ grade: r.grade, pct: r.coveragePct }));
  return { overallPct, byGrade };
}

export { NEEDS_BAND_LABEL };
