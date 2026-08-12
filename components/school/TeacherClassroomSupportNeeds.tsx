"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ClipboardList,
  Lightbulb,
  MessageSquare,
  Repeat,
  ShieldCheck,
  Tag,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  teacherClassroomSupportSummary,
  supportNeedsRecommendedResponse,
  SUPPORT_CATEGORIES,
  type SupportCategory,
} from "@/lib/schoolData";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const WATCHLIST_LIMIT = 5;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

const CATEGORY_TONE: Record<SupportCategory, string> = {
  "PBIS coaching": "hsl(142 55% 42%)",
  "Classroom-management strategy": "hsl(212 90% 58%)",
  "Task-engagement support": "hsl(28 88% 54%)",
  "Specialist consultation": "hsl(262 60% 62%)",
  "Additional classroom assistance": "hsl(0 78% 58%)",
  "Parent-engagement support": "hsl(320 65% 55%)",
  "Schedule or routine adjustment": "hsl(38 92% 48%)",
};

type L1Item = {
  key: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => void;
};

export function TeacherClassroomSupportNeeds() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  const summary = useMemo(() => teacherClassroomSupportSummary(), []);
  const recommendedResponse = useMemo(() => supportNeedsRecommendedResponse(summary), [summary]);
  const watchlist = summary.teacherNeeds.slice(0, WATCHLIST_LIMIT);
  const watchlistOverflow = summary.teacherNeeds.length - watchlist.length;

  const statTiles = [
    { label: "classrooms showing repeated friction", value: summary.frictionClasses.length, Icon: Repeat, tone: "hsl(262 60% 62%)" },
    { label: "teachers managing high support needs", value: summary.teacherNeeds.length, Icon: Users, tone: "hsl(38 92% 48%)" },
    { label: "grades needing PBIS coaching", value: summary.pbisGrades.length, Icon: ShieldCheck, tone: "hsl(142 55% 42%)" },
  ];

  const frictionNames = Array.from(new Set(summary.frictionClasses.map((c) => c.name)));
  const topImproving = summary.improvingClasses.slice(0, 3);

  const items: L1Item[] = [
    {
      key: "friction",
      Icon: Repeat,
      title: "Classrooms showing repeated friction",
      description:
        summary.frictionClasses.length > 0
          ? `Attention and transitions continue to be a challenge in ${frictionNames.join(", ")}.`
          : "No classrooms are currently showing sustained attention or transition friction.",
      cta: "View classrooms",
      href: "/school/classes",
    },
    {
      key: "teachers",
      Icon: Users,
      title: "Teachers managing high support needs",
      description:
        summary.teacherNeeds.length > 0
          ? `${summary.teacherNeeds.length} teacher${summary.teacherNeeds.length === 1 ? "" : "s"} ${summary.teacherNeeds.length === 1 ? "is" : "are"} supporting classrooms flagged for follow-up or elevated caseload.`
          : "No teachers are currently flagged for elevated support needs.",
      cta: "Assign support",
      href: "/school/teachers",
    },
    {
      key: "pbis",
      Icon: ShieldCheck,
      title: "Grades needing PBIS coaching",
      description:
        summary.pbisGrades.length > 0
          ? `${summary.pbisGrades.map((g) => g.gradeLabel).join(" and ")} would benefit from targeted PBIS coaching on routines and reinforcement.`
          : "Every grade's behaviour driver is currently within a healthy range.",
      cta: "View insights",
      href: "/school/classes",
    },
    {
      key: "gaps",
      Icon: ClipboardList,
      title: "Intervention implementation gaps",
      description:
        summary.implementationGapClassCount > 0
          ? `${summary.implementationGapClassCount} classroom${summary.implementationGapClassCount === 1 ? "" : "s"} with at-risk students haven't checked in this period.`
          : "Every classroom with at-risk students has checked in this period.",
      cta: "View gaps",
      href: "/school/classes",
    },
    {
      key: "friction-points",
      Icon: MessageSquare,
      title: "Common teacher-reported friction points",
      description: "Requires a teacher-reported comments log at school scale, which isn't tracked yet.",
      cta: "Coming soon",
      onClick: () => comingSoon("Teacher-reported friction points"),
    },
    {
      key: "improving",
      Icon: TrendingUp,
      title: "Classrooms with improving outcomes",
      description:
        topImproving.length > 0
          ? `${topImproving.map((c) => c.name).join(", ")} are trending upward this period.`
          : "No classrooms are showing a positive trend this period.",
      cta: "View classrooms",
      href: "/school/classes",
    },
  ];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="Teacher and Classroom Support Needs"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>Teacher Support</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Teacher &amp; Classroom Support Needs
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Identify where staff support or school-level resources may be needed.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-4 border-t border-border/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="rounded-xl border border-border/60 bg-background/40 p-4 flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-full inline-flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`, color: tile.tone }}
                    >
                      <tile.Icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-heading font-black text-[22px] tabular-nums leading-none" style={{ color: tile.tone }}>
                        {tile.value}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug mt-1">{tile.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <ul className="rounded-xl border border-border/60 bg-background/40 divide-y divide-border/60">
                {items.map((item) => (
                  <li key={item.key} className="flex items-center gap-3 flex-wrap p-3.5">
                    <span className="h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                      <item.Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <div className="flex-1 min-w-[220px]">
                      <div className="font-heading font-bold text-[13px] leading-tight">{item.title}</div>
                      <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">{item.description}</p>
                    </div>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="inline-flex items-center justify-center h-8 rounded-lg px-3 text-[11.5px] font-bold text-primary border border-primary/30 hover:bg-primary/5 shrink-0"
                      >
                        {item.cta}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="inline-flex items-center justify-center h-8 rounded-lg px-3 text-[11.5px] font-bold text-muted-foreground border border-border/60 hover:bg-muted/40 shrink-0"
                      >
                        {item.cta}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {recommendedResponse && (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 flex items-start gap-3 flex-wrap">
                  <span className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div className="flex-1 min-w-[220px]">
                    <h3 className="font-heading font-bold text-[13px] mb-1">Recommended leadership response</h3>
                    <p className="text-[12px] text-foreground/80 leading-snug">{recommendedResponse}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => comingSoon("Creating a leadership plan")}
                    className="inline-flex items-center justify-center h-9 rounded-lg px-3.5 text-[12px] font-bold text-white bg-amber-600 hover:bg-amber-700 shrink-0"
                  >
                    Create plan
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0 bg-primary/12 text-primary">
                      <Tag className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    <h3 className="font-heading font-bold text-[13px]">Teacher watchlist</h3>
                  </div>
                  <Link href="/school/teachers" className="text-[11.5px] font-bold text-primary hover:underline">
                    View all teachers →
                  </Link>
                </div>
                {watchlist.length === 0 ? (
                  <p className="text-[11.5px] text-muted-foreground">No teachers are currently flagged for support.</p>
                ) : (
                  <ul className="space-y-2">
                    {watchlist.map((need) => (
                      <li
                        key={need.teacherId}
                        className="flex items-center justify-between gap-2 flex-wrap rounded-lg border border-border/60 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-[12.5px]">{need.teacherName}</span>
                          <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{need.reason}</p>
                        </div>
                        <span
                          className="inline-flex items-center text-[10.5px] font-bold px-2 py-1 rounded-full shrink-0"
                          style={{
                            background: `color-mix(in srgb, ${CATEGORY_TONE[need.category]} 14%, transparent)`,
                            color: CATEGORY_TONE[need.category],
                          }}
                        >
                          {need.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {watchlistOverflow > 0 && (
                  <p className="text-[10.5px] text-muted-foreground mt-2">
                    +{watchlistOverflow} more teacher{watchlistOverflow === 1 ? "" : "s"} flagged — see all teachers for the full list.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                <h4 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                  Possible support categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORT_CATEGORIES.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center text-[10.5px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${CATEGORY_TONE[cat]} 10%, transparent)`,
                        color: CATEGORY_TONE[cat],
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
