"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/** The teacher-side FTUE→RTUE handoff — shown once, right after finishing
 * (or dismissing) the Classroom Log tools walkthrough, the very last step
 * of setup. Mirrors the SEL Coordinator's equivalent milestone moment
 * (components/sel/SelMilestoneDialog.tsx) — a real "you're done" beat
 * instead of silently redirecting into the now-unlocked dashboard. */
export function FtueCompleteDialog({ open, onDone }: { open: boolean; onDone: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDone()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <PartyPopper className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center mt-2">You&apos;re all set!</DialogTitle>
          <DialogDescription className="text-center">
            Good luck out there — your classroom insights, tools, and recommendations are ready
            whenever you need them.
          </DialogDescription>
        </DialogHeader>

        <Button className="w-full" onClick={onDone}>
          Let&apos;s go
        </Button>
      </DialogContent>
    </Dialog>
  );
}
