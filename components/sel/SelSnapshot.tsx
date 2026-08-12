"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Users, HeartPulse, PieChart, School, MessageSquareWarning, ArrowRight, type LucideIcon } from "lucide-react";
import type {
  StudentParticipation,
  PulseParticipation,
  ClassroomOverview,
  GroupSupportSummary,
  TeacherRequestsSummary,
} from "@/lib/selSnapshot";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function SelSnapshot({
  participation,
  pulse,
  groups,
  classrooms,
  requests,
}: {
  participation: StudentParticipation;
  pulse: PulseParticipation;
  groups: GroupSupportSummary;
  classrooms: ClassroomOverview;
  requests: TeacherRequestsSummary;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="SEL Snapshot"
      className="grid grid-cols-2 sm:grid-cols-5 gap-2.5"
    >
      <Tile icon={Users} tone="hsl(212 55% 50%)" label="Student Participation">
        <Stat value={participation.participating} suffix=" students" />
        <Sub>{participation.pct}% of school participating</Sub>
      </Tile>

      <Tile icon={HeartPulse} tone="hsl(258 55% 60%)" label="SEL Pulse Participation" href="/sel/pulse" cta="View pulse results">
        <Stat value={pulse.pct} suffix="%" />
        <Sub>
          {pulse.gradesParticipating} of {pulse.gradesTotal} grades completed this week&apos;s pulse
        </Sub>
      </Tile>

      <Tile icon={PieChart} tone="hsl(196 75% 50%)" label="Active Tier 2 Groups" href="/sel/groups" cta="Manage groups">
        <Stat value={groups.activeGroups} suffix=" active groups" small />
        <Sub>{groups.dueForReview} due for review this week</Sub>
      </Tile>

      <Tile icon={School} tone="hsl(38 92% 48%)" label="Classroom Overview" href="/sel/implementation" cta="View classes">
        <Stat value={classrooms.needSupport} suffix=" classes need support" small />
        <Sub>of {classrooms.total} classrooms tracked</Sub>
      </Tile>

      <Tile icon={MessageSquareWarning} tone="hsl(0 78% 56%)" label="Teacher Support Requests" href="/sel/teachers" cta="Review requests">
        <Stat value={requests.openCount} suffix=" open requests" small />
        <Sub>{requests.awaitingCoordinator} awaiting coordinator response</Sub>
      </Tile>
    </motion.section>
  );
}

function Tile({
  icon: Icon,
  tone,
  label,
  href,
  cta,
  children,
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  href?: string;
  cta?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-3.5 flex flex-col"
      style={{ borderTopColor: tone, borderTopWidth: 2 }}
    >
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 mb-2"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-1">{label}</div>
      <div className="flex-1 space-y-0.5">{children}</div>
      {href && cta && (
        <Link
          href={href}
          className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-bold shrink-0"
          style={{ color: tone }}
        >
          {cta}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function Stat({ value, suffix, small }: { value: number; suffix: string; small?: boolean }) {
  return (
    <div className={small ? "font-heading font-extrabold text-[15px] tabular-nums leading-tight" : "font-heading font-extrabold text-[19px] tabular-nums leading-tight"}>
      {value}
      <span className="text-[11px] font-semibold text-muted-foreground">{suffix}</span>
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] text-muted-foreground leading-snug">{children}</div>;
}
