"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UNLOCKED = [
  "School Health Driver Cards",
  "Grade & Classroom Overview",
  "Tier Support Distribution",
  "Intervention Implementation",
  "Positive Behaviour Culture",
  "Teacher & Classroom Support Needs",
] as const;

/** The FTUE→RTUE transition screen — shown once, the first time the
 * admin's 5-task activation reaches "done" (see markSchoolMilestoneSeen()).
 * Every other section on this dashboard already swaps from locked to real
 * content in place; this is the one moment that names all six at once.
 * Mirrors components/sel/SelMilestoneDialog.tsx. */
export function SchoolMilestoneDialog({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-[hsl(260_55%_60%/0.12)] text-[hsl(260_55%_60%)] inline-flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center mt-2">You&apos;re all set</DialogTitle>
          <DialogDescription className="text-center">
            Your school is fully activated — every dashboard section is now unlocked with real
            reporting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="rounded-xl border border-border bg-background p-3.5 space-y-2">
            {UNLOCKED.map((label) => (
              <li key={label} className="flex items-center gap-2.5 text-[13px] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[hsl(142_55%_45%)] shrink-0" />
                {label}
              </li>
            ))}
          </ul>

          <Button className="w-full" onClick={onDismiss}>
            View my dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
