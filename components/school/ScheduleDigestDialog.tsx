"use client";

import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";

/** Mirrors the exact "Monthly all-staff digest" card on /school/reports —
 * same copy, same single action (there's no real scheduling form behind
 * it there either, just a button that marks both tasks done and queues a
 * demo toast) — just presented as a dialog so SchoolDashboardTour's
 * "review-digest" and "schedule-report" steps don't have to navigate away
 * from the dashboard. Both steps share this one dialog because the real
 * reports page already treats "schedule the digest" as satisfying both
 * tasks at once (see handleAction in app/school/reports/page.tsx). */
export function ScheduleDigestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const schedule = () => {
    markSchoolTaskDone("schedule-report");
    markSchoolTaskDone("review-digest");
    toast.success("Monthly all-staff digest: queued (demo)");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly all-staff digest</DialogTitle>
          <DialogDescription>
            PFI trend, at-risk rollup, and class-level highlights for every teacher.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border/60 bg-card/40 p-3.5 flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-[hsl(200_60%_50%)]/15 text-[hsl(200_60%_45%)] dark:text-[hsl(200_70%_70%)] flex items-center justify-center shrink-0">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div className="text-[12.5px] text-muted-foreground">Monthly · after check-ins close</div>
        </div>
        <Button onClick={schedule} className="w-full rounded-xl h-10">
          Schedule
        </Button>
      </DialogContent>
    </Dialog>
  );
}
