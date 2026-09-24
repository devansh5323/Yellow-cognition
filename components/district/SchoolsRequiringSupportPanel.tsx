"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  Layers,
  ShieldAlert,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { schoolsRequiringSupport, SCHOOL_STATUS_META, type SupportType } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const LINK_BLUE = "hsl(212 90% 62%)";
const PURPLE = "hsl(262 60% 62%)";

const SUPPORT_TYPE_ICON: Record<SupportType, LucideIcon> = {
  "Leadership coaching": UserCog,
  "PBIS implementation support": ClipboardCheck,
  "Specialist allocation": UserPlus,
  "Teacher professional development": GraduationCap,
  "Tier 2 expansion": Layers,
  "Safety support": ShieldAlert,
  "Family engagement": HeartHandshake,
  "School improvement planning": ClipboardList,
};

const ROW_LIMIT = 3;

export function SchoolsRequiringSupportPanel() {
  const reduce = useReducedMotion();
  const schools = useMemo(() => schoolsRequiringSupport(), []);
  const [showAll, setShowAll] = useState(false);
  const visibleSchools = showAll ? schools : schools.slice(0, ROW_LIMIT);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="Schools Requiring District Support"
    >
      <div className="premium-eyebrow">
        <span>Schools Requiring District Support</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <p className="text-[12.5px] text-muted-foreground leading-snug">
            Schools currently flagged for district support, with why they were surfaced and what's already
            underway.
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {schools.length} school{schools.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-3">
          {visibleSchools.map((school) => {
            const statusMeta = SCHOOL_STATUS_META[school.status];
            const NeedIcon = SUPPORT_TYPE_ICON[school.resourceNeed];
            return (
              <article
                key={school.id}
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: `color-mix(in srgb, ${statusMeta.tone} 5%, var(--card))`,
                  borderColor: `color-mix(in srgb, ${statusMeta.tone} 22%, transparent)`,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-extrabold text-[15px] leading-tight">{school.name}</h3>
                        <span
                          className="text-[9.5px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `color-mix(in srgb, ${statusMeta.tone} 14%, transparent)`,
                            color: statusMeta.tone,
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {school.cluster} cluster · {school.gradeConfig} · Health {school.healthScore}/100
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1.5 rounded-full shrink-0"
                      style={{ background: `color-mix(in srgb, ${PURPLE} 14%, transparent)`, color: PURPLE }}
                    >
                      <NeedIcon className="h-3.5 w-3.5" />
                      {school.resourceNeed}
                    </span>
                  </div>

                  <p className="text-[12px] text-muted-foreground mt-2.5 leading-snug">{school.reasoning}</p>

                  <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                    <DetailField label="Support Provided" value={school.actionStatus} />
                    <DetailField label="District Owner" value={school.districtOwner} />
                    <DetailField label="Due Date" value={school.nextReviewDate} icon={CalendarClock} />
                    <DetailField label="Recommended Action" value={school.recommendedAction} />
                  </div>
                </div>

                <div
                  className="px-4 py-3 border-t flex items-center justify-end"
                  style={{ borderColor: `color-mix(in srgb, ${statusMeta.tone} 16%, transparent)` }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold hover:underline"
                    style={{ color: LINK_BLUE }}
                  >
                    Assign district support
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}

          {schools.length === 0 && (
            <p className="text-[12.5px] text-muted-foreground text-center py-8">
              No schools currently require district support.
            </p>
          )}
        </div>

        {schools.length > ROW_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold hover:underline"
            style={{ color: LINK_BLUE }}
          >
            {showAll ? "Show fewer schools" : `Show all ${schools.length} schools`}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
          </button>
        )}
      </div>
    </motion.section>
  );
}

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="inline-flex items-center gap-1 text-foreground/90 font-semibold mt-0.5 leading-snug">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground shrink-0" />}
        {value}
      </div>
    </div>
  );
}
