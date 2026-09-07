"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/** Shown once, right after the 3rd and final setup step (activating Fumi)
 * is finished — a real "nice, that's done" beat before handing off into
 * the Classroom Log walkthrough, instead of yanking the teacher straight
 * from the still-open "Send invite" dialog into a whole new page (the
 * jarring transition this was added to fix). Same visual language as
 * FtueCompleteDialog (the walkthrough's own end-of-tour screen) so the two
 * "you just finished something" beats in this flow feel like one family. */
export function ClassroomReadyDialog({ open, onContinue }: { open: boolean; onContinue: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onContinue()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center mt-2">Your first class is set up 🎉</DialogTitle>
          <DialogDescription className="text-center">
            Now let&apos;s take a quick look at how Yellow Cognition helps your classroom — and the
            tools you&apos;ll use every day.
          </DialogDescription>
        </DialogHeader>

        <Button className="w-full" onClick={onContinue}>
          Show me around
        </Button>
      </DialogContent>
    </Dialog>
  );
}
