"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/dashboard/AppShell";
import { Suspense, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  GitCompare,
  Tag,
  Plus,
  Users,
  Filter,
  Sparkles,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STUDENTS } from "@/data/mockData";
import { studentComposites, type ScoreBand } from "@/lib/classHealth";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { RiskBadge, SCORE_BAND_TONE } from "@/components/dashboard/RiskBadge";
import { CompareDrawer } from "@/components/dashboard/CompareDrawer";
import { bulkAddTag, useOverridesVersion, getOverrides, PRESET_TAGS } from "@/lib/studentMutations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <StudentsPage />
      </Suspense>
    </AppShell>
  );
}

const BANDS: { key: ScoreBand | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "excellent", label: "Excellent" },
  { key: "stable", label: "Stable" },
  { key: "watch", label: "Watch" },
  { key: "needs-support", label: "Needs Support" },
];

const MAX_COMPARE = 6;
const EASE = [0.2, 0.7, 0.2, 1] as const;

function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const overridesVersion = useOverridesVersion();

  const idFilterList = useMemo(() => {
    const ids = searchParams?.get("ids");
    return ids ? ids.split(",").filter(Boolean) : null;
  }, [searchParams]);

  const [query, setQuery] = useState("");
  const [band, setBand] = useState<ScoreBand | "all">("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const ageGroups = useMemo(() => {
    const set = new Set<string>();
    STUDENTS.forEach((s) => set.add(s.ageGroup));
    return Array.from(set).sort();
  }, []);

  // overridesVersion isn't read inside — it exists purely to force a
  // recompute when tags change elsewhere (bulk-tag action, student page).
  const enriched = useMemo(
    () =>
      studentComposites(STUDENTS).map((c) => ({
        ...c,
        tags: getOverrides(c.student.id).tags.map((t) => t.label),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overridesVersion],
  );

  const ageFiltered = useMemo(
    () => (ageGroup === "all" ? enriched : enriched.filter((c) => c.student.ageGroup === ageGroup)),
    [enriched, ageGroup],
  );

  const kpiStats = useMemo(() => {
    const total = ageFiltered.length;
    const needsSupport = ageFiltered.filter((c) => c.status === "needs-support").length;
    const excellent = ageFiltered.filter((c) => c.status === "excellent").length;
    const avgScore = total
      ? Math.round((ageFiltered.reduce((a, c) => a + c.score, 0) / total) * 10) / 10
      : 0;
    return { total, needsSupport, excellent, avgScore };
  }, [ageFiltered]);

  const filtered = useMemo(() => {
    let list = idFilterList
      ? enriched.filter((c) => idFilterList.includes(c.student.id))
      : ageFiltered.filter((c) => {
          if (band !== "all" && c.status !== band) return false;
          if (query && !c.student.name.toLowerCase().includes(query.toLowerCase())) return false;
          return true;
        });
    list = [...list].sort((a, b) => b.score - a.score);
    return list;
  }, [query, band, ageFiltered, idFilterList, enriched]);

  const selectedStudents = useMemo(
    () => STUDENTS.filter((s) => selected.has(s.id)),
    [selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleApplyTag(label: string) {
    const ids = Array.from(selected);
    bulkAddTag(ids, label);
    toast.success(`Tagged ${ids.length} student${ids.length === 1 ? "" : "s"} as "${label}"`);
    setTagPopoverOpen(false);
    setCustomTag("");
    clearSelection();
  }

  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
      className="space-y-5"
    >

      {/* ───────────── KPI overview (age-group-scoped) ───────────── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <KpiCard
          icon={Users}
          label="Total students"
          value={kpiStats.total}
          meta={ageGroup === "all" ? "All age groups" : ageGroup}
          tone="primary"
        />
        <KpiCard
          icon={BarChart3}
          label="Avg health score"
          value={kpiStats.avgScore}
          meta="out of 100"
          tone="accent"
        />
        <KpiCard
          icon={Sparkles}
          label="Excellent"
          value={kpiStats.excellent}
          meta={
            kpiStats.total > 0
              ? `${Math.round((kpiStats.excellent / kpiStats.total) * 100)}% of shown`
              : "—"
          }
          tone="success"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Needs support"
          value={kpiStats.needsSupport}
          meta={
            kpiStats.total > 0
              ? `${Math.round((kpiStats.needsSupport / kpiStats.total) * 100)}% of shown`
              : "—"
          }
          tone="danger"
        />
      </motion.section>

      {/* ───────────── Table filters: age group + status pills + inline search ───────────── */}
      {idFilterList ? (
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } } }}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.05] px-3.5 py-2.5"
        >
          <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[12.5px] font-semibold">
            Showing {filtered.length} student{filtered.length === 1 ? "" : "s"} from a pattern insight
          </span>
          <Link
            href="/students"
            className="ml-auto text-[12px] font-bold text-primary hover:underline"
          >
            Clear
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } } }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="premium-eyebrow mr-1"><Filter className="h-3 w-3 text-primary" /><span>Status</span></span>
          <div className="flex flex-wrap gap-1.5">
            {BANDS.map((b) => {
              const active = band === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => setBand(b.key)}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "band-pill"}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-card shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)] border border-primary/35"
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {b.key !== "all" && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: SCORE_BAND_TONE[b.key] }}
                      />
                    )}
                    {b.label}
                  </span>
                </button>
              );
            })}
          </div>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="premium-search h-9 px-3 text-[12.5px] font-semibold rounded-full bg-card"
            aria-label="Filter by age group"
          >
            <option value="all">All age groups</option>
            {ageGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <div className="premium-search h-9 px-3 w-full sm:w-auto sm:min-w-[240px] sm:ml-auto">
            <Search className="h-4 w-4 shrink-0 mr-2" />
            <input
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-[12.5px]"
            />
          </div>
        </motion.div>
      )}

      {/* ───────────── Selection action bar ───────────── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            key="selbar"
            initial={reduce ? undefined : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="sticky top-[76px] z-20"
          >
            <div className="premium-surface rounded-[14px] px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-primary/30">
              <div className="text-[13px] flex items-center gap-2">
                <span className="inline-flex h-6 min-w-6 px-2 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                  {selected.size}
                </span>
                <span className="text-muted-foreground">selected · max {MAX_COMPARE}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearSelection} className="rounded-lg">
                  Clear
                </Button>
                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 rounded-lg bg-card/70">
                      <Tag className="h-4 w-4" /> Assign tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3 rounded-xl premium-glass" align="end">
                    <div className="premium-eyebrow mb-2"><span>Intervention tags</span></div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {PRESET_TAGS.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleApplyTag(t)}
                          className="premium-pill text-[11.5px] hover:cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="premium-search h-8 flex-1 px-2.5">
                        <input
                          placeholder="Custom tag…"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customTag.trim()) handleApplyTag(customTag);
                          }}
                          className="text-[13px]"
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={!customTag.trim()}
                        onClick={() => handleApplyTag(customTag)}
                        className="h-8 px-2 rounded-lg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  size="sm"
                  disabled={selected.size < 2}
                  onClick={() => setCompareOpen(true)}
                  className="gap-2 rounded-lg shadow-[0_6px_14px_-6px_hsl(142_55%_35%/0.55)]"
                >
                  <GitCompare className="h-4 w-4" /> Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────── Table ───────────── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="premium-surface rounded-[20px] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="p-3 w-10"></th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Student</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Age group</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Health score</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Status</th>
                <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Tags</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = c.student;
                const isSelected = selected.has(s.id);
                const disabled = !isSelected && selected.size >= MAX_COMPARE;
                return (
                  <tr
                    key={s.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/students/${s.id}?tab=profile`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/students/${s.id}?tab=profile`);
                      }
                    }}
                    className={cn(
                      "group border-t border-border/50 hover:bg-primary/[0.035] transition-colors cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      isSelected && "bg-primary/[0.06]",
                    )}
                  >
                    <td className="p-3 relative" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={cn(
                          "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all",
                          isSelected ? "bg-primary opacity-100" : "bg-primary/0 opacity-0",
                        )}
                        aria-hidden
                      />
                      <Checkbox
                        checked={isSelected}
                        disabled={disabled}
                        onCheckedChange={() => toggle(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/students/${s.id}?tab=profile`}
                        className="flex items-center gap-3"
                      >
                        <StudentAvatar student={s} size="sm" />
                        <div className="min-w-0">
                          <div className="font-heading font-extrabold text-[13.5px] truncate">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{s.parentName}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="text-[12.5px] font-semibold text-muted-foreground">{s.ageGroup}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-heading font-extrabold tabular-nums">{c.score}</span>
                    </td>
                    <td className="p-3">
                      <RiskBadge band={c.status} />
                    </td>
                    <td className="p-3">
                      {c.tags.length === 0 ? (
                        <span className="text-[11.5px] text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {c.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/60 text-accent-foreground border border-border/70"
                            >
                              {t}
                            </span>
                          ))}
                          {c.tags.length > 2 && (
                            <span className="text-[10px] font-semibold text-muted-foreground self-center">
                              +{c.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/students/${s.id}?tab=profile`}
                          className="group/v inline-flex items-center gap-0.5 text-primary text-[11.5px] font-semibold ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                          <span className="transition-transform group-hover/v:translate-x-0.5">→</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-14 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted/70 text-muted-foreground flex items-center justify-center">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="font-heading font-extrabold text-foreground/90 text-[14px]">No students match</div>
                    <div className="text-[12.5px] text-muted-foreground mt-0.5">
                      Try a different search or clear your filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      <CompareDrawer
        open={compareOpen}
        onOpenChange={setCompareOpen}
        students={selectedStudents}
        onRemove={(id) =>
          setSelected((prev) => {
            const n = new Set(prev);
            n.delete(id);
            return n;
          })
        }
        onClear={clearSelection}
      />
    </motion.div>
  );
}

type KpiTone = "primary" | "danger" | "success" | "accent" | "warning";

const KPI_TONE: Record<KpiTone, string> = {
  primary: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  accent: "bg-[hsl(260_55%_65%)]/10 text-[hsl(260_55%_50%)] dark:text-[hsl(260_55%_75%)]",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function KpiCard({
  icon: Icon,
  label,
  value,
  meta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  meta?: string;
  tone: KpiTone;
}) {
  return (
    <div className="premium-surface rounded-[16px] p-3.5 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", KPI_TONE[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground leading-none">
          {label}
        </div>
        <div className="font-heading font-extrabold text-[22px] tabular-nums mt-1 leading-tight">
          {value}
        </div>
        {meta && (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{meta}</div>
        )}
      </div>
    </div>
  );
}
