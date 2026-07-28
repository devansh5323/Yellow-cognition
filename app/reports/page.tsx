"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { STUDENTS, classSubDomainAvg } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ReportsKpiStrip } from "@/components/reports/ReportsKpiStrip";
import { CohortFilterStrip, type CohortKey } from "@/components/reports/CohortFilterStrip";
import { RiskDonut } from "@/components/reports/RiskDonut";
import { KsaRadar } from "@/components/reports/KsaRadar";
import { MonthlyTrendChart } from "@/components/reports/MonthlyTrendChart";
import { InterventionImpact } from "@/components/reports/InterventionImpact";
import { downloadCsv, printPdf } from "@/lib/reportsExport";

export default function Page() {
  return (
    <AppShell>
      <ReportsPage />
    </AppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid hsl(240 15% 90%)",
  background: "hsl(0 0% 100% / 0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px -12px hsl(230 50% 18% / 0.22)",
  fontSize: 12,
};

const RANGE_LABEL: Record<"week" | "month" | "term", string> = {
  week: "Last 7 days",
  month: "This month",
  term: "This term",
};

function ReportsPage() {
  const reduce = useReducedMotion();
  const [range, setRange] = useState<"week" | "month" | "term">("month");
  const [cohort, setCohort] = useState<CohortKey>("all");

  const students = useMemo(() => {
    if (cohort === "all") return STUDENTS;
    const [g, sec] = cohort.split("-");
    return STUDENTS.filter((s) => s.grade === `Grade ${g}` && s.section === sec);
  }, [cohort]);

  const weeks = range === "week" ? 1 : range === "month" ? 4 : 6;
  const growth = useMemo(() => {
    return Array.from({ length: weeks }, (_, i) => ({
      week: `W${i + 1}`,
      pfi: 60 + i * 2 + (i % 2),
      engagement: 65 + i * 1.5,
    }));
  }, [weeks]);

  const subdomain = useMemo(() => classSubDomainAvg(students), [students]);
  const sorted = [...subdomain].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3);
  const growthAreas = sorted.slice(-3).reverse();

  const pfiNow = growth[growth.length - 1]?.pfi ?? 0;
  const pfiThen = growth[0]?.pfi ?? pfiNow;
  const pfiDelta = pfiThen > 0 ? Math.round(((pfiNow - pfiThen) / pfiThen) * 100) : 0;
  const atRiskCount = students.filter((s) => s.risk === "at-risk" || s.risk === "high").length;
  const cohortLabel = cohort === "all" ? "all classrooms" : `Grade ${cohort}`;

  const handleCsv = () => {
    downloadCsv(students, `yellow-${cohort}-${range}.csv`);
    toast.success("CSV downloaded");
  };
  const handlePdf = () => {
    toast("Opening print dialog…");
    setTimeout(printPdf, 200);
  };

  return (
    <motion.div
      initial={reduce ? undefined : "hidden"}
      animate="show"
      variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-6"
    >
      {/* ───── Header · scope + exports ───── */}
      <motion.header
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
        className="flex flex-wrap items-center justify-between gap-3 no-print"
      >
        <div>
          <div className="premium-eyebrow"><BarChart3 className="h-3.5 w-3.5 text-primary" /><span>Analytics</span></div>
          <h1 className="mt-2 font-heading font-extrabold text-[26px] md:text-[30px] leading-tight">
            <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
              Reports
            </span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            This report: <span className="font-semibold text-foreground">{cohortLabel}</span> ·{" "}
            <span className="font-semibold text-foreground">{RANGE_LABEL[range]}</span> ·{" "}
            <span className="tabular-nums font-semibold text-foreground">{students.length}</span> students
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex gap-1 rounded-full bg-muted/70 border border-border/70 p-1 text-[11.5px] backdrop-blur">
            {(["week", "month", "term"] as const).map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full font-semibold capitalize transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "reports-range"}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-card shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)] border border-border/60"
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              );
            })}
          </div>
          <Button variant="outline" className="gap-2 rounded-xl bg-card/70 backdrop-blur h-10" onClick={handlePdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl bg-card/70 backdrop-blur h-10" onClick={handleCsv}>
            <FileText className="h-4 w-4" /> CSV
          </Button>
        </div>
      </motion.header>

      {/* ───── Executive summary ───── */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
        className="relative premium-elevated rounded-[22px] p-5 md:p-6 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(65% 65% at 0% 0%, hsl(142 60% 80% / 0.22), transparent 60%), radial-gradient(55% 55% at 100% 20%, hsl(260 55% 80% / 0.18), transparent 65%)",
          }}
        />
        <div className="relative z-10 flex items-start gap-4 flex-wrap">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[hsl(260_55%_72%)] via-[hsl(220_60%_62%)] to-[hsl(200_60%_55%)] text-white flex items-center justify-center shadow-[0_10px_24px_-10px_hsl(260_50%_45%/0.55)] shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="premium-eyebrow">
              <span>At a glance · {RANGE_LABEL[range]}</span>
            </div>
            <p className="mt-1.5 font-heading font-extrabold text-[18px] md:text-[20px] leading-snug text-foreground">
              Class PFI{" "}
              <span className={cn("tabular-nums", pfiDelta >= 0 ? "text-primary" : "text-destructive")}>
                {pfiDelta >= 0 ? "+" : ""}{pfiDelta}%
              </span>{" "}
              across <span className="tabular-nums">{students.length}</span> students ·{" "}
              <span className="tabular-nums">{atRiskCount}</span> at-risk ·{" "}
              strongest{" "}
              <span className="text-primary">{strengths[0]?.name}</span>{" "}
              <span className="text-muted-foreground font-semibold tabular-nums">({strengths[0]?.score})</span>
              {" · "}focus on{" "}
              <span className="text-destructive">{growthAreas[0]?.name}</span>{" "}
              <span className="text-muted-foreground font-semibold tabular-nums">({growthAreas[0]?.score})</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                PFI:
                <span className="font-semibold text-foreground tabular-nums">{pfiNow}</span>
                <span className="text-muted-foreground">({pfiThen} → {pfiNow})</span>
              </span>
              <span className="text-border">·</span>
              <a href="#growth" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80">
                Jump to growth <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a href="#risk" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 ml-2">
                Who's at risk <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ───── Cohort picker (also acts as mini-summary) ───── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
        <CohortFilterStrip active={cohort} onChange={setCohort} />
      </motion.div>

      {/* ───── Top-line KPIs ───── */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
        <ReportsKpiStrip students={students} range={range} />
      </motion.div>

      {/* ───── Growth & engagement ───── */}
      <motion.div
        id="growth"
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="scroll-mt-24 space-y-3"
      >
        <SectionHeader
          eyebrow="Trend"
          title="Growth & engagement"
          subtitle={`How PFI and engagement have moved over ${RANGE_LABEL[range].toLowerCase()}.`}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <ChartCard title="Class PFI over time" tone="primary">
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={growth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rp-pfi-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 52% 48%)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="hsl(142 52% 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rp-pfi-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(142 55% 45%)" />
                      <stop offset="60%" stopColor="hsl(200 60% 50%)" />
                      <stop offset="100%" stopColor="hsl(260 55% 60%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                  <XAxis dataKey="week" stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "hsl(142 52% 48%)", strokeOpacity: 0.35, strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="pfi" stroke="url(#rp-pfi-line)" strokeWidth={2.6} fill="url(#rp-pfi-fill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="PFI vs engagement" tone="accent">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={growth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rp-pfi-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 60% 55%)" />
                      <stop offset="100%" stopColor="hsl(142 52% 40%)" />
                    </linearGradient>
                    <linearGradient id="rp-eng-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(260 60% 68%)" />
                      <stop offset="100%" stopColor="hsl(260 55% 50%)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" vertical={false} />
                  <XAxis dataKey="week" stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(142 52% 48% / 0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pfi" fill="url(#rp-pfi-bar)" radius={[8, 8, 0, 0]} name="PFI" />
                  <Bar dataKey="engagement" fill="url(#rp-eng-bar)" radius={[8, 8, 0, 0]} name="Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </motion.div>

      {/* ───── Sub-domain performance ───── */}
      <motion.div
        id="domains"
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="scroll-mt-24 space-y-3"
      >
        <SectionHeader
          eyebrow="Breakdown"
          title="Sub-domain performance"
          subtitle="Where the class is strong and where there's room to grow."
        />
        <ChartCard title="Sub-domain scores" tone="primary">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={subdomain} layout="vertical" margin={{ left: 80, right: 10 }}>
                <defs>
                  <linearGradient id="rp-sub-bar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(142 55% 45%)" />
                    <stop offset="60%" stopColor="hsl(200 60% 55%)" />
                    <stop offset="100%" stopColor="hsl(260 55% 65%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 90%)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(230 15% 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" fontSize={11} stroke="hsl(230 15% 55%)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(142 52% 48% / 0.06)" }} />
                <ReferenceLine
                  x={75}
                  stroke="hsl(0 70% 60%)"
                  strokeDasharray="4 4"
                  label={{ value: "Target", position: "top", fontSize: 11 }}
                />
                <Bar dataKey="score" fill="url(#rp-sub-bar)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="premium-surface rounded-[18px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-heading font-extrabold text-[14px]">Top 3 strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((s) => (
                <span
                  key={s.name}
                  className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-primary/12 text-primary border border-primary/25 inline-flex items-center gap-1.5"
                >
                  {s.name}
                  <span className="tabular-nums font-bold">{s.score}</span>
                </span>
              ))}
            </div>
          </section>
          <section className="premium-surface rounded-[18px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-warning/20 text-warning-foreground dark:text-warning flex items-center justify-center">
                <TrendingDown className="h-4 w-4" />
              </div>
              <h3 className="font-heading font-extrabold text-[14px]">Top 3 growth areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {growthAreas.map((s) => (
                <span
                  key={s.name}
                  className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-warning/20 text-warning-foreground dark:text-warning border border-warning/40 inline-flex items-center gap-1.5"
                >
                  {s.name}
                  <span className="tabular-nums font-bold">{s.score}</span>
                </span>
              ))}
            </div>
          </section>
        </div>

        <KsaRadar students={students} />
      </motion.div>

      {/* ───── Risk & time patterns ───── */}
      <motion.div
        id="risk"
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="scroll-mt-24 space-y-3"
      >
        <SectionHeader
          eyebrow="Who & when"
          title="Risk & monthly trends"
          subtitle="Risk distribution across the class and how class focus has trended across recent monthly check-ins."
        />
        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          <RiskDonut students={students} />
          <MonthlyTrendChart students={students} />
        </div>
      </motion.div>

      {/* ───── Intervention impact ───── */}
      <motion.div
        id="impact"
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}
        className="scroll-mt-24 space-y-3"
      >
        <SectionHeader
          eyebrow="What's working"
          title="Intervention impact"
          subtitle="How each recommended action is changing outcomes."
        />
        <InterventionImpact />
      </motion.div>
    </motion.div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="premium-section-header">
      <div>
        <h2 className="premium-eyebrow"><span>{eyebrow}</span></h2>
        <h3 className="font-heading font-extrabold text-[17px] mt-1.5 leading-tight">{title}</h3>
        {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "primary" | "accent";
  children: React.ReactNode;
}) {
  return (
    <section className="premium-surface rounded-[18px] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "accent" ? "bg-[hsl(260_55%_60%)]" : "bg-primary",
          )}
          aria-hidden
        />
        <h3 className="font-heading font-extrabold text-[14px]">{title}</h3>
      </div>
      {children}
    </section>
  );
}
