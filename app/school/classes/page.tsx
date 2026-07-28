"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  School,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { getSchoolClasses } from "@/lib/schoolData";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <SchoolAppShell>
      <ClassesPage />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;
type SortKey = "pfi" | "atRisk" | "size" | "engagement";

function ClassesPage() {
  const reduce = useReducedMotion();
  const all = getSchoolClasses();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("all");
  const [risk, setRisk] = useState<"all" | "with" | "without">("all");
  const [sortKey, setSortKey] = useState<SortKey>("pfi");
  const [asc, setAsc] = useState(false);

  const grades = useMemo(() => Array.from(new Set(all.map((c) => c.grade))).sort(), [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.teacherName.toLowerCase().includes(needle),
      );
    }
    if (grade !== "all") list = list.filter((c) => c.grade === grade);
    if (risk === "with") list = list.filter((c) => c.atRisk > 0);
    if (risk === "without") list = list.filter((c) => c.atRisk === 0);
    return [...list].sort((a, b) => {
      const pick = (x: typeof a) =>
        sortKey === "pfi" ? x.avgPfi : sortKey === "atRisk" ? x.atRisk : sortKey === "size" ? x.size : x.engagementPct;
      return asc ? pick(a) - pick(b) : pick(b) - pick(a);
    });
  }, [all, q, grade, risk, sortKey, asc]);

  const totalAtRisk = filtered.reduce((acc, c) => acc + c.atRisk, 0);
  const noCheckIn = filtered.filter((c) => !c.monthlyCheckIn).length;

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      {/* Header */}
      <section className="premium-elevated rounded-[22px] p-5 sm:p-6 flex items-start gap-5 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <div className="premium-eyebrow">
            <School className="h-3 w-3" /> Classes
          </div>
          <h1 className="mt-1.5 font-heading font-extrabold text-[24px] sm:text-[28px] leading-tight tracking-tight">
            {filtered.length} classes · {totalAtRisk} students need a closer look
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Sort, filter, and find classes that haven't completed this month's check-in.
          </p>
        </div>
        {noCheckIn > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-3.5 flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[14px]">{noCheckIn} no check-in this month</div>
              <div className="text-[11.5px] text-muted-foreground">Auto-nudge already sent</div>
            </div>
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="premium-surface rounded-[18px] p-4 flex flex-wrap items-center gap-2">
        <div className="premium-search h-10 flex-1 min-w-[220px] px-3">
          <Search className="h-4 w-4 shrink-0 mr-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search class or teacher…"
          />
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card/70 px-2.5 text-[12.5px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <option value="all">All grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-card/70 p-0.5">
          {(["all", "with", "without"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              className={cn(
                "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors",
                risk === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "all" ? "All" : r === "with" ? "With at-risk" : "No at-risk"}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-card/70 p-0.5">
          {(["pfi", "atRisk", "size", "engagement"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                if (sortKey === k) setAsc((v) => !v);
                else {
                  setSortKey(k);
                  setAsc(false);
                }
              }}
              className={cn(
                "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors capitalize",
                sortKey === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {k === "pfi" ? "PFI" : k === "atRisk" ? "At-risk" : k === "size" ? "Size" : "Engagement"}
              {sortKey === k && <span className="ml-1">{asc ? "↑" : "↓"}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Table */}
      <section className="premium-surface rounded-[18px] overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_72px_72px_72px_120px] sm:grid-cols-[1.4fr_1fr_80px_80px_80px_140px] gap-3 px-4 py-2.5 text-[10.5px] font-bold tracking-[0.16em] uppercase text-muted-foreground border-b border-border/60 bg-muted/20">
          <span>Class</span>
          <span>Teacher</span>
          <span className="text-right">Size</span>
          <span className="text-right">PFI</span>
          <span className="text-right">At-risk</span>
          <span>Check-in</span>
        </div>
        <ul className="divide-y divide-border/60">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-[1.4fr_1fr_72px_72px_72px_120px] sm:grid-cols-[1.4fr_1fr_80px_80px_80px_140px] gap-3 px-4 py-3 hover:bg-muted/30 transition-colors items-center"
            >
              <div className="min-w-0">
                <div className="font-heading font-bold text-[13px] truncate">{c.name}</div>
                <div className="text-[10.5px] text-muted-foreground">Grade {c.grade} · Section {c.section}</div>
              </div>
              <div className="text-[12px] text-foreground/90 truncate">{c.teacherName}</div>
              <div className="text-right tabular-nums font-semibold text-[13px]">{c.size}</div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 justify-end">
                  <span className="font-heading font-extrabold text-[14px] tabular-nums">{c.avgPfi}</span>
                  <span
                    className={cn(
                      "inline-flex items-center text-[10px] font-bold tabular-nums",
                      c.pfiTrend >= 0 ? "text-primary" : "text-destructive",
                    )}
                  >
                    {c.pfiTrend >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {Math.abs(c.pfiTrend)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {c.atRisk > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-1.5 py-0.5 bg-destructive/15 text-destructive border border-destructive/25 tabular-nums">
                    <AlertTriangle className="h-2.5 w-2.5" /> {c.atRisk}
                  </span>
                ) : (
                  <span className="text-[10.5px] text-muted-foreground">none</span>
                )}
              </div>
              <div>
                {c.monthlyCheckIn ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Done
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                    <XCircle className="h-2.5 w-2.5" /> Pending
                  </span>
                )}
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">
              No classes match these filters.
            </li>
          )}
        </ul>
      </section>
    </motion.div>
  );
}
