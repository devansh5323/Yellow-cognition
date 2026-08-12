"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  HandHelping,
  Info,
  MessageSquareHeart,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Users,
} from "lucide-react";
import { districtPbisOverview, type SupportActionStatus } from "@/lib/districtData";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const GREEN = "hsl(142 55% 45%)";
const BLUE = "hsl(212 90% 58%)";
const AMBER = "hsl(38 92% 55%)";
const PURPLE = "hsl(262 60% 62%)";
const ORANGE = "hsl(28 88% 54%)";
const RED = "hsl(0 78% 58%)";

const ACTION_STATUS_TONE: Record<SupportActionStatus, string> = {
  "No support required": GREEN,
  Monitoring: BLUE,
  "Coaching assigned": AMBER,
  "Resource review in progress": PURPLE,
  "District support plan active": ORANGE,
  "Immediate district review": RED,
};

export function DistrictPbisImplementationOverview() {
  const reduce = useReducedMotion();
  const pbis = useMemo(() => districtPbisOverview(), []);

  // Give any tiny slice (e.g. 1 school out of 24) a minimum visual weight so its
  // label has room to sit under it — applied identically to the bar and the
  // legend below so the two always stay pixel-aligned regardless of the floor.
  const actionWeights = useMemo(() => {
    const total = pbis.actionPlanStatusCounts.reduce((sum, s) => sum + s.count, 0);
    const floor = Math.max(1, Math.ceil(total * 0.12));
    return pbis.actionPlanStatusCounts.map((s) => ({ ...s, weight: s.count > 0 ? Math.max(s.count, floor) : 0 }));
  }, [pbis]);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
      aria-label="PBIS Implementation Across Schools"
    >
      <div className="premium-eyebrow">
        <span>PBIS Implementation Across Schools</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        {/* Implementation status */}
        <ImplementationStatusPanel
          meetingExpectations={pbis.meetingExpectations}
          partialImplementation={pbis.partialImplementation}
          needsSupport={pbis.needsSupport}
          totalSchools={pbis.totalSchools}
        />

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Engagement metrics */}
        <h2 className="inline-flex items-center gap-1.5 font-heading font-extrabold text-[16px] leading-tight mb-3">
          District Engagement
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            icon={<ClipboardCheck className="h-4 w-4" />}
            value={`${pbis.checkInCompletionPct}%`}
            label="Check-in Completion"
            tone={BLUE}
          />
          <StatTile
            icon={<MessageSquareHeart className="h-4 w-4" />}
            value={`${pbis.positiveRecognitionPct}%`}
            label="Positive-Recognition Participation"
            tone={GREEN}
          />
          <StatTile
            icon={<HandHelping className="h-4 w-4" />}
            value={`${pbis.interventionFollowThroughPct}%`}
            label="Intervention Follow-through"
            tone={ORANGE}
          />
          <StatTile
            icon={<CalendarCheck className="h-4 w-4" />}
            value={`${pbis.leadershipReviewCompletionPct}%`}
            label="Leadership Review Completion"
            tone={BLUE}
          />
        </div>

        <div className="my-5 border-t border-border/60" aria-hidden />

        {/* Action-plan status breakdown */}
        <h2 className="font-heading font-extrabold text-[16px] leading-tight mb-3">School Action-Plan Status</h2>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/50">
          {actionWeights.map((s) => {
            if (s.weight <= 0) return null;
            return (
              <span
                key={s.status}
                className="h-full"
                style={{
                  flex: `${s.weight} 1 0`,
                  background: ACTION_STATUS_TONE[s.status],
                }}
                title={`${s.status}: ${s.count}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap w-full items-start gap-x-3 gap-y-3 text-[11.5px]">
          {actionWeights.map((s) => (
            <div key={s.status} className="flex flex-col gap-1 min-w-0" style={{ flex: `${s.weight} 1 0` }}>
              <span className="inline-flex items-start gap-1.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 mt-1"
                  style={{ background: ACTION_STATUS_TONE[s.status] }}
                  aria-hidden
                />
                <span className="font-semibold text-foreground/90 leading-snug">{s.status}</span>
              </span>
              <span className="pl-4 text-muted-foreground tabular-nums">
                {s.count} school{s.count === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function ImplementationStatusPanel({
  meetingExpectations,
  partialImplementation,
  needsSupport,
  totalSchools,
}: {
  meetingExpectations: number;
  partialImplementation: number;
  needsSupport: number;
  totalSchools: number;
}) {
  const meetingPct = Math.round((meetingExpectations / Math.max(1, totalSchools)) * 1000) / 10;

  const rows = [
    {
      key: "meeting",
      icon: ShieldCheck,
      tone: GREEN,
      value: meetingExpectations,
      title: "Meeting Implementation Expectations",
      subtitle: "Schools on track",
    },
    {
      key: "partial",
      icon: ShieldQuestion,
      tone: AMBER,
      value: partialImplementation,
      title: "Partial Implementation",
      subtitle: "Some progress, needs attention",
    },
    {
      key: "needs-support",
      icon: ShieldAlert,
      tone: RED,
      value: needsSupport,
      title: "Requiring Implementation Support",
      subtitle: "Needs immediate attention",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2.5">
          <span
            className="h-9 w-9 rounded-xl inline-flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${GREEN} 16%, transparent)`, color: GREEN }}
          >
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="inline-flex items-center gap-1.5 font-heading font-extrabold text-[18px] leading-tight">
            Implementation Status
            <Info className="h-4 w-4 text-muted-foreground" />
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[12.5px] text-muted-foreground">
          <Users className="h-4 w-4" />
          {totalSchools} schools total
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_auto] justify-center gap-10 items-center">
        <div className="mx-auto">
          <MultiDonut
            segments={[
              { value: needsSupport, tone: RED },
              { value: meetingExpectations, tone: GREEN },
              { value: partialImplementation, tone: AMBER },
            ]}
            centerValue={totalSchools}
            centerLabel="Total Schools"
          />
        </div>

        <div>
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={row.key}>
                {i > 0 && <div className="border-t border-border/60" aria-hidden />}
                <div className="flex items-center gap-3.5 py-3.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: row.tone }} aria-hidden />
                  <span
                    className="h-11 w-11 rounded-full border-2 inline-flex items-center justify-center shrink-0"
                    style={{
                      borderColor: `color-mix(in srgb, ${row.tone} 45%, transparent)`,
                      color: row.tone,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-heading font-extrabold text-[22px] tabular-nums" style={{ color: row.tone }}>
                      {row.value}
                    </span>
                    <span className="text-[13px] text-muted-foreground font-bold">/{totalSchools}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-[15px] leading-tight">{row.title}</div>
                    <div className="text-[12.5px] text-muted-foreground leading-snug mt-0.5">{row.subtitle}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border/60 bg-background/40 p-4 flex items-center gap-3">
        <span
          className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${PURPLE} 16%, transparent)`, color: PURPLE }}
        >
          <BarChart3 className="h-4.5 w-4.5" />
        </span>
        <p className="text-[13px] leading-snug">
          <span className="font-heading font-extrabold">
            {meetingExpectations} of {totalSchools} schools
          </span>{" "}
          <span className="font-heading font-extrabold" style={{ color: GREEN }}>
            ({meetingPct}%)
          </span>{" "}
          <span className="text-muted-foreground">are meeting implementation expectations.</span>
        </p>
      </div>
    </div>
  );
}

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number) {
  const startOuter = polarPoint(cx, cy, outerR, startDeg);
  const endOuter = polarPoint(cx, cy, outerR, endDeg);
  const startInner = polarPoint(cx, cy, innerR, endDeg);
  const endInner = polarPoint(cx, cy, innerR, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function MultiDonut({
  segments,
  centerValue,
  centerLabel,
  size = 220,
}: {
  segments: { value: number; tone: string }[];
  centerValue: number;
  centerLabel: string;
  size?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = outerR * 0.58;
  const labelR = (outerR + innerR) / 2;

  let angle = -90;
  const slices = segments
    .filter((s) => s.value > 0)
    .map((s, i) => {
      const sweep = (s.value / Math.max(1, total)) * 360;
      const startDeg = angle;
      const endDeg = angle + sweep;
      angle = endDeg;
      const midDeg = (startDeg + endDeg) / 2;
      const labelPoint = polarPoint(cx, cy, labelR, midDeg);
      const pct = Math.round((s.value / Math.max(1, total)) * 1000) / 10;
      return {
        key: i,
        path: donutSlicePath(cx, cy, outerR, innerR, startDeg, endDeg),
        tone: s.tone,
        label: `${pct}%`,
        labelPoint,
      };
    });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.45))" }}
    >
      <defs>
        {slices.map((s) => (
          <linearGradient key={`grad-${s.key}`} id={`donut-grad-${s.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: `color-mix(in srgb, ${s.tone} 55%, white)` }} />
            <stop offset="55%" style={{ stopColor: s.tone }} />
            <stop offset="100%" style={{ stopColor: `color-mix(in srgb, ${s.tone} 80%, black)` }} />
          </linearGradient>
        ))}
        <radialGradient id="donut-center-shade" cx="50%" cy="42%" r="65%">
          <stop offset="0%" style={{ stopColor: "rgba(255,255,255,0.06)" }} />
          <stop offset="100%" style={{ stopColor: "rgba(0,0,0,0.22)" }} />
        </radialGradient>
      </defs>

      {slices.map((s) => (
        <path key={s.key} d={s.path} fill={`url(#donut-grad-${s.key})`} />
      ))}
      {/* subtle depth shading across the ring, plus a soft inner-edge shadow */}
      <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="url(#donut-center-shade)" strokeWidth={outerR - innerR} />
      <circle cx={cx} cy={cy} r={innerR + 1.5} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={outerR - 1} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
      {slices.map((s) => (
        <text
          key={`label-${s.key}`}
          x={s.labelPoint.x}
          y={s.labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold"
          style={{ fontSize: 15 }}
        >
          {s.label}
        </text>
      ))}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground font-extrabold"
        style={{ fontSize: 30 }}
      >
        {centerValue}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground font-semibold"
        style={{ fontSize: 12.5 }}
      >
        {centerLabel}
      </text>
    </svg>
  );
}

function StatTile({ icon, value, label, tone }: { icon: ReactNode; value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-3.5">
      <span
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        {icon}
      </span>
      <div className="mt-2.5 font-heading font-extrabold text-[20px] leading-none tabular-nums" style={{ color: tone }}>
        {value}
      </div>
      <div className="mt-1 text-[10.5px] text-muted-foreground leading-snug">{label}</div>
    </div>
  );
}
