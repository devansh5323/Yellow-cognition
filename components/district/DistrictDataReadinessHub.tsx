"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  FileBarChart,
  Gauge,
  HandHelping,
  Layers,
  Link2,
  Presentation,
  RefreshCw,
  Rocket,
  Scale,
  School,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { districtReadiness, executivePriorityQueue, type PriorityItem } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 55%)";
const RED = "hsl(0 78% 58%)";
const LINK_BLUE = "hsl(212 90% 62%)";

const QUICK_ACTIONS: { label: string; Icon: LucideIcon }[] = [
  { label: "Compare schools", Icon: Scale },
  { label: "Review priority schools", Icon: AlertTriangle },
  { label: "View district tier support", Icon: Layers },
  { label: "Review specialist capacity", Icon: Users },
  { label: "Generate district summary", Icon: FileBarChart },
  { label: "Assign district support", Icon: HandHelping },
  { label: "Launch district strategy", Icon: Rocket },
  { label: "Create board report", Icon: Presentation },
];

function readinessBand(pct: number): { label: string; tone: string } {
  if (pct >= 85) return { label: "Strong", tone: GREEN };
  if (pct >= 70) return { label: "Good", tone: BLUE };
  if (pct >= 55) return { label: "Fair", tone: AMBER };
  return { label: "Needs Attention", tone: RED };
}

const SEVERITY_ICON: Record<PriorityItem["severity"], LucideIcon> = {
  Urgent: AlertTriangle,
  High: Clock,
  Routine: FileBarChart,
};

export function DistrictDataReadinessHub() {
  const reduce = useReducedMotion();
  const readiness = useMemo(() => districtReadiness(), []);
  const priorities = useMemo(() => executivePriorityQueue(), []);
  const band = readinessBand(readiness.dataReadinessPct);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="District Data Readiness and Executive Action Hub"
    >
      <div className="premium-eyebrow">
        <span>District Data Readiness &amp; Executive Action Hub</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        {/* Section A — District Data Readiness */}
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="font-heading font-extrabold text-[16px] leading-tight">
              District Data Readiness
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Last updated {readiness.lastUpdate}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatTile
              icon={<Gauge className="h-4 w-4" />}
              value={`${readiness.dataReadinessPct}%`}
              label="Data Readiness"
              tone={band.tone}
              badge={band.label}
              featured
            />
            <StatTile
              icon={<School className="h-4 w-4" />}
              value={readiness.totalSchools}
              label="Total Schools"
              tone={BLUE}
            />
            <StatTile
              icon={<Link2 className="h-4 w-4" />}
              value={`${readiness.schoolsConnected}/${readiness.totalSchools}`}
              label="Connected to Yellow"
              tone={GREEN}
            />
            <StatTile
              icon={<UserCheck className="h-4 w-4" />}
              value={`${readiness.principalsActive}/${readiness.totalSchools}`}
              label="Principals Active"
              tone={GREEN}
            />
            <StatTile
              icon={<Layers className="h-4 w-4" />}
              value={`${readiness.classroomReportingCoveragePct}%`}
              label="Classroom Reporting Coverage"
              tone={readiness.classroomReportingCoveragePct >= 75 ? GREEN : AMBER}
            />
            <StatTile
              icon={<HandHelping className="h-4 w-4" />}
              value={`${readiness.interventionFollowUpCoveragePct}%`}
              label="Intervention Follow-up Coverage"
              tone={readiness.interventionFollowUpCoveragePct >= 75 ? GREEN : AMBER}
            />
          </div>
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Section B — Executive Priority Queue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-heading font-extrabold text-[16px] leading-tight">
              Executive Priority Queue
            </h2>
            <span className="text-[11px] text-muted-foreground">({priorities.length})</span>
          </div>
          <div className="space-y-2.5">
            {priorities.map((item) => (
              <PriorityRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Section C — Quick Actions */}
        <div>
          <h2 className="font-heading font-extrabold text-[16px] leading-tight mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionButton key={action.label} label={action.label} Icon={action.Icon} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StatTile({
  icon,
  value,
  label,
  tone,
  badge,
  featured,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone: string;
  badge?: string;
  featured?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-3.5"
      style={{
        borderColor: featured ? `color-mix(in srgb, ${tone} 35%, transparent)` : undefined,
        background: featured ? `color-mix(in srgb, ${tone} 6%, var(--card))` : undefined,
      }}
    >
      <span
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <div
        className={featured ? "mt-2.5 font-heading font-extrabold text-[26px] leading-none" : "mt-2.5 font-heading font-extrabold text-[20px] leading-none"}
        style={{ color: tone }}
      >
        {value}
      </div>
      <div className="mt-1 text-[10.5px] text-muted-foreground leading-snug">{label}</div>
      {badge && (
        <span
          className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full mt-1.5"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function PriorityRow({ item }: { item: PriorityItem }) {
  const Icon = SEVERITY_ICON[item.severity];
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5 flex items-start gap-3">
      <span
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${item.tone} 14%, transparent)`, color: item.tone }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-heading font-bold text-[13.5px] leading-tight">{item.title}</span>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: `color-mix(in srgb, ${item.tone} 14%, transparent)`, color: item.tone }}
          >
            {item.severity}
          </span>
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug truncate">{item.detail}</p>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[11.5px] font-bold shrink-0 hover:underline"
        style={{ color: LINK_BLUE }}
      >
        Review
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function QuickActionButton({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <button
      type="button"
      className="rounded-xl border border-border/60 bg-background/30 px-3 py-3.5 flex flex-col items-center justify-center gap-2 text-center transition-colors hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] hover:bg-muted/30"
    >
      <Icon className="h-4.5 w-4.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}
