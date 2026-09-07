"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ParentCommsCard } from "@/components/school/ParentCommsCard";

/** Mounts the same ParentCommsCard the settings page's "Parent comms" tab
 * uses, in a dialog on top of the dashboard — opened by
 * SchoolDashboardTour's "configure-parent-comms" step instead of
 * navigating to /school/settings. Closes itself once communications are
 * actually saved. */
export function ParentCommsDialog({
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
          <DialogTitle className="sr-only">Configure parent communications</DialogTitle>
          <DialogDescription className="sr-only">
            Branding, cadence, and opt-out rules for messages sent to families.
          </DialogDescription>
        </DialogHeader>
        <ParentCommsCard onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
