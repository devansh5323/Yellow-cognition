"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Inbox,
  Layers,
  Lightbulb,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  districtResourceActionLog,
  districtResourceCapacity,
  type ResourceRecommendation,
} from "@/lib/districtData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 55%)";
const ORANGE = "hsl(28 88% 54%)";
const RED = "hsl(0 78% 58%)";
const PURPLE = "hsl(262 60% 62%)";

const SEVERITY_TONE: Record<ResourceRecommendation["severity"], string> = {
  Critical: RED,
  High: ORANGE,
  Medium: AMBER,
  Low: GREEN,
};

const STATUS_TONE: Record<string, string> = {
  "In Progress": BLUE,
  Scheduled: AMBER,
  "Awaiting Approval": PURPLE,
  Completed: GREEN,
  "Review Due": RED,
};

function band(pct: number): { label: string; tone: string } {
  if (pct >= 80) return { label: "Good", tone: GREEN };
  if (pct >= 60) return { label: "Watch", tone: AMBER };
  return { label: "High", tone: RED };
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DistrictResourceCapacityOverview() {
  const reduce = useReducedMotion();
  const resource = useMemo(() => districtResourceCapacity(), []);
  const actionLog = useMemo(() => districtResourceActionLog(), []);

  const tier2Band = band(resource.tier2CapacityPct);
  const tier3Band = resource.tier3CaseloadPct >= 90 ? { label: "High", tone: RED } : band(100 - resource.tier3CaseloadPct);
  const specialistBand = band(resource.specialistAvailabilityPct);
  const backlogBand = resource.reviewsOverdue >= 5 ? { label: "High", tone: RED } : { label: "Good", tone: GREEN };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Resource and Specialist Capacity"
    >
      <div className="premium-eyebrow">
        <span>District Resource &amp; Specialist Capacity</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capacity Snapshot */}
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="inline-flex items-center gap-2 font-heading font-extrabold text-[16px] leading-tight">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Capacity Snapshot
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              Updated: {resource.lastUpdated}
              <RefreshCw className="h-3 w-3" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SnapshotTile
              icon={<Inbox className="h-4 w-4" />}
              value={resource.activeResourceRequests.value}
              label="Active resource requests"
              delta={resource.activeResourceRequests.delta}
              tone={BLUE}
            />
            <SnapshotTile
              icon={<RefreshCw className="h-4 w-4" />}
              value={resource.districtActionsInProgress.value}
              label="District actions in progress"
              delta={resource.districtActionsInProgress.delta}
              tone={ORANGE}
            />
            <SnapshotTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              value={resource.completedThisPeriod.value}
              label="Completed this period"
              delta={resource.completedThisPeriod.delta}
              tone={GREEN}
            />
            <SnapshotTile
              icon={<AlertTriangle className="h-4 w-4" />}
              value={resource.overdueActions.value}
              label="Overdue actions"
              delta={resource.overdueActions.delta}
              tone={RED}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CapacityTile
              icon={<User className="h-4.5 w-4.5" />}
              value={`${resource.specialistAvailabilityPct}%`}
              label="Specialist availability"
              tone={PURPLE}
              status={specialistBand}
            />
            <CapacityTile
              icon={<Layers className="h-4.5 w-4.5" />}
              value={`${resource.tier2CapacityPct}%`}
              label="Tier 2 capacity"
              tone={GREEN}
              status={tier2Band}
              barPct={resource.tier2CapacityPct}
            />
            <CapacityTile
              icon={<Users className="h-4.5 w-4.5" />}
              value={`${resource.tier3CaseloadPct}%`}
              label="Tier 3 caseload"
              tone={ORANGE}
              status={tier3Band}
              barPct={resource.tier3CaseloadPct}
            />
            <CapacityTile
              icon={<Clock className="h-4.5 w-4.5" />}
              value={resource.reviewsOverdue}
              label="Review backlog"
              tone={RED}
              status={backlogBand}
            />
          </div>
        </div>

        {/* Yellow Resource Recommendations */}
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="inline-flex items-center gap-2 font-heading font-extrabold text-[16px] leading-tight">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Yellow Resource Recommendations
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              AI insights powered by Yellow
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {resource.recommendations.map((item) => (
              <RecommendationRow key={item.id} item={item} />
            ))}
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold hover:underline"
            style={{ color: BLUE }}
          >
            View all recommendations ({resource.totalRecommendations})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Resource Action Log */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="inline-flex items-center gap-2 font-heading font-extrabold text-[16px] leading-tight">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Resource Action Log
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[12px] font-bold hover:underline"
            style={{ color: BLUE }}
          >
            View all active requests
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-[12.5px] min-w-[860px]">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
              <tr>
                <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Resource action</th>
                <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">School / Cluster</th>
                <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Owner</th>
                <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Status</th>
                <th className="p-3 font-bold text-[10px] uppercase tracking-[0.10em] text-left">Due date</th>
                <th className="p-3 w-[40px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {actionLog.map((entry) => (
                <tr key={entry.id} className="border-t border-border/50 hover:bg-primary/[0.035] transition-colors">
                  <td className="p-3 align-middle font-heading font-bold text-[13px]">{entry.action}</td>
                  <td className="p-3 align-middle text-muted-foreground">
                    {entry.school} <span className="text-[11px]">({entry.cluster})</span>
                  </td>
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px] font-bold">{initialsOf(entry.owner)}</AvatarFallback>
                      </Avatar>
                      {entry.owner}
                    </div>
                  </td>
                  <td className="p-3 align-middle">
                    <span
                      className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${STATUS_TONE[entry.status]} 14%, transparent)`,
                        color: STATUS_TONE[entry.status],
                      }}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-3 align-middle text-muted-foreground whitespace-nowrap">{entry.dueDate}</td>
                  <td className="p-3 align-middle text-right">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom insight banner */}
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </span>
          <p className="text-[13px] leading-snug">
            <span className="font-heading font-extrabold">Yellow recommends</span>{" "}
            <span className="text-muted-foreground">{resource.topInsight}</span>{" "}
            <button type="button" className="font-bold hover:underline" style={{ color: BLUE }}>
              View insight details →
            </button>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-amber-500 text-amber-950 text-[11.5px] font-bold hover:bg-amber-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Log resource support
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border text-[11.5px] font-bold hover:bg-muted/40 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            View full resource plan
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function SnapshotTile({
  icon,
  value,
  label,
  delta,
  tone,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  delta: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
      <span
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <div className="mt-2.5 font-heading font-extrabold text-[22px] leading-none tabular-nums" style={{ color: tone }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{label}</div>
      <div className="mt-1 text-[10px] font-bold" style={{ color: GREEN }}>
        ↗ {delta} from last week
      </div>
    </div>
  );
}

function CapacityTile({
  icon,
  value,
  label,
  tone,
  status,
  barPct,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone: string;
  status: { label: string; tone: string };
  barPct?: number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5">
      <span
        className="h-9 w-9 rounded-lg inline-flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <div className="mt-2.5 text-[10.5px] text-muted-foreground leading-snug">{label}</div>
      <div className="mt-1 font-heading font-extrabold text-[24px] leading-none tabular-nums" style={{ color: tone }}>
        {value}
      </div>
      {typeof barPct === "number" && (
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, barPct)}%`, background: status.tone }}
          />
        </div>
      )}
      <span
        className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded-full mt-2.5"
        style={{ background: `color-mix(in srgb, ${status.tone} 14%, transparent)`, color: status.tone }}
      >
        {status.label}
      </span>
    </div>
  );
}

function RecommendationRow({ item }: { item: ResourceRecommendation }) {
  const tone = SEVERITY_TONE[item.severity];
  return (
    <div
      className="rounded-xl border p-3 flex items-center gap-3"
      style={{
        background: `color-mix(in srgb, ${tone} 5%, var(--card))`,
        borderColor: `color-mix(in srgb, ${tone} 20%, transparent)`,
      }}
    >
      <span
        className="text-[9.5px] font-bold uppercase tracking-[0.05em] px-2 py-1 rounded-full shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        {item.severity}
      </span>
      <span
        className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
      >
        <Users className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-[13px] leading-tight">{item.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.detail}</div>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border shrink-0 hover:opacity-80 transition-opacity"
        style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
      >
        Review recommendation
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
