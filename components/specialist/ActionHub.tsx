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

export function ActionHub({ items }: { items: ActionHubItem[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label="Student Support Action Hub"
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4">
        <div className="premium-eyebrow">
          <span>Student Support Action Hub</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">What needs action now</h3>
      </header>

      {items.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          Nothing urgent right now — every case on your caseload is stable.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => {
            const tone = PRIORITY_TONE[item.priority];
            return (
              <motion.li
                key={item.id}
                initial={reduce ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                className="flex items-stretch gap-0 rounded-xl border border-border bg-background overflow-hidden transition-shadow hover:shadow-[0_6px_16px_-10px_hsl(230_50%_18%/0.3)]"
              >
                <span className="w-1 shrink-0" style={{ background: tone }} aria-hidden />
                <div className="flex-1 min-w-0 flex items-start gap-3 p-3.5">
                  <span
                    className="h-6 w-6 rounded-full inline-flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
                    style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-heading font-bold text-[13.5px] leading-tight">{item.action}</div>
                      <span
                        className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                      >
                        {PRIORITY_LABEL[item.priority]}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground leading-snug mt-1">{item.whyItMatters}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[10.5px] text-muted-foreground">
                      <span>
                        <span className="font-bold text-foreground/70">Related: </span>
                        {item.related}
                      </span>
                      <span>
                        <span className="font-bold text-foreground/70">Due: </span>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
                      </span>
                      <Link
                        href={item.href}
                        className="ml-auto inline-flex items-center justify-center h-7 rounded-lg px-2.5 text-[11px] font-bold border shrink-0 transition-colors hover:brightness-95"
                        style={{
                          borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`,
                          color: tone,
                          background: `color-mix(in srgb, ${tone} 8%, transparent)`,
                        }}
                      >
                        {item.ctaLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
}
