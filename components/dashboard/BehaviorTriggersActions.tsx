"use client";

import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  ListChecks,
  MessageSquareWarning,
  ShieldAlert,
  Shuffle,
  Users2,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { BehaviorTriggerRow } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TRIGGER_ICON: Record<string, LucideIcon> = {
  "Difficult task": ListChecks,
  "Long wait": ShieldAlert,
  "Long instruction blocks": BookOpen,
  Transition: Shuffle,
  "Peer proximity": Users2,
  "Change in routine": Shuffle,
  "Noise levels": Volume2,
  Correction: MessageSquareWarning,
  Unknown: HelpCircle,
};

export function BehaviorTriggersActions({ rows }: { rows: BehaviorTriggerRow[] }) {
  const reduce = useReducedMotion();

  const handleAction = (row: BehaviorTriggerRow) => {
    toast(row.recommendedAction, {
      description: `Logged as the trigger ${row.count} time${row.count === 1 ? "" : "s"} this week.`,
    });
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Behaviour triggers and actions"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-center gap-2">
        <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="premium-eyebrow">
            <span>Behavior triggers &amp; actions</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Why is behaviour happening?
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5 max-w-prose">
            From what teachers logged as happening right before, this week.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Not enough behaviour logs with a recorded trigger this week yet — select what happened
          right before on the Record Behaviour form to build this up.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[480px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Trigger</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[90px]">Count</th>
                <th className="py-2 font-bold text-[10px] uppercase tracking-[0.10em]">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const Icon = TRIGGER_ICON[row.trigger] ?? HelpCircle;
                return (
                  <motion.tr
                    key={row.id}
                    initial={reduce ? undefined : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                    className="border-t border-border/50"
                  >
                    <td className="py-2.5 pr-3 align-middle">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/90">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {row.trigger}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 align-middle tabular-nums font-bold">{row.count}</td>
                    <td className="py-2.5 align-middle">
                      <button
                        type="button"
                        onClick={() => handleAction(row)}
                        className="text-primary font-bold hover:underline text-left"
                      >
                        {row.recommendedAction}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
