"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ClipboardCheck, Sparkles } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  classroomImplementationRows,
  implementationSummary,
  implementationByGrade,
  classesMissingSel,
  currentFocusByGrade,
  worstImplementationInsight,
  IMPLEMENTATION_STATUS_LABEL,
  IMPLEMENTATION_STATUS_TONE,
} from "@/lib/selImplementation";
import { classroomSelMetricsPct } from "@/lib/selNeeds";
import { cn } from "@/lib/utils";

// Same threshold bands as lib/selNeeds.ts's bandFromHealthScore, just
// inlined here since that function isn't exported (kept private to Tool 2).
function selMetricsTone(pct: number): string {
  if (pct >= 80) return "hsl(142 60% 40%)";
  if (pct >= 65) return "hsl(142 55% 45%)";
  if (pct >= 50) return "hsl(38 92% 48%)";
  return "hsl(0 78% 56%)";
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export default function Page() {
  return (
    <SelAppShell>
      <ImplementationTracker />
    </SelAppShell>
  );
}

function ImplementationTracker() {
  const reduce = useReducedMotion();

  const allRows = useMemo(() => classroomImplementationRows(), []);
  const summary = useMemo(() => implementationSummary(allRows), [allRows]);
  const insight = useMemo(() => worstImplementationInsight(allRows), [allRows]);
  const byGrade = useMemo(() => implementationByGrade(allRows), [allRows]);
  const missing = useMemo(() => classesMissingSel(allRows), [allRows]);
  const focusByGrade = useMemo(() => currentFocusByGrade(allRows), [allRows]);

  const gradeOptions = useMemo(() => Array.from(new Set(allRows.map((r) => r.grade))).sort(), [allRows]);
  const [grade, setGrade] = useState<string>("all");
  const rows = useMemo(
    () => (grade === "all" ? allRows : allRows.filter((r) => r.grade === grade)),
    [allRows, grade],
  );

  const tiles = [
    { label: "Classes participating", value: `${summary.classesParticipating}/${summary.totalClasses}` },
    { label: "SEL activities completed", value: `${summary.completionPct}%` },
    { label: "Teachers active", value: `${summary.teachersActive}/${summary.totalTeachers}` },
    { label: "Classes missing weekly SEL", value: `${summary.classesMissingWeekly}` },
    { label: "Follow-ups required", value: `${summary.followUpsRequired}` },
  ];

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <ClipboardCheck className="h-3 w-3" />
          <span>SEL Implementation Tracker</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          SEL Implementation This Month
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
          Whether the SEL program is actually being delivered, not just how students are doing.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Grade"
          value={grade}
          onChange={setGrade}
          options={["all", ...gradeOptions]}
          display={(v) => (v === "all" ? "All Grades" : v)}
        />
        <FilterSelect label="Subject" value="all" options={["all"]} onChange={() => {}} display={() => "All Subjects"} disabled />
        <FilterSelect label="School" value="Riverside Academy" options={["Riverside Academy"]} onChange={() => {}} disabled />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-3.5">
            <div className="font-heading font-extrabold text-[20px] tabular-nums leading-none">{t.value}</div>
            <div className="text-[10.5px] font-semibold text-muted-foreground leading-snug mt-1.5">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Implementation by grade */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Implementation by Grade</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Compact status by grade</h3>
        </header>
        <div className="space-y-2">
          {byGrade.map((g) => {
            const tone = IMPLEMENTATION_STATUS_TONE[g.status];
            return (
              <div key={g.grade} className="flex items-center gap-3">
                <span className="text-[12px] font-semibold w-20 shrink-0">{g.grade}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${g.completionPct}%`, background: tone }} />
                </div>
                <span className="text-[12px] font-bold tabular-nums w-10 text-right shrink-0">{g.completionPct}%</span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] shrink-0 w-[92px] justify-center"
                  style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                >
                  {IMPLEMENTATION_STATUS_LABEL[g.status]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Classes missing SEL + current focus — compact, side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-border bg-card p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-[hsl(0_78%_56%)] shrink-0" />
              <span className="font-heading font-bold text-[13px]">
                {missing.count} classroom{missing.count === 1 ? "" : "s"} missing SEL
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {missing.classrooms.length > 0 ? missing.classrooms.map((c) => `Grade ${c}`).join(", ") : "None this week"}
            </p>
          </div>
          <a href="#by-classroom" className="text-[10.5px] font-bold text-primary shrink-0">
            View classrooms
          </a>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-1">
            Current SEL Focus
          </div>
          <p className="text-[11.5px] leading-snug">
            {focusByGrade.map((f) => `${f.grade}: ${f.focuses.join(" & ")}`).join(" · ")}
          </p>
        </div>
      </div>

      {/* Drill-down table */}
      <section id="by-classroom" className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>By Classroom</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Planned vs. completed</h3>
        </header>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[560px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 px-1 font-bold text-[10px] uppercase tracking-[0.10em]">Classroom</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">SEL Focus</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Planned</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Completed</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Teacher</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">SEL Metrics</th>
                <th className="py-2 font-bold text-[10px] uppercase tracking-[0.10em]">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tone = IMPLEMENTATION_STATUS_TONE[r.status];
                const selMetricsPct = classroomSelMetricsPct(r.classroom);
                return (
                  <tr key={r.classroom} className="border-t border-border/50">
                    <td
                      className="py-2.5 pr-3 px-1 align-middle font-semibold"
                      style={{ boxShadow: `inset 2.5px 0 0 0 color-mix(in srgb, ${tone} 70%, transparent)` }}
                    >
                      Grade {r.classroom}
                    </td>
                    <td className="py-2.5 pr-3 align-middle text-muted-foreground">{r.selFocus}</td>
                    <td className="py-2.5 pr-3 align-middle tabular-nums">{r.planned}</td>
                    <td className="py-2.5 pr-3 align-middle tabular-nums">{r.completed}</td>
                    <td className="py-2.5 pr-3 align-middle">{r.teacher}</td>
                    <td className="py-2.5 pr-3 align-middle tabular-nums">
                      {selMetricsPct === null ? (
                        <span className="text-muted-foreground">Not tracked</span>
                      ) : (
                        <span className="font-bold" style={{ color: selMetricsTone(selMetricsPct) }}>
                          {selMetricsPct}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 align-middle">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                      >
                        {IMPLEMENTATION_STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Implementation gap insight */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <Sparkles className="h-3 w-3" />
            <span>Implementation Gap Insight</span>
          </div>
        </header>
        {insight ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[hsl(0_78%_56%/0.25)] bg-[hsl(0_78%_56%/0.05)] p-3.5">
            <p className="text-[12.5px] leading-snug flex-1 min-w-0">{insight.sentence}</p>
            <Button size="sm" onClick={() => comingSoon("Support teacher")} className="shrink-0">
              Support teacher
            </Button>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">Every classroom is on track this month.</p>
        )}
      </section>
    </motion.div>
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
          "h-9 w-auto min-w-[140px] rounded-xl bg-card/70 border-border/80 backdrop-blur text-[12.5px] font-semibold gap-2",
          disabled && "opacity-70",
        )}
      >
        <span className="text-muted-foreground shrink-0 text-[10px] font-bold uppercase tracking-[0.06em]">{label}</span>
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
