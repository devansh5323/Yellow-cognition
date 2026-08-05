"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Megaphone,
  Rocket,
  Sparkles,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  SCHOOL_RECENT_EVENTS,
  getSchoolClasses,
  getSchoolKpis,
  type SchoolEventCtaTarget,
} from "@/lib/schoolData";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type ActionPriority = "high" | "medium" | "low";

const PRIORITY_LABEL: Record<ActionPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const PRIORITY_TONE: Record<ActionPriority, string> = {
  high: "hsl(0 78% 58%)",
  medium: "hsl(38 92% 50%)",
  low: "hsl(142 55% 45%)",
};

type LeadershipAction = {
  id: string;
  priority: ActionPriority;
  Icon: LucideIcon;
  title: string;
  description: string;
  meta: string;
  cta: string;
  href?: SchoolEventCtaTarget;
  onOpenTool?: () => void;
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

function buildLeadershipActions(): LeadershipAction[] {
  const classes = getSchoolClasses();
  const kpis = getSchoolKpis();
  const actions: LeadershipAction[] = [];

  // Real critical-severity events surface first — no fabricated "safety incident."
  for (const event of SCHOOL_RECENT_EVENTS) {
    if (event.kind !== "alert") continue;
    actions.push({
      id: event.id,
      priority: event.severity === "critical" ? "high" : "medium",
      Icon: event.severity === "critical" ? AlertTriangle : Megaphone,
      title: event.title,
      description: event.body,
      meta: event.time,
      cta: event.cta?.label ?? "Review",
      href: event.cta?.to,
    });
  }

  if (kpis.followUpsDue > 0) {
    actions.push({
      id: "followups-due",
      priority: "high",
      Icon: ClipboardList,
      title: `Follow up on ${kpis.followUpsDue} classroom${kpis.followUpsDue === 1 ? "" : "s"} with at-risk students`,
      description: "These classrooms have flagged students and haven't checked in this period.",
      meta: "Overdue",
      cta: "View classrooms",
      href: "/school/classes",
    });
  }

  const missingCheckIns = classes.length - kpis.monthlyCheckInsDone;
  if (missingCheckIns > 0) {
    actions.push({
      id: "missing-checkins",
      priority: "medium",
      Icon: BarChart3,
      title: `Data missing from ${missingCheckIns} classroom${missingCheckIns === 1 ? "" : "s"}`,
      description: "Check-ins weren't completed this period — insights for these classes are incomplete.",
      meta: "Due this week",
      cta: "Request update",
      onOpenTool: () => comingSoon("Requesting a data update"),
    });
  }

  actions.push({
    id: "monthly-summary",
    priority: "low",
    Icon: FileText,
    title: "Prepare monthly PBIS leadership summary",
    description: "School report is due for the leadership team.",
    meta: "Due this week",
    cta: "Generate report",
    href: "/school/reports",
  });

  const rank: Record<ActionPriority, number> = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

export function SchoolLeadershipActionHub() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  const actions = useMemo(() => buildLeadershipActions(), []);
  const kpis = useMemo(() => getSchoolKpis(), []);

  // A single consistent "healthy" bar (60%) across every ratio — the same
  // benchmark this app already treats as meaningful elsewhere (see the
  // "Parent activation crossed 60%" celebration event).
  const HEALTHY_BAR = 0.6;
  const dataHealth = useMemo(() => {
    const teacherActivityRatio = kpis.totalTeachers > 0 ? kpis.activeTeachers / kpis.totalTeachers : 0;
    const checkInRatio = kpis.monthlyCheckInsTotal > 0 ? kpis.monthlyCheckInsDone / kpis.monthlyCheckInsTotal : 0;
    return [
      { label: "Data quality", good: kpis.dataReadinessPct / 100 >= HEALTHY_BAR },
      { label: "Consistency", good: teacherActivityRatio >= HEALTHY_BAR },
      { label: "Timeliness", good: checkInRatio >= HEALTHY_BAR },
      { label: "Family engagement", good: kpis.parentActivationPct / 100 >= HEALTHY_BAR },
    ];
  }, [kpis]);
  const readinessTone =
    kpis.dataReadinessPct / 100 >= HEALTHY_BAR ? "hsl(142 55% 42%)" : "hsl(38 92% 45%)";

  const parentInputsPending = Math.round(
    kpis.totalStudents * (1 - kpis.parentActivationPct / 100),
  );

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="premium-surface rounded-[20px] p-5 md:p-6"
      aria-label="School Data Readiness and Leadership Action Hub"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full text-left flex items-end justify-between gap-3 flex-wrap -m-1 p-1 rounded-xl transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="min-w-0">
          <div className="premium-eyebrow">
            <span>School data readiness</span>
          </div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1">
            Leadership Action Hub
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-snug">
            Monitor school reporting health and act on the most important leadership priorities.
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground shrink-0 transition-colors group-hover:bg-muted/60 group-hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
          />
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
            <div className="pt-5 mt-4 border-t border-border/60">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 xl:gap-0 xl:divide-x divide-border/60">
                {/* Today's leadership actions */}
                <div className="xl:pr-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-heading font-bold text-[14.5px]">Today&apos;s leadership actions</h3>
                    <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                      {actions.length}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {actions.map((action) => (
                      <ActionRow key={action.id} action={action} />
                    ))}
                  </ul>
                </div>

                {/* School Data Overview */}
                <div className="xl:pl-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-[13.5px] mb-3">School Data Overview</h3>
                    <div className="flex items-stretch gap-4 divide-x divide-border/60">
                      <div>
                        <div className="font-heading font-extrabold text-[28px] leading-none tabular-nums text-blue-600 dark:text-blue-400">
                          {kpis.classroomsConnected}
                          <span className="text-muted-foreground/70 text-[15px] font-bold"> of {kpis.totalClassrooms}</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mt-1">
                          classrooms active
                        </div>
                      </div>
                      <div className="pl-4">
                        <div
                          className="font-heading font-extrabold text-[28px] leading-none tabular-nums"
                          style={{ color: readinessTone }}
                        >
                          {kpis.dataReadinessPct}%
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground mt-1">
                          data readiness
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${kpis.dataReadinessPct}%`, background: readinessTone }}
                      />
                    </div>
                    <div className="mt-2 text-[10.5px] text-muted-foreground">
                      Last update: Today, {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <StatTile Icon={Users} tone="hsl(212 90% 58%)" value={kpis.activeTeachers} label="Active teachers" />
                    <StatTile
                      Icon={Check}
                      tone="hsl(142 55% 45%)"
                      value={kpis.monthlyCheckInsDone}
                      label="Class check-ins complete"
                    />
                    <StatTile
                      Icon={Users}
                      tone="hsl(262 55% 55%)"
                      value={parentInputsPending}
                      label="Parent inputs pending"
                    />
                    <StatTile
                      Icon={ClipboardList}
                      tone="hsl(0 78% 58%)"
                      value={kpis.followUpsDue}
                      label="Follow-ups due"
                    />
                  </div>

                  <div>
                    <h4 className="text-[11.5px] font-bold text-muted-foreground mb-2.5">Data health at a glance</h4>
                    <ul className="space-y-2">
                      {dataHealth.map((h) => (
                        <li key={h.label} className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold text-foreground/85">{h.label}</span>
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold"
                            style={{ color: h.good ? "hsl(142 55% 42%)" : "hsl(38 92% 45%)" }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: h.good ? "hsl(142 55% 42%)" : "hsl(38 92% 45%)" }}
                            />
                            {h.good ? "Good" : "Needs improvement"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[11.5px] font-bold text-muted-foreground mb-2.5">Quick actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <ul className="space-y-0.5">
                        <QuickActionRow Icon={BarChart3} label="Grade overview" href="/school/classes" tone="hsl(212 90% 58%)" />
                        <QuickActionRow Icon={ClipboardList} label="Tier 2/3 cases" href="/school/classes" tone="hsl(0 78% 58%)" />
                        <QuickActionRow Icon={Sparkles} label="Intervention status" onClick={() => comingSoon("Intervention status")} tone="hsl(262 55% 55%)" />
                        <QuickActionRow Icon={FileText} label="School summary" href="/school/reports" tone="hsl(38 92% 48%)" />
                      </ul>
                      <ul className="space-y-0.5">
                        <QuickActionRow Icon={UserCog} label="Assign support" href="/school/teachers" tone="hsl(142 55% 45%)" />
                        <QuickActionRow Icon={Rocket} label="Launch strategy" onClick={() => comingSoon("Launching a school-wide strategy")} tone="hsl(28 88% 54%)" />
                        <QuickActionRow Icon={FileText} label="Leadership report" href="/school/reports" tone="hsl(212 90% 58%)" />
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl bg-primary/[0.06] border border-primary/20 p-3 text-[11.5px] text-foreground/80 leading-snug">
                    Reliable reporting helps school-wide insights stay accurate and actionable.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ActionRow({ action }: { action: LeadershipAction }) {
  const Icon = action.Icon;
  const tone = PRIORITY_TONE[action.priority];
  const cta = (
    <span
      className="inline-flex items-center justify-center h-7 rounded-lg px-2.5 text-[11.5px] font-bold shrink-0 border transition-colors"
      style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
    >
      {action.cta}
    </span>
  );

  return (
    <li className="flex items-stretch gap-0 rounded-xl border border-border bg-background overflow-hidden transition-colors hover:border-foreground/15">
      <span className="w-0.5 shrink-0" style={{ background: tone }} aria-hidden />
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3 px-3.5 py-2.5">
        <span
          className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>

        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
              style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
            >
              {PRIORITY_LABEL[action.priority]}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">{action.meta}</span>
          </div>
          <div className="font-heading font-bold text-[13px] leading-tight mt-0.5">{action.title}</div>
          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-1">
            {action.description}
          </div>
        </div>

        <div className="shrink-0 ml-auto">
          {action.href ? <Link href={action.href}>{cta}</Link> : (
            <button type="button" onClick={action.onOpenTool}>
              {cta}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function StatTile({
  Icon,
  tone,
  value,
  label,
}: {
  Icon: LucideIcon;
  tone: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <div className="font-heading font-extrabold text-[19px] tabular-nums mt-1.5" style={{ color: tone }}>
        {value}
      </div>
      <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{label}</div>
    </div>
  );
}

function QuickActionRow({
  Icon,
  label,
  tone,
  href,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  tone: string;
  href?: string;
  onClick?: () => void;
}) {
  const row = (
    <span className="group -mx-1.5 flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted/40">
      <span
        className="h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <span className="text-[11.5px] font-semibold leading-snug text-foreground/80">{label}</span>
    </span>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          {row}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="w-full text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {row}
        </button>
      )}
    </li>
  );
}
