"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STUDENTS, type Student } from "@/data/mockData";
import { classHealth, SCORE_BANDS } from "@/lib/classHealth";
import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronDown, ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <AppShell>
      <ClassroomPage />
    </AppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

// The real roster has no grade/section field — only `ageGroup` — so
// "sections" here are age-group cohorts rather than the old grade×section
// combos. Derived from whatever age groups actually appear in the roster
// instead of a hardcoded list.
function ageGroupSortKey(g: string): number {
  const m = g.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
const ALL_SECTIONS = Array.from(new Set(STUDENTS.map((s) => s.ageGroup))).sort(
  (a, b) => ageGroupSortKey(a) - ageGroupSortKey(b),
);
type SectionKey = string;
const MAX_COMPARE = ALL_SECTIONS.length;

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid hsl(240 15% 90%)",
  background: "hsl(0 0% 100% / 0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
  fontSize: 12,
};

function ClassroomPage() {
  const reduce = useReducedMotion();
  const health = classHealth();

  // Real health-score distribution across the class — replaces the old
  // PFI-bucket histogram (`s.pfi` no longer exists).
  const buckets = SCORE_BANDS.map((b) => ({
    range: b.range,
    count: health.distribution[b.band],
  }));

  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([...ALL_SECTIONS]);
  const [detailSection, setDetailSection] = useState<SectionKey | null>(null);

  const toggleSection = (sec: SectionKey) => {
    setSelectedSections((prev) => {
      if (prev.includes(sec)) return prev.filter((s) => s !== sec);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, sec];
    });
  };

  const studentsBySection = useMemo(() => {
    const map = {} as Record<SectionKey, Student[]>;
    ALL_SECTIONS.forEach((sec) => {
      map[sec] = STUDENTS.filter((s) => s.ageGroup === sec);
    });
    return map;
  }, []);

  const sections = useMemo(
    () =>
      ALL_SECTIONS.filter((sec) => selectedSections.includes(sec)).map((sec) => {
        const subset = studentsBySection[sec];
        const h = classHealth(subset);
        return {
          section: sec,
          score: h.score,
          needsSupport: h.distribution["needs-support"],
          total: subset.length,
        };
      }),
    [selectedSections, studentsBySection],
  );

  const sectionPickerLabel =
    selectedSections.length === 0
      ? "Pick age groups"
      : selectedSections.length === ALL_SECTIONS.length
        ? "All age groups"
        : selectedSections.length === 1
          ? selectedSections[0]
          : `${selectedSections.length} of ${ALL_SECTIONS.length} age groups`;

  const top = [...STUDENTS].sort((a, b) => b.studentHealthScore - a.studentHealthScore).slice(0, 5);
  const needs = [...STUDENTS].sort((a, b) => a.studentHealthScore - b.studentHealthScore).slice(0, 5);

  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-5"
    >
      {/* ───── Batch comparison ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
        className="premium-surface rounded-[20px] p-5"
      >
        <div className="premium-section-header mb-4 flex-wrap gap-3">
          <div>
            <h2 className="premium-eyebrow">Sections</h2>
            <h3 className="font-heading font-extrabold text-[17px] mt-1.5">Batch comparison</h3>
            <p className="text-[11.5px] text-muted-foreground mt-1">
              Pick up to {MAX_COMPARE} sections · click any section card for the full breakdown.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card/70 hover:border-primary/40 text-[12.5px] font-semibold transition-colors"
              >
                <span>{sectionPickerLabel}</span>
                <span className="inline-flex h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold items-center justify-center tabular-nums">
                  {selectedSections.length}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-2 rounded-xl">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-border/60">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Age groups · max {MAX_COMPARE}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSections(
                      selectedSections.length === ALL_SECTIONS.length ? [] : [...ALL_SECTIONS],
                    )
                  }
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  {selectedSections.length === ALL_SECTIONS.length ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="mt-1.5 space-y-0.5">
                {ALL_SECTIONS.map((sec) => {
                  const active = selectedSections.includes(sec);
                  const atMax = !active && selectedSections.length >= MAX_COMPARE;
                  return (
                    <button
                      key={sec}
                      type="button"
                      disabled={atMax}
                      onClick={() => toggleSection(sec)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] font-semibold text-left transition-colors",
                        active ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
                        atMax && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      <Checkbox checked={active} className="pointer-events-none" />
                      <span>{sec}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-[13px] text-muted-foreground">
            Select at least one section above to compare.
          </div>
        ) : (
        <>
        <div
          className={cn(
            "grid gap-3 mb-5 grid-cols-1",
            sections.length === 2 && "md:grid-cols-2",
            sections.length === 3 && "md:grid-cols-3",
            sections.length >= 4 && "md:grid-cols-4",
          )}
        >
          {sections.map((s, i) => {
            const tone = s.needsSupport > 1 ? "hsl(0 78% 58%)" : "hsl(142 55% 50%)";
            return (
              <motion.div
                key={s.section}
                role="button"
                tabIndex={0}
                onClick={() => setDetailSection(s.section as SectionKey)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetailSection(s.section as SectionKey);
                  }
                }}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: i * 0.04 } },
                }}
                style={{ ["--kpi-tone" as never]: tone }}
                className="group premium-surface premium-surface-hover premium-kpi sheen-hover rounded-[16px] p-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={`Open detailed view for ${s.section}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-heading font-extrabold text-[16px]">{s.section}</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full font-semibold border",
                      s.needsSupport > 1
                        ? "bg-destructive/10 text-destructive border-destructive/25"
                        : "bg-primary/10 text-primary border-primary/25",
                    )}
                  >
                    {s.needsSupport} needs support
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <Mini label="Health" v={s.score} />
                  <Mini label="Students" v={s.total} />
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View details
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={sections} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="cls-health" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 60% 55%)" />
                  <stop offset="100%" stopColor="hsl(142 52% 40%)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
              <XAxis dataKey="section" fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
              <YAxis fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(142 52% 48% / 0.06)" }} />
              <Bar dataKey="score" fill="url(#cls-health)" radius={[8, 8, 0, 0]} name="Health score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </>
        )}
      </motion.section>

      {/* ───── Distribution + Radar ───── */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="grid md:grid-cols-2 gap-4"
      >
        <section className="premium-surface rounded-[18px] p-5">
          <div className="premium-section-header mb-3">
            <div>
              <h2 className="premium-eyebrow">Distribution</h2>
              <h3 className="font-heading font-extrabold text-[16px] mt-1.5">Health score distribution</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Class avg: <strong className="text-foreground tabular-nums">{health.score}</strong>
              </p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={buckets} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="cls-dist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 60% 55%)" />
                    <stop offset="100%" stopColor="hsl(142 52% 40%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                <XAxis dataKey="range" fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(142 52% 48% / 0.06)" }} />
                <Bar dataKey="count" fill="url(#cls-dist)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="premium-surface rounded-[18px] p-5">
          <div className="premium-section-header mb-3">
            <div>
              <h2 className="premium-eyebrow">Strengths & gaps</h2>
              <h3 className="font-heading font-extrabold text-[16px] mt-1.5">Class profile</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Average across attention sub-domains
              </p>
            </div>
          </div>
          {/* The old sub-domain radar was derived from gameplay-signal
              fields that don't exist in the real dataset — no fabricated
              per-domain breakdown until a real sub-domain signal exists. */}
          <NotEnoughDataPanel
            className="h-60"
            description="Sub-domain breakdown will appear here once this roster has real per-domain signal."
          />
        </section>
      </motion.div>

      {/* ───── Monthly trend ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="premium-surface rounded-[20px] p-5"
      >
        <div className="premium-section-header mb-4 flex-wrap gap-3">
          <div>
            <h2 className="premium-eyebrow">Heatmap</h2>
            <h3 className="font-heading font-extrabold text-[17px] mt-1.5">Monthly attention trend</h3>
            <p className="text-[11.5px] text-muted-foreground mt-1">
              Each row would be a student, each cell that month&apos;s check-in score.
            </p>
          </div>
        </div>
        {/* No real week-over-week/monthly history exists for this roster
            yet (see data/mockData.ts) — no fabricated per-month heatmap
            until real monthly check-in data exists. */}
        <NotEnoughDataPanel description="Monthly trends will appear here once this roster has more than one check-in on record." />
      </motion.section>

      {/* ───── Top / Needs ───── */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="grid md:grid-cols-2 gap-4"
      >
        <RankList
          title="Top performers"
          tone="primary"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          students={top}
        />
        <RankList
          title="Needs attention"
          tone="danger"
          icon={<TrendingDown className="h-4 w-4 text-destructive" />}
          students={needs}
        />
      </motion.div>

      <SectionDetailDialog
        section={detailSection}
        students={detailSection ? studentsBySection[detailSection] : []}
        open={!!detailSection}
        onOpenChange={(o) => !o && setDetailSection(null)}
      />
    </motion.div>
  );
}

function SectionDetailDialog({
  section,
  students,
  open,
  onOpenChange,
}: {
  section: SectionKey | null;
  students: Student[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const health = useMemo(() => (students.length ? classHealth(students) : null), [students]);
  const sorted = useMemo(
    () => [...students].sort((a, b) => b.studentHealthScore - a.studentHealthScore),
    [students],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/70">
          <DialogTitle className="font-heading text-[18px]">{section} · detailed view</DialogTitle>
          <DialogDescription>
            {students.length} students · Avg health score{" "}
            <span className="font-semibold text-foreground tabular-nums">{health?.score ?? "—"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {health && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <DetailStat label="Avg health score" value={health.score} tone="primary" />
              <DetailStat
                label="Needs support"
                value={health.distribution["needs-support"]}
                tone={health.distribution["needs-support"] > 0 ? "danger" : "primary"}
              />
              <DetailStat label="Watch" value={health.distribution.watch} tone="warning" />
              <DetailStat label="Excellent" value={health.distribution.excellent} tone="accent" />
            </div>
          )}

          {/* The old sub-domain radar was derived from gameplay-signal
              fields that don't exist in the real dataset — no fabricated
              per-domain profile until a real sub-domain signal exists. */}
          <NotEnoughDataPanel
            title="Not enough data yet"
            description="A sub-domain profile for this age group will appear here once real per-domain signal exists."
          />

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Students · ranked by health score
              </div>
              <span className="text-[11px] text-muted-foreground">{sorted.length} total</span>
            </div>
            <ScrollArea className="max-h-64 rounded-[12px] border border-border/60">
              <ul className="divide-y divide-border/60">
                {sorted.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-6 w-6 rounded-lg bg-muted/70 border border-border/60 flex items-center justify-center font-heading font-extrabold text-[11px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </div>
                    <StudentAvatar student={s} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-extrabold text-[13px] truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{s.ageGroup}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-extrabold text-[13px] tabular-nums">
                        {s.studentHealthScore}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Health</div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "primary" | "accent" | "warning" | "danger";
}) {
  const toneBg =
    tone === "danger"
      ? "bg-destructive/10 border-destructive/25"
      : tone === "warning"
        ? "bg-amber-500/10 border-amber-500/25"
        : tone === "accent"
          ? "bg-[hsl(260_55%_70%)]/10 border-[hsl(260_55%_60%)]/25"
          : "bg-primary/10 border-primary/25";
  return (
    <div className={cn("rounded-[12px] border px-3 py-2.5", toneBg)}>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="font-heading font-extrabold text-[18px] tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string | number }) {
  return (
    <div className="rounded-lg bg-muted/60 border border-border/60 p-2">
      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.12em]">{label}</div>
      <div className="font-heading font-extrabold text-[15px] tabular-nums mt-0.5">{v}</div>
    </div>
  );
}

function RankList({
  title,
  icon,
  students,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  students: typeof STUDENTS;
  tone: "primary" | "danger";
}) {
  return (
    <section className="premium-surface rounded-[18px] p-5">
      <h2 className="font-heading font-extrabold flex items-center gap-2 text-[15px]">
        {icon}
        {title}
      </h2>
      <ul className="mt-3 space-y-1.5">
        {students.map((s, i) => (
          <li
            key={s.id}
            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors"
          >
            <div
              className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center font-heading font-extrabold text-[11px] tabular-nums",
                tone === "primary"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20",
              )}
            >
              {i + 1}
            </div>
            <StudentAvatar student={s} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="font-heading font-extrabold text-[13px] truncate">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.ageGroup}</div>
            </div>
            <div className="font-heading font-extrabold text-[14px] tabular-nums">
              {s.studentHealthScore}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
