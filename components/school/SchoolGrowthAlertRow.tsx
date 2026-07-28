"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AlertOctagon, AlertTriangle, ArrowRight, PartyPopper } from "lucide-react";
import { SCHOOL_RECENT_EVENTS, type SchoolEventCtaTarget } from "@/lib/schoolData";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const POSITIVE = "hsl(142 55% 45%)";
const CRITICAL = "hsl(0 78% 58%)";
const WARNING = "hsl(38 92% 50%)";

export function SchoolGrowthAlertRow() {
  const reduce = useReducedMotion();
  const win = SCHOOL_RECENT_EVENTS.find((e) => e.kind === "celebration") ?? null;
  const alerts = SCHOOL_RECENT_EVENTS.filter((e) => e.kind === "alert");
  const topAlert = alerts.find((e) => e.severity === "critical") ?? alerts[0] ?? null;

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="What changed this month"
    >
      <div className="premium-eyebrow">
        <span>What changed this month</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Banner
          tone={POSITIVE}
          eyebrow="This month's win"
          icon={<PartyPopper className="h-4 w-4" />}
          headline={win?.title ?? "No clear wins this month"}
          detail={
            win?.body ??
            "Keep at the routines you have in place — gains show up over the next check-in."
          }
          action={win?.cta?.label}
          actionTo={win?.cta?.to}
        />
        <Banner
          tone={topAlert?.severity === "critical" ? CRITICAL : WARNING}
          eyebrow="Priority alert"
          severity={topAlert?.severity === "critical" ? "HIGH" : "MEDIUM"}
          icon={
            topAlert?.severity === "critical" ? (
              <AlertOctagon className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )
          }
          headline={topAlert?.title ?? "Nothing critical this month"}
          detail={topAlert?.body ?? "You're in a good window to push on a stretch goal."}
          action={topAlert?.cta?.label}
          actionTo={topAlert?.cta?.to}
        />
      </div>
    </motion.section>
  );
}

function Banner({
  tone,
  eyebrow,
  severity,
  icon,
  headline,
  detail,
  action,
  actionTo,
}: {
  tone: string;
  eyebrow: string;
  severity?: string;
  icon: React.ReactNode;
  headline: string;
  detail: string;
  action?: string;
  actionTo?: SchoolEventCtaTarget;
}) {
  return (
    <article
      className="relative rounded-2xl border p-4 flex items-start gap-3 transition-transform hover:-translate-y-0.5"
      style={{
        background: `color-mix(in srgb, ${tone} 6%, var(--card))`,
        borderColor: `color-mix(in srgb, ${tone} 28%, transparent)`,
      }}
    >
      <span
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `color-mix(in srgb, ${tone} 16%, transparent)`,
          color: tone,
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: tone }}
          >
            {eyebrow}
          </span>
          {severity && (
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tone} 18%, transparent)`,
                color: tone,
              }}
            >
              · {severity}
            </span>
          )}
        </div>
        <h3
          className="font-heading font-extrabold text-[15px] leading-tight mt-1"
          style={{ color: tone }}
        >
          {headline}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{detail}</p>
        {action && actionTo && (
          <Link
            href={actionTo}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold mt-2.5 hover:underline"
            style={{ color: tone }}
          >
            {action}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  );
}
