"use client";

import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ClipboardList, MapPin, Shuffle, Users2, type LucideIcon } from "lucide-react";
import { strategyForDriver, type ActivityContextRow } from "@/lib/classBehavior";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const CONTEXT_ICON: Record<string, LucideIcon> = {
  "independent-work": ClipboardList,
  transitions: Shuffle,
  "group-work": Users2,
  "homework-review": BookOpen,
};

export function BehaviorActivityContext({ rows }: { rows: ActivityContextRow[] }) {
  const reduce = useReducedMotion();

  const handleAction = (row: ActivityContextRow) => {
    const strategy = row.driverKey ? strategyForDriver(row.driverKey) : null;
    toast(row.recommendedAction, {
      description: strategy?.rationale ?? `For ${row.count} student${row.count === 1 ? "" : "s"} affected by this pattern.`,
    });
  };

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Activity and context pattern"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="premium-eyebrow">
            <span>Activity / context pattern</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
            Where is the behaviour happening?
          </h3>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No activity or context pattern stands out this week.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[560px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Context</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Main friction</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[90px]">Count</th>
                <th className="py-2 font-bold text-[10px] uppercase tracking-[0.10em]">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const Icon = CONTEXT_ICON[row.id] ?? ClipboardList;
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
                        {row.context}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 align-middle text-foreground/80">{row.mainFriction}</td>
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
