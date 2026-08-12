"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ImplementationStatus, OutcomeStatus } from "@/lib/interventionFollowUps";
import type { PlanTrackerRow } from "@/lib/specialEdCaseload";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const IMPLEMENTATION_TONE: Record<ImplementationStatus, string> = {
  "Not yet tried": "hsl(220 12% 55%)",
  "Tried once": "hsl(38 92% 48%)",
  "Tried a few times": "hsl(212 55% 50%)",
  "Tried consistently": "hsl(142 55% 42%)",
};

const OUTCOME_TONE: Record<OutcomeStatus, string> = {
  Improved: "hsl(142 55% 42%)",
  "No change": "hsl(38 92% 48%)",
  "Got worse": "hsl(0 78% 56%)",
  "Too early to tell": "hsl(220 12% 55%)",
};

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold whitespace-nowrap"
      style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      {label}
    </span>
  );
}

export function PlanTrackerTable({
  rows,
  title = "Plan & Follow-Up Tracker",
  subtitle = "Implementation and response tracking.",
  viewAllHref,
}: {
  rows: PlanTrackerRow[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<PlanTrackerRow | null>(null);

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label={title}
      className="rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <header className="mb-4 flex items-start gap-2">
        <div className="flex-1">
          <div className="premium-eyebrow">
            <span>{title}</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">{subtitle}</h3>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-[11.5px] font-bold text-primary hover:underline shrink-0 mt-1">
            View all →
          </Link>
        )}
      </header>

      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No follow-ups logged yet for your caseload. Once a teacher (or you) logs a follow-up, it shows up here.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[760px]">
            <thead className="text-muted-foreground border-b border-border/70">
              <tr className="text-left">
                <th className="py-2 pr-3 px-1 font-bold text-[10px] uppercase tracking-[0.10em]">Strategy / Accommodation</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em]">Student</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[80px]">Type</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[130px]">Implementation</th>
                <th className="py-2 pr-3 font-bold text-[10px] uppercase tracking-[0.10em] w-[110px]">Outcome</th>
                <th className="py-2 font-bold text-[10px] uppercase tracking-[0.10em]">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowTone = OUTCOME_TONE[row.outcome as OutcomeStatus];
                return (
                <motion.tr
                  key={row.id}
                  initial={reduce ? undefined : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                  onClick={() => setSelected(row)}
                  className={cn(
                    "border-t border-border/50 cursor-pointer hover:bg-muted/40 transition-colors",
                    i % 2 === 1 && "bg-muted/[0.15]",
                  )}
                >
                  <td
                    className="py-2.5 pr-3 px-1 align-middle font-semibold text-foreground/90"
                    style={{ boxShadow: `inset 2.5px 0 0 0 color-mix(in srgb, ${rowTone} 70%, transparent)` }}
                  >
                    <span className="pl-1.5">{row.strategy}</span>
                  </td>
                  <td className="py-2.5 pr-3 align-middle">
                    <div className="flex items-center gap-2">
                      <StudentAvatar student={row.student} size="sm" />
                      <span className="truncate">{row.student.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 align-middle text-muted-foreground">{row.type}</td>
                  <td className="py-2.5 pr-3 align-middle">
                    <Pill label={row.implementation} tone={IMPLEMENTATION_TONE[row.implementation as ImplementationStatus]} />
                  </td>
                  <td className="py-2.5 pr-3 align-middle">
                    <Pill label={row.outcome} tone={OUTCOME_TONE[row.outcome as OutcomeStatus]} />
                  </td>
                  <td className="py-2.5 align-middle text-foreground/85">{row.nextStep}</td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">{selected.strategy}</SheetTitle>
                <SheetDescription>Follow-up details</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <StudentAvatar student={selected.student} size="md" />
                  <div className="min-w-0">
                    <div className="font-bold text-[13.5px]">{selected.student.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {selected.student.grade} · Section {selected.student.section} · {selected.type}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DrawerField label="Implementation">
                    <Pill
                      label={selected.implementation}
                      tone={IMPLEMENTATION_TONE[selected.implementation as ImplementationStatus]}
                    />
                  </DrawerField>
                  <DrawerField label="Outcome">
                    <Pill label={selected.outcome} tone={OUTCOME_TONE[selected.outcome as OutcomeStatus]} />
                  </DrawerField>
                </div>

                <DrawerField label="Flagged reason">
                  <p className="text-[12.5px] text-foreground/85">{selected.record.reason}</p>
                </DrawerField>

                <DrawerField label="Teacher response">
                  <p className="text-[12.5px] text-foreground/85 leading-snug">
                    {selected.record.teacherResponse || "—"}
                  </p>
                </DrawerField>

                <DrawerField label="Evidence">
                  <p className="text-[12.5px] text-foreground/85 leading-snug">{selected.record.evidence || "—"}</p>
                </DrawerField>

                {selected.record.note && (
                  <DrawerField label="Note">
                    <p className="text-[12.5px] text-foreground/85 leading-snug">{selected.record.note}</p>
                  </DrawerField>
                )}

                <DrawerField label="Next step">
                  <p className="text-[12.5px] font-semibold text-foreground/90">{selected.nextStep}</p>
                </DrawerField>

                <DrawerField label="Logged">
                  <p className="text-[11.5px] text-muted-foreground">
                    {new Date(selected.record.createdAt).toLocaleString()}
                  </p>
                </DrawerField>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.section>
  );
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
