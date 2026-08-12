"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ActionHubItem, ActionHubPriority } from "@/lib/specialEdCaseload";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const PRIORITY_LABEL: Record<ActionHubPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_TONE: Record<ActionHubPriority, string> = {
  high: "hsl(0 78% 58%)",
  medium: "hsl(38 92% 50%)",
  low: "hsl(142 55% 45%)",
};

export function PriorityCasesTable({ items }: { items: ActionHubItem[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Priority cases"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Priority Cases</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">
          What needs action first
        </h3>
      </header>

      {items.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No priority cases right now — every case is stable.</p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[640px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 px-1 font-bold text-[10px] uppercase tracking-[0.10em] w-[80px]">Priority</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Action</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Why</th>
                <th className="py-2 w-[120px]" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const tone = PRIORITY_TONE[item.priority];
                return (
                  <motion.tr
                    key={item.id}
                    initial={reduce ? undefined : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                    className="border-t border-border/50"
                  >
                    <td
                      className="py-2.5 pr-3 px-1 align-middle"
                      style={{ boxShadow: `inset 2.5px 0 0 0 color-mix(in srgb, ${tone} 70%, transparent)` }}
                    >
                      <span
                        className="inline-flex items-center rounded-full px-1.5 py-0.5 ml-1.5 text-[9.5px] font-bold whitespace-nowrap"
                        style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
                      >
                        {PRIORITY_LABEL[item.priority]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 align-middle font-semibold text-foreground/90">{item.action}</td>
                    <td className="py-2.5 pr-3 align-middle text-muted-foreground">{item.whyItMatters}</td>
                    <td className="py-2.5 align-middle">
                      <Link
                        href={item.href}
                        className="inline-flex items-center justify-center h-7 rounded-lg px-2.5 text-[11px] font-bold border shrink-0 whitespace-nowrap"
                        style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
                      >
                        {item.ctaLabel}
                      </Link>
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
