"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FileBarChart,
  Download,
  CalendarClock,
  Mail,
  Users as UsersIcon,
  School as SchoolIcon,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";

export default function Page() {
  return (
    <SchoolAppShell>
      <ReportsPage />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const REPORTS = [
  {
    id: "monthly-digest",
    title: "Monthly all-staff digest",
    desc: "PFI trend, at-risk rollup, and class-level highlights for every teacher.",
    cadence: "Monthly · after check-ins close",
    Icon: CalendarClock,
    tone: "hsl(200 60% 50%)",
    cta: "Schedule",
  },
  {
    id: "parent-pulse",
    title: "Parent pulse report",
    desc: "Activation, engagement, and monthly student wins for families.",
    cadence: "Monthly · end of month",
    Icon: HeartHandshake,
    tone: "hsl(142 55% 45%)",
    cta: "Configure",
  },
  {
    id: "compliance",
    title: "Compliance & data export",
    desc: "FERPA-aligned per-student record export. CSV + PDF.",
    cadence: "On demand",
    Icon: ShieldCheck,
    tone: "hsl(260 55% 60%)",
    cta: "Export",
  },
  {
    id: "teacher-coaching",
    title: "Teacher coaching brief",
    desc: "Strengths, growth areas, and PD nudges per teacher.",
    cadence: "Monthly · 1st",
    Icon: UsersIcon,
    tone: "hsl(38 92% 50%)",
    cta: "Send sample",
  },
];

function ReportsPage() {
  const reduce = useReducedMotion();

  const handleAction = (id: string, label: string) => {
    if (id === "monthly-digest") {
      markSchoolTaskDone("schedule-report");
      markSchoolTaskDone("review-digest");
    }
    if (id === "parent-pulse") {
      markSchoolTaskDone("configure-parent-comms");
    }
    toast.success(`${label}: queued (demo)`);
  };

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <section className="premium-elevated rounded-[22px] p-5 sm:p-6">
        <div className="premium-eyebrow">
          <FileBarChart className="h-3 w-3" /> Reports
        </div>
        <h1 className="mt-1.5 font-heading font-extrabold text-[24px] sm:text-[28px] leading-tight tracking-tight">
          Pulse of the school, on a schedule
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
          Configure what goes out to teachers, parents, and your district. Every report follows your
          school's branding and FERPA-aligned redaction rules.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {REPORTS.map((r) => {
          const Icon = r.Icon;
          return (
            <div
              key={r.id}
              className="premium-elevated rounded-[20px] p-5 flex flex-col gap-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span
                  className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${r.tone} 14%, transparent)`, color: r.tone }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-extrabold text-[15.5px] leading-tight">{r.title}</div>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3 w-3" /> {r.cadence}
                </span>
                <button
                  onClick={() => handleAction(r.id, r.title)}
                  className="cta-premium !h-9 !w-auto px-3.5 !text-[12px]"
                >
                  <span className="sheen" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    {r.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Export strip */}
      <section className="premium-surface rounded-[18px] p-5 grid sm:grid-cols-3 gap-3 items-center">
        <div className="sm:col-span-2">
          <div className="font-heading font-extrabold text-[15px] flex items-center gap-2">
            <SchoolIcon className="h-4 w-4 text-primary" /> Need a one-off export?
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Export this month's full school dataset as CSV + PDF. Auto-redacts PII based on your role.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <button
            onClick={() => toast.success("CSV export queued")}
            className="h-10 px-3 rounded-xl border border-border bg-card/70 text-[12.5px] font-bold inline-flex items-center gap-1.5 hover:bg-muted/60 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={() => toast.success("PDF export queued")}
            className="h-10 px-3 rounded-xl border border-border bg-card/70 text-[12.5px] font-bold inline-flex items-center gap-1.5 hover:bg-muted/60 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          <button
            onClick={() => toast.success("Email scheduled")}
            className="cta-premium !h-10 !w-auto px-3.5 !text-[12.5px]"
          >
            <span className="sheen" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email me
            </span>
          </button>
        </div>
      </section>
    </motion.div>
  );
}
