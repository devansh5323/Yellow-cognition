"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { MetricsRow, type MetricTile } from "@/components/specialist/MetricsRow";
import { ActionHub } from "@/components/specialist/ActionHub";
import { ReviewQueueTable } from "@/components/specialist/ReviewQueueTable";
import { PlanTrackerTable } from "@/components/specialist/PlanTrackerTable";
import { SupportSignals } from "@/components/specialist/SupportSignals";
import { TodayAndUpcomingRail } from "@/components/specialist/TodayAndUpcomingRail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDENTS } from "@/data/mockData";
import {
  concernBreakdown,
  getCaseloadEntries,
  getPlanTrackerRows,
  getReviewQueueRows,
  studentSupportActionHub,
  studentsImprovingCount,
  TIER_LABEL,
  type ActionHubItem,
  type CaseloadTier,
} from "@/lib/specialEdCaseload";
import {
  buildPlaceholderAssignments,
  fillPlanTrackerPlaceholders,
  fillReviewQueuePlaceholders,
  placeholderActionHubItems,
  placeholderMeetings,
} from "@/lib/specialEdPlaceholderData";
import {
  getAllFollowUpRecords,
  getPendingFollowUps,
  type FollowUpRecord,
  type PendingFollowUp,
} from "@/lib/interventionFollowUps";
import { cn } from "@/lib/utils";

const DASHBOARD_QUEUE_PREVIEW = 5;

export default function Page() {
  return (
    <SpecialistAppShell>
      <SpecialistDashboard />
    </SpecialistAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Single-school app — no multi-school data model exists yet, so this filter
// is a real (if currently inert) display of the one real school rather
// than a fabricated switcher.
const SCHOOL_NAME = "Riverside Academy";

type ViewKey = "overview" | "special-education" | "504";

const VIEW_TABS: { key: ViewKey; label: string }[] = [
  { key: "overview", label: "Support Overview" },
  { key: "special-education", label: "Special Education" },
  { key: "504", label: "504 Accommodation" },
];

function SpecialistDashboard() {
  const reduce = useReducedMotion();
  const router = useRouter();

  // The full, unfiltered caseload — used as the stable base for the
  // header filters and for the placeholder pathway assignment (so a
  // student's placeholder IEP/504 pathway doesn't shift as filters change).
  const fullEntries = useMemo(() => getCaseloadEntries(), []);
  const assignments = useMemo(() => buildPlaceholderAssignments(fullEntries), [fullEntries]);
  const gradeOptions = useMemo(() => Array.from(new Set(STUDENTS.map((s) => s.grade))).sort(), []);
  const tierOptions = useMemo(
    () => Array.from(new Set(fullEntries.map((e) => e.tier))).sort() as CaseloadTier[],
    [fullEntries],
  );

  const [view, setView] = useState<ViewKey>("overview");
  const [grade, setGrade] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");

  // Header filters + the view switch all persist and narrow what every
  // section below shows — Support Overview keeps the full caseload,
  // Special Education / 504 filter to that pathway (via the stable
  // placeholder assignment until a real IEP/504 plan model exists).
  const entries = useMemo(() => {
    let result = fullEntries;
    if (grade !== "all") result = result.filter((e) => e.student.grade === grade);
    if (tier !== "all") result = result.filter((e) => e.tier === tier);
    if (view !== "overview") {
      const wantedPathway = view === "special-education" ? "IEP" : "504";
      result = result.filter((e) => assignments.get(e.student.id)?.pathway === wantedPathway);
    }
    return result;
  }, [fullEntries, grade, tier, view, assignments]);

  // Real, but localStorage-backed — fetched client-side only to avoid an
  // SSR/hydration mismatch, same pattern used on the teacher /behavior page.
  const [overduePending, setOverduePending] = useState<PendingFollowUp[]>([]);
  const [followUpRecords, setFollowUpRecords] = useState<FollowUpRecord[]>([]);
  useEffect(() => {
    const refresh = () => {
      const caseloadIds = new Set(entries.map((e) => e.student.id));
      setOverduePending(getPendingFollowUps().filter((p) => caseloadIds.has(p.student.id)));
      setFollowUpRecords(getAllFollowUpRecords());
    };
    refresh();
    window.addEventListener("ah-followup-change", refresh);
    return () => window.removeEventListener("ah-followup-change", refresh);
  }, [entries]);

  const tier3Count = entries.filter((e) => e.tier === "tier3").length;
  const tier2Count = entries.filter((e) => e.tier === "tier2").length;
  const priorityEscalationsCount = tier3Count;
  const concernRows = useMemo(() => concernBreakdown(entries), [entries]);
  const studentsImproving = useMemo(() => studentsImprovingCount(), []);

  const reviewQueueRows = useMemo(
    () => fillReviewQueuePlaceholders(getReviewQueueRows(entries, overduePending), assignments),
    [entries, overduePending, assignments],
  );
  const planTrackerRows = useMemo(
    () => fillPlanTrackerPlaceholders(getPlanTrackerRows(entries, followUpRecords), entries),
    [entries, followUpRecords],
  );
  const meetings = useMemo(() => placeholderMeetings(entries), [entries]);

  // Placeholder rungs (IEP meeting prep, accommodation confirmation, parent
  // summary) fill in below the real ones — see specialEdPlaceholderData.ts.
  const actionHubItems = useMemo(() => {
    const real = studentSupportActionHub(entries, overduePending);
    const combined = [...real, ...placeholderActionHubItems(entries)];
    const rank: Record<ActionHubItem["priority"], number> = { high: 0, medium: 1, low: 2 };
    return combined.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, [entries, overduePending]);

  // Read the impure Date.now() once per mount rather than on every render —
  // same pattern used by ReturningActionHub.tsx elsewhere in this codebase.
  const [nowMs] = useState(() => Date.now());
  const activeIepCount = reviewQueueRows.filter((r) => r.pathway === "IEP").length;
  const active504Count = reviewQueueRows.filter((r) => r.pathway === "504").length;
  const upcomingReviewsCount = reviewQueueRows.filter(
    (r) =>
      r.nextReview &&
      +new Date(r.nextReview) >= nowMs &&
      +new Date(r.nextReview) <= nowMs + 7 * 24 * 60 * 60 * 1000,
  ).length;

  // Each metric opens its own filtered Review Queue L2 (per L2.2) —
  // "Overdue Follow-Ups" is the one exception, since it's a Plan &
  // Follow-Up Tracker concept (pending intervention follow-ups), not a
  // Review Queue scheduling concept.
  const metricTiles: MetricTile[] = [
    {
      key: "students-to-review",
      label: "Students to Review",
      value: entries.length,
      icon: ClipboardCheck,
      tone: "hsl(212 55% 50%)",
      onClick: () => router.push("/specialist/review-queue"),
    },
    {
      key: "active-iep-plans",
      label: "Active IEP Plans",
      value: activeIepCount,
      icon: FileText,
      tone: "hsl(258 55% 60%)",
      onClick: () => router.push("/specialist/special-education"),
    },
    {
      key: "active-504-plans",
      label: "Active 504 Plans",
      value: active504Count,
      icon: ShieldCheck,
      tone: "hsl(196 75% 50%)",
      onClick: () => router.push("/specialist/review-queue?filter=504"),
    },
    {
      key: "overdue-follow-ups",
      label: "Overdue Follow-Ups",
      value: overduePending.length,
      icon: Mail,
      tone: "hsl(0 78% 56%)",
      onClick: () => router.push("/specialist/support-plans"),
    },
    {
      key: "upcoming-reviews",
      label: "Upcoming Reviews",
      value: upcomingReviewsCount,
      icon: CalendarClock,
      tone: "hsl(142 55% 42%)",
      onClick: () => router.push("/specialist/review-queue?filter=upcoming"),
    },
    {
      key: "priority-escalations",
      label: "Priority Escalations",
      value: priorityEscalationsCount,
      icon: AlertTriangle,
      tone: "hsl(38 92% 48%)",
      onClick: () => router.push("/specialist/review-queue?filter=escalations"),
    },
  ];

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-6"
      >
        <section className="premium-elevated rounded-[22px] p-5 md:p-6 space-y-4">
          <header className="min-w-0">
            <div className="premium-eyebrow">
              <ClipboardList className="h-3 w-3" />
              <span>Student support workspace</span>
            </div>
            <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
              Student Support Dashboard
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
              Manage student support needs, plan implementation, reviews, and follow-ups across Special Education
              and 504.
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="School" value={SCHOOL_NAME} options={[SCHOOL_NAME]} onChange={() => {}} disabled />
            <FilterSelect
              label="Grade / Classroom"
              value={grade}
              onChange={setGrade}
              options={["all", ...gradeOptions]}
              display={(v) => (v === "all" ? "All Grades" : v)}
            />
            <FilterSelect
              label="Support Status"
              value={tier}
              onChange={setTier}
              options={["all", ...tierOptions]}
              display={(v) => (v === "all" ? "All Statuses" : TIER_LABEL[v as CaseloadTier])}
            />

            <div className="ml-auto inline-flex rounded-full border border-border/80 bg-muted/40 p-1">
              {VIEW_TABS.map((t) => {
                const active = view === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setView(t.key)}
                    className={cn(
                      "h-8 rounded-full px-3 text-[11.5px] font-bold transition-colors whitespace-nowrap",
                      active
                        ? "bg-card text-foreground shadow-[0_4px_10px_-6px_hsl(230_50%_18%/0.25)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {view !== "overview" && (
            <p className="text-[11.5px] text-muted-foreground flex flex-wrap items-center gap-2">
              <span>
                Showing {entries.length} student{entries.length === 1 ? "" : "s"} on {view === "special-education" ? "an IEP" : "a 504 plan"}.
              </span>
              {view === "special-education" && (
                <Link
                  href="/specialist/special-education"
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  Open IEP Management
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </p>
          )}
        </section>

        {/* Main content + persistent right rail — the rail stays visible
            on desktop while the main column scrolls, same pattern as the
            teacher /behavior page's Students Watchlist rail. */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-5 min-w-0">
            <MetricsRow tiles={metricTiles} />

            <ActionHub items={actionHubItems} />

            <ReviewQueueTable
              rows={reviewQueueRows.slice(0, DASHBOARD_QUEUE_PREVIEW)}
              viewAllHref="/specialist/review-queue"
            />

            <PlanTrackerTable
              rows={planTrackerRows.slice(0, DASHBOARD_QUEUE_PREVIEW)}
              viewAllHref="/specialist/support-plans"
            />

            <SupportSignals
              concernRows={concernRows}
              studentsImproving={studentsImproving}
              tier3Count={tier3Count}
              tier2Count={tier2Count}
              overallTrend="+6%"
            />
          </div>

          <div className="xl:sticky xl:top-[84px]">
            <TodayAndUpcomingRail overdueFollowUpsCount={overduePending.length} meetings={meetings} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  display,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  display?: (v: string) => string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto min-w-[150px] rounded-xl bg-card/70 border-border/80 backdrop-blur text-[12.5px] font-semibold gap-2",
          disabled && "opacity-70",
        )}
      >
        <span className="text-muted-foreground shrink-0 text-[10px] font-bold uppercase tracking-[0.06em]">
          {label}
        </span>
        <SelectValue>{display ? display(value) : value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {display ? display(o) : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
