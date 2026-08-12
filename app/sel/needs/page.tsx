"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { type Grade } from "@/data/mockData";
import { SEL_COMPETENCIES, type SelCompetency } from "@/lib/selPulse";
import {
  needsGradeOptions,
  needsClassroomOptions,
  needsTeacherOptions,
  studentsForScope,
  competencyStatusFor,
  concentrationInsights,
  studentFlagFor,
  NEEDS_BAND_LABEL,
  NEEDS_BAND_TONE,
  type NeedsScope,
} from "@/lib/selNeeds";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <SelAppShell>
      <Suspense fallback={null}>
        <NeedsExplorer />
      </Suspense>
    </SelAppShell>
  );
}

function NeedsExplorer() {
  const reduce = useReducedMotion();
  const searchParams = useSearchParams();

  const gradeOptions = useMemo(() => needsGradeOptions(), []);
  const teacherOptions = useMemo(() => needsTeacherOptions(), []);

  const [grade, setGrade] = useState<string>("all");
  const [classroom, setClassroom] = useState<string>("all");
  const [teacher, setTeacher] = useState<string>("all");
  const [competency, setCompetency] = useState<string>(() => searchParams.get("competency") ?? "all");

  const classroomOptions = useMemo(
    () => needsClassroomOptions(grade === "all" ? null : (grade as Grade)),
    [grade],
  );

  const scope: NeedsScope = useMemo(
    () => ({
      grade: grade === "all" ? null : (grade as Grade),
      classroom: classroom === "all" ? null : classroom,
      teacher: teacher === "all" ? null : teacher,
    }),
    [grade, classroom, teacher],
  );
  const scopeIsDrilled = scope.grade !== null || scope.classroom !== null || scope.teacher !== null;

  const overview = useMemo(
    () =>
      SEL_COMPETENCIES.map((c) => {
        if (scopeIsDrilled) return { competency: c, grade: scope.grade, status: competencyStatusFor(c, scope) };
        // No scope picked — summarize by whichever real grade is currently
        // worst for this competency, matching the "Competency / Grade X —
        // Band" board the spec describes.
        const perGrade = gradeOptions
          .map((g) => ({ grade: g, status: competencyStatusFor(c, { grade: g }) }))
          .filter((r) => r.status.available && r.status.score !== null);
        if (perGrade.length === 0) return { competency: c, grade: null, status: competencyStatusFor(c, {}) };
        const worst = perGrade.reduce((a, b) => (b.status.score! < a.status.score! ? b : a));
        return { competency: c, grade: worst.grade, status: worst.status };
      }),
    [scopeIsDrilled, scope, gradeOptions],
  );

  const focused = competency !== "all" ? (competency as SelCompetency) : null;
  const focusedByGrade = useMemo(
    () => (focused ? gradeOptions.map((g) => ({ grade: g, status: competencyStatusFor(focused, { grade: g, teacher: scope.teacher }) })) : []),
    [focused, gradeOptions, scope],
  );

  const drilledStudents = useMemo(() => {
    if (!focused || (!scope.grade && !scope.classroom)) return [];
    return studentsForScope(scope);
  }, [focused, scope]);

  const insights = useMemo(() => concentrationInsights(), []);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <header className="min-w-0">
        <div className="premium-eyebrow">
          <Compass className="h-3 w-3" />
          <span>SEL Needs Explorer</span>
        </div>
        <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
          Where does the school need SEL support?
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
          Move from School to Grade to Classroom to Student to see where each competency needs attention.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label="Grade" value={grade} onChange={(v) => { setGrade(v); setClassroom("all"); }} options={["all", ...gradeOptions]} display={(v) => (v === "all" ? "All Grades" : v)} />
        <FilterSelect label="Classroom" value={classroom} onChange={setClassroom} options={["all", ...classroomOptions]} display={(v) => (v === "all" ? "All Classrooms" : v)} />
        <FilterSelect label="SEL Competency" value={competency} onChange={setCompetency} options={["all", ...SEL_COMPETENCIES]} display={(v) => (v === "all" ? "All Competencies" : v)} />
        <FilterSelect label="Time" value="current" options={["current"]} onChange={() => {}} display={() => "Current"} disabled />
        <FilterSelect label="Teacher" value={teacher} onChange={setTeacher} options={["all", ...teacherOptions]} display={(v) => (v === "all" ? "All Teachers" : v)} />
        <FilterSelect label="Student Group" value="all" options={["all"]} onChange={() => {}} display={() => "All Students"} disabled />
      </div>

      {/* Breadcrumb */}
      <p className="text-[11.5px] text-muted-foreground">
        School
        {scope.grade && <> → {scope.grade}</>}
        {scope.classroom && <> → Classroom {scope.classroom}</>}
        {scope.teacher && <> → {scope.teacher}</>}
        {!scopeIsDrilled && " (school-wide)"}
      </p>

      {!focused ? (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-4">
            <div className="premium-eyebrow">
              <span>Competency Board</span>
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
              {scopeIsDrilled ? "Status for this scope" : "Where each competency is most concentrated"}
            </h3>
          </header>
          <ul className="space-y-1.5">
            {overview.map((row) => (
              <li
                key={row.competency}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
              >
                <span className="flex-1 min-w-0 font-semibold text-[12.5px]">{row.competency}</span>
                {row.status.available ? (
                  <>
                    {row.grade && !scopeIsDrilled && (
                      <span className="text-[11.5px] text-muted-foreground shrink-0">{row.grade}</span>
                    )}
                    <span className="text-[12px] font-bold tabular-nums shrink-0 w-8 text-right">{row.status.score}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${NEEDS_BAND_TONE[row.status.band!]} 14%, transparent)`,
                        color: NEEDS_BAND_TONE[row.status.band!],
                      }}
                    >
                      {NEEDS_BAND_LABEL[row.status.band!]}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground shrink-0">
                    Not tracked yet
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <header className="mb-4">
            <div className="premium-eyebrow">
              <span>{focused}</span>
            </div>
            <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">By grade</h3>
          </header>
          <div className="space-y-1.5">
            {focusedByGrade.map((row) => (
              <div key={row.grade} className="flex items-center gap-2.5">
                <span className="text-[11.5px] font-semibold w-16 shrink-0">{row.grade}</span>
                {row.status.available ? (
                  <>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.status.score}%`, background: NEEDS_BAND_TONE[row.status.band!] }}
                      />
                    </div>
                    <span className="text-[11.5px] font-bold tabular-nums w-8 text-right shrink-0">{row.status.score}</span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Not tracked yet</span>
                )}
              </div>
            ))}
          </div>

          {(scope.grade || scope.classroom) && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <h4 className="font-heading font-bold text-[12.5px] mb-2.5">Students in this scope</h4>
              {drilledStudents.length === 0 ? (
                <p className="text-[11.5px] text-muted-foreground">No students in this scope.</p>
              ) : (
                <ul className="space-y-1.5">
                  {drilledStudents.map((s) => {
                    const flagged = studentFlagFor(focused, s);
                    return (
                      <li key={s.id} className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5">
                        <StudentAvatar student={s} size="sm" />
                        <span className="text-[12px] font-semibold flex-1 min-w-0 truncate">{s.name}</span>
                        {flagged === null ? (
                          <span className="text-[10.5px] text-muted-foreground">Not tracked</span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em]",
                              flagged
                                ? "bg-[hsl(0_78%_56%/0.12)] text-[hsl(0_78%_56%)]"
                                : "bg-[hsl(142_55%_45%/0.12)] text-[hsl(142_55%_38%)]",
                            )}
                          >
                            {flagged ? "Flagged" : "Not flagged"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {/* Concentration insights */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <Sparkles className="h-3 w-3" />
            <span>What Yellow Sees</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Concentration insights</h3>
        </header>
        {insights.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No competency is concentrated enough in one grade to flag right now.</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((i) => (
              <li key={i.competency} className="flex items-start gap-2.5 rounded-xl border border-[hsl(38_92%_48%/0.3)] bg-[hsl(38_92%_48%/0.06)] p-3">
                <Sparkles className="h-4 w-4 text-[hsl(38_92%_48%)] shrink-0 mt-0.5" />
                <p className="text-[12.5px] leading-snug">{i.sentence}</p>
              </li>
            ))}
          </ul>
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
