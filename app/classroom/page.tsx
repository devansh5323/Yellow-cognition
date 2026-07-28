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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
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
import {
  STUDENTS,
  classStats,
  classSubDomainAvg,
  MONTH_LABELS,
  studentMonthlyCheckIns,
  type Student,
} from "@/data/mockData";
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

const ALL_SECTIONS = ["3-A", "3-B", "4-A", "4-B"] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];
const MAX_COMPARE = 4;

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
  const stats = classStats();
  const radar = classSubDomainAvg();

  const heatmapRows = useMemo(
    () => STUDENTS.map((s) => ({ student: s, monthly: studentMonthlyCheckIns(s) })),
    [],
  );
  const windowAvg = useMemo(() => {
    const all = heatmapRows.flatMap((r) => r.monthly).filter((v): v is number => v != null);
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  }, [heatmapRows]);

  const buckets = Array.from({ length: 6 }, (_, i) => ({
    range: `${40 + i * 10}–${50 + i * 10}`,
    count: STUDENTS.filter((s) => s.pfi >= 40 + i * 10 && s.pfi < 50 + i * 10).length,
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
    ALL_SECTIONS.forEach((sec, i) => {
      map[sec] = STUDENTS.filter((_, idx) => idx % 4 === i);
    });
    return map;
  }, []);

  const sections = useMemo(
    () =>
      ALL_SECTIONS.filter((sec) => selectedSections.includes(sec)).map((sec) => {
        const subset = studentsBySection[sec];
        const s = classStats(subset);
        return { section: sec, pfi: s.avgPfi, tei: s.tei, engagement: s.engagement, atRisk: s.atRisk };
      }),
    [selectedSections, studentsBySection],
  );

  const sectionPickerLabel =
    selectedSections.length === 0
      ? "Pick sections"
      : selectedSections.length === ALL_SECTIONS.length
        ? "All sections"
        : selectedSections.length === 1
          ? `Section ${selectedSections[0]}`
          : `${selectedSections.length} of ${ALL_SECTIONS.length} sections`;

  const top = [...STUDENTS].sort((a, b) => b.pfi - a.pfi).slice(0, 5);
  const needs = [...STUDENTS].sort((a, b) => a.pfi - b.pfi).slice(0, 5);

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
                  Sections · max {MAX_COMPARE}
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
                      <span>Section {sec}</span>
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
            const tone = s.atRisk > 1 ? "hsl(0 78% 58%)" : "hsl(142 55% 50%)";
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
                aria-label={`Open detailed view for Section ${s.section}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-heading font-extrabold text-[16px]">Section {s.section}</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full font-semibold border",
                      s.atRisk > 1
                        ? "bg-destructive/10 text-destructive border-destructive/25"
                        : "bg-primary/10 text-primary border-primary/25",
                    )}
                  >
                    {s.atRisk} at-risk
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <Mini label="PFI" v={s.pfi} />
                  <Mini label="TEI" v={s.tei} />
                  <Mini label="Engage" v={`${s.engagement}%`} />
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
                <linearGradient id="cls-pfi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 60% 55%)" />
                  <stop offset="100%" stopColor="hsl(142 52% 40%)" />
                </linearGradient>
                <linearGradient id="cls-tei" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(260 60% 68%)" />
                  <stop offset="100%" stopColor="hsl(260 55% 50%)" />
                </linearGradient>
                <linearGradient id="cls-eng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38 92% 60%)" />
                  <stop offset="100%" stopColor="hsl(38 92% 48%)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
              <XAxis dataKey="section" fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
              <YAxis fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(142 52% 48% / 0.06)" }} />
              <Bar dataKey="pfi" fill="url(#cls-pfi)" radius={[8, 8, 0, 0]} name="Avg PFI" />
              <Bar dataKey="tei" fill="url(#cls-tei)" radius={[8, 8, 0, 0]} name="TEI" />
              <Bar dataKey="engagement" fill="url(#cls-eng)" radius={[8, 8, 0, 0]} name="Engagement %" />
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
              <h3 className="font-heading font-extrabold text-[16px] mt-1.5">PFI distribution</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Class avg: <strong className="text-foreground tabular-nums">{stats.avgPfi}</strong>
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
          <div className="h-60">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="hsl(240 15% 88%)" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(230 15% 40%)" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(240 15% 80%)" />
                <Radar
                  dataKey="score"
                  stroke="hsl(142 52% 48%)"
                  fill="hsl(142 52% 48%)"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </motion.div>

      {/* ───── Monthly trend heatmap ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="premium-surface rounded-[20px] p-5"
      >
        <div className="premium-section-header mb-4 flex-wrap gap-3">
          <div>
            <h2 className="premium-eyebrow">Heatmap</h2>
            <h3 className="font-heading font-extrabold text-[17px] mt-1.5">Monthly attention trend</h3>
            <p className="text-[11.5px] text-muted-foreground mt-1">
              Last {MONTH_LABELS.length} monthly check-ins · class avg{" "}
              <strong className="text-foreground tabular-nums">{windowAvg}</strong> · each row = a
              student, each cell = that month's check-in score
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Low
            <div className="flex rounded-md overflow-hidden ring-1 ring-border/70">
              {[20, 40, 60, 80, 95].map((v) => (
                <span key={v} className="h-3 w-5" style={{ background: heatColor(v) }} />
              ))}
            </div>
            High
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-1 md:border-spacing-1.5">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground w-[160px] sticky left-0 bg-card/90 backdrop-blur pr-2">
                  Student
                </th>
                {MONTH_LABELS.map((m) => (
                  <th
                    key={m}
                    className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground text-center"
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map(({ student: s, monthly }) => (
                <tr key={s.id}>
                  <td className="text-[12px] font-medium pr-2 sticky left-0 bg-card/90 backdrop-blur w-[160px]">
                    <div className="flex items-center gap-2 truncate">
                      <StudentAvatar student={s} size="sm" className="!h-6 !w-6 text-[10px]" />
                      <span className="truncate">{s.name}</span>
                    </div>
                  </td>
                  {monthly.map((v, i) =>
                    v == null ? (
                      <td
                        key={i}
                        title={`${s.name} · ${MONTH_LABELS[i]} · No check-in`}
                        className="h-7 md:h-8 rounded-md text-[11px] text-center align-middle font-semibold text-muted-foreground/60 border border-dashed border-border/60 bg-muted/20"
                      >
                        —
                      </td>
                    ) : (
                      <td
                        key={i}
                        title={`${s.name} · ${MONTH_LABELS[i]} · ${v} · monthly check-in`}
                        className="h-7 md:h-8 rounded-md text-[10px] text-center align-middle font-bold text-white/90 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary/60 transition-all"
                        style={{ background: heatColor(v) }}
                      >
                        {v}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  const stats = useMemo(() => (students.length ? classStats(students) : null), [students]);
  const radar = useMemo(() => (students.length ? classSubDomainAvg(students) : []), [students]);
  const sorted = useMemo(() => [...students].sort((a, b) => b.pfi - a.pfi), [students]);
  const strongest = radar.length ? radar.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const weakest = radar.length ? radar.reduce((a, b) => (b.score < a.score ? b : a)) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/70">
          <DialogTitle className="font-heading text-[18px]">
            Section {section} · detailed view
          </DialogTitle>
          <DialogDescription>
            {students.length} students · Avg PFI{" "}
            <span className="font-semibold text-foreground tabular-nums">{stats?.avgPfi ?? "—"}</span>
            {strongest && (
              <>
                {" · "}strongest{" "}
                <span className="text-primary font-semibold">{strongest.name}</span>{" "}
                <span className="tabular-nums">({strongest.score})</span>
              </>
            )}
            {weakest && (
              <>
                {" · "}focus on{" "}
                <span className="text-destructive font-semibold">{weakest.name}</span>{" "}
                <span className="tabular-nums">({weakest.score})</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <DetailStat label="Avg PFI" value={stats.avgPfi} tone="primary" />
              <DetailStat label="TEI" value={stats.tei} tone="accent" />
              <DetailStat label="Engagement" value={`${stats.engagement}%`} tone="warning" />
              <DetailStat
                label="At-risk"
                value={stats.atRisk}
                tone={stats.atRisk > 0 ? "danger" : "primary"}
              />
            </div>
          )}

          {radar.length > 0 && (
            <section className="rounded-[14px] border border-border/60 bg-card/50 p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                Sub-domain profile
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="hsl(240 15% 88%)" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(230 15% 40%)" }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      stroke="hsl(240 15% 80%)"
                    />
                    <Radar
                      dataKey="score"
                      stroke="hsl(142 52% 48%)"
                      fill="hsl(142 52% 48%)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Students · ranked by PFI
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
                      <div className="text-[11px] text-muted-foreground">Age {s.age}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-extrabold text-[13px] tabular-nums">
                        {s.pfi}
                      </div>
                      <div className="text-[10px] text-muted-foreground">PFI</div>
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
              <div className="text-[11px] text-muted-foreground">
                {s.grade} · Sec {s.section}
              </div>
            </div>
            <div className="font-heading font-extrabold text-[14px] tabular-nums">{s.pfi}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function heatColor(v: number) {
  if (v < 40) return `hsl(0 70% ${72 - v * 0.2}%)`;
  if (v < 65) return `hsl(38 85% ${72 - (v - 40) * 0.4}%)`;
  return `hsl(142 52% ${65 - (v - 65) * 0.3}%)`;
}
