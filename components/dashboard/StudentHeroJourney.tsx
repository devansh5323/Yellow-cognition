"use client";

import { Clock, FolderCheck, Gamepad2, GraduationCap, type LucideIcon } from "lucide-react";
import { studentJourneySummary } from "@/lib/studentJourney";
import type { Student } from "@/data/mockData";

const TONE = {
  emerald: "hsl(142 55% 42%)",
  blue: "hsl(212 90% 52%)",
  amber: "hsl(38 92% 50%)",
  violet: "hsl(262 60% 58%)",
} as const;

type Tone = keyof typeof TONE;

/** Hero Journey tab: Neuroplay game/session activity for this student.
 * data/realStudents.ts has no real per-student session log yet, so every
 * number here is a deterministic seeded DEMO estimate (see
 * lib/studentJourney.ts) — clearly captioned as a preview rather than
 * silently presented as real. */
export function StudentHeroJourney({ student }: { student: Student }) {
  const j = studentJourneySummary(student.id);
  const firstName = student.name.split(" ")[0];
  const projectsPct = j.projectsRecommended > 0 ? Math.round((j.projectsCompleted / j.projectsRecommended) * 100) : 0;

  return (
    <section aria-label="Hero journey" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <header className="mb-4">
        <div className="premium-eyebrow">
          <Gamepad2 className="h-3.5 w-3.5 text-primary" />
          <span>Hero journey</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          {firstName}&apos;s Neuroplay activity
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
          Demo preview — real session history will appear here once Neuroplay data is available.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <JourneyStat
          icon={Gamepad2}
          tone="emerald"
          value={j.totalWorkouts}
          label="Total Workouts Completed"
          breakdown={[
            { value: j.recommendedWorkouts, label: "recommended" },
            { value: j.libraryWorkouts, label: "library" },
          ]}
        />
        <JourneyStat
          icon={GraduationCap}
          tone="blue"
          value={j.coachSessions}
          label="Coach Sessions Done"
          breakdown={[
            { value: j.coachingSessions, label: "coaching" },
            { value: j.baselineSessions, label: "baseline" },
          ]}
        />
        <JourneyStat
          icon={Clock}
          tone="amber"
          value={`${j.neuroplayMinutes} min`}
          label="Neuroplay Time"
          breakdown={[
            { value: `${j.coachingMinutes} min`, label: "coaching" },
            { value: `${j.recommendedGameMinutes} min`, label: "rec. games" },
            { value: `${j.libraryGameMinutes} min`, label: "library games" },
          ]}
        />
        <JourneyStat
          icon={FolderCheck}
          tone="violet"
          value={j.projectsCompleted}
          label="Projects Completed"
          breakdown={[{ value: `${projectsPct}%`, label: `of ${j.projectsRecommended} recommended` }]}
        />
      </div>
    </section>
  );
}

function JourneyStat({
  icon: Icon,
  tone,
  value,
  label,
  breakdown,
}: {
  icon: LucideIcon;
  tone: Tone;
  value: React.ReactNode;
  label: string;
  breakdown: { value: React.ReactNode; label: string }[];
}) {
  const t = TONE[tone];
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 min-w-0"
      style={{
        borderColor: `color-mix(in srgb, ${t} 30%, var(--border))`,
        background: `color-mix(in srgb, ${t} 6%, var(--card))`,
      }}
    >
      <span
        className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${t} 14%, transparent)`, color: t }}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>

      <div>
        <div className="font-heading font-black text-[28px] leading-none tabular-nums" style={{ color: t }}>
          {value}
        </div>
        <div className="text-[12.5px] font-semibold text-foreground/85 mt-1.5">{label}</div>
      </div>

      {breakdown.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5 mt-auto">
          {breakdown.map((b, i) => (
            <span key={i}>
              <span className="font-bold text-foreground/80">{b.value}</span> {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
