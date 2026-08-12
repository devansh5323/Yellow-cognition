"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertOctagon,
  AlertTriangle,
  ClipboardList,
  Mail,
  Sparkles,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  strategyForDriver,
  type ActionPriority,
  type BehaviorSupport,
  type PriorityAction,
} from "@/lib/classBehavior";
import { StudentDrillDialog } from "@/components/reports/StudentDrillDialog";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const PRIORITY_LABEL: Record<ActionPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const PRIORITY_TONE: Record<ActionPriority, string> = {
  high: "hsl(0 78% 58%)",
  medium: "hsl(38 92% 50%)",
  low: "hsl(142 55% 45%)",
};

const CTA_ICON: Record<PriorityAction["cta"], LucideIcon> = {
  "safety-incident": AlertOctagon,
  "tier3-review": AlertTriangle,
  "overdue-followup": ClipboardList,
  "repeated-tier2": Users,
  "tier1-strategy": Wand2,
  "positive-gap": Sparkles,
  "parent-comm": Mail,
};

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export function BehaviorPriorityActions({
  actions,
  supportRoster,
}: {
  actions: PriorityAction[];
  supportRoster: BehaviorSupport[];
}) {
  const reduce = useReducedMotion();
  const [drillStatus, setDrillStatus] = useState<"new" | "active" | null>(null);

  const drillStudents = useMemo(
    () => (drillStatus ? supportRoster.filter((r) => r.status === drillStatus).map((r) => r.student) : []),
    [drillStatus, supportRoster],
  );

  const handleCta = (action: PriorityAction) => {
    if (action.cta === "tier3-review") setDrillStatus("new");
    else if (action.cta === "overdue-followup") setDrillStatus("active");
    else if (action.cta === "tier1-strategy" && action.driverKey) {
      const strategy = strategyForDriver(action.driverKey);
      if (strategy) toast(strategy.title, { description: strategy.rationale });
      else comingSoon("Strategy suggestions for this driver");
    } else if (action.cta === "safety-incident") comingSoon("Sharing a summary with the support team");
    else if (action.cta === "repeated-tier2") comingSoon("Creating a small group");
    else if (action.cta === "positive-gap") comingSoon("Logging positive behaviour from here");
    else if (action.cta === "parent-comm") comingSoon("Sending a parent update");
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Priority actions"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-center gap-2">
        <div>
          <div className="premium-eyebrow">
            <span>Priority actions</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            What to do next
          </h3>
        </div>
        {actions.length > 0 && (
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold ml-auto">
            {actions.length}
          </span>
        )}
      </header>

      {actions.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Nothing urgent right now — the class is holding steady.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {actions.map((action, i) => {
            const Icon = CTA_ICON[action.cta];
            const tone = PRIORITY_TONE[action.priority];
            return (
              <motion.li
                key={action.id}
                initial={reduce ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                className="flex items-stretch gap-0 rounded-xl border border-border bg-background overflow-hidden"
              >
                <span className="w-0.5 shrink-0" style={{ background: tone }} aria-hidden />
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3 px-3.5 py-2.5">
                  <span
                    className="h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <span
                      className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                      style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                    >
                      {PRIORITY_LABEL[action.priority]}
                    </span>
                    <div className="font-heading font-bold text-[13px] leading-tight mt-1">{action.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{action.detail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCta(action)}
                    className="inline-flex items-center justify-center h-7 rounded-lg px-2.5 text-[11.5px] font-bold shrink-0 border ml-auto transition-colors"
                    style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
                  >
                    {action.ctaLabel}
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => comingSoon("The full action-items list")}
        className="mt-3 text-[11px] font-bold text-primary hover:underline"
      >
        View all action items →
      </button>

      <StudentDrillDialog
        open={!!drillStatus}
        onOpenChange={(o) => !o && setDrillStatus(null)}
        title={drillStatus === "new" ? "Newly flagged students" : "Students on a support plan"}
        description={
          drillStudents.length === 0
            ? "No students match this segment."
            : `${drillStudents.length} student${drillStudents.length === 1 ? "" : "s"}.`
        }
        students={drillStudents}
      />
    </motion.section>
  );
}
