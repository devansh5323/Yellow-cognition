"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertsCard } from "@/components/school/AlertsCard";

/** Mounts the same AlertsCard the settings page's "Alert thresholds" tab
 * uses, in a dialog on top of the dashboard — opened by
 * SchoolDashboardTour's "set-thresholds" step instead of navigating to
 * /school/settings. Closes itself once thresholds are actually saved. */
export function AlertsThresholdsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Set school-wide alert thresholds</DialogTitle>
          <DialogDescription className="sr-only">
            When Yellow should surface a student, class, or teacher.
          </DialogDescription>
        </DialogHeader>
        <AlertsCard onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
