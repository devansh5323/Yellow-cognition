"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";

/** Extracted from app/school/settings/page.tsx's "Alert thresholds" tab so
 * it can also be mounted directly on the school dashboard (via
 * AlertsThresholdsDialog, opened by SchoolDashboardTour's "set-thresholds"
 * step) without navigating away from the dashboard first. `onSaved` is
 * only used by that dialog wrapper — the settings page's own tab usage
 * passes nothing and just leaves the tab open after saving. */
export function AlertsCard({ onSaved }: { onSaved?: () => void } = {}) {
  const [pfi, setPfi] = useState([60]);
  const [inactivity, setInactivity] = useState([7]);
  const [classCheckIn, setClassCheckIn] = useState([2]);

  const save = () => {
    markSchoolTaskDone("set-thresholds");
    toast.success("Alert thresholds saved");
    onSaved?.();
  };

  return (
    <section className="premium-surface rounded-[18px] p-5 space-y-4">
      <div>
        <div className="premium-eyebrow">
          <Bell className="h-3 w-3" />
          <span>Alert thresholds</span>
        </div>
        <h2 className="mt-1.5 font-heading font-extrabold text-[16px] leading-tight">Alert thresholds</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          When Yellow should surface a student, class, or teacher
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-3.5">
        <ThresholdTile
          label="Flag students when PFI is below"
          value={pfi[0]}
          onChange={(v) => setPfi([v])}
          min={0}
          max={100}
          suffix=""
        />
        <ThresholdTile
          label="Mark students inactive after"
          value={inactivity[0]}
          onChange={(v) => setInactivity([v])}
          min={1}
          max={21}
          suffix=" days"
        />
        <ThresholdTile
          label="Nudge teachers if no check-in for"
          value={classCheckIn[0]}
          onChange={(v) => setClassCheckIn([v])}
          min={1}
          max={14}
          suffix=" days"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save thresholds
        </Button>
      </div>
    </section>
  );
}

function ThresholdTile({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl p-4 border border-border/60 bg-card/40">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[12.5px] font-semibold leading-snug">{label}</Label>
        <span className="font-heading font-extrabold text-primary tabular-nums text-[15px]">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={1}
        className="mt-3"
      />
    </div>
  );
}
