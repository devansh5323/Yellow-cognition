"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Plus, Upload } from "lucide-react";
import { SelAppShell } from "@/components/sel/SelAppShell";
import { Button } from "@/components/ui/button";
import { CreateProgramDialog } from "@/components/sel/CreateProgramDialog";
import { assignProgram, getPrograms, type SelProgram } from "@/lib/selProgram";
import { cn } from "@/lib/utils";

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

export default function Page() {
  return (
    <SelAppShell>
      <ProgramPlanner />
    </SelAppShell>
  );
}

function ProgramPlanner() {
  const reduce = useReducedMotion();

  const [programs, setPrograms] = useState<SelProgram[]>([]);
  useEffect(() => {
    const refresh = () => setPrograms(getPrograms());
    refresh();
    window.addEventListener("ah-sel-program-change", refresh);
    return () => window.removeEventListener("ah-sel-program-change", refresh);
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <header className="min-w-0">
          <div className="premium-eyebrow">
            <BookOpen className="h-3 w-3" />
            <span>SEL Program &amp; Lesson Planner</span>
          </div>
          <h1 className="font-heading font-black text-[24px] md:text-[28px] leading-tight mt-1">
            Plan a Tier 1 SEL program
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-2xl">
            Build a multi-week program, then assign it to a grade — teachers see it on their dashboard once it&apos;s live.
          </p>
        </header>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => comingSoon("CSV import")}
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" />
            Import from CSV
          </Button>
          <Button
            onClick={() => {
              setCreateKey((k) => k + 1);
              setCreateOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create program
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <header className="mb-4">
          <div className="premium-eyebrow">
            <span>Programs</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1.5">Created &amp; assigned</h3>
        </header>

        {programs.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No programs yet — create one to start planning.</p>
        ) : (
          <ul className="space-y-3">
            {programs.map((p) => (
              <li key={p.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[13.5px]">{p.grade}</span>
                      <span className="text-[12px] text-muted-foreground">·</span>
                      <span className="text-[12.5px] font-semibold">{p.focus}</span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]",
                          p.status === "assigned"
                            ? "bg-[hsl(142_55%_45%/0.12)] text-[hsl(142_55%_38%)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.status === "assigned" ? "Assigned" : "Draft"}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">
                      {p.duration}-week program · {p.frequency} · {p.assignedTeacher}
                    </p>
                  </div>
                  {p.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        assignProgram(p.id);
                        toast.success("Program assigned", {
                          description: `${p.grade} teachers will see this program on their dashboard.`,
                        });
                      }}
                    >
                      Assign to {p.grade}
                    </Button>
                  )}
                </div>

                <ol className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {p.weeks.map((w) => (
                    <li key={w.week} className="flex items-baseline gap-2 text-[12px]">
                      <span className="font-bold text-muted-foreground shrink-0">Week {w.week}</span>
                      <span className="text-foreground/85">{w.title}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreateProgramDialog key={createKey} open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}
