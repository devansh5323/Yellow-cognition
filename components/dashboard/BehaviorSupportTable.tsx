"use client";

import { NotEnoughDataPanel } from "@/components/dashboard/NotEnoughData";
import type { BehaviorSupport } from "@/lib/classBehavior";

/** Component 8's per-student layer. No real per-student behaviour score
 * exists yet, so studentsNeedingBehaviorSupport() always returns an empty
 * roster — this shows the same honest empty-state convention used
 * elsewhere in the app (see app/focus/page.tsx) instead of an
 * empty-looking table. */
export function BehaviorSupportTable({ items }: { items: BehaviorSupport[] }) {
  return (
    <section
      aria-label="Students needing behaviour support"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="px-5 md:px-6 py-4 border-b border-border/70">
        <div className="premium-eyebrow">
          <span>Per-student review</span>
        </div>
        <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
          Students needing behaviour support
        </h3>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">
          {items.length > 0
            ? `${items.length} student${items.length === 1 ? "" : "s"} flagged`
            : "No students flagged yet"}
        </p>
      </header>

      <div className="p-5 md:p-6">
        <NotEnoughDataPanel
          title="No students flagged yet"
          description="We don't have real per-student behaviour signal for this roster yet — flagged students will show up here once it's available."
        />
      </div>
    </section>
  );
}
